# NeuroCanvas — Continuation Plan Without Codex

Status: ACTIVE

Codex is not currently available. Work must continue without inventing a Codex session, feedback ID or runtime evidence.

## What can still be advanced safely

- repository architecture;
- deterministic static validation;
- backend tests and recovery tooling;
- PWA deployment configuration;
- documentation and operational runbooks;
- security review from source inspection;
- mobile UX and local-first behavior;
- test matrices and reproducible commands.

## What remains external

- real browser execution on Luciano's device;
- real Node execution on Luciano's computer;
- physical Android/iOS validation;
- authenticated Devpost actions;
- official Codex `/feedback` Session ID.

## Immediate workflow

1. Pushes to `main` trigger repository verification.
2. Frontend deployment only proceeds after static integration checks pass.
3. GitHub Pages provides a HTTPS PWA suitable for mobile testing.
4. The MCP backend remains a separate local Node service and is never deployed with the static site.
5. Failures from Actions must be treated as release blockers and corrected before submission.

## Mobile test path

After GitHub Pages is enabled for GitHub Actions in repository settings:

1. wait for `Deploy NeuroCanvas PWA` to complete;
2. open the generated HTTPS URL on Android or iOS;
3. test project creation, import, graph gestures, persistence, reload and installation;
4. record device, OS, browser, result and defects;
5. do not enter a local bridge token into a public or shared device.

## Backend test path without Codex

On a computer with Node 20 or newer:

```bash
cd server
npm run verify:full
npm start
```

Then verify:

```text
GET http://127.0.0.1:8787/health
```

The backend is local-only by default. The GitHub Pages application cannot access a service bound only to another device's loopback address. Mobile-to-backend connectivity requires a separately designed authenticated LAN or HTTPS bridge and is not enabled automatically.

## Evidence discipline

Use only these labels:

- IMPLEMENTED — code exists in the repository.
- CI VERIFIED — GitHub Actions passed the relevant checks.
- DEVICE VERIFIED — manually tested on a named physical device.
- BLOCKED — depends on unavailable credentials, account action or hardware.

Never convert IMPLEMENTED into VERIFIED without the corresponding evidence.
