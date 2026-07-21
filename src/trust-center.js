(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const now = () => new Date().toISOString();
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[char]));
  const lang = () => window.ExoviaLanguage?.get?.() || (/^es\b/i.test(navigator.language || '') ? 'es' : 'en');
  const tr = (en, es) => lang() === 'es' ? es : en;
  const runtimeMap = () => window.ExoviaRuntime?.getMap?.() || null;
  let activePanel = 'scan';
  let latestReport = null;
  let latestCapsule = null;

  const patterns = {
    secret: [
      /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/g,
      /(?:api[_ -]?key|secret|token|password|contraseña)\s*[:=]\s*["']?[A-Za-z0-9_\-\.]{8,}/gi,
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
    ],
    personal: [
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
      /\b(?:\+?54\s?)?(?:9\s?)?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{4}\b/g,
      /\b\d{7,8}\b/g
    ],
    injection: [
      /ignore (?:all |the )?(?:previous|prior) instructions/gi,
      /ignora (?:todas )?las instrucciones anteriores/gi,
      /(?:reveal|show|print|repeat).{0,30}(?:system prompt|developer message|hidden instructions)/gi,
      /(?:jailbreak|bypass safety|disable safeguards|modo desarrollador)/gi
    ],
    timeSensitive: /\b(?:today|current|latest|now|price|law|regulation|version|hoy|actual|últim[oa]|ahora|precio|ley|normativa|versión)\b/i
  };

  function sourceLabel(node) {
    if (typeof node.source === 'string') return node.source;
    if (node.source?.url) return node.source.url;
    if (node.source?.name) return node.source.name;
    return node.path || node.url || node.file || '';
  }

  function scanMap(map = runtimeMap()) {
    if (!map) return { noProject: true, score: 0, grade: '—', issues: [], dimensions: { evidence: 0, privacy: 0, context: 0, control: 0 }, stats: {} };
    const nodes = Array.isArray(map.nodes) ? map.nodes : [];
    const edges = Array.isArray(map.edges) ? map.edges : [];
    const ids = new Set(nodes.map(node => String(node.id)));
    const issues = [];
    const add = (severity, category, title, detail, nodeId = null, fixable = false) => issues.push({ id: uid('risk'), severity, category, title, detail, nodeId, fixable });

    for (const edge of edges) {
      if (!ids.has(String(edge.a)) || !ids.has(String(edge.b))) add('high', 'context', tr('Broken graph connection', 'Conexión rota en el mapa'), tr(`A relationship points to a node that no longer exists (${edge.a} → ${edge.b}).`, `Una relación apunta a un nodo que ya no existe (${edge.a} → ${edge.b}).`), null, true);
    }

    for (const node of nodes) {
      if (!node || node.type === 'corpus') continue;
      const text = String(node.text || node.summary || '');
      if (!text.trim()) add('medium', 'evidence', tr('Empty evidence node', 'Nodo sin evidencia'), tr(`“${node.title || node.id}” has no source content.`, `“${node.title || node.id}” no tiene contenido de fuente.`), node.id);
      if (node.parent && !ids.has(String(node.parent))) add('high', 'context', tr('Orphaned knowledge node', 'Nodo de conocimiento huérfano'), tr(`“${node.title || node.id}” lost its parent connection.`, `“${node.title || node.id}” perdió su conexión principal.`), node.id, true);
      if (!sourceLabel(node) && !['topic','agent','capability','action'].includes(node.type)) add('medium', 'evidence', tr('Missing provenance', 'Falta procedencia'), tr(`“${node.title || node.id}” cannot yet prove where its information came from.`, `“${node.title || node.id}” todavía no puede demostrar de dónde salió su información.`), node.id);
      if (patterns.secret.some(pattern => { pattern.lastIndex = 0; return pattern.test(text); })) add('critical', 'privacy', tr('Possible credential or secret', 'Posible credencial o secreto'), tr(`Sensitive credential-like data was detected inside “${node.title || node.id}”. Review before sharing.`, `Se detectaron datos parecidos a una credencial dentro de “${node.title || node.id}”. Revisalos antes de compartir.`), node.id);
      if (patterns.personal.some(pattern => { pattern.lastIndex = 0; return pattern.test(text); })) add('medium', 'privacy', tr('Possible personal information', 'Posible información personal'), tr(`“${node.title || node.id}” may contain contact or identifying data.`, `“${node.title || node.id}” puede contener datos de contacto o identificación.`), node.id);
      if (patterns.injection.some(pattern => { pattern.lastIndex = 0; return pattern.test(text); })) add('critical', 'control', tr('Prompt-injection pattern', 'Patrón de inyección de prompt'), tr(`“${node.title || node.id}” contains instructions that may try to override an AI system.`, `“${node.title || node.id}” contiene instrucciones que podrían intentar anular el sistema de IA.`), node.id);
      if (patterns.timeSensitive.test(text) && !sourceLabel(node)) add('low', 'evidence', tr('Time-sensitive claim without source', 'Afirmación temporal sin fuente'), tr(`“${node.title || node.id}” appears to discuss changing information but has no recorded source.`, `“${node.title || node.id}” parece hablar de información cambiante pero no registra una fuente.`), node.id);
    }

    const health = (() => { try { return window.ExoviaIntelligence?.health?.(); } catch { return null; } })();
    for (const conflict of health?.contradictions || []) add('high', 'evidence', tr('Possible contradiction', 'Posible contradicción'), tr('Two source fragments appear to disagree about a date or status.', 'Dos fragmentos de fuente parecen contradecirse sobre una fecha o un estado.'));
    if (!(map.audit?.length)) add('medium', 'control', tr('No decision trail', 'No hay rastro de decisiones'), tr('Important changes cannot be replayed because this project has no audit trail.', 'Los cambios importantes no pueden reconstruirse porque el proyecto no tiene historial de auditoría.'));
    if (!(map.events?.length) && map.kind === 'pulse') add('medium', 'control', tr('Agent activity has no events', 'La actividad de agentes no tiene eventos'), tr('This pulse project does not contain replayable agent events.', 'Este proyecto de pulsos no contiene eventos de agentes que puedan reproducirse.'));

    const weights = { critical: 18, high: 11, medium: 6, low: 2 };
    const categoryPenalty = { evidence: 0, privacy: 0, context: 0, control: 0 };
    for (const issue of issues) categoryPenalty[issue.category] += weights[issue.severity] || 1;
    const dimensions = Object.fromEntries(Object.entries(categoryPenalty).map(([key, penalty]) => [key, Math.max(0, 100 - Math.min(100, penalty))]));
    const score = Math.max(0, Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / 4));
    const grade = score >= 92 ? 'A+' : score >= 84 ? 'A' : score >= 72 ? 'B' : score >= 58 ? 'C' : score >= 40 ? 'D' : 'E';
    const stats = {
      nodes: nodes.length,
      evidence: nodes.filter(node => node.type !== 'corpus' && String(node.text || '').trim()).length,
      sources: nodes.filter(node => sourceLabel(node)).length,
      critical: issues.filter(issue => issue.severity === 'critical').length,
      fixable: issues.filter(issue => issue.fixable).length
    };
    return { noProject: false, score, grade, issues, dimensions, stats, scannedAt: now(), projectTitle: map.title || tr('Untitled project', 'Proyecto sin título') };
  }

  function issueCopy(issue) {
    const category = { evidence: tr('Evidence', 'Evidencia'), privacy: tr('Privacy', 'Privacidad'), context: tr('Context', 'Contexto'), control: tr('Control', 'Control') }[issue.category];
    return `<article class="trustIssue" data-severity="${issue.severity}"><span class="trustSeverity"></span><div><strong>${esc(issue.title)}</strong><p>${esc(issue.detail)}</p>${issue.nodeId ? `<code>${esc(issue.nodeId)}</code>` : ''}</div><span class="issueTag">${esc(category)}</span></article>`;
  }

  function renderScan() {
    latestReport = scanMap();
    const panel = document.querySelector('[data-trust-panel="scan"]');
    if (!panel) return;
    if (latestReport.noProject) {
      panel.innerHTML = `<div class="trustEmpty"><div><div class="emptyShield">◇</div><h3>${tr('Open a project to verify it', 'Abrí un proyecto para verificarlo')}</h3><p>${tr('Import an AI answer, document or conversation. NeuroCanvas will scan it locally for evidence gaps, privacy risks, lost context and unsafe instructions.', 'Importá una respuesta de IA, un documento o una conversación. NeuroCanvas la analizará localmente para encontrar falta de evidencia, riesgos de privacidad, contexto perdido e instrucciones inseguras.')}</p><button type="button" id="trustImportEmpty">${tr('Import information', 'Importar información')}</button></div></div>`;
      $('trustImportEmpty')?.addEventListener('click', () => { $('trustCenterDialog')?.close(); $('pasteBtn')?.click(); });
      return;
    }
    const d = latestReport.dimensions;
    const ringColor = latestReport.score >= 80 ? '#d8aa42' : latestReport.score >= 55 ? '#e3b55b' : '#e07968';
    const description = latestReport.score >= 90 ? tr('Strong verification posture. Review the remaining warnings before sharing.', 'Buena postura de verificación. Revisá las advertencias restantes antes de compartir.') : latestReport.score >= 70 ? tr('Useful foundation, but important evidence or privacy gaps remain.', 'Buena base, pero todavía quedan huecos importantes de evidencia o privacidad.') : tr('High-risk project. Resolve critical findings before using it for decisions.', 'Proyecto de alto riesgo. Resolvé los hallazgos críticos antes de usarlo para decisiones.');
    const dimension = (name, value, copy) => `<article class="trustDimensionCard"><header><span>${name}</span><strong>${value}</strong></header><div class="trustBar"><i style="--value:${value}%"></i></div><p>${copy}</p></article>`;
    panel.innerHTML = `<div class="trustOverview">
      <section class="trustScoreCard"><div class="trustScoreRing" style="--score:${latestReport.score};--ring-color:${ringColor}"><strong>${latestReport.score}</strong><span>${tr('trust score', 'confianza')}</span></div><strong class="trustGrade">${tr('Grade', 'Nivel')} ${latestReport.grade}</strong><p>${esc(description)}</p><div class="trustScoreMeta"><div><strong>${latestReport.stats.critical}</strong><span>${tr('critical', 'críticos')}</span></div><div><strong>${latestReport.issues.length}</strong><span>${tr('findings', 'hallazgos')}</span></div></div></section>
      <section class="trustMain"><div class="trustDimensions">
        ${dimension(tr('Evidence','Evidencia'),d.evidence,tr('Sources and factual support','Fuentes y respaldo factual'))}
        ${dimension(tr('Privacy','Privacidad'),d.privacy,tr('Secrets and personal data','Secretos y datos personales'))}
        ${dimension(tr('Context','Contexto'),d.context,tr('Graph integrity and continuity','Integridad y continuidad'))}
        ${dimension(tr('Control','Control'),d.control,tr('Auditability and approval','Auditoría y aprobación'))}
      </div><div class="trustActionRow"><button type="button" id="runTrustScan" class="trustPrimary">${tr('Run scan again','Volver a analizar')}</button><button type="button" id="repairTrustIssues" ${latestReport.stats.fixable ? '' : 'disabled'}>${tr(`Repair ${latestReport.stats.fixable} safe structural issues`,`Reparar ${latestReport.stats.fixable} problemas estructurales`)}</button><button type="button" id="createRiskChecklist">${tr('Add verification checklist','Agregar lista de verificación')}</button><small>${tr('No project content leaves this device.','Ningún contenido sale de este dispositivo.')}</small></div>
      <div class="trustIssueList">${latestReport.issues.length ? latestReport.issues.map(issueCopy).join('') : `<div class="trustAllClear"><strong>${tr('No material risks found','No se encontraron riesgos importantes')}</strong><span>${tr('Continue to keep sources attached and review AI changes before applying them.','Seguí manteniendo las fuentes conectadas y revisá los cambios de IA antes de aplicarlos.')}</span></div>`}</div></section>
    </div>`;
    $('runTrustScan')?.addEventListener('click', renderScan);
    $('repairTrustIssues')?.addEventListener('click', repairSafeIssues);
    $('createRiskChecklist')?.addEventListener('click', createChecklist);
  }

  function repairSafeIssues() {
    const map = runtimeMap(); if (!map) return;
    const repaired = clone(map); const ids = new Set(repaired.nodes.map(node => String(node.id))); const root = repaired.nodes.find(node => node.type === 'corpus')?.id || repaired.nodes[0]?.id || null;
    const oldEdges = repaired.edges.length;
    repaired.edges = repaired.edges.filter(edge => ids.has(String(edge.a)) && ids.has(String(edge.b)));
    let orphans = 0;
    repaired.nodes.forEach(node => { if (node.parent && !ids.has(String(node.parent))) { node.parent = root; orphans++; } });
    repaired.audit ||= [];
    repaired.audit.push({ time: now(), action: 'TRUST_SAFE_REPAIR', detail: `Removed ${oldEdges - repaired.edges.length} broken edges and reconnected ${orphans} orphan nodes.` });
    window.ExoviaRuntime?.loadMap?.(repaired, window.ExoviaRuntime?.getView?.());
    window.ExoviaNotify?.(tr('Safe structural issues repaired. No source text was changed.', 'Problemas estructurales reparados. No se modificó ningún texto fuente.'), 'success');
    renderScan();
  }

  function createChecklist() {
    const map = runtimeMap(); if (!map) return;
    const report = scanMap(map); const next = clone(map); const root = next.nodes.find(node => node.type === 'corpus')?.id || next.nodes[0]?.id; const id = uid('verification');
    const lines = report.issues.slice(0, 20).map((issue, index) => `${index + 1}. [ ] ${issue.title}${issue.nodeId ? ` — ${issue.nodeId}` : ''}`).join('\n') || tr('1. [ ] Re-check sources before the final decision.', '1. [ ] Volver a revisar las fuentes antes de la decisión final.');
    next.nodes.push({ id, type: 'note', title: tr('AI verification checklist', 'Lista de verificación de IA'), summary: tr('Open risks that require human review', 'Riesgos abiertos que necesitan revisión humana'), text: `${tr('Generated locally from the latest Trust Scan.','Generada localmente a partir del último análisis de confianza.')}\n\n${lines}`, keywords: ['verification','risk','human-review'], parent: root, level: 1 });
    if (root) next.edges.push({ a: root, b: id, type: 'governance', weight: 1 });
    next.audit ||= []; next.audit.push({ time: now(), action: 'VERIFICATION_CHECKLIST_CREATED', detail: `${report.issues.length} findings converted into review tasks.` });
    window.ExoviaRuntime?.loadMap?.(next, 'network');
    $('trustCenterDialog')?.close();
    window.ExoviaNotify?.(tr('Verification checklist added to the project.', 'Lista de verificación agregada al proyecto.'), 'success');
  }

  function rankNodes(map, query) {
    const terms = String(query || '').toLowerCase().match(/[\p{L}\p{N}_-]{3,}/gu) || [];
    return map.nodes.filter(node => node.type !== 'corpus').map(node => {
      const haystack = `${node.title || ''} ${(node.keywords || []).join(' ')} ${node.text || node.summary || ''}`.toLowerCase();
      let score = node.type === 'topic' ? 2 : node.type === 'decision' ? 4 : 1;
      terms.forEach(term => { if (haystack.includes(term)) score += 4; });
      if (sourceLabel(node)) score += 2;
      return { node, score };
    }).sort((a,b) => b.score - a.score);
  }

  function buildCapsule(query, budget = 2000) {
    const map = runtimeMap(); if (!map) throw new Error(tr('Open a project first.', 'Primero abrí un proyecto.'));
    const report = scanMap(map); const ranked = rankNodes(map, query); const maxChars = Math.max(1800, Number(budget) * 4); const selected = [];
    let used = 0;
    for (const item of ranked) {
      const text = String(item.node.text || item.node.summary || '').trim(); if (!text) continue;
      const excerpt = text.slice(0, 620); const size = excerpt.length + 120; if (used + size > maxChars && selected.length >= 3) continue;
      selected.push({ id: item.node.id, title: item.node.title, type: item.node.type, source: sourceLabel(item.node) || tr('source not recorded', 'fuente no registrada'), excerpt }); used += size;
      if (used >= maxChars) break;
    }
    const openRisks = report.issues.slice(0, 8).map(issue => `- ${issue.title}${issue.nodeId ? ` [${issue.nodeId}]` : ''}`);
    const recentAudit = (map.audit || []).slice(-8).map(item => `- ${item.action}: ${item.detail || ''}`);
    const markdown = `# Exovia Context Capsule\n\n## Objective\n${query || map.title || tr('Continue this project without losing source context.', 'Continuar este proyecto sin perder el contexto de origen.')}\n\n## Project\n- Title: ${map.title || 'Untitled'}\n- Format: ${map.format || 'neurocanvas-v3'}\n- Generated: ${now()}\n- Trust score: ${report.score}/100 (${report.grade})\n\n## Verified context\n${selected.map((item,index) => `### [${index + 1}] ${item.title} — ${item.id}\nSource: ${item.source}\n${item.excerpt}`).join('\n\n')}\n\n## Open risks / unknowns\n${openRisks.join('\n') || '- No material risks were detected by the local scan.'}\n\n## Recent decisions and activity\n${recentAudit.join('\n') || '- No audit activity recorded.'}\n\n## Instructions for the next AI\n1. Treat the cited excerpts as evidence, not as permission to invent missing facts.\n2. Cite node IDs when making factual claims.\n3. Explicitly state uncertainty when evidence is missing or contradictory.\n4. Do not execute external actions without human approval.\n5. Never reveal or reuse credentials or personal data flagged by the privacy scan.\n`;
    const json = { format: 'exovia-context-capsule-v1', generatedAt: now(), objective: query || map.title, project: { title: map.title, format: map.format, trustScore: report.score }, evidence: selected, risks: report.issues.slice(0,8), audit: (map.audit || []).slice(-8), rules: ['cite-node-ids','no-invention','state-uncertainty','human-approval','protect-sensitive-data'] };
    return { markdown, json, estimatedTokens: Math.ceil(markdown.length / 4), includedNodes: selected.length, risks: report.issues.length };
  }

  function renderCapsule() {
    const panel = document.querySelector('[data-trust-panel="capsule"]'); if (!panel) return;
    panel.innerHTML = `<section class="capsuleBuilder"><div class="builderHero"><div><small>${tr('PORTABLE CONTEXT','CONTEXTO PORTÁTIL')}</small><h3>${tr('Stop starting every AI conversation from zero.','Dejá de empezar cada conversación de IA desde cero.')}</h3><p>${tr('Create a compact, evidence-linked capsule that can move between ChatGPT, Gemini, Claude, local models or human teammates without losing decisions, risks and source references.','Creá una cápsula compacta y conectada a evidencia que pueda pasar entre ChatGPT, Gemini, Claude, modelos locales o personas sin perder decisiones, riesgos ni referencias.')}</p></div><span class="privacyBadge"><i></i>${tr('Built entirely on device','Creada completamente en el dispositivo')}</span></div><div class="builderGrid"><div class="builderControls"><label>${tr('What should the next AI help with?','¿Con qué debería ayudar la próxima IA?')}<textarea id="capsuleObjective" placeholder="${tr('Example: prepare a decision using only verified evidence…','Ejemplo: preparar una decisión usando solo evidencia verificada…')}"></textarea></label><label>${tr('Maximum context budget','Presupuesto máximo de contexto')}<select id="capsuleBudget"><option value="1000">≈ 1,000 tokens</option><option value="2000" selected>≈ 2,000 tokens</option><option value="4000">≈ 4,000 tokens</option><option value="8000">≈ 8,000 tokens</option></select></label><button id="generateCapsule" type="button" class="trustPrimary">${tr('Generate context capsule','Generar cápsula de contexto')}</button><div class="capsuleStats"><div><strong id="capsuleNodes">0</strong><span>${tr('sources','fuentes')}</span></div><div><strong id="capsuleTokens">0</strong><span>${tr('tokens','tokens')}</span></div><div><strong id="capsuleRisks">0</strong><span>${tr('risks','riesgos')}</span></div></div></div><div><pre id="capsuleOutput" class="builderOutput empty">${tr('Your reusable, source-linked context will appear here.','Tu contexto reutilizable y conectado a fuentes aparecerá acá.')}</pre><div class="outputActions"><button id="copyCapsule" type="button" disabled>${tr('Copy for any AI','Copiar para cualquier IA')}</button><button id="downloadCapsuleMd" type="button" disabled>${tr('Download Markdown','Descargar Markdown')}</button><button id="downloadCapsuleJson" type="button" disabled>${tr('Download JSON','Descargar JSON')}</button></div></div></div></section>`;
    $('generateCapsule')?.addEventListener('click', () => { try { latestCapsule = buildCapsule($('capsuleObjective').value.trim(), $('capsuleBudget').value); const output = $('capsuleOutput'); output.textContent = latestCapsule.markdown; output.classList.remove('empty'); $('capsuleNodes').textContent = latestCapsule.includedNodes; $('capsuleTokens').textContent = latestCapsule.estimatedTokens.toLocaleString(); $('capsuleRisks').textContent = latestCapsule.risks; ['copyCapsule','downloadCapsuleMd','downloadCapsuleJson'].forEach(id => $(id).disabled = false); } catch (error) { window.ExoviaNotify?.(error.message, 'warn'); } });
    $('copyCapsule')?.addEventListener('click', async () => { if (!latestCapsule) return; await navigator.clipboard?.writeText(latestCapsule.markdown); window.ExoviaNotify?.(tr('Context capsule copied.', 'Cápsula de contexto copiada.'), 'success'); });
    $('downloadCapsuleMd')?.addEventListener('click', () => latestCapsule && downloadText('exovia-context-capsule.md', latestCapsule.markdown, 'text/markdown'));
    $('downloadCapsuleJson')?.addEventListener('click', () => latestCapsule && downloadText('exovia-context-capsule.json', `${JSON.stringify(latestCapsule.json,null,2)}\n`, 'application/json'));
  }

  function routeRecommendation(values) {
    const sensitivity = values.sensitivity; const internet = values.internet; const task = values.task; const budget = values.budget;
    let mode, rationale, context, execution, review;
    if (sensitivity === 'high' || internet === 'no') { mode = tr('LOCAL / PRIVATE MODE','MODO LOCAL / PRIVADO'); rationale = tr('Sensitive information or offline constraints require a model that runs locally or inside a controlled private environment.','La información sensible o el requisito offline exige un modelo local o dentro de un entorno privado controlado.'); context = tr('Use a redacted capsule and keep raw evidence on device.','Usá una cápsula redactada y mantené la evidencia original en el dispositivo.'); execution = tr('Disable external tools by default.','Desactivá herramientas externas por defecto.'); review = tr('Human approval for every export or action.','Aprobación humana para cada exportación o acción.'); }
    else if (sensitivity === 'medium' || task === 'decision') { mode = tr('HYBRID VERIFIED MODE','MODO HÍBRIDO VERIFICADO'); rationale = tr('Use a strong cloud model only with a minimized context capsule; keep source files local and verify every factual claim.','Usá un modelo potente en la nube solo con una cápsula mínima; mantené las fuentes locales y verificá cada afirmación.'); context = tr('Send only relevant excerpts with node IDs.','Enviá solo fragmentos relevantes con IDs de nodo.'); execution = tr('Tools remain read-only until approved.','Las herramientas quedan en solo lectura hasta la aprobación.'); review = tr('Require a proof packet before final decisions.','Exigí un paquete de prueba antes de decisiones finales.'); }
    else { mode = tr('CLOUD ACCELERATED MODE','MODO NUBE ACELERADA'); rationale = tr('Low-sensitivity work can use a capable cloud model, but evidence links and audit logs should remain enabled.','El trabajo poco sensible puede usar un modelo potente en la nube, manteniendo vínculos de evidencia y auditoría.'); context = tr('Use the full capsule within the selected budget.','Usá la cápsula completa dentro del presupuesto elegido.'); execution = tr('Allow reversible tools only.','Permití solo herramientas reversibles.'); review = tr('Human approval for publishing or irreversible actions.','Aprobación humana para publicar o realizar acciones irreversibles.'); }
    if (budget === 'low') context += ` ${tr('Prefer a compact 1,000-token capsule.','Preferí una cápsula compacta de 1.000 tokens.')}`;
    return { mode, rationale, context, execution, review };
  }

  function renderRoute() {
    const panel = document.querySelector('[data-trust-panel="route"]'); if (!panel) return;
    panel.innerHTML = `<section class="routeBuilder"><div class="builderHero"><div><small>${tr('SAFE MODEL ROUTING','ENRUTAMIENTO SEGURO')}</small><h3>${tr('Choose how AI should work before choosing a model.','Elegí cómo debe trabajar la IA antes de elegir un modelo.')}</h3><p>${tr('NeuroCanvas routes by privacy, evidence needs, cost and action risk. The answer is provider-neutral so you can use OpenAI, Gemini, Claude, Ollama or future models without redesigning your governance.','NeuroCanvas enruta según privacidad, evidencia, costo y riesgo de acción. La respuesta es independiente del proveedor para usar OpenAI, Gemini, Claude, Ollama o futuros modelos sin rediseñar la gobernanza.')}</p></div><span class="privacyBadge"><i></i>${tr('Provider-independent','Independiente del proveedor')}</span></div><div class="routeQuestions"><label>${tr('Task type','Tipo de tarea')}<select id="routeTask"><option value="research">${tr('Research / synthesis','Investigación / síntesis')}</option><option value="decision">${tr('Important decision','Decisión importante')}</option><option value="creative">${tr('Creative work','Trabajo creativo')}</option><option value="agent">${tr('Agent with tools','Agente con herramientas')}</option></select></label><label>${tr('Data sensitivity','Sensibilidad de los datos')}<select id="routeSensitivity"><option value="low">${tr('Low — public information','Baja — información pública')}</option><option value="medium" selected>${tr('Medium — internal work','Media — trabajo interno')}</option><option value="high">${tr('High — personal or confidential','Alta — personal o confidencial')}</option></select></label><label>${tr('Internet / cloud allowed','Internet / nube permitidos')}<select id="routeInternet"><option value="yes">${tr('Yes, with safeguards','Sí, con protección')}</option><option value="no">${tr('No, local only','No, solo local')}</option></select></label><label>${tr('Budget pressure','Presión de costo')}<select id="routeBudget"><option value="low">${tr('High — minimize tokens','Alta — minimizar tokens')}</option><option value="normal" selected>${tr('Normal — balance quality and cost','Normal — equilibrar calidad y costo')}</option><option value="quality">${tr('Low — prioritize quality','Baja — priorizar calidad')}</option></select></label></div><div class="trustActionRow"><button id="buildRoutePlan" type="button" class="trustPrimary">${tr('Build safe AI plan','Crear plan seguro de IA')}</button></div><div id="routeResult" class="routeResult"><p>${tr('Choose the conditions and build a plan.','Elegí las condiciones y creá un plan.')}</p></div></section>`;
    $('buildRoutePlan')?.addEventListener('click', () => { const plan = routeRecommendation({ task:$('routeTask').value,sensitivity:$('routeSensitivity').value,internet:$('routeInternet').value,budget:$('routeBudget').value }); $('routeResult').innerHTML = `<div class="routeResultHead"><h4>${esc(plan.mode)}</h4><span class="routeMode">${tr('recommended route','ruta recomendada')}</span></div><p>${esc(plan.rationale)}</p><div class="routeSteps"><article><b>01</b><strong>${tr('Context','Contexto')}</strong><p>${esc(plan.context)}</p></article><article><b>02</b><strong>${tr('Model boundary','Límite del modelo')}</strong><p>${esc(plan.execution)}</p></article><article><b>03</b><strong>${tr('Verification','Verificación')}</strong><p>${tr('Demand citations and run Trust Scan on the result.','Exigí citas y analizá el resultado con Trust Scan.')}</p></article><article><b>04</b><strong>${tr('Approval','Aprobación')}</strong><p>${esc(plan.review)}</p></article></div>`; });
  }

  async function sha256(text) {
    const bytes = new TextEncoder().encode(text); const digest = await crypto.subtle.digest('SHA-256', bytes); return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2,'0')).join('');
  }

  async function buildProofPack() {
    const map = runtimeMap(); if (!map) throw new Error(tr('Open a project first.', 'Primero abrí un proyecto.'));
    const report = scanMap(map); const capsule = buildCapsule(map.title || '', 4000);
    const evidence = map.nodes.filter(node => node.type !== 'corpus').map(node => ({ id:node.id,title:node.title,type:node.type,source:sourceLabel(node)||null,excerpt:String(node.text||node.summary||'').slice(0,500) }));
    const payload = { format:'exovia-proof-pack-v1',generatedAt:now(),project:{ title:map.title,format:map.format,projectId:map.projectId||null,nodeCount:map.nodes.length,edgeCount:map.edges.length },trust:report,contextCapsule:capsule.json,evidenceManifest:evidence,auditTrail:map.audit||[],agentEvents:map.events||[],governance:{humanApprovalRequired:true,externalActionsExecuted:false,localGeneration:true} };
    const canonical = JSON.stringify(payload); const integrity = await sha256(canonical); return { ...payload, integrity:{ algorithm:'SHA-256',hash:integrity,scope:'JSON payload excluding integrity field' } };
  }

  function renderProof() {
    const panel = document.querySelector('[data-trust-panel="proof"]'); if (!panel) return;
    panel.innerHTML = `<section class="proofBuilder"><div class="builderHero"><div><small>${tr('PORTABLE PROOF','PRUEBA PORTÁTIL')}</small><h3>${tr('Turn an AI result into something another person can verify.','Convertí un resultado de IA en algo que otra persona pueda verificar.')}</h3><p>${tr('A Proof Pack combines evidence, trust findings, context, decisions, agent events and an integrity hash. It is a durable artifact for clients, teams, audits and high-stakes decisions.','Un Proof Pack combina evidencia, hallazgos, contexto, decisiones, eventos de agentes y un hash de integridad. Es un artefacto durable para clientes, equipos, auditorías y decisiones importantes.')}</p></div><span class="privacyBadge"><i></i>${tr('Cryptographically fingerprinted','Huella criptográfica')}</span></div><div class="proofGrid"><article><span>✓</span><strong>${tr('Evidence manifest','Manifiesto de evidencia')}</strong><p>${tr('Exact excerpts and source references.','Fragmentos exactos y referencias de fuente.')}</p></article><article><span>◇</span><strong>${tr('Risk report','Informe de riesgos')}</strong><p>${tr('Privacy, contradiction and provenance findings.','Hallazgos de privacidad, contradicción y procedencia.')}</p></article><article><span>◎</span><strong>${tr('Decision replay','Reconstrucción de decisiones')}</strong><p>${tr('Human and agent actions in chronological order.','Acciones humanas y de agentes en orden cronológico.')}</p></article><article><span>#</span><strong>${tr('Integrity hash','Hash de integridad')}</strong><p>${tr('Detect whether the packet changes after export.','Detecta cambios posteriores a la exportación.')}</p></article></div><div class="trustActionRow"><button id="exportProofPack" type="button" class="trustPrimary">${tr('Generate verified Proof Pack','Generar Proof Pack verificado')}</button></div><div id="proofStatus" class="proofStatus">${tr('No Proof Pack generated in this session.','Todavía no se generó un Proof Pack en esta sesión.')}</div></section>`;
    $('exportProofPack')?.addEventListener('click', async () => { const button=$('exportProofPack'); const status=$('proofStatus'); try { button.disabled=true; status.textContent=tr('Building evidence manifest and calculating SHA-256…','Creando manifiesto de evidencia y calculando SHA-256…'); const pack=await buildProofPack(); downloadText(`exovia-proof-pack-${Date.now()}.json`,`${JSON.stringify(pack,null,2)}\n`,'application/json'); status.className='proofStatus success'; status.innerHTML=`<strong>${tr('Proof Pack generated and downloaded.','Proof Pack generado y descargado.')}</strong><br>SHA-256: <code>${pack.integrity.hash}</code>`; } catch(error){status.textContent=error.message;} finally{button.disabled=false;} });
  }

  function downloadText(filename, content, type) { const blob = new Blob([content], { type }); const link=document.createElement('a'); link.href=URL.createObjectURL(blob); link.download=filename; link.click(); setTimeout(()=>URL.revokeObjectURL(link.href),1000); }

  function setPanel(name) {
    activePanel = name;
    document.querySelectorAll('[data-trust-tab]').forEach(button => button.classList.toggle('active', button.dataset.trustTab === name));
    document.querySelectorAll('[data-trust-panel]').forEach(panel => panel.classList.toggle('active', panel.dataset.trustPanel === name));
    if (name === 'scan') renderScan(); if (name === 'capsule') renderCapsule(); if (name === 'route') renderRoute(); if (name === 'proof') renderProof();
  }

  function open(panel = 'scan') { $('trustCenterDialog')?.showModal(); setPanel(panel); }
  function showHome() { document.body.classList.add('app-home-open'); $('emptyState')?.classList.remove('hidden'); window.ExoviaMobile?.closeSheets?.(); }
  function closeHome() { document.body.classList.remove('app-home-open'); if (runtimeMap()) $('emptyState')?.classList.add('hidden'); }

  function buildUi() {
    if ($('trustCenterDialog')) return;
    const dialog=document.createElement('dialog'); dialog.id='trustCenterDialog'; dialog.className='trustCenterDialog'; dialog.setAttribute('aria-labelledby','trustCenterTitle'); dialog.innerHTML=`<div class="trustCenterShell"><header class="trustCenterHead"><div class="trustCenterTitle"><span class="trustCenterMark">◇</span><div><small>${tr('EXOVIA PROOFLAYER','EXOVIA PROOFLAYER')}</small><h2 id="trustCenterTitle">${tr('AI Reliability Center','Centro de Confiabilidad de IA')}</h2></div></div><button type="button" data-trust-close aria-label="${tr('Close','Cerrar')}">×</button></header><nav class="trustTabs" aria-label="AI reliability tools"><button type="button" data-trust-tab="scan" class="active">${tr('Trust Scan','Análisis')}</button><button type="button" data-trust-tab="capsule">${tr('Context Capsule','Cápsula de contexto')}</button><button type="button" data-trust-tab="route">${tr('Safe Router','Enrutador seguro')}</button><button type="button" data-trust-tab="proof">${tr('Proof Pack','Paquete de prueba')}</button></nav><div class="trustPanels"><section class="trustPanel active" data-trust-panel="scan"></section><section class="trustPanel" data-trust-panel="capsule"></section><section class="trustPanel" data-trust-panel="route"></section><section class="trustPanel" data-trust-panel="proof"></section></div></div>`; document.body.append(dialog);
    dialog.querySelector('[data-trust-close]').addEventListener('click',()=>dialog.close()); dialog.querySelectorAll('[data-trust-tab]').forEach(button=>button.addEventListener('click',()=>setPanel(button.dataset.trustTab)));
    $('trustCenterBtn')?.addEventListener('click',()=>open('scan')); $('capsuleBtn')?.addEventListener('click',()=>open('capsule')); $('homeBtn')?.addEventListener('click',showHome);
    $('homeStartBtn')?.addEventListener('click',()=>{closeHome(); ($('purposeBtn')||$('demoBtn'))?.click();}); $('homeImportBtn')?.addEventListener('click',()=>{closeHome();$('pasteBtn')?.click();}); $('homeVerifyBtn')?.addEventListener('click',()=>open('scan')); $('homeCapsuleBtn')?.addEventListener('click',()=>open('capsule')); $('homeAgentBtn')?.addEventListener('click',()=>{closeHome();$('pulseDemoBtn')?.click();}); $('homeGuidedBtn')?.addEventListener('click',()=>{closeHome();$('simpleGuideBtn')?.click();});
    window.addEventListener('exovia:map-changed',()=>{closeHome(); if(dialog.open&&activePanel==='scan') renderScan();});
    window.addEventListener('exovia:language-changed',()=>{if(dialog.open)setPanel(activePanel);});
    const shortcut = new URLSearchParams(location.search).get('action');
    if (shortcut === 'verify' || shortcut === 'context') setTimeout(() => open(shortcut === 'verify' ? 'scan' : 'capsule'), 250);
    renderScan();
  }

  window.ExoviaTrustCenter={ open, scanMap, buildCapsule, buildProofPack, routeRecommendation, showHome, closeHome, version:'1.0.0' };
  window.addEventListener('DOMContentLoaded',buildUi,{once:true});
})();
