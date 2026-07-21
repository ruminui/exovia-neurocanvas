# Exovia NeuroCanvas — Hackathon Judge Evidence

This document records the deterministic judge scenario and the acceptance criteria enforced by GitHub Actions. Judges can regenerate the same class of evidence with:

```bash
cd chatgpt-app
npm install
npm run judge
```

No OpenAI API key, external AI provider, database or private credential is required.

## Verified runtime path

The automated check:

1. starts the Exovia ProofLayer MCP server;
2. waits for the versioned `/health` endpoint;
3. connects using the official `@modelcontextprotocol/sdk` Streamable HTTP client;
4. discovers all seven MCP tools;
5. invokes every core workflow with a deterministic scenario;
6. validates evidence, privacy, context, progressive disclosure and human-control behavior;
7. creates at least nine inspectable artifacts;
8. scans every artifact for the sensitive demo values;
9. validates EXO and Proof Pack SHA-256 fingerprints;
10. builds the hardened Docker image;
11. starts the container and verifies its health endpoint.

## Tools required to be discoverable

- `analyze_ai_output`
- `create_context_capsule`
- `build_exo_capability_pack`
- `create_neurocanvas_map`
- `compare_ai_outputs`
- `recommend_ai_route`
- `build_proof_pack`

The test fails if any tool is absent.

## Deterministic scenario

The scenario compares:

- an overconfident recommendation that claims an unsupported **40 percent** cost reduction and uses absolute language;
- a controlled-pilot recommendation that distinguishes available evidence from unverified cost and preference claims and retains human approval.

The input also includes a demonstration email, credential-like value and prompt-injection instruction so privacy and control protections can be tested safely.

The same source material is compiled into an `.exo` capability package so the test can verify source/chunk provenance, progressive disclosure, redaction, safety contracts and integrity.

## Required acceptance criteria

The command fails unless all of these are true:

- the MCP health endpoint responds;
- the official MCP client connects;
- all seven tools are discoverable;
- the Trust Scan detects privacy risk;
- prompt injection is detected;
- the unsupported numeric claim is detected;
- absolute or overconfident wording is detected;
- a Context Capsule is created;
- the Context Capsule replaces the sensitive demo values;
- an `exo-capability-pack-v1` package is created;
- the EXO pack preserves source IDs, chunk IDs and chunk hashes;
- the EXO pack records index-first progressive disclosure;
- the EXO pack replaces the sensitive demo values;
- the EXO pack requires human approval and records that no external action occurred;
- the EXO pack reports no third-party code included by the compiler;
- both AI answers are compared;
- **Controlled pilot** wins over **Fast launch**;
- the safe route is `hybrid_verified`;
- an importable `neurocanvas-v3` graph is created;
- a Proof Pack is created;
- the Proof Pack replaces the sensitive demo values;
- valid 64-character SHA-256 fingerprints are produced;
- no generated judge artifact contains the original demonstration email or credential.

## Expected validated result

A successful execution reports the same class of result:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
MCP tools discovered: 7
Privacy redactions: capsule 2 / EXO 2+ / proof 2
EXO pack: 3+ sources / 3+ chunks / measured initial context estimate
Evidence-bounded winner: Controlled pilot
Recommended route: hybrid_verified
Judge artifact audit passed: 9+ files, no sensitive demo values, source-linked EXO pack, evidence-bounded winner and valid SHA-256 fingerprints.
```

The exact SHA-256 values change between executions because generated packages contain timestamps. The tests validate format, governance, privacy and internal integrity rather than requiring hard-coded hashes.

## Generated artifacts

`npm run judge` writes:

- `judge-output/judge-summary.json`
- `judge-output/trust-scan.json`
- `judge-output/context-capsule.md`
- a source-linked `.exo` capability package
- `judge-output/comparison.json`
- `judge-output/safe-route.json`
- an importable NeuroCanvas JSON map
- `judge-output/proof-pack.json`
- `judge-output/server.log`

GitHub Actions uploads these files together with verification, judge and container diagnostic logs.

## Security and privacy assertions

- Submitted content is processed in memory and is not persisted by the MCP server.
- No external model or AI API is called by the server.
- The tool surface is read-only, idempotent, non-destructive and closed-world.
- Credential-like and personal-data patterns are detected on original input but replaced in exported Trust Scan details, Context Capsules, EXO packs, NeuroCanvas handoffs and Proof Packs.
- Consequential actions remain subject to human approval.
- An EXO pack is inspectable JSON, not a trained model, installed skill or authorization to execute procedures.
- The generated NeuroCanvas map represents work for visual review; it does not execute represented actions.

## Honest limitations

The reliability scores, procedure extraction, token estimates, comparison and graph structure are deterministic heuristics. They reveal missing evidence, reusable structure, unsupported numbers, absolute language, sensitive values and control risks. They do not replace current authoritative sources, professional domain review or human judgment.

An always-on hosted MCP endpoint is not claimed. Judges can run the server through Node.js, Docker Compose or GitHub Codespaces, and can expose it temporarily through HTTPS to test the widget in ChatGPT Developer Mode.
