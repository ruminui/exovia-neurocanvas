# Exovia NeuroCanvas — Operations Runbook

Status: ACTIVE
Backend target: local-first MCP + Hooks bridge

## Start safely

```bash
cd server
npm run verify
npm start
```

The bridge binds to `127.0.0.1:8787` by default. Keep that default unless LAN access is intentionally required and protected.

## Recommended protected start

Set a long random local bearer token before startup. Do not commit it.

Windows PowerShell:

```powershell
$env:EXOVIA_BRIDGE_TOKEN="replace-with-a-long-random-value"
npm start
```

macOS / Linux:

```bash
EXOVIA_BRIDGE_TOKEN="replace-with-a-long-random-value" npm start
```

## Health verification

Open:

```text
http://127.0.0.1:8787/health
```

Healthy state must report:

- `status: ok`
- expected backend version
- persistence status `ok`
- sensible project/event counts
- no capacity-limit anomaly

A degraded persistence state is a release blocker.

## Backup

```bash
cd server
npm run backup
```

The command:

1. reads the durable state;
2. verifies that it is valid JSON;
3. copies it into `server/backups/`;
4. creates a SHA-256 checksum file.

Use a custom destination when needed:

```bash
node backup.mjs ./backups/pre-release.json
```

## Restore

Stop the bridge before restoring.

```bash
cd server
npm run restore -- ./backups/pre-release.json
```

The restore command validates the backup shape and creates a pre-restore copy of the current state before replacement.

After restoring:

```bash
npm run verify
npm start
```

Then confirm `/health` and inspect project revisions from the Human + AI panel.

## Recovery procedure

When persistence is degraded:

1. stop the bridge;
2. preserve `server/data/bridge-state.json` without editing it;
3. inspect the newest backup and checksum;
4. run guarded restore;
5. execute `npm run verify`;
6. restart;
7. confirm project count, revisions and recent events;
8. document the incident in the release log.

## Release gates

A backend release is not verified until all of these pass:

- CI backend checks;
- CI frontend static checks;
- local `npm run verify`;
- health endpoint;
- browser-to-hook synchronization;
- MCP initialization and tool listing;
- project search;
- revision conflict rejection;
- restart persistence;
- backup and restore drill;
- mobile client connection under the chosen network policy.

## Network policy

Default policy is loopback only.

For phone testing, the web application may be served over the LAN while the backend remains loopback-only; in that arrangement the phone cannot call the PC bridge directly. Direct phone-to-bridge access requires a deliberate future LAN mode with:

- explicit bind address;
- strict origin allowlist;
- mandatory token;
- firewall rule limited to the trusted LAN;
- TLS or a trusted local reverse proxy when credentials or sensitive material are used.

Do not expose the current bridge directly to the public internet.

## Evidence labels

- IMPLEMENTED: code exists.
- CI VERIFIED: automated repository checks passed.
- LOCAL VERIFIED: tested on a real local runtime.
- MOBILE VERIFIED: tested from an actual phone.
- RELEASE VERIFIED: all release gates passed and evidence recorded.
