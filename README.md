# Exovia NeuroCanvas

**Ask. Verify. Trace. Replay.**

## Judges: start here

The fastest reproducible evaluation is documented in [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md).

ChatGPT App end-to-end check:

```bash
cd chatgpt-app
npm install
npm run judge
```

Expected final line:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
```

This path requires no API key, database or external AI service. It generates inspectable evidence, a portable Context Capsule, an importable NeuroCanvas map and a SHA-256 Proof Pack.

## Official links

- **Judge guide:** [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md)
- **ChatGPT App quickstart:** [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- **Official website:** https://exovia.wixsite.com/exovia-neurocanvas-1
- **Public build conversation:** https://chatgpt.com/share/6a5cddb2-6080-83e9-82b7-b4b5940dc1a8
- **Build journey and provenance:** [`docs/BUILD_JOURNEY_AND_PROVENANCE.md`](docs/BUILD_JOURNEY_AND_PROVENANCE.md)
- **Originality and adjacent-project review:** [`docs/ORIGINALITY_AND_DIFFERENTIATION.md`](docs/ORIGINALITY_AND_DIFFERENTIATION.md)
- **Android test APK:** https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk
- **Source repository:** https://github.com/ruminui/exovia-neurocanvas

## The problem

Teams increasingly work with documents, notes and AI-generated answers. The information becomes fragmented, and later it is difficult to prove:

- where an answer came from;
- which evidence supports it;
- whether the knowledge is incomplete or contradictory;
- what a human, workflow or AI agent changed;
- how a decision was reached;
- what context was lost between models and conversations;
- whether private data or malicious instructions entered an AI workflow.

## The solution

**Exovia NeuroCanvas turns scattered information and AI activity into a visual, evidence-linked workspace where every answer and decision can be verified and replayed.**

A user can import information, ask a question, navigate to the strongest answer, inspect the exact source, review knowledge quality and replay human or agent activity.

The ChatGPT App adds Exovia ProofLayer directly to a conversation. ChatGPT can scan an answer, preserve portable context, compare outputs, recommend a safer AI route, create a visual NeuroCanvas handoff and generate a verifiable Proof Pack.

## The Exovia innovation stack

Exovia is not differentiated by a generic graph alone. Its distinctive contribution is the combination of visual memory, compact activity, validated intent, capability routing and human-verifiable proof:

- **NeuroCanvas** — visual memory, exact evidence navigation, quality signals and replay;
- **ProofLayer** — AI-output reliability, portable context, privacy protection, comparison and SHA-256 proof artifacts;
- **ExiaL** — compact semantic pulses for observable agent and graph activity;
- **EXIR** — canonical validation between raw messages or intent and accepted graph events or mutations;
- **Exil** — constrained intent preview with policy checks and explicit human control;
- **FAPI** — capability discovery, routing, health, streaming and budget concepts behind controlled actions.

```text
Evidence and AI activity
          ↓
 ProofLayer + EXIR validation
          ↓
  NeuroCanvas visual memory
          ↓
 ExiaL replay + Exil preview
          ↓
 optional controlled FAPI route
          ↓
 evidence, approval and Proof Pack
```

The public architecture, implementation boundary and comparison with adjacent projects are documented in [`docs/FAPI_EXIAL_EXIL_INTEGRATION.md`](docs/FAPI_EXIAL_EXIL_INTEGRATION.md) and [`docs/ORIGINALITY_AND_DIFFERENTIATION.md`](docs/ORIGINALITY_AND_DIFFERENTIATION.md). No source code from the adjacent projects reviewed there is included in this repository.

## Who it is for

- consultants reviewing client or project information;
- researchers connecting conclusions to source material;
- teams using AI across documents and workflows;
- analysts who need an auditable decision trail;
- students or knowledge workers managing complex notes;
- people moving work between several models, agents or conversations.

## Why it is different from a normal AI chat

A chat gives an answer and quickly loses the surrounding process. NeuroCanvas keeps the answer inside a persistent visual project, linked to its evidence, quality signals, actors, actions and decisions.

```text
Scattered documents and AI activity
               ↓
       Exovia ProofLayer in ChatGPT
               ↓
 Verify → Preserve context → Compare
               ↓
       Visual NeuroCanvas handoff
               ↓
 Inspect evidence → Approve → Export proof
```

## ChatGPT App capabilities

The MCP server exposes six read-only and idempotent tools:

- `analyze_ai_output`;
- `create_context_capsule`;
- `create_neurocanvas_map`;
- `compare_ai_outputs`;
- `recommend_ai_route`;
- `build_proof_pack`.

The server does not persist submitted content, does not call another AI service and requires no OpenAI API key. ChatGPT supplies the conversational intelligence; Exovia supplies the deterministic reliability and human-review layer.

## Three-minute product flow

1. Press **New workspace**.
2. Select a node and show its exact source.
3. Open **Answer & Audit**.
4. Ask: `How does NeuroCanvas keep AI answers connected to evidence?`
5. Press **Navigate to Answer**.
6. Show **Knowledge Health** and one contradiction signal.
7. Show **Agent Replay**.
8. Open **Live room** and press **Project room into graph**.
9. Close with: **Navigate knowledge. Verify every answer. Replay every decision.**

The final narration and recording instructions are in [`docs/VIDEO_SCRIPT_MARCE.md`](docs/VIDEO_SCRIPT_MARCE.md).

## Start here

### ChatGPT App

```bash
cd chatgpt-app
npm install
npm run judge
```

Run the server manually with `npm start`, or use:

```bash
docker compose up --build
```

### Android

Download the current test build:

https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk

Android may ask permission to install apps from the browser or file manager. This is a test build distributed outside Google Play.

### Windows

1. Download the repository as ZIP.
2. Extract the complete folder.
3. Double-click `INICIAR_EXOVIA.bat`.

### macOS

```bash
chmod +x INICIAR_EXOVIA.command
./INICIAR_EXOVIA.command
```

### Linux

```bash
chmod +x INICIAR_EXOVIA.sh
./INICIAR_EXOVIA.sh
```

Universal product command:

```bash
npm start
```

Requirement for the main product: **Node.js 24 LTS or newer**. The ChatGPT App requires Node.js 22 or newer.

## Key capabilities

- text, Markdown, JSON, ExiaL and log import;
- persistent local workspaces, snapshots and export;
- neural, tree, pulse and capability views;
- Answer & Audit with navigation back to evidence;
- Evidence Inspector;
- Knowledge Health and Contradiction Radar;
- Human and Agent Replay;
- governed Living Evidence Room vertical slice;
- multimedia evidence, decisions and execution contracts;
- human approval represented in graph and replay;
- ChatGPT Apps SDK/MCP integration;
- portable Context Capsules;
- AI-output comparison and safe provider-neutral routing;
- downloadable AI-to-human NeuroCanvas maps;
- Proof Packs with SHA-256 integrity fingerprints;
- optional MCP and authenticated bridge;
- mobile/PWA interface and offline application shell;
- Android packaging through Capacitor;
- contextual floating help and simple mode;
- static, backend, browser, Android and MCP test suites;
- Docker, Compose and Codespaces judge paths.

## Living Evidence Rooms

The current local vertical slice represents humans, agents, workflows, multimedia evidence, decisions, approvals and ordered events, then projects the complete room into the active graph.

Real-time multiuser synchronization, shared remote browsers, workflow providers and live media transport remain roadmap integrations until deployed and tested.

Architecture and examples:

- [`docs/LIVE_COLLABORATION_ARCHITECTURE.md`](docs/LIVE_COLLABORATION_ARCHITECTURE.md)
- [`schemas/live-evidence-room.schema.json`](schemas/live-evidence-room.schema.json)
- [`examples/live-evidence-room.json`](examples/live-evidence-room.json)

## OpenAI Build Week submission readiness

The official submission materials are tracked in [`docs/BUILD_WEEK_COMPLIANCE.md`](docs/BUILD_WEEK_COMPLIANCE.md).

The full human-AI creation path, public conversation and implementation chronology are summarized in [`docs/BUILD_JOURNEY_AND_PROVENANCE.md`](docs/BUILD_JOURNEY_AND_PROVENANCE.md).

Required items include:

- clear project description;
- demo video;
- public code repository;
- authentic Codex `/feedback` Session ID from the primary build thread;
- selected challenge track;
- accurate disclosure of implemented versus roadmap capabilities;
- links that judges can open without requesting access;
- a reproducible path for judges to run and verify the project.

## Help and validation

- [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md)
- [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- [`LEEME_PRIMERO.txt`](LEEME_PRIMERO.txt)
- [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- [`docs/GUEST_HELPER_GUIDE.md`](docs/GUEST_HELPER_GUIDE.md)
- [`docs/TESTER_CHECKLIST.md`](docs/TESTER_CHECKLIST.md)
- [`docs/MARCE_GASTON_HELP_PLAN.md`](docs/MARCE_GASTON_HELP_PLAN.md)
- [`docs/VIDEO_SCRIPT_MARCE.md`](docs/VIDEO_SCRIPT_MARCE.md)

## Honest status

The local visual product, mobile interface, official website, governed Live Room vertical slice and ChatGPT App/MCP integration are implemented. Android packaging and automated deployment are configured. The ChatGPT App is prepared for local, Docker, Codespaces and public HTTPS deployment, but no always-on hosted MCP endpoint is claimed here. Features described as roadmap remain explicitly labeled as such. Final competition fields controlled by the owner should still be reviewed for accuracy, public accessibility and consistency before the editing deadline.
