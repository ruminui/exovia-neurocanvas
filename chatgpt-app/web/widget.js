const root = document.getElementById("app");
let currentData = null;

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[character]));

const locale = () => String(window.openai?.locale || document.documentElement.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
const translate = (english, spanish) => locale() === "es" ? spanish : english;

function header() {
  return `<header class="head"><div class="brand"><span class="mark">◇</span><div><small>EXOVIA PROOFLAYER</small><strong>${translate("AI Reliability", "Confiabilidad de IA")}</strong></div></div><div class="actions"><button id="fullscreen">${translate("Expand", "Ampliar")}</button></div></header>`;
}

function footer() {
  return `<footer class="foot"><span>${translate("Heuristic analysis · human review remains required", "Análisis heurístico · sigue siendo necesaria la revisión humana")}</span><span>v0.3</span></footer>`;
}

function issueCards(items = []) {
  if (!items.length) return `<div class="section"><h3>${translate("No material findings", "Sin hallazgos importantes")}</h3></div>`;
  return `<div class="issues">${items.map((item) => `<article class="issue" data-severity="${escapeHtml(item.severity)}"><i class="dot"></i><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></div></article>`).join("")}</div>`;
}

function metric(label, value, warning = false) {
  return `<span class="metric${warning ? " metricWarn" : "}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></span>`;
}

function renderTrust(data) {
  const dimensions = data.dimensions || {};
  const numberWarnings = data.unsupportedNumbers?.length
    ? `<section class="section"><h3>${translate("Numbers not found in evidence", "Números ausentes en la evidencia")}</h3><p>${data.unsupportedNumbers.map(escapeHtml).join(" · ")}</p></section>`
    : "";
  root.innerHTML = header()
    + `<section class="hero"><div class="score" style="--score:${Number(data.score || 0)}"><strong>${escapeHtml(data.score)}</strong><span>${translate("trust", "confianza")}</span></div><div><h2>${escapeHtml(data.title || translate("AI output", "Resultado de IA"))}</h2><p>${escapeHtml(data.summary)}</p></div></section>`
    + `<div class="dimensions">${Object.entries(dimensions).map(([key, value]) => `<div class="dimension"><span>${escapeHtml(key)}</span><strong>${escapeHtml(value)}</strong></div>`).join("")}</div>`
    + issueCards(data.issues)
    + (data.unsupportedClaims?.length ? `<section class="section"><h3>${translate("Claims needing stronger evidence", "Afirmaciones que necesitan más evidencia")}</h3>${data.unsupportedClaims.map((item) => `<p>• ${escapeHtml(item.claim)}</p>`).join("")}</section>` : "")
    + numberWarnings
    + footer();
  bindActions();
}

function renderCapsule(data) {
  const redactions = Number(data.redactionCount || 0);
  root.innerHTML = header()
    + `<section class="hero"><div class="mark">▣</div><div><h2>${translate("Portable context capsule", "Cápsula de contexto portátil")}</h2><p>${escapeHtml(data.estimatedTokens)} ${translate("estimated tokens", "tokens estimados")} · ${escapeHtml(data.evidenceSourceCount)} ${translate("sources", "fuentes")} · ${escapeHtml(data.riskCount)} ${translate("risks", "riesgos")}</p></div></section>`
    + `<div class="metricRow">${metric(translate("Privacy mode", "Modo de privacidad"), translate("Redacted", "Redactado"))}${metric(translate("Sensitive values replaced", "Valores sensibles reemplazados"), redactions, redactions > 0)}</div>`
    + `<section class="section"><pre>${escapeHtml(data.markdown)}</pre></section>`
    + footer();
  bindActions();
}

function renderMap(data) {
  root.innerHTML = header()
    + `<section class="hero"><div class="mark">◎</div><div><h2>${translate("NeuroCanvas map ready", "Mapa NeuroCanvas listo")}</h2><p>${escapeHtml(data.nodeCount)} ${translate("nodes", "nodos")} · ${escapeHtml(data.edgeCount)} ${translate("relationships", "relaciones")} · ${escapeHtml(data.evidenceSourceCount)} ${translate("sources", "fuentes")}</p></div></section>`
    + `<section class="section"><h3>${escapeHtml(data.fileName)}</h3><p>${escapeHtml(data.instructions)}</p><div class="actions"><button id="copyMap">${translate("Copy JSON", "Copiar JSON")}</button><button id="downloadMap">${translate("Download for NeuroCanvas", "Descargar para NeuroCanvas")}</button></div></section>`
    + `<section class="section"><pre>${escapeHtml(JSON.stringify(data.map, null, 2))}</pre></section>`
    + footer();
  bindActions();
}

function renderComparison(data) {
  root.innerHTML = header()
    + `<section class="hero"><div class="mark">↔</div><div><h2>${translate("AI output comparison", "Comparación de respuestas de IA")}</h2><p>${escapeHtml(data.recommendation)}</p></div></section>`
    + `<section class="ranking">${(data.ranking || []).map((item, index) => `<article class="rank"><span class="pos">${index + 1}</span><div><strong>${escapeHtml(item.label)}</strong><div class="rankMetrics">${translate("Evidence", "Evidencia")} ${escapeHtml(item.evidenceAlignment)} · ${translate("Support", "Respaldo")} ${escapeHtml(item.supportCoverage)} · ${translate("Unverified numbers", "Números sin verificar")} ${escapeHtml(item.unsupportedNumberCount)}</div></div><strong>${escapeHtml(item.score)}</strong></article>`).join("")}</section>`
    + `<section class="section"><h3>${translate("Transparent method", "Método transparente")}</h3><p>${escapeHtml(data.methodology || data.limitations)}</p></section>`
    + footer();
  bindActions();
}

function renderRoute(data) {
  root.innerHTML = header()
    + `<section class="hero"><div class="mark">◎</div><div><small>${translate("RECOMMENDED ROUTE", "RUTA RECOMENDADA")}</small><div class="route">${escapeHtml(String(data.mode || "").replaceAll("_", " ").toUpperCase())}</div><p>${escapeHtml(data.reason)}</p></div></section>`
    + `<section class="section"><h3>${translate("Controls", "Controles")}</h3>${(data.controls || []).map((item) => `<p>✓ ${escapeHtml(item)}</p>`).join("")}<p>${translate("Context budget", "Presupuesto de contexto")}: ${escapeHtml(data.contextBudget)} tokens</p></section>`
    + footer();
  bindActions();
}

function renderProof(data) {
  const redactions = Number(data.redactionCount || 0);
  root.innerHTML = header()
    + `<section class="hero"><div class="mark">#</div><div><h2>${translate("Verified Proof Pack", "Paquete de prueba verificable")}</h2><p>${escapeHtml(data.evidenceSourceCount)} ${translate("sources", "fuentes")} · ${translate("trust", "confianza")} ${escapeHtml(data.trustScore)}</p></div></section>`
    + `<div class="metricRow">${metric(translate("Sensitive values replaced", "Valores sensibles reemplazados"), redactions, redactions > 0)}${metric(translate("Human approval", "Aprobación humana"), translate("Required", "Obligatoria"))}</div>`
    + `<section class="section"><h3>SHA-256</h3><div class="hash">${escapeHtml(data.hash)}</div></section>`
    + `<section class="section"><h3>${translate("Governance", "Gobernanza")}</h3><p>✓ ${translate("Sensitive values redacted before export", "Valores sensibles redactados antes de exportar")}</p><p>✓ ${translate("Human approval required", "Aprobación humana obligatoria")}</p><p>✓ ${translate("No external actions executed", "No se ejecutaron acciones externas")}</p></section>`
    + footer();
  bindActions();
}

function render(data) {
  if (!data) return;
  currentData = data;
  const renderer = {
    trust_scan: renderTrust,
    context_capsule: renderCapsule,
    neurocanvas_map: renderMap,
    comparison: renderComparison,
    safe_route: renderRoute,
    proof_pack: renderProof,
  }[data.kind] || renderTrust;
  renderer(data);
}

function bindActions() {
  document.getElementById("fullscreen")?.addEventListener("click", () => window.openai?.requestDisplayMode?.({ mode: "fullscreen" }));
  document.getElementById("copyMap")?.addEventListener("click", async () => {
    await navigator.clipboard?.writeText(JSON.stringify(currentData?.map, null, 2));
  });
  document.getElementById("downloadMap")?.addEventListener("click", () => {
    if (!currentData?.map) return;
    const blob = new Blob([`${JSON.stringify(currentData.map, null, 2)}\n`], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = currentData.fileName || "exovia-neurocanvas-map.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
}

render(window.openai?.toolOutput);
window.addEventListener("openai:set_globals", (event) => render(event.detail?.globals?.toolOutput ?? window.openai?.toolOutput), { passive: true });
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  const message = event.data;
  if (message?.jsonrpc === "2.0" && message.method === "ui/notifications/tool-result") render(message.params?.structuredContent);
}, { passive: true });
