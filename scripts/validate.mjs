import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html',
  'src/core.js',
  'src/product.js',
  'src/intelligence.js',
  'src/diagnostics.js',
  'src/ai-bridge.js',
  'src/styles.css',
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'docs/ARCHITECTURE.md',
  'docs/MASTER_GAP_AUDIT.md',
  'docs/LIVE_COLLABORATION_ARCHITECTURE.md',
  'schemas/live-evidence-room.schema.json'
];

for (const file of required) await access(file);

const html = await readFile('index.html', 'utf8');
const core = await readFile('src/core.js', 'utf8');
const product = await readFile('src/product.js', 'utf8');
const intelligence = await readFile('src/intelligence.js', 'utf8');
const diagnostics = await readFile('src/diagnostics.js', 'utf8');
const bridge = await readFile('src/ai-bridge.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');

const requiredIds = [
  'canvas', 'demoBtn', 'pulseDemoBtn', 'fileInput', 'pasteBtn', 'intentBtn',
  'exportBtn', 'fitBtn', 'searchInput', 'searchBtn'
];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing required UI element: ${id}`);
}

const runtimeFiles = ['core.js', 'product.js', 'intelligence.js', 'diagnostics.js', 'ai-bridge.js'];
for (const file of runtimeFiles) {
  if (!html.includes(`src/${file}`)) throw new Error(`Runtime module is not wired: ${file}`);
}

const markers = [
  [core, 'normalizeMap', 'map normalization'],
  [product, 'saveCurrentProject', 'project persistence'],
  [intelligence, 'function answer(', 'answer engine'],
  [intelligence, 'function health(', 'knowledge health'],
  [intelligence, 'function replay(', 'agent replay'],
  [diagnostics, 'window.ExoviaDiagnostics', 'runtime diagnostics'],
  [bridge, 'AI_CHANGES_REVIEWED_AND_LOADED', 'human review gate']
];
for (const [source, marker, feature] of markers) {
  if (!source.includes(marker)) throw new Error(`Missing active feature marker: ${feature}`);
}

if (!css.includes('--gold:#d8aa42')) throw new Error('Exovia gold design token is missing');
if (!css.includes(':focus-visible')) throw new Error('Visible keyboard focus styling is missing');

const clientSource = [html, core, product, intelligence, diagnostics, bridge].join('\n');
if (/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(clientSource) || clientSource.includes('OPENAI_API_KEY=')) {
  throw new Error('Potential secret exposed in client files');
}

console.log('Exovia NeuroCanvas modular runtime validation passed.');
