# Judges: Start Here

Exovia NeuroCanvas can be evaluated through three independent paths. The fastest path requires no API key, account, database or external AI service.

## Path A — One-command automated verification

Requirement: Node.js 22 or newer.

From the repository root:

```bash
npm run judge
```

This command:

1. checks the public license, required files and judge/user guides;
2. validates the recorded Android release metadata and SHA-256;
3. installs the ChatGPT App dependencies;
4. starts the MCP server on a temporary local port;
5. connects with the official MCP client;
6. discovers all seven tools;
7. executes the deterministic reliability scenario;
8. audits every generated artifact for privacy, provenance, human control and integrity.

Expected final markers:

```text
EXOVIA JUDGE PREFLIGHT: PASS
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: 9+ files, ...
```

Generated files are written to `chatgpt-app/judge-output/`.

- Detailed ChatGPT App guide: [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- Acceptance criteria: [`docs/HACKATHON_JUDGE_EVIDENCE.md`](docs/HACKATHON_JUDGE_EVIDENCE.md)
- Judging-criteria map: [`docs/JUDGE_SCORECARD.md`](docs/JUDGE_SCORECARD.md)

## Path B — Try the complete human product

Requirement: Node.js 24 LTS or newer.

```bash
npm install
npm start
```

Open `http://127.0.0.1:8080` if the browser does not open automatically.

Recommended sequence:

1. Select **New workspace**.
2. Select a node and inspect its exact source.
3. Open **Answer & Audit**.
4. Ask: `How does NeuroCanvas keep AI answers connected to evidence?`
5. Select **Navigate to answer**.
6. Open **Knowledge health** and **Agent replay**.
7. Run Path A, then import the generated `.exo` file from `chatgpt-app/judge-output/`.
8. Inspect one source, one constraint and one prohibited action.
9. Export the workspace.

First-time user guide: [`USER_START_HERE.md`](USER_START_HERE.md)

## Path C — Android test build

Verified APK:

`https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`

Published SHA-256 file:

`https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk.sha256`

Machine-readable verification record:

[`release-metadata/android-latest.json`](release-metadata/android-latest.json)

The Android workflow builds the APK, publishes it, downloads the published assets again, byte-compares them and verifies SHA-256 before marking the release verified.

Android may ask permission to install a test application from the browser or file manager. No Google Play account is required.

## Optional Docker path

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

The status page lists the seven tools and their safety boundaries.

## What to inspect after Path A

- `trust-scan.json` — evidence, privacy, prompt-injection, context and control findings;
- `context-capsule.md` — portable evidence, uncertainty and approval rules;
- generated `.exo` — source/chunk IDs, procedures, constraints, untrusted-source policy and SHA-256;
- `comparison.json` — **Controlled pilot** must rank above **Fast launch**;
- NeuroCanvas JSON — importable visual AI-to-human handoff;
- `proof-pack.json` — evidence manifest, governance and integrity fingerprint.

## Real ChatGPT Developer Mode

To render the black-and-gold widget inside ChatGPT, expose the running MCP server through a public HTTPS URL and connect the URL ending in `/mcp` from ChatGPT Developer Mode.

The server is keyless: it does not call another AI service, install generated capabilities, retain submitted content or execute external actions.

## Troubleshooting

### `npm run judge` reports an old Node version

Use Node.js 22 or newer for Path A. Use Node.js 24 LTS or newer for the complete human product.

### Port already in use

```bash
cd chatgpt-app
JUDGE_PORT=8791 npm run judge
```

### Browser does not open

Start the product with `npm start` and open `http://127.0.0.1:8080` manually.

### Android download is blocked by the browser

Open the repository release named `android-latest`, download the APK asset and compare it with the published `.sha256` file.

## Implemented and testable

- local visual evidence workspace and Android package;
- seven deterministic read-only MCP tools;
- evidence/privacy/context/control analysis;
- sensitive-value replacement in exported artifacts;
- portable Context Capsule;
- source-linked `.exo` package with progressive disclosure;
- EXO import into the human NeuroCanvas graph;
- evidence-bounded answer comparison;
- provider-neutral route recommendation;
- AI-to-human NeuroCanvas map handoff;
- EXO and Proof Pack SHA-256 fingerprints;
- local, Docker and Codespaces paths;
- automated unit, static, browser, MCP, artifact, container and Android validation.

## Honest boundaries

Analysis, extraction, ranking and context-reduction figures are heuristics. Imported source instructions are untrusted data, not executable authority. Current claims still require authoritative sources, source rights are not verified automatically and consequential actions require human approval. Production authentication, unrestricted Exil execution, a live distributed FAPI mesh, production multiuser synchronization and always-on MCP hosting are not claimed unless separately deployed and demonstrated.
