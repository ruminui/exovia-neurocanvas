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

test('projects a live room into a traceable NeuroCanvas graph', async ({ page }) => {
  await page.goto('/');
  await page.locator('#liveRoomBtn').click();
  await expect(page.locator('#liveRoomDialog')).toBeVisible();
  await page.locator('#liveProjectBtn').click();
  await expect(page.locator('#liveRoomDialog')).toBeHidden();

  const projected = await page.evaluate(() => {
    const map = window.ExoviaRuntime?.getMap?.();
    return {
      title: map?.title,
      nodes: map?.nodes?.map(node => ({ id: node.id, type: node.type })),
      edges: map?.edges?.map(edge => edge.relation),
      audit: map?.audit
    };
  });

  expect(projected.title).toMatch(/Live Evidence Projection/i);
  expect(projected.nodes.some(node => node.type === 'room')).toBe(true);
  expect(projected.nodes.some(node => node.type === 'decision')).toBe(true);
  expect(projected.nodes.some(node => node.type === 'evidence:video')).toBe(true);
  expect(projected.nodes.some(node => node.type === 'execution:agent')).toBe(true);
  expect(projected.edges).toContain('supports');
  expect(projected.edges).toContain('approved');
  expect(projected.audit.some(item => item.action === 'LIVE_ROOM_PROJECTED')).toBe(true);
});

test('live room public API rejects duplicate identities', async ({ page }) => {
  await page.goto('/');
  const error = await page.evaluate(() => {
    try {
      window.ExoviaLiveRoom.validateRoom({
        format: 'exovia-live-room-v1', roomId: 'duplicate-id', title: 'Invalid room', revision: 0,
        participants: [{ id: 'duplicate-id', kind: 'human', displayName: 'Duplicate', role: 'observer', capabilities: [] }],
        evidenceAssets: [], decisions: [], executions: [], events: []
      });
      return null;
    } catch (failure) {
      return failure.message;
    }
  });
  expect(error).toMatch(/duplicate IDs/i);
});
