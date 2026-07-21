# Exovia NeuroCanvas — Final Devpost Submission Copy

This document is ready to paste into Devpost. Replace only fields marked `OWNER ACTION`.

## Project name

**Exovia NeuroCanvas — The Reliability Layer Around Every AI**

## One-line tagline

**A local-first visual workspace that preserves AI context, verifies evidence, exposes dissent and keeps consequential decisions under human control.**

## Short description

Exovia NeuroCanvas turns AI answers, documents, agent activity and human decisions into an inspectable evidence graph. Its ChatGPT App adds eight read-only reliability tools for risk analysis, portable context, source-linked `.exo` capability packs, answer comparison, safe model routing, a twelve-lens Assurance Council, visual NeuroCanvas handoff and SHA-256 Proof Packs.

## Project story / About the project

### Inspiration

AI systems are becoming more capable, but the surrounding work remains fragmented. Important facts disappear between chats. Answers lose their sources. Private data crosses model boundaries. Agents act without a durable explanation. A single confidence score can hide a critical security, privacy or accountability objection.

We wanted to build something different from another chatbot: a reliability, memory and human-governance layer that can surround any AI.

### What it does

Exovia NeuroCanvas provides two connected experiences.

**For humans**, NeuroCanvas is a local-first visual workspace. A user can import documents, conversations, JSON, logs, ExiaL pulses and `.exo` packages; navigate a neural or tree graph; inspect exact evidence; ask questions; review knowledge health and contradictions; replay human or agent activity; preserve decisions; and export the project.

**For ChatGPT and other AI systems**, Exovia ProofLayer is an Apps SDK/MCP server with eight read-only tools:

1. `analyze_ai_output` — finds evidence gaps, unsupported numbers, privacy risk, prompt injection and missing human control.
2. `create_context_capsule` — preserves verified facts, sources, uncertainty, constraints and continuation rules across models or teams.
3. `build_exo_capability_pack` — compiles authorized source material into a transparent `.exo` package with provenance, on-demand chunks, procedures, constraints, privacy redaction and SHA-256 integrity.
4. `create_neurocanvas_map` — converts AI work into an importable visual graph for human review.
5. `compare_ai_outputs` — compares answers against the same question and evidence using a transparent heuristic.
6. `recommend_ai_route` — recommends a provider-neutral local, hybrid or cloud route based on sensitivity and consequence.
7. `run_assurance_council` — reviews consequential work through twelve transparent lenses while preserving blocking dissent.
8. `build_proof_pack` — creates a durable evidence and governance artifact with a SHA-256 fingerprint.

### The Exovia Assurance Council

The Council is the newest extension of our earlier Exovia agent-network research. It reviews a proposal through Core, Continuity, Evidence, QA, Security, Privacy, Prompt Boundary, Workflow, FAPI/Capability, Documentation, Human Authority and Judge lenses.

It is intentionally **not** presented as twelve independent AI models. It is a deterministic, inspectable review system. A Security, Privacy or Human Authority block remains visible even when the average score is high.

The Council produces:

- a bounded `ready`, `conditional` or `blocked` verdict;
- every blocking role and dissenting recommendation;
- prioritized human actions;
- eleven ExiaL role-to-role handoff pulses;
- eleven canonical EXIR events;
- a provider-neutral safe route;
- a SHA-256 integrity fingerprint;
- an importable NeuroCanvas council map;
- explicit confirmation that no external action was executed and human approval is still required.

### How we built it

The human product uses JavaScript, HTML, CSS, Canvas, IndexedDB, Playwright and Capacitor for the Android build. The ChatGPT App uses Node.js, Express, the official Model Context Protocol SDK, the OpenAI Apps SDK extension package and Zod.

Codex and GPT-5.6 were used during Build Week to design, implement, test, debug, document and package major new capabilities, including ProofLayer, the ChatGPT App, Android distribution, `.exo` capability packs, privacy-safe artifact generation, reproducible judge flows and the Assurance Council.

The server does not call another AI API, does not require an OpenAI API key and does not persist submitted content. ChatGPT supplies conversational intelligence; Exovia supplies deterministic reliability and human-review structure.

### Challenges

The hardest problem was not generating another answer. It was keeping evidence, uncertainty, privacy, intent, agent activity and human authority connected across different systems.

We also had to avoid false confidence in our own reliability layer. We therefore made the system expose its limitations, preserve dissent, distinguish source instructions from executable authority and fail the automated judge scenario whenever sensitive values leak or an unsupported overconfident answer wins.

### Accomplishments

- One-command keyless judge verification with the official MCP client.
- Eight read-only and idempotent ChatGPT tools.
- A local-first visual evidence workspace and Android test build.
- Source-linked `.exo` capability packages with progressive disclosure.
- Sensitive-value redaction across Trust Scans, Context Capsules, EXO packs, Council reports, ExiaL/EXIR events, NeuroCanvas handoffs and Proof Packs.
- Evidence-bounded answer comparison that penalizes unsupported numbers and absolute language.
- Twelve-lens Assurance Council with visible blocking dissent.
- SHA-256 integrity for EXO, Council and Proof Pack artifacts.
- Reproducible Node.js, Docker and Codespaces evaluation paths.

### What we learned

A reliable AI product needs more than a strong model. It needs continuity, provenance, privacy boundaries, explicit uncertainty, reversible workflows and accountable human decisions.

We also learned that consensus is not always safety. A minority Security or Privacy finding may matter more than an average score. Exovia therefore treats dissent as evidence rather than noise.

### What is next

- explicit output schemas for public ChatGPT App directory review;
- optional authenticated production deployment;
- broader source adapters and code-evidence import;
- measured performance and token benchmarks;
- production multiuser synchronization for Living Evidence Rooms;
- a controlled FAPI capability mesh behind policy and approval boundaries;
- more accessibility and cross-device usability testing.

These roadmap items are not presented as completed features in this submission.

## Why it is different

Most AI products optimize the answer. Exovia preserves the full path around the answer:

```text
source material and AI activity
              ↓
ProofLayer reliability analysis
              ↓
Context Capsule or source-linked EXO package
              ↓
Assurance Council with visible dissent
              ↓
NeuroCanvas visual human review
              ↓
ExiaL replay + EXIR validation + Exil preview
              ↓
human approval + SHA-256 Proof Pack
```

The distinctive contribution is the combination of:

- **NeuroCanvas** visual evidence memory;
- **ProofLayer** deterministic AI reliability;
- **EXO** portable source-linked capabilities;
- **Assurance Council** visible specialist dissent;
- **ExiaL** observable activity pulses;
- **EXIR** canonical validation events;
- **Exil** constrained intent preview;
- **FAPI** provider-neutral capability routing concepts;
- accountable human approval.

## How judges can test it

### Fastest path — no key or account

```bash
git clone https://github.com/ruminui/exovia-neurocanvas.git
cd exovia-neurocanvas
npm run judge
```

Expected markers:

```text
EXOVIA JUDGE PREFLIGHT: PASS
EXOVIA HACKATHON JUDGE CHECK: PASS
Judge artifact audit passed: ...
```

The command installs the ChatGPT App dependencies, starts the MCP server, connects with the official MCP client, discovers all eight tools, runs the deterministic scenario and audits every generated artifact.

Inspect:

- `chatgpt-app/judge-output/trust-scan.json`
- generated `.exo`
- `comparison.json`
- `assurance-council.json`
- generated Assurance Council NeuroCanvas map
- `proof-pack.json`

The unsafe demonstration must remain `blocked`, the evidence-bounded **Controlled pilot** must rank above **Fast launch**, and no generated artifact may contain the demonstration email or credential.

### Human product

```bash
npm install
npm start
```

Open `http://127.0.0.1:8080`, create a workspace, inspect exact evidence, open Answer & Audit, review Knowledge Health and Agent Replay, then import the generated `.exo` and Assurance Council map.

### Android

APK:

`https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`

SHA-256:

`https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk.sha256`

## Built with

- OpenAI Apps SDK
- Model Context Protocol SDK
- Codex
- GPT-5.6
- Node.js
- Express
- Zod
- JavaScript
- HTML/CSS Canvas
- IndexedDB
- Playwright
- Capacitor / Android
- Docker
- GitHub Actions

## Public links

- Repository: `https://github.com/ruminui/exovia-neurocanvas`
- Judge guide: `https://github.com/ruminui/exovia-neurocanvas/blob/main/JUDGE_START_HERE.md`
- Website: `https://exovia.wixsite.com/exovia-neurocanvas-1`
- Android APK: `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`
- Public build conversation: `https://chatgpt.com/share/6a5cddb2-6080-83e9-82b7-b4b5940dc1a8`
- Demo video: `OWNER ACTION — paste the public or unlisted YouTube URL`
- Codex feedback Session ID: `OWNER ACTION — paste the authentic /feedback Session ID`

## Final owner checklist

- [ ] Submission status says submitted, not draft.
- [ ] Demo video URL opens without login and is under the competition limit.
- [ ] Repository, website, APK and judge guide open in an incognito browser.
- [ ] Selected category matches the submitted project.
- [ ] Codex `/feedback` Session ID is authentic and entered exactly.
- [ ] No roadmap item is described as implemented.
- [ ] Video and screenshots contain no unlicensed music or third-party assets.
- [ ] Testing build remains free and available throughout judging.
