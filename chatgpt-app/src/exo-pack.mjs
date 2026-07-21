import { createHash } from "node:crypto";
import { redactSensitiveText } from "./reliability.mjs";

const STOP_WORDS = new Set(`
the a an and or of to in on for with from by is are was were be been being that this it as at
de la el los las y o en para por con desde que un una es son fue eran ser se como al del
this these those into about over under using use used should must may can could would will
`.trim().split(/\s+/));

const CONSTRAINT_PATTERN = /\b(?:must|must not|should|should not|required|requires|never|only|cannot|do not|no debe|debe|deben|requiere|obligatori[oa]|nunca|solo|solamente|no puede|no ejecutar)\b/i;
const PROCEDURE_PATTERN = /^(?:\s*(?:\d+[.)]|[-*•])\s+)|\b(?:first|then|next|finally|primero|luego|después|finalmente)\b/i;

function normalizeLanguage(language) {
  return language === "en" ? "en" : "es";
}

function tr(language, en, es) {
  return normalizeLanguage(language) === "es" ? es : en;
}

function slug(value) {
  const normalized = String(value || "exo-pack")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return normalized || "exo-pack";
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(stable(value))).digest("hex");
}

function words(text) {
  return String(text || "")
    .toLowerCase()
    .match(/[\p{L}\p{N}][\p{L}\p{N}_-]{2,}/gu)?.filter((word) => !STOP_WORDS.has(word)) || [];
}

function topTerms(text, limit = 12) {
  const counts = new Map();
  for (const word of words(text)) counts.set(word, (counts.get(word) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function estimatedTokens(text) {
  return Math.max(1, Math.ceil(String(text || "").length / 4));
}

function splitIntoSections(text, fallbackTitle) {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const sections = [];
  let current = { title: fallbackTitle, lines: [] };

  const flush = () => {
    const body = current.lines.join("\n").trim();
    if (body) sections.push({ title: current.title, text: body });
  };

  for (const line of lines) {
    const heading = line.match(/^\s{0,3}#{1,6}\s+(.+?)\s*$/);
    if (heading) {
      flush();
      current = { title: heading[1].trim(), lines: [] };
      continue;
    }
    current.lines.push(line);
  }
  flush();

  if (sections.length > 1) return sections;

  const paragraphs = String(text || "")
    .split(/\n\s*\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return paragraphs.length > 1
    ? paragraphs.map((paragraph, index) => ({ title: `${fallbackTitle} · ${index + 1}`, text: paragraph }))
    : sections;
}

function chunkSection(section, maxChars = 5200) {
  if (section.text.length <= maxChars) return [section];
  const paragraphs = section.text.split(/\n\s*\n+/).filter(Boolean);
  const chunks = [];
  let buffer = "";
  for (const paragraph of paragraphs) {
    if (buffer && `${buffer}\n\n${paragraph}`.length > maxChars) {
      chunks.push({ title: section.title, text: buffer });
      buffer = paragraph;
    } else {
      buffer = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    }
  }
  if (buffer) chunks.push({ title: section.title, text: buffer });
  return chunks;
}

function extractLines(text, pattern, limit = 24) {
  const seen = new Set();
  const items = [];
  for (const rawLine of String(text || "").split(/\n+/)) {
    const line = rawLine.trim().replace(/^[-*•]\s+/, "");
    if (line.length < 12 || line.length > 500 || !pattern.test(rawLine)) continue;
    pattern.lastIndex = 0;
    const key = line.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(line);
    if (items.length >= limit) break;
  }
  return items;
}

function shortSummary(text, language) {
  const sentences = String(text || "")
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 30)
    .slice(0, 3);
  if (sentences.length) return sentences.join(" ").slice(0, 900);
  return tr(language, "Source indexed for on-demand inspection.", "Fuente indexada para inspección bajo demanda.");
}

function buildSearchIndex(chunks) {
  const index = new Map();
  for (const chunk of chunks) {
    for (const term of chunk.keywords.slice(0, 12)) {
      if (!index.has(term)) index.set(term, []);
      index.get(term).push(chunk.id);
    }
  }
  return Object.fromEntries([...index.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function buildExoCapabilityPack({
  title,
  objective = "",
  sourceType = "mixed",
  sources = [],
  tokenBudget = 2400,
  language = "es",
}) {
  language = normalizeLanguage(language);
  const safeTitle = redactSensitiveText(title);
  const safeObjective = redactSensitiveText(objective);
  let redactionCount = safeTitle.redactionCount + safeObjective.redactionCount;
  const sourceEntries = [];
  const chunks = [];
  const procedures = [];
  const constraints = [];

  sources.forEach((source, sourceIndex) => {
    const sourceId = `source-${sourceIndex + 1}`;
    const safeSourceTitle = redactSensitiveText(source.title || `${tr(language, "Source", "Fuente")} ${sourceIndex + 1}`);
    const safeText = redactSensitiveText(source.text || "");
    redactionCount += safeSourceTitle.redactionCount + safeText.redactionCount;
    const sections = splitIntoSections(safeText.text, safeSourceTitle.text);
    const chunkIds = [];

    sections.flatMap((section) => chunkSection(section)).forEach((section, chunkIndex) => {
      const id = `${sourceId}-chunk-${chunkIndex + 1}`;
      const keywordObjects = topTerms(`${section.title}\n${section.text}`, 12);
      chunks.push({
        id,
        sourceId,
        order: chunkIndex + 1,
        title: section.title,
        text: section.text,
        estimatedTokens: estimatedTokens(section.text),
        keywords: keywordObjects.map((item) => item.term),
        contentHash: sha256(section.text),
      });
      chunkIds.push(id);
    });

    procedures.push(...extractLines(safeText.text, PROCEDURE_PATTERN));
    constraints.push(...extractLines(safeText.text, CONSTRAINT_PATTERN));

    sourceEntries.push({
      id: sourceId,
      title: safeSourceTitle.text,
      type: source.type || sourceType,
      url: source.url || null,
      summary: shortSummary(safeText.text, language),
      chunkIds,
      estimatedTokens: estimatedTokens(safeText.text),
      contentHash: sha256(safeText.text),
    });
  });

  const combined = chunks.map((chunk) => `${chunk.title}\n${chunk.text}`).join("\n\n");
  const glossary = topTerms(combined, 20);
  const totalSourceTokens = sourceEntries.reduce((sum, source) => sum + source.estimatedTokens, 0);
  const indexTokens = Math.max(1, Math.ceil(JSON.stringify({ sourceEntries, glossary }).length / 4));
  const uniqueProcedures = [...new Set(procedures)].slice(0, 24);
  const uniqueConstraints = [...new Set(constraints)].slice(0, 24);

  const packWithoutIntegrity = {
    format: "exo-capability-pack-v1",
    kind: "exo_capability_pack",
    createdAt: new Date().toISOString(),
    title: safeTitle.text,
    objective: safeObjective.text,
    language,
    sourceType,
    manifest: {
      product: "Exovia NeuroCanvas",
      layers: ["NeuroCanvas", "ProofLayer", "ExiaL", "EXIR", "Exil", "FAPI"],
      humanApprovalRequired: true,
      externalActionsExecuted: false,
      generatedLocally: true,
      persistedByServer: false,
      bundledThirdPartyRuntimeCode: false,
      adjacentProjectCodeCopied: false,
      sourceRightsVerifiedByCompiler: false,
    },
    progressiveDisclosure: {
      strategy: "index-first-on-demand",
      tokenBudget,
      totalSourceTokens,
      indexTokens,
      estimatedInitialReductionPercent: totalSourceTokens > 0
        ? Math.max(0, Math.round((1 - Math.min(indexTokens, totalSourceTokens) / totalSourceTokens) * 100))
        : 0,
      instruction: tr(
        language,
        "Load the manifest and search index first. Retrieve only the referenced chunks needed for the current question. Always retain source IDs in conclusions.",
        "Cargá primero el manifiesto y el índice de búsqueda. Recuperá únicamente los fragmentos necesarios para la pregunta actual. Conservá siempre los IDs de fuente en las conclusiones.",
      ),
    },
    capability: {
      allowedActions: ["inspect", "search", "summarize", "compare", "cite", "propose"],
      prohibitedActions: ["execute_external_action_without_approval", "hide_source_ids", "invent_missing_evidence", "restore_redacted_values"],
      approvalPolicy: "explicit-human-approval-for-consequential-actions",
    },
    sources: sourceEntries,
    chunks,
    searchIndex: buildSearchIndex(chunks),
    glossary,
    procedures: uniqueProcedures,
    constraints: uniqueConstraints,
    evidenceRules: [
      "cite-source-and-chunk-ids",
      "separate-observation-from-inference",
      "state-unknowns-and-conflicts",
      "do-not-execute-external-actions",
    ],
    privacy: {
      mode: "redacted",
      redactionCount,
      note: tr(language, "Credential-like and personal values are replaced before export.", "Las credenciales y los datos personales se reemplazan antes de exportar."),
    },
  };

  const integrityHash = sha256(packWithoutIntegrity);
  const pack = {
    ...packWithoutIntegrity,
    integrity: {
      algorithm: "SHA-256",
      hash: integrityHash,
      scope: "all-package-fields-except-integrity",
    },
  };

  return {
    kind: "exo_capability_pack",
    format: pack.format,
    title: pack.title,
    fileName: `${slug(pack.title)}.exo`,
    sourceCount: sourceEntries.length,
    chunkCount: chunks.length,
    procedureCount: uniqueProcedures.length,
    constraintCount: uniqueConstraints.length,
    estimatedSourceTokens: totalSourceTokens,
    estimatedIndexTokens: indexTokens,
    estimatedInitialReductionPercent: pack.progressiveDisclosure.estimatedInitialReductionPercent,
    redactionCount,
    hash: integrityHash,
    package: pack,
    instructions: tr(
      language,
      "Save the package as the suggested .exo file. It is JSON and can be inspected without proprietary software. Load the index first and retrieve source chunks on demand. The compiler does not verify rights to user-supplied sources.",
      "Guardá el paquete con la extensión .exo sugerida. Es JSON y puede inspeccionarse sin software propietario. Cargá primero el índice y recuperá los fragmentos de fuente bajo demanda. El compilador no verifica los derechos sobre las fuentes aportadas por el usuario.",
    ),
  };
}
