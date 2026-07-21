import { test, expect } from '@playwright/test';

async function openApp(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /new workspace/i }).click();
  await expect(page.locator('#canvas')).toBeVisible();
}

test('accessible list exposes graph ideas without relying on the canvas', async ({ page }) => {
  await openApp(page);
  await page.getByRole('button', { name: /list view/i }).click();
  await expect(page.locator('#accessibleListDialog')).toBeVisible();
  await expect(page.locator('#accessibleGraphList button').first()).toBeVisible();
  await expect(page.locator('#accessibleGraphList')).toContainText(/ideas|relations/i);
});

test('support report excludes project text and personal secrets', async ({ page }) => {
  await openApp(page);
  const report = await page.evaluate(() => window.ExoviaResilience.supportReport());
  expect(report.application).toBe('Exovia NeuroCanvas');
  expect(report.project.nodeCount).toBeGreaterThan(0);
  expect(report.privacy).toMatch(/excludes project text/i);
  expect(JSON.stringify(report)).not.toContain('exovia:bridgeToken');
});

test('emergency recovery record is created after a map change', async ({ page }) => {
  await openApp(page);
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('exovia:map-changed'));
  });
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem('exovia:emergencyRecovery')))).toBe(true);
});

test('large input inspector classifies warning and hard-limit sizes', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => ({
    small: window.ExoviaLargeInput.inspectFile({ name: 'small.txt', size: 1000 }),
    warning: window.ExoviaLargeInput.inspectFile({ name: 'large.txt', size: 3 * 1024 * 1024 }),
    blocked: window.ExoviaLargeInput.inspectFile({ name: 'huge.txt', size: 21 * 1024 * 1024 })
  }));
  expect(result.small.warning).toBe(false);
  expect(result.warning.warning).toBe(true);
  expect(result.warning.blocked).toBe(false);
  expect(result.blocked.blocked).toBe(true);
});

test('multi-tab conflict warning appears after another session announces a change', async ({ page, context }) => {
  await openApp(page);
  const other = await context.newPage();
  await other.goto('/');
  await other.evaluate(() => {
    const channel = new BroadcastChannel('exovia-neurocanvas-session');
    channel.postMessage({ type: 'MAP_CHANGED', sessionId: 'external-session', at: Date.now() });
  });
  await expect(page.locator('#multiTabWarning')).toBeVisible();
  await expect(page.locator('#multiTabWarning')).toContainText(/another tab/i);
});