import { test, expect } from '@playwright/test';

test('purpose chooser offers plain-language starting points', async ({ page }) => {
  await page.goto('/');
  await page.locator('#purposeBtn').click();
  await expect(page.locator('#purposeDialog')).toBeVisible();
  await expect(page.locator('.purposeHow span')).toHaveCount(3);
  await expect(page.locator('.purposeHow')).toContainText(/Add|Paste/i);
  await expect(page.locator('.purposeHow')).toContainText(/Check|Verify/i);
  await expect(page.locator('.purposeHow')).toContainText(/Save/i);
  await expect(page.locator('.purposeCard')).toHaveCount(10);
  await expect(page.locator('#purposeDialog')).toContainText(/There is no wrong choice/i);
  await expect(page.locator('#purposeDialog')).toContainText(/Save family memories/i);
  await expect(page.locator('#purposeDialog')).toContainText(/Study or prepare a class/i);
  await expect(page.locator('#purposeDialog')).toContainText(/Organize a work project/i);
  await expect(page.locator('#purposeDialog')).toContainText(/Compare options/i);
});

test('family starter creates a simple editable graph', async ({ page }) => {
  await page.goto('/');
  await page.locator('#purposeBtn').click();
  await page.locator('[data-template="family"]').click();
  await expect(page.locator('#purposeDialog')).toBeHidden();

  const map = await page.evaluate(() => window.ExoviaRuntime?.getMap?.());
  expect(map.title).toBe('Save family memories');
  expect(map.nodes).toHaveLength(7);
  expect(map.edges).toHaveLength(6);
  expect(map.nodes.some(node => node.title === 'People')).toBe(true);
  expect(map.nodes.some(node => node.title === 'Stories')).toBe(true);
  expect(map.audit.some(item => item.action === 'STARTER_TEMPLATE_CREATED')).toBe(true);
});

test('every non-custom template creates a valid NeuroCanvas map', async ({ page }) => {
  await page.goto('/');
  const results = await page.evaluate(() => window.ExoviaUseCases.templates
    .filter(template => !template.custom)
    .map(template => window.ExoviaUseCases.buildTemplate(template))
    .map(map => ({
      title: map.title,
      format: map.format,
      rootCount: map.nodes.filter(node => node.type === 'corpus').length,
      brokenEdges: map.edges.filter(edge => !map.nodes.some(node => node.id === edge.a) || !map.nodes.some(node => node.id === edge.b)).length
    })));

  expect(results).toHaveLength(9);
  for (const result of results) {
    expect(result.format).toBe('neurocanvas-v3');
    expect(result.rootCount).toBe(1);
    expect(result.brokenEdges).toBe(0);
  }
});

test('custom purpose opens the normal import dialog', async ({ page }) => {
  await page.goto('/');
  await page.locator('#purposeBtn').click();
  await page.locator('[data-template="custom"]').click();
  await expect(page.locator('#purposeDialog')).toBeHidden();
  await expect(page.locator('#pasteDialog')).toBeVisible();
});
