import { test, expect } from '@playwright/test';

test('shows a clear automatic save state', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await expect(page.locator('#safeSaveStatus')).toBeVisible();
  await expect.poll(async () => page.locator('#safeSaveStatus').getAttribute('data-state')).toMatch(/saving|saved/);
  await expect.poll(async () => page.locator('#safeSaveStatus strong').textContent(), { timeout: 7000 }).toMatch(/saved|ready/i);
});

test('undo and redo restore graph changes in the current session', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demoBtn').click();
  const initialCount = await page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length);

  await page.locator('#addNodeBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount + 1);
  await expect(page.locator('#safeUndoBtn')).toBeEnabled();

  await page.locator('#safeUndoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount);
  await expect(page.locator('#safeRedoBtn')).toBeEnabled();

  await page.locator('#safeRedoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount + 1);
});

test('keyboard shortcuts provide undo and redo', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demoBtn').click();
  const initialCount = await page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length);
  await page.locator('#addNodeBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount + 1);
  await page.keyboard.press('Control+z');
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount);
  await page.keyboard.press('Control+y');
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length)).toBe(initialCount + 1);
});
