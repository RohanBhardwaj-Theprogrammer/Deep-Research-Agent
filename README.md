# Simple Deep Research Agent (Node.js + MongoDB + LM Studio)

This project is a minimal yet practical “deep research” agent. It decomposes a question into sub-queries, searches the web, fetches and extracts main content from pages, summarizes sources, and synthesizes a final brief with citations. It uses:

- Node.js/Express for the API server
- MongoDB for persistence
- LM Studio (OpenAI-compatible local server) for LLM calls and Local LLM Inference

## Prerequisites

- Node.js 18+
- MongoDB running locally (or a cloud URI)
- LM Studio with a chat model downloaded and the local server enabled

## Quick start (Windows PowerShell)

1) Copy environment file

```powershell
Copy-Item .env.example .env
```

2) Edit `.env` as needed

- `MONGODB_URI` e.g. `mongodb://localhost:27017/deepresearch`
- `LMSTUDIO_BASE_URL` default `http://localhost:1234/v1` (or `http://127.0.0.1:1234/v1`, LM Studio local server)
- `LMSTUDIO_MODEL` set to the installed model name in LM Studio
- `PORT` default `4567`

3) Install dependencies

```powershell
npm install
```

4) Start LM Studio server

- Open LM Studio, select your model, enable the local server (OpenAI-compatible). Note the base URL and model name.

5) Run the API (port 4567)

```powershell
npm run dev
```

- Health check: `GET http://localhost:4567/health`
- LLM health: `GET http://localhost:4567/health/llm`
- Open the web UI: http://localhost:4567
- In the chat UI: type your question in the input at the bottom and press Enter to send. Adjust "Max sources" to control depth.
- Start a research run:

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:4567/research -ContentType 'application/json' -Body (@{ query = 'What are the latest advances in battery energy density since 2023?' } | ConvertTo-Json)
```

- Poll status:

```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:4567/research/<RUN_ID>
```

- Get report when ready:

```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:4567/research/<RUN_ID>/report

- List sources for a run:

```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:4567/research/<RUN_ID>/sources
```
```

6) Or use the CLI

```powershell
($env:PORT=4567; npm run cli -- "What are the latest advances in battery energy density since 2023?")
```

## How it works

- `src/agent.js` orchestrates: sub-queries → web search (DuckDuckGo HTML) → fetch & extract (Readability) → per-doc summarization → final synthesis with citations.
- `src/llm.js` calls LM Studio via its OpenAI-compatible `/chat/completions` endpoint.
- `src/db.js` stores runs and documents in MongoDB.
- `src/search.js` performs web search; `src/fetchPage.js` extracts main content; `src/chunk.js` splits large content into overlapping chunks.

## Notes and limits

- DuckDuckGo HTML scraping may change; swap in a proper search API if needed.
- Some sites block scraping or require JS; Readability may return empty content in those cases.
- Tune chunk sizes and token limits based on your model.
- This is a minimal baseline; add caching, retries, tool-use, and better ranking as next steps.

### Troubleshooting

- If `GET /health` fails with `ECONNREFUSED 27017`, MongoDB isn’t running or `MONGODB_URI` is incorrect.
- If `GET /health/llm` fails, ensure LM Studio’s local server is enabled and `LMSTUDIO_BASE_URL` and `LMSTUDIO_MODEL` in `.env` match LM Studio.

## License

MIT

## Files and functions overview

This section lists the core files and functions. Use the GitHub sidebar to navigate between sections.

### `src/server.js`
- Exposes the HTTP API and serves the static web UI.
	- `GET /health`: Checks MongoDB connectivity (OK if DB reachable).
	- `GET /health/llm`: Calls a tiny LM Studio probe; returns `{ ok, model, output }`.
	- `POST /research`: Starts a research run; returns `{ runId }`.
	- `GET /research/:id`: Returns `{ id, status, createdAt, updatedAt }`.
	- `GET /research/:id/report`: Returns the final report (text/plain). 202 if not ready.
	- `GET /research/:id/sources`: Returns the list of fetched sources with metadata.
	- Serves `public/` at root (`/`).

### `src/agent.js`
- Orchestrates the end-to-end research pipeline.
	- `runResearch(query, opts)`: Main entry.
		1. Proposes sub-queries via LLM.
		2. Searches the web and deduplicates URLs.
		3. Fetches pages and extracts readable text.
		4. Summarizes chunks per document via LLM.
		5. Synthesizes a final report with citation markers and saves it.
	- `proposeSubqueries(query)`: Uses LLM to produce 4–6 focused sub-queries.

### `src/llm.js`
- Thin wrapper around LM Studio’s OpenAI-compatible `/chat/completions`.
	- `chat({ messages, temperature, max_tokens, tools, tool_choice, stream })`:
		- Sends a chat completion request. Omits `max_tokens` if negative to allow unlimited tokens.
	- `system(text)`, `user(text)`, `assistant(text)`: Helpers to build message roles.
	- `healthProbe()`: Sends a minimal deterministic prompt to verify LLM connectivity and returns a small sample output and model name.

### `src/search.js`
- Web search via DuckDuckGo HTML.
	- `webSearch(query, { limit })`: Returns an array of `{ title, url, snippet }`.

### `src/fetchPage.js`
- Fetches a URL and extracts main content via Readability.
	- `fetchAndExtract(url)`: Returns `{ url, title, byline, content, length }`.

### `src/chunk.js`
- Splits long text into overlapping chunks for LLM-friendly processing.
	- `chunkText(text, { chunkSize, overlap })`: Returns an array of text chunks.

### `src/db.js`
- MongoDB connection and indexes.
	- `getDb()`: Returns a connected database instance; ensures indexes.
	- `closeDb()`: Closes connection.

### `public/`
- Static web app served by Express.
	- `index.html`: Chat layout (messages + composer) and health pills.
	- `style.css`: Dark theme, chat bubbles, and responsive layout.
	- `app.js`: Frontend logic:
		- Health checks (`/health`, `/health/llm`).
		- Chat send (Enter or button), runs research, polls status, renders report and sources.

### Root files
- `package.json`: Scripts and dependencies.
- `.env.example`: Example environment variables (no secrets).
- `LICENSE`: MIT license.