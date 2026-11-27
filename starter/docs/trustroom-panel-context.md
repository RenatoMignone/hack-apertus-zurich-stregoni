# TrustRoom embedding & panel context

How a team's TrustRoom solution is embedded in the mock e-banking, and how it learns where the customer currently is. This is the browser-side counterpart to the REST contract in [`banking-api-contract/openapi.yaml`](../banking-api-contract/openapi.yaml).

Protocol version: **1**

## 1. Embedding

The e-banking has two places where the TrustRoom appears:

| Mode | Where | Opened by |
|---|---|---|
| `panel` | Side panel on the right, over any page | TrustRoom icon in the header |
| `fullpage` | Route `/trustroom` | TrustRoom entry in the sidebar |

Both load the URL configured in **`TRUSTROOM_URL`** (Docker) or `trustroomUrl` in `banking-frontend/public/config.js` (local `npm run dev`, default `http://localhost:3000`) into an iframe. If it is empty, the e-banking shows its built-in placeholder ("Your TrustRoom will live here") with input field, microphone icon and upload button, none of which do anything. As soon as a URL is configured, the iframe fills the whole panel body, and the team's solution owns the entire UI including input, voice and upload.

The iframe is created like this:

```html
<iframe
  src="{TRUSTROOM_URL}?mode=panel&page=account-detail&account=ACC-PRIV&api=http%3A%2F%2Flocalhost%3A8000%2Fapi&today=2026-11-27&v=1"
  allow="microphone; clipboard-read; clipboard-write"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads">
</iframe>
```

- `allow="microphone"` enables voice input.
- `allow-same-origin` refers to the team's own origin, so the solution can use its own storage and APIs. Because `TRUSTROOM_URL` normally has a different origin than the e-banking, the solution has no access to the e-banking's DOM, cookies or session.

### Initial query parameters

The initial context is passed as query parameters, so a solution can render something useful before any message arrives:

| Param | Example | Meaning |
|---|---|---|
| `mode` | `panel` | `panel` or `fullpage` |
| `page` | `account-detail` | Page ID (see §5) |
| `account` | `ACC-PRIV` | Selected account ID, if any |
| `api` | `http://localhost:8000/api` | Base URL of the banking API |
| `today` | `2026-11-27` | Demo "today" (same as `GET /system/info`) |
| `v` | `1` | Protocol version |

All later changes are delivered via `postMessage`.

## 2. Message format

All messages in both directions use the same envelope:

```json
{
  "protocol": "trustroom",
  "version": 1,
  "type": "context",
  "payload": { }
}
```

Messages whose `protocol` is not `"trustroom"` are ignored by both sides.

## 3. Messages

### Host → TrustRoom (e-banking to solution)

| `type` | When | Payload |
|---|---|---|
| `context` | After `ready`, whenever any context field changes (route, selected account/dashboard/card, movements filters, customer loaded), and in reply to `request-context` | `Context` (§4) |
| `visibility` | Panel mode only: once after `ready`, then whenever the panel is opened or closed (the iframe stays loaded while closed) | `{ "visible": true }` |
| `dashboard-changed` | The customer changed dashboards in the e-banking: created, renamed, deleted or set a default dashboard, or saved edit mode (widgets added, moved or removed). Not sent for your own `widgets-changed`. | `{ "dashboard_id": "DASH-01" }` |

### TrustRoom → Host (solution to e-banking)

| `type` | Purpose | Payload |
|---|---|---|
| `ready` | Handshake: the solution is loaded and listening. The host replies with `context` (to the first `ready` only; after a reload inside the iframe, send `request-context`). | `{}` |
| `request-context` | Ask for the current context again | `{}` |
| `navigate` | Open an e-banking page, e.g. a deep link to the bookings a result is based on, or a prefilled payment | `{ "path": "/movements?ids=BK-00101,BK-00102" }` |
| `widgets-changed` | The solution created/changed widgets via the API; the host reloads the dashboards (`dashboard_id` is informational) | `{ "dashboard_id": "DASH-01" }` |
| `close` | Ask the host to close the panel (ignored in `fullpage` mode) | `{}` |

`navigate` only accepts **relative paths of e-banking routes** (§5). Anything else (absolute URLs, `javascript:` and so on) is ignored. Navigation happens in the e-banking window. In panel mode the panel stays open; in fullpage mode the customer leaves `/trustroom`, which unloads your solution (it is loaded again when they come back).

### Adding dashboard widgets

Widgets are stored in the banking API, so your solution creates them with `POST /dashboards/{dashboard_id}/widgets` (the `dashboard_id` is in the context, §4). Then send `widgets-changed`, and the open dashboard reloads. Formats, fields and live data are explained in [`custom-widgets.md`](custom-widgets.md).

## 4. Context payload

```json
{
  "mode": "panel",
  "page": {
    "id": "account-detail",
    "path": "/accounts/ACC-PRIV",
    "title": "Privatkonto",
    "params": { "accountId": "ACC-PRIV" },
    "query": {}
  },
  "account": {
    "account_id": "ACC-PRIV",
    "iban": "CH06 0888 8000 0044 1002 0",
    "name": "Privatkonto"
  },
  "dashboard_id": null,
  "card_id": null,
  "movements_filter": null,
  "customer": { "customer_id": "CUST-001", "first_name": "Lukas", "last_name": "Meier" },
  "today": "2026-11-27",
  "api_base_url": "http://localhost:8000/api",
  "access_token": "f3a9…"
}
```

| Field | Type | Notes |
|---|---|---|
| `mode` | `"panel" \| "fullpage"` | |
| `page.id` | string | Stable page ID from §5. Prefer this over `path` for logic. |
| `page.path` | string | Current e-banking path including query string |
| `page.title` | string | Visible page title |
| `page.params` / `page.query` | object | Route parameters / parsed query parameters |
| `account` | object \| null | Currently selected account (account detail page, or account filter on movements) |
| `dashboard_id` | string \| null | Active dashboard on the dashboard page. Use it for `POST /dashboards/{id}/widgets`. |
| `card_id` | string \| null | Selected card on the cards page |
| `movements_filter` | object \| null | Active filters on the movements page, with a subset of the `GET /bookings` query keys (`account`, `from`, `to`, `q`, `amount_min`, `amount_max`, `direction`, `ids`, `card`) |
| `customer` | object \| null | Minimal identity for greetings; `null` while the e-banking is still loading it. Fetch everything else via `GET /customer`. |
| `today` | date | Demo reference date |
| `api_base_url` | string | Banking API base URL |
| `access_token` | string | Token of the logged-in customer. Send it as `Authorization: Bearer <access_token>` with every API call, so you see this customer's data. |

The context never contains amounts or other banking data. Fetch those from the API, so the TrustRoom and the UI always see the same numbers.

### Customers and logins

The e-banking has four demo customers, each with their own data. The customer logs in on the e-banking's login page; the API then answers every call for the customer whose token it gets. Your solution doesn't log in itself: it uses the `access_token` from the context. When the customer logs out, the TrustRoom is closed; after the next login it is loaded again with the new customer's context.

| Username | Password | Customer |
|---|---|---|
| `lukas` | `lukas2026` | Lukas Meier (`CUST-001`) |
| `jana` | `jana2026` | Jana Widmer (`CUST-002`) |
| `daniela` | `daniela2026` | Daniela Rüegg (`CUST-003`) |
| `marco` | `marco2026` | Marco Baumann (`CUST-004`) |

For scripts or `curl`, log in through the API. The token is fixed per user, so you can reuse it:

```bash
curl -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username": "jana", "password": "jana2026"}'      # → {"token": "…", "customer_id": "CUST-002", …}
curl -H 'Authorization: Bearer <token>' http://localhost:8000/api/accounts
```

IDs such as `ACC-PRIV` or `BK-00001` exist for every customer and refer to that customer's own records.

## 5. Page IDs and routes

| `page.id` | Path | Deep-link query parameters |
|---|---|---|
| `dashboard` | `/dashboard` or `/dashboard/{dashboardId}` | |
| `account-overview` | `/accounts` | `view=tiles\|list` |
| `account-detail` | `/accounts/{accountId}` | |
| `movements` | `/movements` | `account`, `from`, `to`, `q`, `amount_min`, `amount_max`, `direction`, `ids`, `card` |
| `payment-overview` | `/payments` | `tab=pending\|completed` |
| `new-payment` | `/payments/new` | `iban`, `name`, `amount`, `currency` (CHF, EUR, USD or GBP), `date`, `message`, `account` (debit account) |
| `account-transfer` | `/payments/transfer` | `from`, `to`, `amount`, `date` |
| `standing-orders` | `/standing-orders` | |
| `portfolio` | `/portfolio` | `tab=positions\|allocation\|performance`, `period=ytd\|1y\|3y` (with `tab=performance`) |
| `cards` | `/cards` | `card`, `statement` |
| `loans` | `/loans` | |
| `loan-detail` | `/loans/{loanId}` | |
| `settings` | `/settings` | |
| `trustroom` | `/trustroom` | |

Examples a solution can send with `navigate`:

```text
/movements?account=ACC-PRIV&from=2026-10-01&to=2026-10-31&q=migros
/movements?ids=BK-00101,BK-00102,BK-00103
/payments/new?iban=CH8600235000001267362&name=Ferienwohnungen%20Engadin%20AG&amount=500&currency=CHF&date=2026-12-10&message=Anzahlung
/cards?card=CARD-VISA&statement=STMT-2026-10    (Lukas only: the others have no credit card)
/loans/LOAN-02                                  (Marco only: the others have no loans)
```

Prefilled payments are only proposals: the customer reviews and confirms them in the e-banking.

## 6. Security rules

- The host posts messages only with `targetOrigin` = origin of `TRUSTROOM_URL`, never `"*"`.
- The host accepts messages only if `event.origin` equals the origin of `TRUSTROOM_URL` and `event.source` is the TrustRoom iframe.
- The solution should check that `event.origin` is the e-banking origin, which is `document.referrer`'s origin on the first page load, or configure it explicitly. If your solution navigates between its own pages, `document.referrer` becomes your own URL: store the origin (e.g. in `sessionStorage`) on the first load.

## 7. Minimal solution example

```html
<script>
  const host = new URL(document.referrer || location.href).origin;
  let gotContext = false;
  const send = (type, payload = {}) =>
    parent.postMessage({ protocol: "trustroom", version: 1, type, payload }, host);

  window.addEventListener("message", (e) => {
    if (e.origin !== host || e.data?.protocol !== "trustroom") return;
    if (e.data.type === "context") {
      gotContext = true;
      const ctx = e.data.payload;
      console.log("Customer is on", ctx.page.id, "account", ctx.account?.account_id);
    }
  });

  send("ready");
  // After a reload inside the iframe the host ignores a second "ready": ask explicitly if no context arrives.
  setTimeout(() => { if (!gotContext) send("request-context"); }, 500);

  // Later: link to the bookings behind an answer
  // send("navigate", { path: "/movements?ids=BK-00101,BK-00102,BK-00103" });
</script>
```
