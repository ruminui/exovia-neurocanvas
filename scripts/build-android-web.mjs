import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const out = path.join(root, 'dist');
const files = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'src',
  'examples'
];

async function copy(relative) {
  const source = path.join(root, relative);
  const target = path.join(out, relative);
  const stat = await fs.stat(source);
  if (stat.isDirectory()) {
    await fs.cp(source, target, { recursive: true });
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.copyFile(source, target);
  }
}

await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
for (const item of files) await copy(item);

const indexPath = path.join(out, 'index.html');
let html = await fs.readFile(indexPath, 'utf8');
html = html.replace(
  "<script>if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => {});</script>",
  "<script>if ('serviceWorker' in navigator && !window.Capacitor?.isNativePlatform?.()) navigator.serviceWorker.register('./sw.js').catch(() => {});</script>"
);
await fs.writeFile(indexPath, html, 'utf8');

const marker = {
  builtAt: new Date().toISOString(),
  target: 'android-capacitor',
  version: JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version
};
await fs.writeFile(path.join(out, 'android-build.json'), `${JSON.stringify(marker, null, 2)}\n`, 'utf8');
console.log(`Android web bundle created in ${out}`);
