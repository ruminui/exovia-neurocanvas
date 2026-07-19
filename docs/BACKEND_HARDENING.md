# Backend Hardening — Exovia NeuroCanvas Bridge v0.3.0

Status: IMPLEMENTED / RUNTIME VERIFICATION REQUIRED

## Improvements

- Atomic JSON persistence with temporary-file replacement.
- Recovery behavior for missing or corrupt state files.
- Strict project, node and edge validation.
- Configurable body, project, node and edge limits.
- Optimistic concurrency through project revisions.
- Conflict responses for stale human or AI writes.
- Durable human and AI event history.
- SSE heartbeat and subscriber cleanup.
- Localhost-only binding by default.
- Restricted localhost CORS instead of wildcard origins.
- Optional bearer authentication with timing-safe comparison.
- Request, header and keep-alive timeouts.
- Graceful SIGINT and SIGTERM shutdown with final persistence.
- Protected root node and reason-required deletion.
- New MCP delete tool with audit records.
- Integration test covering health, synchronization, MCP discovery, search, mutation, revision conflicts and invalid graph rejection.

## Commands

```bash
cd server
npm run verify
npm start
```

Default persistent state:

```text
server/data/bridge-state.json
```

## Environment controls

```text
EXOVIA_BRIDGE_HOST=127.0.0.1
EXOVIA_BRIDGE_PORT=8787
EXOVIA_BRIDGE_TOKEN=<optional local secret>
EXOVIA_BRIDGE_DATA=./data/bridge-state.json
EXOVIA_MAX_BODY_BYTES=8000000
EXOVIA_MAX_PROJECTS=200
EXOVIA_MAX_NODES=50000
EXOVIA_MAX_EDGES=150000
EXOVIA_MAX_EVENTS=2000
```

## Required runtime evidence

Before marking VERIFIED:

1. Run `npm run verify` on Node 20 or later.
2. Start the server twice and confirm projects survive restart.
3. Test a browser sync and an MCP mutation concurrently.
4. Confirm a stale revision receives a conflict response.
5. Test graceful shutdown while a project is being persisted.
6. Confirm token authentication rejects missing and incorrect credentials.
7. Confirm the UI handles degraded health and conflict messages.

No production-readiness claim should be made until these checks have recorded output.
