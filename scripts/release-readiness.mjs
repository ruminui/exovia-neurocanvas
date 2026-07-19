import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const checks = [];
const add = (id, status, detail, evidence = []) => checks.push({ id, status, detail, evidence });
const exists = async file => {
  try { await fs.access(path.join(root, file)); return true; }
  catch { return false; }
};
const read = file => fs.readFile(path.join(root, file), 'utf8');

const required = [
  'README.md', 'SECURITY.md', 'CONTRIBUTING.md', 'LICENSE',
  'LEEME_PRIMERO.txt', 'docs/MANUAL_USUARIO.md',
  'docs/GUEST_HELPER_GUIDE.md', 'docs/TESTER_CHECKLIST.md',
  'docs/CAPABILITY_VERIFICATION_MATRIX.md', 'docs/ENTERPRISE_READINESS.md',
  'docs/OPERATIONS_RUNBOOK.md', 'docs/FIRST_PLACE_FINISHER.md',
  'index.html', 'manifest.webmanifest', 'sw.js',
  'src/core.js', 'src/product.js', 'src/intelligence.js', 'src/diagnostics.js',
  'src/ai-bridge.js', 'server/mcp-server.mjs', 'server/test.mjs',
  '.github/workflows/verify.yml'
];

const missing = [];
for (const file of required) if (!(await exists(file))) missing.push(file);
add('required_artifacts', missing.length ? 'FAIL' : 'PASS', missing.length ? `Missing ${missing.length} required artifacts.` : `${required.length} required artifacts are present.`, missing);

const pkg = JSON.parse(await read('package.json'));
add('release_version', /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version) ? 'PASS' : 'FAIL', `Package version: ${pkg.version}`, ['package.json']);
add('node_runtime', String(pkg.engines?.node || '').includes('>=20') ? 'PASS' : 'FAIL', `Node requirement: ${pkg.engines?.node || 'missing'}`, ['package.json']);

const html = await read('index.html');
const runtime = ['core.js', 'product.js', 'intelligence.js', 'diagnostics.js', 'ai-bridge.js'];
const unwired = runtime.filter(file => !html.includes(`src/${file}`));
add('critical_runtime_wiring', unwired.length ? 'FAIL' : 'PASS', unwired.length ? `Critical modules not wired: ${unwired.join(', ')}` : 'Critical runtime modules are wired.', unwired);

const bridge = await read('src/ai-bridge.js');
const bridgeSecurity = [
  bridge.includes("sessionStorage.getItem('exovia:bridgeToken')"),
  bridge.includes('Remote bridge URLs must use HTTPS'),
  bridge.includes("Accept: 'text/event-stream'"),
  bridge.includes('AI_CHANGES_REVIEWED_AND_LOADED')
];
add('human_ai_security', bridgeSecurity.every(Boolean) ? 'PASS' : 'FAIL', `${bridgeSecurity.filter(Boolean).length}/4 bridge security controls detected.`, ['src/ai-bridge.js']);

const intelligence = await read('src/intelligence.js');
const capabilityEntries = ['function answer(', 'function health(', 'function contradictionRadar(', 'function replay(', 'async function judgeMode('];
const capabilityCount = capabilityEntries.filter(marker => intelligence.includes(marker)).length;
add('differentiated_capabilities', capabilityCount === capabilityEntries.length ? 'PASS' : 'FAIL', `${capabilityCount}/${capabilityEntries.length} differentiated intelligence entry points detected.`, ['src/intelligence.js']);

const tests = await read('tests/e2e/neurocanvas.spec.mjs');
const journeys = ['persistent workspace', 'restores the last saved project', 'answer, health and replay', 'System Check', 'mobile viewport'];
const covered = journeys.filter(marker => tests.toLowerCase().includes(marker.toLowerCase()));
add('browser_journey_coverage', covered.length >= 4 ? 'PASS' : 'WARN', `${covered.length}/${journeys.length} essential browser journeys have named coverage.`, ['tests/e2e/neurocanvas.spec.mjs']);

const matrix = await read('docs/CAPABILITY_VERIFICATION_MATRIX.md');
const blocked = [...matrix.matchAll(/\bBLOCKED\b/g)].length;
const partial = [...matrix.matchAll(/\bPARTIAL\b/g)].length;
add('honest_capability_status', matrix.includes('RUNTIME VERIFIED') && matrix.includes('BLOCKED') ? 'PASS' : 'WARN', `Capability matrix records ${partial} PARTIAL and ${blocked} BLOCKED markers.`, ['docs/CAPABILITY_VERIFICATION_MATRIX.md']);

const humanEvidence = {
  externalSystemCheck: process.env.EXOVIA_EXTERNAL_SYSTEM_CHECK === 'PASS',
  publicDeployment: process.env.EXOVIA_PUBLIC_DEPLOYMENT === 'PASS',
  finalVideo: process.env.EXOVIA_FINAL_VIDEO === 'PASS',
  codexFeedbackId: Boolean(process.env.EXOVIA_CODEX_FEEDBACK_ID)
};
for (const [key, value] of Object.entries(humanEvidence)) add(`human_${key}`, value ? 'PASS' : 'BLOCKED', value ? 'Evidence declared by release operator.' : 'Human or external evidence has not been supplied.');

const failed = checks.filter(check => check.status === 'FAIL');
const blockedChecks = checks.filter(check => check.status === 'BLOCKED');
const warnings = checks.filter(check => check.status === 'WARN');
const report = {
  generatedAt: new Date().toISOString(),
  project: pkg.name,
  version: pkg.version,
  verdict: failed.length ? 'FAIL' : blockedChecks.length ? 'TECHNICALLY_READY_HUMAN_GATES_BLOCKED' : warnings.length ? 'READY_WITH_WARNINGS' : 'READY',
  summary: { pass: checks.filter(c => c.status === 'PASS').length, warn: warnings.length, fail: failed.length, blocked: blockedChecks.length },
  checks
};

await fs.mkdir(path.join(root, 'artifacts'), { recursive: true });
await fs.writeFile(path.join(root, 'artifacts', 'release-readiness.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));

if (failed.length) process.exit(1);
