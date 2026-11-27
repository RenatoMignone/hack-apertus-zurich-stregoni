# Demo data: four fictitious retail customers

Everything your TrustRoom works with: who the customers are, the documents they might upload, and the raw seed data
behind the banking API. All people, companies, accounts, IBANs and amounts are **fictitious**. Merchant names and
ETF names/ISINs are real; the transactions and prices are not.

| Folder | What it contains |
|---|---|
| [`Personas/`](Personas/) | One page per customer (Markdown and illustrated PDF): life situation, accounts, worries and the questions they would ask. **Start here.** |
| [`Dokumente/`](Dokumente/) | 13 sample PDFs (in German) to upload in your TrustRoom, plus [example questions](Dokumente/README.md) per document |
| [`Daten_CSV/`](Daten_CSV/) | The seed data the banking API loads on every start and reset, one folder per customer |

## The customers

| Login | Customer | In one line |
|---|---|---|
| `lukas` / `lukas2026` | Lukas Meier (`CUST-001`, folder `P1_Lukas_Meier`) | Well-off planner, 38, Zürich. Credit card, savings pots, ETF depot, saving for a Japan trip |
| `jana` / `jana2026` | Jana Widmer (`CUST-002`, folder `P2_Jana_Widmer`) | Career starter, 26, Bern. First job, first own flat, paying back her parents |
| `daniela` / `daniela2026` | Daniela Rüegg (`CUST-003`, folder `P3_Daniela_Ruegg`) | Single parent on a tight budget, 34, Winterthur. Instalment contract, a dentist reminder |
| `marco` / `marco2026` | Marco Baumann (`CUST-004`, folder `P4_Marco_Baumann`) | Family with a house, 46, Wädenswil. Mortgage in three tranches, one fixed-rate tranche up for renewal |

## Use the API, not the CSVs

Your TrustRoom should read the data through the [banking API](../../banking-api-contract/README.md), like the
e-banking does. That way your answers and the e-banking pages show the same numbers, and the data reflects what the
customer changed (new payments, widgets, uploads). The CSVs are here so you can look at the raw data, e.g. in a
spreadsheet.

| Period | Value |
|---|---|
| Bookings | 1 December 2023 to 26 November 2026 (36 months) |
| Demo "today" | 27 November 2026 (`GET /system/info`) |
| Upcoming debits | until 26 January 2027 (`GET /upcoming-payments`) |

## Files in `Daten_CSV/<customer>/`

Every customer has the same 17 files with the same columns. Only Lukas has a credit card and a depot, and only Marco
has loans with the bank. For everyone else, `card_statements.csv`, `card_transactions.csv`, the four `portfolio_*.csv`
files, `loans.csv` and `loan_transactions.csv` contain only the header row. Column names are English; values such as
account names, booking texts and payment messages are in German, as at a Swiss bank.

| File | Content | API |
|---|---|---|
| `customer.csv` | Profile: address, contact, employer, advisor, savings goal | `GET /customer` |
| `accounts.csv` | Accounts with IBAN, opening and current balance, interest rate, purpose | `GET /accounts` |
| `bookings.csv` | All bookings of all accounts, with `balance_after` | `GET /bookings` |
| `cards.csv` | Debit card and (Lukas only) the Visa credit card | `GET /cards` |
| `card_statements.csv` | Monthly credit card statements | `GET /cards/{id}/statements` |
| `card_transactions.csv` | Individual credit card purchases (the account only shows the monthly bill) | `GET /cards/{id}/transactions` |
| `payments.csv` | Payment orders (eBill, QR bill, domestic, international, direct debit, standing order), executed and pending | `GET /payments` |
| `payees.csv` | Known payees with first and last payment date | `GET /payees` |
| `standing_orders.csv` | Standing orders, current state | `GET /standing-orders` |
| `upcoming_payments.csv` | Upcoming debits as of "today" (the API computes them live) | `GET /upcoming-payments` |
| `portfolio_positions.csv` | Depot positions | `GET /portfolio/positions` |
| `portfolio_transactions.csv` | Depot holdings at the start of the period (`side` = `opening`, no booking), then ETF purchases | `GET /portfolio/transactions` |
| `portfolio_prices.csv` | Month-end prices | (used for `GET /portfolio/performance`) |
| `portfolio_valuation.csv` | Depot value per month end (the last row is 26 November 2026, the last booking day) | `GET /portfolio/performance` |
| `fx_rates.csv` | Monthly rates EUR, USD, GBP in CHF (the same for everyone) | `GET /fx-rates` |
| `loans.csv` | Mortgages with the bank, one row per tranche | `GET /loans` |
| `loan_transactions.csv` | Interest and amortisation charges per tranche, linked to their booking | `GET /loan-transactions` |

The transactions are **not categorised**: bookings only have a booking text, a counterparty and a transaction type.
Categorising them is part of your solution. What to watch out for when you compute (credit card on two levels,
transfers between own accounts, refunds, foreign currency): see
[Things to know when you compute](../../banking-api-contract/README.md#things-to-know-when-you-compute).
