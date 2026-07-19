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
  await expect(page.locator('#diagnosticsBtn')).toBeVisible();
  await page.locator('#demoBtn').click();
  await expect(page.locator('#emptyState')).toBeHidden();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(0);
  await page.keyboard.press('Control+S');
  await expect.poll(async () => page.evaluate(() => localStorage.getItem('exovia:lastProjectId'))).not.toBeNull();
  const projectId = await page.evaluate(() => localStorage.getItem('exovia:lastProjectId'));
  expect(projectId).toBeTruthy();
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

test('ingests real pasted text and preserves exact evidence', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');
  await page.locator('#pasteBtn').click();
  await page.locator('#docTitle').fill('External tester corpus');
  await page.locator('#textInput').fill('NeuroCanvas preserves exact evidence for every answer.\n\nHuman review is required before AI-side changes are loaded.');
  await page.locator('#buildBtn').click();
  await expect(page.locator('#pasteDialog')).toBeHidden();
  await expect.poll(async () => page.evaluate(() => window.ExoviaRuntime?.getMap?.()?.nodes?.length || 0)).toBeGreaterThan(2);
  const evidence = await page.evaluate(() => window.ExoviaRuntime.getMap().nodes.map(node => node.text).join('\n'));
  expect(evidence).toContain('NeuroCanvas preserves exact evidence');
  expect(evidence).toContain('Human review is required');
  expect(failures).toEqual([]);
});

test('workspace normalization rejects malformed projects and repairs broken edges', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const outcomes = {};
    try { window.ExoviaWorkspace.normalizeMap({ title: 'bad' }); } catch (error) { outcomes.missingArrays = error.message; }
    try { window.ExoviaWorkspace.normalizeMap({ nodes: [{ id: 'same' }, { id: 'same' }], edges: [] }); } catch (error) { outcomes.duplicateIds = error.message; }
    const repaired = window.ExoviaWorkspace.normalizeMap({ title: 'repair', nodes: [{ id: 'root', title: 'Root' }, { id: 'child', title: 'Child', parent: 'root' }], edges: [{ a: 'root', b: 'child' }, { a: 'missing', b: 'child' }] });
    outcomes.edgeCount = repaired.edges.length;
    outcomes.format = repaired.format;
    return outcomes;
  });
  expect(result.missingArrays).toMatch(/nodes and edges arrays/i);
  expect(result.duplicateIds).toMatch(/duplicate node id/i);
  expect(result.edgeCount).toBe(1);
  expect(result.format).toBe('neurocanvas-v3');
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

test('Exil intent rejects unsupported commands and applies visual-only focus', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await page.locator('#intentBtn').click();
  await page.locator('#intentInput').fill('RUN external-action');
  await page.locator('#previewIntentBtn').click();
  await expect(page.locator('#intentPreview')).toContainText('INVALID INTENT');
  await expect(page.locator('#applyIntentBtn')).toBeDisabled();
  await page.locator('#intentInput').fill('MAP current\nFIND topic:"evidence"\nFOCUS top:5\nLINK threshold:0.20\nEXPLAIN evidence:true');
  await page.locator('#previewIntentBtn').click();
  await expect(page.locator('#intentPreview')).toContainText('VALIDATED_PREVIEW');
  await expect(page.locator('#intentPreview')).toContainText('"execution": "none"');
  await expect(page.locator('#applyIntentBtn')).toBeEnabled();
  await page.locator('#applyIntentBtn').click();
  const audit = await page.evaluate(() => window.ExoviaRuntime.getMap().audit.at(-1));
  expect(audit.action).toBe('EXIL_VISUAL_FOCUS');
  expect(audit.detail).toContain('no external execution');
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

test('runtime diagnostics verify modules assets storage and graph integrity', async ({ page }) => {
  const failures = collectRuntimeFailures(page);
  await page.goto('/');
  await page.locator('#demoBtn').click();
  await page.locator('#diagnosticsBtn').click();
  await expect(page.locator('#diagnosticsDialog')).toBeVisible();
  await expect(page.locator('#diagnosticsSummary')).toContainText(/checks passed/i);
  expect(await page.locator('#diagnosticsResults .diagnosticRow').count()).toBeGreaterThanOrEqual(20);
  await expect(page.locator('#diagnosticsResults .diagnosticRow.fail')).toHaveCount(0);
  const report = await page.evaluate(() => window.ExoviaDiagnostics.run());
  expect(report.status, JSON.stringify(report, null, 2)).toBe('PASS');
  expect(report.failed, JSON.stringify(report, null, 2)).toBe(0);
  expect(failures).toEqual([]);
});

test('primary interactive controls have accessible names', async ({ page }) => {
  await page.goto('/');
  for (const selector of ['#demoBtn', '#pasteBtn', '#searchBtn', '#intelligenceBtn', '#aiBridgeBtn', '#diagnosticsBtn', '#canvas']) {
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
  await expect(page.locator('#diagnosticsBtn')).toBeVisible();
  expect(failures).toEqual([]);
});
