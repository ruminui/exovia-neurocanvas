import { test, expect } from '@playwright/test';

test('switches the main interface to plain Spanish and remembers the choice', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#languageBtn')).toBeVisible();
  await page.locator('#languageBtn').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('#languageBtn')).toHaveText('English');
  await expect(page.locator('#demoBtn')).toHaveText('Nuevo ejemplo');
  await expect(page.locator('#pasteBtn')).toHaveText('Pegar información');
  await expect(page.locator('#exportBtn')).toHaveText('Exportar copia');
  await expect(page.locator('#searchInput')).toHaveAttribute('placeholder', /pregunta o concepto/i);
  await expect(page.locator('.leftPanel .panelTitle').first()).toHaveText('Explorador de información');
  await expect(page.locator('.rightPanel .panelTitle')).toHaveText('Fuente y evidencia');

  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.locator('#demoBtn')).toHaveText('Nuevo ejemplo');
});

test('returns to English without changing project data', async ({ page }) => {
  await page.goto('/');
  await page.locator('#languageBtn').click();
  await page.locator('#demoBtn').click();
  const before = await page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0);
  expect(before).toBeGreaterThan(0);

  await page.locator('#languageBtn').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#languageBtn')).toHaveText('Español');
  await expect(page.locator('#demoBtn')).toHaveText('New workspace');

  const after = await page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0);
  expect(after).toBe(before);
});

test('language API supports only English and Spanish', async ({ page }) => {
  await page.goto('/');
  const state = await page.evaluate(() => ({
    supported: window.ExoviaLanguage.supported,
    current: window.ExoviaLanguage.get()
  }));
  expect(state.supported).toEqual(['en', 'es']);
  expect(['en', 'es']).toContain(state.current);
});
