import { test, expect } from '@playwright/test';

function collectRuntimeFailures(page) {
  const failures = [];
  page.on('pageerror', error => failures.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error') {
      const text = message.text();
      if (!/127\.0\.0\.1:8787|ERR_CONNECTION_REFUSED|Failed to fetch/i.test(text)) failures.push(`console: ${text}`);
    }
  });
  return failures;
}

test('serves the production shell with defensive headers', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  const headers = response?.headers() || {};
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['referrer-policy']).toBe('no-referrer');
  await expect(page).toHaveTitle(/Exovia NeuroCanvas/i);
});

test('loads production shell and creates a persistent workspace', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');

  await expect(page.locator('#canvas')).toBeVisible();
  await expect(page.locator('#demoBtn')).toBeVisible();
  await expect(page.locator('#intelligenceBtn')).toBeVisible();
  await expect(page.locator('#aiBridgeBtn')).toBeVisible();

  await page.locator('#demoBtn').click();
  await expect(page.locator('#emptyState')).toBeHidden();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);

  await page.keyboard.press('Control+S');
  const projectId = await expect.poll(async () => page.evaluate(() => localStorage.getItem('exovia:lastProjectId'))).not.toBeNull();
  expect(projectId).not.toBeNull();
  expect(failures).toEqual([]);
});

test('restores the last saved project after reload', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
  const before = await page.evaluate(() => window.ExoviaRuntime.getMap().nodes.length);
  await page.keyboard.press('Control+S');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('exovia:lastProjectId'))).not.toBeNull();
  await page.reload();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBe(before);
  await expect(page.locator('#emptyState')).toBeHidden();
  expect(failures).toEqual([]);
});

test('answer, health and replay surfaces work from the same project', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await page.locator('#intelligenceBtn').click();
  await expect(page.locator('#intelligenceDialog')).toBeVisible();

  await page.locator('#intelQuestion').fill('What evidence explains the architecture and agent audit trail?');
  await page.locator('#intelAnswerBtn').click();
  await expect(page.locator('.intelAnswer')).toBeVisible();
  await expect(page.locator('.intelCitation').first()).toBeVisible();

  await page.locator('#intelHealthBtn').click();
  await expect(page.locator('.healthScore')).toBeVisible();

  await page.locator('#intelReplayBtn').click();
  await expect(page.locator('#intelligenceOutput')).toContainText(/replay|activity/i);
  expect(failures).toEqual([]);
});

test('import dialog, secondary brain and human-AI bridge open safely', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');

  await page.locator('#pasteBtn').click();
  await expect(page.locator('#pasteDialog')).toBeVisible();
  await page.locator('#pasteDialog button[value="cancel"]').click();

  const brainButton = page.locator('#brainBtn');
  await expect(brainButton).toBeVisible();
  await brainButton.click();
  await expect(page.locator('#brainDialog')).toBeVisible();
  await page.locator('#brainDialog [data-close]').click();

  await page.locator('#aiBridgeBtn').click();
  await expect(page.locator('#aiBridgeDialog')).toBeVisible();
  await expect(page.locator('#bridgeUrl')).toHaveValue(/127\.0\.0\.1:8787/);
  expect(failures).toEqual([]);
});

test('primary interactive controls have accessible names', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['#demoBtn', '#pasteBtn', '#searchBtn', '#intelligenceBtn', '#aiBridgeBtn', '#canvas']) {
    const locator = page.locator(selector);
    await expect(locator).toBeVisible();
    const name = await locator.getAttribute('aria-label') || await locator.textContent();
    expect(String(name || '').trim().length).toBeGreaterThan(0);
  }
});

test('mobile viewport exposes touch navigation without horizontal overflow', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'Mobile-specific assertion');
  const failures = collectRuntimeFailures(page);
  await page.goto('/');

  await expect(page.locator('#canvas')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(2);

  await page.locator('#demoBtn').click();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
  expect(failures).toEqual([]);
});
