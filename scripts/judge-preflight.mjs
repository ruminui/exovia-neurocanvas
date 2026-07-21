import { access, readFile } from 'node:fs/promises';
import process from 'node:process';

const requiredFiles = [
  'README.md',
  'USER_START_HERE.md',
  'JUDGE_START_HERE.md',
  'LICENSE',
  'package.json',
  'index.html',
  'chatgpt-app/package.json',
  'chatgpt-app/JUDGE_QUICKSTART.md',
  'chatgpt-app/scripts/judge-smoke.mjs',
  'chatgpt-app/scripts/audit-judge-output.mjs',
  'docs/MANUAL_USUARIO.md',
  'docs/JUDGE_SCORECARD.md',
  'release-metadata/android-latest.json',
  'release-metadata/Exovia-NeuroCanvas-Android.apk.sha256'
];

function fail(message) {
  throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

for (const file of requiredFiles) {
  try {
    await access(file);
  } catch {
    fail(`Required judge or user file is missing: ${file}`);
  }
}

const nodeMajor = Number(process.versions.node.split('.')[0]);
if (!Number.isInteger(nodeMajor) || nodeMajor < 22) {
  fail(`Node.js 22 or newer is required for the judge flow. Detected ${process.versions.node}.`);
}

const rootPackage = await readJson('package.json');
const appPackage = await readJson('chatgpt-app/package.json');
const android = await readJson('release-metadata/android-latest.json');
const checksumText = (await readFile('release-metadata/Exovia-NeuroCanvas-Android.apk.sha256', 'utf8')).trim();
const license = await readFile('LICENSE', 'utf8');
const judgeGuide = await readFile('JUDGE_START_HERE.md', 'utf8');
const userGuide = await readFile('USER_START_HERE.md', 'utf8');

if (rootPackage.license !== 'MIT' || appPackage.license !== 'MIT' || !license.startsWith('MIT License')) {
  fail('MIT licensing is not consistently declared for public judging.');
}
if (!rootPackage.scripts?.judge || !rootPackage.scripts?.doctor || !rootPackage.scripts?.start) {
  fail('Root package scripts must expose judge, doctor and start commands.');
}
if (!appPackage.scripts?.judge || !appPackage.scripts?.verify) {
  fail('ChatGPT App package must expose judge and verify commands.');
}
if (!judgeGuide.includes('EXOVIA HACKATHON JUDGE CHECK: PASS')) {
  fail('Judge guide does not state the deterministic success marker.');
}
if (!userGuide.includes('Five-minute first run') || !userGuide.includes('Primer recorrido de cinco minutos')) {
  fail('The bilingual user quickstart is incomplete.');
}
if (android.verified !== true) fail('Android release metadata is not marked verified.');
if (android.tag !== 'android-latest') fail('Android release tag is unexpected.');
if (android.asset !== 'Exovia-NeuroCanvas-Android.apk') fail('Android release asset name is unexpected.');
if (!/^https:\/\/github\.com\/ruminui\/exovia-neurocanvas\/releases\/download\/android-latest\//.test(android.assetUrl || '')) {
  fail('Android release asset URL is missing or unexpected.');
}
if (!/^[a-f0-9]{64}$/.test(android.sha256 || '')) fail('Android SHA-256 is invalid.');
if (!Number.isInteger(android.sizeBytes) || android.sizeBytes <= 0) fail('Android release size is invalid.');
if (!checksumText.startsWith(`${android.sha256}  ${android.asset}`)) {
  fail('Android checksum file does not match release metadata.');
}

const mainUiReady = nodeMajor >= 24;

console.log('');
console.log('============================================================');
console.log(' EXOVIA JUDGE AND USER PREFLIGHT');
console.log('============================================================');
console.log('EXOVIA JUDGE PREFLIGHT: PASS');
console.log(`Node.js: ${process.versions.node} (${mainUiReady ? 'main UI ready' : 'judge flow ready; Node 24+ needed for the main UI'})`);
console.log(`ChatGPT App tools: judge command available (${appPackage.version})`);
console.log(`Public license: MIT`);
console.log(`Android APK: verified, ${android.sizeBytes} bytes`);
console.log(`Android SHA-256: ${android.sha256}`);
console.log(`Android source commit: ${android.sourceCommit}`);
console.log('');
console.log('Fastest judge path:');
console.log('  npm run judge');
console.log('');
console.log('Human product path:');
console.log('  npm install');
console.log('  npm start');
console.log('');
console.log(`Android download: ${android.assetUrl}`);
console.log('============================================================');
