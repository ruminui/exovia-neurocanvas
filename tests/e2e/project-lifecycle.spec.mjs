import { test, expect } from '@playwright/test';

async function createWorkspace(page) {
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
}

test('creates edits deletes and persists a knowledge node', async ({ page }) => {
  await createWorkspace(page);
  const before = await page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length);

  await page.locator('#addNodeBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(before + 1);

  await page.evaluate(() => {
    const map = window.ExoviaRuntime.getMap();
    const node = map.nodes.at(-1);
    window.ExoviaRuntime.focusNode(node.id);
  });
  await page.locator('#editNodeBtn').click();
  await expect(page.locator('#nodeEditorDialog')).toBeVisible();
  await page.locator('#nodeEditTitle').fill('Lifecycle verified note');
  await page.locator('#nodeEditText').fill('Evidence added during the automated lifecycle test.');
  await page.locator('#saveNodeEditBtn').click();

  await page.locator('#saveProjectBtn').click();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('exovia:lastProjectId'))).not.toBeNull();
  await page.reload();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.some(node => node.title === 'Lifecycle verified note'))).toBe(true);

  await page.evaluate(() => {
    const node = window.ExoviaRuntime.getMap().nodes.find(item => item.title === 'Lifecycle verified note');
    window.ExoviaRuntime.focusNode(node.id);
  });
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#deleteNodeBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.some(node => node.title === 'Lifecycle verified note'))).toBe(false);
  await page.locator('#saveProjectBtn').click();
  await page.reload();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.some(node => node.title === 'Lifecycle verified note'))).toBe(false);
});

test('creates and restores a recovery snapshot', async ({ page }) => {
  await createWorkspace(page);
  const originalTitle = await page.evaluate(() => window.ExoviaRuntime.getMap().title);

  await page.locator('#snapshotBtn').click();
  await page.locator('#addNodeBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.some(node => node.title === 'New note'))).toBe(true);

  await page.locator('#workspaceBtn').click();
  await expect(page.locator('#workspaceDialog')).toBeVisible();
  await expect(page.locator('.snapshotRow').first()).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('.snapshotRow').first().click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.some(node => node.title === 'New note'))).toBe(false);
  expect(await page.evaluate(() => window.ExoviaRuntime.getMap().title)).toBe(originalTitle);
});

test('duplicates a project as an independent copy', async ({ page }) => {
  await createWorkspace(page);
  await page.locator('#saveProjectBtn').click();
  await page.locator('#workspaceBtn').click();
  await expect(page.locator('.projectRow')).toHaveCount(1);
  await page.locator('.projectRow [data-action="duplicate"]').click();
  await expect(page.locator('.projectRow')).toHaveCount(2);

  const titles = await page.locator('.projectRow strong').allTextContents();
  expect(titles.some(title => /copy/i.test(title))).toBe(true);

  const records = await page.evaluate(async () => {
    const request = indexedDB.open('exovia-neurocanvas');
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const tx = db.transaction('projects', 'readonly');
    const all = tx.objectStore('projects').getAll();
    return new Promise((resolve, reject) => { all.onsuccess = () => resolve(all.result); all.onerror = () => reject(all.error); });
  });
  expect(records).toHaveLength(2);
  expect(new Set(records.map(record => record.id)).size).toBe(2);
  expect(records.every(record => record.map.projectId === record.id)).toBeTruthy();
});

test('deleting a project removes its snapshots and local project record', async ({ page }) => {
  await createWorkspace(page);
  await page.locator('#snapshotBtn').click();
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('exovia:lastProjectId'))).toBeTruthy();
  const projectId = await page.evaluate(() => localStorage.getItem('exovia:lastProjectId'));
  expect(projectId).toBeTruthy();

  await page.locator('#workspaceBtn').click();
  await expect(page.locator('.projectRow')).toHaveCount(1);
  await expect(page.locator('.snapshotRow')).toHaveCount(1);

  page.once('dialog', dialog => dialog.accept());
  await page.locator('.projectRow [data-action="delete"]').click();
  await expect(page.locator('.projectRow')).toHaveCount(0);

  const remaining = await page.evaluate(async id => {
    const request = indexedDB.open('exovia-neurocanvas');
    const db = await new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const readAll = storeName => new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const [projects, snapshots] = await Promise.all([readAll('projects'), readAll('snapshots')]);
    return { project: projects.some(item => item.id === id), snapshots: snapshots.filter(item => item.projectId === id).length };
  }, projectId);
  expect(remaining.project).toBe(false);
  expect(remaining.snapshots).toBe(0);
});
