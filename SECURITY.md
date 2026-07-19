# Security Policy

## Supported status

Exovia NeuroCanvas is currently a local-first Build Week project. Security controls are designed for local evaluation and controlled enterprise pilots, not for unrestricted public Internet exposure.

## Security principles

- Local-first data handling by default.
- No API keys in browser code, committed files, screenshots, issues or demos.
- Human approval before loading AI-side changes into the active workspace.
- Explicit revision checks for mutating MCP operations.
- Least-privilege bridge configuration.
- Evidence preservation and auditable mutations.
- Honest capability labels: IMPLEMENTED, VERIFIED, PARTIAL, EXPERIMENTAL or BLOCKED.

## Secrets

Use environment variables for server secrets:

```text
EXOVIA_BRIDGE_TOKEN
OPENAI_API_KEY
```

Never commit `.env`, `.env.local`, access tokens, private documents or production exports.

The browser bridge token is stored only in `sessionStorage`, so it is cleared when the browser session ends. Remote bridge URLs are rejected unless they use HTTPS.

## Safe default network posture

The bridge defaults to:

```text
127.0.0.1:8787
```

Keep this default for local use. Before binding to another interface, add all of the following:

- TLS termination;
- strong authentication;
- firewall or private-network policy;
- explicit allowed origins;
- centralized logs;
- backups and recovery validation;
- rate limits and monitoring.

Do not expose the local bridge directly to the public Internet.

## Data classification

Do not use sensitive personal, financial, health, credential or confidential corporate material in public demos.

For enterprise pilots, define data classes before ingestion:

- Public
- Internal
- Confidential
- Restricted

Restricted information should not enter the current browser workspace without an approved deployment and retention design.

## Reporting a vulnerability

Do not publish security vulnerabilities in a public issue.

Contact the repository owner privately with:

- affected version or commit;
- reproducible steps;
- impact;
- screenshots or logs with secrets removed;
- suggested mitigation when available.

Allow reasonable time for investigation before public disclosure.

## Known boundaries

The following are not yet claimed as production-certified:

- external identity provider integration;
- enterprise RBAC;
- tenant isolation;
- centralized audit export;
- managed encryption key rotation;
- formal penetration testing;
- compliance certification;
- production SLA.

These items remain roadmap work and must not be represented as complete.