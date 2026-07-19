import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const source = resolve(process.env.EXOVIA_BRIDGE_DATA || './data/bridge-state.json');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const destination = resolve(process.argv[2] || `./backups/bridge-state-${stamp}.json`);

await mkdir(dirname(destination), { recursive: true });
const raw = await readFile(source);
JSON.parse(raw.toString('utf8'));
await copyFile(source, destination);
const sha256 = createHash('sha256').update(raw).digest('hex');
await writeFile(`${destination}.sha256`, `${sha256}  ${destination.split(/[\\/]/).pop()}\n`, 'utf8');
console.log(JSON.stringify({ status: 'ok', source, destination, bytes: raw.length, sha256 }, null, 2));
