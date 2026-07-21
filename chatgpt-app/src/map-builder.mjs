import { redactSensitiveText } from "./reliability.mjs";

const STOP_WORDS = new Set("the a an and or of to in on for with from by is are that this it de la el los las y o en para por con desde que un una es son se como al del".split(/\s+/));

function clean(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}
function words(value) {
  return [...new Set((clean(value).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || []).filter((word) => !STOP_WORDS.has(word)))];
}
function shortTitle(value, fallback) {
  const line = clean(value).replace(/^#+\s*/, "");
  if (!line) return fallback;
  return line.length > 72 ? `${line.slice(0, 69)}…` : line;
}
function slug(value, fallback) {
  const normalized = clean(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (normalized || fallback).slice(0, 48);
}
function classify(text) {
  const value = clean(text).toLowerCase();
  if (/^(decision|decisión|decidimos|resolved|resuelto)\b/.test(value)) return "decision";
  if (/^(todo|task|action|acción|tarea|next step|próximo paso)\b/.test(value)) return "action";
  if (/^(risk|riesgo|warning|advertencia|unknown|incógnita)\b/.test(value)) return "risk";
  if (/^(question|pregunta|open question|duda)\b/.test(value)) return "question";
  return "topic";
}
function splitSections(content) {
  const raw = String(content || "").replace(/\r/g, "");
  const blocks = raw.split(/\n\s*\n+/).map((block) => block.trim()).filter(Boolean);
  const sections = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const heading = lines[0]?.match(/^#{1,6}\s+(.+)/)?.[1];
    const body = heading ? lines.slice(1).join(" ") : lines.join(" ");
    if (body.length < 12 && !heading) continue;
    sections.push({ title: heading || shortTitle(body.split(/[.!?]/)[0], "Information"), text: clean(body || heading), type: classify(heading || body) });
  }
  if (!sections.length && clean(raw)) sections.push({ title: shortTitle(raw, "Information"), text: clean(raw), type: "topic" });
  return sections.slice(0, 36);
}

export function createNeuroCanvasMap({ title = "ChatGPT workspace", content, evidence = [], objective = "", language = "es" }) {
  const generatedAt = new Date().toISOString();
  const projectId = `chatgpt-${Date.now().toString(36)}`;
  const rootId = "root";
  const safeTitle = redactSensitiveText(title);
  const safeObjective = redactSensitiveText(objective);
  const safeContent = redactSensitiveText(content);
  let redactionCount = safeTitle.redactionCount + safeObjective.redactionCount + safeContent.redactionCount;
  const mapTitle = clean(safeTitle.text) || "ChatGPT workspace";
  const mapObjective = clean(safeObjective.text);
  const nodes = [{
    id: rootId,
    type: "corpus",
    title: mapTitle,
    summary: mapObjective || (language === "es" ? "Espacio creado desde ChatGPT para revisar en NeuroCanvas." : "Workspace created from ChatGPT for review in NeuroCanvas."),
    text: mapObjective || clean(safeContent.text).slice(0, 800),
    keywords: words(`${mapTitle} ${mapObjective}`).slice(0, 12),
    parent: null,
    level: 0,
    source: { name: "ChatGPT conversation", generatedAt },
  }];
  const edges = [];
  const usedIds = new Set([rootId]);
  const uniqueId = (base) => {
    let id = base;
    let index = 2;
    while (usedIds.has(id)) id = `${base}-${index++}`;
    usedIds.add(id);
    return id;
  };

  for (const [index, section] of splitSections(safeContent.text).entries()) {
    const id = uniqueId(slug(section.title, `section-${index + 1}`));
    nodes.push({
      id,
      type: section.type,
      title: section.title,
      summary: section.text.slice(0, 220),
      text: section.text,
      keywords: words(section.text).slice(0, 14),
      parent: rootId,
      level: 1,
      source: { name: "ChatGPT conversation", generatedAt },
    });
    edges.push({ id: `${rootId}-${id}`, a: rootId, b: id, type: "contains", weight: 1 });
  }

  for (const [index, source] of evidence.slice(0, 20).entries()) {
    const safeSourceTitle = redactSensitiveText(source.title || `Source ${index + 1}`);
    const safeSourceText = redactSensitiveText(source.text || "");
    const safeSourceUrl = redactSensitiveText(source.url || "");
    redactionCount += safeSourceTitle.redactionCount + safeSourceText.redactionCount + safeSourceUrl.redactionCount;
    const sourceTitle = safeSourceTitle.text || `Source ${index + 1}`;
    const id = uniqueId(`source-${slug(sourceTitle, String(index + 1))}`);
    nodes.push({
      id,
      type: "evidence",
      title: shortTitle(sourceTitle, `Source ${index + 1}`),
      summary: clean(safeSourceText.text).slice(0, 220),
      text: safeSourceText.text.trim(),
      keywords: words(`${sourceTitle} ${safeSourceText.text}`).slice(0, 16),
      parent: rootId,
      level: 1,
      source: { name: sourceTitle, url: safeSourceUrl.text, importedAt: generatedAt },
    });
    edges.push({ id: `${rootId}-${id}`, a: rootId, b: id, type: "evidence", weight: 1 });
  }

  const topicNodes = nodes.filter((node) => !["corpus", "evidence"].includes(node.type));
  const evidenceNodes = nodes.filter((node) => node.type === "evidence");
  for (const topic of topicNodes) {
    const topicWords = new Set(topic.keywords || []);
    const ranked = evidenceNodes.map((source) => ({
      source,
      score: (source.keywords || []).filter((word) => topicWords.has(word)).length,
    })).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
    for (const item of ranked) edges.push({ id: `${topic.id}-${item.source.id}`, a: topic.id, b: item.source.id, type: "supported-by", weight: Math.min(1, 0.35 + item.score * 0.12) });
  }

  const audit = [{ time: generatedAt, action: "CHATGPT_MAP_CREATED", detail: `Created ${nodes.length} nodes and ${edges.length} relationships for human review.` }];
  if (redactionCount) audit.push({ time: generatedAt, action: "SENSITIVE_VALUES_REDACTED", detail: `Replaced ${redactionCount} credential-like or personal-data value(s) before map export.` });
  const map = {
    format: "neurocanvas-v3",
    projectId,
    title: mapTitle,
    kind: "network",
    createdAt: generatedAt,
    updatedAt: generatedAt,
    nodes,
    edges,
    audit,
    governance: {
      generatedBy: "Exovia NeuroCanvas ChatGPT App",
      humanReviewRequired: true,
      sourceTextPreserved: redactionCount === 0,
      sourceTextPreservedWithSensitiveRedaction: true,
      sensitiveValuesRedacted: true,
      redactionCount,
      externalActionsExecuted: false,
    },
  };

  return {
    kind: "neurocanvas_map",
    map,
    fileName: `${slug(mapTitle, "exovia-chatgpt-map")}.json`,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    evidenceSourceCount: evidenceNodes.length,
    redactionCount,
    privacyMode: "redacted",
    instructions: language === "es"
      ? "Descargá o copiá el JSON y abrilo en Exovia NeuroCanvas para explorar, corregir, verificar y conservar el trabajo. Los patrones sensibles detectados fueron reemplazados antes de exportar."
      : "Download or copy the JSON and open it in Exovia NeuroCanvas to explore, correct, verify and preserve the work. Detected sensitive patterns were replaced before export.",
  };
}
