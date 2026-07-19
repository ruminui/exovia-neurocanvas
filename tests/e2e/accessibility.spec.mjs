import { test, expect } from '@playwright/test';

test('core controls are reachable by keyboard with visible focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demoBtn').focus();
  await expect(page.locator('#demoBtn')).toBeFocused();

  const focusRing = await page.locator('#demoBtn').evaluate(element => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusRing.outlineStyle).not.toBe('none');
  expect(parseFloat(focusRing.outlineWidth)).toBeGreaterThan(0);

  await page.keyboard.press('Tab');
  await expect(page.locator('#pulseDemoBtn')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.fileButton')).toBeFocused();
});

test('import dialog has an accessible name and traps tab focus', async ({ page }) => {
  await page.goto('/');
  await page.locator('#pasteBtn').click();
  const dialog = page.locator('#pasteDialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-labelledby', 'pasteDialogTitle');
  await expect(page.locator('#pasteDialogTitle')).toHaveText(/create or import a project/i);

  await page.locator('#docTitle').focus();
  await expect(page.locator('#docTitle')).toBeFocused();
  for (let index = 0; index < 8; index++) await page.keyboard.press('Tab');
  const activeInside = await page.evaluate(() => document.querySelector('#pasteDialog')?.contains(document.activeElement));
  expect(activeInside).toBe(true);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#pasteBtn')).toBeFocused();
});

test('canvas and file input expose accessible names', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#canvas')).toHaveAttribute('tabindex', '0');
  await expect(page.locator('#canvas')).toHaveAttribute('aria-label', /interactive knowledge graph/i);
  await expect(page.locator('#fileInput')).toHaveAttribute('aria-label', /open a neurocanvas source or project file/i);
});

test('reduced-motion preference disables meaningful transition duration', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const duration = await page.locator('#demoBtn').evaluate(element => getComputedStyle(element).transitionDuration);
  expect(duration).toMatch(/0\.001ms|0s/);
  await context.close();
});
