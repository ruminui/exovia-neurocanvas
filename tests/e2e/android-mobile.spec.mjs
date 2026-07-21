import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['Pixel 7'] });

async function openFresh(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    localStorage.setItem('exovia:language', 'es');
  });
  await page.goto('/');
}

test('Android first launch uses Spanish, simple mode and purpose chooser', async ({ page }) => {
  await openFresh(page);
  await expect(page.locator('#mobileNav')).toBeVisible();
  await expect(page.locator('#mobileAsk')).toContainText('Preguntar');
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#purposeDialog')).toBeVisible();
});

test('bottom navigation opens explorer, evidence and actions as mobile sheets', async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press('Escape');
  await page.locator('#mobileExplore').click();
  await expect(page.locator('body')).toHaveClass(/mobile-left-open/);
  await page.locator('#mobileEvidence').click();
  await expect(page.locator('body')).toHaveClass(/mobile-right-open/);
  await page.locator('#mobileActions').click();
  await expect(page.locator('body')).toHaveClass(/mobile-actions-open/);
  await expect(page.locator('.toolbar')).toBeVisible();
});

test('Ask focuses the search field and Map returns to the canvas', async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press('Escape');
  await page.locator('#mobileAsk').click();
  await expect(page.locator('#searchInput')).toBeFocused();
  await page.locator('#mobileMap').click();
  await expect(page.locator('body')).not.toHaveClass(/mobile-left-open/);
  await expect(page.locator('#canvas')).toBeVisible();
});

test('all primary Android controls meet 48px touch target baseline', async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press('Escape');
  const sizes = await page.locator('#mobileNav button').evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().height));
  expect(sizes.length).toBe(5);
  for (const height of sizes) expect(height).toBeGreaterThanOrEqual(48);
});

test('portrait and landscape remain usable without horizontal overflow', async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press('Escape');
  for (const viewport of [{ width: 412, height: 915 }, { width: 915, height: 412 }]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
    await expect(page.locator('#mobileNav')).toBeVisible();
  }
});

test('mobile help enables simple mode and opens the guide', async ({ page }) => {
  await openFresh(page);
  await page.keyboard.press('Escape');
  await page.locator('#mobileActions').click();
  await page.locator('#mobileHelp').click();
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleGuideDialog')).toBeVisible();
});
