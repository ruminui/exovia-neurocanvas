# Exovia NeuroCanvas — ChatGPT App

An MCP-backed ChatGPT App that turns Exovia ProofLayer into tools usable by both the model and the human:

- `analyze_ai_output` — evidence, privacy, prompt-injection, context and control scan.
- `create_context_capsule` — portable context for another chat, model, agent or teammate.
- `create_neurocanvas_map` — converts a conversation, plan or research result into an importable `neurocanvas-v3` visual map for the Android/web app.
- `compare_ai_outputs` — transparent comparison against the same evidence.
- `recommend_ai_route` — provider-neutral local, hybrid or cloud recommendation.
- `build_proof_pack` — evidence manifest, trust report, governance and SHA-256 fingerprint.

The inline black-and-gold widget renders results for the human. ChatGPT receives compact structured data, while the NeuroCanvas map tool provides a JSON download that preserves source text and explicitly requires human review.

All tools are read-only, idempotent, provider-neutral and do not persist submitted content or call an external AI service.

## Human–AI loop

1. Ask ChatGPT to analyze, compare or structure the work.
2. Run `create_neurocanvas_map` to download an importable JSON graph.
3. Open that JSON in Exovia NeuroCanvas on Android or the web.
4. Explore the map, correct relationships, attach evidence and approve decisions.
5. Return a Context Capsule or Proof Pack to ChatGPT when the work must continue.

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

The reliability scan, answer ranking and automatic graph structure are deterministic heuristics. They expose missing evidence, sensitive data and control risks, but they do not replace live source verification, professional advice or human approval.
