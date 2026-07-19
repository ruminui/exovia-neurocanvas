import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export class DurableStore {
  constructor(filePath) {
    this.filePath = resolve(filePath);
    this.queue = Promise.resolve();
    this.lastError = null;
  }

  async load(fallback) {
    try {
      return JSON.parse(await readFile(this.filePath, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT') {
        try { await rename(this.filePath, `${this.filePath}.corrupt-${Date.now()}`); } catch {}
        this.lastError = error.message;
      }
      return fallback;
    }
  }

  save(value) {
    this.queue = this.queue.then(async () => {
      const tmp = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(tmp, `${JSON.stringify(value)}\n`, { encoding: 'utf8', mode: 0o600 });
      await rename(tmp, this.filePath);
      this.lastError = null;
    }).catch(error => {
      this.lastError = error.message;
      console.error('[store]', error);
    });
    return this.queue;
  }
}
