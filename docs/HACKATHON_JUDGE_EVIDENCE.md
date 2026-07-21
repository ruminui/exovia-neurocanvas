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
4. discovers all six MCP tools;
5. invokes every core tool with a deterministic scenario;
6. validates evidence, privacy, context and human-control behavior;
7. creates eight inspectable artifacts;
8. scans every artifact for the sensitive demo values;
9. builds the hardened Docker image;
10. starts the container and verifies its health endpoint.

## Tools required to be discoverable

- `analyze_ai_output`
- `create_context_capsule`
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

## Required acceptance criteria

The command fails unless all of these are true:

- the MCP health endpoint responds;
- the official MCP client connects;
- all six tools are discoverable;
- the Trust Scan detects privacy risk;
- prompt injection is detected;
- the unsupported numeric claim is detected;
- absolute or overconfident wording is detected;
- a Context Capsule is created;
- the Context Capsule replaces the sensitive demo values;
- both AI answers are compared;
- **Controlled pilot** wins over **Fast launch**;
- the safe route is `hybrid_verified`;
- an importable `neurocanvas-v3` graph is created;
- a Proof Pack is created;
- the Proof Pack replaces the sensitive demo values;
- a valid 64-character SHA-256 fingerprint is produced;
- no generated judge artifact contains the original demonstration email or credential.

## Latest validated result

A successful CI execution produced:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
MCP tools discovered: 6
Trust score: 63/100 (C)
Risks detected: 6
Privacy redactions: capsule 2 / proof 2
Evidence-bounded winner: Controlled pilot
Recommended route: hybrid_verified
NeuroCanvas map: 6 nodes / 7 relationships
Judge artifact audit passed: 8 files, no sensitive demo values, evidence-bounded winner and valid SHA-256.
```

The exact SHA-256 changes between executions because the Proof Pack contains a generation timestamp. The test validates its format and internal integrity rather than requiring one hard-coded hash.

## Generated artifacts

`npm run judge` writes:

- `judge-output/judge-summary.json`
- `judge-output/trust-scan.json`
- `judge-output/context-capsule.md`
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
- Credential-like and personal-data patterns are detected on the original input but replaced in exported Trust Scan details, Context Capsules and Proof Packs.
- Consequential actions remain subject to human approval.
- The generated NeuroCanvas map represents work for visual review; it does not execute the represented actions.

## Honest limitations

The reliability scores, comparison and graph structure are deterministic heuristics. They reveal missing evidence, unsupported numbers, absolute language, sensitive values and control risks. They do not replace current authoritative sources, professional domain review or human judgment.

An always-on hosted MCP endpoint is not claimed. Judges can run the server through Node.js, Docker Compose or GitHub Codespaces, and can expose it temporarily through HTTPS to test the widget in ChatGPT Developer Mode.
