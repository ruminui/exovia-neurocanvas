# Exovia NeuroCanvas

**Ask. Verify. Trace. Replay.**

## The problem

Teams increasingly work with documents, notes and AI-generated answers. The information becomes fragmented, and later it is difficult to prove:

- where an answer came from;
- which evidence supports it;
- whether the knowledge is incomplete or contradictory;
- what a human, workflow or AI agent changed;
- how a decision was reached.

## The solution

**Exovia NeuroCanvas turns scattered information and AI activity into a visual, evidence-linked workspace where every answer and decision can be verified and replayed.**

A user can import information, ask a question, navigate to the strongest answer, inspect the exact source, review knowledge quality and replay human or agent activity.

## Who it is for

- consultants reviewing client or project information;
- researchers connecting conclusions to source material;
- teams using AI across documents and workflows;
- analysts who need an auditable decision trail;
- students or knowledge workers managing complex notes.

## Why it is different from a normal AI chat

A chat gives an answer and quickly loses the surrounding process. NeuroCanvas keeps the answer inside a persistent visual project, linked to its evidence, quality signals, actors, actions and decisions.

```text
Scattered documents and AI activity
               ↓
       Visual knowledge graph
               ↓
 Ask → Navigate → Inspect evidence
               ↓
Check quality → Replay decisions
```

## Three-minute judge flow

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

Universal command:

```bash
npm start
```

Requirement: **Node.js 24 LTS or newer**.

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
- optional MCP and authenticated bridge;
- mobile/PWA interface and offline application shell;
- static, backend and browser test suites.

## Living Evidence Rooms

The current local vertical slice represents humans, agents, workflows, multimedia evidence, decisions, approvals and ordered events, then projects the complete room into the active graph.

Real-time multiuser synchronization, shared remote browsers, workflow providers and live media transport remain roadmap integrations until deployed and tested.

Architecture and examples:

- [`docs/LIVE_COLLABORATION_ARCHITECTURE.md`](docs/LIVE_COLLABORATION_ARCHITECTURE.md)
- [`schemas/live-evidence-room.schema.json`](schemas/live-evidence-room.schema.json)
- [`examples/live-evidence-room.json`](examples/live-evidence-room.json)

## Help and validation

- [`LEEME_PRIMERO.txt`](LEEME_PRIMERO.txt)
- [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- [`docs/GUEST_HELPER_GUIDE.md`](docs/GUEST_HELPER_GUIDE.md)
- [`docs/TESTER_CHECKLIST.md`](docs/TESTER_CHECKLIST.md)
- [`docs/MARCE_GASTON_HELP_PLAN.md`](docs/MARCE_GASTON_HELP_PLAN.md)
- [`docs/VIDEO_SCRIPT_MARCE.md`](docs/VIDEO_SCRIPT_MARCE.md)

## Honest status

The local visual product and governed Live Room vertical slice are implemented. Full automated execution, external System Check, public deployment, final video and authentic Codex feedback evidence still require completion before submission.
