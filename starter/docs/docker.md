# Docker quick guide

Everything runs with Docker Compose from the `starter/` folder (where `docker-compose.yml` is). Apart from the LLM (Apertus, reached over the
internet), no cloud services are needed at runtime.

## Install Docker

You need Docker with the Compose plugin (`docker compose`, not the old `docker-compose`).

| System | Install |
|---|---|
| macOS / Windows | Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and start it. On Windows, enable the WSL 2 backend. |
| Linux | Install [Docker Engine](https://docs.docker.com/engine/install/) and the [Compose plugin](https://docs.docker.com/compose/install/linux/). |

Check that it works:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

Docker needs a running daemon: on macOS and Windows, open Docker Desktop first. Give it at least 4 GB of memory
(8 GB if you run the OCR service) under Settings → Resources. The first start downloads several GB and needs internet.
Afterwards the services run offline; only the calls to Apertus need internet.

## Images

| Service | Comes from |
|---|---|
| `banking-api`, `ocr` | Prebuilt images from GitHub Container Registry (`ghcr.io/tiziano-schacht-ti8m/trustroom-banking-api`, `…/trustroom-ocr`). Compose pulls them on the first start. Their source is not part of this starter. |
| `banking-frontend`, `mcp-server`, `example-trustroom` | Built locally from the folders in this starter (`banking-frontend/`, `example-mcp/`, `example-trustroom/`), so you can read and change them. The MCP server and the example TrustRoom are also published (`…/trustroom-mcp-server`, `…/trustroom-example`): without `--build`, Compose pulls them on the first start, and your changes only take effect with `--build`. |

## Services and ports

| Service | URL | Purpose |
|---|---|---|
| `banking-frontend` | http://localhost:8090 | E-banking UI |
| `banking-api` | http://localhost:8000/api (docs: `/docs`) | Mock REST API, seeded from the CSVs |
| `mcp-server` | http://localhost:8001/mcp | Example MCP server (one tool) |
| `ocr` | http://localhost:8002 (docs: `/docs`) | Documents in, Markdown out ([guide](ocr.md)) |
| `example-trustroom` | http://localhost:3000 | Example TrustRoom (chat with Apertus, with tools when `LLM_TOOL_CALLS=true`). Only starts when named, see below |

## Start

```bash
docker compose up --build                  # everything except the example TrustRoom
docker compose up banking-api              # API only
docker compose up --build banking-api banking-frontend mcp-server   # everything except OCR
```

`--build` rebuilds the locally built services (frontend, MCP server, example TrustRoom) after you change them. The
prebuilt images are not affected by it.

The OCR image is large (about 4 GB) and its first download takes a few minutes. Skip it if you don't need it.
After each start, OCR needs about 20 s to load its models. Wait until `GET /health` returns `{"status": "ok"}`.

## Log in

Open http://localhost:8090 and log in as one of the four demo customers, each with their own data:

| Username | Password | Customer |
|---|---|---|
| `lukas` | `lukas2026` | Lukas Meier |
| `jana` | `jana2026` | Jana Widmer |
| `daniela` | `daniela2026` | Daniela Rüegg |
| `marco` | `marco2026` | Marco Baumann |

API calls need the customer's token from `POST /api/auth/login` (`Authorization: Bearer <token>`). See
[trustroom-panel-context.md](trustroom-panel-context.md) §4.

## Embed your TrustRoom

Point the e-banking at your own solution. It appears in the header panel and on `/trustroom`:

```bash
TRUSTROOM_URL=http://localhost:3000 docker compose up
```

The URL must be reachable from your **browser**, not just from inside Docker. Protocol and page IDs:
[trustroom-panel-context.md](trustroom-panel-context.md). Dashboard widgets: [custom-widgets.md](custom-widgets.md).

To see a working solution first, start the example TrustRoom. It needs an Apertus key in
`example-trustroom/.env` (see [its README](../example-trustroom/README.md)):

```bash
TRUSTROOM_URL=http://localhost:3000 docker compose up --build banking-api banking-frontend mcp-server example-trustroom
```

A plain `docker compose up` doesn't start the example, so port 3000 stays free for your own solution.

## Reset the demo data

All changes (including uploaded documents) are discarded on a reset, so either:

```bash
curl -X POST http://localhost:8000/api/admin/reset    # restore the seed state of all customers, no restart needed
docker compose restart banking-api                    # same effect, via restart
```

The UI also has a "Reset demo data" link.

## Configuration

Environment variables of the `banking-api` image, set in `docker-compose.yml` under `banking-api`:

| Variable | Default | Meaning |
|---|---|---|
| `DEMO_TODAY` | `2026-11-27` | The "today" of the demo. The seed data is consistent with this date |

Uploaded documents are deleted along with everything else on a reset, a restart or `docker compose down`.

## Calling the services

- **From your host** (browser, scripts): use `localhost` and the ports above.
- **From another container** on the same Compose network: use the service name, e.g. `http://banking-api:8000/api`.
  The frontend's `API_URL` is the exception: the browser loads it, so it must stay `http://localhost:8000/api`.

## Everyday commands

```bash
docker compose ps                          # what is running
docker compose logs -f banking-api         # follow the logs of one service
docker compose up --build -d               # rebuild the local services and run everything in the background
docker compose pull banking-api ocr        # get a new version of the prebuilt images
docker compose down                        # stop and remove the containers
```

## Troubleshooting

- **Port already in use:** stop whatever uses 8000, 8001, 8002, 8090 (or 3000 for the example TrustRoom), or change the left-hand port in `docker-compose.yml`.
- **Changes don't show up:** add `--build` so the frontend, MCP server or example TrustRoom image is rebuilt.
- **`pull access denied`, `denied` or `manifest unknown` for `banking-api` or `ocr`:** check your internet connection
  and that you can reach `ghcr.io`. If you are logged in to ghcr.io with another account, run `docker logout ghcr.io`
  and try again.
- **`failed to set up container networking: invalid cluster node while attaching to network`** (or another
  network error on start): leftover containers from an earlier run still point at an outdated Compose network.
  Remove the containers and the network, then start again:
  ```bash
  docker compose --profile example down --remove-orphans
  TRUSTROOM_URL=http://localhost:3000 docker compose up --build banking-api banking-frontend mcp-server example-trustroom
  ```
  `--profile example` is needed so that `down` also removes the example TrustRoom container. If the error comes back
  after this, restart Docker Desktop.
- **UI shows no data:** check that `banking-api` is running and `http://localhost:8000/api` answers in your browser.
- **Free disk space:** `docker system prune` removes unused images and build cache.
