# Exovia NeuroCanvas

**Navigate knowledge like a living neural map. Verify every answer. Replay every decision.**

Exovia NeuroCanvas is an offline-first visual knowledge workspace created by **Luciano / Exovia**. It turns documents, notes, multimedia evidence and agent activity into an inspectable graph where answers and decisions can remain connected to their sources.

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

### Universal command

```bash
npm start
```

Requirement: **Node.js 24 LTS or newer**.

Beginner and collaborator instructions:

- [`LEEME_PRIMERO.txt`](LEEME_PRIMERO.txt)
- [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- [`docs/GUEST_HELPER_GUIDE.md`](docs/GUEST_HELPER_GUIDE.md)
- [`docs/TESTER_CHECKLIST.md`](docs/TESTER_CHECKLIST.md)
- [`docs/MARCE_GASTON_HELP_PLAN.md`](docs/MARCE_GASTON_HELP_PLAN.md) — concrete external QA, demo, mobile and evidence tasks

## First five-minute tour

1. Press **New workspace**.
2. Pan and zoom the visual map.
3. Select a node and inspect its exact evidence.
4. Open **Answer & Audit** and ask a question.
5. Inspect **Knowledge health** and **Agent replay**.
6. Open **Live room** to review participants, multimedia evidence, decisions and executions.
7. Press **Project room into graph** to navigate the room as a traceable NeuroCanvas map.
8. Press **Export** to save a portable JSON backup.

## Main capabilities

- Text, Markdown, JSON, ExiaL and log import
- Persistent local workspaces, snapshots and export
- Neural, tree, pulse and capability views
- Search and Zoom to Answer
- Exact evidence inspector
- Local evidence answer engine
- Knowledge Health and Contradiction Radar
- Human and Agent Replay
- Governed Living Evidence Room vertical slice
- Participants, multimedia evidence, decisions and execution contracts
- Human approval represented in graph and replay
- Secondary-brain connectors
- MCP and authenticated hook bridge
- Mobile/PWA interface and offline application shell
- Static, backend and browser test suites

## Living Evidence Rooms

The current local vertical slice demonstrates a provider-neutral contract for collaborative rooms:

- humans, agents, workflows and services as participants;
- text, image, audio, video, browser events and agent results as evidence;
- temporal and spatial evidence references;
- decisions linked to proposers, approvers and executions;
- scoped execution contracts;
- ordered replay events;
- projection of the complete room into the active knowledge graph.

Architecture and examples:

- [`docs/LIVE_COLLABORATION_ARCHITECTURE.md`](docs/LIVE_COLLABORATION_ARCHITECTURE.md)
- [`schemas/live-evidence-room.schema.json`](schemas/live-evidence-room.schema.json)
- [`examples/live-evidence-room.json`](examples/live-evidence-room.json)

Real-time multiuser synchronization, shared remote browsers, workflow providers and live media transport remain roadmap integrations until they are deployed and tested.
