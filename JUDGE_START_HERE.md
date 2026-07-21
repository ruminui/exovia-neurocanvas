# Judges: Start Here

Exovia NeuroCanvas can be evaluated in three independent ways.

## Path A — Automated ChatGPT App verification

```bash
cd chatgpt-app
npm install
npm run judge
```

This starts the MCP server, connects with the official MCP client, discovers all seven tools, runs the complete deterministic scenario and creates inspectable artifacts under `chatgpt-app/judge-output/`.

Expected result:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: 9+ files, source-linked EXO pack, evidence-bounded winner and valid SHA-256 fingerprints.
```

- Full instructions: [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- EXO format: [`docs/EXO_CAPABILITY_PACK.md`](docs/EXO_CAPABILITY_PACK.md)
- Acceptance criteria: [`docs/HACKATHON_JUDGE_EVIDENCE.md`](docs/HACKATHON_JUDGE_EVIDENCE.md)

## Path B — Run with Docker

```bash
cd chatgpt-app
docker compose up --build
```

Open:

```text
Status: http://localhost:8787/
Health: http://localhost:8787/health
MCP:    http://localhost:8787/mcp
```

The status page presents the seven tools and their safety boundaries.

## Path C — Try the human NeuroCanvas product

### Web/local

```bash
npm install
npm start
```

Import either generated artifact from `chatgpt-app/judge-output/`:

- the `.exo` capability pack to inspect sources, chunks, procedures, constraints and action policies as a graph;
- the `neurocanvas-v3` JSON map to inspect the direct AI-to-human handoff.

### Android

The current test build is published in the repository's `android-latest` release.

## Real ChatGPT Developer Mode

To render the black-and-gold widget inside ChatGPT, expose the running MCP server through a public HTTPS URL and connect the URL ending in `/mcp` from ChatGPT Developer Mode.

The server does not call another AI service, install generated capabilities or retain submitted content.

## Suggested evaluation sequence

1. Run `npm run judge` in `chatgpt-app`.
2. Inspect `trust-scan.json` for evidence, privacy and control findings.
3. Inspect `context-capsule.md` for portable context and approval rules.
4. Inspect the generated `.exo` file for source/chunk IDs, progressive-disclosure metrics, procedures, constraints, safety rules and SHA-256 integrity.
5. Inspect `comparison.json`: **Controlled pilot** must rank above **Fast launch**.
6. Open the generated `.exo` or NeuroCanvas JSON in the web or Android application.
7. Inspect `proof-pack.json` and its integrity fingerprint.
8. Optionally connect the MCP endpoint to ChatGPT.

## What is implemented

- ChatGPT Apps SDK/MCP server and inline widget;
- seven deterministic, read-only tools;
- evidence/privacy/context/control analysis;
- sensitive-value replacement in exported artifacts;
- portable Context Capsule;
- source-linked `.exo` package with index-first progressive disclosure;
- EXO import into the human NeuroCanvas graph;
- evidence-bounded AI-output comparison;
- provider-neutral route recommendation;
- AI-to-human NeuroCanvas map handoff;
- EXO and Proof Pack SHA-256 fingerprints;
- local web/PWA and Android product;
- unit, static, browser, MCP, artifact and container validation;
- Docker, Codespaces and local execution paths;
- ChatGPT App submission metadata with five positive and three negative review tests.

## Honest boundaries

Analysis, extraction, ranking and token estimates are heuristics. An `.exo` package is inspectable data, not a trained model and not authorization to execute procedures. Current sources, specialist review and human approval remain necessary. Production authentication, unrestricted Exil execution, a live FAPI mesh, shared multiuser synchronization and always-on hosting are not claimed unless separately deployed and demonstrated.
