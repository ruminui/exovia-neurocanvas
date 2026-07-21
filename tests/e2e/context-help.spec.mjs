import { test, expect, devices } from '@playwright/test';

test('floating help explains main controls and can be disabled', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pasteBtn').focus();
  await expect(page.locator('#contextHelpCard')).toBeVisible();
  await expect(page.locator('#contextHelpCard')).toContainText(/Pegar información/i);
  await expect(page.locator('#contextHelpCard')).toContainText(/convertirlos en un mapa visual/i);
  await page.locator('#contextHelpToggle').click();
  await expect(page.locator('#contextHelpCard')).toBeHidden();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('exovia:contextHelp'))).toBe('false');
});

const { defaultBrowserType: _defaultBrowserType, ...pixel7Context } = devices['Pixel 7'];

test.describe('Android contextual help', () => {
  test.use(pixel7Context);

  test('tap on mobile navigation shows a bottom floating explanation', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Escape');
    await page.locator('#mobileEvidence').tap();
    await expect(page.locator('#contextHelpCard')).toBeVisible();
    await expect(page.locator('#contextHelpCard')).toContainText(/Fuente/i);
    const box = await page.locator('#contextHelpCard').boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(915);
  });
});
