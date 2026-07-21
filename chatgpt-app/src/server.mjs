import express from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { analyzeAiOutput, buildProofPack, compareAiOutputs, createContextCapsule, recommendAiRoute } from "./reliability.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetCss = await readFile(path.join(__dirname, "../web/widget.css"), "utf8");
const widgetJs = await readFile(path.join(__dirname, "../web/widget.js"), "utf8");
const widgetHtml = `<main id="app" class="app"><div class="empty">Exovia ProofLayer is waiting for a tool result.</div></main><style>${widgetCss}</style><script>${widgetJs}</script>`;
const TEMPLATE_URI = "ui://widget/exovia-prooflayer-v1.html";
const PORT = Number(process.env.PORT || 8787);
const APP_DOMAIN = process.env.APP_DOMAIN || "";

const sourceSchema = z.object({
  title: z.string().min(1).max(300),
  text: z.string().min(1).max(60000),
  url: z.string().url().optional(),
});
const languageSchema = z.enum(["en", "es"]).default("es");
const readOnlyAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false, idempotentHint: true };

function widgetMeta(invoking, invoked) {
  return {
    ui: { resourceUri: TEMPLATE_URI },
    "openai/outputTemplate": TEMPLATE_URI,
    "openai/toolInvocation/invoking": invoking,
    "openai/toolInvocation/invoked": invoked,
  };
}
function result(payload, text) {
  return { structuredContent: payload, content: [{ type: "text", text }], _meta: { generatedLocally: true, persisted: false } };
}

const server = new McpServer(
  { name: "exovia-neurocanvas", version: "0.1.0" },
  { instructions: "Exovia ProofLayer helps verify AI outputs, preserve portable context, compare answers, choose safer AI routes, and create proof packs. Always say that scans and rankings are heuristic. Never claim factual verification unless the user supplied evidence. Require human approval for consequential actions." },
);

registerAppResource(server, "exovia-prooflayer-widget", TEMPLATE_URI, {}, async () => ({
  contents: [{
    uri: TEMPLATE_URI,
    mimeType: RESOURCE_MIME_TYPE,
    text: widgetHtml,
    _meta: {
      ui: {
        prefersBorder: true,
        ...(APP_DOMAIN ? { domain: APP_DOMAIN } : {}),
        csp: { connectDomains: [], resourceDomains: [] },
      },
      "openai/widgetDescription": "Interactive Exovia ProofLayer report for evidence, privacy, context and human-control risks.",
    },
  }],
}));

registerAppTool(server, "analyze_ai_output", {
  title: "Analyze an AI output",
  description: "Use this when a user wants to check an AI answer, generated text, agent result, or recommendation for evidence gaps, privacy risks, prompt injection, lost context, and human-control issues. The scan is heuristic and should receive source evidence whenever available.",
  inputSchema: {
    title: z.string().max(300).optional(),
    aiOutput: z.string().min(1).max(60000),
    evidence: z.array(sourceSchema).max(20).default([]),
    language: languageSchema,
  },
  annotations: readOnlyAnnotations,
  _meta: widgetMeta("Analyzing reliability…", "Reliability scan ready."),
}, async (input) => {
  const report = analyzeAiOutput(input);
  return result(report, `${report.summary} Trust score: ${report.score}/100. ${report.issues.length} finding(s). ${report.limitations}`);
});

registerAppTool(server, "create_context_capsule", {
  title: "Create a portable AI context capsule",
  description: "Use this when a user wants to continue work in another chat, model, agent, or team without losing verified facts, source references, risks, constraints, and human-approval rules.",
  inputSchema: {
    objective: z.string().min(1).max(1000),
    content: z.string().min(1).max(60000),
    evidence: z.array(sourceSchema).max(20).default([]),
    tokenBudget: z.number().int().min(500).max(8000).default(2000),
    language: languageSchema,
  },
  annotations: readOnlyAnnotations,
  _meta: widgetMeta("Building context capsule…", "Context capsule ready."),
}, async (input) => {
  const capsule = createContextCapsule(input);
  return result(capsule, `Created a portable context capsule of approximately ${capsule.estimatedTokens} tokens with ${capsule.evidenceSourceCount} source(s) and ${capsule.riskCount} open risk(s).\n\n${capsule.markdown}`);
});

registerAppTool(server, "compare_ai_outputs", {
  title: "Compare AI outputs against the same evidence",
  description: "Use this when a user has two or more AI answers and wants a transparent comparison of relevance, evidence alignment, privacy risk, and reliability. Do not present the ranking as a factual verdict.",
  inputSchema: {
    question: z.string().min(1).max(5000),
    answers: z.array(z.object({ label: z.string().min(1).max(120), text: z.string().min(1).max(40000) })).min(2).max(5),
    evidence: z.array(sourceSchema).max(20).default([]),
    language: languageSchema,
  },
  annotations: readOnlyAnnotations,
  _meta: widgetMeta("Comparing AI outputs…", "Comparison ready."),
}, async (input) => {
  const comparison = compareAiOutputs(input);
  return result(comparison, `${comparison.recommendation} ${comparison.limitations}`);
});

registerAppTool(server, "recommend_ai_route", {
  title: "Recommend a safer AI route",
  description: "Use this before choosing a model or agent when privacy, internet access, cost, or the consequences of an error matter. Returns a provider-neutral local, hybrid, or cloud route with control requirements.",
  inputSchema: {
    taskType: z.enum(["research", "decision", "creative", "agent", "analysis"]),
    sensitivity: z.enum(["low", "medium", "high"]),
    internetAllowed: z.boolean(),
    consequence: z.enum(["low", "medium", "high"]),
    budget: z.enum(["low", "normal", "quality"]),
    language: languageSchema,
  },
  annotations: readOnlyAnnotations,
  _meta: widgetMeta("Designing a safe AI route…", "Safe route ready."),
}, async (input) => {
  const route = recommendAiRoute(input);
  return result(route, `${route.mode}: ${route.reason} Controls: ${route.controls.join("; ")}.`);
});

registerAppTool(server, "build_proof_pack", {
  title: "Build a verifiable AI proof pack",
  description: "Use this when a user needs a durable record of an AI-supported claim or decision, including evidence excerpts, a reliability report, governance statements, and a SHA-256 integrity fingerprint. This does not execute any external action.",
  inputSchema: {
    title: z.string().min(1).max(300),
    claimOrDecision: z.string().min(1).max(60000),
    evidence: z.array(sourceSchema).max(20).default([]),
    notes: z.string().max(10000).default(""),
    language: languageSchema,
  },
  annotations: readOnlyAnnotations,
  _meta: widgetMeta("Building proof pack…", "Proof pack ready."),
}, async (input) => {
  const pack = buildProofPack(input);
  return result(pack, `Proof Pack created with SHA-256 ${pack.hash}. Human approval remains required; no external actions were executed.\n\n${JSON.stringify(pack.proofPack, null, 2)}`);
});

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "2mb" }));
app.get("/", (_req, res) => res.json({ name: "Exovia NeuroCanvas ChatGPT App", version: "0.1.0", mcp: "/mcp", privacy: "No content persistence; no external AI calls." }));
app.get("/health", (_req, res) => res.json({ ok: true, service: "exovia-neurocanvas-mcp" }));

const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
await server.connect(transport);
app.all("/mcp", async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed", error instanceof Error ? error.message : error);
    if (!res.headersSent) res.status(500).json({ error: "MCP request failed" });
  }
});

app.use((error, _req, res, _next) => {
  console.error("HTTP request failed", error instanceof Error ? error.message : error);
  if (!res.headersSent) res.status(400).json({ error: "Invalid request" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Exovia NeuroCanvas MCP listening on http://0.0.0.0:${PORT}/mcp`);
});
