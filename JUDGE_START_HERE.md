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
6. discovers all eight tools;
7. executes the deterministic reliability and Assurance Council scenario;
8. audits every generated artifact for privacy, provenance, visible dissent, human control and integrity.

Expected final markers:

```text
EXOVIA JUDGE PREFLIGHT: PASS
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: 11+ files, ...
```

Generated files are written to `chatgpt-app/judge-output/`.

- Detailed ChatGPT App guide: [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- Assurance Council architecture: [`docs/EXOVIA_ASSURANCE_COUNCIL.md`](docs/EXOVIA_ASSURANCE_COUNCIL.md)
- Acceptance criteria: [`docs/HACKATHON_JUDGE_EVIDENCE.md`](docs/HACKATHON_JUDGE_EVIDENCE.md)
- Judging-criteria map: [`docs/JUDGE_SCORECARD.md`](docs/JUDGE_SCORECARD.md)

## Path B — Try the complete human product

Requirement: Node.js 24 LTS or newer.

```bash
npm install
npm start
```

Open `http://127.0.0.1:8080` if the browser does not open automatically.

### Fast comprehension test

1. Select **Try a 60-second example**.
2. Confirm the application loads a deliberately risky AI answer.
3. Confirm **Check AI** opens automatically.
4. Inspect the unsupported claim, private data, demonstration credential and suspicious instruction.
5. Open **Save context** and confirm the useful facts, sources, risks and approval rules remain connected.

### Test with your own information

The visible first-run model is:

```text
Add → Check → Save
```

1. Select **Use my own information**.
2. Paste a short AI answer together with its original question and one source.
3. Select **Create project**.
4. Select one idea in the map and inspect the original information.
5. Select **Check AI**.
6. Select **Save context**.
7. Select **Save / Share** and confirm a portable copy downloads.
8. Select **More options** only when inspecting advanced replay, EXO, ExiaL, EXIR, Exil or FAPI capabilities.
9. Run Path A, then import the generated `.exo` and Assurance Council NeuroCanvas map from `chatgpt-app/judge-output/`.
10. Inspect one source, one blocking role and one role-to-role handoff.

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

Android navigation uses five plain destinations:

- **Home / Inicio** — explanation and starting actions;
- **Canvas / Lienzo** — visual information map;
- **Verify / Verificar** — AI check;
- **Context / Contexto** — reusable context;
- **More / Más** — project, evidence, help and advanced capabilities.

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

The status page lists the eight tools and their safety boundaries.

## What to inspect after Path A

- `trust-scan.json` — evidence, privacy, prompt-injection, context and control findings;
- `context-capsule.md` — portable evidence, uncertainty and approval rules;
- generated `.exo` — source/chunk IDs, procedures, constraints, untrusted-source policy and SHA-256;
- `comparison.json` — **Controlled pilot** must rank above **Fast launch**;
- `assurance-council.json` — twelve roles, blocked unsafe verdict, visible dissent, prioritized actions, ExiaL pulses, EXIR events and SHA-256;
- Assurance Council NeuroCanvas JSON — visual map of roles and handoffs;
- general NeuroCanvas JSON — importable visual AI-to-human handoff;
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

- clean three-step first-run flow and 60-second example;
- Simple View with larger touch targets and advanced controls behind **More options**;
- local visual evidence workspace and Android package;
- eight deterministic read-only MCP tools;
- evidence/privacy/context/control analysis;
- sensitive-value replacement in exported artifacts;
- portable Context Capsule;
- source-linked `.exo` package with progressive disclosure;
- EXO import into the human NeuroCanvas graph;
- evidence-bounded answer comparison;
- provider-neutral route recommendation;
- twelve-lens Assurance Council with visible dissent;
- eleven ExiaL handoff pulses and eleven canonical EXIR events;
- Assurance Council NeuroCanvas map handoff;
- general AI-to-human NeuroCanvas map handoff;
- EXO, Council and Proof Pack SHA-256 fingerprints;
- local, Docker and Codespaces paths;
- automated unit, static, browser, MCP, artifact, container and Android validation.

## Honest boundaries

Analysis, extraction, ranking, role review and context-reduction figures are heuristics. The Assurance Council is a deterministic set of twelve review lenses, not twelve independent models or autonomous consensus. Imported source instructions are untrusted data, not executable authority. Current claims still require authoritative sources, source rights are not verified automatically and consequential actions require human approval. Production authentication, unrestricted Exil execution, a live distributed FAPI mesh, production multiuser synchronization and always-on MCP hosting are not claimed unless separately deployed and demonstrated.
