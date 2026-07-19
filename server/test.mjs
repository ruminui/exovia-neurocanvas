import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = await mkdtemp(join(tmpdir(), 'neurocanvas-bridge-'));
const port = 18787;
const child = spawn(process.execPath, ['mcp-server.mjs'], {
  cwd: new URL('.', import.meta.url),
  env: { ...process.env, EXOVIA_BRIDGE_PORT: String(port), EXOVIA_BRIDGE_DATA: join(dir, 'state.json') },
  stdio: ['pipe', 'pipe', 'pipe'],
});

const base = `http://127.0.0.1:${port}`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function ready() {
  for (let i = 0; i < 40; i++) {
    try {
      const response = await fetch(`${base}/health`);
      if (response.ok) return;
    } catch {}
    await wait(100);
  }
  throw new Error('bridge did not start');
}

async function post(path, body) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const payload = await response.json();
  return { response, payload };
}

try {
  await ready();
  const health = await fetch(`${base}/health`).then(response => response.json());
  assert.equal(health.status, 'ok');
  assert.equal(health.version, '0.3.0');

  const project = {
    title: 'Integration Test',
    nodes: [
      { id: 'root', title: 'Root', type: 'corpus', text: 'Root evidence', parent: null, keywords: ['root'] },
      { id: 'n1', title: 'Evidence', type: 'note', text: 'Exact searchable evidence', parent: 'root', keywords: ['searchable'] },
    ],
    edges: [{ a: 'root', b: 'n1', type: 'hierarchical', weight: 1 }],
    audit: [],
    events: [],
  };

  const synced = await post('/hooks/project', { projectId: 'test-project', project, source: 'test' });
  assert.equal(synced.response.status, 200);
  assert.equal(synced.payload.projectRevision, 1);

  const list = await post('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} });
  assert.equal(list.payload.result.tools.some(tool => tool.name === 'neurocanvas_delete_node'), true);

  const search = await post('/mcp', { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'neurocanvas_search', arguments: { project_id: 'test-project', query: 'searchable evidence' } } });
  assert.equal(search.payload.result.structuredContent[0].id, 'n1');

  const update = await post('/mcp', { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'neurocanvas_upsert_node', arguments: { project_id: 'test-project', expected_revision: 1, node: { id: 'n2', title: 'AI note', text: 'Created by test' }, reason: 'integration test' } } });
  assert.equal(update.payload.result.structuredContent.project_revision, 2);

  const conflict = await post('/mcp', { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'neurocanvas_upsert_node', arguments: { project_id: 'test-project', expected_revision: 1, node: { id: 'n3', title: 'Conflict' } } } });
  assert.equal(conflict.payload.error.code, -32009);

  const invalid = await post('/hooks/project', { projectId: 'broken', project: { nodes: [{ id: 'root' }], edges: [{ a: 'root', b: 'missing' }] } });
  assert.equal(invalid.response.status, 400);

  console.log('backend integration tests passed');
} finally {
  child.kill('SIGTERM');
  await wait(250);
  await rm(dir, { recursive: true, force: true });
}
