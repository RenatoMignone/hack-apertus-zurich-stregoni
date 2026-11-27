# OCR service

Turns documents into Markdown that you can feed to your LLM. You upload a file and get back its text, with headings
and tables kept as Markdown. Scanned PDFs and photos are read with OCR (German, French, Italian, English).

It is built on [Docling](https://github.com/docling-project/docling) (MIT) and Tesseract, runs on CPU, and works fully
offline: no data leaves your machine. It is provided as a ready-to-use Docker image
(`ghcr.io/tiziano-schacht-ti8m/trustroom-ocr`); you use it as a service and don't need its source.

## Start

```bash
docker compose up ocr                # from the starter/ folder → http://localhost:8002 (interactive docs: /docs)
```

The first start downloads the image (about 4 GB) and takes a few minutes. After each start, the service needs about
20 s to load its models; `GET /health` returns `{"status": "ok"}` once it is ready. Until then, requests fail
with "connection refused"; `docker compose ps` shows the service as `healthy` once it is ready.

If you don't need OCR, name the services you want, and Compose skips the rest:

```bash
docker compose up banking-api banking-frontend mcp-server     # everything except OCR
```

A plain `docker compose up` starts all services, including OCR (only the example TrustRoom waits until you name it).

From another container on the Compose network, the service is at `http://ocr:8002`.

## Use

| Endpoint | Returns |
|---|---|
| `POST /convert`, multipart field `file` | JSON `{"filename": "...", "markdown": "..."}` |
| `POST /convert.md`, multipart field `file` | The Markdown as plain text |
| `GET /health` | `{"status": "ok"}` |

```bash
curl -F file=@invoice.pdf http://localhost:8002/convert.md
```

```python
import httpx

with open("invoice.pdf", "rb") as f:
    response = httpx.post("http://localhost:8002/convert", files={"file": f}, timeout=300)
response.raise_for_status()
markdown = response.json()["markdown"]
```

Example output for an invoice PDF:

```markdown
## Rechnung Nr. 2026-1147

Elektro Müller AG, Bahnhofstrasse 12, 8001 Zürich

| Position                |   Menge |   Betrag CHF |
|-------------------------|---------|--------------|
| Installation Steckdosen |       4 |       480.00 |
| Material                |       1 |       126.50 |
| Total                   |         |       606.50 |
```

To read a document the customer uploaded in the e-banking, download it from the banking API
(`GET /api/documents/{documentId}/content`, with the customer's token) and POST it here.

## What you need to know

- **Formats:** PDF (digital or scanned), images (PNG, JPEG, TIFF, BMP, WEBP), DOCX, PPTX, XLSX, HTML, Markdown, CSV.
- **Keep the file extension.** The service picks the reader from the file name, so `invoice.pdf` works, but `invoice`
  or `upload.bin` does not. Files it can't read return HTTP `422` with the reason.
- **It is synchronous and does one document at a time.** On CPU, expect about 1–4 s per page. Other requests wait in
  line, so a 50-page PDF blocks the service for a few minutes. Set a generous client timeout (e.g. 300 s), and convert
  a document once, then cache the Markdown instead of converting on every LLM call.
- **Nothing is stored.** The file is processed in memory and forgotten. There is no ID to fetch it again later.
- **Mind your context window.** A long document produces long Markdown. Count tokens, and split or summarize before
  you send it to the LLM.
- **OCR is not perfect.** Clean scans and digital PDFs come out well. Photos, handwriting and stamps get noisy, and a
  table border can occasionally show up as a stray `|`. Have your LLM double-check amounts against the source where
  it matters.
- **Pictures** are replaced by `<!-- image -->`. Their content is not described.
- **Swiss QR-bills:** the printed text of a payment slip is read, but the QR code itself is not decoded. If you need
  the exact IBAN, amount and reference, decode the QR code yourself (e.g. with `zxing-cpp` or `pyzbar`).
