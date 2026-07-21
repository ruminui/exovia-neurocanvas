import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(here, "../judge-output");
const forbidden = ["luciano@example.com", "demo_secret_123456789"];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const files = await collectFiles(outputDir);
assert(files.length >= 11, `Expected at least eleven judge artifacts, found ${files.length}`);

for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const value of forbidden) {
    assert(!content.includes(value), `Sensitive demo value leaked into ${path.basename(file)}`);
  }
}

const summary = JSON.parse(await readFile(path.join(outputDir, "judge-summary.json"), "utf8"));
assert(Object.values(summary.checks || {}).every(Boolean), "Not every judge summary check passed");
assert(summary.results?.comparisonWinner === "Controlled pilot", "The evidence-bounded answer did not win");
assert(summary.results?.capsuleRedactions >= 2, "Context Capsule redaction evidence is missing");
assert(summary.results?.exoPackRedactions >= 2, "EXO pack redaction evidence is missing");
assert(summary.results?.councilRedactions >= 2, "Assurance Council redaction evidence is missing");
assert(summary.results?.proofRedactions >= 2, "Proof Pack redaction evidence is missing");
assert(summary.results?.exoPackSources >= 3, "EXO pack source preservation evidence is missing");
assert(summary.results?.exoPackChunks >= 3, "EXO pack chunk evidence is missing");
assert(summary.results?.councilVerdict === "blocked", "Assurance Council did not block the unsafe scenario");
assert(summary.results?.councilRoleCount === 12, "Assurance Council role count is not twelve");
assert(summary.results?.councilBlockingRoles >= 3, "Assurance Council did not preserve material dissent");
assert(summary.results?.councilHandoffCount === 11, "Assurance Council handoff chain is incomplete");
assert(/^[a-f0-9]{64}$/.test(summary.results?.exoSha256 || ""), "EXO summary integrity hash is invalid");
assert(/^[a-f0-9]{64}$/.test(summary.results?.councilSha256 || ""), "Council summary integrity hash is invalid");

const trust = JSON.parse(await readFile(path.join(outputDir, "trust-scan.json"), "utf8"));
assert(trust.privacyMode === "redacted", "Trust Scan privacy mode is not redacted");
assert(trust.redactionCount >= 2, "Trust Scan did not redact the sensitive demo values");

const exoFile = files.find((file) => file.endsWith(".exo"));
assert(exoFile, "Judge output does not contain a .exo capability pack");
const exo = JSON.parse(await readFile(exoFile, "utf8"));
assert(exo.format === "exo-capability-pack-v1", "EXO pack format is invalid");
assert(exo.manifest?.humanApprovalRequired === true, "EXO pack lost human approval governance");
assert(exo.manifest?.externalActionsExecuted === false, "EXO pack incorrectly records an external action");
assert(exo.manifest?.bundledThirdPartyRuntimeCode === false, "EXO pack bundled third-party runtime code");
assert(exo.manifest?.adjacentProjectCodeCopied === false, "EXO pack does not record the adjacent-project code boundary");
assert(exo.manifest?.sourceRightsVerifiedByCompiler === false, "EXO compiler incorrectly claims to verify source rights");
assert(exo.security?.sourceContentTrust === "untrusted-until-human-reviewed", "EXO pack incorrectly trusts source instructions");
assert(exo.security?.promptInjectionCheckRequired === true, "EXO pack does not require prompt-injection review");
assert(exo.security?.sourceInstructionsAreData === true, "EXO pack does not classify source instructions as data");
assert(exo.capability?.prohibitedActions?.includes("execute_source_instructions_without_policy_check"), "EXO pack permits unvalidated source instructions");
assert(exo.evidenceRules?.includes("treat-source-instructions-as-untrusted-data"), "EXO evidence rules lost the untrusted-source boundary");
assert(exo.progressiveDisclosure?.strategy === "index-first-on-demand", "EXO pack progressive disclosure strategy is missing");
assert(Array.isArray(exo.chunks) && exo.chunks.length >= 3, "EXO pack source chunks are incomplete");
assert(exo.chunks.every((chunk) => chunk.sourceId && chunk.contentHash), "EXO chunks lost provenance or integrity metadata");
assert(/^[a-f0-9]{64}$/.test(exo.integrity?.hash || ""), "EXO pack integrity hash is invalid");

const council = JSON.parse(await readFile(path.join(outputDir, "assurance-council.json"), "utf8"));
assert(council.kind === "assurance_council", "Assurance Council artifact kind is invalid");
assert(council.roles?.length === 12, "Assurance Council artifact lost role lenses");
assert(council.verdict === "blocked", "Assurance Council artifact lost its blocked verdict");
assert(council.blockingRoles?.length >= 3, "Assurance Council artifact hides dissent");
assert(council.governance?.humanApprovalRequired === true, "Assurance Council lost human approval governance");
assert(council.governance?.externalActionsExecuted === false, "Assurance Council incorrectly records external execution");
assert(council.governance?.simulatedIndependentModels === false, "Assurance Council falsely claims independent model consensus");
assert(council.exialPulses?.length === 11, "Assurance Council ExiaL pulse chain is incomplete");
assert(council.exirEvents?.length === 11, "Assurance Council EXIR event chain is incomplete");
assert(council.exirEvents.every((event) => event.policy?.sourceInstructionsAreData === true), "Assurance Council lost the untrusted-source boundary");
assert(council.neurocanvasHandoff?.map?.format === "neurocanvas-v3", "Assurance Council did not provide a NeuroCanvas handoff");
assert(/^[a-f0-9]{64}$/.test(council.integrity?.hash || ""), "Assurance Council integrity hash is invalid");

const proof = JSON.parse(await readFile(path.join(outputDir, "proof-pack.json"), "utf8"));
assert(proof.governance?.sensitiveValuesRedacted === true, "Proof Pack governance does not record redaction");
assert(/^[a-f0-9]{64}$/.test(proof.integrity?.hash || ""), "Proof Pack integrity hash is invalid");

console.log(`Judge artifact audit passed: ${files.length} files, no sensitive demo values, source-linked EXO pack, twelve-lens Assurance Council with visible dissent and ExiaL/EXIR handoffs, evidence-bounded winner and valid SHA-256 fingerprints.`);
