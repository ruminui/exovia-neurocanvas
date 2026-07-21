import { createHash } from "node:crypto";
import { analyzeAiOutput, recommendAiRoute, redactSensitiveText } from "./reliability.mjs";

const HUMAN_CONTROL = /\b(?:human review|human approval|approval required|reviewed by a human|revisión humana|aprobación humana|requiere aprobación|revisado por una persona)\b/i;
const DECISION_LANGUAGE = /\b(?:decision|decide|approved|rejected|chosen|recommendation|decisión|decidir|aprobado|rechazado|elegido|recomendación)\b/i;
const CONSTRAINT_LANGUAGE = /\b(?:constraint|limit|must|must not|cannot|risk|unknown|restriction|restricción|límite|debe|no debe|no puede|riesgo|desconocido)\b/i;
const NEXT_STEP_LANGUAGE = /\b(?:next step|action item|follow up|owner|deadline|próximo paso|acción|responsable|fecha límite)\b/i;
const HEADING_OR_LIST = /(^|\n)\s*(?:#{1,4}\s+|[-*]\s+|\d+[.)]\s+)/m;
const PROMPT_INJECTION = /ignore (?:all |the )?(?:previous|prior) instructions|ignora (?:todas )?las instrucciones anteriores|(?:reveal|show|print|repeat).{0,30}(?:system prompt|developer message|hidden instructions)|(?:jailbreak|bypass safety|disable safeguards|modo desarrollador)/i;

function normalizeLanguage(language) {
  return language === "es" ? "es" : "en";
}

function tr(language, en, es) {
  return normalizeLanguage(language) === "es" ? es : en;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function grade(score) {
  return score >= 92 ? "A+" : score >= 84 ? "A" : score >= 72 ? "B" : score >= 58 ? "C" : score >= 40 ? "D" : "E";
}

function roleStatus(score, blocked = false) {
  if (blocked) return "block";
  if (score >= 82) return "pass";
  return "warn";
}

function safeSlug(value) {
  return String(value || "exovia-assurance-council")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "exovia-assurance-council";
}

function unique(items) {
  return [...new Set(items.filter(Boolean))];
}

function makeRole({ id, label, purpose, score, blocked = false, findings = [], recommendation }) {
  const normalizedScore = clamp(score);
  return {
    id,
    label,
    purpose,
    score: normalizedScore,
    status: roleStatus(normalizedScore, blocked),
    findings: unique(findings).slice(0, 8),
    recommendation,
  };
}

function safeEvidence(evidence = []) {
  let redactionCount = 0;
  const items = evidence.map((source, index) => {
    const safeTitle = redactSensitiveText(source.title || `Source ${index + 1}`);
    const safeText = redactSensitiveText(source.text || "");
    const safeUrl = redactSensitiveText(source.url || "");
    redactionCount += safeTitle.redactionCount + safeText.redactionCount + safeUrl.redactionCount;
    return {
      id: `evidence-${index + 1}`,
      title: safeTitle.text,
      text: safeText.text,
      ...(safeUrl.text ? { url: safeUrl.text } : {}),
    };
  });
  return { items, redactionCount };
}

function createCouncilMap({ title, objective, roles, handoffs, verdict, consensusScore, language, integrityHash }) {
  const rootId = "council-root";
  const nodes = [{
    id: rootId,
    type: "corpus",
    title,
    text: objective,
    summary: tr(language, `Assurance Council verdict: ${verdict}. Consensus ${consensusScore}/100.`, `Veredicto del Consejo de Confiabilidad: ${verdict}. Consenso ${consensusScore}/100.`),
    parent: null,
    level: 0,
    keywords: ["assurance", "council", "human-review", "exovia"],
  }];
  const edges = [];

  for (const role of roles) {
    const roleId = `role-${role.id}`;
    nodes.push({
      id: roleId,
      type: role.id === "judge" ? "decision" : "agent",
      title: role.label,
      text: `${role.purpose}\n\n${role.findings.map((item) => `- ${item}`).join("\n")}\n\n${role.recommendation}`,
      summary: `${role.status.toUpperCase()} · ${role.score}/100`,
      parent: rootId,
      level: 1,
      keywords: [role.id, role.status, "assurance-council"],
      metadata: { status: role.status, score: role.score },
    });
    edges.push({ id: `contains-${role.id}`, a: rootId, b: roleId, type: "contains", weight: 1 });
  }

  for (const handoff of handoffs) {
    edges.push({
      id: `handoff-${handoff.from}-${handoff.to}`,
      a: `role-${handoff.from}`,
      b: `role-${handoff.to}`,
      type: "exial-handoff",
      weight: handoff.priority === "critical" ? 2 : 1,
      metadata: { signal: handoff.signal, status: handoff.status },
    });
  }

  return {
    format: "neurocanvas-v3",
    projectId: `assurance-${Date.now().toString(36)}`,
    title: `${title} — Exovia Assurance Council`,
    kind: "assurance-council",
    nodes,
    edges,
    audit: [{
      time: new Date().toISOString(),
      action: "EXOVIA_ASSURANCE_COUNCIL_COMPLETED",
      detail: `${verdict}; consensus ${consensusScore}/100; integrity ${integrityHash}`,
    }],
    governance: {
      humanReviewRequired: true,
      externalActionsExecuted: false,
      deterministicRoleLenses: true,
      simulatedIndependentModels: false,
      integrityHash,
    },
  };
}

export function runAssuranceCouncil({
  title = "AI-supported work",
  objective = "Review the work before a consequential decision",
  content,
  evidence = [],
  taskType = "decision",
  consequence = "high",
  language = "en",
}) {
  language = normalizeLanguage(language);
  const rawContent = String(content || "").trim();
  const safeTitle = redactSensitiveText(title);
  const safeObjective = redactSensitiveText(objective);
  const safeContent = redactSensitiveText(rawContent);
  const protectedEvidence = safeEvidence(evidence);
  const redactionCount = safeTitle.redactionCount + safeObjective.redactionCount + safeContent.redactionCount + protectedEvidence.redactionCount;

  const trust = analyzeAiOutput({ title, aiOutput: rawContent, evidence, language });
  const criticalPrivacy = trust.issues.filter((item) => item.category === "privacy" && item.severity === "critical").length;
  const criticalControl = trust.issues.filter((item) => item.category === "control" && item.severity === "critical").length;
  const weakEvidence = trust.metrics.evidenceSourceCount === 0 || trust.metrics.unsupportedClaimCount > trust.metrics.supportedClaimCount;
  const highConsequence = consequence === "high";
  const hasHumanControl = HUMAN_CONTROL.test(rawContent);
  const hasDecision = DECISION_LANGUAGE.test(rawContent);
  const hasConstraints = CONSTRAINT_LANGUAGE.test(rawContent);
  const hasNextStep = NEXT_STEP_LANGUAGE.test(rawContent);
  const hasStructure = HEADING_OR_LIST.test(rawContent);
  const injectionDetected = PROMPT_INJECTION.test(rawContent);

  const route = recommendAiRoute({
    taskType: ["research", "decision", "creative", "agent", "analysis"].includes(taskType) ? taskType : "analysis",
    sensitivity: criticalPrivacy || redactionCount ? "high" : evidence.length ? "medium" : "low",
    internetAllowed: true,
    consequence,
    budget: "normal",
    language,
  });

  const roles = [];
  roles.push(makeRole({
    id: "core",
    label: tr(language, "Core", "Núcleo"),
    purpose: tr(language, "Checks whether the objective, decision and central claim are explicit.", "Comprueba si el objetivo, la decisión y la afirmación central están explícitos."),
    score: 55 + (safeObjective.text.length >= 20 ? 20 : 0) + (hasDecision ? 15 : 0) + (rawContent.length >= 200 ? 10 : 0),
    findings: [
      !hasDecision && tr(language, "The decision or recommendation is not explicit.", "La decisión o recomendación no está explícita."),
      rawContent.length < 200 && tr(language, "The central context is too brief for a durable review.", "El contexto central es demasiado breve para una revisión durable."),
    ],
    recommendation: tr(language, "State the objective, claim, decision and success criterion in separate sentences.", "Separá el objetivo, la afirmación, la decisión y el criterio de éxito."),
  }));

  roles.push(makeRole({
    id: "continuity",
    label: tr(language, "Continuity", "Continuidad"),
    purpose: tr(language, "Protects memory across chats, tools, agents and time.", "Protege la memoria entre chats, herramientas, agentes y momentos distintos."),
    score: 48 + (hasConstraints ? 18 : 0) + (hasNextStep ? 18 : 0) + (evidence.length ? 16 : 0),
    findings: [
      !hasConstraints && tr(language, "Assumptions, constraints or unknowns are not preserved.", "No se preservan supuestos, restricciones o incógnitas."),
      !hasNextStep && tr(language, "There is no explicit next step, owner or follow-up.", "No hay un próximo paso, responsable o seguimiento explícito."),
    ],
    recommendation: tr(language, "Create a Context Capsule before moving this work to another model or person.", "Creá una Cápsula de Contexto antes de mover este trabajo a otro modelo o persona."),
  }));

  roles.push(makeRole({
    id: "evidence",
    label: tr(language, "Evidence", "Evidencia"),
    purpose: tr(language, "Checks provenance, source coverage and evidence-bounded language.", "Comprueba procedencia, cobertura de fuentes y lenguaje limitado por evidencia."),
    score: trust.dimensions.evidence,
    blocked: highConsequence && weakEvidence,
    findings: [
      !evidence.length && tr(language, "No evidence sources were supplied.", "No se aportaron fuentes de evidencia."),
      trust.metrics.unsupportedClaimCount > 0 && tr(language, `${trust.metrics.unsupportedClaimCount} claim(s) have weak evidence overlap.`, `${trust.metrics.unsupportedClaimCount} afirmación(es) tienen poco respaldo.`),
      trust.metrics.unsupportedNumberCount > 0 && tr(language, `${trust.metrics.unsupportedNumberCount} numeric claim(s) are absent from the supplied evidence.`, `${trust.metrics.unsupportedNumberCount} cifra(s) no aparecen en la evidencia aportada.`),
    ],
    recommendation: tr(language, "Attach exact sources and cite evidence IDs for every consequential claim.", "Adjuntá fuentes exactas y citá IDs de evidencia para cada afirmación importante."),
  }));

  const qaScore = 100 - trust.metrics.unsupportedClaimCount * 7 - trust.metrics.unsupportedNumberCount * 14 - trust.metrics.overclaimCount * 8;
  roles.push(makeRole({
    id: "qa",
    label: "QA",
    purpose: tr(language, "Tests internal consistency, measurable claims and reproducibility.", "Prueba consistencia interna, afirmaciones medibles y reproducibilidad."),
    score: qaScore,
    blocked: highConsequence && trust.metrics.unsupportedNumberCount > 0,
    findings: [
      trust.metrics.unsupportedNumberCount > 0 && tr(language, "Unverified numbers can materially change the decision.", "Las cifras no verificadas pueden cambiar materialmente la decisión."),
      trust.metrics.overclaimCount > 0 && tr(language, "Absolute language hides uncertainty.", "El lenguaje absoluto oculta incertidumbre."),
      !hasStructure && tr(language, "The result lacks a reproducible structure or checklist.", "El resultado no tiene una estructura o lista reproducible."),
    ],
    recommendation: tr(language, "Replace unsupported numbers, define acceptance tests and record expected versus observed results.", "Reemplazá cifras sin respaldo, definí pruebas de aceptación y registrá resultados esperados frente a observados."),
  }));

  roles.push(makeRole({
    id: "security",
    label: tr(language, "Security", "Seguridad"),
    purpose: tr(language, "Detects malicious instructions, unsafe authority changes and high-risk execution paths.", "Detecta instrucciones maliciosas, cambios inseguros de autoridad y rutas de ejecución riesgosas."),
    score: 100 - criticalControl * 45,
    blocked: injectionDetected || criticalControl > 0,
    findings: [
      injectionDetected && tr(language, "Prompt-injection language is present and must remain untrusted data.", "Hay lenguaje de inyección de prompt y debe seguir siendo dato no confiable."),
      criticalControl > 0 && tr(language, "A critical control finding requires isolation before reuse.", "Un hallazgo crítico de control exige aislamiento antes de reutilizar el contenido."),
    ],
    recommendation: tr(language, "Separate source instructions from system authority and validate all intents through EXIR/policy checks.", "Separá las instrucciones de fuente de la autoridad del sistema y validá cada intención mediante EXIR y políticas."),
  }));

  roles.push(makeRole({
    id: "privacy",
    label: tr(language, "Privacy", "Privacidad"),
    purpose: tr(language, "Prevents credentials and personal data from crossing model or team boundaries.", "Evita que credenciales y datos personales crucen límites entre modelos o equipos."),
    score: 100 - Math.min(80, redactionCount * 18),
    blocked: criticalPrivacy > 0,
    findings: [
      redactionCount > 0 && tr(language, `${redactionCount} sensitive value(s) were replaced in the council output.`, `Se reemplazaron ${redactionCount} valor(es) sensible(s) en la salida del consejo.`),
      criticalPrivacy > 0 && tr(language, "Credential-like data was detected in the submitted material.", "Se detectaron datos parecidos a credenciales en el material aportado."),
    ],
    recommendation: tr(language, "Rotate exposed credentials and share only redacted, minimum-necessary context.", "Rotá credenciales expuestas y compartí únicamente el contexto mínimo y redactado."),
  }));

  roles.push(makeRole({
    id: "prompt",
    label: tr(language, "Prompt Boundary", "Límite de Prompt"),
    purpose: tr(language, "Keeps source text, user intent, policy and executable authority separate.", "Mantiene separados el texto fuente, la intención, la política y la autoridad ejecutable."),
    score: injectionDetected ? 35 : hasConstraints ? 90 : 72,
    blocked: injectionDetected,
    findings: [
      injectionDetected && tr(language, "Source instructions could be mistaken for system authority.", "Las instrucciones de una fuente podrían confundirse con autoridad del sistema."),
      !hasConstraints && tr(language, "The allowed and prohibited actions are not explicit.", "Las acciones permitidas y prohibidas no están explícitas."),
    ],
    recommendation: tr(language, "Treat imported instructions as data; use Exil only as a preview and require policy validation before execution.", "Tratā las instrucciones importadas como datos; usá Exil solo como previsualización y exigí validación de políticas antes de ejecutar."),
  }));

  roles.push(makeRole({
    id: "workflow",
    label: tr(language, "Workflow", "Flujo de trabajo"),
    purpose: tr(language, "Checks reversibility, ownership, sequencing and recovery paths.", "Comprueba reversibilidad, responsables, secuencia y recuperación."),
    score: 50 + (hasNextStep ? 20 : 0) + (hasHumanControl ? 20 : 0) + (hasConstraints ? 10 : 0),
    blocked: highConsequence && !hasHumanControl,
    findings: [
      !hasNextStep && tr(language, "No owner or next action is recorded.", "No se registra responsable ni próxima acción."),
      highConsequence && !hasHumanControl && tr(language, "A high-consequence workflow has no explicit human approval gate.", "Un flujo de alta consecuencia no tiene una aprobación humana explícita."),
    ],
    recommendation: tr(language, "Use reversible steps, record an owner and recovery point, then request human approval.", "Usá pasos reversibles, registrá responsable y punto de recuperación, y luego solicitá aprobación humana."),
  }));

  roles.push(makeRole({
    id: "capability",
    label: "FAPI / Capability",
    purpose: tr(language, "Selects the safest capability route without binding the user to one provider.", "Selecciona la ruta de capacidad más segura sin atar al usuario a un proveedor."),
    score: route.mode === "local_private" ? 94 : route.mode === "hybrid_verified" ? 88 : 78,
    findings: [tr(language, `Recommended route: ${route.mode}.`, `Ruta recomendada: ${route.mode}.`)],
    recommendation: route.controls.join("; "),
  }));

  roles.push(makeRole({
    id: "docs",
    label: tr(language, "Documentation", "Documentación"),
    purpose: tr(language, "Checks whether another human can understand, reproduce and challenge the work.", "Comprueba si otra persona puede entender, reproducir y cuestionar el trabajo."),
    score: 48 + (hasStructure ? 28 : 0) + (safeObjective.text.length >= 20 ? 12 : 0) + (evidence.length ? 12 : 0),
    findings: [
      !hasStructure && tr(language, "The result needs headings, a checklist or a compact executive summary.", "El resultado necesita títulos, una lista o un resumen ejecutivo compacto."),
      !evidence.length && tr(language, "A reader cannot navigate from the explanation back to evidence.", "El lector no puede navegar desde la explicación hasta la evidencia."),
    ],
    recommendation: tr(language, "Publish a one-minute explanation, exact reproduction steps and links to the evidence artifacts.", "Publicá una explicación de un minuto, pasos exactos de reproducción y vínculos a los artefactos de evidencia."),
  }));

  roles.push(makeRole({
    id: "human",
    label: tr(language, "Human Authority", "Autoridad Humana"),
    purpose: tr(language, "Preserves accountability and the right to reject or revise AI-supported work.", "Preserva responsabilidad y el derecho a rechazar o revisar el trabajo asistido por IA."),
    score: hasHumanControl ? 96 : highConsequence ? 42 : 70,
    blocked: highConsequence && !hasHumanControl,
    findings: [!hasHumanControl && tr(language, "The work does not explicitly name the human approval boundary.", "El trabajo no nombra explícitamente el límite de aprobación humana.")],
    recommendation: tr(language, "Name the accountable reviewer, decision scope and conditions for approval or rejection.", "Nombrá a la persona responsable, el alcance de la decisión y las condiciones para aprobar o rechazar."),
  }));

  const preliminaryScore = clamp(roles.reduce((sum, role) => sum + role.score, 0) / roles.length);
  const preliminaryBlocks = roles.filter((role) => role.status === "block");
  const preliminaryWarnings = roles.filter((role) => role.status === "warn");
  const verdict = preliminaryBlocks.length ? "blocked" : preliminaryScore >= 86 && preliminaryWarnings.length <= 2 ? "ready" : "conditional";

  roles.push(makeRole({
    id: "judge",
    label: tr(language, "Judge", "Juez"),
    purpose: tr(language, "Aggregates the specialist lenses without hiding dissent.", "Integra las miradas especialistas sin ocultar desacuerdos."),
    score: preliminaryScore,
    blocked: verdict === "blocked",
    findings: [
      tr(language, `${preliminaryBlocks.length} blocking role(s) and ${preliminaryWarnings.length} warning role(s).`, `${preliminaryBlocks.length} rol(es) bloqueante(s) y ${preliminaryWarnings.length} rol(es) con advertencia.`),
      verdict === "ready" && tr(language, "The artifact is ready for human review, not autonomous execution.", "El artefacto está listo para revisión humana, no para ejecución autónoma."),
    ],
    recommendation: verdict === "blocked"
      ? tr(language, "Resolve every blocking finding before relying on this work.", "Resolvé cada hallazgo bloqueante antes de confiar en este trabajo.")
      : verdict === "conditional"
        ? tr(language, "Complete the prioritized actions and obtain human approval.", "Completá las acciones priorizadas y obtené aprobación humana.")
        : tr(language, "Proceed to accountable human review with the evidence and audit trail attached.", "Continuá con una revisión humana responsable y la evidencia y auditoría adjuntas."),
  }));

  const roleById = Object.fromEntries(roles.map((role) => [role.id, role]));
  const routes = [
    ["core", "continuity"], ["continuity", "evidence"], ["evidence", "qa"], ["qa", "judge"],
    ["security", "privacy"], ["privacy", "prompt"], ["prompt", "judge"],
    ["workflow", "capability"], ["capability", "human"], ["human", "judge"], ["docs", "judge"],
  ];
  const handoffs = routes.map(([from, to], index) => ({
    id: `handoff-${index + 1}`,
    from,
    to,
    signal: "review_handoff",
    status: roleById[from].status,
    priority: roleById[from].status === "block" ? "critical" : roleById[from].status === "warn" ? "high" : "normal",
    summary: `${roleById[from].label}: ${roleById[from].recommendation}`,
  }));

  const exialPulses = handoffs.map((handoff, index) => ({
    format: "exial-pulse-v1",
    id: `exial-council-${index + 1}`,
    time: new Date(Date.now() + index).toISOString(),
    from: handoff.from,
    to: handoff.to,
    signal: handoff.signal,
    status: handoff.status,
    priority: handoff.priority,
    summary: handoff.summary,
  }));
  const exirEvents = handoffs.map((handoff, index) => ({
    format: "exir-event-v1",
    id: `exir-council-${index + 1}`,
    type: "assurance.review.handoff",
    actor: handoff.from,
    target: handoff.to,
    payload: { status: handoff.status, priority: handoff.priority, summary: handoff.summary },
    policy: { sourceInstructionsAreData: true, externalExecutionAllowed: false, humanApprovalRequired: handoff.to === "judge" },
  }));

  const blockingRoles = roles.filter((role) => role.status === "block").map((role) => ({ id: role.id, label: role.label, findings: role.findings }));
  const dissent = roles.filter((role) => role.status !== "pass" && role.id !== "judge").map((role) => ({ role: role.label, status: role.status, score: role.score, recommendation: role.recommendation }));
  const nextBestActions = unique([
    ...roles.filter((role) => role.status === "block").map((role) => role.recommendation),
    ...roles.filter((role) => role.status === "warn").map((role) => role.recommendation),
  ]).slice(0, 8);

  const canonical = {
    kind: "assurance_council",
    version: "1.0.0",
    title: safeTitle.text,
    objective: safeObjective.text,
    taskType,
    consequence,
    consensusScore: preliminaryScore,
    grade: grade(preliminaryScore),
    verdict,
    roles,
    blockingRoles,
    dissent,
    nextBestActions,
    handoffs,
    exialPulses,
    exirEvents,
    safeRoute: route,
    evidence: protectedEvidence.items,
    governance: {
      humanApprovalRequired: true,
      externalActionsExecuted: false,
      deterministicRoleLenses: true,
      simulatedIndependentModels: false,
      sourceInstructionsAreData: true,
    },
    privacyMode: "redacted",
    redactionCount,
    limitations: tr(language, "The council is a deterministic multi-perspective review, not twelve independent AI models and not a substitute for domain experts or current-source verification.", "El consejo es una revisión determinística con múltiples perspectivas, no doce modelos de IA independientes ni un reemplazo de especialistas o de fuentes actuales."),
  };
  const hash = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  const map = createCouncilMap({ title: safeTitle.text, objective: safeObjective.text, roles, handoffs, verdict, consensusScore: preliminaryScore, language, integrityHash: hash });

  return {
    ...canonical,
    summary: verdict === "ready"
      ? tr(language, "The council found no blocking issue. Human review is still required.", "El consejo no encontró bloqueos. La revisión humana sigue siendo obligatoria.")
      : verdict === "conditional"
        ? tr(language, "The work is useful but needs targeted improvements before approval.", "El trabajo es útil, pero necesita mejoras puntuales antes de aprobarse.")
        : tr(language, "The council found blocking risks that must be resolved before use.", "El consejo encontró riesgos bloqueantes que deben resolverse antes de usar el resultado."),
    integrity: { algorithm: "SHA-256", hash, scope: "Council report excluding NeuroCanvas handoff and integrity field" },
    neurocanvasHandoff: {
      fileName: `${safeSlug(safeTitle.text)}-assurance-council.json`,
      map,
      nodeCount: map.nodes.length,
      edgeCount: map.edges.length,
    },
  };
}
