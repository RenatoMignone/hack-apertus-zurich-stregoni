# Example TrustRoom

A minimal TrustRoom solution to copy from. It shows the three things every team needs:

1. **Embedding:** the e-banking loads this app in an iframe and tells it where the customer is
   (`postMessage`, see [`docs/trustroom-panel-context.md`](../docs/trustroom-panel-context.md)).
2. **Apertus:** questions go to an OpenAI-compatible chat endpoint.
3. **Tools:** the model can call tools, both from the [example MCP server](../example-mcp/server.py) and
   ones defined right in this app (`get_accounts`, which reads the banking API).

```
browser (index.html, iframe in the e-banking)
    │  POST /api/chat {messages, context}
    ▼
app.py ──► Apertus       (/chat/completions with tools)
    ├────► MCP server    (example-mcp: get_bank_holidays)
    └────► banking API   (get_accounts)
```

| File | What it does |
|---|---|
| `index.html` | Chat UI and the postMessage handshake. Plain HTML and JS. |
| `app.py` | `POST /api/chat`: calls the model, runs the tools it asks for, returns the answer. Keeps the API key off the browser. |

## Configure the model

Apertus runs on CSCS and is reached through the Keera gateway (`https://gateway.keera.ch/api/v1`), which is
OpenAI-compatible.

```bash
cp example-trustroom/.env.example example-trustroom/.env   # then set LLM_API_KEY
```

`.env.example` sets `apertus-v1-5-8b` with `LLM_TOOL_CALLS=true` (the app itself has no default model): the model
calls the tools itself (`get_accounts` and the MCP tool `get_bank_holidays`). The `-thinking` models are served **without tool calls**. Using one with
`LLM_TOOL_CALLS=true` fails with `"auto" tool choice requires --enable-auto-tool-choice …`. For them, set
`LLM_TOOL_CALLS=false`: the model then answers without any tools (no banking API, no MCP server), only from the
conversation and the context (customer, page, demo “today”). Without a key, the app still starts, but every question fails with "LLM call failed" (an authentication error from the gateway).

## Start

With Docker, from the `starter/` folder:

```bash
TRUSTROOM_URL=http://localhost:3000 docker compose up --build banking-api banking-frontend mcp-server example-trustroom
```

Open the e-banking on http://localhost:8090 and click the TrustRoom icon in the header.

Locally, with the banking API and the MCP server already running (e.g. `docker compose up banking-api mcp-server`):

```bash
cd example-trustroom
uv venv .venv && uv pip install -p .venv -r requirements.txt
set -a && . ./.env && set +a && .venv/bin/uvicorn app:app --port 3000 --reload
```

Then start the e-banking with `TRUSTROOM_URL=http://localhost:3000 docker compose up banking-frontend`, or, if you run
the frontend with `npm run dev`, check `trustroomUrl` in `banking-frontend/public/config.js` (it already points to
http://localhost:3000).

## Try it

- “How much money do I have?” → answered from the accounts (with tool calls: the model calls `get_accounts`).
- “My rent is due on 25 December. When will it be paid?” → answered from the MCP tool `get_bank_holidays` (with tool
  calls, the model calls it itself): 25 and 26 December are bank holidays, so the payment is executed on the next
  business day.
- Open “Protocol debugging” to see the context and every message between the e-banking and the app.

## Make it yours

- **New tool:** add a typed function with a docstring to `example-mcp/server.py` (decorated with `@mcp.tool`). This
  app picks it up on the next question, no change needed here (with `LLM_TOOL_CALLS=true`; in Docker, rebuild the MCP
  server first with `docker compose up --build mcp-server`).
- **Act in the e-banking:** send `navigate` with a deep link, e.g. to the bookings behind an answer:
  `send("navigate", { path: "/movements?ids=BK-00101,BK-00102" })`.
- **Call the banking API as the customer:** every call needs the logged-in customer's token,
  `Authorization: Bearer <context.access_token>`. The browser sends the context with each question, and `app.py`
  hands the token to its tools (see `get_accounts`).
- **Add a dashboard widget:** `POST {api}/dashboards/{context.dashboard_id}/widgets`, then send `widgets-changed`
  so the open dashboard reloads. Formats, fields and live data: [`docs/custom-widgets.md`](../docs/custom-widgets.md).
- In Docker, call the API and the MCP server by their service names (`BANKING_API_URL`, `MCP_URL` in
  `docker-compose.yml`). The context's `api_base_url` is `localhost`, which only works from the browser.
