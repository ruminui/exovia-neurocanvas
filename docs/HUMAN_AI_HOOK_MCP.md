# Exovia NeuroCanvas — Human + AI Hook/MCP Bridge

Status: IMPLEMENTED / RUNTIME VALIDATION PENDING

## Purpose

NeuroCanvas is designed for two equal users:

1. Humans working visually in the browser or installed PWA.
2. AI agents working through a local Model Context Protocol server.

Both operate on the same project model. Human actions remain visible in the UI; AI mutations are written to the project audit trail and emitted as hook events.

## Architecture

```text
Human browser / PWA
        |
        | POST /hooks/project
        v
Local Exovia Bridge :8787
        |-- Hook event stream: GET /hooks/events
        |-- JSON-RPC MCP: POST /mcp
        |-- MCP over stdio
        |
        v
AI clients / Codex / agent runtimes
```

The bridge binds to `127.0.0.1` by default. It does not expose itself to the public network.

## Start

Requirements: Node.js 20 or newer.

```bash
cd server
npm start
```

Optional local bearer token:

```bash
EXOVIA_BRIDGE_TOKEN=replace-with-a-random-local-secret npm start
```

Windows PowerShell:

```powershell
$env:EXOVIA_BRIDGE_TOKEN="replace-with-a-random-local-secret"
npm start
```

Then open NeuroCanvas and select **Human + AI**. The default bridge address is:

```text
http://127.0.0.1:8787
```

## Human workflow

1. Open, import or create a NeuroCanvas project.
2. Open **Human + AI**.
3. Connect to the bridge.
4. Select **Sync active project**.
5. Watch human and AI activity in the hook event stream.
6. Save the updated project locally after reviewing AI changes.

## MCP tools

- `neurocanvas_list_projects`
- `neurocanvas_get_project`
- `neurocanvas_search`
- `neurocanvas_upsert_node`
- `neurocanvas_link_nodes`
- `neurocanvas_recent_events`

MCP resources are exposed as:

```text
neurocanvas://projects/{project_id}
```

## MCP stdio client configuration

Example configuration shape for an MCP client that launches local stdio servers:

```json
{
  "mcpServers": {
    "exovia-neurocanvas": {
      "command": "node",
      "args": ["C:/path/to/exovia-neurocanvas/server/mcp-server.mjs"]
    }
  }
}
```

Use an absolute local path. Exact client configuration keys can differ between products.

## HTTP MCP

JSON-RPC requests can also be sent to:

```text
POST http://127.0.0.1:8787/mcp
```

Example:

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/list",
  "params": {}
}
```

The current implementation provides a compact local HTTP JSON-RPC endpoint and stdio transport. It is not yet claimed as a fully validated Streamable HTTP MCP deployment.

## Hooks

### Synchronize a project

```text
POST /hooks/project
```

Payload:

```json
{
  "projectId": "project-123",
  "source": "human-ui",
  "project": {
    "title": "My project",
    "nodes": [],
    "edges": []
  }
}
```

### Observe events

```text
GET /hooks/events
```

This endpoint uses Server-Sent Events for local observability. It is a NeuroCanvas hook mechanism, not the deprecated MCP SSE transport.

Events include:

- `project.synced`
- `project.changed`
- node creation or update metadata
- edge-link metadata

## Safety model

- Localhost binding by default.
- Optional bearer token.
- No OpenAI API key is required.
- No key is stored in the browser application.
- AI writes are limited to explicit MCP mutation tools.
- Mutations create audit records.
- Human review remains part of the workflow.
- No arbitrary command execution tool is exposed.
- No file-system traversal tool is exposed.
- No automatic public-network exposure.

## OpenAI use

OpenAI's Responses API and Agents SDK can connect to MCP servers. For future hosted use, the local bridge must be replaced or fronted by a securely authenticated remote Streamable HTTP MCP service. Do not expose this localhost development server directly to the internet.

## Validation still required

- Node syntax check.
- MCP initialization handshake from a real client.
- Tool listing and calls from Codex or another MCP host.
- Browser-to-hook synchronization.
- Event stream reconnection.
- Mutation persistence back into the browser workspace.
- Token-enabled requests.
- Conflict handling when human and AI edit the same project.
- Mobile browser behavior when the bridge runs on another machine.

## Mobile note

A phone cannot reach `127.0.0.1` on the desktop. For LAN testing, the bridge would need an explicit LAN bind and strict authentication. That mode is intentionally not enabled by default because it changes the security boundary.
