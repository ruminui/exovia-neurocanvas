# Contributing to Exovia NeuroCanvas

Thank you for helping Exovia NeuroCanvas.

This project welcomes technical and non-technical contributions. You do not need to be a programmer to help.

## Start here

Before doing anything, read:

- `LEEME_PRIMERO.txt`
- `docs/MANUAL_USUARIO.md`
- `docs/GUEST_HELPER_GUIDE.md`
- `docs/TESTER_CHECKLIST.md`
- `docs/CAPABILITY_VERIFICATION_MATRIX.md`

Repository:

`https://github.com/ruminui/exovia-neurocanvas`

## Ways to help

### No-code contributions

You can help by:

- testing the application on Windows, macOS, Linux, Android or iPhone;
- reporting bugs with screenshots or short videos;
- identifying confusing buttons or instructions;
- reviewing Spanish and English text;
- recording or editing the product demo;
- preparing screenshots and presentation assets;
- checking accessibility and mobile usability;
- testing different document types;
- reviewing whether claims match what the product actually does.

Use `docs/TESTER_CHECKLIST.md` and the report template in `docs/GUEST_HELPER_GUIDE.md`.

### Code contributions

The project uses plain HTML, CSS and JavaScript for the frontend, Node.js for local services and Playwright for browser tests.

Recommended setup:

```bash
git clone https://github.com/ruminui/exovia-neurocanvas.git
cd exovia-neurocanvas
npm install
npm start
```

Open:

```text
http://127.0.0.1:8080
```

Run frontend and browser verification:

```bash
npm run verify
```

Run backend verification:

```bash
cd server
npm run verify
```

## Safe contribution workflow

1. Create or select a GitHub issue describing the problem.
2. Fork the repository or create a separate branch.
3. Use a small, descriptive branch name, for example:

```text
fix/mobile-overflow
feat/pdf-provenance
chore/beginner-copy
```

4. Make one focused change.
5. Do not include secrets, tokens, private files or personal documents.
6. Run the relevant checks.
7. Open a pull request against `main`.
8. Explain what changed, how it was tested and what remains unverified.

Do not push directly to `main` unless you are explicitly authorized by the repository owner.

## Pull request checklist

A good pull request includes:

- a clear problem statement;
- a concise description of the solution;
- screenshots for interface changes;
- exact testing steps;
- test results;
- known limitations;
- no unrelated files;
- no secrets or private content;
- no unsupported claims.

Suggested pull request body:

```markdown
## Problem
Describe the problem.

## Change
Describe exactly what changed.

## Verification
- [ ] Opened locally
- [ ] `npm run verify:static`
- [ ] `npm test`
- [ ] `npm run test:e2e`
- [ ] Backend checks, when applicable

## Evidence
Add screenshots, video or logs.

## Known limitations
State anything not tested or not completed.
```

## Product truthfulness

Use these labels in technical notes and pull requests:

- `IMPLEMENTED` — the code exists.
- `AUTOMATED TESTED` — an automated test covers it.
- `RUNTIME VERIFIED` — a person or CI execution confirmed it runs.
- `PARTIAL` — only part of the experience works.
- `EXPERIMENTAL` — not production-ready.
- `BLOCKED` — depends on unavailable credentials, access or decisions.

Never describe GPT-5.6, Codex, PDF, mobile, PWA or external integrations as fully working unless there is direct evidence.

## Security rules

Never commit:

- API keys;
- passwords or tokens;
- `.env` files;
- private customer data;
- private conversations;
- copyrighted media without permission;
- personal documents used only for testing;
- runtime databases or backups.

Use synthetic or public test information.

The browser must never contain a secret OpenAI API key. Provider credentials belong on a protected backend only.

## Design rules

- Preserve the black-and-gold Exovia identity.
- Prioritize clarity over visual complexity.
- Keep the first-run path understandable without technical knowledge.
- Do not add a button unless it has a real function or an explicit disabled/experimental label.
- Preserve evidence, provenance and auditability.
- Maintain desktop and mobile usability.

## Scope rules

Prefer small, reviewable changes. Avoid combining a redesign, backend migration and new feature in a single pull request.

Before large architecture changes, open an issue and explain:

- the user problem;
- affected files;
- migration risk;
- rollback plan;
- testing plan.

## Attribution and rights

By contributing, you confirm that:

- the work is yours or you have permission to contribute it;
- it does not contain confidential information;
- it may be distributed under the repository license;
- you have disclosed AI-assisted work where relevant;
- you have not invented test results or product claims.

## Communication

Be respectful, specific and evidence-based. Critique the product or code, not the person.

When reporting a problem, include enough information for someone else to reproduce it.
