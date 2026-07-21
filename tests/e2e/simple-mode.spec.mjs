import { test, expect } from '@playwright/test';

async function openAsFirstTimeUser(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('exovia:simpleMode');
    localStorage.removeItem('exovia:language');
  });
  await page.goto('/');
}

test('first-time users start with fewer choices and plain labels', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#simpleModeBtn')).toHaveText('More options');
  await expect(page.locator('#pulseDemoBtn')).toBeHidden();
  await expect(page.locator('#intentBtn')).toBeHidden();
  await expect(page.locator('#snapshotBtn')).toBeHidden();
  await expect(page.locator('#pasteBtn')).toHaveText('Add information');
  await expect(page.locator('#trustCenterBtn')).toHaveText('Check AI');
  await expect(page.locator('#capsuleBtn')).toHaveText('Save context');

  const size = await page.locator('#pasteBtn').evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { height: rect.height, fontSize: parseFloat(style.fontSize) };
  });
  expect(size.height).toBeGreaterThanOrEqual(48);
  expect(size.fontSize).toBeGreaterThanOrEqual(16);
});

test('the selected interface level persists after reload', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await page.locator('#simpleModeBtn').click();
  await expect(page.locator('html')).not.toHaveClass(/simpleMode/);
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'false');
});

test('guided help explains the complete journey in three steps', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await page.locator('#simpleGuideBtn').click();
  await expect(page.locator('#simpleGuideDialog')).toBeVisible();
  await expect(page.locator('#simpleGuideStep')).toHaveText('1 of 3');
  await expect(page.locator('#simpleGuideTitle')).toContainText('Add the original information');
  await expect(page.locator('#pasteBtn')).toHaveClass(/simpleGuideTarget/);

  await page.locator('#simpleGuideNext').click();
  await expect(page.locator('#simpleGuideStep')).toHaveText('2 of 3');
  await expect(page.locator('#trustCenterBtn')).toHaveClass(/simpleGuideTarget/);

  await page.locator('#simpleGuideNext').click();
  await expect(page.locator('#simpleGuideStep')).toHaveText('3 of 3');
  await expect(page.locator('#capsuleBtn')).toHaveClass(/simpleGuideTarget/);
  await expect(page.locator('#simpleGuideNext')).toHaveText('Done');
  await expect(page.locator('.simpleGuideSafety')).toContainText(/cannot damage the original information/i);
});

test('the primary home action loads the sixty-second risk example', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await page.locator('#homeStartBtn').click();
  await expect(page.locator('#trustCenterDialog')).toBeVisible();
  const map = await page.evaluate(() => window.ExoviaRuntime?.getMap?.());
  expect(map?.title).toBe('Demo: risky AI answer');
  expect(map?.nodes.some(node => node.id === 'demo-private')).toBe(true);
  expect(map?.nodes.some(node => node.id === 'demo-injection')).toBe(true);
});
