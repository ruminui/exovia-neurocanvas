# OpenAI Build Week — Judge Scorecard for Exovia NeuroCanvas

This document maps the reproducible project evidence to the official judging dimensions. It is a navigation aid, not a claim that the project will receive any particular score.

Official rules: `https://openai.devpost.com/rules`

## Baseline viability

| Requirement | Reproducible evidence |
|---|---|
| Working, non-trivial project | Run `npm run judge` from the repository root and receive `EXOVIA HACKATHON JUDGE CHECK: PASS`. |
| Built with Codex and GPT-5.6 during Build Week | Review `docs/BUILD_JOURNEY_AND_PROVENANCE.md`, the public build conversation and dated commits. |
| Public test access | Use the verified Android APK, run the local product, or run the keyless MCP judge flow. |
| Relevant public license | Root project and ChatGPT App declare MIT; see `LICENSE`. |

## 1. Technological implementation

### What to inspect

- a real MCP server using the official MCP client in the judge check;
- seven read-only, idempotent ChatGPT tools;
- deterministic evidence, privacy, context and control analysis;
- Context Capsule, EXO capability pack, NeuroCanvas map and Proof Pack generation;
- exact source and chunk IDs, redaction records and SHA-256 integrity;
- local browser product, IndexedDB persistence and Android packaging;
- automated unit, static, browser, MCP, artifact, container and Android checks.

### Fast proof

```bash
npm run judge
```

Then inspect `chatgpt-app/judge-output/`.

## 2. Design and complete product experience

### What to inspect

1. Open the local or Android product.
2. Select **New workspace**.
3. Select a node and inspect its source.
4. Ask a question in **Answer & Audit**.
5. Navigate from the answer back to evidence.
6. Open **Knowledge health** and **Agent replay**.
7. Import the generated `.exo` package and inspect sources, procedures, constraints and safety rules as a graph.
8. Export a portable project.

The product includes a black-and-gold visual system, responsive mobile layout, simple mode, contextual help, empty-state guidance and local recovery.

## 3. Potential impact

### Problem addressed

AI work is often split across chats, documents, agents and tools. Later, people cannot reliably recover the evidence, uncertainty, approvals or activity that produced a decision.

### Specific audiences

- consultants and analysts reviewing client evidence;
- researchers connecting conclusions to sources;
- teams moving work between multiple AI systems;
- developers and operators reviewing agent activity;
- students and knowledge workers managing complex notes.

### Demonstrated outcome

Exovia preserves the answer, exact evidence, privacy findings, unknowns, actor activity, approval rules and integrity proof in a reusable human-controlled workspace.

## 4. Quality and originality of the idea

The differentiator is the combined workflow rather than a generic graph or chat interface:

```text
AI conversation or source material
              ↓
ProofLayer reliability analysis
              ↓
portable Context Capsule or EXO package
              ↓
NeuroCanvas visual evidence workspace
              ↓
ExiaL replay + constrained Exil preview
              ↓
human approval + SHA-256 Proof Pack
```

The originality boundary and comparison with adjacent products are documented in `docs/ORIGINALITY_AND_DIFFERENTIATION.md`. No source code, prompts, assets or documentation from the adjacent projects reviewed there are included.

## Recommended judge path — under five minutes

1. Run `npm run judge`.
2. Confirm the PASS marker.
3. Open `trust-scan.json`, the generated `.exo`, `comparison.json` and `proof-pack.json`.
4. Run `npm install && npm start` or install the verified APK.
5. Import the generated `.exo` file.
6. Select one source, one constraint and one prohibited action.
7. Close by exporting the project.

## Honest boundaries

- analysis, extraction, ranking and context-reduction figures are heuristics;
- current factual claims still require authoritative sources;
- imported instructions are untrusted data, not executable authority;
- source rights are not verified automatically by the compiler;
- consequential actions require human approval;
- production authentication, unrestricted Exil execution, a live distributed FAPI mesh, production multiuser synchronization and always-on hosting are not claimed unless separately deployed and demonstrated.

## Submission-owner final checks

Before the deadline, confirm on Devpost:

- the project is submitted, not only saved as a draft;
- the selected category matches the project;
- the description clearly explains the problem, solution and Codex/GPT-5.6 work;
- the public YouTube demonstration is under three minutes and includes audio;
- the video contains no unlicensed music, third-party trademarks or copyrighted material;
- the repository URL, website URL and testing instructions open without requesting access;
- the authentic Codex `/feedback` Session ID is entered where requested;
- the testing build remains free and accessible throughout judging.
