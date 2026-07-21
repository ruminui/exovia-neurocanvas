# Exovia NeuroCanvas — ChatGPT App

A small MCP-backed ChatGPT App that turns Exovia ProofLayer into tools usable by both the model and the human:

- `analyze_ai_output` — evidence, privacy, prompt-injection, context and control scan.
- `create_context_capsule` — portable context for another chat, model, agent or teammate.
- `compare_ai_outputs` — transparent comparison against the same evidence.
- `recommend_ai_route` — provider-neutral local, hybrid or cloud recommendation.
- `build_proof_pack` — evidence manifest, trust report, governance and SHA-256 fingerprint.

All tools are read-only, idempotent, provider-neutral and do not persist submitted content or call an external AI service.

## Run locally

```bash
cd chatgpt-app
npm install
npm run verify
npm start
```

The MCP endpoint is `http://localhost:8787/mcp`; health is `http://localhost:8787/health`.

## Connect in ChatGPT Developer Mode

1. Expose the server through an HTTPS tunnel, for example `ngrok http 8787`.
2. In ChatGPT open **Settings → Apps & Connectors → Advanced settings** and enable Developer Mode.
3. Create a new app and use `https://YOUR-TUNNEL/mcp`.
4. Refresh the app after changing tool metadata or the widget template.

## Production and public plugin submission

Deploy the MCP server on a stable public HTTPS domain, set `APP_DOMAIN=https://your-domain.example`, keep the CSP allowlists exact, add a privacy-policy URL and support contact, verify the publishing organization, and test realistic prompts in Developer Mode before submitting through the OpenAI plugin submission portal.

## Important limitation

The reliability scan and answer ranking are deterministic heuristics. They help expose missing evidence, sensitive data and control risks, but they do not replace live source verification, professional advice or human approval.
