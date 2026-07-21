import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const RUNTIME_SCRIPTS = ['core.js','upgrade.js','product.js','mobile.js','brain.js','ai-bridge.js','intelligence.js','diagnostics.js','live-room.js','clarity.js','simple-mode.js','use-cases.js','safety-net.js'];
const STYLESHEETS = ['styles.css','upgrade.css','product.css','mobile.css','brain.css','ai-bridge.css','intelligence.css','diagnostics.css','live-room.css','clarity.css','simple-mode.css','use-cases.css','safety-net.css'];
const REQUIRED = [
  'index.html','manifest.webmanifest','sw.js','README.md','SECURITY.md','CONTRIBUTING.md','LEEME_PRIMERO.txt',
  'INICIAR_EXOVIA.bat','INICIAR_EXOVIA.command','INICIAR_EXOVIA.sh','docs/MANUAL_USUARIO.md','docs/GUEST_HELPER_GUIDE.md',
  'docs/TESTER_CHECKLIST.md','docs/MARCE_GASTON_HELP_PLAN.md','docs/VIDEO_SCRIPT_MARCE.md','docs/SIMPLE_USE_GUIDE.md',
  'docs/CAPABILITY_VERIFICATION_MATRIX.md','docs/LIVE_COLLABORATION_ARCHITECTURE.md','schemas/live-evidence-room.schema.json',
  'examples/live-evidence-room.json','tests/e2e/judge-clarity.spec.mjs','tests/e2e/simple-mode.spec.mjs',
  'tests/e2e/use-cases.spec.mjs','tests/e2e/safety-net.spec.mjs',
  ...RUNTIME_SCRIPTS.map(file => `src/${file}`), ...STYLESHEETS.map(file => `src/${file}`)
];

const failures=[]; const pass=m=>console.log(`PASS ${m}`); const fail=m=>{failures.push(m);console.error(`FAIL ${m}`)};
async function exists(relative){try{await fs.access(path.join(ROOT,relative));return true}catch{return false}}
for(const file of REQUIRED)(await exists(file))?pass(`required asset exists: ${file}`):fail(`missing required asset: ${file}`);

const html=await fs.readFile(path.join(ROOT,'index.html'),'utf8');
const manifest=JSON.parse(await fs.readFile(path.join(ROOT,'manifest.webmanifest'),'utf8'));
const serviceWorker=await fs.readFile(path.join(ROOT,'sw.js'),'utf8');
const intelligence=await fs.readFile(path.join(ROOT,'src/intelligence.js'),'utf8');
const diagnostics=await fs.readFile(path.join(ROOT,'src/diagnostics.js'),'utf8');
const bridge=await fs.readFile(path.join(ROOT,'src/ai-bridge.js'),'utf8');
const liveRoom=await fs.readFile(path.join(ROOT,'src/live-room.js'),'utf8');
const clarity=await fs.readFile(path.join(ROOT,'src/clarity.js'),'utf8');
const simpleMode=await fs.readFile(path.join(ROOT,'src/simple-mode.js'),'utf8');
const useCases=await fs.readFile(path.join(ROOT,'src/use-cases.js'),'utf8');
const safetyNet=await fs.readFile(path.join(ROOT,'src/safety-net.js'),'utf8');
const simpleStyles=await fs.readFile(path.join(ROOT,'src/simple-mode.css'),'utf8');
const useCaseStyles=await fs.readFile(path.join(ROOT,'src/use-cases.css'),'utf8');
const safetyStyles=await fs.readFile(path.join(ROOT,'src/safety-net.css'),'utf8');
const security=await fs.readFile(path.join(ROOT,'SECURITY.md'),'utf8');
const videoScript=await fs.readFile(path.join(ROOT,'docs/VIDEO_SCRIPT_MARCE.md'),'utf8');

const refs=[...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m=>m[1]).filter(ref=>!/^(https?:|data:|#)/.test(ref));
for(const ref of refs){const normalized=ref.replace(/^\.\//,'').split(/[?#]/)[0];(await exists(normalized))?pass(`HTML reference resolves: ${normalized}`):fail(`broken HTML reference: ${ref}`)}
const ids=[...html.matchAll(/\sid=["']([^"']+)["']/g)].map(m=>m[1]);
const duplicateIds=[...new Set(ids.filter((id,index)=>ids.indexOf(id)!==index))];
duplicateIds.length?fail(`duplicate HTML ids: ${duplicateIds.join(', ')}`):pass(`HTML ids are unique (${ids.length})`);
for(const script of RUNTIME_SCRIPTS)html.includes(`src/${script}`)?pass(`runtime script wired: src/${script}`):fail(`runtime script missing from index.html: src/${script}`);
for(const stylesheet of STYLESHEETS)html.includes(`src/${stylesheet}`)?pass(`stylesheet wired: src/${stylesheet}`):fail(`stylesheet missing from index.html: src/${stylesheet}`);

const capabilities=[
 ['answer engine',intelligence.includes('function answer(')],['knowledge health',intelligence.includes('function health(')],
 ['contradiction radar',intelligence.includes('function contradictionRadar(')],['agent replay',intelligence.includes('function replay(')],
 ['guided judge mode',intelligence.includes('async function judgeMode(')],['runtime diagnostics',diagnostics.includes('async function runDiagnostics(')],
 ['live room validation',liveRoom.includes('function validateRoom(')],['judge clarity API',clarity.includes('window.ExoviaClarity')],
 ['simple mode API',simpleMode.includes('window.ExoviaSimpleMode')],['purpose chooser API',useCases.includes('window.ExoviaUseCases')],
 ['safety net API',safetyNet.includes('window.ExoviaSafetyNet')],['session undo',safetyNet.includes('function undo(')],
 ['session redo',safetyNet.includes('function redo(')],['automatic save status',safetyNet.includes('Saving automatically')]
];
for(const [name,present] of capabilities)present?pass(`capability entry point: ${name}`):fail(`missing capability entry point: ${name}`);

const securityMarkers=[
 ['bridge token is session-only',bridge.includes("sessionStorage.getItem('exovia:bridgeToken')")&&!bridge.includes("localStorage.setItem('exovia:bridgeToken'")],
 ['remote bridge requires HTTPS',bridge.includes('Remote bridge URLs must use HTTPS')],['human review before AI load',bridge.includes('AI_CHANGES_REVIEWED_AND_LOADED')],
 ['security policy documents boundaries',/Do not expose the local bridge directly to the public Internet/i.test(security)]
];
for(const [name,present] of securityMarkers)present?pass(`security invariant: ${name}`):fail(`missing security invariant: ${name}`);

const uxMarkers=[
 ['problem visible',/answers you can prove/i.test(html)],['exact evidence visible',/exact evidence/i.test(html)],
 ['video problem statement',/Teams now work with documents/i.test(videoScript)],['large touch targets',simpleStyles.includes('min-height:48px')],
 ['purpose-first onboarding',simpleMode.includes('Choose what you want to organize')],['family template',useCases.includes("id: 'family'")],
 ['no-wrong-choice reassurance',useCases.includes('There is no wrong choice')],['save indicator style',safetyStyles.includes('.safeSaveStatus')],
 ['saved state style',safetyStyles.includes('data-state="saved"')],['undo controls visible in simple mode',safetyStyles.includes('.simpleMode .canvasTools #safeUndoBtn')]
];
for(const [name,present] of uxMarkers)present?pass(`usability: ${name}`):fail(`missing usability marker: ${name}`);

(manifest.name&&manifest.short_name&&manifest.start_url&&manifest.display)?pass('manifest contains installability metadata'):fail('manifest is missing required installability metadata');
manifest.display==='standalone'?pass('manifest uses standalone display mode'):fail(`unexpected manifest display mode: ${manifest.display}`);
const cachedAssets=[...serviceWorker.matchAll(/["'](\.\/?[^"']+)["']/g)].map(m=>m[1].replace(/^\.\//,'')).filter(item=>item&&!item.includes('exovia-neurocanvas-'));
const requiredCacheAssets=[...new Set(['index.html','manifest.webmanifest','examples/live-evidence-room.json',...refs.map(ref=>ref.replace(/^\.\//,'').split(/[?#]/)[0])])];
for(const asset of requiredCacheAssets)(cachedAssets.includes(asset)||asset==='./')?pass(`service worker covers: ${asset}`):fail(`service worker cache omits: ${asset}`);
/viewport-fit=cover/.test(html)?pass('mobile safe-area viewport enabled'):fail('viewport-fit=cover missing');
/apple-mobile-web-app-capable/.test(html)?pass('iOS install metadata present'):fail('iOS install metadata missing');
if(failures.length){console.error(`\nFrontend verification failed with ${failures.length} issue(s).`);process.exit(1)}
console.log('\nFrontend verification passed.');