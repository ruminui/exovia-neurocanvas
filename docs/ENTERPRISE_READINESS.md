# Enterprise Readiness

This document separates current strengths from production claims that still require evidence.

## Current enterprise-oriented foundations

- Local-first workspace and offline-capable PWA.
- Evidence-preserving graph model.
- Human approval before loading AI-side changes.
- Revision-aware MCP mutations.
- Durable local bridge storage and backup tooling.
- Runtime diagnostics and capability verification matrix.
- Static, backend and browser test suites.
- Security policy, contribution guide and operations runbook.
- Beginner launchers and guest/tester manuals.

## Governance model

Every meaningful automated action should be represented as an execution contract containing:

- objective;
- required inputs;
- allowed tools or capabilities;
- constraints;
- expected outputs;
- success criteria;
- actor;
- revision;
- evidence;
- approval state.

Orchestration and execution must remain separate. A planner may propose work, but only the governed runtime should validate and apply mutations.

## Human-control gates

The current product direction requires:

1. AI proposes or performs a bridge-side mutation.
2. The action is recorded with actor, reason and revision.
3. The browser detects the change through the authenticated event stream.
4. A human reviews the project summary.
5. The project is loaded only after explicit confirmation.
6. The user saves the reviewed state locally.

## Production go-live gates

The project must not be called production-certified until these are completed and evidenced:

- repeatable green CI;
- cross-browser and cross-device acceptance testing;
- threat model and security review;
- dependency and secret scanning;
- authenticated deployment behind TLS;
- role-based access control;
- tenant isolation where multi-user use is required;
- centralized and exportable audit logs;
- backup restore drills;
- load and endurance testing;
- accessibility audit;
- privacy and retention policy;
- incident response process;
- service objectives and operational ownership.

## Build Week quality gates

For the competition submission, the minimum credible evidence package is:

- application opens from a clean download;
- System Check reports PASS on an external computer;
- core browser journey completes without console errors;
- data survives reload;
- export produces a restorable project;
- Answer & Audit returns evidence-linked results;
- Knowledge Health and Agent Replay render from the same project;
- mobile layout is usable;
- public deployment works;
- video shows only features that are actually operating;
- README, security boundaries and contribution instructions match the repository;
- real Codex session evidence and the required feedback identifier are supplied.

## Status language

Use only these labels:

- IMPLEMENTED — code exists.
- AUTOMATED TESTED — an automated test exists.
- RUNTIME VERIFIED — observed working in an executed environment.
- PARTIAL — useful subset exists, but the broad claim is incomplete.
- EXPERIMENTAL — research or prototype behavior.
- BLOCKED — depends on unavailable credentials, access, legal action or external configuration.

Winning cannot be guaranteed. The objective is to maximize implementation quality, clarity, demonstrable impact and trustworthiness.