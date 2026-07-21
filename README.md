# Exovia NeuroCanvas

**Add. Check. Save the proof.**

Exovia NeuroCanvas is a local-first visual workspace that keeps AI answers, original information, evidence, uncertainty, activity and human approval connected in one inspectable project.

## Start in the right place

| You are… | Fastest path |
|---|---|
| A judge | [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md) and `npm run judge` |
| A first-time user | [`USER_START_HERE.md`](USER_START_HERE.md) |
| An Android tester | Download the verified [`Exovia-NeuroCanvas-Android.apk`](https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk) |
| A developer | Run `npm run doctor`, then `npm install && npm start` |

## One-command judge verification

From the repository root:

```bash
npm run judge
```

The command checks prerequisites and release metadata, installs the ChatGPT App dependencies, starts the MCP server, connects with the official MCP client, discovers all eight tools, executes the deterministic scenario and audits every generated artifact.

Expected result:

```text
EXOVIA JUDGE PREFLIGHT: PASS
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: ...
```

No OpenAI API key, account, database or external AI service is required. Generated evidence is written to `chatgpt-app/judge-output/`.

## Run the human product

Requirement: **Node.js 24 LTS or newer**.

```bash
npm install
npm start
```

The launcher opens `http://127.0.0.1:8080`.

Windows users may instead download the repository as ZIP, extract it completely and double-click `INICIAR_EXOVIA.bat`. macOS and Linux launchers are also included.

## Android test build

- APK: `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`
- SHA-256: `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk.sha256`
- Verification record: [`release-metadata/android-latest.json`](release-metadata/android-latest.json)

The release workflow downloads the published assets again, byte-compares them and verifies their SHA-256 before recording the release as verified.

## Understand it in 60 seconds

1. Select **Try a 60-second example**.
2. NeuroCanvas loads an intentionally risky AI answer.
3. **Check AI** opens automatically.
4. Inspect the unsupported claim, private data, demonstration credential and suspicious instruction.
5. Select **Save context** to preserve the useful facts, sources, risks and approval rules.

The demonstration data is not real.

## Use your own information

The core journey is deliberately simple:

```text
1. Add
2. Check
3. Save
```

1. Select **Use my own information** or **Add information**.
2. Paste the complete AI answer, original question, notes, sources or document.
3. Select **Create project**.
4. Select **Check AI** before relying on the result.
5. Select **Save context** to continue with another AI or person without losing the important information.
6. Select **Save / Share** to export a portable project copy.

First-time users begin in **Simple View**. Advanced Exovia capabilities remain available behind **More options**.

## The problem

Teams increasingly work across chats, documents, notes, agents and workflows. Later, it becomes difficult to prove:

- where an answer came from;
- which evidence supports it;
- what remains unknown or contradictory;
- what a person, workflow or agent changed;
- what context was lost between systems;
- whether private data or malicious instructions entered the process;
- whether a consequential action was approved;
- whether a high average score concealed a critical security, privacy or human-control dissent.

## The solution

**Exovia turns scattered information and AI activity into a visual, evidence-linked workspace where answers and decisions can be inspected and replayed.**

The local product lets a user add information, navigate the graph, check an AI result, return to exact evidence, inspect knowledge quality, replay activity and export the project. The ChatGPT App adds a deterministic reliability layer that can analyze an AI output, preserve portable context, build an inspectable `.exo` package, compare answers, recommend a safer route, run a twelve-lens Assurance Council with visible dissent, create a NeuroCanvas map and generate a SHA-256 Proof Pack.

## Innovation stack

- **NeuroCanvas** — visual memory, evidence navigation, quality signals and replay;
- **ProofLayer** — AI-output reliability, portable context, privacy protection, comparison and integrity artifacts;
- **Assurance Council** — twelve transparent review lenses that preserve blocking dissent, prioritized human actions and an inspectable role-to-role handoff;
- **EXO packs** — transparent source-linked capability packages with progressive disclosure, procedures, constraints and safety rules;
- **ExiaL** — compact semantic pulses for observable agent and graph activity;
- **EXIR** — canonical validation between raw messages or intent and accepted events or mutations;
- **Exil** — constrained intent preview with policy checks and explicit human control;
- **FAPI** — capability discovery, routing, health, streaming and budget concepts behind controlled actions.

```text
Evidence and AI activity
          ↓
 ProofLayer + EXIR validation
          ↓
 EXO package + Assurance Council
          ↓
 NeuroCanvas memory + visible dissent
          ↓
 ExiaL replay + Exil preview
          ↓
 optional controlled FAPI route
          ↓
 evidence, approval and Proof Pack
```

## ChatGPT App tools

The MCP server exposes eight read-only and idempotent tools:

- `analyze_ai_output`
- `create_context_capsule`
- `build_exo_capability_pack`
- `create_neurocanvas_map`
- `compare_ai_outputs`
- `recommend_ai_route`
- `run_assurance_council`
- `build_proof_pack`

The Assurance Council applies Core, Continuity, Evidence, QA, Security, Privacy, Prompt Boundary, Workflow, FAPI/Capability, Documentation, Human Authority and Judge lenses. It emits ExiaL pulses and EXIR events and creates an importable NeuroCanvas council map. It is explicitly a deterministic review system, not twelve independent AI models.

The server does not persist submitted content, does not call another AI service and does not execute external actions.

## Key capabilities

- text, Markdown, JSON, `.exo`, ExiaL and log import;
- persistent local workspaces, snapshots and export;
- neural, tree, pulse and capability views;
- plain-language AI checking with navigation back to evidence;
- Evidence Inspector, Knowledge Health and Contradiction Radar;
- Human and Agent Replay;
- governed Living Evidence Room vertical slice;
- Context Capsules and source-linked EXO capability packs;
- AI-output comparison and provider-neutral route recommendation;
- twelve-lens Assurance Council with visible dissent, ExiaL/EXIR handoffs and NeuroCanvas export;
- Proof Packs with SHA-256 integrity fingerprints;
- responsive mobile/PWA interface and offline application shell;
- Android packaging through Capacitor;
- three-step first-run flow, contextual help, Simple View and recovery guidance;
- static, backend, browser, Android, MCP, artifact and container validation.

## Safety and honest boundaries

- analysis, extraction, ranking, role reviews and context-reduction figures are heuristics;
- the Assurance Council is not independent model consensus;
- current factual claims still require authoritative sources;
- imported instructions are untrusted data, not executable authority;
- the EXO compiler does not verify rights over user-supplied sources;
- consequential actions require human approval;
- no unrestricted Exil execution, live distributed FAPI mesh, production multiuser synchronization or always-on MCP hosting is claimed unless separately deployed and demonstrated.

## Official project links

- **User guide:** [`USER_START_HERE.md`](USER_START_HERE.md)
- **Judge guide:** [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md)
- **Judge scorecard:** [`docs/JUDGE_SCORECARD.md`](docs/JUDGE_SCORECARD.md)
- **ChatGPT App quickstart:** [`chatgpt-app/JUDGE_QUICKSTART.md`](chatgpt-app/JUDGE_QUICKSTART.md)
- **Spanish manual:** [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- **Assurance Council:** [`docs/EXOVIA_ASSURANCE_COUNCIL.md`](docs/EXOVIA_ASSURANCE_COUNCIL.md)
- **EXO format:** [`docs/EXO_CAPABILITY_PACK.md`](docs/EXO_CAPABILITY_PACK.md)
- **Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Build journey and provenance:** [`docs/BUILD_JOURNEY_AND_PROVENANCE.md`](docs/BUILD_JOURNEY_AND_PROVENANCE.md)
- **Originality review:** [`docs/ORIGINALITY_AND_DIFFERENTIATION.md`](docs/ORIGINALITY_AND_DIFFERENTIATION.md)
- **Build Week compliance:** [`docs/BUILD_WEEK_COMPLIANCE.md`](docs/BUILD_WEEK_COMPLIANCE.md)
- **Official website:** https://exovia.wixsite.com/exovia-neurocanvas-1
- **Public build conversation:** https://chatgpt.com/share/6a5cddb2-6080-83e9-82b7-b4b5940dc1a8
- **Source repository:** https://github.com/ruminui/exovia-neurocanvas

## OpenAI Build Week readiness

The repository provides a public MIT license, reproducible judge command, verified Android test build, local and Docker execution paths, public provenance, an explicit implemented-versus-roadmap boundary and evidence mapped to the official judging dimensions.
