# TrustRoom: the customer's own AI space in e-banking

Starter folder for the ti&m challenge **«TrustRoom»** at **Hack Apertus Zürich (27–28 November 2026)**.

This folder is `starter/` in the challenge template repository
([HackApertus/zurich-ti8m](https://github.com/HackApertus/zurich-ti8m)). One level up you find the template's
[`README.md`](../README.md) (submission requirements), the full [`challenge_description.md`](../challenge_description.md),
the [`technical_report.md`](../technical_report.md) you fill in, and `src/`, where **your own code** goes. All commands
in this folder's docs run from `starter/`, where `docker-compose.yml` is.

You build the **TrustRoom**: a protected AI space inside e-banking. In it, customers use a finance-specialised AI
running on **Apertus** to create their own analyses, dashboards, reports and widgets, by text or voice. Sensitive
financial data stays inside the bank: it is not used for other purposes, and it never
leaves the bank.

This starter gives you everything around the TrustRoom, so you can focus on the AI:

- a **mock e-banking** modelled on the ti&m Banking Suite, with docking points for your TrustRoom,
- a **mock e-banking REST API** with the data of four fictitious retail customers (prebuilt Docker image),
- an **example TrustRoom** that chats with Apertus, an **example MCP server** and an **OCR service** (prebuilt Docker
  image),
- **personas**, **sample documents** and **example questions** to build and test against.

> **Contents:** [The challenge](#the-challenge) · [What's in this folder](#whats-in-this-folder) ·
> [Quick start](#quick-start) · [Your first hour](#your-first-hour) · [Architecture](#architecture) ·
> [Docking points](#docking-points-where-your-trustroom-plugs-in) · [The data](#the-data) ·
> [Apertus](#apertus) · [Rules](#rules-sovereignty-and-ethics) · [Evaluation](#deliverables-and-evaluation) ·
> [Documentation index](#documentation-index) · [FAQ](#faq)

---

## The challenge

### The problem

Customers have no safe place to talk to an AI about their finances. For a quick question or to play through a few
scenarios they don't want to call their advisor, so they upload personal financial data to ChatGPT, Claude or Gemini,
often with an uneasy feeling. The data leaves the bank's control.

Banks' own assistants don't fill the gap. A **reactive** assistant answers questions, but only about e-banking data and
functions. A **proactive** assistant points out opportunities and risks, but again only what the bank considers
relevant. In both cases the bank decides. Predefined Personal Finance Management tools don't fit either: every
customer has different questions, depending on their life situation.

### The idea

> **"Here is your AI space – use it and sharpen it to your needs."**

In the TrustRoom, **the customer decides**. They discuss any concern about their personal finances with the AI, upload
their own documents (a payslip, a rental contract, an insurance policy) and combine them with their e-banking data.
They create and adjust the results themselves, by voice or text: reports, dashboards, widgets. No low-code builder, no
predefined framework that limits creativity again. The bank may still make proactive suggestions, but control stays
with the customer.

### Example uses (illustrations, not requirements)

- **Document understanding:** upload a payslip, rental contract or insurance policy, discuss it with the AI, and
  cross-reference it with the e-banking data.
- **Personalised views and reports:** generated reports, dashboards and widgets for the customer's own questions, e.g.
  a spending category over several months, or the payments due soon.
- **Budgets, scenarios and assessments:** "Can I afford a higher rent?", "Am I heading for a shortfall in the coming
  months?"
- **Optional / future vision:** a personified avatar, e.g. an advisor, an investment specialist or even the bank's
  CEO, who gives feedback on uploaded documents or explains them in the customer's language and from the perspective
  they need, e.g. for younger customers. A support avatar is also conceivable.

Part of the challenge is to come up with **your own features and ideas** that the four customers could need. The
personas below describe their lives and worries; use them as inspiration, not as a checklist.

**The focus** is not the banking quality of the answers (that depends on the model), but that the AI **reliably
delivers the requested output** under the given constraints: on-premises, guardrails, the customer's own data only.
Example: asked for spending by category, the TrustRoom forms categories and shows a chart of spending per category.

---

## What's in this folder

| Folder | What it is                                                                                             | Docs |
|---|--------------------------------------------------------------------------------------------------------|---|
| [`banking-frontend/`](banking-frontend/) | The mock e-banking (React + TypeScript). Hosts your TrustRoom in a side panel and on a full page.      | [README](banking-frontend/README.md) |
| [`banking-api-contract/`](banking-api-contract/) | The OpenAPI spec of the mock e-banking REST API, plus a guide to its resources and data model. | [README](banking-api-contract/README.md) |
| [`example-trustroom/`](example-trustroom/) | A minimal TrustRoom as example: chat UI in the iframe, a Python backend that calls Apertus with tools. | [README](example-trustroom/README.md) |
| [`example-mcp/`](example-mcp/) | A minimal MCP server with one tool. Shows how and where to build your own tools.                       | [README](example-mcp/README.md) |
| [`docs/`](docs/) | How to run everything, how the TrustRoom is embedded, how to build dashboard widgets, how to use the OCR service. | [Index](#documentation-index) |
| [`resources/Demodaten/`](resources/Demodaten/) | Personas, seed CSVs and sample PDF documents of the four customers.                                   | [README](resources/Demodaten/README.md) |

Two services come as **prebuilt Docker images** from GitHub Container Registry; their source is not part of this
starter, and Docker Compose downloads them for you:

| Service | Image | What it is | Docs |
|---|---|---|---|
| Banking API | `ghcr.io/tiziano-schacht-ti8m/trustroom-banking-api` | The mock e-banking REST API. Four customers, all data in memory, reset any time. | [API guide](banking-api-contract/README.md) |
| OCR service | `ghcr.io/tiziano-schacht-ti8m/trustroom-ocr` | Docling + Tesseract: PDFs, scans and photos in, Markdown out. Runs offline. | [`docs/ocr.md`](docs/ocr.md) |

The API and its contract are fixed for the hackathon: build on the endpoints as they are. Anything the API doesn't
offer belongs in your own TrustRoom backend.

The e-banking frontend is meant to stay as it is, too: your solution plugs in through the integration points (TrustRoom
panel and page, custom widgets, deep links), not by changing the e-banking. Its source is here, so you can change it if
you really need to, but it is not the idea of the challenge.

---

## Quick start

You need **Docker with the Compose plugin** (`docker compose version` must work). Give Docker at least 4 GB of
memory, 8 GB with the OCR service. New to Docker? See [`docs/docker.md`](docs/docker.md).

```bash
git clone <your repository> && cd <your repository>/starter
docker compose up --build
```

The first start downloads the prebuilt images and builds the rest: several GB (mostly the OCR service) and a few
minutes. After that everything runs offline. Then open:

| Service | URL | |
|---|---|---|
| E-banking | http://localhost:8090 | Log in as `lukas` / `lukas2026` |
| Banking API | http://localhost:8000/api | Interactive docs (Swagger UI): http://localhost:8000/docs |
| Example MCP server | http://localhost:8001/mcp | One tool: `get_bank_holidays` |
| OCR service | http://localhost:8002 | Interactive docs: http://localhost:8002/docs. Ready ~20 s after start. |

Skip the large OCR image if you don't need it yet:

```bash
docker compose up --build banking-api banking-frontend mcp-server
```

### Demo logins

| Username | Password | Customer | Persona |
|---|---|---|---|
| `lukas` | `lukas2026` | CUST-001 Lukas Meier | The well-off planner, 38, Zürich |
| `jana` | `jana2026` | CUST-002 Jana Widmer | The career starter, 26, Bern |
| `daniela` | `daniela2026` | CUST-003 Daniela Rüegg | The single parent on a tight budget, 34, Winterthur |
| `marco` | `marco2026` | CUST-004 Marco Baumann | The homeowner family with a mortgage, 46, Wädenswil |

### Run the example TrustRoom

1. Get an Apertus API key (see [Apertus](#apertus)).
2. `cp example-trustroom/.env.example example-trustroom/.env` and put the key into `LLM_API_KEY`.
3. Start everything with the example plugged in:
   ```bash
   TRUSTROOM_URL=http://localhost:3000 docker compose up --build banking-api banking-frontend mcp-server example-trustroom
   ```
4. Open http://localhost:8090, log in, and click the **TrustRoom icon** in the header. Ask "How much money do I have?".

If the start fails with `failed to set up container networking`, run
`docker compose --profile example down --remove-orphans` and start again (see
[Docker troubleshooting](docs/docker.md#troubleshooting)).

### Plug in your own TrustRoom

Run your solution anywhere your browser can reach, e.g. on port 3000, and point the e-banking at it:

```bash
TRUSTROOM_URL=http://localhost:3000 docker compose up
```

Without `TRUSTROOM_URL`, the e-banking shows a placeholder ("Your TrustRoom will live here").

### Reset the demo data

Payments, standing orders, dashboards, widgets, profile edits and uploaded documents are kept in memory. Restore the
original state at any time with the **"Reset demo data"** link in the e-banking footer, or:

```bash
curl -X POST http://localhost:8000/api/admin/reset
```

---

## Your first hour

1. **Read the personas** in [`resources/Demodaten/Personas/`](resources/Demodaten/Personas/). They describe each
   customer's life, finances, worries and the questions they would ask. Pick one or more to design for.
2. **Click through the e-banking** as each customer: dashboard, accounts, movements, payments, cards, loans, portfolio. This
   is the context your TrustRoom lives in.
3. **Explore the API** at http://localhost:8000/docs. Click "Authorize", log in via `POST /auth/login`, and try
   `GET /accounts`, `GET /bookings?q=migros`, `GET /upcoming-payments`.
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login -H 'Content-Type: application/json' \
     -d '{"username": "lukas", "password": "lukas2026"}' | python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])')
   curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/accounts
   curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/bookings?from=2026-10-01&to=2026-10-31&limit=5"
   ```
4. **Run the example TrustRoom** (above), open "Protocol debugging" in its UI, and watch the messages between the
   e-banking and your iframe while you navigate.
5. **Convert a sample document** with the OCR service:
   ```bash
   curl -F file=@resources/Demodaten/Dokumente/P1_Lukas_Meier/Lohnabrechnung_2026-11_Lukas_Meier.pdf \
     http://localhost:8002/convert.md
   ```
6. **Create a widget** on Lukas's dashboard, then reload the e-banking:
   ```bash
   curl -X POST http://localhost:8000/api/dashboards/DASH-01/widgets \
     -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
     -d '{"type": "custom", "title": "Hello TrustRoom",
          "custom": {"format": "declarative", "spec": {"type": "kpi", "value": 42, "unit": "ideas"}}}'
   ```
7. **Build your own solution in [`src/`](../src/)** at the repository root: copy
   [`example-trustroom/`](example-trustroom/) there as a starting point, or start from scratch in any language. Run it
   on port 3000 and plug it in with `TRUSTROOM_URL` (see [above](#plug-in-your-own-trustroom)). Then decide your architecture: which model, which tools, how you keep the AI to the
   customer's own data, how you make figures traceable.

---

## Architecture

```
  Browser
  ┌──────────────────────────────────────────────────────────────────────────┐
  │  Mock e-banking  (http://localhost:8090)                                 │
  │  ┌─────────────────────────────────┐  ┌───────────────────────────────┐  │
  │  │ Pages: dashboard, accounts,     │  │ TrustRoom panel / /trustroom  │  │
  │  │ movements, payments, cards, …   │  │  ┌─────────────────────────┐  │  │
  │  │                                 │◄─┼──┤ <iframe TRUSTROOM_URL>  │  │  │
  │  │ custom widgets on the dashboard │  │  │   YOUR TRUSTROOM UI     │  │  │
  │  └───────────────┬─────────────────┘  │  └───────────┬─────────────┘  │  │
  │                  │     postMessage: context, navigate, widgets-changed │  │
  └──────────────────┼──────────────────────────────────────┼──────────────┘
                     │ REST + bearer token                  │
                     ▼                                      ▼
           ┌───────────────────┐                ┌───────────────────────┐
           │ Banking API :8000 │◄───────────────┤ YOUR TRUSTROOM BACKEND│──► Apertus (CSCS via Keera gateway)
           │ (same data for UI │  REST + token  │  (e.g. Python)        │──► MCP server :8001 (your tools)
           │  and for your AI) │                └───────────────────────┘──► OCR service :8002
           └───────────────────┘                  optional: self-hosted STT/TTS, embeddings, vector store
```

Key ideas:

- **The e-banking and your AI read the same API.** That is what makes figures traceable: the numbers your TrustRoom
  shows can be checked against the e-banking pages.
- **Your solution is a separate web app** that the e-banking loads in an iframe. It owns its entire UI: chat, voice,
  upload, results.
- **The e-banking tells your app where the customer is** (page, selected account, dashboard) and hands over the
  customer's access token. Your app can ask the e-banking to open a page (e.g. the bookings behind an answer) or to
  reload the dashboard after it added a widget.
- **Keep your Apertus API key on your backend**, never in the browser.

---

## Docking points: where your TrustRoom plugs in

| Docking point | What it gives you | Details |
|---|---|---|
| **TrustRoom panel** | Side panel opened by the header icon, over any page. Your app in an iframe. | [`docs/trustroom-panel-context.md`](docs/trustroom-panel-context.md) §1 |
| **`/trustroom` full page** | The same app with more room, e.g. chat left, results right. | same |
| **Context** | Current page, selected account/card/dashboard, active movement filters, customer, demo "today", API URL, access token. Via query params on load, then `postMessage`. | §2–§4 |
| **Banking API** | All customer data, read and write, as the logged-in customer. | [`banking-api-contract/`](banking-api-contract/README.md) |
| **Custom widgets** | Put AI-generated widgets permanently on the dashboard: declarative KPI, table, bar, line or donut, or free HTML/JS in a sandboxed iframe. With links to the underlying bookings and optional live refresh. | [`docs/custom-widgets.md`](docs/custom-widgets.md) |
| **Deep links** | Open the e-banking on filtered movements (`/movements?ids=BK-00101,BK-00102`) for traceability, or on a prefilled payment (`/payments/new?iban=…&amount=…`) that the customer confirms. | [`docs/trustroom-panel-context.md`](docs/trustroom-panel-context.md) §5 |
| **Document storage** | `POST /documents` stores the customer's uploads locally, inside the environment. `GET /documents/{id}/content` returns the file, e.g. for the OCR service. | API guide |
| **MCP tools** | Expose your own tools (API queries, calculations, document search) to the model. | [`example-mcp/`](example-mcp/README.md) |
| **OCR** | Documents (PDF, scans, photos, Office files) to Markdown for the LLM. | [`docs/ocr.md`](docs/ocr.md) |

Nothing is executed: payments and standing orders are captures and proposals only.

---

## The data

All customers, accounts, IBANs and amounts are **fictitious**. Merchant names and ETF names/ISINs are real, the
transactions and prices are not.

- **Four retail customers** with very different lives, each with their own login and data.
- **36 months** of bookings, from **1 December 2023 to 26 November 2026**, so yearly payments appear three times.
- **"Today" is 27 November 2026**, the first day of the hackathon. Use `GET /system/info`, never your computer's
  clock, to know what "today", "last month" or "next 30 days" mean.
- **Swiss context:** amounts in CHF (some foreign-currency purchases in EUR, USD, GBP), Swiss merchants, Swiss
  payment types (eBill, QR bill, LSV, TWINT). **Booking texts and documents are in German**, as a Swiss customer
  would receive them. The e-banking UI is in English.
- **No categories.** Bookings only have a booking text, a counterparty/merchant and a transaction type.
  Categorising them (e.g. with Apertus) is part of your solution.

### The personas

| | Lukas Meier (P1) | Jana Widmer (P2) | Daniela Rüegg (P3) | Marco Baumann (P4) |
|---|---|---|---|---|
| Profile | The well-off planner, 38, Zürich, lives with his partner Sara | The career starter, 26, Bern, first job since Sept 2025 after her MSc | Single parent on a tight budget, 34, Winterthur, daughter Lina (6) | Homeowner family, 46, Wädenswil, wife Simone, children Noah (12) and Mia (9) |
| Job | Product manager at an insurance company | Junior data analyst | Pharmacy assistant, part time (60 %) | Project manager in building construction |
| Accounts | Private, 3 savings pots (taxes, reserves, long-term), pillar 3a | Private, savings, pillar 3a (since 2026) | Private, emergency fund, Lina's youth savings account | Private, savings «House», savings «Family», pillar 3a |
| Cards | Debit Mastercard, **Visa Gold credit card** | Debit Mastercard | Debit Mastercard | Debit Mastercard |
| Investments | Securities account with 4 ETFs | none | none | none |
| Loans | none | none | none | **Mortgage in 3 tranches** (2 fixed-rate, 1 SARON) |
| Topics | Where does the money go, rising subscriptions, annual bills, saving for a Japan trip in 2027 | Lifestyle change after the first salary, instalment plans, paying back her parents, taxes, building an emergency fund | Making it to the next salary, late child support, an instalment contract, an open dentist bill with a reminder | A fixed-rate tranche matures in March 2027: fixed or SARON? What the house really costs, rising rates, mortgage interest for the tax return, a car lease |
| Sample documents | Payslip, pension fund certificate, health insurance policy 2027, travel offer Japan | Payslip, rental contract, pension fund certificate | Payslip, instalment contract, second payment reminder (with QR bill) | Mortgage framework agreement, renewal offer, interest statement 2025 |

Full descriptions, with each persona's worries and typical questions:
[Lukas](resources/Demodaten/Personas/Persona_1_Lukas_Meier.md) ·
[Jana](resources/Demodaten/Personas/Persona_2_Jana_Widmer.md) ·
[Daniela](resources/Demodaten/Personas/Persona_3_Daniela_Ruegg.md) ·
[Marco](resources/Demodaten/Personas/Persona_4_Marco_Baumann.md).

### Sample documents

Thirteen German PDFs (4 / 3 / 3 / 3) in [`resources/Demodaten/Dokumente/`](resources/Demodaten/Dokumente/), each matching
the customer's e-banking data, so a good solution can combine document and transaction data. They are digital PDFs
with a text layer; use the OCR service for scans and photos. Example questions per document are in
[`Dokumente/README.md`](resources/Demodaten/Dokumente/README.md).

### Reference questions

Your TrustRoom should handle questions like these, and similar ones, with the right **type** of output (a figure, a
yes/no check, a chart, a widget), and let the customer refine the result in natural language:

- How much did I spend at online shops last month?
- Did I pay my rent in each of the last 3 months?
- Can you show me my monthly spending over the last 6 months as a chart?
- Can you create a widget listing payments due in the next 30 days?
- Does the salary on this payslip match what I received on my account? *(with the uploaded payslip)*
- Can I afford the Japan trip with my current savings? *(with the uploaded travel offer)*
- How much mortgage interest did we pay in 2025, and when does my next tranche mature? *(Marco)*

The personas and the document README list many more.

### Things that will trip up a naive solution

- **The credit card has two levels.** Lukas's account shows only one line per month, the Visa bill
  ("Lastschrift (LSV) Visa Gold Abrechnung …"). The individual purchases (online shops, subscriptions, travel) are in
  `GET /cards/CARD-VISA/transactions`. Count both levels and you count twice; ignore the card and you miss half the
  spending.
- **Transfers between own accounts are not spending.** Savings standing orders, pillar 3a payments and ETF purchases
  move money, they don't spend it.
- **Merchant texts are cryptic:** `SUMUP *BAR ROSSI ZUERICH`, `SQ *HILTL`, `TWINT *PARKINGPAY`, `AIRBNB * HMQ8ZK2 DUBLIN`.
- **Refunds** (returns, health insurance benefits, expense reimbursements) are positive amounts.
- **Foreign currency:** booking amounts are always CHF; `original_amount`/`original_currency` hold the original.
  Monthly rates are at `GET /fx-rates`.
- **IDs repeat across customers:** every customer has an `ACC-PRIV` and a `BK-00001`. The token decides whose they are.
- **Jana, Daniela and Marco** have no credit card and no securities account; those endpoints return empty lists and
  zeros. Only Marco has loans (`GET /loans`); for the others the list is empty.
- **Loan charges appear twice.** Each mortgage interest and amortisation charge is in `GET /loan-transactions`
  and also as a booking on the private account. Count one or the other. External loans (Marco's car lease,
  Daniela's instalment contract) are not in `/loans` at all, only their payments in the bookings.
- **Lists are paginated** (`limit` up to 1000, default 100). Use `total` and `offset`, or filter on the server.

The [API guide](banking-api-contract/README.md) describes every resource and field.

---

## Apertus

[Apertus](https://huggingface.co/swiss-ai) is the Swiss open LLM by EPFL, ETH Zurich and CSCS. In this challenge,
**Apertus must do the core AI work: reasoning, analysis and generation.** Fine-tuned Apertus versions count as Apertus.

- **Models:** Apertus v1.5 **8B** and **70B**, served by CSCS through the **Keera gateway**. Get your access via the
  "Perks" on the sprintd platform.
- **Endpoint:** `https://gateway.keera.ch/api/v1`, **OpenAI-compatible** (`/chat/completions`), so any OpenAI client
  library works with `base_url` and `api_key` set.
- **Model names:** `apertus-v1-5-70b`, `apertus-v1-5-8b` and their `-thinking` variants.
- **Tool calls:** the `-thinking` variants are served without tool calls. The example TrustRoom handles both cases
  (`LLM_TOOL_CALLS` in [`example-trustroom/.env.example`](example-trustroom/.env.example)).
- **Configuration:** the template asks you to read the model from the environment variables `LLM_NAME` (model name
  and version), `LLM_BASE_URL` (endpoint) and `LLM_API_KEY`. The example TrustRoom already does.
- **Model requirements:** submissions must use the Apertus v1.5 family and meet the
  [model and challenge requirements](https://hackapertus.notion.site/zurich-challenges-model-requirements).
- **Choose deliberately.** 8B is faster, 70B is stronger. The jury wants a clear reasoning for the model version you
  picked, and acceptable response times are a success criterion.

```python
from openai import OpenAI

client = OpenAI(base_url="https://gateway.keera.ch/api/v1", api_key="<your key>")
reply = client.chat.completions.create(
    model="apertus-v1-5-70b",
    messages=[{"role": "user", "content": "Grüezi! Was ist eine Säule 3a?"}],
)
print(reply.choices[0].message.content)
```

---

## Rules: sovereignty and ethics

### Data sovereignty

- Highly sensitive financial data **must not leave the bank** (on-premises operation). The CSCS cluster where Apertus
  runs counts as "inside the bank".
- The full pipeline runs with **Apertus and self-hostable open-weights components only**. Open-weights models may do
  supporting tasks at runtime (embeddings, OCR, speech-to-text, text-to-speech).
- **No closed models or proprietary AI APIs at runtime**: no OpenAI, Anthropic, Google, ElevenLabs or similar. (You
  may of course use coding assistants while developing; list them in your report.)
- Uploaded documents stay inside the environment: store them via the banking API's `/documents` or in your own
  self-hosted storage.
- Everything in this starter runs offline after the first build: no CDNs, no external fonts, no telemetry. Keep your
  solution the same way.

### Responsible AI

- Customer data and uploaded documents are processed **only within the TrustRoom**: not for other purposes, not for
  model training.
- **The customer stays in control.** The bank may suggest, the customer decides what the AI does.
- **Transparency:** the AI never invents figures and makes clear which data a result is based on (e.g. links to the
  underlying bookings). It does **not give regulated investment advice**.
- **Responsible tone:** for customers in a tight financial situation (see Daniela), the AI responds empathetically.
  It may explain and analyse existing loans, but does **not promote new credit products**, and for debt-related questions points to free budget and debt counselling
  services.
- Show concrete, reusable patterns for **context restriction** (the AI only uses this customer's data) and for
  **integration** into an e-banking.

---

## Deliverables and evaluation

### What you submit

The binding rules are in the template's [`README.md`](../README.md) and
[`challenge_description.md`](../challenge_description.md); in short:

- A **working prototype** of the TrustRoom, demonstrated live in the final pitch. It must **run end-to-end** when the
  judges try it.
- **Git repo (URL):** your repository, created from the template with **Use this template**, set to **public**. Keep
  the template layout (don't rename or move its files), put your code in `src/`, and keep `starter/` so the judges
  can run the e-banking with your TrustRoom. Read the model from `LLM_NAME`, `LLM_BASE_URL` and `LLM_API_KEY`, and
  never commit your key. All Hack Apertus projects are open source
  ([T&C](https://hackapertus.ch/terms-and-conditions)).
- **Technical report (pdf):** fill in [`technical_report.md`](../technical_report.md) and upload it as
  `TeamName_Report.pdf` to the repository root, **max. 6 pages** without references. It covers how to run your
  project, the architecture and data flow showing that no data leaves the on-premises environment, the guardrail and
  context-restriction patterns you used, and a list of **every model used** (development and runtime) with version
  and role.
- **Demo video (URL):** **max. 2 min**, linked in the **Demo** field at the top of
  [`technical_report.md`](../technical_report.md).
- **Pitch deck (pdf):** **max. 10 slides**.

### Success criteria

- **Output fulfilment:** for the reference questions and similar requests, the TrustRoom delivers the requested type of
  output (a figure, a yes/no check, a chart, a widget), and the customer can refine it iteratively in natural language
  (text; voice optional).
- **Traceability:** figures are computed from the customer's data, never invented, and the customer can see which
  transactions a result is based on. How precisely individual transactions are categorised is not the main focus.
- **Data sovereignty:** Apertus and self-hostable open-weights components only, data flow documented.
- **Usability:** a non-technical user creates a first result within a few minutes, without instructions.
- **Performance:** acceptable response times with Apertus v1.5 8B or 70B on the provided infrastructure.

### How teams are ranked

The top 2 teams of this challenge advance to the Final, based on your demo and presentation:

| Criterion | Weight | Question |
|---|---:|---|
| Customer value and freedom | 30 % | How well can customers shape the TrustRoom to their own needs? |
| Reliable output and traceability | 30 % | Does the AI reliably deliver the requested output, and are figures traceable to the data? |
| Technical rigour and sovereign architecture | 20 % | Clean, on-premises-ready architecture on Apertus, with a clear reasoning for the design choices (e.g. the Apertus model version) |
| Feasibility and integration | 20 % | How realistic is integration into an existing e-banking? |

The Final jury scores, each from 0 to 5: purposeful use of AI, technical rigour, value/cost/scalability, sovereign
deployability, implementation feasibility, and pitch & presentation.

### Support during the hackathon

- Day 1: challenge pitch (5 min) and a 60-minute deep-dive workshop on business context, personas, data and architecture.
- ti&m mentors on site, both technical and business.

---

## Documentation index

| I want to … | Read |
|---|---|
| Read the full challenge and the submission rules | [`../challenge_description.md`](../challenge_description.md), [`../README.md`](../README.md) |
| Know what goes into the technical report | [`../technical_report.md`](../technical_report.md) |
| Install Docker, start/stop services, see ports, troubleshoot | [`docs/docker.md`](docs/docker.md) |
| Embed my TrustRoom, receive the context, navigate the e-banking | [`docs/trustroom-panel-context.md`](docs/trustroom-panel-context.md) |
| Put widgets on the dashboard (formats, fields, live data, traceability) | [`docs/custom-widgets.md`](docs/custom-widgets.md) |
| Understand the API resources and the data model | [`banking-api-contract/README.md`](banking-api-contract/README.md), Swagger UI at http://localhost:8000/docs |
| Look at a working TrustRoom (Apertus, tools, postMessage) | [`example-trustroom/README.md`](example-trustroom/README.md) |
| Build my own MCP tools | [`example-mcp/README.md`](example-mcp/README.md) |
| Turn documents into text | [`docs/ocr.md`](docs/ocr.md) |
| Know the customers | [`resources/Demodaten/Personas/`](resources/Demodaten/Personas/) |
| See which data files exist and which endpoint serves each | [`resources/Demodaten/README.md`](resources/Demodaten/README.md) |
| Find example questions for the sample PDFs | [`resources/Demodaten/Dokumente/README.md`](resources/Demodaten/Dokumente/README.md) |
| Run or change the e-banking frontend | [`banking-frontend/README.md`](banking-frontend/README.md) |

---

## FAQ

**Do I have to use Python, React or MCP?**
No. Use any language and framework. The example TrustRoom is Python (FastAPI) with a plain HTML/JS frontend, the
e-banking is React, and MCP is one option for exposing tools. Your app only has to be a web page the e-banking can load
in an iframe, and it talks to the API over plain REST.

**Where does my code go?**
Into `src/` at the repository root. Leave `starter/` as it is where you can (it's what the judges start), and run your
solution next to it, plugged in via `TRUSTROOM_URL`. Explain how to start everything in your technical report.

**How does my TrustRoom know who the customer is?**
From the context the e-banking sends (`customer`, `access_token`). Send the token as `Authorization: Bearer …` with
every API call. Don't build your own login. See [`docs/trustroom-panel-context.md`](docs/trustroom-panel-context.md) §4.

**My app runs in Docker and can't reach `localhost:8000`.**
Inside a container, use the Compose service names (`http://banking-api:8000/api`, `http://mcp-server:8001/mcp`,
`http://ocr:8002`). `localhost` only works from your browser and your host.

**Can my TrustRoom make a payment?**
It can propose one: open `/payments/new?…` with a deep link, or create a pending payment via `POST /payments`. The
customer confirms it in the e-banking. Nothing is executed.

**Can I add data, e.g. a budget or the customer's goals? Can I add an endpoint to the banking API?**
The banking API is a fixed, prebuilt image: it holds the bank's data and the dashboards. Anything else your TrustRoom
needs (budgets, goals, categories, your own aggregates) lives in your own backend, inside the environment. That is
also how a TrustRoom would integrate with a real e-banking, whose API it can't change either.

**I broke the data.**
`curl -X POST http://localhost:8000/api/admin/reset`, or "Reset demo data" in the e-banking footer.

**Why does "today" say 2026-11-27?**
The data is built around the hackathon's first day. Always take "today" from `GET /system/info` or the context, so
"last month" and "next 30 days" match the data.
