# Example MCP server

A minimal [MCP](https://modelcontextprotocol.io) server with a single tool, built with
[FastMCP](https://gofastmcp.com). It shows how and where to build your own tools for the TrustRoom. It is independent
of the banking API: copy it, extend it, or replace it.

An MCP server describes its tools (name, description, input schema) to any MCP client. Your TrustRoom backend lists
the tools, hands them to Apertus as function definitions, and runs the ones the model asks for.
[`example-trustroom/app.py`](../example-trustroom/app.py) does exactly that.

## Start

```bash
docker compose up --build mcp-server        # from the starter/ folder → http://localhost:8001/mcp
```

Locally:

```bash
cd example-mcp
uv venv .venv && uv pip install -p .venv -r requirements.txt
.venv/bin/python server.py                   # http://localhost:8001/mcp, port via PORT
```

The server speaks MCP over **streamable HTTP** at `/mcp`. It is not a REST API: open it with an MCP client, not
with a browser or `curl`.

## The tool

| Tool | Arguments | Returns |
|---|---|---|
| `get_bank_holidays` | `year` (e.g. `2026`) | `[{date, weekday, name}]`: the Swiss bank holidays (SIX SIC calendar), sorted by date |

Banks don't execute payments on these days or on weekends, so the tool helps answer questions like "when will my
payment on 25 December be executed?". It needs no banking data and no customer token. The example TrustRoom offers it
to the model when tool calls are on (`LLM_TOOL_CALLS=true`); without tool calls it isn't used.

## Try it

With the [FastMCP client](https://gofastmcp.com/clients/client) (installed with `fastmcp`):

```python
import asyncio
from fastmcp import Client

async def main():
    async with Client("http://localhost:8001/mcp") as mcp:
        print([tool.name for tool in await mcp.list_tools()])
        result = await mcp.call_tool("get_bank_holidays", {"year": 2026})
        print(result.data)

asyncio.run(main())
```

## Add your own tool

Write a typed function with a docstring and decorate it with `@mcp.tool`. The function name becomes the tool name,
the **docstring and type hints become the description and input schema** the model sees, so write them for the model:
say what the tool does, what each argument means, and in which format.

```python
@mcp.tool
def monthly_rate(amount_chf: float, months: int, annual_interest_pct: float = 0.0) -> dict:
    """Monthly instalment to repay `amount_chf` over `months` months at `annual_interest_pct` % interest per year."""
    ...
```

Restart the server (or rebuild the container). The example TrustRoom lists the tools on every question, so it picks
up the new tool without changes.

## Tips

- **Let tools compute, let the model explain.** Sums, averages and date ranges are more reliable as tool results than
  as model arithmetic, and they make figures traceable: return the booking IDs a result is based on, so the
  TrustRoom can link to them (`/movements?ids=…`).
- **Keep results small.** A tool that returns 2'000 bookings fills the context window. Filter on the server
  (`GET /bookings` has `from`, `to`, `q`, `account`, `direction`, `amount_min`, `amount_max`, `ids`) and aggregate
  in the tool.
- **The customer's token.** Tools that read the banking API need the logged-in customer's token. This example server
  has no access to it. Pass it from your backend (e.g. as an HTTP header of the MCP connection, or as a tool
  argument your backend fills in), and never let the model choose whose data it reads. The example TrustRoom shows
  the simple alternative: tools defined in the backend itself (`get_accounts`), which get the token directly.
- **Give every tool at least one parameter.** Apertus fails to call a tool without parameters: it writes a broken
  call instead. An optional filter (e.g. `account_id`, "omit for all accounts") is enough.
- **Errors:** raise `fastmcp.exceptions.ToolError` with a clear message. The model sees it and can try again.
- **Inside Docker**, other containers reach this server at `http://mcp-server:8001/mcp`.
