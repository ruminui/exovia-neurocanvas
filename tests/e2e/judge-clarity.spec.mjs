import { test, expect } from '@playwright/test';

test('explains the problem and value before requiring product knowledge', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#emptyState h1')).toContainText(/answers you can prove/i);
  await expect(page.locator('#emptyState p')).toContainText(/exact evidence/i);
  await expect(page.locator('#clarityBtn')).toHaveText(/what problem does this solve/i);
});

test('judge-first explanation walks through the complete user outcome', async ({ page }) => {
  await page.goto('/');
  await page.locator('#clarityBtn').click();
  await expect(page.locator('#clarityDialog')).toBeVisible();
  await expect(page.locator('#clarityTitle')).toContainText(/the problem/i);
  await expect(page.locator('.clarityPromise')).toContainText(/every answer and decision can be verified and replayed/i);

  const expected = [
    /turn information into a map/i,
    /verify an answer/i,
    /check knowledge quality/i,
    /replay how the result was produced/i
  ];
  for (const title of expected) {
    await page.locator('#clarityNext').click();
    await expect(page.locator('#clarityTitle')).toContainText(title);
  }
  await page.locator('#clarityNext').click();
  await expect(page.locator('#clarityDialog')).toBeHidden();
});
