import { createHash } from "node:crypto";
import { analyzeAiOutput, recommendAiRoute, redactSensitiveText } from "./reliability.mjs";

const HUMAN_CONTROL = /\b(?:human review|human approval|approval required|reviewed by a human|revisión humana|aprobación humana|requiere aprobación|revisado por una persona)\b/i;
const HUMAN_CONTROL_REJECTED = /\b(?:no|without|skip|bypass|remove|avoid|not require(?:d)?|does not need|do not need)\s+(?:any\s+)?(?:human review|human approval|approval)|\b(?:sin|omitir|evitar|eliminar|no requiere|no necesita)\s+(?:ninguna\s+)?(?:revisión humana|aprobación humana|aprobación)\b/i;
const DECISION = /\b(?:decision|decide|approved|rejected|chosen|recommendation|decisión|decidir|aprobado|rechazado|elegido|recomendación)\b/i;
const CONSTRAINT = /\b(?:constraint|limit|must|must not|cannot|risk|unknown|restriction|restricción|límite|debe|no debe|no puede|riesgo|desconocido)\b/i;
const NEXT_STEP = /\b(?:next step|action item|follow up|owner|deadline|próximo paso|acción|responsable|fecha límite)\b/i;
const STRUCTURE = /(^|\n)\s*(?:#{1,4}\s+|[-*]\s+|\d+[.)]\s+)/m;
const INJECTION = /ignore (?:all |the )?(?:previous|prior) instructions|ignora (?:todas )?las instrucciones anteriores|(?:reveal|show|print|repeat).{0,30}(?:system prompt|developer message|hidden instructions)|(?:jailbreak|bypass safety|disable safeguards|modo desarrollador)/i;

const normLang = (value) => value === "es" ? "es" : "en";
const tr = (lang, en, es) => normLang(lang) === "es" ? es : en;
const clamp = (value) => Math.max(0, Math.min(100, Math.round(value)));
const grade = (score) => score >= 92 ? "A+" : score >= 84 ? "A" : score >= 72 ? "B" : score >= 58 ? "C" : score >= 40 ? "D" : "E";
const unique = (items) => [...new Set(items.filter(Boolean))];
const statusFor = (score, blocked) => blocked ? "block" : score >= 82 ? "pass" : "warn";

function slug(value) {
  return String(value || "exovia-assurance-council").toLowerCase().normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "exovia-assurance-council";
}

function role(id, label, purpose, score, findings, recommendation, blocked = false) {
  const normalized = clamp(score);
  return { id, label, purpose, score: normalized, status: statusFor(normalized, blocked), findings: unique(findings).slice(0, 8), recommendation };
}

function protectEvidence(evidence = []) {
  let redactionCount = 0;
  const items = evidence.map((source, index) => {
    const title = redactSensitiveText(source.title || `Source ${index + 1}`);
    const text = redactSensitiveText(source.text || "");
    const url = redactSensitiveText(source.url || "");
    redactionCount += title.redactionCount + text.redactionCount + url.redactionCount;
    return { id: `evidence-${index + 1}`, title: title.text, text: text.text, ...(url.text ? { url: url.text } : {}) };
  });
  return { items, redactionCount };
}

function councilMap({ title, objective, roles, handoffs, verdict, score, hash, language }) {
  const root = "council-root";
  const nodes = [{
    id: root, type: "corpus", title, text: objective, parent: null, level: 0,
    summary: tr(language, `Assurance Council verdict: ${verdict}. Consensus ${score}/100.`, `Veredicto del Consejo: ${verdict}. Consenso ${score}/100.`),
    keywords: ["assurance", "council", "human-review", "exovia"],
  }];
  const edges = [];
  for (const item of roles) {
    const id = `role-${item.id}`;
    nodes.push({
      id, type: item.id === "judge" ? "decision" : "agent", title: item.label, parent: root, level: 1,
      text: `${item.purpose}\n\n${item.findings.map((finding) => `- ${finding}`).join("\n")}\n\n${item.recommendation}`,
      summary: `${item.status.toUpperCase()} · ${item.score}/100`, keywords: [item.id, item.status, "assurance-council"],
      metadata: { status: item.status, score: item.score },
    });
    edges.push({ id: `contains-${item.id}`, a: root, b: id, type: "contains", weight: 1 });
  }
  for (const item of handoffs) {
    edges.push({
      id: `handoff-${item.from}-${item.to}`, a: `role-${item.from}`, b: `role-${item.to}`,
      type: "exial-handoff", weight: item.priority === "critical" ? 2 : 1,
      metadata: { signal: item.signal, status: item.status },
    });
  }
  return {
    format: "neurocanvas-v3", projectId: `assurance-${Date.now().toString(36)}`,
    title: `${title} — Exovia Assurance Council`, kind: "assurance-council", nodes, edges,
    audit: [{ time: new Date().toISOString(), action: "EXOVIA_ASSURANCE_COUNCIL_COMPLETED", detail: `${verdict}; consensus ${score}/100; integrity ${hash}` }],
    governance: { humanReviewRequired: true, externalActionsExecuted: false, deterministicRoleLenses: true, simulatedIndependentModels: false, integrityHash: hash },
  };
}

export function runAssuranceCouncil({ title = "AI-supported work", objective = "Review before a consequential decision", content, evidence = [], taskType = "decision", consequence = "high", language = "en" }) {
  language = normLang(language);
  const raw = String(content || "").trim();
  const safeTitle = redactSensitiveText(title);
  const safeObjective = redactSensitiveText(objective);
  const safeContent = redactSensitiveText(raw);
  const safeEvidence = protectEvidence(evidence);
  const redactionCount = safeTitle.redactionCount + safeObjective.redactionCount + safeContent.redactionCount + safeEvidence.redactionCount;
  const scan = analyzeAiOutput({ title, aiOutput: raw, evidence, language });

  const criticalPrivacy = scan.issues.filter((item) => item.category === "privacy" && item.severity === "critical").length;
  const criticalControl = scan.issues.filter((item) => item.category === "control" && item.severity === "critical").length;
  const high = consequence === "high";
  const humanControl = HUMAN_CONTROL.test(raw) && !HUMAN_CONTROL_REJECTED.test(raw);
  const hasDecision = DECISION.test(raw);
  const hasConstraints = CONSTRAINT.test(raw);
  const hasNextStep = NEXT_STEP.test(raw);
  const hasStructure = STRUCTURE.test(raw);
  const injection = INJECTION.test(raw);
  const weakEvidence = !evidence.length || scan.metrics.unsupportedClaimCount > scan.metrics.supportedClaimCount;

  const route = recommendAiRoute({
    taskType: ["research", "decision", "creative", "agent", "analysis"].includes(taskType) ? taskType : "analysis",
    sensitivity: criticalPrivacy || redactionCount ? "high" : evidence.length ? "medium" : "low",
    internetAllowed: true, consequence, budget: "normal", language,
  });

  const roles = [
    role("core", tr(language, "Core", "Núcleo"), tr(language, "Checks objective, claim, decision and success criterion.", "Comprueba objetivo, afirmación, decisión y criterio de éxito."),
      55 + (safeObjective.text.length >= 20 ? 20 : 0) + (hasDecision ? 15 : 0) + (raw.length >= 200 ? 10 : 0),
      [!hasDecision && tr(language, "The decision or recommendation is not explicit.", "La decisión o recomendación no está explícita."), raw.length < 200 && tr(language, "The central context is too brief.", "El contexto central es demasiado breve.")],
      tr(language, "State the objective, claim, decision and success criterion separately.", "Separá objetivo, afirmación, decisión y criterio de éxito.")),

    role("continuity", tr(language, "Continuity", "Continuidad"), tr(language, "Protects memory across chats, tools, agents and time.", "Protege la memoria entre chats, herramientas, agentes y tiempo."),
      48 + (hasConstraints ? 18 : 0) + (hasNextStep ? 18 : 0) + (evidence.length ? 16 : 0),
      [!hasConstraints && tr(language, "Assumptions, constraints or unknowns are missing.", "Faltan supuestos, restricciones o incógnitas."), !hasNextStep && tr(language, "There is no owner or next step.", "No hay responsable ni próximo paso.")],
      tr(language, "Create a Context Capsule before moving the work.", "Creá una Cápsula de Contexto antes de mover el trabajo.")),

    role("evidence", tr(language, "Evidence", "Evidencia"), tr(language, "Checks provenance and evidence-bounded claims.", "Comprueba procedencia y afirmaciones limitadas por evidencia."), scan.dimensions.evidence,
      [!evidence.length && tr(language, "No evidence sources were supplied.", "No se aportaron fuentes."), scan.metrics.unsupportedClaimCount > 0 && tr(language, `${scan.metrics.unsupportedClaimCount} claim(s) have weak support.`, `${scan.metrics.unsupportedClaimCount} afirmación(es) tienen poco respaldo.`), scan.metrics.unsupportedNumberCount > 0 && tr(language, `${scan.metrics.unsupportedNumberCount} numeric claim(s) are absent from evidence.`, `${scan.metrics.unsupportedNumberCount} cifra(s) no aparecen en la evidencia.`)],
      tr(language, "Attach exact sources and cite evidence IDs.", "Adjuntá fuentes exactas y citá IDs de evidencia."), high && weakEvidence),

    role("qa", "QA", tr(language, "Tests consistency, measurable claims and reproducibility.", "Prueba consistencia, afirmaciones medibles y reproducibilidad."),
      100 - scan.metrics.unsupportedClaimCount * 7 - scan.metrics.unsupportedNumberCount * 14 - scan.metrics.overclaimCount * 8,
      [scan.metrics.unsupportedNumberCount > 0 && tr(language, "Unverified numbers can change the decision.", "Las cifras no verificadas pueden cambiar la decisión."), scan.metrics.overclaimCount > 0 && tr(language, "Absolute language hides uncertainty.", "El lenguaje absoluto oculta incertidumbre."), !hasStructure && tr(language, "The result lacks a reproducible structure.", "El resultado no tiene estructura reproducible.")],
      tr(language, "Define acceptance tests and expected versus observed results.", "Definí pruebas de aceptación y resultados esperados frente a observados."), high && scan.metrics.unsupportedNumberCount > 0),

    role("security", tr(language, "Security", "Seguridad"), tr(language, "Detects malicious instructions and unsafe authority changes.", "Detecta instrucciones maliciosas y cambios inseguros de autoridad."),
      100 - criticalControl * 45,
      [injection && tr(language, "Prompt-injection language must remain untrusted data.", "La inyección de prompt debe seguir siendo dato no confiable."), criticalControl > 0 && tr(language, "A critical control finding requires isolation.", "Un hallazgo crítico de control exige aislamiento.")],
      tr(language, "Separate source instructions from authority and validate intents through EXIR and policy.", "Separá instrucciones de fuente de la autoridad y validá intenciones mediante EXIR y políticas."), injection || criticalControl > 0),

    role("privacy", tr(language, "Privacy", "Privacidad"), tr(language, "Prevents credentials and personal data crossing boundaries.", "Evita que credenciales y datos personales crucen límites."),
      100 - Math.min(80, redactionCount * 18),
      [redactionCount > 0 && tr(language, `${redactionCount} sensitive value(s) were replaced.`, `Se reemplazaron ${redactionCount} valor(es) sensible(s).`), criticalPrivacy > 0 && tr(language, "Credential-like data was detected.", "Se detectaron datos parecidos a credenciales.")],
      tr(language, "Rotate exposed credentials and share only minimum redacted context.", "Rotá credenciales expuestas y compartí solo contexto mínimo redactado."), criticalPrivacy > 0),

    role("prompt", tr(language, "Prompt Boundary", "Límite de Prompt"), tr(language, "Separates source text, intent, policy and executable authority.", "Separa texto fuente, intención, política y autoridad ejecutable."), injection ? 35 : hasConstraints ? 90 : 72,
      [injection && tr(language, "Source instructions could be mistaken for system authority.", "Las instrucciones de fuente podrían confundirse con autoridad."), !hasConstraints && tr(language, "Allowed and prohibited actions are not explicit.", "Las acciones permitidas y prohibidas no están explícitas.")],
      tr(language, "Treat imported instructions as data and Exil as preview only.", "Tratà instrucciones importadas como datos y Exil solo como previsualización."), injection),

    role("workflow", tr(language, "Workflow", "Flujo de trabajo"), tr(language, "Checks reversibility, ownership, sequence and recovery.", "Comprueba reversibilidad, responsables, secuencia y recuperación."),
      50 + (hasNextStep ? 20 : 0) + (humanControl ? 20 : 0) + (hasConstraints ? 10 : 0),
      [!hasNextStep && tr(language, "No owner or next action is recorded.", "No se registra responsable ni próxima acción."), high && !humanControl && tr(language, "High-consequence work has no valid human gate.", "El trabajo de alta consecuencia no tiene una aprobación humana válida.")],
      tr(language, "Use reversible steps, record an owner and request approval.", "Usá pasos reversibles, registrá responsable y solicitá aprobación."), high && !humanControl),

    role("capability", "FAPI / Capability", tr(language, "Selects a provider-neutral safe capability route.", "Selecciona una ruta de capacidad segura e independiente del proveedor."),
      route.mode === "local_private" ? 94 : route.mode === "hybrid_verified" ? 88 : 78,
      [tr(language, `Recommended route: ${route.mode}.`, `Ruta recomendada: ${route.mode}.`)], route.controls.join("; ")),

    role("docs", tr(language, "Documentation", "Documentación"), tr(language, "Checks whether another human can reproduce and challenge the work.", "Comprueba si otra persona puede reproducir y cuestionar el trabajo."),
      48 + (hasStructure ? 28 : 0) + (safeObjective.text.length >= 20 ? 12 : 0) + (evidence.length ? 12 : 0),
      [!hasStructure && tr(language, "The result needs headings or a checklist.", "El resultado necesita títulos o una lista."), !evidence.length && tr(language, "The explanation cannot navigate back to evidence.", "La explicación no puede volver a la evidencia.")],
      tr(language, "Publish a one-minute explanation and exact reproduction steps.", "Publicá una explicación de un minuto y pasos exactos de reproducción.")),

    role("human", tr(language, "Human Authority", "Autoridad Humana"), tr(language, "Preserves accountability and the right to reject or revise.", "Preserva responsabilidad y el derecho a rechazar o revisar."),
      humanControl ? 96 : high ? 42 : 70,
      [!humanControl && tr(language, "No valid human approval boundary is named.", "No se nombra un límite válido de aprobación humana."), HUMAN_CONTROL_REJECTED.test(raw) && tr(language, "The text explicitly rejects human review.", "El texto rechaza explícitamente la revisión humana.")],
      tr(language, "Name the accountable reviewer and approval conditions.", "Nombrá a la persona responsable y las condiciones de aprobación."), high && !humanControl),
  ];

  const baseScore = clamp(roles.reduce((sum, item) => sum + item.score, 0) / roles.length);
  const baseBlocks = roles.filter((item) => item.status === "block");
  const baseWarnings = roles.filter((item) => item.status === "warn");
  const verdict = baseBlocks.length ? "blocked" : baseScore >= 86 && baseWarnings.length <= 2 ? "ready" : "conditional";

  roles.push(role("judge", tr(language, "Judge", "Juez"), tr(language, "Aggregates specialist lenses without hiding dissent.", "Integra miradas especialistas sin ocultar desacuerdos."), baseScore,
    [tr(language, `${baseBlocks.length} blocking role(s) and ${baseWarnings.length} warning role(s).`, `${baseBlocks.length} rol(es) bloqueante(s) y ${baseWarnings.length} con advertencia.`)],
    verdict === "blocked" ? tr(language, "Resolve every block before relying on the work.", "Resolvé cada bloqueo antes de confiar en el trabajo.") : verdict === "conditional" ? tr(language, "Complete prioritized actions and obtain human approval.", "Completá acciones priorizadas y obtené aprobación humana.") : tr(language, "Proceed to accountable human review with evidence attached.", "Continuá con revisión humana responsable y evidencia adjunta."), verdict === "blocked"));

  const byId = Object.fromEntries(roles.map((item) => [item.id, item]));
  const routes = [["core", "continuity"], ["continuity", "evidence"], ["evidence", "qa"], ["qa", "judge"], ["security", "privacy"], ["privacy", "prompt"], ["prompt", "judge"], ["workflow", "capability"], ["capability", "human"], ["human", "judge"], ["docs", "judge"]];
  const handoffs = routes.map(([from, to], index) => ({
    id: `handoff-${index + 1}`, from, to, signal: "review_handoff", status: byId[from].status,
    priority: byId[from].status === "block" ? "critical" : byId[from].status === "warn" ? "high" : "normal",
    summary: `${byId[from].label}: ${byId[from].recommendation}`,
  }));
  const exialPulses = handoffs.map((item, index) => ({ format: "exial-pulse-v1", id: `exial-council-${index + 1}`, time: new Date(Date.now() + index).toISOString(), from: item.from, to: item.to, signal: item.signal, status: item.status, priority: item.priority, summary: item.summary }));
  const exirEvents = handoffs.map((item, index) => ({ format: "exir-event-v1", id: `exir-council-${index + 1}`, type: "assurance.review.handoff", actor: item.from, target: item.to, payload: { status: item.status, priority: item.priority, summary: item.summary }, policy: { sourceInstructionsAreData: true, externalExecutionAllowed: false, humanApprovalRequired: item.to === "judge" } }));
  const blockingRoles = roles.filter((item) => item.status === "block").map((item) => ({ id: item.id, label: item.label, findings: item.findings }));
  const dissent = roles.filter((item) => item.status !== "pass" && item.id !== "judge").map((item) => ({ role: item.label, status: item.status, score: item.score, recommendation: item.recommendation }));
  const nextBestActions = unique([...roles.filter((item) => item.status === "block").map((item) => item.recommendation), ...roles.filter((item) => item.status === "warn").map((item) => item.recommendation)]).slice(0, 8);

  const canonical = {
    kind: "assurance_council", version: "1.0.0", title: safeTitle.text, objective: safeObjective.text, taskType, consequence,
    consensusScore: baseScore, grade: grade(baseScore), verdict, roles, blockingRoles, dissent, nextBestActions, handoffs, exialPulses, exirEvents,
    safeRoute: route, evidence: safeEvidence.items,
    governance: { humanApprovalRequired: true, externalActionsExecuted: false, deterministicRoleLenses: true, simulatedIndependentModels: false, sourceInstructionsAreData: true },
    privacyMode: "redacted", redactionCount,
    limitations: tr(language, "Deterministic multi-perspective review, not twelve independent AI models and not a substitute for specialists or current-source verification.", "Revisión determinística con múltiples perspectivas, no doce modelos independientes ni un reemplazo de especialistas o fuentes actuales."),
  };
  const hash = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  const map = councilMap({ title: safeTitle.text, objective: safeObjective.text, roles, handoffs, verdict, score: baseScore, hash, language });

  return {
    ...canonical,
    summary: verdict === "ready" ? tr(language, "No blocking issue found. Human review is still required.", "No se encontraron bloqueos. La revisión humana sigue siendo obligatoria.") : verdict === "conditional" ? tr(language, "Useful work that needs targeted improvements before approval.", "Trabajo útil que necesita mejoras puntuales antes de aprobarse.") : tr(language, "Blocking risks must be resolved before use.", "Los riesgos bloqueantes deben resolverse antes de usar el resultado."),
    integrity: { algorithm: "SHA-256", hash, scope: "Council report excluding NeuroCanvas handoff and integrity field" },
    neurocanvasHandoff: { fileName: `${slug(safeTitle.text)}-assurance-council.json`, map, nodeCount: map.nodes.length, edgeCount: map.edges.length },
  };
}
