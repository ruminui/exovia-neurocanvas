# Exovia NeuroCanvas — Canonical Execution Protocol

Status: ACTIVE
Date activated: 2026-07-19

## Canonical lineage

This project inherits the verified Exovia working canon:

- MegaPrompt Maestro Exovia Core v2.1
- Protocolo Operativo de Trabajo y Handoff v3.1
- Production Finisher v1
- Completion Loop Engine v2026.7
- Evidence Log and canonical genealogy rules

The operating principle is:

> Keep everything necessary out of omission, but keep everything useless out of the product.

## Non-negotiable rules

1. Do not restart from zero when a working base exists.
2. Do not declare a feature complete without evidence.
3. Separate current implementation, historical evidence, experimental architecture and future work.
4. No feature is production-ready without persistence, error handling, recovery and documentation.
5. No secrets in client code, repository history, examples or exports.
6. No silent failures. User-visible operations must surface success, warning or failure.
7. No destructive action without explicit confirmation and an audit record.
8. Do not replace exact source evidence with an unverifiable summary.
9. Preserve version lineage, commits, decisions and handoff state.
10. STOP is valid only when the Definition of Done is verifiably satisfied or a concrete external blocker is documented.

## Execution loop

Every work cycle follows this order:

1. AUDIT — inspect the current repository and identify facts, risks and gaps.
2. ORDER — rank work by release impact and dependency.
3. PROTECT — preserve the stable base and avoid destructive rewrites.
4. IMPLEMENT — make the smallest coherent production increment.
5. INTEGRATE — connect it to persistence, UI, audit and existing flows.
6. VALIDATE — run static, functional and regression checks.
7. CORRECT — fix failures before adding unrelated scope.
8. POLISH — improve accessibility, UX, wording and visible states.
9. DOCUMENT — update evidence, decisions, usage and limits.
10. HANDOFF — record completed, verified, blocked and next actions.
11. LOOP — continue until the active Definition of Done is met.

## Evidence gate

A claim may be labeled VERIFIED only when supported by at least one of:

- reproducible automated test;
- successful browser run with documented steps;
- repository commit containing the implementation;
- captured runtime evidence;
- validated historical record clearly labeled as historical.

Labels:

- VERIFIED: directly tested or inspected.
- IMPLEMENTED / UNVERIFIED: code exists but runtime validation is pending.
- HISTORICAL: supported by recovered records but not currently revalidated.
- EXPERIMENTAL: research or constrained prototype.
- BLOCKED: requires external access, credentials, hardware or legal action.

## Product Definition of Done

NeuroCanvas is not release-complete until all critical items pass:

- application opens without console-blocking errors;
- text, Markdown, JSON and ExiaL import paths work;
- graph navigation, selection and Zoom to Answer work;
- projects persist and restore across reloads;
- editing, deletion, snapshots and recovery behave predictably;
- audit trail records meaningful mutations;
- export produces a re-importable project;
- offline cache does not serve stale incompatible assets;
- keyboard and basic accessibility flows work;
- no external execution occurs from Exil preview or graph clicks;
- README, quickstart, architecture, security and submission docs match reality;
- judge path can be completed in under three minutes;
- remaining limitations are explicit.

## Safety gates

- Local-first by default.
- External AI integration must be server-side and optional.
- FAPI views are read-only until a permissioned connector exists.
- Exil operations must parse, validate and preview before mutation.
- Imported JSON must be schema-checked before activation.
- Recovery snapshots must precede destructive project mutations.
- Production data must never be overwritten by demo-loading behavior.

## Session report format

Every significant cycle must end with:

- HECHO
- BASE VERIFICADA
- CAMBIOS
- VALIDACIÓN
- BLOQUEOS
- PENDIENTE
- SIGUIENTE ACCIÓN

No completion claim may omit validation status.
