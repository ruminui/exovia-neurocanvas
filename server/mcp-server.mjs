import http from 'node:http';
import readline from 'node:readline';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { DurableStore } from './lib/store.mjs';
import { RequestError, validateNode, validateProject } from './lib/validate.mjs';

const VERSION = '0.3.0';
const HOST = process.env.EXOVIA_BRIDGE_HOST || '127.0.0.1';
const PORT = Number(process.env.EXOVIA_BRIDGE_PORT || 8787);
const ACCESS_KEY = process.env.EXOVIA_BRIDGE_TOKEN || '';
const MAX_BODY = Number(process.env.EXOVIA_MAX_BODY_BYTES || 8_000_000);
const MAX_PROJECTS = Number(process.env.EXOVIA_MAX_PROJECTS || 200);
const MAX_EVENTS = Number(process.env.EXOVIA_MAX_EVENTS || 2_000);
const LIMITS = { maxNodes: Number(process.env.EXOVIA_MAX_NODES || 50_000), maxEdges: Number(process.env.EXOVIA_MAX_EDGES || 150_000) };
const store = new DurableStore(process.env.EXOVIA_BRIDGE_DATA || './data/bridge-state.json');
const state = { projects: new Map(), events: [], subscribers: new Set(), revision: 0, startedAt: new Date().toISOString() };
let stopping = false;

const now = () => new Date().toISOString();
const json = value => JSON.stringify(value);
const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message, data) => ({ jsonrpc: '2.0', id, error: { code, message, ...(data === undefined ? {} : { data }) } });
const clean = (value, fallback = '', max = 500) => String(value ?? fallback).slice(0, max);

function snapshot() {
  return { version: VERSION, revision: state.revision, savedAt: now(), projects: [...state.projects.entries()], events: state.events };
}

function persist() {
  return store.save(snapshot());
}

async function restore() {
  const saved = await store.load({ projects: [], events: [], revision: 0 });
  for (const [id, raw] of Array.isArray(saved.projects) ? saved.projects : []) {
    try {
      const project = validateProject(raw, LIMITS);
      project.projectId = clean(id || project.projectId, `project-${randomUUID()}`, 256);
      state.projects.set(project.projectId, project);
    } catch (error) {
      console.error('[restore] skipped project', id, error.message);
    }
  }
  state.events = Array.isArray(saved.events) ? saved.events.slice(-MAX_EVENTS) : [];
  state.revision = Number.isInteger(saved.revision) ? saved.revision : 0;
}

function emit(type, payload = {}, actor = 'system') {
  const event = { id: randomUUID(), type, actor, time: now(), revision: state.revision, payload };
  state.events.push(event);
  if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  const wire = `id: ${event.id}\nevent: ${type}\ndata: ${json(event)}\n\n`;
  for (const response of state.subscribers) {
    try { response.write(wire); } catch { state.subscribers.delete(response); }
  }
  persist();
  return event;
}

function getProject(id) {
  const project = state.projects.get(clean(id, '', 256));
  if (!project) throw new RequestError(404, 'project not found', 'project_not_found');
  return project;
}

function assertRevision(project, expected) {
  if (expected == null) return;
  const value = Number(expected);
  if (!Number.isInteger(value) || value !== project.revision) throw new RequestError(409, 'project revision conflict', 'revision_conflict', { expected: value, current: project.revision });
}

function commit(projectId, project, operation, actor = 'ai') {
  project.revision = (Number(project.revision) || 0) + 1;
  project.updatedAt = now();
  state.revision += 1;
  state.projects.set(projectId, validateProject(project, LIMITS));
  emit('project.changed', { projectId, operation, projectRevision: project.revision }, actor);
  return project;
}

function searchProject(project, query, limit = 8) {
  const needle = clean(query, '', 2_000).trim().toLowerCase();
  if (!needle) return [];
  const terms = needle.split(/\s+/).filter(Boolean).slice(0, 50);
  return project.nodes.map(node => {
    const title = clean(node.title).toLowerCase();
    const body = clean(node.text || node.summary, '', 1_000_000).toLowerCase();
    const tags = (node.keywords || []).join(' ').toLowerCase();
    const score = (title.includes(needle) ? 4 : 0) + (body.includes(needle) ? 3 : 0) + terms.reduce((sum, term) => sum + (title.includes(term) ? 1.4 : body.includes(term) ? 1 : tags.includes(term) ? 0.8 : 0), 0) / Math.max(1, terms.length);
    return { node, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, Math.max(1, Math.min(30, Number(limit) || 8))).map(({ node, score }) => ({ id: node.id, title: node.title, type: node.type, score: Number(score.toFixed(3)), evidence: node.text || node.summary || '', source: node.source || null }));
}

const tools = [
  { name: 'neurocanvas_list_projects', description: 'List projects with revision metadata.', inputSchema: { type: 'object', additionalProperties: false, properties: {} } },
  { name: 'neurocanvas_get_project', description: 'Read a synchronized project.', inputSchema: { type: 'object', additionalProperties: false, required: ['project_id'], properties: { project_id: { type: 'string' } } } },
  { name: 'neurocanvas_search', description: 'Search exact evidence in a project.', inputSchema: { type: 'object', additionalProperties: false, required: ['project_id', 'query'], properties: { project_id: { type: 'string' }, query: { type: 'string' }, limit: { type: 'integer', minimum: 1, maximum: 30 } } } },
  { name: 'neurocanvas_upsert_node', description: 'Create or update a node with optional revision protection.', inputSchema: { type: 'object', additionalProperties: false, required: ['project_id', 'node'], properties: { project_id: { type: 'string' }, expected_revision: { type: 'integer' }, node: { type: 'object' }, reason: { type: 'string' } } } },
  { name: 'neurocanvas_link_nodes', description: 'Link two nodes with an auditable relation.', inputSchema: { type: 'object', additionalProperties: false, required: ['project_id', 'source_id', 'target_id'], properties: { project_id: { type: 'string' }, expected_revision: { type: 'integer' }, source_id: { type: 'string' }, target_id: { type: 'string' }, relation: { type: 'string' }, reason: { type: 'string' } } } },
  { name: 'neurocanvas_delete_node', description: 'Delete a non-root node and connected edges with a mandatory reason.', inputSchema: { type: 'object', additionalProperties: false, required: ['project_id', 'node_id', 'reason'], properties: { project_id: { type: 'string' }, expected_revision: { type: 'integer' }, node_id: { type: 'string' }, reason: { type: 'string', minLength: 3 } } } },
  { name: 'neurocanvas_recent_events', description: 'Read recent human and AI events.', inputSchema: { type: 'object', additionalProperties: false, properties: { limit: { type: 'integer', minimum: 1, maximum: 100 } } } },
];

function callTool(name, args = {}) {
  if (name === 'neurocanvas_list_projects') return [...state.projects.entries()].map(([id, project]) => ({ id, title: project.title, kind: project.kind, revision: project.revision, nodes: project.nodes.length, edges: project.edges.length, updatedAt: project.updatedAt }));
  if (name === 'neurocanvas_get_project') return getProject(args.project_id);
  if (name === 'neurocanvas_search') return searchProject(getProject(args.project_id), args.query, args.limit);
  if (name === 'neurocanvas_recent_events') return state.events.slice(-Math.max(1, Math.min(100, Number(args.limit) || 30)));

  const projectId = clean(args.project_id, '', 256);
  const project = structuredClone(getProject(projectId));
  assertRevision(project, args.expected_revision);
  project.audit ||= [];

  if (name === 'neurocanvas_upsert_node') {
    const node = validateNode(args.node);
    const index = project.nodes.findIndex(item => item.id === node.id);
    if (index >= 0) project.nodes[index] = { ...project.nodes[index], ...node };
    else project.nodes.push(node);
    project.audit.push({ time: now(), action: index >= 0 ? 'MCP_NODE_UPDATED' : 'MCP_NODE_CREATED', detail: `${node.id}: ${node.title}; ${clean(args.reason, 'AI tool call')}` });
    commit(projectId, project, index >= 0 ? 'node.updated' : 'node.created');
    return { status: 'ok', project_revision: project.revision, node };
  }

  if (name === 'neurocanvas_link_nodes') {
    const source = clean(args.source_id, '', 256);
    const target = clean(args.target_id, '', 256);
    const ids = new Set(project.nodes.map(node => node.id));
    if (!ids.has(source) || !ids.has(target)) throw new RequestError(404, 'source or target node not found', 'node_not_found');
    const edge = { a: source, b: target, type: clean(args.relation, 'semantic', 120), weight: 1 };
    const exists = project.edges.some(item => item.a === edge.a && item.b === edge.b && item.type === edge.type);
    if (!exists) {
      project.edges.push(edge);
      project.audit.push({ time: now(), action: 'MCP_EDGE_LINKED', detail: `${edge.a} -> ${edge.b} (${edge.type}); ${clean(args.reason, 'AI tool call')}` });
      commit(projectId, project, 'edge.linked');
    }
    return { status: exists ? 'already_exists' : 'created', project_revision: project.revision, edge };
  }

  if (name === 'neurocanvas_delete_node') {
    const nodeId = clean(args.node_id, '', 256);
    const reason = clean(args.reason, '', 500).trim();
    if (reason.length < 3) throw new RequestError(400, 'delete reason is required', 'reason_required');
    if (nodeId === 'root') throw new RequestError(400, 'root node cannot be deleted', 'protected_node');
    const index = project.nodes.findIndex(node => node.id === nodeId);
    if (index < 0) throw new RequestError(404, 'node not found', 'node_not_found');
    const [deleted] = project.nodes.splice(index, 1);
    project.edges = project.edges.filter(edge => edge.a !== nodeId && edge.b !== nodeId);
    for (const node of project.nodes) if (node.parent === nodeId) node.parent = 'root';
    project.audit.push({ time: now(), action: 'MCP_NODE_DELETED', detail: `${nodeId}: ${deleted.title}; ${reason}` });
    commit(projectId, project, 'node.deleted');
    return { status: 'deleted', project_revision: project.revision, node_id: nodeId };
  }

  throw new RequestError(404, `unknown tool: ${name}`, 'unknown_tool');
}

function handleRpc(message) {
  const id = message?.id ?? null;
  try {
    if (!message || typeof message !== 'object' || message.jsonrpc !== '2.0') return fail(id, -32600, 'invalid JSON-RPC request');
    if (message.method === 'initialize') return ok(id, { protocolVersion: '2025-06-18', capabilities: { tools: {}, resources: { listChanged: true } }, serverInfo: { name: 'exovia-neurocanvas', version: VERSION } });
    if (message.method === 'notifications/initialized') return null;
    if (message.method === 'ping') return ok(id, {});
    if (message.method === 'tools/list') return ok(id, { tools });
    if (message.method === 'tools/call') {
      const result = callTool(message.params?.name, message.params?.arguments || {});
      return ok(id, { content: [{ type: 'text', text: json(result) }], structuredContent: result, isError: false });
    }
    if (message.method === 'resources/list') return ok(id, { resources: [...state.projects.entries()].map(([projectId, project]) => ({ uri: `neurocanvas://projects/${encodeURIComponent(projectId)}`, name: project.title || projectId, mimeType: 'application/json', description: `NeuroCanvas project revision ${project.revision}` })) });
    if (message.method === 'resources/read') {
      const match = String(message.params?.uri || '').match(/^neurocanvas:\/\/projects\/(.+)$/);
      const project = match && state.projects.get(decodeURIComponent(match[1]));
      if (!project) return fail(id, -32002, 'resource not found');
      return ok(id, { contents: [{ uri: message.params.uri, mimeType: 'application/json', text: json(project) }] });
    }
    return fail(id, -32601, 'method not found');
  } catch (error) {
    return fail(id, error.status === 409 ? -32009 : -32000, error.message, error.data);
  }
}

function authorized(request) {
  if (!ACCESS_KEY) return true;
  const supplied = Buffer.from(String(request.headers.authorization || ''));
  const expected = Buffer.from(`Bearer ${ACCESS_KEY}`);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

function cors(request, response) {
  const origin = request.headers.origin;
  if (!origin) return;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  }
}

function send(response, status, body, headers = {}) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers });
  response.end(json(body));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new RequestError(413, 'request body too large', 'body_too_large'));
        request.destroy();
      } else chunks.push(chunk);
    });
    request.on('end', () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
      catch { reject(new RequestError(400, 'invalid JSON body', 'invalid_json')); }
    });
    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  cors(request, response);
  if (request.method === 'OPTIONS') return response.end();
  if (!authorized(request)) return send(response, 401, { error: 'unauthorized' }, { 'www-authenticate': 'Bearer' });
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host || `${HOST}:${PORT}`}`);
    if (request.method === 'GET' && url.pathname === '/health') return send(response, store.lastError ? 503 : 200, { status: store.lastError ? 'degraded' : 'ok', version: VERSION, uptimeSeconds: Math.floor(process.uptime()), startedAt: state.startedAt, projects: state.projects.size, events: state.events.length, subscribers: state.subscribers.size, revision: state.revision, persistence: store.lastError ? { status: 'error', error: store.lastError } : { status: 'ok' }, limits: { maxBodyBytes: MAX_BODY, maxProjects: MAX_PROJECTS, ...LIMITS } });

    if (request.method === 'GET' && url.pathname === '/hooks/events') {
      response.writeHead(200, { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-cache, no-transform', connection: 'keep-alive' });
      response.write(`event: ready\ndata: ${json({ status: 'ok', version: VERSION, revision: state.revision })}\n\n`);
      state.subscribers.add(response);
      const heartbeat = setInterval(() => response.write(`: heartbeat ${Date.now()}\n\n`), 20000);
      request.on('close', () => { clearInterval(heartbeat); state.subscribers.delete(response); });
      return;
    }

    if (request.method === 'POST' && url.pathname === '/hooks/project') {
      const payload = await readBody(request);
      const project = validateProject(payload.project, LIMITS);
      const projectId = clean(payload.projectId || project.projectId || `project-${randomUUID()}`, '', 256);
      const current = state.projects.get(projectId);
      if (!current && state.projects.size >= MAX_PROJECTS) throw new RequestError(507, 'project capacity reached', 'capacity_reached');
      if (payload.expectedRevision != null && current && Number(payload.expectedRevision) !== current.revision) throw new RequestError(409, 'project revision conflict', 'revision_conflict', { expected: Number(payload.expectedRevision), current: current.revision });
      project.projectId = projectId;
      project.revision = current ? current.revision + 1 : 1;
      project.updatedAt = now();
      state.revision += 1;
      state.projects.set(projectId, project);
      const event = emit('project.synced', { projectId, title: project.title, source: clean(payload.source, 'human-ui', 120), projectRevision: project.revision }, payload.source || 'human-ui');
      await store.queue;
      return send(response, 200, { status: 'ok', projectId, projectRevision: project.revision, event });
    }

    if (request.method === 'POST' && url.pathname === '/mcp') {
      const output = handleRpc(await readBody(request));
      if (output == null) { response.writeHead(204); return response.end(); }
      return send(response, 200, output);
    }
    return send(response, 404, { error: 'not found' });
  } catch (error) {
    const status = error instanceof RequestError ? error.status : 500;
    if (status >= 500) console.error('[http]', error);
    return send(response, status, { error: error.message || 'internal error', code: error.code || 'internal_error', ...(error.data === undefined ? {} : { data: error.data }) });
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;
server.maxHeadersCount = 100;

async function shutdown(signal) {
  if (stopping) return;
  stopping = true;
  console.error(`[bridge] shutting down on ${signal}`);
  for (const response of state.subscribers) { try { response.end(); } catch {} }
  await new Promise(resolve => server.close(resolve));
  await persist();
  await store.queue;
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', error => { console.error('[uncaughtException]', error); shutdown('uncaughtException'); });
process.on('unhandledRejection', error => console.error('[unhandledRejection]', error));

await restore();
server.listen(PORT, HOST, () => console.error(`Exovia bridge v${VERSION} listening on http://${HOST}:${PORT}`));

const lines = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
lines.on('line', line => {
  if (!line.trim()) return;
  let output;
  try { output = handleRpc(JSON.parse(line)); } catch { output = fail(null, -32700, 'parse error'); }
  if (output) process.stdout.write(`${json(output)}\n`);
});
