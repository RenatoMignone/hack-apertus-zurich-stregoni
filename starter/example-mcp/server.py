"""Example MCP server for the TrustRoom teams.

It has a single tool to show how an MCP tool is built. Add your own tools the same way:
a typed function with a docstring, decorated with @mcp.tool. The docstring and type hints
become the tool description and input schema the AI sees.
"""

import os
from datetime import date, timedelta

from fastmcp import FastMCP
from fastmcp.exceptions import ToolError

mcp = FastMCP("Example MCP Server")


def easter_sunday(year: int) -> date:
    """Easter Sunday in the Gregorian calendar (anonymous Gregorian algorithm)."""
    a, b, c = year % 19, year // 100, year % 100
    d, e = divmod(b, 4)
    f = (b + 8) // 25
    g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30
    i, k = divmod(c, 4)
    l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451
    month, day = divmod(h + l - 7 * m + 114, 31)
    return date(year, month, day + 1)


@mcp.tool
def get_bank_holidays(year: int) -> list[dict]:
    """Swiss bank holidays (SIX SIC clearing calendar) for a year (e.g. 2026), as [{date: 'YYYY-MM-DD', weekday, name}].

    Banks don't execute payments on these days or on weekends; a payment due then is executed
    on the next business day.
    """
    if not 1900 <= year <= 2100:
        raise ToolError(f"Year out of range: {year}")
    easter = easter_sunday(year)
    holidays = [
        (date(year, 1, 1), "New Year's Day"),
        (date(year, 1, 2), "Berchtold's Day"),
        (easter - timedelta(days=2), "Good Friday"),
        (easter + timedelta(days=1), "Easter Monday"),
        (date(year, 5, 1), "Labour Day"),
        (easter + timedelta(days=39), "Ascension Day"),
        (easter + timedelta(days=50), "Whit Monday"),
        (date(year, 8, 1), "Swiss National Day"),
        (date(year, 12, 25), "Christmas Day"),
        (date(year, 12, 26), "St Stephen's Day"),
    ]
    return [{"date": day.isoformat(), "weekday": day.strftime("%A"), "name": name} for day, name in sorted(holidays)]


if __name__ == "__main__":
    mcp.run(
        transport="http",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8001")),
    )
