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
});
