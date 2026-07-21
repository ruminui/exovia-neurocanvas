(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:language';
  const $ = id => document.getElementById(id);
  const supported = ['en', 'es'];
  const stored = localStorage.getItem(STORAGE_KEY);
  let language = supported.includes(stored) ? stored : (/^es\b/i.test(navigator.language || '') ? 'es' : 'en');

  const copy = {
    en: {
      toggle: 'Español', title: 'Exovia NeuroCanvas — AI Reliability Workspace', searchLabel: 'Search the active project', searchPlaceholder: 'Ask or search a concept…', zoom: 'Zoom',
      workspace: 'New workspace', pulse: 'Agent activity', open: 'Open file', import: 'Import text', trust: 'Verify AI', capsule: 'Context capsule', export: 'Export backup', fit: 'Fit map',
      simple: 'Simple view', guide: 'Guide me', purpose: 'What do you want to do?', save: 'Save', snapshot: 'Recovery copy', library: 'My projects', undo: '↶ Undo', redo: '↷ Redo',
      explorer: 'Knowledge explorer', inspector: 'Evidence inspector', hint: 'Drag to move · wheel to zoom · click a circle to inspect it', details: 'Select a circle to see the exact source behind an answer or decision.', audit: 'Audit trail',
      network: 'Neural', tree: 'Tree', pulseView: 'Pulse', play: 'Play pulses', stop: 'Stop',
      pasteTitle: 'Create or import a project', projectTitle: 'Project title', projectPlaceholder: 'Project title', sourceText: 'Source information', sourcePlaceholder: 'Paste the complete AI answer, conversation, notes or document here…', cancel: 'Cancel', buildProject: 'Build project',
      intentTitle: 'Safe intent preview', intentHelp: 'This declarative subset performs visible graph operations only.', intentLabel: 'Declarative intent', intentPreview: 'Preview the intent to validate it.', preview: 'Validate preview', applyFocus: 'Apply visual focus',
      saved: 'All changes saved', saving: 'Saving automatically…', localProtected: 'Local-first · Protected', homeEyebrow: 'THE RELIABILITY LAYER FOR AI',
      homeTitle: 'Use AI without losing truth, privacy or control.', homeLead: 'NeuroCanvas turns documents, conversations and agent activity into a verifiable workspace. Preserve context, detect risk, prove every answer and approve every important AI change.',
      homeStart: 'Create a trusted workspace', homeImport: 'Import an AI answer or document', guaranteeLocal: 'Your data stays local by default', guaranteeEvidence: 'Answers stay linked to evidence', guaranteeHuman: 'Humans approve consequential changes',
      controlCenter: 'AI CONTROL CENTER', ready: 'READY', layers: 'layers', controlHeadline: 'One workspace. Four protections.', controlDescription: 'Evidence, privacy, context and agent governance work together instead of living in separate tools.',
      verifyAnswers: 'Verify AI answers', verifyAnswersSub: 'Find unsupported claims, missing sources and contradictions.', preserveContext: 'Preserve reusable context', preserveContextSub: 'Create a portable context capsule for any model.', governAgents: 'Govern AI agents', governAgentsSub: 'Replay actions and keep a human approval gate.',
      whyExists: 'WHY NEUROCANVAS EXISTS', problemTitle: 'The biggest AI problems are not model problems.', problemLead: 'They are failures of memory, evidence, privacy and control. NeuroCanvas treats them as one connected system.',
      problemHallucination: 'Confident answers without proof', problemHallucinationSub: 'Trace every conclusion back to exact source material and surface unsupported claims before they become decisions.',
      problemContext: 'Context disappears between tools', problemContextSub: 'Build compact, source-linked context capsules that travel safely between models, agents and conversations.',
      problemPrivacy: 'Private information leaks silently', problemPrivacySub: 'Scan locally for credentials, personal data and prompt-injection patterns before content is shared with an AI provider.',
      problemAgents: 'Agents act without accountability', problemAgentsSub: 'Record actions, replay decisions and require human approval before consequential changes are applied.',
      differentiator: 'THE DIFFERENCE', differentiatorTitle: 'Not another chatbot. A proof system around every AI.', guided: 'Start guided experience'
    },
    es: {
      toggle: 'English', title: 'Exovia NeuroCanvas — Espacio de Confiabilidad de IA', searchLabel: 'Buscar dentro del proyecto', searchPlaceholder: 'Escribí una pregunta o concepto…', zoom: 'Buscar',
      workspace: 'Nuevo espacio', pulse: 'Actividad de agentes', open: 'Abrir archivo', import: 'Pegar información', trust: 'Verificar IA', capsule: 'Cápsula de contexto', export: 'Exportar copia', fit: 'Ver mapa completo',
      simple: 'Vista simple', guide: 'Guiame', purpose: '¿Qué querés hacer?', save: 'Guardar', snapshot: 'Copia de recuperación', library: 'Mis proyectos', undo: '↶ Deshacer', redo: '↷ Rehacer',
      explorer: 'Explorador de información', inspector: 'Fuente y evidencia', hint: 'Arrastrá para mover · acercá con dos dedos · tocá una idea para inspeccionarla', details: 'Seleccioná una idea para ver la fuente exacta detrás de una respuesta o decisión.', audit: 'Historial de cambios',
      network: 'Mapa', tree: 'Árbol', pulseView: 'Actividad', play: 'Reproducir', stop: 'Detener',
      pasteTitle: 'Crear o importar un proyecto', projectTitle: 'Nombre del proyecto', projectPlaceholder: 'Ejemplo: Respuesta de IA para verificar', sourceText: 'Información original', sourcePlaceholder: 'Pegá acá la respuesta completa de la IA, la conversación, tus notas o el documento…', cancel: 'Cancelar', buildProject: 'Crear proyecto',
      intentTitle: 'Vista previa de intención segura', intentHelp: 'Estas instrucciones solo realizan operaciones visibles sobre el mapa.', intentLabel: 'Intención declarativa', intentPreview: 'Validá la intención antes de aplicarla.', preview: 'Validar vista previa', applyFocus: 'Aplicar enfoque visual',
      saved: 'Todos los cambios están guardados', saving: 'Guardando automáticamente…', localProtected: 'Local primero · Protegido', homeEyebrow: 'LA CAPA DE CONFIABILIDAD PARA IA',
      homeTitle: 'Usá IA sin perder verdad, privacidad ni control.', homeLead: 'NeuroCanvas convierte documentos, conversaciones y actividad de agentes en un espacio verificable. Conservá contexto, detectá riesgos, demostrá las respuestas y aprobá cada cambio importante de IA.',
      homeStart: 'Crear un espacio confiable', homeImport: 'Pegar una respuesta de IA o documento', guaranteeLocal: 'Tus datos quedan locales por defecto', guaranteeEvidence: 'Las respuestas siguen conectadas a evidencia', guaranteeHuman: 'Las personas aprueban cambios importantes',
      controlCenter: 'CENTRO DE CONTROL DE IA', ready: 'LISTO', layers: 'capas', controlHeadline: 'Un espacio. Cuatro protecciones.', controlDescription: 'Evidencia, privacidad, contexto y control de agentes trabajan juntos en lugar de quedar separados.',
      verifyAnswers: 'Verificar respuestas de IA', verifyAnswersSub: 'Encontrá afirmaciones sin respaldo, fuentes faltantes y contradicciones.', preserveContext: 'Conservar contexto reutilizable', preserveContextSub: 'Creá una cápsula portátil para cualquier modelo.', governAgents: 'Controlar agentes de IA', governAgentsSub: 'Reconstruí acciones y mantené una aprobación humana.',
      whyExists: 'POR QUÉ EXISTE NEUROCANVAS', problemTitle: 'Los mayores problemas de la IA no son problemas del modelo.', problemLead: 'Son fallas de memoria, evidencia, privacidad y control. NeuroCanvas las trata como un único sistema conectado.',
      problemHallucination: 'Respuestas seguras pero sin prueba', problemHallucinationSub: 'Rastreá cada conclusión hasta la fuente exacta y detectá afirmaciones sin respaldo antes de convertirlas en decisiones.',
      problemContext: 'El contexto desaparece entre herramientas', problemContextSub: 'Creá cápsulas compactas con fuentes que viajan de forma segura entre modelos, agentes y conversaciones.',
      problemPrivacy: 'La información privada se filtra en silencio', problemPrivacySub: 'Detectá localmente credenciales, datos personales e inyecciones de prompt antes de compartir con un proveedor.',
      problemAgents: 'Los agentes actúan sin rendir cuentas', problemAgentsSub: 'Registrá acciones, reconstruí decisiones y exigí aprobación humana antes de cambios importantes.',
      differentiator: 'LA DIFERENCIA', differentiatorTitle: 'No es otro chatbot. Es un sistema de prueba alrededor de cualquier IA.', guided: 'Comenzar experiencia guiada'
    }
  };

  function setText(selector, text) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element) element.textContent = text;
  }

  function setPlaceholder(selector, text) {
    const element = document.querySelector(selector);
    if (element) element.placeholder = text;
  }

  function apply(nextLanguage, announce = false) {
    language = supported.includes(nextLanguage) ? nextLanguage : 'en';
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.title = copy[language].title;
    const t = copy[language];

    const button = $('languageBtn');
    if (button) {
      button.textContent = t.toggle;
      button.setAttribute('aria-label', language === 'en' ? 'Cambiar la interfaz a español' : 'Change interface to English');
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (t[key]) element.textContent = t[key];
    });

    setText('label[for="searchInput"]', t.searchLabel);
    setPlaceholder('#searchInput', t.searchPlaceholder);
    setText('#searchBtn', t.zoom);
    setText('#demoBtn', t.workspace);
    setText('#pulseDemoBtn', t.pulse);
    const fileLabel = document.querySelector('.fileButton');
    if (fileLabel?.firstChild) fileLabel.firstChild.textContent = t.open;
    setText('#pasteBtn', t.import);
    setText('#trustCenterBtn', t.trust);
    setText('#capsuleBtn', t.capsule);
    setText('#exportBtn', t.export);
    setText('#fitBtn', t.fit);
    setText('#networkView', t.network);
    setText('#treeView', t.tree);
    setText('#pulseView', t.pulseView);
    setText('#playPulsesBtn', t.play);
    setText('#stopPulsesBtn', t.stop);
    setText('#simpleModeBtn', window.ExoviaSimpleMode?.isEnabled?.() ? (language === 'es' ? 'Vista completa' : 'Standard view') : t.simple);
    setText('#simpleGuideBtn', t.guide);
    setText('#purposeBtn', t.purpose);
    setText('#saveProjectBtn', t.save);
    setText('#snapshotBtn', t.snapshot);
    setText('#workspaceBtn', t.library);
    setText('#safeUndoBtn', t.undo);
    setText('#safeRedoBtn', t.redo);
    setText('.leftPanel .panelTitle', t.explorer);
    setText('.rightPanel .panelTitle', t.inspector);
    setText('.leftPanel .hint', t.hint);
    setText('.auditTitle', t.audit);

    setText('#pasteDialogTitle', t.pasteTitle);
    setText('label[for="docTitle"]', t.projectTitle);
    setPlaceholder('#docTitle', t.projectPlaceholder);
    setText('label[for="textInput"]', t.sourceText);
    if (!$('textInput')?.value) setPlaceholder('#textInput', t.sourcePlaceholder);
    setText('#pasteDialog .dialogActions button[value="cancel"]', t.cancel);
    setText('#buildBtn', t.buildProject);

    setText('#intentDialogTitle', t.intentTitle);
    setText('#intentDialog .dialogHelp', t.intentHelp);
    setText('label[for="intentInput"]', t.intentLabel);
    if ($('intentPreview')?.textContent?.trim() === 'Preview the intent to validate it.' || $('intentPreview')?.textContent?.trim() === 'Validá la intención antes de aplicarla.') setText('#intentPreview', t.intentPreview);
    setText('#intentDialog .dialogActions button[value="cancel"]', t.cancel);
    setText('#previewIntentBtn', t.preview);
    setText('#applyIntentBtn', t.applyFocus);

    const details = $('details');
    if (details?.classList.contains('empty')) details.textContent = t.details;
    const saveStatus = $('safeSaveStatus');
    if (saveStatus) {
      const state = saveStatus.dataset.state;
      const strong = saveStatus.querySelector('strong');
      if (state === 'saved' && strong) strong.textContent = t.saved;
      if (state === 'saving' && strong) strong.textContent = t.saving;
    }

    window.dispatchEvent(new CustomEvent('exovia:language-changed', { detail: { language } }));
    if (announce) window.ExoviaNotify?.(language === 'es' ? 'Interfaz completa en español.' : 'Complete interface in English.', 'success');
  }

  function build() {
    if ($('languageBtn')) return;
    const button = document.createElement('button');
    button.id = 'languageBtn';
    button.type = 'button';
    button.className = 'languageButton';
    button.addEventListener('click', () => apply(language === 'en' ? 'es' : 'en', true));
    document.querySelector('.toolbar')?.prepend(button);
    apply(language);
  }

  window.ExoviaLanguage = {
    set: apply,
    get: () => language,
    isSpanish: () => language === 'es',
    t: (en, es) => language === 'es' ? es : en,
    supported: [...supported],
    copy
  };

  window.addEventListener('DOMContentLoaded', build);
  window.addEventListener('exovia:map-changed', () => setTimeout(() => apply(language), 0));
})();
