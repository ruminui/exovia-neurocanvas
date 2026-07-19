import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html',
  'src/app.js',
  'src/styles.css',
  'README.md',
  'LICENSE',
  'docs/ARCHITECTURE.md',
  'docs/DEMO_SCRIPT.md',
  'docs/SUBMISSION.md'
];

for (const file of required) {
  await access(file);
}

const html = await readFile('index.html', 'utf8');
const app = await readFile('src/app.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');

const requiredIds = ['canvas', 'demoBtn', 'fileInput', 'pasteBtn', 'exportBtn', 'searchInput', 'searchBtn'];
for (const id of requiredIds) {
  if (!html.includes(`id="${id}"`)) throw new Error(`Missing required UI element: ${id}`);
}

for (const feature of ['buildMap', 'search', 'focusNode', 'wheel', 'fileInput']) {
  if (!app.includes(feature)) throw new Error(`Missing application feature marker: ${feature}`);
}

if (!css.includes('--gold:#d8aa42')) throw new Error('Exovia gold design token is missing');
if (html.includes('OPENAI_API_KEY') || app.includes('sk-proj-')) throw new Error('Potential secret exposed in client files');

console.log('Exovia NeuroCanvas validation passed.');
