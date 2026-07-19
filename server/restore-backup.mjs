import { copyFile, mkdir, readFile, rename, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const backup = process.argv[2] && resolve(process.argv[2]);
if (!backup) throw new Error('Usage: node restore-backup.mjs <backup.json>');
const target = resolve(process.env.EXOVIA_BRIDGE_DATA || './data/bridge-state.json');
const raw = await readFile(backup);
const parsed = JSON.parse(raw.toString('utf8'));
if (!parsed || !Array.isArray(parsed.projects) || !Array.isArray(parsed.events)) throw new Error('Backup does not match the NeuroCanvas bridge-state shape.');
await mkdir(dirname(target), { recursive: true });
try {
  await stat(target);
  await copyFile(target, `${target}.pre-restore-${Date.now()}.bak`);
} catch {}
const temp = `${target}.${process.pid}.restore.tmp`;
await copyFile(backup, temp);
await rename(temp, target);
const sha256 = createHash('sha256').update(raw).digest('hex');
console.log(JSON.stringify({ status: 'ok', backup, target, projects: parsed.projects.length, events: parsed.events.length, sha256 }, null, 2));
