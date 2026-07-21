import { test, expect } from '@playwright/test';

test('simple view enlarges controls and hides advanced choices', async ({ page }) => {
  await page.goto('/');
  await page.locator('#simpleModeBtn').click();
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#pulseDemoBtn')).toBeHidden();
  await expect(page.locator('#intentBtn')).toBeHidden();

  const size = await page.locator('#demoBtn').evaluate(element => {
    const rect = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return { height: rect.height, fontSize: parseFloat(style.fontSize) };
  });
  expect(size.height).toBeGreaterThanOrEqual(48);
  expect(size.fontSize).toBeGreaterThanOrEqual(16);
});

test('simple view preference persists after reload', async ({ page }) => {
  await page.goto('/');
  await page.locator('#simpleModeBtn').click();
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/simpleMode/);
  await expect(page.locator('#simpleModeBtn')).toHaveAttribute('aria-pressed', 'true');
});

test('guided help explains the core journey in four steps', async ({ page }) => {
  await page.goto('/');
  await page.locator('#simpleGuideBtn').click();
  await expect(page.locator('#simpleGuideDialog')).toBeVisible();
  await expect(page.locator('#simpleGuideStep')).toHaveText('1 of 4');
  await expect(page.locator('#simpleGuideTitle')).toContainText('Start with your information');
  await expect(page.locator('#demoBtn')).toHaveClass(/simpleGuideTarget/);

  for (let step = 2; step <= 4; step++) {
    await page.locator('#simpleGuideNext').click();
    await expect(page.locator('#simpleGuideStep')).toHaveText(`${step} of 4`);
  }
  await expect(page.locator('#simpleGuideNext')).toHaveText('Done');
  await expect(page.locator('.simpleGuideSafety')).toContainText(/cannot damage the original information/i);
});
