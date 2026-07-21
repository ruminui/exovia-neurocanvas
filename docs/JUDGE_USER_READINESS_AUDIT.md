# Judge and User Readiness Audit

Date: 2026-07-21

This audit records the final usability and testing improvements prepared before judging.

## Official challenge requirements covered

- public repository with MIT license;
- reproducible working project;
- public test access through Android, local desktop/web and MCP judge paths;
- clear project description and implemented-versus-roadmap boundary;
- evidence mapped to technological implementation, design, potential impact and idea quality;
- testing instructions that do not require private credentials or paid services.

## Judge experience

- one root command: `npm run judge`;
- deterministic PASS markers;
- generated artifacts under one directory;
- exact expected outputs and troubleshooting;
- direct Android APK, checksum and machine-readable verification metadata;
- Docker and real ChatGPT Developer Mode alternatives;
- explicit honest limitations.

## First-time user experience

- bilingual `USER_START_HERE.md`;
- updated Spanish manual and `LEEME_PRIMERO.txt`;
- consistent Node.js 24 requirement for the full product;
- Android no-development-setup path;
- five-minute guided task;
- `.exo` import explanation;
- local storage, export and recovery guidance;
- privacy, prompt-injection and source-rights warnings.

## Automated drift protection

`scripts/judge-preflight.mjs` and `scripts/validate.mjs` fail when critical documentation, commands, release metadata, licensing or checksums become inconsistent.

## Owner-controlled Devpost fields

The repository cannot verify fields that only exist in the owner's Devpost submission. Before the deadline, the owner must confirm that the entry is submitted rather than left as a draft, the public YouTube demo is under three minutes with audio, the category is correct, all public links open, and the authentic Codex `/feedback` Session ID is entered where requested.
