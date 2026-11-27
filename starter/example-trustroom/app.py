"""Example TrustRoom backend: a chat endpoint that lets Apertus answer with tools.

    browser (index.html, iframe in the e-banking)
        │  POST /api/chat {messages, context}
        ▼
    this app ──► Apertus  (OpenAI-compatible /chat/completions)
        │        ▲   the model may ask for tools; we run them and send the results back
        ├────────┘
        ├──► MCP server   (example-mcp: get_bank_holidays, plus whatever you add there)
        └──► banking API  (get_accounts below, a tool defined right here)

The API key stays on this server; the browser never sees it. Everything is configured via
environment variables (see .env.example).
"""

import json
import os
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastmcp import Client
from openai import AsyncOpenAI, OpenAIError
from pydantic import BaseModel

LLM_BASE_URL = os.getenv("LLM_BASE_URL", "")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
LLM_NAME = os.getenv("LLM_NAME", "")
# Set to false for models served without tool calls (e.g. Apertus "-thinking"): the model then
# answers without any tools (no banking API, no MCP), only from the conversation and the context.
LLM_TOOL_CALLS = os.getenv("LLM_TOOL_CALLS", "true").lower() != "false"
MCP_URL = os.getenv("MCP_URL", "http://localhost:8001/mcp")
# The API as seen from this server. In Docker that is http://banking-api:8000/api, not the
# context's api_base_url (localhost:8000), which only works from the browser.
BANKING_API_URL = os.getenv("BANKING_API_URL", "http://localhost:8000/api")
MAX_TOOL_ROUNDS = 5

app = FastAPI(title="Example TrustRoom")
llm = AsyncOpenAI(base_url=LLM_BASE_URL or None, api_key=LLM_API_KEY or "none")


class ChatRequest(BaseModel):
    messages: list[dict]  # the conversation so far: [{"role": "user" | "assistant", "content": "..."}]
    context: dict  # the TrustRoom context the e-banking sent (docs/trustroom-panel-context.md §4)


# --- Tools defined in this app -------------------------------------------------------------
# Each gets the customer's token from the context, so it sees the logged-in customer's data.

async def get_accounts(token: str, account_id: str = "") -> list[dict]:
    """List the customer's accounts with their current balance."""
    async with httpx.AsyncClient() as http:
        response = await http.get(f"{BANKING_API_URL}/accounts", headers={"Authorization": f"Bearer {token}"})
        response.raise_for_status()
    keys = ("account_id", "name", "type", "currency", "current_balance", "current_balance_chf")
    return [{k: a[k] for k in keys} for a in response.json()["items"] if account_id in ("", a["account_id"])]


# Name → (function, JSON schema of its arguments; the token is added by run_tool). Give every tool
# at least one parameter: Apertus fails to call tools without parameters.
LOCAL_TOOLS = {
    "get_accounts": (get_accounts, {
        "type": "object",
        "properties": {"account_id": {"type": "string", "description": "Only this account, e.g. ACC-PRIV. Omit for all accounts."}},
    }),
}


def tool_spec(name: str, description: str, parameters: dict) -> dict:
    """A tool in the OpenAI function-calling format."""
    return {"type": "function", "function": {"name": name, "description": description, "parameters": parameters}}


# --- Chat ----------------------------------------------------------------------------------

def system_prompt(context: dict) -> str:
    account = (context.get("account") or {}).get("account_id")
    customer = context.get("customer") or {}
    return (
        "You are the TrustRoom, the banking assistant in the customer's e-banking.\n"
        f"The customer is {customer.get('first_name')} {customer.get('last_name')} ({customer.get('customer_id')}).\n"
        f"Today is {context.get('today')}. The customer is on page '{context['page']['id']}'"
        + (f", looking at account {account}" if account else "") + ".\n"
        + ("Look up the customer's data with the tools instead of asking the customer for it. "
           "Only state amounts you got from a tool or the data above. " if LLM_TOOL_CALLS else
           "You have no access to the customer's data beyond the above, so never invent amounts. ")
        + "Answer briefly, in the language of the customer's last message."
    )


@app.post("/api/chat")
async def chat(request: ChatRequest) -> dict:
    if not (LLM_BASE_URL and LLM_NAME):
        raise HTTPException(503, "LLM_BASE_URL and LLM_NAME are not set, see example-trustroom/README.md")
    messages = [{"role": "system", "content": system_prompt(request.context)}, *request.messages]
    if not LLM_TOOL_CALLS:
        # The model can't call tools, so it answers from the conversation and the context alone.
        return {"reply": (await complete(messages)).content}

    token = request.context.get("access_token")
    async with Client(MCP_URL) as mcp:
        tools = [tool_spec(name, fn.__doc__, parameters) for name, (fn, parameters) in LOCAL_TOOLS.items()]
        tools += [tool_spec(t.name, t.description or "", t.input_schema) for t in await mcp.list_tools()]

        for _ in range(MAX_TOOL_ROUNDS):
            message = await complete(messages, tools)
            if not message.tool_calls:
                return {"reply": message.content}

            # The model asked for tools: run each one and hand the results back.
            messages.append(replayable(message, tools))
            for call in message.tool_calls:
                arguments = json.loads(call.function.arguments or "{}")
                result = await run_tool(mcp, call.function.name, arguments, token)
                messages.append({"role": "tool", "tool_call_id": call.id, "content": result})

    return {"reply": "Sorry, I needed too many steps for that question."}


def replayable(message, tools: list[dict]) -> dict:
    """The model's tool-call message, in a form Apertus accepts when it is sent back.

    Apertus rejects a conversation containing a tool call with empty arguments ("{}") with
    "400 Invalid tool call", although it produces such calls itself (e.g. get_accounts without an
    account_id). So empty arguments are replaced with the tool's first parameter set to null. This
    only changes the history sent to the model; the tool itself still runs with the real arguments.
    """
    first_param = {t["function"]["name"]: next(iter(t["function"]["parameters"].get("properties") or {}), None) for t in tools}
    dumped = message.model_dump(exclude_none=True)
    for call in dumped.get("tool_calls", []):
        function = call["function"]
        param = first_param.get(function["name"])
        if param and not json.loads(function.get("arguments") or "{}"):
            function["arguments"] = json.dumps({param: None})
    return dumped


async def complete(messages: list[dict], tools: list[dict] | None = None):
    """One call to the model; returns its message."""
    try:
        response = await llm.chat.completions.create(model=LLM_NAME, messages=messages, **({"tools": tools} if tools else {}))
    except OpenAIError as error:
        hint = " (the model has no tool calls, set LLM_TOOL_CALLS=false)" if "tool choice" in str(error) else ""
        raise HTTPException(502, f"LLM call failed: {error}{hint}") from error
    return response.choices[0].message


async def run_tool(mcp: Client, name: str, arguments: dict, token: str | None) -> str:
    """Run a local or MCP tool. Errors go back to the model as text, so it can react to them."""
    print(f"Tool call: {name}({arguments})", flush=True)
    try:
        if name in LOCAL_TOOLS:
            return json.dumps(await LOCAL_TOOLS[name][0](token, **arguments), ensure_ascii=False)
        result = await mcp.call_tool(name, arguments)
        return json.dumps(result.data, ensure_ascii=False) if result.data is not None else str(result.content)
    except Exception as error:
        return f"Tool {name} failed: {error}"


@app.get("/")
def index() -> FileResponse:
    return FileResponse(Path(__file__).parent / "index.html")
