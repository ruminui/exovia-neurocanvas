import express from "express";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { analyzeAiOutput, buildProofPack, compareAiOutputs, createContextCapsule, recommendAiRoute } from "./reliability.mjs";
import { createNeuroCanvasMap } from "./map-builder.mjs";
import { buildExoCapabilityPack } from "./exo-pack.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const widgetCss = await readFile(path.join(__dirname, "../web/widget.css"), "utf8");
const widgetJs = await readFile(path.join(__dirname, "../web/widget.js"), "utf8");
const statusHtml = await readFile(path.join(__dirname, "../web/status.html"), "utf8");
const widgetHtml = `<main id="app" class="app"><div class="empty">Exovia ProofLayer is waiting for a tool result.</div></main><style>${widgetCss}</style><script>${widgetJs}</script>`;
const TEMPLATE_URI = "ui://widget/exovia-prooflayer-v1.html";
const VERSION = "0.4.0";
const PORT = Number(process.env.PORT || 8787);
const APP_DOMAIN = process.env.APP_DOMAIN || "";

const sourceSchema = z.object({
  title: z.string().min(1).max(300),
  text: z.string().min(1).max(60000),
  url: z.string().url().optional(),
});
const exoSourceSchema = sourceSchema.extend({
  type: z.enum(["document", "code", "conversation", "research", "policy", "mixed"]).optional(),
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
  return {
    structuredContent: payload,
    content: [{ type: "text", text }],
    _meta: { generatedLocally: true, persisted: false },
  };
}

function createProofLayerServer() {
  const server = new McpServer(
    { name: "exovia-neurocanvas", version: VERSION },
    { instructions: "Exovia ProofLayer helps verify AI outputs, preserve portable context, compile inspectable EXO capability packs, compare answers, choose safer AI routes, create importable NeuroCanvas maps, and generate proof packs. Always say that scans, extracted procedures, rankings and token estimates are heuristic. Never claim factual verification unless the user supplied evidence. Require human approval for consequential actions." },
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
        "openai/widgetDescription": "Interactive Exovia ProofLayer report for evidence, privacy, portable context, progressive disclosure, human control and NeuroCanvas handoff.",
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

  registerAppTool(server, "build_exo_capability_pack", {
    title: "Compile an inspectable EXO capability pack",
    description: "Use this when a user wants to turn books, manuals, research, conversations, policies, or code notes into a portable .exo package for humans and AI agents. The tool creates a source-linked index, on-demand chunks, glossary, procedures, constraints, privacy redactions, human-approval rules, token estimates, and a SHA-256 fingerprint. It does not train a model or execute external actions.",
    inputSchema: {
      title: z.string().min(1).max(300),
      objective: z.string().max(2000).default(""),
      sourceType: z.enum(["document", "code", "conversation", "research", "policy", "mixed"]).default("mixed"),
      sources: z.array(exoSourceSchema).min(1).max(30),
      tokenBudget: z.number().int().min(500).max(12000).default(2400),
      language: languageSchema,
    },
    annotations: readOnlyAnnotations,
    _meta: widgetMeta("Compiling EXO capability pack…", "EXO capability pack ready."),
  }, async (input) => {
    const pack = buildExoCapabilityPack(input);
    return result(pack, `${pack.instructions}\n\nFile: ${pack.fileName}\nSources: ${pack.sourceCount}\nChunks: ${pack.chunkCount}\nEstimated initial context reduction: ${pack.estimatedInitialReductionPercent}%\nSHA-256: ${pack.hash}\n\n${JSON.stringify(pack.package, null, 2)}`);
  });

  registerAppTool(server, "create_neurocanvas_map", {
    title: "Create an importable NeuroCanvas map",
    description: "Use this when a user wants to move a ChatGPT conversation, research result, plan, or decision into the Exovia NeuroCanvas human workspace. Produces a neurocanvas-v3 JSON graph that the Android or web app can import for visual review, correction, evidence linking, and preservation.",
    inputSchema: {
      title: z.string().min(1).max(300),
      objective: z.string().max(1000).default(""),
      content: z.string().min(1).max(60000),
      evidence: z.array(sourceSchema).max(20).default([]),
      language: languageSchema,
    },
    annotations: readOnlyAnnotations,
    _meta: widgetMeta("Structuring a NeuroCanvas map…", "NeuroCanvas map ready."),
  }, async (input) => {
    const mapResult = createNeuroCanvasMap(input);
    return result(mapResult, `${mapResult.instructions}\n\nFile: ${mapResult.fileName}\nNodes: ${mapResult.nodeCount}\nRelationships: ${mapResult.edgeCount}\n\n${JSON.stringify(mapResult.map, null, 2)}`);
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

  return server;
}

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": req.path === "/health" ? "no-store" : "public, max-age=60",
  });
  next();
});
app.use(express.json({ limit: "2mb", strict: true }));

app.get("/", (req, res) => {
  if (req.accepts(["html", "json"]) === "json") {
    return res.json({
      name: "Exovia NeuroCanvas ChatGPT App",
      version: VERSION,
      status: "ready",
      mcp: "/mcp",
      health: "/health",
      tools: ["analyze_ai_output", "create_context_capsule", "build_exo_capability_pack", "create_neurocanvas_map", "compare_ai_outputs", "recommend_ai_route", "build_proof_pack"],
      privacy: "No content persistence; no external AI calls.",
    });
  }
  return res.type("html").send(statusHtml);
});
app.get("/health", (_req, res) => res.json({ ok: true, service: "exovia-neurocanvas-mcp", version: VERSION }));

app.post("/mcp", async (req, res) => {
  const server = createProofLayerServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  let closed = false;
  const cleanup = async () => {
    if (closed) return;
    closed = true;
    await Promise.allSettled([transport.close(), server.close()]);
  };
  res.on("close", () => void cleanup());

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP request failed", error instanceof Error ? error.stack || error.message : error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal MCP server error" },
        id: req.body?.id ?? null,
      });
    }
    await cleanup();
  }
});

for (const method of ["get", "delete"]) {
  app[method]("/mcp", (_req, res) => {
    res.status(405).json({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed in stateless mode." },
      id: null,
    });
  });
}

app.use((error, _req, res, _next) => {
  console.error("HTTP request failed", error instanceof Error ? error.message : error);
  if (!res.headersSent) res.status(400).json({ error: "Invalid request" });
});

const httpServer = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Exovia NeuroCanvas MCP v${VERSION} listening on http://0.0.0.0:${PORT}/mcp`);
});

process.on("SIGTERM", () => httpServer.close(() => process.exit(0)));
process.on("SIGINT", () => httpServer.close(() => process.exit(0)));
