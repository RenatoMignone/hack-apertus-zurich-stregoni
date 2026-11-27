# Banking API: guide and data model

[`openapi.yaml`](openapi.yaml) is the contract of the mock e-banking API: the e-banking frontend and your TrustRoom
both use exactly these endpoints. The API runs as a prebuilt Docker image
(`ghcr.io/tiziano-schacht-ti8m/trustroom-banking-api`), and **the contract is fixed** for the hackathon: build on the
endpoints as they are. Anything the API doesn't offer (a budget, goals, categories, your own aggregates) belongs in your
own backend.

This page is a guided tour: the resources, the data behind them, and what to watch out for. For every field and
parameter, see the spec or the interactive docs.

| | |
|---|---|
| Base URL | `http://localhost:8000/api` (from another container: `http://banking-api:8000/api`) |
| Interactive docs | http://localhost:8000/docs (Swagger UI, try calls in the browser) |
| Raw spec | http://localhost:8000/openapi.json, or this folder's `openapi.yaml` |
| Start | `docker compose up banking-api` from the `starter/` folder (pulls the image on first start) |

Generate a client from the spec if you like (e.g. `openapi-python-client`, `openapi-typescript`), or call it with
plain HTTP. The spec is also a good source for tool descriptions for your model.

## Conventions

- **Login and token.** `POST /auth/login` with `{"username": "lukas", "password": "lukas2026"}` returns a `token`.
  Send it as `Authorization: Bearer <token>` with every other call; it selects the customer. Inside the TrustRoom
  iframe you get the token from the context (`access_token`) instead. Without a token: `401`. Public endpoints:
  `/system/info`, `/auth/login`, `/admin/reset`.
- **"Today"** is the demo date from `GET /system/info` (default `2026-11-27`), never the real clock.
- **Amounts** are JSON numbers with two decimals. Booking amounts are always **CHF**: positive = credit (money in),
  negative = debit (money out).
- **Dates** are ISO `YYYY-MM-DD`.
- **Lists** return `{ items, … }`. The long ones (`/bookings`, `/accounts/{id}/bookings`, `/payments`,
  `/cards/{id}/transactions`) are paginated with `total`, `limit` and `offset`; `limit` defaults to 100, maximum 1000.
- **Errors** use one body format (`Error`, with a `code` such as `not_found`, `validation_error`, `conflict`,
  `unauthorized`): unknown IDs in the path or in the `account`/`loan` filters return `404`; unknown IDs inside a request
  body and invalid bodies or query parameters `422`; changing a completed payment or deleting the last dashboard `409`;
  uploads over 20 MB `413`.
- **Nothing is executed.** Payments and standing orders are captures and proposals only.
- **No categories** anywhere. Categorising is your job.
- **Reset:** `POST /admin/reset` restores the seed state of all customers (payments, standing orders, profile,
  dashboards, widgets, uploaded documents).

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username": "jana", "password": "jana2026"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/customer
```

## Resources

### Customer and overview

| Endpoint | What you get |
|---|---|
| `GET /system/info` | Demo `today`, data period (`data_from`, `data_to`), API version |
| `GET /customer`, `PATCH /customer` | Profile: name, birth date, address, contact, civil status, partner, employer, gross salary, health insurer, advisor, savings goal. Email, mobile and address are editable; everything else is fixed. |
| `GET /asset-overview` | Total assets and total liquidity in CHF, in the groups `accounts`, `pension` (pillar 3a) and `investments` (depot) |

### Accounts and bookings

| Endpoint | What you get |
|---|---|
| `GET /accounts` (`?type=current\|savings\|pillar3a`) | Accounts with IBAN, opening balance, current balance (also as `current_balance_chf`), interest rate, purpose, savings goal |
| `GET /accounts/{accountId}` | One account |
| `GET /accounts/{accountId}/balance-preview` (`?to=`) | Projected balance including upcoming debits |
| `GET /bookings` | Bookings across all accounts, filterable (below), with `sum_credit` and `sum_debit` over **all** matches |
| `GET /accounts/{accountId}/bookings` | The same, for one account |
| `GET /bookings/{bookingId}` | One booking |

**Booking filters** (all optional, combinable): `account`, `from`, `to`, `q` (free text over booking text,
counterparty, IBAN and reference, case-insensitive), `amount_min`/`amount_max` (absolute CHF), `direction`
(`credit`/`debit`), `ids` (comma-separated booking IDs), `card` (e.g. `CARD-DEBIT`), `transaction_type`, `sort`
(`booking_date`, `amount`, prefix `-` for descending), `limit`, `offset`. The e-banking's movements page understands
`account`, `from`, `to`, `q`, `amount_min`, `amount_max`, `direction`, `ids` and `card` as URL parameters, so any result
can link to its bookings: `/movements?ids=BK-00101,BK-00102`.

**Booking fields:** `booking_id`, `account_id`, `account_name`, `booking_date`, `value_date`, `amount` (CHF), `currency` (always
`CHF`), `balance_after`, `booking_text` (German, as on a real statement), `counterparty_name`, `counterparty_iban`,
`transaction_type`, `reference` (message; for credit card bills the `statement_id`), `card_id`, `original_amount` and
`original_currency` (foreign-currency original), and links to `payee_id`, `standing_order_id`, `payment_id`.

**Transaction types:** `salary`, `incoming_transfer`, `standing_order`, `account_transfer`, `ebill`, `qr_bill`,
`domestic`, `international`, `direct_debit`, `debit_card`, `atm`, `twint_p2p`, `twint_merchant`, `card_settlement`,
`securities_buy`, `dividend`, `interest`, `fee`, `loan_interest`, `loan_amortisation`.

### Payments, standing orders, upcoming debits

| Endpoint | What you get |
|---|---|
| `GET /payments` (`?status=pending\|completed`, `account`, `from`, `to`, `q`) | Payment orders: eBill, QR bill, domestic, international, account transfer, direct debit, standing order; executed and pending. `ebill`, `direct_debit` and `standing_order` come from the seed data only and can't be created; `POST` accepts `domestic`, `qr_bill`, `international` and `account_transfer` (with `credit_account_id`). |
| `POST /payments` | Capture a payment. It stays `pending`: a proposal the customer sees in the e-banking. |
| `GET/PATCH/DELETE /payments/{paymentId}` | One payment; only pending payments can be changed or deleted |
| `GET /standing-orders` (`?status=active\|ended`), `POST`, `GET/PATCH/DELETE /standing-orders/{id}` | Standing orders (current state) with frequency, day and next execution date (`null` for ended orders) |
| `GET /upcoming-payments` (`?from`, `to`, `account`) | All upcoming debits, derived from standing orders, pending payments, open credit card statements, loan interest and amortisation, and the planned pillar 3a top-up to the yearly maximum (`source_id` `MANUAL-3A`), with weekends and Zurich bank holidays taken into account. Default window: today to today + 60 days. `account` takes the account ID only (no IBAN). Each item names its `source_id`. |
| `GET /payees` (`?q`, `new_last_90_days`) | Known payees with first and last payment date, number of payments, and a "new in the last 90 days" flag |

Instead of `POST /payments`, your TrustRoom can also open a prefilled payment form for the customer to confirm:
`/payments/new?iban=…&name=…&amount=…&currency=CHF&date=…&message=…`
(see [`docs/trustroom-panel-context.md`](../docs/trustroom-panel-context.md) §5).

### Cards

| Endpoint | What you get |
|---|---|
| `GET /cards`, `GET /cards/{cardId}` | Debit and credit cards |
| `GET /cards/{cardId}/statements` | Monthly credit card statements: period, total, debit date, status (`open`, `closed`, `settled`), number of purchases, and the settlement `booking_id` once debited |
| `GET /cards/{cardId}/transactions` (`?statement`, `ids`, `from`, `to`, `amount_min`, `amount_max`, `q`) | Individual credit card purchases |

**Card transaction fields:** `card_transaction_id` (`CTX-…`), `transaction_date`, `booking_date`, `merchant_text` (raw,
as on the statement), `merchant_name`, `channel` (`pos`, `online`, `fee`), `country`, `original_amount`,
`original_currency`, `fx_rate`, `fx_fee_chf`, `amount_chf` (positive = charge, negative = refund), `statement_id`.

### Loans

| Endpoint | What you get |
|---|---|
| `GET /loans` | Loans at our bank, one item per mortgage tranche, plus `total_balance_chf`, `annual_interest_chf` (at today's rates) and `loan_to_value_pct` |
| `GET /loans/{loanId}` | One tranche |
| `GET /loan-transactions` (`?loan`, `type=interest\|amortisation`, `from`, `to`) | Every interest and amortisation charge with its `booking_id`, newest first, plus `sum_chf` |

**Loan fields:** `loan_id` (`LOAN-…`), `facility_id`/`facility_name` (framework agreement), `property_name`,
`property_address`, `lending_value_chf`, `lender`, `loan_type` (`mortgage`), `product`, `number` (contract number),
`rank`, `original_amount`, `balance`, `balance_date`, `start_date`, `maturity_date`, `rate_type` (`fixed`, `saron`),
`interest_rate` (percent p.a.), `reference_rate`, `margin`, `rate_floor` (SARON only), `annual_interest_chf`,
`interest_frequency`, `next_interest_date`, `amortisation_type` (`none`, `direct`, `indirect`), `amortisation_amount`,
`amortisation_frequency`, `debit_account_id`, `collateral`, `status`, `remarks`.

**Loan transaction fields:** `loan_tx_id` (`LTX-…`), `loan_id`, `value_date`, `type` (`interest`, `amortisation`),
`period_from`/`period_to` (interest period), `base_balance`, `interest_rate`, `amount` (positive, in CHF),
`balance_after`, `debit_account_id`, `booking_id`. Each charge is also a booking on the debit account
(`transaction_type` `loan_interest` or `loan_amortisation`): count one or the other, not both.

The e-banking shows loans at `/loans` and one tranche at `/loans/{loanId}`.

### Portfolio and FX

| Endpoint | What you get |
|---|---|
| `GET /portfolio` | Depot header, total value, asset allocation |
| `GET /portfolio/positions` | Positions: ETFs with ISIN, asset class, quantity, price, value in CHF, weight |
| `GET /portfolio/performance` (`?period=ytd\|1y\|3y`) | Month-end depot values |
| `GET /portfolio/transactions` (`?from`, `to`, `isin`) | Purchases (savings plan and one-off investments), plus one `opening` entry per position for the starting depot (no booking) |
| `GET /fx-rates` (`?month`, `currency`) | Monthly rates, CHF per 1 EUR / USD / GBP |

### Dashboards and widgets

| Endpoint | What you get |
|---|---|
| `GET /dashboards`, `POST /dashboards`, `GET/PATCH/DELETE /dashboards/{id}` | The customer's dashboards (the default one is `DASH-01`) |
| `GET/POST /dashboards/{id}/widgets`, `GET/PATCH/DELETE /dashboards/{id}/widgets/{widgetId}` | Widgets, including your `custom` widgets |
| `GET /widget-catalog` | What the "Add widget" dialog offers, including every custom widget in the `trustroom` tab |

How to build custom widgets (declarative charts and tables, or free HTML, with links to the underlying bookings and
live data): [`docs/custom-widgets.md`](../docs/custom-widgets.md).

### Documents

| Endpoint | What you get |
|---|---|
| `GET /documents` | The customer's uploaded documents (metadata) |
| `POST /documents` | Upload, `multipart/form-data` with `file` and optional `description`. Stored locally, never leaves the environment. |
| `GET /documents/{id}`, `DELETE /documents/{id}` | Metadata, delete |
| `GET /documents/{id}/content` | The original file, e.g. to send to the [OCR service](../docs/ocr.md) |

From the `starter/` folder, with the `$TOKEN` from above:

```bash
curl -H "Authorization: Bearer $TOKEN" -F file=@resources/Demodaten/Dokumente/P2_Jana_Widmer/Mietvertrag_Wohnung_Moserstrasse22_Jana_Widmer.pdf \
  -F description="Rental contract" http://localhost:8000/api/documents
```

## The data behind the API

The API image contains the seed data and loads it on every start and reset. The same CSVs are in
[`resources/Demodaten/Daten_CSV/`](../resources/Demodaten/Daten_CSV/), one folder per customer, if you want to look at
the raw data; your TrustRoom should read through the API, like the e-banking does. Everything is **fictitious**;
merchant names are real, the transactions are not.

- **Period:** bookings from **2023-12-01 to 2026-11-26** (36 months). "Today" is 2026-11-27. `GET /upcoming-payments`
  covers today + 60 days (until 2027-01-26) by default; pass `to` for a longer horizon.
- **Balances add up:** an account's `opening_balance` (as of its `opening_date`: 2023-12-01, except Jana's pillar 3a account opened in 2026) plus the sum of its bookings equals its
  `current_balance`, and each booking carries `balance_after`.
- **IDs are per customer:** every customer has an `ACC-PRIV` and bookings from `BK-00001`. The token
  decides whose they are. New records continue the same schemes (`PAY-…`, `SO-…`, `W-…`).

| | Lukas Meier (`lukas`) | Jana Widmer (`jana`) | Daniela Rüegg (`daniela`) | Marco Baumann (`marco`) |
|---|---|---|---|---|
| Accounts | `ACC-PRIV` private, `ACC-TAX` savings for taxes, `ACC-RES` savings for annual costs, `ACC-LT` long-term savings, `ACC-3A` pillar 3a | `ACC-PRIV` private, `ACC-SAV` savings, `ACC-3A` pillar 3a (since 2026) | `ACC-PRIV` private, `ACC-SAV` emergency fund, `ACC-KID` youth savings account of her daughter | `ACC-PRIV` private, `ACC-HOUSE` savings for the house, `ACC-SAV` family savings, `ACC-3A` pillar 3a |
| Cards | `CARD-DEBIT`, `CARD-VISA` (credit card, monthly bill) | `CARD-DEBIT` | `CARD-DEBIT` | `CARD-DEBIT` |
| Depot | 4 ETFs, savings plan plus yearly one-off purchases | none | none | none |
| Loans | none | none | none | Mortgage in 3 tranches (`LOAN-01` to `LOAN-03`), quarterly interest; `LOAN-03` (SARON) also amortises quarterly |
| Bookings | about 2'350, plus about 1'470 credit card purchases | about 2'250 | about 1'850 | about 2'030 |

Jana, Daniela and Marco have no credit card and no depot, and only Marco has loans: those endpoints return empty
lists and zero values (asking for `CARD-VISA` returns `404`). Daniela's and Marco's profiles have an extra `children` field, Marco's also `property`;
`partner_name` is only set for Lukas and Marco.

### Things to know when you compute

- **Two levels on the credit card.** On Lukas's private account, the Visa card shows up only as one monthly booking
  (`transaction_type` `card_settlement`, `reference` = `statement_id`). The individual purchases are in
  `GET /cards/CARD-VISA/transactions`, with the same `statement_id`. For spending analyses, replace the settlement
  booking with the card purchases; don't add both.
- **Own transfers are not spending.** Transfers between the customer's accounts (`account_transfer`, savings standing
  orders), pillar 3a contributions and `securities_buy` move money without spending it.
- **Some costs are paid from savings accounts.** Lukas pays taxes from `ACC-TAX` and annual bills (insurance, car,
  dentist) from `ACC-RES`.
- **Refunds and reimbursements** (online shop returns, health insurance benefits, expense refunds) are credits, and
  negative `amount_chf` on the card.
- **Foreign currency.** Bookings are in CHF with the original in `original_amount`/`original_currency`. Card purchases
  abroad carry a 1.75 % FX fee (`fx_fee_chf`).
- **Cryptic texts.** Merchant and TWINT texts look like real statements: `SUMUP *BAR ROSSI ZUERICH`, `SQ *HILTL`,
  `TWINT *PARKINGPAY`, `DROPBOX*QX81 DUBLIN`. TWINT transfers between friends carry messages such as «Znacht».
- **Prices change over time.** Rent, health insurance and several subscriptions got more expensive over the three
  years, and salaries rise. Old amounts are visible in the bookings; standing orders show the current state.
- **Calendar effects.** Salaries, standing orders, eBills and direct debits move to the next business day on weekends
  and Zurich holidays. Card and TWINT payments also happen on weekends.
- **"Upcoming" is computed**, not stored: `GET /upcoming-payments` is the reliable source for "what is due in the next
  N days". A still-open credit card statement is provisional until its period ends, and so is SARON mortgage
  interest, which is only fixed at the end of the quarter.
- **Only mortgages at our bank are loans.** External loans (car lease, instalment contracts) don't appear in
  `/loans`; you only see their monthly payments in the bookings. Loans are not part of total assets.

