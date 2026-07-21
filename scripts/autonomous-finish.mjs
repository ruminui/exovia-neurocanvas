import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const artifactsDir = path.join(root, 'artifacts', 'solo-finish');
const startedAt = new Date().toISOString();
const results = [];

async function exists(file) {
  try { await fs.access(path.join(root, file)); return true; } catch { return false; }
}

function run(name, command, args, cwd = root) {
  return new Promise(resolve => {
    const started = Date.now();
    const child = spawn(command, args, { cwd, shell: process.platform === 'win32', env: process.env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { const text = chunk.toString(); stdout += text; process.stdout.write(text); });
    child.stderr.on('data', chunk => { const text = chunk.toString(); stderr += text; process.stderr.write(text); });
    child.on('error', error => resolve({ name, status: 'FAIL', exitCode: null, durationMs: Date.now() - started, stdout, stderr: `${stderr}\n${error.stack || error.message}`.trim() }));
    child.on('close', code => resolve({ name, status: code === 0 ? 'PASS' : 'FAIL', exitCode: code, durationMs: Date.now() - started, stdout, stderr }));
  });
}

async function main() {
  await fs.mkdir(artifactsDir, { recursive: true });

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  results.push({ name: 'Node 24+', status: nodeMajor >= 24 ? 'PASS' : 'FAIL', detail: process.version });

  const hasLock = await exists('package-lock.json');
  results.push({
    name: 'Authentic package lock',
    status: hasLock ? 'PASS' : 'BLOCKED',
    detail: hasLock ? 'package-lock.json found.' : 'Generate with Node 24 and npm; this runner will not fabricate it.'
  });

  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const phases = [
    ['Validate repository', npm, ['run', 'validate'], root],
    ['Verify frontend integration', npm, ['run', 'verify:static'], root],
    ['Generate readiness report', npm, ['run', 'readiness'], root],
    ['Run root tests', npm, ['test'], root],
    ['Run backend verification', npm, ['run', 'verify'], path.join(root, 'server')]
  ];

  if (process.env.EXOVIA_SKIP_E2E !== '1') phases.push(['Run browser tests', npm, ['run', 'test:e2e'], root]);
  else results.push({ name: 'Run browser tests', status: 'SKIPPED', detail: 'EXOVIA_SKIP_E2E=1' });

  for (const [name, command, args, cwd] of phases) {
    const result = await run(name, command, args, cwd);
    results.push(result);
    await fs.writeFile(path.join(artifactsDir, `${String(results.length).padStart(2, '0')}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.log`), `${result.stdout || ''}\n${result.stderr || ''}`, 'utf8');
  }

  const failed = results.filter(item => item.status === 'FAIL');
  const blocked = results.filter(item => item.status === 'BLOCKED');
  const report = {
    startedAt,
    finishedAt: new Date().toISOString(),
    platform: process.platform,
    architecture: process.arch,
    node: process.version,
    verdict: failed.length ? 'FAIL' : blocked.length ? 'TECHNICALLY_CHECKED_WITH_BLOCKERS' : 'PASS',
    summary: {
      pass: results.filter(item => item.status === 'PASS').length,
      fail: failed.length,
      blocked: blocked.length,
      skipped: results.filter(item => item.status === 'SKIPPED').length
    },
    results
  };

  await fs.writeFile(path.join(artifactsDir, 'solo-finish-report.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`\nSolo finish verdict: ${report.verdict}`);
  console.log(`Evidence: ${path.relative(root, path.join(artifactsDir, 'solo-finish-report.json'))}`);
  if (failed.length) process.exit(1);
}

main().catch(async error => {
  await fs.mkdir(artifactsDir, { recursive: true });
  await fs.writeFile(path.join(artifactsDir, 'fatal-error.log'), `${error.stack || error.message}\n`, 'utf8');
  console.error(error);
  process.exit(1);
});
