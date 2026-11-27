# 1. Challenge Overview

## Challenge Title

"TrustRoom” – the customer’s own AI space in e-banking

## Sector / Domain

Banking / Finance – retail e-banking

## Summary (2-sentences)

Build the "TrustRoom" - a protected AI space inside e-banking in which customers use a finance-specialised AI on Apertus to create their own analyses, dashboards, reports and widgets by voice or text – truly personal finance, shaped by each customer's individual needs and life situation. Sensitive financial data stays within the bank: it is not used for other purposes, not used for model training and never leaves the bank.

## Context and Background

Banks are under pressure to protect their customer interface against new players – especially AI providers who are trying to gain a foothold in the customer relationship. In response, banks are building their own AI assistants for e-banking in two stages:

- Reactive assistant: responds to the customer's questions, but its scope is limited to e-banking – customers can access their data and ask about e-banking functions, but cannot use the AI freely.
- Proactive assistant: the bank actively points customers to opportunities and risks, e.g. liquidity optimisation or risk alerts – again within the e-banking setup and the bank's view of what is relevant.

In both stages the bank decides what happens. For their own financial questions beyond these predefined use cases, customers still turn to alternative solutions outside the bank. The "TrustRoom" changes this: the customer decides.

The TrustRoom is a protected AI space specialised in personal finance. Unlike existing assistants, it lets customers realise their own personal finance use cases – not predefined by the bank and not limited to e-banking data. For example, customers can upload their own financial documents in a protected space where they feel safe sharing their data, and combine them with the data available in e-banking. The result is Personal Finance Management that truly deserves the name "personal".

The motto is "Here is your AI space – use it and sharpen it to your needs." The customer decides what to do in this space and creates and adjusts the results themselves, e.g. analyses, reports and dashboards. The bank still makes proactive suggestions, but control stays with the customer. For the first time, banking becomes truly personal: not the bank defines what the customer should see, the customer decides what interests them. This is the TrustRoom.

Why join: work hands-on with a sovereign Swiss LLM (Apertus) on a real e-banking use case, with full creative freedom in how you get there or what features to build, and help define the pattern for customer-controlled AI in banking: an independent, on-premises Swiss AI that keeps sensitive financial data inside the bank.

## Problem Description

Customers today have no safe place to chat with an AI about their financial questions. For a quick question or to play through a few scenarios they don't want to contact their advisor. So they use the usual AI providers such as ChatGPT, Claude or Gemini and upload personal financial data there, often with an uneasy feeling. Highly sensitive data leaves the bank's control and may be used for other purposes or for model training.

The bank has no interest in advisors taking over such questions either; advisors should focus on actual product advice.

Existing solutions help little. Banks' own AI assistants, whether reactive or proactive, are limited to the fixed use cases the bank has defined and to the scope of e-banking. The freedom to really use AI for one's personal finances does not exist there. Predefined tools such as Personal Finance Management hardly reflect the individuality of customers either. It practically never works to build one fixed tool that fits everyone, because every customer has very different questions that also depend strongly on their life stage.

## Main Objective

Build a prototype of the "TrustRoom": a customer-controlled AI environment within e-banking, powered by Apertus. In this protected space, customers can discuss any concern around their personal finances with a finance-specialised AI, upload their own documents and, based on this, create their own results – reports, dashboards or custom front-ends such as widgets – by voice or text. They create and adjust these results themselves, not via low-code builders or predefined frameworks that would restrict creativity again. Data is not processed for other purposes, not used for training and never leaves the bank.

Example uses (illustrations, not requirements; teams may implement these or develop their own approaches):

- Document understanding: the customer uploads financial documents (e.g. a payslip, rental contract or insurance policy), discusses their content with the AI and lets it cross-reference them with the existing e-banking data.
- Personalised views and reports: automatically generated reports, or dashboards and widgets that visualise the customer's own questions, e.g. comparing a spending category over several months or listing upcoming payments.
- Budgets, scenarios and assessments: the customer creates budgets, plays through scenarios or asks for the AI's assessment, e.g. "Can I afford a higher rent?" or "Am I heading for a financial shortfall in the coming months?"

The focus is not on the banking quality of the content, which depends on the model, but on making the AI reliably deliver the requested output under the given constraints (on-premises, guardrails, customer's own data only). Example: when asked for spending by category, the TrustRoom forms categories and shows a chart of spending per category.

Optional / future vision: interaction with a personified avatar, e.g. an advisor, an investment specialist or even the bank's CEO, who gives feedback on uploaded documents or explains them in the customer's language and from the perspective they currently need. This could address segments such as younger customers; a support avatar is also conceivable.

# 2. Resources, Tools & Support

## Datasets (type, format, access)

Synthetic e-banking data of four fictitious retail customers, provided via the mock e-banking API. No real customer data is used.

- Four personas with different life situations: a well-off planner (38, Zurich), a young professional just after university (26, Bern), a single parent on a tight budget (34, Winterthur) and a homeowner family man facing a mortgage renewal (46, Wädenswil). Each comes with a short profile and example questions.
- Structured data via API (JSON): accounts, 36 months of booked transactions (date, amount, currency, booking text, counterparty/merchant, transaction type), credit card transactions, payments, payees, standing orders and upcoming payments, cards, loans (mortgage tranches with interest rate, term, outstanding amount, and interest and amortisation entries linked to the account bookings), portfolio positions and transactions, FX rates. The data is designed so that the reference questions can be answered (e.g. recurring rent payments, online-shop purchases, payments due in the coming weeks, mortgage interest paid).
- Sample documents (13 PDFs, matching each customer's data): e.g. payslip, rental contract, pension fund certificate, health insurance policy, instalment contract, payment reminder, mortgage agreement, mortgage renewal offer, interest statement – for upload and explanation scenarios.
- Swiss context: amounts in CHF, Swiss merchants; booking texts and documents are in German, as a Swiss customer would receive them.

Access: Mock API and Git repository via the Phoeniqs hackathon environment, available at the start of the hackathon.

Preprocessing: the data is ready to use via the API; no cleaning required. Transactions are not pre-categorised (only booking text and counterparty), so categorisation, e.g. with Apertus, is part of the teams' solutions.

## Available APIs & Services

- Apertus v1.5 inference endpoints (8B and 70B) via API, provided by CSCS through the Keera Gateway (see "Perks" on the sprintd platform).
- Mock e-banking modelled on the ti&m banking suite, in which teams embed their TrustRoom: a TrustRoom side panel and full-screen page as docking points, and a customisable dashboard where AI-generated custom widgets can be placed permanently.
- Mock e-banking REST API (OpenAPI spec) providing the data of the four fictitious customers: customer profile, accounts, bookings, credit card transactions, payments, standing orders / upcoming payments, cards, loans, portfolio, FX rates; dashboards and widgets (read/write); document upload with local storage, so uploads stay inside the environment. Payment creation as a proposal only (sandbox, no execution).
- Ready-to-use tools provided by ti&m, so teams don't need to build the integration themselves: an example MCP server, and an OCR tool for extracting text from documents (PDF, scans, photos).
- Optional supporting open-weights components that can be self-hosted, e.g. speech-to-text/text-to-speech for voice input, embedding model and vector store for document search. Closed models and proprietary AI APIs (incl. ElevenLabs) must not be used at runtime. The reasoning, analysis and generation must be done by Apertus.

## Supporting Materials

- Challenge brief, 5-minute pitch and 60-minute deep-dive workshop on day 1 (business context, customer personas, data, architecture).
- Profiles of the four customer personas, describing their life situation, financial setup and typical questions.
- API documentation (OpenAPI/Swagger), data model description and a guide to the docking points of the mock e-banking (embedding the TrustRoom panel, custom widget format).
- Starter repository with a minimal example: calling Apertus, querying the customer's data, rendering a simple widget.
- Reference question set with example customer questions, e.g.:
    - How much did I spend at online shops last month?
    - Did I pay my rent in each of the last 3 months?
    - Can you show me my monthly spending over the last 6 months as a chart?
    - Can you create a widget listing payments due in the next 30 days?
    - Does the salary on this payslip match what I received on my account?
    - Can I afford the Japan trip with my current savings?
    - How much mortgage interest did we pay in 2025, and when does my next tranche mature?
- Example questions for each sample document.
- Links to Apertus model cards and documentation.

# 3. Technical Preferences

## Preferred Programming Languages / Frameworks

No hard restrictions; teams can choose their preferred language and framework. The starter repository is provided in Python; the mock e-banking frontend uses React.

## Recommended Platforms

Target solution runs on-premises as an independent Swiss solution that keeps sensitive financial data inside the bank (one of the three Hack Apertus target architectures: on-premise, air-gapped or sovereign Swiss cloud). During the hackathon, teams develop on the resources provided by Hack Apertus: Apertus inference via CSCS / Keera Gateway, plus the ti&m mock e-banking, mock API, MCP server and OCR tool.

## Specific AI Models

Apertus 1.5 8B oder 70B

## Model Sources

Apertus v1.5 (8B or 70B) from Hugging Face (huggingface.co/swiss-ai), accessed via the CSCS / Keera Gateway.

Check the specific model requirements here:
https://hackapertus.notion.site/zurich-challenges-model-requirements

# 4. Outputs & Evaluation

## Expected Outputs

- Working prototype of the TrustRoom, demonstrated live in the final pitch.
- Source code in a public Git repository based on template: https://github.com/HackApertus/zurich-ti8m
- Technical report (max. 6 pages, pdf): architecture and data flow showing that no data leaves the on-premises environment, the guardrail and context-restriction patterns used, and a list of every model used (development and runtime) with version and role.
- Short demo video (max. 2 min)
- Pitch deck (max. 10 slides, pdf)

## Success Criteria

- Output fulfilment: For the reference questions and similar requests, the TrustRoom delivers the requested type of output (e.g. a figure, a yes/no check, a chart, a widget), and the customer can refine it iteratively in natural language (text; voice optional).
- Traceability: Figures are computed from the customer’s data, never invented; the customer can see which transactions a result is based on. How precisely individual transactions are categorised depends on the model and is not the main focus.
- Data sovereignty: the full pipeline runs with Apertus and self-hostable open-weights components only; no closed models or proprietary AI APIs at runtime; data flow documented.
- Usability: a non-technical user creates a first result within a few minutes without instructions.
- Performance: acceptable response times with Apertus v1.5 8B or 70B on the provided infrastructure.

## Evaluation Criteria

Teams are ranked within this challenge (top 2 advance to the Final) by the evaluation of their tool demo & supporting presentation:

| Criterion | | |
| --- | --- | --- |
| Customer value and freedom | (30 %) | How well can customers shape the TrustRoom to their own needs? |
| Reliable output and traceability | (30 %) | Does the AI reliably deliver the requested output, and are figures traceable to the data? |
| Technical rigour and sovereign architecture | (20 %) | Clean, on-premises-ready architecture built on Apertus with a clear reasoning on the design choice (i.e. the Apertus model version selected) |
| Feasibility and integration | (20 %) | How realistic is integration into an existing e-banking? |

These criteria are aligned with the final jury criteria.

# 5. Ethics & Compliance

## Ethical Guidelines

- Customer data and uploaded documents are processed only within the protected AI space: not for other purposes, not for model training, and they never leave the bank.
- The customer stays in control; the bank may make proactive suggestions, but the customer decides what the AI does.
- Transparency: the AI does not invent figures and makes clear which data a result is based on; it does not give regulated investment advice.
- Responsible tone: for customers in a tight financial situation, the AI responds empathetically. It can explain and analyse existing loans, but does not promote new credit products and, for debt-related questions, points to free budget and debt counselling services.
- Solutions should show concrete patterns for context restrictions and integration that can be reused in bank projects.

## Legal & Compliance Requirements

Highly sensitive financial data must not leave the bank (on-premises operation). Cluster where apertus runs is defined as "in the bank".
