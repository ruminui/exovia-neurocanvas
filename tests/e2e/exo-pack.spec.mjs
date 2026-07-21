import { test, expect } from '@playwright/test';

test('EXO capability pack becomes an inspectable NeuroCanvas graph', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(() => {
    const pack = {
      format: 'exo-capability-pack-v1',
      kind: 'exo_capability_pack',
      title: 'Reliable operations',
      objective: 'Preserve evidence and human control',
      createdAt: '2026-07-21T00:00:00.000Z',
      manifest: { humanApprovalRequired: true, externalActionsExecuted: false },
      progressiveDisclosure: { strategy: 'index-first-on-demand', estimatedInitialReductionPercent: 72 },
      capability: {
        allowedActions: ['inspect', 'search', 'cite'],
        prohibitedActions: ['execute_external_action_without_approval'],
      },
      sources: [{
        id: 'source-1',
        title: 'Operations policy',
        summary: 'Human approval is required.',
        chunkIds: ['source-1-chunk-1'],
      }],
      chunks: [{
        id: 'source-1-chunk-1',
        sourceId: 'source-1',
        title: 'Approval rule',
        text: 'Production changes require human approval.',
        keywords: ['production', 'approval'],
        contentHash: 'a'.repeat(64),
      }],
      procedures: ['1. Inspect the evidence.'],
      constraints: ['Do not execute external actions without approval.'],
      glossary: [{ term: 'approval', count: 2 }],
      privacy: { mode: 'redacted', redactionCount: 0 },
      evidenceRules: ['cite-source-and-chunk-ids'],
      integrity: { algorithm: 'SHA-256', hash: 'b'.repeat(64) },
    };
    const map = window.ExoviaExoPack.toNeuroCanvas(pack);
    window.ExoviaRuntime.loadMap(map, 'network');
    return {
      format: map.format,
      kind: map.kind,
      nodeTypes: map.nodes.map(node => node.type),
      sourceRef: map.nodes.find(node => node.chunkRef)?.sourceRef,
      auditAction: map.audit.at(-1)?.action,
      rootText: map.nodes[0]?.text,
    };
  });

  expect(result.format).toBe('neurocanvas-v3');
  expect(result.kind).toBe('capability');
  expect(result.nodeTypes).toContain('source');
  expect(result.nodeTypes).toContain('evidence');
  expect(result.nodeTypes).toContain('procedure');
  expect(result.nodeTypes).toContain('constraint');
  expect(result.sourceRef).toBe('source-1');
  expect(result.auditAction).toBe('EXO_CAPABILITY_PACK_IMPORTED');
  expect(result.rootText).toContain('index-first-on-demand');
  await expect(page.locator('#canvas')).toBeVisible();
});

test('EXO importer rejects unsupported formats before graph mutation', async ({ page }) => {
  await page.goto('/');
  const message = await page.evaluate(() => {
    try {
      window.ExoviaExoPack.toNeuroCanvas({ format: 'unknown-format' });
      return 'no-error';
    } catch (error) {
      return error.message;
    }
  });
  expect(message).toContain('Unsupported EXO format');
});
