import { spawn } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(here, "..");
const port = Number(process.env.JUDGE_PORT || 8797);
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = path.join(appRoot, "judge-output");
const expectedTools = [
  "analyze_ai_output",
  "create_context_capsule",
  "create_neurocanvas_map",
  "compare_ai_outputs",
  "recommend_ai_route",
  "build_proof_pack",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function parseRpcPayload(text, contentType) {
  if (contentType.includes("text/event-stream")) {
    const candidates = text
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);
    assert(candidates.length, `MCP returned an empty event stream: ${text}`);
    return JSON.parse(candidates.at(-1));
  }
  return JSON.parse(text);
}

async function rpc(method, params, id) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const text = await response.text();
  assert(response.ok, `${method} failed with HTTP ${response.status}: ${text}`);
  const payload = parseRpcPayload(text, response.headers.get("content-type") || "");
  assert(!payload.error, `${method} returned an MCP error: ${JSON.stringify(payload.error)}`);
  return payload.result;
}

async function callTool(name, args, id) {
  const result = await rpc("tools/call", { name, arguments: args }, id);
  assert(result?.structuredContent, `${name} did not return structuredContent`);
  return result.structuredContent;
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

try {
  const health = await waitForHealth();
  assert(health.ok === true, "Health endpoint did not report ok=true");

  const initialized = await rpc("initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "exovia-hackathon-judge", version: "1.0.0" },
  }, 1);
  assert(initialized?.serverInfo?.name === "exovia-neurocanvas", "Unexpected MCP server identity");

  const listed = await rpc("tools/list", {}, 2);
  const toolNames = (listed?.tools || []).map((tool) => tool.name);
  for (const name of expectedTools) assert(toolNames.includes(name), `Missing MCP tool: ${name}`);

  const trust = await callTool("analyze_ai_output", {
    title: demo.title,
    aiOutput: demo.aiOutput,
    evidence: demo.evidence,
    language: "es",
  }, 3);
  assert(trust.kind === "trust_scan", "Trust Scan returned the wrong result kind");
  assert(trust.issues.some((item) => item.category === "privacy"), "Trust Scan did not detect the demo privacy risk");
  assert(trust.issues.some((item) => item.category === "control"), "Trust Scan did not detect the demo prompt-injection/control risk");

  const capsule = await callTool("create_context_capsule", {
    objective: demo.objective,
    content: demo.aiOutput,
    evidence: demo.evidence,
    tokenBudget: 1800,
    language: "es",
  }, 4);
  assert(capsule.kind === "context_capsule", "Context Capsule returned the wrong result kind");
  assert(capsule.markdown.includes("Exovia Context Capsule"), "Context Capsule Markdown is incomplete");

  const comparison = await callTool("compare_ai_outputs", {
    question: demo.question,
    answers: demo.answers,
    evidence: demo.evidence,
    language: "es",
  }, 5);
  assert(comparison.kind === "comparison", "Comparison returned the wrong result kind");
  assert(comparison.ranking?.length === 2, "Comparison did not rank both answers");

  const route = await callTool("recommend_ai_route", {
    ...demo.route,
    language: "es",
  }, 6);
  assert(route.kind === "safe_route", "Safe Router returned the wrong result kind");
  assert(route.mode === "hybrid_verified", `Unexpected route for the judge scenario: ${route.mode}`);

  const mapResult = await callTool("create_neurocanvas_map", {
    title: demo.title,
    objective: demo.objective,
    content: `${demo.question}\n\n${demo.answers.map((answer) => `${answer.label}: ${answer.text}`).join("\n\n")}`,
    evidence: demo.evidence,
    language: "es",
  }, 7);
  assert(mapResult.kind === "neurocanvas_map", "Map Builder returned the wrong result kind");
  assert(mapResult.map?.format === "neurocanvas-v3", "Map Builder did not produce neurocanvas-v3");
  assert(mapResult.nodeCount > 3 && mapResult.edgeCount > 2, "Map Builder produced an unexpectedly small graph");

  const proof = await callTool("build_proof_pack", {
    title: demo.title,
    claimOrDecision: demo.answers[1].text,
    evidence: demo.evidence,
    notes: "Hackathon judge demonstration. No external action was executed.",
    language: "es",
  }, 8);
  assert(proof.kind === "proof_pack", "Proof Pack returned the wrong result kind");
  assert(/^[a-f0-9]{64}$/.test(proof.hash), "Proof Pack SHA-256 is invalid");
  assert(proof.proofPack?.governance?.humanApprovalRequired === true, "Proof Pack lost the human approval requirement");

  const summary = {
    verifiedAt: new Date().toISOString(),
    server: initialized.serverInfo,
    tools: toolNames,
    checks: {
      health: true,
      mcpInitialize: true,
      toolDiscovery: true,
      privacyRiskDetected: true,
      promptInjectionDetected: true,
      contextCapsuleCreated: true,
      answersCompared: true,
      safeRouteCreated: true,
      neurocanvasMapCreated: true,
      proofPackCreated: true,
    },
    results: {
      trustScore: trust.score,
      trustGrade: trust.grade,
      findingCount: trust.issues.length,
      comparisonWinner: comparison.winner,
      recommendedRoute: route.mode,
      neurocanvasNodes: mapResult.nodeCount,
      neurocanvasEdges: mapResult.edgeCount,
      proofSha256: proof.hash,
    },
  };

  await Promise.all([
    writeFile(path.join(outputDir, "judge-summary.json"), `${JSON.stringify(summary, null, 2)}\n`),
    writeFile(path.join(outputDir, "trust-scan.json"), `${JSON.stringify(trust, null, 2)}\n`),
    writeFile(path.join(outputDir, "context-capsule.md"), `${capsule.markdown.trim()}\n`),
    writeFile(path.join(outputDir, mapResult.fileName || "judge-neurocanvas-map.json"), `${JSON.stringify(mapResult.map, null, 2)}\n`),
    writeFile(path.join(outputDir, "comparison.json"), `${JSON.stringify(comparison, null, 2)}\n`),
    writeFile(path.join(outputDir, "safe-route.json"), `${JSON.stringify(route, null, 2)}\n`),
    writeFile(path.join(outputDir, "proof-pack.json"), `${JSON.stringify(proof.proofPack, null, 2)}\n`),
  ]);

  console.log("\nEXOVIA HACKATHON JUDGE CHECK: PASS");
  console.log(`MCP tools discovered: ${toolNames.length}`);
  console.log(`Trust score: ${trust.score}/100 (${trust.grade})`);
  console.log(`Risks detected: ${trust.issues.length}`);
  console.log(`Recommended route: ${route.mode}`);
  console.log(`NeuroCanvas map: ${mapResult.nodeCount} nodes / ${mapResult.edgeCount} relationships`);
  console.log(`Proof Pack SHA-256: ${proof.hash}`);
  console.log(`Artifacts: ${outputDir}`);
} catch (error) {
  await writeFile(path.join(outputDir, "server.log"), logs.join(""));
  console.error("\nEXOVIA HACKATHON JUDGE CHECK: FAIL");
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
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
