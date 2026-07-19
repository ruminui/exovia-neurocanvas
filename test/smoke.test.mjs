import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');

test('application shell exposes the primary flows', () => {
  for (const id of ['demoBtn', 'fileInput', 'pasteBtn', 'exportBtn', 'fitBtn', 'searchBtn', 'canvas']) {
    assert.match(html, new RegExp(`id=["']${id}["']`));
  }
});

test('offline graph engine preserves core behaviors', () => {
  for (const marker of ['function buildMap', 'function chunks', 'function similarity', 'function search', 'function focusNode']) {
    assert.ok(app.includes(marker), `Expected ${marker}`);
  }
});

test('client bundle contains no pasted OpenAI secret', () => {
  assert.equal(/sk-(?:proj-)?[A-Za-z0-9_-]{20,}/.test(`${html}\n${app}`), false);
});
