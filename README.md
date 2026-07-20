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

Beginner instructions:

- [`LEEME_PRIMERO.txt`](LEEME_PRIMERO.txt)
- [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- [`docs/TESTER_CHECKLIST.md`](docs/TESTER_CHECKLIST.md)

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

## Verification

On Windows, run:

```text
VALIDAR_EXOVIA.bat
```

Manual verification before the trusted lockfile exists:

```bash
npm install --no-audit --no-fund
npx playwright install --with-deps chromium
npm run verify
cd server
npm run verify
```

After `package-lock.json` is generated and committed in a trusted Node 24 environment, clean installation should use `npm ci`.

## Architecture

```text
Documents / notes / logs / events
              ↓
Local normalization and graph construction
              ↓
Evidence-preserving visual workspace
              ↓
Answer, health, contradiction and replay layers
              ↓
Optional MCP and secure provider bridge
              ↓
Governed Living Evidence Rooms
```

The visualization is not the memory. It is the doorway into structured, inspectable and restorable knowledge.

## Project structure

- `index.html` — application shell
- `src/core.js` — graph model and canvas runtime
- `src/product.js` — persistent project workspace
- `src/brain.js` — secondary-brain connectors
- `src/ai-bridge.js` — human/AI bridge interface
- `src/intelligence.js` — answers, health, contradictions and replay
- `src/live-room.js` — governed room viewer and graph projection
- `schemas/` — versioned data contracts
- `examples/` — non-secret example data
- `server/` — durable local MCP and hook backend
- `tests/e2e/` — desktop and mobile browser tests
- `docs/` — architecture, operations and submission documentation

## Safety and claims

- Never place API keys in browser code.
- Do not use private documents in public demonstrations.
- Export important projects before clearing browser data.
- Keep optional services local or behind deliberate authentication and transport security.
- Do not describe roadmap integrations as deployed features.
- Do not claim GPT-generated output unless a live provider is connected and identified.

## Help the project

- Guest and tester guide: [`docs/GUEST_HELPER_GUIDE.md`](docs/GUEST_HELPER_GUIDE.md)
- Contribution workflow: [`CONTRIBUTING.md`](CONTRIBUTING.md)
- Capability verification matrix: [`docs/CAPABILITY_VERIFICATION_MATRIX.md`](docs/CAPABILITY_VERIFICATION_MATRIX.md)

## Author

**Luciano — Exovia**

## License

MIT
