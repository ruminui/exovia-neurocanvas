import { createHash } from "node:crypto";

const SECRET_PATTERNS = [
  /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g,
  /(?:api[_ -]?key|secret|token|password|contraseña)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{8,}/gi,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
];
const PERSONAL_PATTERNS = [
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?54\s?)?(?:9\s?)?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{4}\b/g,
  /\b\d{7,8}\b/g,
];
const INJECTION_PATTERNS = [
  /ignore (?:all |the )?(?:previous|prior) instructions/gi,
  /ignora (?:todas )?las instrucciones anteriores/gi,
  /(?:reveal|show|print|repeat).{0,30}(?:system prompt|developer message|hidden instructions)/gi,
  /(?:jailbreak|bypass safety|disable safeguards|modo desarrollador)/gi,
];
const OVERCLAIM_PATTERNS = [
  /\b(?:always|never|guaranteed|definitely|certainly|proven|immediately|all customers|every customer)\b/gi,
  /\b(?:siempre|nunca|garantizad[oa]|definitivamente|sin duda|inmediatamente|todos los clientes)\b/gi,
];
const EVIDENCE_LANGUAGE = /\b(?:evidence|source|sources|data|pilot|study|measured|evidencia|fuente|fuentes|datos|piloto|estudio|medido)\b/i;
const UNCERTAINTY_LANGUAGE = /\b(?:unverified|unknown|uncertain|insufficient|incomplete|may|might|could|not measured|did not measure|no verificado|no verificada|desconocid[oa]|inciert[oa]|insuficiente|incomplet[oa]|podría|puede|no se midió|no fue medido)\b/i;
const HUMAN_CONTROL_LANGUAGE = /\b(?:human review|human approval|approval required|reviewed by a human|revisión humana|aprobación humana|requiere aprobación|revisado por una persona)\b/i;
const TIME_SENSITIVE = /\b(?:today|current|latest|now|price|law|regulation|version|hoy|actual|últim[oa]|ahora|precio|ley|normativa|versión)\b/i;
const CLAIM_SPLIT = /(?<=[.!?])\s+|\n+/;
const NUMBER_PATTERN = /\b\d+(?:[.,]\d+)?\s*(?:%|percent|percentage|por ciento)?\b/gi;
const STOP_WORDS = new Set("the a an and or of to in on for with from by is are was were be been being that this it as at de la el los las y o en para por con desde que un una es son fue eran ser se como al del".split(/\s+/));

function normalizeLanguage(language) {
  return language === "es" ? "es" : "en";
}

function tr(language, en, es) {
  return normalizeLanguage(language) === "es" ? es : en;
}

function testAny(patterns, text) {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    const matched = pattern.test(text);
    pattern.lastIndex = 0;
    return matched;
  });
}

function countPatternMatches(patterns, text) {
  let count = 0;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    count += [...String(text || "").matchAll(pattern)].length;
    pattern.lastIndex = 0;
  }
  return count;
}

function replacePatterns(input, patterns, label) {
  let text = String(input || "");
  let count = 0;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    text = text.replace(pattern, () => {
      count += 1;
      return label;
    });
    pattern.lastIndex = 0;
  }
  return { text, count };
}

export function redactSensitiveText(input) {
  const secretResult = replacePatterns(input, SECRET_PATTERNS, "[REDACTED_CREDENTIAL]");
  const personalResult = replacePatterns(secretResult.text, PERSONAL_PATTERNS, "[REDACTED_PERSONAL_DATA]");
  return {
    text: personalResult.text,
    redactionCount: secretResult.count + personalResult.count,
    secretCount: secretResult.count,
    personalDataCount: personalResult.count,
  };
}

function redactValue(value) {
  if (typeof value === "string") return redactSensitiveText(value).text;
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactValue(item)]));
  }
  return value;
}

function words(text) {
  return [...new Set(String(text || "").toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) || [])]
    .filter((word) => !STOP_WORDS.has(word));
}

function overlapScore(a, b) {
  const left = words(a);
  const right = new Set(words(b));
  if (!left.length) return 0;
  return left.filter((word) => right.has(word)).length / left.length;
}

function sentenceClaims(text) {
  return String(text || "")
    .split(CLAIM_SPLIT)
    .map((item) => item.trim())
    .filter((item) => item.length >= 24)
    .slice(0, 80);
}

function normalizedNumbers(text) {
  NUMBER_PATTERN.lastIndex = 0;
  const values = [...String(text || "").matchAll(NUMBER_PATTERN)].map((match) => match[0]
    .toLowerCase()
    .replace(/percentage|percent|por ciento/g, "%")
    .replace(/\s+/g, "")
    .replace(",", "."));
  NUMBER_PATTERN.lastIndex = 0;
  return [...new Set(values)];
}

function unsupportedNumbers(text, corpus) {
  const available = new Set(normalizedNumbers(corpus));
  return normalizedNumbers(text).filter((value) => !available.has(value));
}

function grade(score) {
  return score >= 92 ? "A+" : score >= 84 ? "A" : score >= 72 ? "B" : score >= 58 ? "C" : score >= 40 ? "D" : "E";
}

function severityWeight(severity) {
  return { critical: 18, high: 11, medium: 6, low: 2 }[severity] || 1;
}

function sourceCorpus(evidence = []) {
  return evidence.map((item) => `${item.title || ""}\n${item.text || ""}`).join("\n\n");
}

function issue(language, severity, category, titleEn, titleEs, detailEn, detailEs) {
  return {
    severity,
    category,
    title: tr(language, titleEn, titleEs),
    detail: tr(language, detailEn, detailEs),
  };
}

export function analyzeAiOutput({ title = "AI output", aiOutput, evidence = [], language = "en" }) {
  language = normalizeLanguage(language);
  const text = String(aiOutput || "").trim();
  const corpus = sourceCorpus(evidence);
  const issues = [];
  const claims = sentenceClaims(text);
  const supportedClaims = [];
  const unsupportedClaims = [];
  const unsupportedNumberValues = corpus ? unsupportedNumbers(text, corpus) : normalizedNumbers(text);
  const overclaimCount = countPatternMatches(OVERCLAIM_PATTERNS, text);

  for (const claim of claims) {
    const score = corpus ? overlapScore(claim, corpus) : 0;
    if (score >= 0.28) supportedClaims.push({ claim, supportScore: Math.round(score * 100) });
    else unsupportedClaims.push({ claim, supportScore: Math.round(score * 100) });
  }

  if (!evidence.length) {
    issues.push(issue(language, "high", "evidence", "No source evidence supplied", "No se aportó evidencia fuente", "The answer cannot be checked against authoritative material yet.", "La respuesta todavía no puede contrastarse con material autorizado."));
  } else if (unsupportedClaims.length) {
    issues.push(issue(language, unsupportedClaims.length > supportedClaims.length ? "high" : "medium", "evidence", "Claims with weak evidence overlap", "Afirmaciones con poco respaldo", `${unsupportedClaims.length} claim(s) have weak lexical overlap with the supplied evidence. This is a heuristic, not a factual verdict.`, `${unsupportedClaims.length} afirmación(es) tienen poca coincidencia con la evidencia aportada. Es una heurística, no un veredicto factual.`));
  }
  if (evidence.length && unsupportedNumberValues.length) {
    issues.push(issue(language, "high", "evidence", "Numbers not found in the supplied evidence", "Números ausentes en la evidencia", `The following numeric claim(s) were not found in the supplied evidence: ${unsupportedNumberValues.join(", ")}.`, `Las siguientes cifras no aparecen en la evidencia aportada: ${unsupportedNumberValues.join(", ")}.`));
  }
  if (overclaimCount) {
    issues.push(issue(language, "medium", "control", "Overconfident or absolute language", "Lenguaje absoluto o demasiado seguro", "Absolute language can hide uncertainty and should be replaced with evidence-bounded wording.", "El lenguaje absoluto puede ocultar incertidumbre y debería reemplazarse por una formulación limitada por la evidencia."));
  }
  if (testAny(SECRET_PATTERNS, text)) {
    issues.push(issue(language, "critical", "privacy", "Possible credential or secret", "Posible credencial o secreto", "Credential-like data appears in the AI output. Remove or rotate it before sharing.", "La respuesta contiene datos parecidos a una credencial. Eliminalos o rotalos antes de compartir."));
  }
  if (testAny(PERSONAL_PATTERNS, text)) {
    issues.push(issue(language, "medium", "privacy", "Possible personal information", "Posible información personal", "Contact or identifying data may be present.", "Puede haber datos de contacto o identificación."));
  }
  if (testAny(INJECTION_PATTERNS, text)) {
    issues.push(issue(language, "critical", "control", "Prompt-injection pattern", "Patrón de inyección de prompt", "The content contains instructions that may try to override an AI system.", "El contenido incluye instrucciones que podrían intentar anular el sistema de IA."));
  }
  if (TIME_SENSITIVE.test(text) && !evidence.length) {
    issues.push(issue(language, "medium", "evidence", "Time-sensitive claims need fresh sources", "Las afirmaciones temporales necesitan fuentes actuales", "Changing facts such as laws, prices or current status should be checked against current sources.", "Datos cambiantes como leyes, precios o estados actuales deben verificarse con fuentes recientes."));
  }
  if (text.length < 80) {
    issues.push(issue(language, "low", "context", "Very little context", "Muy poco contexto", "The output may be too short to preserve assumptions, constraints and uncertainty.", "La respuesta puede ser demasiado corta para conservar supuestos, límites e incertidumbre."));
  }

  const penalties = { evidence: 0, privacy: 0, context: 0, control: 0 };
  for (const finding of issues) penalties[finding.category] += severityWeight(finding.severity);
  const dimensions = Object.fromEntries(
    Object.entries(penalties).map(([key, value]) => [key, Math.max(0, 100 - Math.min(100, value))]),
  );
  const criticalCount = issues.filter((finding) => finding.severity === "critical").length;
  const baseScore = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 4);
  const score = Math.max(0, baseScore - criticalCount * 10);

  return {
    kind: "trust_scan",
    title,
    score,
    grade: grade(score),
    summary: score >= 85
      ? tr(language, "Strong starting point. Review remaining warnings before relying on it.", "Buen punto de partida. Revisá las advertencias antes de confiar en el resultado.")
      : score >= 65
        ? tr(language, "Useful, but evidence or privacy gaps remain.", "Es útil, pero todavía hay huecos de evidencia o privacidad.")
        : tr(language, "High-risk output. Resolve critical findings before using it for an important decision.", "Resultado de alto riesgo. Resolvé los hallazgos críticos antes de usarlo en una decisión importante."),
    dimensions,
    issues,
    metrics: {
      claimCount: claims.length,
      supportedClaimCount: supportedClaims.length,
      unsupportedClaimCount: unsupportedClaims.length,
      unsupportedNumberCount: unsupportedNumberValues.length,
      overclaimCount,
      evidenceSourceCount: evidence.length,
      criticalCount,
    },
    unsupportedClaims: unsupportedClaims.slice(0, 8),
    unsupportedNumbers: unsupportedNumberValues.slice(0, 12),
    limitations: tr(language, "Heuristic reliability scan; it does not replace domain-expert review or live source verification.", "Análisis heurístico de confiabilidad; no reemplaza la revisión de especialistas ni la verificación con fuentes actuales."),
  };
}

export function createContextCapsule({ objective, content, evidence = [], tokenBudget = 2000, language = "en" }) {
  language = normalizeLanguage(language);
  const scan = analyzeAiOutput({ title: objective || "Context", aiOutput: content, evidence, language });
  const safeObjective = redactSensitiveText(objective);
  const safeContent = redactSensitiveText(content);
  let redactionCount = safeObjective.redactionCount + safeContent.redactionCount;
  const budgetChars = Math.max(1600, Math.min(32000, Number(tokenBudget || 2000) * 4));
  const sourceSections = evidence.slice(0, 12).map((item, index) => {
    const safeTitle = redactSensitiveText(item.title || `Source ${index + 1}`);
    const safeUrl = redactSensitiveText(item.url || "");
    const safeText = redactSensitiveText(item.text || "");
    redactionCount += safeTitle.redactionCount + safeUrl.redactionCount + safeText.redactionCount;
    const excerpt = safeText.text.trim().slice(0, Math.max(350, Math.floor(budgetChars / Math.max(3, evidence.length))));
    return `### [${index + 1}] ${safeTitle.text}\n${safeUrl.text ? `URL: ${safeUrl.text}\n` : ""}${excerpt}`;
  });
  const clippedContent = safeContent.text.trim().slice(0, Math.max(700, Math.floor(budgetChars * 0.45)));
  const risks = scan.issues.slice(0, 8).map((finding) => `- ${finding.title}: ${finding.detail}`);
  const redactionNotice = redactionCount
    ? tr(language, `- ${redactionCount} sensitive value(s) were replaced before export.`, `- Se reemplazaron ${redactionCount} valor(es) sensible(s) antes de exportar.`)
    : tr(language, "- No credential or personal-data pattern was redacted.", "- No se redactaron patrones de credenciales ni datos personales.");
  const markdown = `# Exovia Context Capsule\n\n## Objective\n${safeObjective.text || tr(language, "Continue this work without losing context.", "Continuar este trabajo sin perder contexto.")}\n\n## Working context\n${clippedContent || tr(language, "No working context supplied.", "No se aportó contexto de trabajo.")}\n\n## Evidence\n${sourceSections.join("\n\n") || tr(language, "- No source evidence attached.", "- No hay evidencia fuente adjunta.")}\n\n## Privacy redactions\n${redactionNotice}\n\n## Open risks and unknowns\n${risks.join("\n") || tr(language, "- No material risks detected by the heuristic scan.", "- El análisis heurístico no detectó riesgos importantes.")}\n\n## Rules for the next AI\n1. Cite source numbers when making factual claims.\n2. State uncertainty when evidence is missing or contradictory.\n3. Do not reveal credentials or personal data.\n4. Do not execute consequential actions without explicit human approval.\n5. Separate facts, assumptions, recommendations and decisions.\n`;
  return {
    kind: "context_capsule",
    objective: safeObjective.text || "",
    markdown,
    estimatedTokens: Math.ceil(markdown.length / 4),
    evidenceSourceCount: evidence.length,
    riskCount: scan.issues.length,
    trustScore: scan.score,
    redactionCount,
    privacyMode: "redacted",
    rules: ["cite-sources", "state-uncertainty", "protect-sensitive-data", "human-approval", "separate-facts-assumptions-decisions"],
  };
}

export function compareAiOutputs({ question, answers, evidence = [], language = "en" }) {
  language = normalizeLanguage(language);
  const corpus = sourceCorpus(evidence);
  const ranked = answers.map((answer, index) => {
    const scan = analyzeAiOutput({ title: answer.label || `Answer ${index + 1}`, aiOutput: answer.text, evidence, language });
    const relevance = Math.round(overlapScore(question, answer.text) * 100);
    const evidenceAlignment = corpus ? Math.round(overlapScore(answer.text, corpus) * 100) : 0;
    const claimCount = Math.max(1, scan.metrics.claimCount);
    const supportCoverage = Math.round((scan.metrics.supportedClaimCount / claimCount) * 100);
    const privacyPenalty = scan.issues
      .filter((finding) => finding.category === "privacy")
      .reduce((sum, finding) => sum + severityWeight(finding.severity), 0);
    const unsupportedClaimPenalty = Math.min(36, scan.metrics.unsupportedClaimCount * 9);
    const unsupportedNumberPenalty = Math.min(36, scan.metrics.unsupportedNumberCount * 18);
    const overclaimPenalty = Math.min(24, scan.metrics.overclaimCount * 12);
    const criticalPenalty = Math.min(36, scan.metrics.criticalCount * 18);
    const governanceSignals = [
      EVIDENCE_LANGUAGE.test(answer.text),
      UNCERTAINTY_LANGUAGE.test(answer.text),
      HUMAN_CONTROL_LANGUAGE.test(answer.text),
    ].filter(Boolean).length;
    const governanceBonus = governanceSignals * 5;
    const finalScore = Math.max(0, Math.min(100, Math.round(
      scan.score * 0.32
      + relevance * 0.08
      + evidenceAlignment * 0.20
      + supportCoverage * 0.40
      + governanceBonus
      - privacyPenalty
      - unsupportedClaimPenalty
      - unsupportedNumberPenalty
      - overclaimPenalty
      - criticalPenalty,
    )));
    return {
      label: answer.label || `Answer ${index + 1}`,
      score: finalScore,
      trustScore: scan.score,
      relevance,
      evidenceAlignment,
      supportCoverage,
      unsupportedClaimCount: scan.metrics.unsupportedClaimCount,
      unsupportedNumberCount: scan.metrics.unsupportedNumberCount,
      overclaimPenalty,
      governanceBonus,
      criticalCount: scan.metrics.criticalCount,
      topIssues: scan.issues.slice(0, 3),
    };
  }).sort((a, b) => b.score - a.score);
  return {
    kind: "comparison",
    question,
    ranking: ranked,
    winner: ranked[0]?.label || null,
    recommendation: ranked.length
      ? tr(language, `Use ${ranked[0].label} as the strongest evidence-bounded starting point, then verify its open findings.`, `Usá ${ranked[0].label} como el punto de partida mejor limitado por evidencia y verificá sus hallazgos abiertos.`)
      : tr(language, "No answers were supplied.", "No se aportaron respuestas."),
    methodology: tr(language, "Scores combine trust, relevance, evidence alignment, claim support, unsupported numbers, overclaiming, privacy and human-control signals.", "Los puntajes combinan confianza, relevancia, alineación con evidencia, respaldo de afirmaciones, números sin fuente, sobreafirmaciones, privacidad y señales de control humano."),
    limitations: tr(language, "Ranking is heuristic and depends on the supplied evidence; it is not a domain-expert judgment.", "La clasificación es heurística y depende de la evidencia aportada; no reemplaza el juicio de un especialista."),
  };
}

export function recommendAiRoute({ taskType, sensitivity, internetAllowed, consequence, budget, language = "en" }) {
  language = normalizeLanguage(language);
  let mode;
  let reason;
  if (sensitivity === "high" || internetAllowed === false) {
    mode = "local_private";
    reason = tr(language, "Keep raw data in a controlled local or private environment.", "Mantené los datos originales en un entorno local o privado controlado.");
  } else if (sensitivity === "medium" || consequence === "high" || taskType === "decision") {
    mode = "hybrid_verified";
    reason = tr(language, "Send only a minimized context capsule to a capable model and verify claims before acting.", "Enviá solo una cápsula mínima a un modelo potente y verificá las afirmaciones antes de actuar.");
  } else {
    mode = "cloud_accelerated";
    reason = tr(language, "Cloud use is reasonable, while evidence links and approval gates remain enabled.", "El uso de nube es razonable, manteniendo evidencia y aprobación humana.");
  }
  const contextBudget = budget === "low" ? 1000 : budget === "quality" ? 6000 : 2500;
  return {
    kind: "safe_route",
    mode,
    reason,
    contextBudget,
    controls: [
      tr(language, "Minimize shared context", "Minimizar el contexto compartido"),
      tr(language, "Keep tools read-only until approved", "Mantener herramientas en solo lectura hasta aprobar"),
      tr(language, "Require citations for factual claims", "Exigir citas para afirmaciones factuales"),
      tr(language, "Require human approval for irreversible actions", "Exigir aprobación humana para acciones irreversibles"),
    ],
  };
}

export function buildProofPack({ title, claimOrDecision, evidence = [], notes = "", language = "en" }) {
  language = normalizeLanguage(language);
  const scan = analyzeAiOutput({ title, aiOutput: claimOrDecision, evidence, language });
  const safeTitle = redactSensitiveText(title);
  const safeClaim = redactSensitiveText(claimOrDecision);
  const safeNotes = redactSensitiveText(notes);
  let redactionCount = safeTitle.redactionCount + safeClaim.redactionCount + safeNotes.redactionCount;
  const evidenceManifest = evidence.map((item, index) => {
    const safeSourceTitle = redactSensitiveText(item.title || `Source ${index + 1}`);
    const safeUrl = redactSensitiveText(item.url || "");
    const safeExcerpt = redactSensitiveText(item.text || "");
    redactionCount += safeSourceTitle.redactionCount + safeUrl.redactionCount + safeExcerpt.redactionCount;
    return {
      id: `source-${index + 1}`,
      title: safeSourceTitle.text,
      url: safeUrl.text,
      excerpt: safeExcerpt.text.slice(0, 1200),
    };
  });
  const payload = {
    format: "exovia-proof-pack-v1",
    title: safeTitle.text,
    generatedAt: new Date().toISOString(),
    claimOrDecision: safeClaim.text,
    evidenceManifest,
    trustReport: redactValue(scan),
    notes: safeNotes.text,
    governance: {
      humanApprovalRequired: true,
      externalActionsExecuted: false,
      sensitiveValuesRedacted: true,
      redactionCount,
      generatedBy: "Exovia NeuroCanvas ChatGPT App",
    },
  };
  const canonical = JSON.stringify(payload);
  const hash = createHash("sha256").update(canonical).digest("hex");
  return {
    kind: "proof_pack",
    proofPack: { ...payload, integrity: { algorithm: "SHA-256", hash, scope: "JSON payload excluding integrity field" } },
    hash,
    evidenceSourceCount: evidence.length,
    trustScore: scan.score,
    redactionCount,
    privacyMode: "redacted",
  };
}
