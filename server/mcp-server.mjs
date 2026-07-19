import http from 'node:http';
import readline from 'node:readline';
import { randomUUID } from 'node:crypto';

const PORT = Number(process.env.EXOVIA_BRIDGE_PORT || 8787);
const TOKEN = process.env.EXOVIA_BRIDGE_TOKEN || '';
const state = {
  projects: new Map(),
  events: [],
  subscribers: new Set(),
};

const json = value => JSON.stringify(value);
const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message, data) => ({ jsonrpc: '2.0', id, error: { code, message, ...(data ? { data } : {}) } });

function validateProject(project) {
  if (!project || typeof project !== 'object') throw new Error('project must be an object');
  if (!Array.isArray(project.nodes) || !Array.isArray(project.edges)) throw new Error('project requires nodes and edges arrays');
  return project;
}

function searchProject(project, query, limit = 8) {
  const needle = String(query || '').trim().toLowerCase();
  if (!needle) return [];
  return project.nodes
    .map(node => {
      const hay = `${node.title || ''}\n${node.text || ''}\n${(node.keywords || []).join(' ')}`.toLowerCase();
      const titleHit = String(node.title || '').toLowerCase().includes(needle) ? 3 : 0;
      const textHit = hay.includes(needle) ? 2 : 0;
      const terms = needle.split(/\s+/).filter(Boolean);
      const overlap = terms.reduce((n, term) => n + (hay.includes(term) ? 1 : 0), 0) / Math.max(1, terms.length);
      return { node, score: titleHit + textHit + overlap };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(30, Number(limit) || 8)))
    .map(item => ({ id: item.node.id, title: item.node.title, type: item.node.type, score: Number(item.score.toFixed(3)), evidence: item.node.text || item.node.summary || '' }));
}

function emit(type, payload = {}) {
  const event = { id: randomUUID(), type, time: new Date().toISOString(), payload };
  state.events.push(event);
  if (state.events.length > 500) state.events.splice(0, state.events.length - 500);
  for (const response of state.subscribers) response.write(`data: ${json(event)}\n\n`);
  return event;
}

const tools = [
  { name: 'neurocanvas_list_projects', description: 'List projects currently synchronized with the local NeuroCanvas bridge.', inputSchema: { type: 'object', properties: {} } },
  { name: 'neurocanvas_get_project', description: 'Read a synchronized NeuroCanvas project.', inputSchema: { type: 'object', required: ['project_id'], properties: { project_id: { type: 'string' } } } },
  { name: 'neurocanvas_search', description: 'Search exact evidence and nodes in a synchronized NeuroCanvas project.', inputSchema: { type: 'object', required: ['project_id', 'query'], properties: { project_id: { type: 'string' }, query: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 30 } } } },
  { name: 'neurocanvas_upsert_node', description: 'Create or update a node. This is a mutating operation and is recorded in the audit trail.', inputSchema: { type: 'object', required: ['project_id', 'node'], properties: { project_id: { type: 'string' }, node: { type: 'object' }, reason: { type: 'string' } } } },
  { name: 'neurocanvas_link_nodes', description: 'Create a visible connection between two existing nodes.', inputSchema: { type: 'object', required: ['project_id', 'source_id', 'target_id'], properties: { project_id: { type: 'string' }, source_id: { type: 'string' }, target_id: { type: 'string' }, relation: { type: 'string' }, reason: { type: 'string' } } } },
  { name: 'neurocanvas_recent_events', description: 'Read recent human and AI hook events.', inputSchema: { type: 'object', properties: { limit: { type: 'integer', minimum: 1, maximum: 100 } } } },
];

function callTool(name, args = {}) {
  if (name === 'neurocanvas_list_projects') {
    return [...state.projects.entries()].map(([id, project]) => ({ id, title: project.title, kind: project.kind || 'memory', nodes: project.nodes.length, edges: project.edges.length, updatedAt: project.updatedAt || project.createdAt || null }));
  }
  if (name === 'neurocanvas_get_project') {
    const project = state.projects.get(String(args.project_id));
    if (!project) throw new Error('project not found');
    return project;
  }
  if (name === 'neurocanvas_search') {
    const project = state.projects.get(String(args.project_id));
    if (!project) throw new Error('project not found');
    return searchProject(project, args.query, args.limit);
  }
  if (name === 'neurocanvas_upsert_node') {
    const project = state.projects.get(String(args.project_id));
    if (!project) throw new Error('project not found');
    const incoming = { ...args.node };
    incoming.id = String(incoming.id || `node-${randomUUID()}`);
    incoming.title = String(incoming.title || 'Untitled node');
    incoming.text = String(incoming.text || incoming.summary || '');
    incoming.summary = String(incoming.summary || incoming.text.slice(0, 160));
    incoming.type = String(incoming.type || 'note');
    incoming.keywords = Array.isArray(incoming.keywords) ? incoming.keywords.map(String) : [];
    const index = project.nodes.findIndex(node => node.id === incoming.id);
    if (index >= 0) project.nodes[index] = { ...project.nodes[index], ...incoming };
    else project.nodes.push(incoming);
    project.audit ||= [];
    project.audit.push({ time: new Date().toISOString(), action: index >= 0 ? 'MCP_NODE_UPDATED' : 'MCP_NODE_CREATED', detail: `${incoming.id}: ${incoming.title}; ${args.reason || 'AI tool call'}` });
    project.updatedAt = new Date().toISOString();
    emit('project.changed', { projectId: args.project_id, operation: index >= 0 ? 'node.updated' : 'node.created', nodeId: incoming.id });
    return { status: 'ok', node: incoming };
  }
  if (name === 'neurocanvas_link_nodes') {
    const project = state.projects.get(String(args.project_id));
    if (!project) throw new Error('project not found');
    const ids = new Set(project.nodes.map(node => node.id));
    if (!ids.has(String(args.source_id)) || !ids.has(String(args.target_id))) throw new Error('source or target node not found');
    const edge = { a: String(args.source_id), b: String(args.target_id), type: String(args.relation || 'semantic'), weight: 1 };
    const exists = project.edges.some(item => item.a === edge.a && item.b === edge.b && item.type === edge.type);
    if (!exists) project.edges.push(edge);
    project.audit ||= [];
    project.audit.push({ time: new Date().toISOString(), action: 'MCP_EDGE_LINKED', detail: `${edge.a} -> ${edge.b} (${edge.type}); ${args.reason || 'AI tool call'}` });
    project.updatedAt = new Date().toISOString();
    emit('project.changed', { projectId: args.project_id, operation: 'edge.linked', edge });
    return { status: exists ? 'already_exists' : 'created', edge };
  }
  if (name === 'neurocanvas_recent_events') return state.events.slice(-Math.max(1, Math.min(100, Number(args.limit) || 30)));
  throw new Error(`unknown tool: ${name}`);
}

function handleRpc(message) {
  const id = message.id ?? null;
  try {
    if (message.method === 'initialize') return ok(id, { protocolVersion: '2025-06-18', capabilities: { tools: {}, resources: {} }, serverInfo: { name: 'exovia-neurocanvas', version: '0.1.0' } });
    if (message.method === 'notifications/initialized') return null;
    if (message.method === 'ping') return ok(id, {});
    if (message.method === 'tools/list') return ok(id, { tools });
    if (message.method === 'tools/call') {
      const result = callTool(message.params?.name, message.params?.arguments || {});
      return ok(id, { content: [{ type: 'text', text: json(result) }], structuredContent: result });
    }
    if (message.method === 'resources/list') {
      const resources = [...state.projects.entries()].map(([id, project]) => ({ uri: `neurocanvas://projects/${id}`, name: project.title || id, mimeType: 'application/json', description: 'Synchronized NeuroCanvas project' }));
      return ok(id, { resources });
    }
    if (message.method === 'resources/read') {
      const match = String(message.params?.uri || '').match(/^neurocanvas:\/\/projects\/(.+)$/);
      const project = match && state.projects.get(match[1]);
      if (!project) return fail(id, -32002, 'resource not found');
      return ok(id, { contents: [{ uri: message.params.uri, mimeType: 'application/json', text: json(project) }] });
    }
    return fail(id, -32601, 'method not found');
  } catch (error) {
    return fail(id, -32000, error.message);
  }
}

function authorized(request) {
  if (!TOKEN) return true;
  const header = request.headers.authorization || '';
  return header === `Bearer ${TOKEN}`;
}

function cors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

const server = http.createServer((request, response) => {
  cors(response);
  if (request.method === 'OPTIONS') return response.end();
  if (!authorized(request)) {
    response.writeHead(401, { 'content-type': 'application/json' });
    return response.end(json({ error: 'unauthorized' }));
  }
  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json' });
    return response.end(json({ status: 'ok', projects: state.projects.size, events: state.events.length }));
  }
  if (request.method === 'GET' && request.url === '/hooks/events') {
    response.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', connection: 'keep-alive' });
    state.subscribers.add(response);
    request.on('close', () => state.subscribers.delete(response));
    return;
  }
  if (request.method === 'POST' && request.url === '/hooks/project') {
    let body = '';
    request.on('data', chunk => { body += chunk; if (body.length > 10_000_000) request.destroy(); });
    request.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const project = validateProject(payload.project);
        const id = String(payload.projectId || project.projectId || `project-${randomUUID()}`);
        project.projectId = id;
        state.projects.set(id, project);
        const event = emit('project.synced', { projectId: id, title: project.title, source: payload.source || 'human-ui' });
        response.writeHead(200, { 'content-type': 'application/json' });
        response.end(json({ status: 'ok', projectId: id, event }));
      } catch (error) {
        response.writeHead(400, { 'content-type': 'application/json' });
        response.end(json({ error: error.message }));
      }
    });
    return;
  }
  if (request.method === 'POST' && request.url === '/mcp') {
    let body = '';
    request.on('data', chunk => body += chunk);
    request.on('end', () => {
      let output;
      try { output = handleRpc(JSON.parse(body)); } catch { output = fail(null, -32700, 'parse error'); }
      response.writeHead(200, { 'content-type': 'application/json' });
      response.end(json(output));
    });
    return;
  }
  response.writeHead(404, { 'content-type': 'application/json' });
  response.end(json({ error: 'not found' }));
});

server.listen(PORT, '127.0.0.1', () => console.error(`Exovia bridge listening on http://127.0.0.1:${PORT}`));

const lines = readline.createInterface({ input: process.stdin });
lines.on('line', line => {
  if (!line.trim()) return;
  let response;
  try { response = handleRpc(JSON.parse(line)); } catch { response = fail(null, -32700, 'parse error'); }
  if (response) process.stdout.write(`${json(response)}\n`);
});
