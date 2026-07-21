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
assert(files.length >= 8, `Expected at least eight judge artifacts, found ${files.length}`);

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
assert(summary.results?.proofRedactions >= 2, "Proof Pack redaction evidence is missing");

const trust = JSON.parse(await readFile(path.join(outputDir, "trust-scan.json"), "utf8"));
assert(trust.privacyMode === "redacted", "Trust Scan privacy mode is not redacted");
assert(trust.redactionCount >= 2, "Trust Scan did not redact the sensitive demo values");

const proof = JSON.parse(await readFile(path.join(outputDir, "proof-pack.json"), "utf8"));
assert(proof.governance?.sensitiveValuesRedacted === true, "Proof Pack governance does not record redaction");
assert(/^[a-f0-9]{64}$/.test(proof.integrity?.hash || ""), "Proof Pack integrity hash is invalid");

console.log(`Judge artifact audit passed: ${files.length} files, no sensitive demo values, evidence-bounded winner and valid SHA-256.`);
