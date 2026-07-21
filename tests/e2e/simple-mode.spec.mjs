import { test, expect } from '@playwright/test';

async function openAsFirstTimeUser(page) {
  await page.addInitScript(() => {
    localStorage.removeItem('exovia:simpleMode');
    localStorage.removeItem('exovia:language');
  });
  await page.goto('/');
}

test('first-time users start with a clean full-width home and plain language', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#leftPanel,.leftPanel')).toBeHidden();
  await expect(page.locator('.rightPanel')).toBeHidden();
  await expect(page.locator('#languageBtn')).toBeVisible();
  await expect(page.locator('#pasteBtn')).toBeHidden();
  await expect(page.locator('#pulseDemoBtn')).toBeHidden();
  await expect(page.locator('#intentBtn')).toBeHidden();
  await expect(page.locator('#snapshotBtn')).toBeHidden();
  await expect(page.locator('#homeStartBtn')).toContainText('60-second example');
  await expect(page.locator('#homeImportBtn')).toContainText('own information');

  const layout = await page.evaluate(() => {
    const title = document.querySelector('#emptyState h1').getBoundingClientRect();
    const start = document.querySelector('#homeStartBtn').getBoundingClientRect();
    const own = document.querySelector('#homeImportBtn').getBoundingClientRect();
    return {
      titleInsideViewport: title.left >= 0 && title.right <= innerWidth && title.top >= 0,
      titleWidth: title.width,
      startHeight: start.height,
      ownHeight: own.height,
      visibleToolbarControls: [...document.querySelectorAll('.toolbar > *')].filter(element => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      }).map(element => element.id || element.className)
    };
  });
  expect(layout.titleInsideViewport).toBe(true);
  expect(layout.titleWidth).toBeGreaterThan(300);
  expect(layout.startHeight).toBeGreaterThanOrEqual(48);
  expect(layout.ownHeight).toBeGreaterThanOrEqual(48);
  expect(layout.visibleToolbarControls).toEqual(['languageBtn']);
});

test('the selected interface level persists after reload', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await page.evaluate(() => window.ExoviaTrustCenter.closeHome());
  await page.locator('#simpleModeBtn').click();
  await expect(page.locator('html')).not.toHaveClass(/simpleMode/);
  await page.reload();
  await expect(page.locator('html')).not.toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'false');
});

test('guided help explains the complete journey in three steps', async ({ page }) => {
  await openAsFirstTimeUser(page);
  await page.locator('#homeGuidedBtn').click();
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
