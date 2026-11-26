# Zurich event and resources

Prepared 26 November 2026 from the organizer's public guides and participant updates. Check [Hack Apertus Discord](https://discord.gg/hack-apertus) and [Sprintd](https://app.sprintd.org/events/hack-apertus-zurich) for changes. Organizer contact: `hello@hackapertus.ch`.

## Venue and schedule

**AI Startup Center, Technopark Zurich, 3rd floor**, Technoparkstrasse 1, 8005 Zurich. Bring a laptop and charger. The venue stays open overnight, with food and mattresses provided. Bring a sleeping bag if staying. The organizer advertises up to CHF 100 in travel reimbursement with receipts for participants living more than 100 km from the venue. See the [getting-started guide](https://hackapertus.notion.site/getting-started-guide-zurich) for logistics and [Code of Conduct](https://hackapertus.ch/code-of-conduct).

| Date (Zurich local time, CET) | Milestone |
| --- | --- |
| Fri 27 Nov, 08:00–09:00 | Check-in. Challenge-specific templates are scheduled to go public at 08:00. |
| Fri 27 Nov, 09:00 / 09:30 | Welcome and partner pitches, then rank challenge preferences on Sprintd and finalize teams. |
| Fri 27 Nov, 10:15 / 10:30 | Assignments announced, then partner workshops. |
| Fri 27 Nov, 11:30 | Hacking starts. |
| Sat 28 Nov, **14:30** | **Submission cutoff on Sprintd.** |
| Sat 28 Nov, 15:00–16:45 | Pitches to challenge partners. Check the assigned room and order on Sprintd. |
| Sat 28 Nov, 17:30 / 18:30 | Top six announced, then Zurich Finals. Awards start at 19:30. |

Teams have 2–5 people. Per the 14 November organizer email, competing teams must check in and work on-site. See the [Zurich schedule](https://hackapertus.ch/regions/zurich) and [opening deck](https://hackapertus.ch/deck-zurich) for the full agenda and venue plans.

## Challenge previews

| Partner | Preview |
| --- | --- |
| ti&m | TrustRoom, a personal AI space for e-banking customers. |
| Suva | Find relevant Swiss Federal Court decisions and prepare a legal summary. |
| Digitec Galaxus | Classify product images in a Kaggle competition. Have a Kaggle account ready if this is a possibility. |

Sprintd matches teams using their preferences and the need to spread teams across challenges. The Friday workshop is where the team can clarify the brief, evaluation, datasets and permissions. Sources include the 14 November organizer preview, the 22 November Kaggle note and the [challenges and model rules guide](https://hackapertus.notion.site/zurich-challenges-model-requirements).

## Model and infrastructure rules

- **Core task.** Apertus v1.5 (8B or 70B, including adapted versions) must perform the challenge's core AI task.
- **Development.** Coding assistants and closed models are allowed during development. List each model used, with its version and role, in the technical report.
- **Runtime.** Use Apertus and publicly downloadable, self-hostable open-weight models for supporting tasks such as embeddings, OCR or reranking. The final solution must run without closed models and proprietary AI APIs.
- **Evaluation.** Other open-weight models may act as automated judges when results are reproducible. Record the evaluator and its configuration alongside the test cases and metrics.
- **Deployment.** The final solution must be deployable on-premises, air-gapped or in a sovereign Swiss cloud. Demonstrate what you can run and document remaining deployment dependencies.

The organizer ties awards eligibility to the core model, runtime, deployment and disclosure rules. [Official model requirements](https://hackapertus.notion.site/zurich-challenges-model-requirements)

## Inference and tools

- **Hosted Apertus.** CSCS provides inference via Keera. The opening deck lists `https://gateway.keera.ch/api/v1` for 8B and 70B access and directs teams to Sabine on Discord for their key. Use [Sprintd Perks](https://app.sprintd.org/events/hack-apertus-zurich/perks) and on-site instructions for credentials and model IDs. Smoke-test the assigned model and its required input type before integrating it.
- **Local Apertus.** The organizer suggests pre-downloading [Apertus v1.5 8B](https://huggingface.co/swiss-ai/Apertus-v1.5-8B) if the team plans to run it locally. See the [v1.5 model collection](https://huggingface.co/collections/swiss-ai/apertus-v15) and [technical report](https://huggingface.co/papers/2610.15542) for model details.
- **Optional resources.** Hugging Face compute credits and other participant perks are listed on Sprintd. Check tool eligibility against the model rules before adding any runtime dependency. [Organizer resources and tools](https://hackapertus.notion.site/zurich-resources-tools)
