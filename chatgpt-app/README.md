# Exovia NeuroCanvas — ChatGPT App

**Judge quickstart:** [`JUDGE_QUICKSTART.md`](JUDGE_QUICKSTART.md)

```bash
npm install
npm run judge
```

The command launches the MCP server, performs a real protocol handshake, discovers and executes every core tool, validates the human-control invariants and writes inspectable evidence to `judge-output/`. It requires **no API key, database or external AI service**.

## What this is

An MCP-backed ChatGPT App that turns Exovia ProofLayer into tools usable by both the model and the human:

- `analyze_ai_output` — evidence, privacy, prompt-injection, context and control scan;
- `create_context_capsule` — portable context for another chat, model, agent or teammate;
- `build_exo_capability_pack` — compiles books, manuals, research, conversations, policies or code notes into an inspectable `.exo` package with source-linked chunks, progressive disclosure, procedures, constraints, privacy redaction and SHA-256 integrity;
- `create_neurocanvas_map` — converts a conversation, plan or research result into an importable `neurocanvas-v3` visual map for the Android/web app;
- `compare_ai_outputs` — transparent comparison against the same evidence;
- `recommend_ai_route` — provider-neutral local, hybrid or cloud recommendation;
- `build_proof_pack` — evidence manifest, trust report, governance and SHA-256 fingerprint.

The inline black-and-gold widget renders results for the human. ChatGPT receives compact structured data. The EXO pack and NeuroCanvas map tools provide downloadable files that retain provenance and explicitly require human review.

All tools are read-only, idempotent and provider-neutral. The server does not persist submitted content, call an external AI service, install generated capabilities or execute their procedures.

## Human–AI loop

1. ChatGPT analyzes, compares or structures the work.
2. `build_exo_capability_pack` creates a reusable source-linked capability package that an agent can inspect progressively.
3. The person opens the `.exo` package or a generated map in Exovia NeuroCanvas on Android or the web.
4. NeuroCanvas converts the package into an inspectable evidence graph.
5. The person explores, corrects relationships, attaches evidence and approves decisions.
6. A Context Capsule or Proof Pack returns the reviewed work to ChatGPT when it must continue.

## The `.exo` principle

An EXO pack is **not** a trained model and **not** an executable plugin. It is transparent JSON containing:

- manifest and safety contract;
- source identities and hashes;
- on-demand evidence chunks;
- keyword index and glossary;
- extracted procedures and constraints;
- evidence and citation rules;
- privacy redaction report;
- human-approval requirement;
- SHA-256 integrity fingerprint.

The format is documented in [`../docs/EXO_CAPABILITY_PACK.md`](../docs/EXO_CAPABILITY_PACK.md).

## Run locally

Requirement: Node.js 22 or newer.

```bash
cd chatgpt-app
npm install
npm run verify
npm start
```

- Status: `http://localhost:8787/`
- Health: `http://localhost:8787/health`
- MCP: `http://localhost:8787/mcp`

## Run with Docker

```bash
cd chatgpt-app
docker compose up --build
```

The container runs as a non-root user, has a health check, drops Linux capabilities and uses a read-only filesystem.

## Connect in ChatGPT Developer Mode

1. Start the server locally or in Docker.
2. Expose port `8787` through a public HTTPS tunnel, hosted container or public Codespaces port.
3. In ChatGPT open **Settings → Apps & Connectors → Advanced settings** and enable Developer Mode.
4. Create a new app and use `https://YOUR-PUBLIC-DOMAIN/mcp`.
5. Refresh the app after changing tool metadata or the widget template.

For a stable deployment, set:

```text
APP_DOMAIN=https://YOUR-PUBLIC-DOMAIN
```

## Reproducible judge environment

The repository includes:

- `.devcontainer/devcontainer.json` for GitHub Codespaces;
- `docker-compose.yml` for one-command container execution;
- `examples/judge-demo.json` with deterministic input;
- `scripts/judge-smoke.mjs` for end-to-end MCP validation;
- CI that uploads the generated judge evidence as a workflow artifact;
- privacy, support and deployment documentation.

## Production and directory submission

Deploy the MCP server on a stable public HTTPS domain, set `APP_DOMAIN`, keep CSP allowlists exact, provide public privacy and support URLs, verify the publishing organization, and test realistic prompts in ChatGPT Developer Mode before submission.

## Important limitation

The reliability scan, answer ranking, procedure extraction, token estimate and automatic graph structure are deterministic heuristics. They expose missing evidence, sensitive data and control risks, but do not replace live source verification, professional advice or human approval. Production authentication, unrestricted Exil execution, a live FAPI service mesh and multiuser synchronization must not be claimed unless separately deployed and tested.
