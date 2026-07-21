import test from "node:test";
import assert from "node:assert/strict";
import { buildExoCapabilityPack } from "../src/exo-pack.mjs";

const longSource = `
# Reliable AI workflow

The operator must attach source IDs to every conclusion. The system should separate observations from inferences.

1. Import the original evidence.
2. Scan the AI answer for unsupported claims.
3. Ask a human to approve consequential actions.

# Privacy

Contact person@example.com and use api_key=secret123456789 only in the private test environment.

# Progressive context

Agents should load the index first and retrieve only the referenced evidence chunks. This preserves context while reducing unnecessary tokens. `.repeat(12);

test("builds an inspectable EXO package with source-linked chunks", () => {
  const result = buildExoCapabilityPack({
    title: "Reliable AI operations",
    objective: "Help humans and agents share verified procedures",
    sourceType: "document",
    sources: [{ title: "Operations manual", text: longSource }],
    language: "en",
  });

  assert.equal(result.kind, "exo_capability_pack");
  assert.equal(result.format, "exo-capability-pack-v1");
  assert.match(result.fileName, /\.exo$/);
  assert.equal(result.sourceCount, 1);
  assert.ok(result.chunkCount >= 2);
  assert.ok(result.package.sources[0].chunkIds.length >= 2);
  assert.ok(result.package.chunks.every((chunk) => chunk.sourceId === "source-1"));
  assert.ok(result.package.evidenceRules.includes("cite-source-and-chunk-ids"));
});

test("redacts credentials and personal data before export", () => {
  const result = buildExoCapabilityPack({
    title: "Privacy test",
    sources: [{ title: "Sensitive source", text: longSource }],
    language: "es",
  });
  const serialized = JSON.stringify(result);

  assert.ok(result.redactionCount >= 2);
  assert.doesNotMatch(serialized, /person@example\.com/);
  assert.doesNotMatch(serialized, /secret123456789/);
  assert.match(serialized, /REDACTED_PERSONAL_DATA/);
  assert.match(serialized, /REDACTED_CREDENTIAL/);
});

test("uses index-first progressive disclosure and reports measurable context reduction", () => {
  const result = buildExoCapabilityPack({
    title: "Context efficiency",
    sources: [{ title: "Large source", text: longSource.repeat(8) }],
    tokenBudget: 1600,
    language: "en",
  });

  assert.equal(result.package.progressiveDisclosure.strategy, "index-first-on-demand");
  assert.equal(result.package.progressiveDisclosure.tokenBudget, 1600);
  assert.ok(result.estimatedSourceTokens > result.estimatedIndexTokens);
  assert.ok(result.estimatedInitialReductionPercent > 0);
  assert.ok(Object.keys(result.package.searchIndex).length > 0);
});

test("records safety boundaries and a SHA-256 integrity fingerprint", () => {
  const result = buildExoCapabilityPack({
    title: "Governed capability",
    sources: [{ title: "Policy", text: "The agent must not execute external actions. Human approval is required before changes." }],
  });

  assert.equal(result.package.manifest.humanApprovalRequired, true);
  assert.equal(result.package.manifest.externalActionsExecuted, false);
  assert.equal(result.package.manifest.thirdPartyCodeIncluded, false);
  assert.ok(result.package.capability.prohibitedActions.includes("execute_external_action_without_approval"));
  assert.equal(result.package.integrity.algorithm, "SHA-256");
  assert.match(result.hash, /^[a-f0-9]{64}$/);
  assert.equal(result.hash, result.package.integrity.hash);
});
