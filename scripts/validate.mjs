import { readFile, access } from 'node:fs/promises';

const required = [
  'index.html','manifest.webmanifest','sw.js','src/core.js','src/product.js','src/intelligence.js','src/diagnostics.js','src/ai-bridge.js','src/live-room.js','src/trust-center.js','src/styles.css','src/live-room.css','src/trust-center.css','src/professional.css','src/exovia-icon.svg',
  'README.md','USER_START_HERE.md','JUDGE_START_HERE.md','LEEME_PRIMERO.txt','LICENSE','SECURITY.md','package.json',
  'docs/ARCHITECTURE.md','docs/MASTER_GAP_AUDIT.md','docs/LIVE_COLLABORATION_ARCHITECTURE.md','docs/MANUAL_USUARIO.md','docs/JUDGE_SCORECARD.md',
  'schemas/live-evidence-room.schema.json','examples/live-evidence-room.json','scripts/configure-android-brand.mjs','scripts/judge-preflight.mjs',
  'release-metadata/android-latest.json','release-metadata/Exovia-NeuroCanvas-Android.apk.sha256'
];
for (const file of required) await access(file);

const html = await readFile('index.html', 'utf8');
const core = await readFile('src/core.js', 'utf8');
const product = await readFile('src/product.js', 'utf8');
const intelligence = await readFile('src/intelligence.js', 'utf8');
const diagnostics = await readFile('src/diagnostics.js', 'utf8');
const bridge = await readFile('src/ai-bridge.js', 'utf8');
const liveRoom = await readFile('src/live-room.js', 'utf8');
const trustCenter = await readFile('src/trust-center.js', 'utf8');
const css = await readFile('src/styles.css', 'utf8');
const liveCss = await readFile('src/live-room.css', 'utf8');
const trustCss = await readFile('src/trust-center.css', 'utf8');
const professionalCss = await readFile('src/professional.css', 'utf8');
const manifest = JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
const roomExample = JSON.parse(await readFile('examples/live-evidence-room.json', 'utf8'));
const rootPackage = JSON.parse(await readFile('package.json', 'utf8'));
const androidRelease = JSON.parse(await readFile('release-metadata/android-latest.json', 'utf8'));
const androidChecksum = (await readFile('release-metadata/Exovia-NeuroCanvas-Android.apk.sha256', 'utf8')).trim();
const userGuide = await readFile('USER_START_HERE.md', 'utf8');
const judgeGuide = await readFile('JUDGE_START_HERE.md', 'utf8');
const scorecard = await readFile('docs/JUDGE_SCORECARD.md', 'utf8');
const manual = await readFile('docs/MANUAL_USUARIO.md', 'utf8');

const requiredIds = ['canvas','demoBtn','pulseDemoBtn','fileInput','pasteBtn','intentBtn','exportBtn','fitBtn','searchInput','searchBtn','homeBtn','trustCenterBtn','capsuleBtn','homeStartBtn','homeVerifyBtn','homeCapsuleBtn'];
for (const id of requiredIds) if (!html.includes(`id="${id}"`)) throw new Error(`Missing required UI element: ${id}`);

const runtimeFiles = ['core.js','product.js','intelligence.js','diagnostics.js','ai-bridge.js','live-room.js','trust-center.js'];
for (const file of runtimeFiles) if (!html.includes(`src/${file}`)) throw new Error(`Runtime module is not wired: ${file}`);
for (const file of ['src/live-room.css','src/trust-center.css','src/professional.css']) if (!html.includes(file)) throw new Error(`Required visual system is not wired: ${file}`);

const markers = [
  [core,'function buildMap(','map construction'],[product,'function normalizeMap(','map normalization'],[product,'async function saveCurrent(','project persistence'],[intelligence,'function answer(','answer engine'],[intelligence,'function health(','knowledge health'],[intelligence,'function replay(','agent replay'],[diagnostics,'window.ExoviaDiagnostics','runtime diagnostics'],[bridge,'AI_CHANGES_REVIEWED_AND_LOADED','human review gate'],[liveRoom,'function validateRoom(','live room validation'],[liveRoom,'function projectRoom(','live room projection'],[liveRoom,'window.ExoviaLiveRoom','live room public API'],[trustCenter,'function scanMap(','AI trust scan'],[trustCenter,'function buildCapsule(','portable context capsule'],[trustCenter,'async function buildProofPack(','cryptographic proof pack'],[trustCenter,'function routeRecommendation(','provider-neutral safe router'],[trustCenter,'window.ExoviaTrustCenter','AI reliability public API']
];
for (const [source, marker, feature] of markers) if (!source.includes(marker)) throw new Error(`Missing active feature marker: ${feature}`);

if (!css.includes('--gold:#d8aa42')) throw new Error('Exovia gold design token is missing');
if (!css.includes(':focus-visible')) throw new Error('Visible keyboard focus styling is missing');
if (!liveCss.includes('.liveRoomDialog') || !liveCss.includes('.liveTimeline')) throw new Error('Living Evidence Room visual system is incomplete');
if (!trustCss.includes('.trustCenterDialog') || !trustCss.includes('.trustScoreRing')) throw new Error('AI Reliability Center visual system is incomplete');
if (!professionalCss.includes('.homeHero') || !professionalCss.includes('.problemGrid')) throw new Error('Professional application home is incomplete');
if (roomExample.format !== 'exovia-live-room-v1') throw new Error('Invalid Living Evidence Room example format');
if (!roomExample.roomId || !roomExample.title || !Number.isInteger(roomExample.revision)) throw new Error('Living Evidence Room example metadata is incomplete');
for (const key of ['participants','evidenceAssets','decisions','executions','events']) if (!Array.isArray(roomExample[key])) throw new Error(`Living Evidence Room example is missing ${key}`);
if (!Array.isArray(manifest.icons) || !manifest.icons.some(icon => icon.src === 'src/exovia-icon.svg')) throw new Error('Professional Exovia application icon is missing from the manifest');
if (!Array.isArray(manifest.shortcuts) || manifest.shortcuts.length < 2) throw new Error('AI reliability app shortcuts are missing');

if (!rootPackage.scripts?.doctor || !rootPackage.scripts?.judge || !rootPackage.scripts?.start) throw new Error('Judge, doctor or start command is missing');
if (rootPackage.engines?.node !== '>=24') throw new Error('Main product Node.js requirement must remain explicit');
if (!userGuide.includes('Five-minute first run') || !userGuide.includes('Primer recorrido de cinco minutos')) throw new Error('Bilingual first-run guide is incomplete');
if (!judgeGuide.includes('EXOVIA JUDGE PREFLIGHT: PASS') || !judgeGuide.includes('EXOVIA HACKATHON JUDGE CHECK: PASS')) throw new Error('Judge guide success markers are incomplete');
for (const criterion of ['Technological implementation','Design and complete product experience','Potential impact','Quality and originality of the idea']) if (!scorecard.includes(criterion)) throw new Error(`Judge scorecard is missing: ${criterion}`);
if (!manual.includes('Node.js 24 LTS') || !manual.includes('`.exo`')) throw new Error('Spanish user manual is stale');
if (androidRelease.verified !== true || !/^[a-f0-9]{64}$/.test(androidRelease.sha256 || '')) throw new Error('Verified Android release metadata is invalid');
if (!androidChecksum.startsWith(`${androidRelease.sha256}  ${androidRelease.asset}`)) throw new Error('Android checksum does not match release metadata');

const clientSource = [html,core,product,intelligence,diagnostics,bridge,liveRoom,trustCenter].join('\n');
if (/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(clientSource) || clientSource.includes('OPENAI_API_KEY=')) throw new Error('Potential secret exposed in client files');
console.log('Exovia NeuroCanvas professional AI reliability runtime and judge/user readiness validation passed.');
