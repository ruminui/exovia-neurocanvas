# Deploy Exovia NeuroCanvas ChatGPT App

## Required result

The service must be reachable through a stable public HTTPS URL:

```text
https://your-domain.example/mcp
```

The same deployment exposes:

```text
https://your-domain.example/health
```

## Container build

From the repository root:

```bash
docker build -t exovia-neurocanvas-chatgpt ./chatgpt-app
docker run --rm -p 8787:8787 \
  -e PORT=8787 \
  -e APP_DOMAIN=https://your-domain.example \
  exovia-neurocanvas-chatgpt
```

Check locally:

```bash
curl http://127.0.0.1:8787/health
```

## Hosting requirements

Use a platform that can run a persistent Docker or Node.js web service and terminate HTTPS. Configure:

- **Root/build context:** `chatgpt-app`
- **Port:** the platform-provided `PORT`, or `8787`
- **Health path:** `/health`
- **MCP path:** `/mcp`
- **Environment:** `APP_DOMAIN=https://the-final-public-domain`
- **Minimum instances:** one while testing, with sleep disabled when dependable availability matters

The service does not require an OpenAI API key because it supplies tools to ChatGPT rather than calling an AI model itself.

## Connect privately in ChatGPT

1. Enable Developer Mode under **Settings → Apps & Connectors → Advanced settings**.
2. Create an app using the final HTTPS URL ending in `/mcp`.
3. Refresh the app whenever tool descriptors, widget resources or CSP metadata change.
4. Test these prompts:
   - “Use Exovia to analyze this AI answer and explain every risk.”
   - “Create a reusable context capsule for this conversation.”
   - “Turn this work into a NeuroCanvas map I can open on Android.”
   - “Compare these two AI answers against the same evidence.”
   - “Create a Proof Pack for this decision.”

## Public plugin readiness

Before public submission, provide a stable production domain, final logo and screenshots, privacy-policy URL, support URL, organization verification, accurate CSP allowlists and review-safe test prompts. Keep the app in Developer Mode until the hosted end-to-end flow has been tested.

## Validation levels already included

- Static syntax checks for server, widget and analysis modules.
- Six deterministic unit tests.
- `/health` runtime check.
- MCP `initialize` handshake check.
- GitHub Actions workflow on every ChatGPT App change.

The remaining validation is the real ChatGPT host loop against the deployed HTTPS endpoint.
