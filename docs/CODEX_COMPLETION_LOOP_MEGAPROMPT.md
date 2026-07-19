# Codex Completion Loop — Exovia NeuroCanvas

Use this document in the primary Codex thread and preserve the real `/feedback` Session ID from that work.

## Mission

Finish `ruminui/exovia-neurocanvas` as a verifiable Build Week submission without replacing the stable product.

## Canonical method

```text
Audit → protect stable base → implement → test → collect evidence → correct → regress → document → handoff → repeat
```

## Rules

- Audit before editing.
- Do not start over.
- Prefer the smallest safe change.
- Do not call a feature complete because code exists.
- Every completion claim needs executed evidence.
- Preserve the black-and-gold identity and beginner flow.
- Keep AI-side changes visible, auditable and subject to human review.
- Never invent the Codex Session ID.
- Continue until every achievable P0 item passes or a genuine external blocker is documented.

## Read first

- `README.md`
- `SECURITY.md`
- `CONTRIBUTING.md`
- `docs/MASTER_GAP_AUDIT.md`
- `docs/FINAL_COMPLETION_AUDIT.md`
- `docs/CAPABILITY_VERIFICATION_MATRIX.md`
- `docs/RELEASE_STATUS.md`
- `docs/QA_EXECUTION_EVIDENCE.md`
- issue `#1`

## Protected base

Change incrementally:

- `index.html`
- `src/core.js`
- `src/product.js`
- `src/intelligence.js`
- `src/diagnostics.js`
- `src/ai-bridge.js`
- `server/mcp-server.mjs`
- `scripts/serve.mjs`
- `scripts/release-readiness.mjs`
- `tests/e2e/neurocanvas.spec.mjs`

## Loop

### 1. Audit

Record environment, branch and commit. Inspect failures, dead controls, broken references, documentation drift, unsafe behavior and missing tests. Rank findings P0, P1 and P2.

### 2. Protect

Create a recovery point, avoid unrelated refactors and define the expected result before changing code.

### 3. Implement

Make the smallest coherent correction. Add a regression test for every fixed defect.

### 4. Execute

Run the complete frontend, browser and backend verification available in the repository. Generate a trusted lockfile from the real Node environment when possible; do not hand-author it.

### 5. Evidence

Preserve command, exit code, relevant output, report or screenshot, commit SHA and exact blocker details.

### 6. Correct and regress

Fix each P0 failure, rerun the failing test, then rerun affected regression suites.

### 7. Document

Update the capability matrix, release status, completion audit and issue #1. Change the README only when user-visible behavior changes.

## P0 matrix

Verify:

1. clean local startup;
2. no blocking console errors;
3. built-in demo;
4. pasted real document;
5. TXT and Markdown import;
6. valid, malformed and incompatible JSON handling;
7. ExiaL and log import;
8. search, Zoom to Answer and exact evidence;
9. save, reload and browser restart persistence;
10. node create, edit and delete;
11. autosave;
12. snapshot creation and restoration;
13. project duplication isolation;
14. project deletion cleanup;
15. export and fresh import round trip;
16. offline reload and service-worker upgrade;
17. Exil performs no external execution;
18. FAPI stays read-only;
19. keyboard and dialog focus behavior;
20. mobile layout and touch navigation;
21. System Check PASS;
22. guided judge flow under three minutes.

## Definition of Done

Completion requires:

- automated suites pass;
- no achievable P0 failure remains;
- corrected defects have regression tests;
- documentation matches observed behavior;
- partial features remain labelled PARTIAL or BLOCKED;
- issue #1 contains evidence;
- authentic Codex feedback Session ID is captured.

## Cycle report

```text
CYCLE:
BASE COMMIT:
FINDINGS:
CHANGES:
TESTS EXECUTED:
RESULTS:
EVIDENCE:
REMAINING P0:
BLOCKERS:
NEXT ACTION:
```

Stop only when all achievable P0 gates pass with evidence, or when a genuine external blocker is documented with exact reproduction steps and owner action.