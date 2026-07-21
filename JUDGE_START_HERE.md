# Judges: Start Here

Exovia NeuroCanvas can be evaluated in three independent ways. No private credentials are required.

## Path A — Verify the ChatGPT App automatically

```bash
cd chatgpt-app
npm install
npm run judge
```

This starts the MCP server, connects with the official MCP client, discovers all six tools, runs the complete reliability scenario and creates inspectable artifacts under `chatgpt-app/judge-output/`.

Expected final lines:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: 8 files, no sensitive demo values, evidence-bounded winner and valid SHA-256.
```

- Full instructions: [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- Verified acceptance criteria and latest representative output: [`docs/HACKATHON_JUDGE_EVIDENCE.md`](docs/HACKATHON_JUDGE_EVIDENCE.md)

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

Opening `http://localhost:8787/` in a browser shows the professional server status page and the six available tools.

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
2. Inspect `trust-scan.json`: it detects evidence gaps, the unsupported 40 percent claim, absolute wording, personal/credential data and prompt injection while redacting sensitive values from its output.
3. Inspect `context-capsule.md`: it preserves evidence, uncertainty and approval rules, with sensitive values replaced.
4. Inspect `comparison.json`: **Controlled pilot** must rank above **Fast launch** because it is bounded by evidence and preserves human review.
5. Open the generated NeuroCanvas JSON in the web or Android app.
6. Inspect `proof-pack.json`, its redaction record and SHA-256 integrity fingerprint.
7. Optionally connect the MCP server to ChatGPT to see the interactive widget and natural-language tool selection.

## What is implemented

- ChatGPT Apps SDK/MCP server and inline widget;
- six deterministic, read-only tools;
- evidence/privacy/context/control scan;
- unsupported-number and overconfidence detection;
- automatic sensitive-value redaction in Trust Scans, Context Capsules and Proof Packs;
- portable Context Capsule;
- evidence-bounded AI-output comparison;
- safe provider-neutral routing;
- AI-to-human NeuroCanvas map handoff;
- verifiable Proof Pack with SHA-256;
- local web/PWA and Android product;
- automated unit, static, browser, MCP, artifact-privacy and container validation;
- Docker, Codespaces and local execution paths;
- ChatGPT App submission metadata with five positive and three negative review tests.

## Honest boundaries

The reliability scan and ranking are heuristics. They expose risk and missing evidence but do not replace current authoritative sources, professional review or human approval. Production authentication, shared multiuser synchronization and always-on hosting are not claimed unless separately deployed and demonstrated.
