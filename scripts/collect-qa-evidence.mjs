import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import process from 'node:process';

const root = process.cwd();
const artifactsDir = path.join(root, 'artifacts');
const filesToCheck = [
  'index.html',
  'package.json',
  'package-lock.json',
  'VALIDAR_EXOVIA.bat',
  'src/core.js',
  'src/product.js',
  'src/intelligence.js',
  'src/diagnostics.js',
  'src/live-room.js',
  'src/live-room.css',
  'sw.js',
  'tests/e2e/neurocanvas.spec.mjs',
  'tests/e2e/project-lifecycle.spec.mjs',
  'tests/e2e/import-export.spec.mjs',
  'tests/e2e/accessibility.spec.mjs',
  'tests/e2e/live-room.spec.mjs'
];

async function exists(relative) {
  try {
    const stat = await fs.stat(path.join(root, relative));
    return { exists: true, sizeBytes: stat.size, modifiedAt: stat.mtime.toISOString() };
  } catch {
    return { exists: false };
  }
}

async function readPackageVersion(relative) {
  try {
    const parsed = JSON.parse(await fs.readFile(path.join(root, relative), 'utf8'));
    return { name: parsed.name, version: parsed.version, node: parsed.engines?.node || null };
  } catch (error) {
    return { error: error.message };
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  purpose: 'External QA evidence for Exovia NeuroCanvas',
  environment: {
    platform: process.platform,
    architecture: process.arch,
    osType: os.type(),
    osRelease: os.release(),
    osVersion: typeof os.version === 'function' ? os.version() : null,
    hostname: os.hostname(),
    cpuModel: os.cpus()?.[0]?.model || null,
    logicalCpuCount: os.cpus()?.length || null,
    totalMemoryBytes: os.totalmem(),
    nodeVersion: process.version,
    npmUserAgent: process.env.npm_config_user_agent || null,
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  },
  packages: {
    root: await readPackageVersion('package.json'),
    bridge: await readPackageVersion('server/package.json')
  },
  repository: {
    workingDirectoryName: path.basename(root),
    files: Object.fromEntries(await Promise.all(filesToCheck.map(async file => [file, await exists(file)])))
  },
  operatorChecklist: {
    cleanZipExtraction: 'PENDING',
    launcherOpenedBrowser: 'PENDING',
    systemCheckPass: 'PENDING',
    fullValidationPass: 'PENDING',
    persistenceAfterBrowserRestart: 'PENDING',
    importExportRoundTrip: 'PENDING',
    liveRoomProjection: 'PENDING',
    mobilePass: 'PENDING',
    offlinePass: 'PENDING',
    demoUnderThreeMinutes: 'PENDING'
  },
  privacyNote: 'This report excludes environment variable values, usernames, home-directory paths, tokens and document contents.'
};

await fs.mkdir(artifactsDir, { recursive: true });
const jsonPath = path.join(artifactsDir, 'qa-environment.json');
const textPath = path.join(artifactsDir, 'qa-environment.txt');
await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

const lines = [
  'EXOVIA NEUROCANVAS — QA ENVIRONMENT',
  `Generated: ${report.generatedAt}`,
  `Platform: ${report.environment.platform} ${report.environment.architecture}`,
  `OS: ${report.environment.osType} ${report.environment.osRelease}`,
  `Node: ${report.environment.nodeVersion}`,
  `Project: ${report.packages.root.name || 'unknown'} ${report.packages.root.version || 'unknown'}`,
  `Required Node: ${report.packages.root.node || 'not declared'}`,
  `Lockfile: ${report.repository.files['package-lock.json'].exists ? 'present' : 'missing'}`,
  '',
  'OPERATOR CHECKLIST',
  ...Object.entries(report.operatorChecklist).map(([key, value]) => `${key}: ${value}`),
  '',
  report.privacyNote
];
await fs.writeFile(textPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`QA evidence generated:\n- ${path.relative(root, jsonPath)}\n- ${path.relative(root, textPath)}`);
