import { test, expect } from '@playwright/test';

test('opens the governed live room and renders all evidence layers', async ({ page }) => {
  await page.goto('/');
  await page.locator('#liveRoomBtn').click();
  await expect(page.locator('#liveRoomDialog')).toBeVisible();
  await expect(page.locator('#liveRoomTitle')).toHaveText(/Build Week Evidence Review/i);
  await expect(page.locator('#liveParticipants .liveCard')).toHaveCount(3);
  await expect(page.locator('#liveEvidence .liveCard')).toHaveCount(2);
  await expect(page.locator('#liveDecisions .liveCard')).toHaveCount(1);
  await expect(page.locator('#liveExecutions .liveCard')).toHaveCount(1);
  await expect(page.locator('#liveTimeline li')).toHaveCount(4);
  await expect(page.locator('.liveRoomNotice')).toContainText(/does not claim deployed real-time multiuser synchronization/i);
});

test('projects a live room into a traceable normalized NeuroCanvas graph', async ({ page }) => {
  await page.goto('/');
  await page.locator('#liveRoomBtn').click();
  await expect(page.locator('#liveRoomDialog')).toBeVisible();
  await page.locator('#liveProjectBtn').click();
  await expect(page.locator('#liveRoomDialog')).toBeHidden();

  const projected = await page.evaluate(() => {
    const map = window.ExoviaRuntime?.getMap?.();
    return {
      title: map?.title,
      kind: map?.kind,
      nodes: map?.nodes?.map(node => ({ id: node.id, type: node.type, parent: node.parent, text: node.text, keywords: node.keywords })),
      edges: map?.edges,
      audit: map?.audit
    };
  });

  expect(projected.title).toMatch(/Live Evidence Projection/i);
  expect(projected.kind).toBe('memory');
  expect(projected.nodes.some(node => node.type === 'corpus' && node.parent === null)).toBe(true);
  expect(projected.nodes.some(node => node.type === 'topic')).toBe(true);
  expect(projected.nodes.some(node => node.type === 'chunk')).toBe(true);
  expect(projected.nodes.some(node => node.type === 'event')).toBe(true);
  expect(projected.nodes.every(node => typeof node.text === 'string' && Array.isArray(node.keywords))).toBe(true);
  expect(projected.edges.every(edge => edge.a && edge.b && edge.type)).toBe(true);
  expect(projected.edges.map(edge => edge.type)).toContain('supports');
  expect(projected.edges.map(edge => edge.type)).toContain('approved');
  expect(projected.audit.some(item => item.action === 'LIVE_ROOM_PROJECTED')).toBe(true);
});

test('live room validation rejects duplicate identities and broken references', async ({ page }) => {
  await page.goto('/');
  const errors = await page.evaluate(() => {
    const capture = room => {
      try { window.ExoviaLiveRoom.validateRoom(room); return null; }
      catch (failure) { return failure.message; }
    };
    const base = { format: 'exovia-live-room-v1', roomId: 'room', title: 'Room', revision: 0, participants: [], evidenceAssets: [], decisions: [], executions: [], events: [] };
    return {
      duplicate: capture({ ...base, participants: [{ id: 'room', kind: 'human', displayName: 'Duplicate', role: 'observer', capabilities: [] }] }),
      actor: capture({ ...base, executions: [{ id: 'execution-1', actorId: 'missing-actor', kind: 'agent', status: 'queued', inputRevision: 0, contract: { objective: 'Test', inputs: [], allowedTools: [], constraints: [], expectedOutputs: [], successCriteria: ['Safe'], approvalPolicy: 'none' } }] })
    };
  });
  expect(errors.duplicate).toMatch(/duplicate IDs/i);
  expect(errors.actor).toMatch(/unknown execution actor/i);
});
