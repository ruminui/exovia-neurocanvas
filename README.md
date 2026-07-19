# Exovia NeuroCanvas

**Navigate knowledge like a living neural map.**

Exovia NeuroCanvas is an offline-first visual knowledge explorer created by **Luciano / Exovia** for OpenAI Build Week. It transforms long text into an interactive semantic tree and neural-style graph, preserving the original source text behind every node.

## What works now

- Paste or load `.txt` / `.md` files
- Local chunking and keyword extraction
- Topic clustering without API credits
- Infinite pan and zoom canvas
- Tree and neural graph views
- Search with **Zoom to Answer**
- Node detail panel with exact source text
- Import/export projects as JSON
- Built-in demo corpus
- Black and gold Exovia interface

## Run locally

No installation is required.

```bash
python -m http.server 8080
```

Open `http://localhost:8080`.

You can also open `index.html` directly, although a local server is recommended.

## Architecture

```text
Text / Markdown
      ↓
Local normalization and chunking
      ↓
Keyword extraction and similarity scoring
      ↓
Hierarchical clusters + semantic edges
      ↓
Canvas renderer with level of detail
      ↓
Search, focus, source inspection and export
```

The visualization is not the memory. It is the doorway into a structured, verifiable memory.

## Optional OpenAI integration

The current MVP requires no API tokens. A future provider adapter can add OpenAI embeddings, structured summaries and grounded answers while keeping the offline mode available.

Never expose an API key in client-side code. Use a server-side environment variable such as `OPENAI_API_KEY`.

## Project structure

- `index.html` — application shell
- `src/app.js` — ingestion, graph model, canvas interaction and search
- `src/styles.css` — responsive Exovia visual system
- `data/demo.json` — bundled demonstration corpus
- `docs/PRODUCT.md` — product framing
- `docs/ARCHITECTURE.md` — technical architecture
- `docs/DEMO_SCRIPT.md` — three-minute demo script
- `docs/SUBMISSION.md` — public submission copy

## Author

**Luciano — Exovia**

## License

MIT
