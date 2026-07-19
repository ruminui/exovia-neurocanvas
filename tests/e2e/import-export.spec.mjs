import { test, expect } from '@playwright/test';

function runtimeFailures(page) {
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    const text = message.text();
    if (!/127\.0\.0\.1:8787|ERR_CONNECTION_REFUSED|Failed to fetch/i.test(text)) failures.push(`console: ${text}`);
  });
  return failures;
}

async function importBuffer(page, name, mimeType, body) {
  await page.locator('#fileInput').setInputFiles({ name, mimeType, buffer: Buffer.from(body, 'utf8') });
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
  return page.evaluate(() => window.ExoviaRuntime.getMap());
}

test('imports TXT, Markdown and Spanish Unicode content as evidence maps', async ({ page }) => {
  const failures = runtimeFailures(page);
  await page.goto('/');

  const txt = await importBuffer(page, 'evidencia.txt', 'text/plain', 'Arquitectura empresarial\n\nLa evidencia se conserva y puede navegarse. Información en español: acción, revisión y auditoría.');
  expect(txt.title).toBe('evidencia');
  expect(txt.nodes.some(node => String(node.text).includes('Información en español'))).toBeTruthy();

  const md = await importBuffer(page, 'plan.md', 'text/markdown', '# Plan de validación\n\n- Ejecutar pruebas\n- Conservar evidencia\n- Corregir regresiones');
  expect(md.title).toBe('plan');
  expect(md.nodes.some(node => String(node.text).includes('Conservar evidencia'))).toBeTruthy();
  expect(failures).toEqual([]);
});

test('imports valid NeuroCanvas JSON and safely reports malformed JSON', async ({ page }) => {
  const failures = runtimeFailures(page);
  await page.goto('/');
  const project = {
    format: 'neurocanvas-v3',
    title: 'Round Trip Fixture',
    kind: 'memory',
    nodes: [
      { id: 'root', type: 'corpus', title: 'Root', text: 'Canonical evidence', summary: 'Canonical evidence', parent: null, keywords: ['evidence'] },
      { id: 'n1', type: 'note', title: 'Decision', text: 'Ship only after verification.', summary: 'Ship only after verification.', parent: 'root', keywords: ['verification'] }
    ],
    edges: [{ a: 'root', b: 'n1', type: 'hierarchical', weight: 1 }],
    events: [],
    audit: []
  };

  const imported = await importBuffer(page, 'project.json', 'application/json', JSON.stringify(project));
  expect(imported.title).toBe('Round Trip Fixture');
  expect(imported.nodes).toHaveLength(2);
  expect(imported.edges).toHaveLength(1);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('#fileInput').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{"nodes": [', 'utf8') });
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.title)).toBe('Round Trip Fixture');
  expect(failures).toEqual([]);
});

test('imports ExiaL and log pulses into an auditable pulse map', async ({ page }) => {
  const failures = runtimeFailures(page);
  await page.goto('/');
  const pulses = [
    '>>1|S>User|A>INGEST|P>{"target":"NeuroCanvas","document":"QA"}',
    '>>2|S>NeuroCanvas|A>VALIDATE|P>{"status":"ok"}',
    '>>3|S>Agent|A>EVIDENCE|P>{"source":"fixture","result":"pass"}'
  ].join('\n');

  for (const name of ['events.exial', 'events.log']) {
    const map = await importBuffer(page, name, 'text/plain', pulses);
    expect(map.kind).toBe('pulse');
    expect(map.events).toHaveLength(3);
    expect(map.audit).toHaveLength(3);
    expect(map.nodes.some(node => node.type === 'event')).toBeTruthy();
  }
  expect(failures).toEqual([]);
});

test('exports the active project and re-imports it without graph loss', async ({ page }) => {
  const failures = runtimeFailures(page);
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
  const before = await page.evaluate(() => {
    const map = window.ExoviaRuntime.getMap();
    return { title: map.title, nodes: map.nodes.length, edges: map.edges.length, evidence: map.nodes.map(node => node.text).join('\n') };
  });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportBtn').click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  const exported = Buffer.concat(chunks).toString('utf8');
  const parsed = JSON.parse(exported);
  expect(parsed.nodes).toHaveLength(before.nodes);
  expect(parsed.edges).toHaveLength(before.edges);

  await page.locator('#fileInput').setInputFiles({ name: 'roundtrip.json', mimeType: 'application/json', buffer: Buffer.from(exported, 'utf8') });
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.title)).toBe(before.title);
  const after = await page.evaluate(() => {
    const map = window.ExoviaRuntime.getMap();
    return { nodes: map.nodes.length, edges: map.edges.length, evidence: map.nodes.map(node => node.text).join('\n') };
  });
  expect(after.nodes).toBe(before.nodes);
  expect(after.edges).toBe(before.edges);
  expect(after.evidence).toBe(before.evidence);
  expect(failures).toEqual([]);
});
