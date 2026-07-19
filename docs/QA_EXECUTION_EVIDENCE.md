# QA Execution Evidence

This file defines the evidence that must be collected when Exovia NeuroCanvas is executed outside source inspection.

## Required environment record

Record:

- operating system and version;
- browser and version;
- Node.js version;
- repository commit SHA;
- whether the run used a clean ZIP download or an existing checkout;
- whether the local MCP bridge was running.

## Required commands

Windows:

```text
VALIDAR_EXOVIA.bat
```

Manual alternative:

```bash
npm install --no-audit --no-fund
npx playwright install chromium
npm run verify
cd server
npm run verify
```

## Evidence package

Preserve:

- complete terminal output;
- `artifacts/release-readiness.json`;
- Playwright report when generated;
- screenshots of System Check;
- screenshots or video of any failed interaction;
- exact reproduction steps;
- exported sample project when the issue relates to persistence or import/export.

## Acceptance criteria

A release candidate may be described as runtime verified only when:

1. root verification exits with code 0;
2. backend verification exits with code 0;
3. System Check reports PASS on at least one external computer;
4. no blocking browser console errors are present;
5. a project survives reload;
6. real pasted text creates nodes containing the original evidence;
7. Answer & Audit returns evidence-linked citations;
8. invalid project structures are rejected or normalized safely;
9. safe Exil intent rejects unsupported commands;
10. mobile layout has no material horizontal overflow.

## Current automated coverage

The browser suite now contains named checks for:

- protected HTTP response headers;
- clean application startup;
- local project persistence and reload restoration;
- real pasted-text ingestion and exact evidence preservation;
- malformed project normalization and broken-edge filtering;
- Answer, Knowledge Health and Replay;
- unsupported Exil command rejection and visual-only execution audit;
- Secondary Brain and Human + AI dialog safety;
- runtime diagnostics;
- accessible control names;
- mobile overflow.

These are authored tests until an execution result proves they pass.
