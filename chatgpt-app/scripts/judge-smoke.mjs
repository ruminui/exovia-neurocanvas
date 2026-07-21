import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const port = Number(process.env.JUDGE_PORT || 8797);
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = path.join(appRoot, "judge-output");
const expectedTools = [
  "analyze_ai_output",
  "create_context_capsule",
  "build_exo_capability_pack",
  "create_neurocanvas_map",
  "compare_ai_outputs",
  "recommend_ai_route",
  "build_proof_pack",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForHealth(timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return response.json();
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Server did not become healthy within ${timeoutMs} ms`);
}

async function callTool(client, name, args) {
  const result = await client.callTool({ name, arguments: args });
  assert(!result?.isError, `${name} returned an MCP tool error`);
  assert(result?.structuredContent, `${name} did not return structuredContent`);
  return result.structuredContent;
}

const demo = JSON.parse(await readFile(path.join(appRoot, "examples/judge-demo.json"), "utf8"));
await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

const logs = [];
const server = spawn(process.execPath, ["src/server.mjs"], {
  cwd: appRoot,
  env: { ...process.env, PORT: String(port), NODE_ENV: "test" },
  stdio: ["ignore", "pipe", "pipe"],
});
server.stdout.on("data", (chunk) => logs.push(chunk.toString()));
server.stderr.on("data", (chunk) => logs.push(chunk.toString()));

let client;
try {
  const health = await waitForHealth();
  assert(health.ok === true, "Health endpoint did not report ok=true");

  client = new Client({ name: "exovia-hackathon-judge", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(`${baseUrl}/mcp`));
  await client.connect(transport);

  const listed = await client.listTools();
  const toolNames = (listed?.tools || []).map((tool) => tool.name);
  for (const name of expectedTools) assert(toolNames.includes(name), `Missing MCP tool: ${name}`);

  const trust = await callTool(client, "analyze_ai_output", {
    title: demo.title,
    aiOutput: demo.aiOutput,
    evidence: demo.evidence,
    language: "es",
  });
  assert(trust.kind === "trust_scan", "Trust Scan returned the wrong result kind");
  assert(trust.issues.some((item) => item.category === "privacy"), "Trust Scan did not detect the demo privacy risk");
  assert(trust.issues.some((item) => item.category === "control"), "Trust Scan did not detect the demo prompt-injection/control risk");
  assert(trust.metrics.unsupportedNumberCount >= 1, "Trust Scan did not identify the unsupported 40 percent claim");
  assert(trust.metrics.overclaimCount >= 1, "Trust Scan did not identify absolute language");

  const capsule = await callTool(client, "create_context_capsule", {
    objective: demo.objective,
    content: demo.aiOutput,
    evidence: demo.evidence,
    tokenBudget: 1800,
    language: "es",
  });
  assert(capsule.kind === "context_capsule", "Context Capsule returned the wrong result kind");
  assert(capsule.markdown.includes("Exovia Context Capsule"), "Context Capsule Markdown is incomplete");
  assert(capsule.redactionCount >= 2, "Context Capsule did not redact the demo email and credential");
  assert(!capsule.markdown.includes("luciano@example.com"), "Context Capsule leaked the demo email");
  assert(!capsule.markdown.includes("demo_secret_123456789"), "Context Capsule leaked the demo credential");

  const exoPack = await callTool(client, "build_exo_capability_pack", {
    title: `${demo.title} capability pack`,
    objective: demo.objective,
    sourceType: "mixed",
    sources: [
      ...demo.evidence.map((source) => ({ ...source, type: "research" })),
      { title: "AI output under review", text: demo.aiOutput, type: "conversation" },
    ],
    tokenBudget: 1600,
    language: "es",
  });
  const exoSerialized = JSON.stringify(exoPack.package);
  assert(exoPack.kind === "exo_capability_pack", "EXO compiler returned the wrong result kind");
  assert(exoPack.package?.format === "exo-capability-pack-v1", "EXO compiler returned an unsupported format");
  assert(exoPack.sourceCount >= 3 && exoPack.chunkCount >= 3, "EXO pack did not preserve enough source structure");
  assert(exoPack.estimatedInitialReductionPercent >= 0, "EXO pack did not report the progressive-disclosure estimate");
  assert(exoPack.package?.manifest?.humanApprovalRequired === true, "EXO pack lost the human approval requirement");
  assert(exoPack.package?.manifest?.bundledThirdPartyRuntimeCode === false, "EXO pack bundled third-party runtime code");
  assert(exoPack.package?.manifest?.adjacentProjectCodeCopied === false, "EXO pack did not record the adjacent-project code boundary");
  assert(exoPack.package?.manifest?.sourceRightsVerifiedByCompiler === false, "EXO compiler incorrectly claimed to verify source rights");
  assert(exoPack.redactionCount >= 2, "EXO pack did not redact the demo email and credential");
  assert(!exoSerialized.includes("luciano@example.com"), "EXO pack leaked the demo email");
  assert(!exoSerialized.includes("demo_secret_123456789"), "EXO pack leaked the demo credential");
  assert(/^[a-f0-9]{64}$/.test(exoPack.hash), "EXO pack SHA-256 is invalid");

  const comparison = await callTool(client, "compare_ai_outputs", {
    question: demo.question,
    answers: demo.answers,
    evidence: demo.evidence,
    language: "es",
  });
  assert(comparison.kind === "comparison", "Comparison returned the wrong result kind");
  assert(comparison.ranking?.length === 2, "Comparison did not rank both answers");
  assert(comparison.winner === "Controlled pilot", `Comparison rewarded the overconfident answer: ${comparison.winner}`);
  const fastLaunch = comparison.ranking.find((item) => item.label === "Fast launch");
  assert(fastLaunch?.unsupportedNumberCount >= 1, "Comparison did not penalize the unsupported 40 percent claim");
  assert(fastLaunch?.overclaimPenalty > 0, "Comparison did not penalize overconfident language");

  const route = await callTool(client, "recommend_ai_route", {
    ...demo.route,
    language: "es",
  });
  assert(route.kind === "safe_route", "Safe Router returned the wrong result kind");
  assert(route.mode === "hybrid_verified", `Unexpected route for the judge scenario: ${route.mode}`);

  const mapResult = await callTool(client, "create_neurocanvas_map", {
    title: demo.title,
    objective: demo.objective,
    content: `${demo.question}\n\n${demo.answers.map((answer) => `${answer.label}: ${answer.text}`).join("\n\n")}`,
    evidence: demo.evidence,
    language: "es",
  });
  assert(mapResult.kind === "neurocanvas_map", "Map Builder returned the wrong result kind");
  assert(mapResult.map?.format === "neurocanvas-v3", "Map Builder did not produce neurocanvas-v3");
  assert(mapResult.nodeCount > 3 && mapResult.edgeCount > 2, "Map Builder produced an unexpectedly small graph");

  const proof = await callTool(client, "build_proof_pack", {
    title: demo.title,
    claimOrDecision: `${demo.answers[1].text}\nReviewer: luciano@example.com\napi_key=demo_secret_123456789`,
    evidence: demo.evidence,
    notes: "Hackathon judge demonstration. No external action was executed.",
    language: "es",
  });
  const proofSerialized = JSON.stringify(proof.proofPack);
  assert(proof.kind === "proof_pack", "Proof Pack returned the wrong result kind");
  assert(/^[a-f0-9]{64}$/.test(proof.hash), "Proof Pack SHA-256 is invalid");
  assert(proof.proofPack?.governance?.humanApprovalRequired === true, "Proof Pack lost the human approval requirement");
  assert(proof.proofPack?.governance?.sensitiveValuesRedacted === true, "Proof Pack did not record privacy redaction");
  assert(proof.redactionCount >= 2, "Proof Pack did not redact the demo email and credential");
  assert(!proofSerialized.includes("luciano@example.com"), "Proof Pack leaked the demo email");
  assert(!proofSerialized.includes("demo_secret_123456789"), "Proof Pack leaked the demo credential");

  const summary = {
    verifiedAt: new Date().toISOString(),
    server: { name: "exovia-neurocanvas", version: health.version || "unknown" },
    client: "@modelcontextprotocol/sdk StreamableHTTPClientTransport",
    tools: toolNames,
    checks: {
      health: true,
      officialMcpClientConnected: true,
      toolDiscovery: true,
      privacyRiskDetected: true,
      promptInjectionDetected: true,
      unsupportedNumberDetected: true,
      overclaimDetected: true,
      contextCapsuleCreated: true,
      contextCapsuleRedacted: true,
      exoCapabilityPackCreated: true,
      exoCapabilityPackRedacted: true,
      exoProgressiveDisclosureMeasured: true,
      exoSourceRightsBoundaryRecorded: true,
      answersCompared: true,
      evidenceBoundedAnswerWon: true,
      safeRouteCreated: true,
      neurocanvasMapCreated: true,
      proofPackCreated: true,
      proofPackRedacted: true,
    },
    results: {
      trustScore: trust.score,
      trustGrade: trust.grade,
      findingCount: trust.issues.length,
      capsuleRedactions: capsule.redactionCount,
      exoPackSources: exoPack.sourceCount,
      exoPackChunks: exoPack.chunkCount,
      exoPackRedactions: exoPack.redactionCount,
      exoInitialContextReductionPercent: exoPack.estimatedInitialReductionPercent,
      exoSha256: exoPack.hash,
      comparisonWinner: comparison.winner,
      recommendedRoute: route.mode,
      neurocanvasNodes: mapResult.nodeCount,
      neurocanvasEdges: mapResult.edgeCount,
      proofRedactions: proof.redactionCount,
      proofSha256: proof.hash,
    },
  };

  await Promise.all([
    writeFile(path.join(outputDir, "judge-summary.json"), `${JSON.stringify(summary, null, 2)}\n`),
    writeFile(path.join(outputDir, "trust-scan.json"), `${JSON.stringify(trust, null, 2)}\n`),
    writeFile(path.join(outputDir, "context-capsule.md"), `${capsule.markdown.trim()}\n`),
    writeFile(path.join(outputDir, exoPack.fileName || "judge-capability-pack.exo"), `${JSON.stringify(exoPack.package, null, 2)}\n`),
    writeFile(path.join(outputDir, mapResult.fileName || "judge-neurocanvas-map.json"), `${JSON.stringify(mapResult.map, null, 2)}\n`),
    writeFile(path.join(outputDir, "comparison.json"), `${JSON.stringify(comparison, null, 2)}\n`),
    writeFile(path.join(outputDir, "safe-route.json"), `${JSON.stringify(route, null, 2)}\n`),
    writeFile(path.join(outputDir, "proof-pack.json"), `${JSON.stringify(proof.proofPack, null, 2)}\n`),
  ]);

  console.log("\nEXOVIA HACKATHON JUDGE CHECK: PASS");
  console.log(`MCP tools discovered: ${toolNames.length}`);
  console.log(`Trust score: ${trust.score}/100 (${trust.grade})`);
  console.log(`Risks detected: ${trust.issues.length}`);
  console.log(`Privacy redactions: capsule ${capsule.redactionCount} / EXO ${exoPack.redactionCount} / proof ${proof.redactionCount}`);
  console.log(`EXO pack: ${exoPack.sourceCount} sources / ${exoPack.chunkCount} chunks / ${exoPack.estimatedInitialReductionPercent}% estimated initial context reduction`);
  console.log(`Evidence-bounded winner: ${comparison.winner}`);
  console.log(`Recommended route: ${route.mode}`);
  console.log(`NeuroCanvas map: ${mapResult.nodeCount} nodes / ${mapResult.edgeCount} relationships`);
  console.log(`EXO SHA-256: ${exoPack.hash}`);
  console.log(`Proof Pack SHA-256: ${proof.hash}`);
  console.log(`Artifacts: ${outputDir}`);
} catch (error) {
  const failure = error instanceof Error ? error.stack || error.message : String(error);
  await Promise.all([
    writeFile(path.join(outputDir, "server.log"), logs.join("")),
    writeFile(path.join(outputDir, "judge-failure.txt"), `${failure}\n`),
  ]);
  console.error("\nEXOVIA HACKATHON JUDGE CHECK: FAIL");
  console.error(failure);
  process.exitCode = 1;
} finally {
  try {
    await client?.close();
  } catch {
    // The server is being terminated immediately after the test.
  }
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    const timeout = setTimeout(resolve, 2_000);
    server.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
  await writeFile(path.join(outputDir, "server.log"), logs.join(""));
}
