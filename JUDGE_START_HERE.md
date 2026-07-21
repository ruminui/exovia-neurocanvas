# Judges: Start Here

Exovia NeuroCanvas can be evaluated in three independent ways. No private credentials are required.

## Path A — Verify the ChatGPT App automatically

```bash
cd chatgpt-app
npm install
npm run judge
```

This starts the MCP server, performs the protocol handshake, discovers all six tools, runs the complete reliability scenario and creates inspectable artifacts under `chatgpt-app/judge-output/`.

Expected final line:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
```

Full instructions: [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)

## Path B — Run the ChatGPT App with Docker

```bash
cd chatgpt-app
docker compose up --build
```

Health endpoint:

```text
http://localhost:8787/health
```

MCP endpoint:

```text
http://localhost:8787/mcp
```

## Path C — Try the human NeuroCanvas product

### Web/local

```bash
npm install
npm start
```

Open the local URL printed by the launcher. Import the generated `neurocanvas-v3` JSON map from `chatgpt-app/judge-output/` to inspect the AI-to-human handoff.

### Android

Download the current test APK:

https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk

## Real ChatGPT Developer Mode

To render the black-and-gold widget inside ChatGPT, expose the running MCP server through a public HTTPS URL and connect the URL ending in `/mcp` from ChatGPT Developer Mode.

The server itself is keyless: it does not call an external AI API and does not persist submitted content.

## Suggested evaluation sequence

1. Run `npm run judge` in `chatgpt-app`.
2. Inspect `trust-scan.json`: it should detect unsupported claims, personal/credential data and prompt injection.
3. Inspect `context-capsule.md`: it should preserve evidence, uncertainty and approval rules.
4. Open the generated NeuroCanvas JSON in the web or Android app.
5. Inspect `proof-pack.json` and its SHA-256 integrity fingerprint.
6. Optionally connect the MCP server to ChatGPT to see the interactive widget and natural-language tool selection.

## What is implemented

- ChatGPT Apps SDK/MCP server and inline widget;
- six deterministic, read-only tools;
- evidence/privacy/context/control scan;
- portable context capsule;
- AI-output comparison;
- safe provider-neutral routing;
- AI-to-human NeuroCanvas map handoff;
- verifiable Proof Pack with SHA-256;
- local web/PWA and Android product;
- automated unit, static, browser and MCP validation;
- Docker, Codespaces and local execution paths.

## Honest boundaries

The reliability scan and ranking are heuristics. They expose risk and missing evidence but do not replace current authoritative sources, professional review or human approval. Production authentication, shared multiuser synchronization and always-on hosting are not claimed unless separately deployed and demonstrated.
