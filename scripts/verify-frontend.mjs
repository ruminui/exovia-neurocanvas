import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const RUNTIME_SCRIPTS = ['core.js', 'upgrade.js', 'product.js', 'mobile.js', 'brain.js', 'ai-bridge.js', 'intelligence.js'];
const STYLESHEETS = ['styles.css', 'upgrade.css', 'product.css', 'mobile.css', 'brain.css', 'ai-bridge.css', 'intelligence.css'];
const REQUIRED = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  ...RUNTIME_SCRIPTS.map(file => `src/${file}`),
  ...STYLESHEETS.map(file => `src/${file}`)
];

const failures = [];
const pass = message => console.log(`PASS ${message}`);
const fail = message => { failures.push(message); console.error(`FAIL ${message}`); };

async function exists(relative) {
  try { await fs.access(path.join(ROOT, relative)); return true; }
  catch { return false; }
}

for (const file of REQUIRED) {
  if (await exists(file)) pass(`required asset exists: ${file}`);
  else fail(`missing required asset: ${file}`);
}

const html = await fs.readFile(path.join(ROOT, 'index.html'), 'utf8');
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.webmanifest'), 'utf8'));
const serviceWorker = await fs.readFile(path.join(ROOT, 'sw.js'), 'utf8');

const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
  .map(match => match[1])
  .filter(ref => !/^(https?:|data:|#)/.test(ref));

for (const ref of refs) {
  const normalized = ref.replace(/^\.\//, '').split(/[?#]/)[0];
  if (await exists(normalized)) pass(`HTML reference resolves: ${normalized}`);
  else fail(`broken HTML reference: ${ref}`);
}

const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map(match => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) fail(`duplicate HTML ids: ${duplicateIds.join(', ')}`);
else pass(`HTML ids are unique (${ids.length})`);

for (const script of RUNTIME_SCRIPTS) {
  const token = `src/${script}`;
  if (html.includes(token)) pass(`runtime script wired: ${token}`);
  else fail(`runtime script missing from index.html: ${token}`);
}

for (const stylesheet of STYLESHEETS) {
  const token = `src/${stylesheet}`;
  if (html.includes(token)) pass(`stylesheet wired: ${token}`);
  else fail(`stylesheet missing from index.html: ${token}`);
}

if (manifest.name && manifest.short_name && manifest.start_url && manifest.display) pass('manifest contains installability metadata');
else fail('manifest is missing required installability metadata');

if (manifest.display === 'standalone') pass('manifest uses standalone display mode');
else fail(`unexpected manifest display mode: ${manifest.display}`);

const cachedAssets = [...serviceWorker.matchAll(/["'](\.\/?[^"']+)["']/g)]
  .map(match => match[1].replace(/^\.\//, ''))
  .filter(item => item && !item.includes('exovia-neurocanvas-'));

const requiredCacheAssets = [...new Set(['index.html', 'manifest.webmanifest', ...refs.map(ref => ref.replace(/^\.\//, '').split(/[?#]/)[0])])];
for (const asset of requiredCacheAssets) {
  if (cachedAssets.includes(asset) || asset === './') pass(`service worker covers: ${asset}`);
  else fail(`service worker cache omits: ${asset}`);
}

if (/viewport-fit=cover/.test(html)) pass('mobile safe-area viewport enabled');
else fail('viewport-fit=cover missing');

if (/apple-mobile-web-app-capable/.test(html)) pass('iOS install metadata present');
else fail('iOS install metadata missing');

if (failures.length) {
  console.error(`\nFrontend verification failed with ${failures.length} issue(s).`);
  process.exit(1);
}

console.log('\nFrontend verification passed.');
