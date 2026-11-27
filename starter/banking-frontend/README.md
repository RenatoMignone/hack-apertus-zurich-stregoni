# Mock e-banking frontend

The mock ti&m e-banking (React + TypeScript) that hosts your TrustRoom. It reads **only** through the banking API
([`banking-api-contract/`](../banking-api-contract/README.md)), so the e-banking pages and your TrustRoom always see
the same numbers: that is what makes your figures checkable.

> **You don't need to change this app.** The e-banking is the fixed host for your TrustRoom: plug in through the
> integration points (TrustRoom panel and page, custom widgets, deep links) instead of editing it. A real TrustRoom
> couldn't change the bank's e-banking either. The source is here so you can read how it works.

## Run

From the `starter/` folder (the API comes as a prebuilt image):

```bash
docker compose up --build                               # e-banking on http://localhost:8090
TRUSTROOM_URL=http://localhost:3000 docker compose up   # with your TrustRoom in the panel and on /trustroom
```

Log in as `lukas` / `lukas2026`, `jana` / `jana2026`, `daniela` / `daniela2026` or `marco` / `marco2026`. Each
customer sees only their own data. "Reset demo data" in the footer restores the original state of all customers.

## What the e-banking offers your TrustRoom

| Integration point | What it does | Details |
|---|---|---|
| **TrustRoom panel** | The header icon opens your app in an iframe in a side panel, over any page | [`docs/trustroom-panel-context.md`](../docs/trustroom-panel-context.md) §1 |
| **`/trustroom` page** | The same app full-screen | same |
| **Context** | Your app learns the customer, the current page, the selection (account, card, dashboard, filters), the demo "today" and the customer's access token | same, §2–§4 |
| **Deep links** | Your app can open a page, e.g. the bookings behind an answer (`/movements?ids=…`) or a prefilled payment the customer confirms | same, §5 |
| **Dashboard widgets** | Widgets your app creates through the API appear on the dashboard, in the e-banking's look or as free HTML | [`docs/custom-widgets.md`](../docs/custom-widgets.md) |

The customer logs in on the e-banking, not in your app. Your app gets the token as `access_token` in its context
and sends it as `Authorization: Bearer …` to the API. When the customer logs out, the TrustRoom is closed.

## Configuration

| Docker variable | Default | Meaning |
|---|---|---|
| `TRUSTROOM_URL` | empty | URL of your TrustRoom. Must be reachable from your **browser**. Empty shows a placeholder ("Your TrustRoom will live here"). |
| `API_URL` | `http://localhost:8000/api` | Banking API, as the browser reaches it. Also passed to your TrustRoom in the context. |

Both are read at container start, so no rebuild is needed: restart with a different `TRUSTROOM_URL` to plug in
another solution.

## Good to know

- **"Today" is 27 November 2026**, the demo date from `GET /system/info`. The e-banking uses it everywhere; your
  TrustRoom should too, not the computer's clock.
- **The UI computes nothing itself:** balances, totals and FX conversions come straight from the API, so you can
  compare your TrustRoom's figures with the e-banking pages.
- **Two fields stay empty:** the API doesn't return `last_login_at` (`GET /customer`) and `performance_pct`
  (portfolio positions), although the contract defines them. Don't rely on them.
- **Everything is bundled**, no external fonts or CDNs, so the e-banking runs offline. Keep your TrustRoom the
  same way.

## Where to look in the source

If you want to see how the e-banking talks to your app:

| Folder | What's there |
|---|---|
| `src/trustroom/` | The panel, the `/trustroom` page, the iframe and the `postMessage` protocol |
| `src/widgets/custom/` | How `custom` widgets are rendered: declarative specs and sandboxed HTML |
| `src/routes.ts` | All page IDs and paths, i.e. the deep links your app can open |

## Run without Docker (optional)

Only if you want hot reload while reading the code. It needs the API (`docker compose up banking-api`) and port 8090,
so stop the Docker frontend first:

```bash
cd banking-frontend
npm ci
npm run dev        # http://localhost:8090
```

Without Docker, the TrustRoom URL is `trustroomUrl` in `public/config.js` (default `http://localhost:3000`).
