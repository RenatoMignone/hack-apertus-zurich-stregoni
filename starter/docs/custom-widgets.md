# Custom widgets

How a TrustRoom solution puts its own widgets on the customer's dashboard: the API calls, the two widget formats,
every field the e-banking understands, and how the data in a widget stays current. The schemas live in
[`banking-api-contract/openapi.yaml`](../banking-api-contract/openapi.yaml) (`WidgetCreate`, `CustomWidget`,
`DeclarativeSpec`); this page explains them with examples.

## 1. The idea

Your solution creates a widget, for example a chart of the monthly spending, and it appears on the dashboard next to
the e-banking's own widgets. The customer can move it, remove it, or add it to another dashboard.

Widgets are stored in the **banking API**, not in the e-banking frontend. Anything that can reach the API can create
one: your TrustRoom in the iframe, its backend, a script, or `curl`. For example, with Lukas's token:

```bash
curl -X POST http://localhost:8000/api/dashboards/DASH-01/widgets \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"type": "custom", "title": "Privatkonto balance",
       "custom": {"format": "declarative",
                  "spec": {"type": "kpi", "value": 9716.33, "currency": "CHF"}}}'
```

## 2. API

Every call needs the customer's token, `Authorization: Bearer <token>`: in the TrustRoom it is the context's
`access_token`; scripts get it from `POST /auth/login` (see [`trustroom-panel-context.md`](trustroom-panel-context.md) §4).
Dashboards and widgets belong to one customer: a widget created with Jana's token appears only on Jana's dashboard.

| Call | What it does |
|---|---|
| `GET /dashboards` | All dashboards with their widgets. The default dashboard has `is_default: true` (seed: `DASH-01`). |
| `POST /dashboards/{dashboard_id}/widgets` | Add a widget. Returns `201` with the stored widget, including its new `id` (e.g. `W-0010`). |
| `GET /dashboards/{dashboard_id}/widgets/{widget_id}` | One widget, e.g. `http://localhost:8000/api/dashboards/DASH-01/widgets/W-0010`. |
| `PATCH /dashboards/{dashboard_id}/widgets/{widget_id}` | Change `title`, `position`, `config` or `custom`. Send only the fields you change; `custom` is replaced as a whole. |
| `DELETE /dashboards/{dashboard_id}/widgets/{widget_id}` | Remove a widget. Returns `204`. |
| `GET /widget-catalog` | What the "Add widget" dialog offers. Every custom widget created so far is listed in the `trustroom` tab. |
| `POST /admin/reset` | Restores the seed state of all customers, which removes all custom widgets. No token needed. |

Inside the TrustRoom iframe, take the dashboard ID from the context's `dashboard_id` (set while the customer is on a
dashboard, see [`trustroom-panel-context.md`](trustroom-panel-context.md) §4).

### When the widget becomes visible

A new or changed widget is stored immediately. An open dashboard shows it after it reloads its data:

- From the TrustRoom iframe, send `widgets-changed` right after the API call. The dashboard reloads at once.
  ```js
  parent.postMessage({ protocol: "trustroom", version: 1, type: "widgets-changed",
                       payload: { dashboard_id: "DASH-01" } }, host);
  ```
- From anywhere else (a backend, a script), the widget shows up on the next page load.

### The widget object

```json
{
  "type": "custom",
  "title": "Monthly spending",
  "position": { "col": 0, "row": 2, "width": 2, "height": 1 },
  "custom": { "format": "declarative", "spec": { … }, "source": { … }, "prompt": "…", "refresh": { … }, "created_by": "Team Zurich" }
}
```

| Field | Required | Meaning |
|---|---|---|
| `type` | yes | `custom` for your widgets. The other values are the e-banking's standard widgets (§7). |
| `title` | no | Heading of the tile. Without it the tile is titled "TrustRoom widget". |
| `position` | no | Place on the grid (below). Without it the widget goes into a new row at the bottom, one column wide. |
| `custom` | for `custom` | The content: `format` plus the fields of that format (§3, §4), and the common fields below. |

**`position`:** the dashboard is a grid of **3 columns**.

| Field | Values | Default |
|---|---|---|
| `col` | `0`, `1`, `2` | required when `position` is given |
| `row` | `0`, `1`, … | required when `position` is given |
| `width` | `1`–`3` columns, and `col + width` must be at most 3 | `1` |
| `height` | `1`, `2`, … rows | `1` |

**Common fields of `custom`**, for both formats:

| Field | Meaning |
|---|---|
| `source` | Traceability: which bookings the widget is based on (§5). |
| `prompt` | The customer's request that produced the widget. Shown as the description in the widget catalog. |
| `refresh` | How the content is updated (§6). Default: never (`static`). |
| `created_by` | Free label, e.g. your team name. |

**Validation:** the API checks every field against the schema and answers `422` with the path of the problem:

```json
{ "code": "validation_error", "message": "Invalid input",
  "details": [{ "field": "body.custom.declarative.spec.kpi.value.int", "message": "Input should be a valid integer" },
              { "field": "body.custom.declarative.spec.kpi.value.float", "message": "Input should be a valid number" }] }
```

Numbers must be JSON numbers (`12.5`, not `"12.5"`). Fields the schema doesn't know are **dropped without an
error**, so a typo such as `"currancy"` simply has no effect. If a stored spec can't be drawn anyway, the tile shows an
error message instead of breaking the dashboard.

## 3. Format `declarative`: charts and tables in the e-banking's look

You describe *what* to show; the e-banking draws it with its own components, so it looks like the rest of the
dashboard. There are five spec types: `kpi`, `table`, `bar`, `line` and `donut`.

```json
"custom": { "format": "declarative", "spec": { "type": "bar", … } }
```

**Fields of every spec:**

| Field | Meaning |
|---|---|
| `type` | `kpi`, `table`, `bar`, `line` or `donut` |
| `currency` | e.g. `"CHF"`. Numbers are then shown as amounts, Swiss style: `CHF 8'034.42`. |
| `subtitle` | Small text above the content |
| `footnote` | Small text below the content, e.g. "Source: bookings Oct 2026" |
| `title` | Not shown as a heading (use the widget's `title` for that). In charts it names the data series in the legend and tooltips. |

### `kpi`: one number

```json
{ "type": "kpi", "value": 812.35, "currency": "CHF", "delta": -120.5, "delta_label": "vs. last month" }
```

| Field | Required | Meaning |
|---|---|---|
| `value` | yes | The number |
| `unit` | no | e.g. `"%"`, shown after the number. Ignored when `currency` is set. |
| `delta` | no | Change against a comparison value, shown with ▲ (positive) or ▼ (negative) |
| `delta_label` | no | e.g. `"vs. last month"` |

### `table`

```json
{
  "type": "table",
  "currency": "CHF",
  "columns": [
    { "key": "due_date", "label": "Due date", "format": "date" },
    { "key": "payee", "label": "Payee" },
    { "key": "amount", "label": "Amount", "format": "currency" }
  ],
  "rows": [
    { "due_date": "2026-11-27", "payee": "Wohnbau Sihlfeld AG", "amount": 2800.0, "_booking_ids": ["BK-00101"] },
    { "due_date": "2026-11-30", "payee": "Swisscom (Schweiz) AG", "amount": 94.0 }
  ],
  "footer": { "payee": "Total", "amount": 2894.0 }
}
```

| Field | Required | Meaning |
|---|---|---|
| `columns` | yes | List of `{ key, label, format?, align? }`, in display order. Must not be empty: the API accepts an empty list, but the tile then shows an error. |
| `rows` | yes | List of objects; each column shows the row's value under its `key` |
| `footer` | no | Totals row, keyed like the rows |
| `rows[]._booking_ids` | no | Adds a "Show" link in that row, opening the movements with these IDs |

**Column `format`:**

| `format` | Shows | Example |
|---|---|---|
| `text` (default) | The value as it is | `Migros` |
| `number` | Swiss number formatting; whole numbers without decimals, others with two | `1'234.50`, `42` |
| `currency` | Amount in the spec's `currency` | `CHF 2'800.00` |
| `percent` | Number with `%` (`12.5` means 12.5%) | `12.50%` |
| `date` | Date from `YYYY-MM-DD` | `27/11/2026` |

**Column `align`:** `left`, `right` or `center`. Default: `number`, `currency` and `percent` columns are right-aligned,
the others left-aligned.

### `bar`, `line`, `donut`: charts

```json
{
  "type": "bar",
  "currency": "CHF",
  "x_label": "Month",
  "data": [
    { "label": "2026-09", "value": 17179.58, "booking_ids": ["BK-00601", "BK-00667"] },
    { "label": "2026-10", "value": 9752.52 }
  ]
}
```

| Field | Required | Meaning |
|---|---|---|
| `data` | yes | List of points `{ label, value, series?, booking_ids? }`. Must not be empty: the API accepts an empty list, but the tile then shows an error. |
| `data[].label` | yes | x-axis label (bar, line) or slice name (donut) |
| `data[].value` | yes | The number |
| `data[].series` | no | Name of the series the point belongs to, for several bars or lines per label (bar and line only) |
| `data[].booking_ids` | no | Makes the bar, point or slice clickable: it opens the movements with these IDs |
| `x_label`, `y_label` | no | Axis titles (bar and line) |
| `stacked` | no | `true` stacks the series of a bar chart instead of placing them side by side |

**Several series:** give each point a `series`. Points with the same `label` share a position on the x-axis; labels
appear in the order they first occur.

```json
"data": [
  { "label": "Sep", "series": "2025", "value": 820.1 },
  { "label": "Sep", "series": "2026", "value": 905.6 },
  { "label": "Oct", "series": "2025", "value": 640.0 },
  { "label": "Oct", "series": "2026", "value": 701.3 }
]
```

A `donut` uses only `label` and `value` (plus `booking_ids`); one point is one slice.

## 4. Format `html`: anything you can build

Free HTML, CSS and JavaScript, for everything the declarative types can't show: your own charts, interactive
elements, a different layout.

```json
"custom": { "format": "html", "html": "<div style=\"font:14px sans-serif\">Rent paid in Aug, Sep, Oct ✔</div>", "height": 160 }
```

| Field | Required | Meaning |
|---|---|---|
| `html` | yes | A complete HTML document or just a fragment, up to 500'000 characters |
| `height` | no | Height of the widget in pixels, 80–1200, default 300. The content doesn't resize the tile; it scrolls if it is taller. |

**What the HTML can and can't do.** The e-banking shows it in an iframe with `sandbox="allow-scripts"`:

| Can | Can't |
|---|---|
| Run JavaScript | Read or change the e-banking page, its cookies or its session |
| Call the banking API with `fetch` (it allows every origin) | Navigate the e-banking (links can't open in the main window) |
| Call your own services, if they send CORS headers | Use `localStorage`, cookies, pop-ups or forms |

- **Bundle everything.** The demo may run without internet, so inline your CSS, scripts and fonts instead of loading
  them from a CDN.
- **The script runs in the customer's browser.** Use the API URL as the browser sees it (`http://localhost:8000/api`,
  the context's `api_base_url`), not a Docker service name.
- **Style it yourself.** Nothing from the e-banking's CSS reaches the iframe. The e-banking's colours are petrol
  `#2E6B66`, navy `#0B1E2A` and grey `#F0F0F0`.

## 5. Traceability: linking a widget to its bookings

Every number on a dashboard should be traceable to the bookings it comes from. Three ways to link them:

| Where | Field | Result |
|---|---|---|
| Whole widget | `custom.source.booking_ids: ["BK-00101", …]` | "Show underlying transactions" link below the widget, opens `/movements?ids=…` |
| Whole widget | `custom.source.movements_query: "account=ACC-PRIV&from=2026-10-01&to=2026-10-31&q=migros"` | Same link, but with a movements filter instead of IDs |
| Table row | `rows[]._booking_ids` | "Show" link in that row |
| Chart bar, point or slice | `data[].booking_ids` | Clicking it opens those movements |

`source.card_transaction_ids` is stored with the widget for your own reference, but the e-banking doesn't link it
yet. For card purchases, link the card statement's booking instead.

## 6. Where the numbers come from

A widget's numbers come from one of three places. Pick by how current they need to be.

| Data | How | Good for |
|---|---|---|
| **Snapshot** | The values are written into `spec` or `html` when the widget is created (`refresh` omitted or `{"mode": "static"}`) | An answer at one point in time: "my online shopping in October" |
| **Live, from the widget itself** | An `html` widget whose script fetches the banking API every time the dashboard loads | Balances, lists, anything the API already returns |
| **Live, from your service** | `refresh: {"mode": "endpoint", "url": "…"}`: the e-banking fetches fresh content from your URL | Numbers your service computes, e.g. spending by category |

### Live HTML widget

Shows the balance of each account that counts as liquidity (all but pillar 3a) and their total, read from the API on
every load:

```html
<div id="out">Loading…</div>
<script>
  const chf = (n) => n.toLocaleString("de-CH", { minimumFractionDigits: 2 });
  fetch("http://localhost:8000/api/accounts", { headers: { Authorization: "Bearer ACCESS_TOKEN" } })
    .then((r) => r.json())
    .then((data) => {
      const rows = data.items.filter((a) => a.type !== "pillar3a").map((a) => `<tr><td>${a.name}</td><td align="right">${chf(a.current_balance_chf)}</td></tr>`).join("");
      document.getElementById("out").innerHTML =
        `<table width="100%">${rows}<tr><th align="left">Total</th><th align="right">CHF ${chf(data.total_liquidity_chf)}</th></tr></table>`;
    });
</script>
```

The widget can't see the e-banking's login, so the token is written into its HTML: when you create the widget, insert
the context's `access_token` in place of `ACCESS_TOKEN`.

Take totals from the API (here `total_liquidity_chf`) instead of adding up numbers yourself, so the widget always
matches the rest of the e-banking.

### Refresh endpoint

```json
"refresh": { "mode": "endpoint", "url": "http://localhost:3000/widgets/spending", "interval_seconds": 300 }
```

| Field | Meaning |
|---|---|
| `mode` | `static` (default) or `endpoint` |
| `url` | Required for `endpoint`. Your URL, called with `GET` |
| `interval_seconds` | Optional, at least 30: fetch again at this interval. Without it, the widget refreshes when the dashboard loads. |

Your endpoint returns the widget content, i.e. the `custom` object: `format` plus `spec` or `html`. The fresh content
replaces the stored one; fields you leave out (such as `source` or `refresh`) stay as stored. Rules:

- The customer's browser calls the URL, so it must be reachable from the browser (`localhost:3000`, not a Docker
  service name), and your server must send CORS headers, e.g. `Access-Control-Allow-Origin: *`.
- The e-banking sends no token or customer with this call. Put what your endpoint needs into the URL when you create
  the widget, e.g. `…/widgets/spending?customer=CUST-002`.
- Return a `format` of `declarative` or `html`. If the call fails, the widget shows its stored content with the note
  "Live data unavailable, showing the last saved version." So store a sensible first version when you create it.

## 7. Standard widgets

The e-banking's own widgets can be added through the API too, with `type` set to one of these. They take their data
from the API themselves.

| `type` | Shows | `config` |
|---|---|---|
| `total_assets` | Total assets with a breakdown | |
| `account_balances` | Current balance of each account | |
| `recent_movements` | The latest account movements | `{ "limit": 5 }`: number of movements |
| `pending_payments` | Payments waiting for execution | |
| `new_payment` | Payment form | |
| `account_transfer` | Transfer between own accounts | |
| `portfolio` | Value and allocation of the investments | |
| `personal_contact` | The advisor's contact details | |
| `loans` | Mortgage tranches with rate, maturity and balance | |

```json
{ "type": "recent_movements", "title": "Last 10 movements", "config": { "limit": 10 } }
```

## 8. Checklist

- `type: "custom"`, a `title`, and `custom.format` of `declarative` or `html`.
- Amounts as JSON numbers, with `currency` set so they are formatted as money.
- Totals taken from the API, or computed from exactly the rows you show.
- `source` or per-row/per-point `booking_ids`, so the customer can check the numbers.
- `prompt` set, so the widget catalog says what the widget is.
- After creating or changing a widget from the iframe, send `widgets-changed`.
