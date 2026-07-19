import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const schema = JSON.parse(await readFile('schemas/live-evidence-room.schema.json', 'utf8'));
const room = JSON.parse(await readFile('examples/live-evidence-room.json', 'utf8'));

const unique = values => new Set(values).size === values.length;

test('live room schema exposes governed collaboration entities', () => {
  assert.equal(schema.properties.format.const, 'exovia-live-room-v1');
  assert.ok(schema.properties.participants);
  assert.ok(schema.properties.evidenceAssets);
  assert.ok(schema.properties.decisions);
  assert.ok(schema.properties.executions);
  assert.ok(schema.properties.events);
  assert.ok(schema.$defs.executionContract);
  assert.ok(schema.$defs.evidenceReference);
});

test('example room has unique identities and ordered replay events', () => {
  const allIds = [
    room.roomId,
    ...room.participants.map(item => item.id),
    ...room.evidenceAssets.map(item => item.id),
    ...room.decisions.map(item => item.id),
    ...room.executions.map(item => item.id),
    ...room.events.map(item => item.id)
  ];
  assert.ok(unique(allIds), 'all room entities must have unique IDs');

  const sequences = room.events.map(event => event.sequence);
  assert.deepEqual(sequences, [...sequences].sort((a, b) => a - b));
  assert.ok(unique(sequences), 'event sequence numbers must be unique');
});

test('every decision and execution evidence reference resolves', () => {
  const evidenceIds = new Set(room.evidenceAssets.map(asset => asset.id));
  const references = [
    ...room.decisions.flatMap(decision => decision.evidence),
    ...room.executions.flatMap(execution => execution.evidence || [])
  ];

  for (const reference of references) {
    assert.ok(evidenceIds.has(reference.assetId), `missing evidence asset ${reference.assetId}`);
    if (reference.startMs !== undefined || reference.endMs !== undefined) {
      assert.ok(Number.isInteger(reference.startMs));
      assert.ok(Number.isInteger(reference.endMs));
      assert.ok(reference.startMs >= 0);
      assert.ok(reference.endMs >= reference.startMs);
    }
  }
});

test('execution contracts remain scoped and human review is explicit', () => {
  const participantIds = new Set(room.participants.map(item => item.id));
  const executionIds = new Set(room.executions.map(item => item.id));

  for (const execution of room.executions) {
    assert.ok(participantIds.has(execution.actorId));
    assert.ok(execution.contract.objective.length > 0);
    assert.ok(execution.contract.successCriteria.length > 0);
    assert.ok(Array.isArray(execution.contract.allowedTools));
    assert.notEqual(execution.contract.approvalPolicy, undefined);
    if (execution.contract.approvalPolicy !== 'none') {
      assert.ok(execution.approvedBy, 'reviewed execution must identify its approver');
      assert.ok(participantIds.has(execution.approvedBy));
    }
  }

  for (const decision of room.decisions) {
    assert.ok(participantIds.has(decision.proposedBy));
    if (decision.status === 'approved') {
      assert.ok(decision.approvedBy);
      assert.ok(participantIds.has(decision.approvedBy));
    }
    for (const executionId of decision.linkedExecutionIds || []) {
      assert.ok(executionIds.has(executionId));
    }
  }
});
