(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:language';
  const $ = id => document.getElementById(id);
  const supported = ['en', 'es'];
  const stored = localStorage.getItem(STORAGE_KEY);
  let language = supported.includes(stored) ? stored : (/^es\b/i.test(navigator.language || '') ? 'es' : 'en');

  const copy = {
    en: {
      toggle: 'Español', title: 'Exovia NeuroCanvas — Check AI. Keep the proof.', searchLabel: 'Search this project', searchPlaceholder: 'Ask a question or find an idea…', zoom: 'Find',
      workspace: 'Start', pulse: 'Advanced activity', open: 'Open', import: 'Add information', trust: 'Check AI', capsule: 'Save context', export: 'Save / Share', fit: 'Center map',
      simple: 'Simple view', guide: 'How it works', purpose: 'Choose a goal', save: 'Save', snapshot: 'Recovery copy', library: 'My work', undo: '↶ Undo', redo: '↷ Redo',
      explorer: 'Project information', inspector: 'Source and evidence', hint: 'Drag to move · wheel to zoom · select an idea to see its source', details: 'Select an idea to see the exact information behind it.', audit: 'Change history',
      network: 'Map', tree: 'List', pulseView: 'Activity', play: 'Play activity', stop: 'Stop',
      pasteTitle: 'Add information', projectTitle: 'Name this project', projectPlaceholder: 'Example: AI answer to check', sourceText: 'Original information', sourcePlaceholder: 'Paste the complete AI answer, original question, notes, sources or document here…', cancel: 'Cancel', buildProject: 'Create project',
      intentTitle: 'Safe intent preview', intentHelp: 'This advanced tool only changes the visible map after validation.', intentLabel: 'Declarative intent', intentPreview: 'Preview the intent to validate it.', preview: 'Validate preview', applyFocus: 'Apply visual focus',
      saved: 'All changes saved', saving: 'Saving automatically…', localProtected: 'Local-first · Protected', homeEyebrow: 'CHECK AI. KEEP THE PROOF.',
      homeTitle: 'Know what an AI answer is based on.', homeLead: 'Add an AI answer or document. NeuroCanvas shows the original information, warns you about risks and saves a clear record another person can review.',
      homeStart: 'Try a 60-second example', homeImport: 'Use my own information',
      homeStep1Title: 'Add', homeStep1Body: 'Paste an answer, note or document.', homeStep2Title: 'Check', homeStep2Body: 'See missing proof, private data and unsafe instructions.', homeStep3Title: 'Save', homeStep3Body: 'Keep context and export a reviewable record.',
      guaranteeLocal: 'Your data stays local by default', guaranteeEvidence: 'Answers stay linked to evidence', guaranteeHuman: 'Humans approve important changes',
      controlCenter: 'WHAT YOU CAN DO', ready: 'READY', layers: 'steps', controlHeadline: 'One simple path.', controlDescription: 'Add information, check it and save a clear record. Advanced tools stay out of the way until you need them.',
      verifyAnswers: 'Check an AI answer', verifyAnswersSub: 'Find missing proof, private data and unsafe instructions.', preserveContext: 'Save the useful context', preserveContextSub: 'Create a compact summary for the next AI or person.', governAgents: 'Review advanced activity', governAgentsSub: 'See what an agent did and keep human approval.',
      whyExists: 'WHY NEUROCANVAS EXISTS', problemTitle: 'AI answers are hard to trust when the proof disappears.', problemLead: 'NeuroCanvas keeps the answer, its sources, its risks and the human decision together.',
      problemHallucination: 'An answer sounds certain', problemHallucinationSub: 'See which claims have evidence and which ones still need checking.',
      problemContext: 'Important context gets lost', problemContextSub: 'Save the goal, facts, decisions and sources before changing chats or models.',
      problemPrivacy: 'Private information is easy to miss', problemPrivacySub: 'Find credentials, contact details and suspicious instructions before sharing.',
      problemAgents: 'Nobody knows what changed', problemAgentsSub: 'Keep a visible history and require a person to approve important actions.',
      differentiator: 'THE DIFFERENCE', differentiatorTitle: 'Not another chatbot. A clear record around the AI answer.', guided: 'Show me how it works'
    },
    es: {
      toggle: 'English', title: 'Exovia NeuroCanvas — Revisá la IA. Conservá la prueba.', searchLabel: 'Buscar dentro del proyecto', searchPlaceholder: 'Hacé una pregunta o buscá una idea…', zoom: 'Buscar',
      workspace: 'Empezar', pulse: 'Actividad avanzada', open: 'Abrir', import: 'Agregar información', trust: 'Revisar IA', capsule: 'Guardar contexto', export: 'Guardar / compartir', fit: 'Centrar mapa',
      simple: 'Vista simple', guide: 'Cómo funciona', purpose: 'Elegir objetivo', save: 'Guardar', snapshot: 'Copia de recuperación', library: 'Mis trabajos', undo: '↶ Deshacer', redo: '↷ Rehacer',
      explorer: 'Información del proyecto', inspector: 'Fuente y evidencia', hint: 'Arrastrá para mover · acercá con dos dedos · tocá una idea para ver su fuente', details: 'Seleccioná una idea para ver la información exacta que hay detrás.', audit: 'Historial de cambios',
      network: 'Mapa', tree: 'Lista', pulseView: 'Actividad', play: 'Reproducir actividad', stop: 'Detener',
      pasteTitle: 'Agregar información', projectTitle: 'Poné un nombre al proyecto', projectPlaceholder: 'Ejemplo: Respuesta de IA para revisar', sourceText: 'Información original', sourcePlaceholder: 'Pegá acá la respuesta completa de la IA, la pregunta original, notas, fuentes o documento…', cancel: 'Cancelar', buildProject: 'Crear proyecto',
      intentTitle: 'Vista previa de intención segura', intentHelp: 'Esta herramienta avanzada solo cambia el mapa visible después de validarse.', intentLabel: 'Intención declarativa', intentPreview: 'Validá la intención antes de aplicarla.', preview: 'Validar vista previa', applyFocus: 'Aplicar enfoque visual',
      saved: 'Todos los cambios están guardados', saving: 'Guardando automáticamente…', localProtected: 'Local primero · Protegido', homeEyebrow: 'REVISÁ LA IA. CONSERVÁ LA PRUEBA.',
      homeTitle: 'Sabé en qué se basa una respuesta de IA.', homeLead: 'Agregá una respuesta de IA o un documento. NeuroCanvas muestra la información original, avisa sobre riesgos y guarda un registro claro que otra persona puede revisar.',
      homeStart: 'Probar un ejemplo de 60 segundos', homeImport: 'Usar mi propia información',
      homeStep1Title: 'Agregá', homeStep1Body: 'Pegá una respuesta, nota o documento.', homeStep2Title: 'Revisá', homeStep2Body: 'Detectá falta de prueba, datos privados e instrucciones riesgosas.', homeStep3Title: 'Guardá', homeStep3Body: 'Conservá el contexto y exportá un registro revisable.',
      guaranteeLocal: 'Tus datos quedan locales por defecto', guaranteeEvidence: 'Las respuestas siguen conectadas a evidencia', guaranteeHuman: 'Las personas aprueban cambios importantes',
      controlCenter: 'QUÉ PODÉS HACER', ready: 'LISTO', layers: 'pasos', controlHeadline: 'Un camino simple.', controlDescription: 'Agregá información, revisala y guardá un registro claro. Las herramientas avanzadas no molestan hasta que las necesites.',
      verifyAnswers: 'Revisar una respuesta de IA', verifyAnswersSub: 'Encontrá falta de prueba, datos privados e instrucciones riesgosas.', preserveContext: 'Guardar el contexto útil', preserveContextSub: 'Creá un resumen compacto para la próxima IA o persona.', governAgents: 'Revisar actividad avanzada', governAgentsSub: 'Mirá qué hizo un agente y mantené la aprobación humana.',
      whyExists: 'POR QUÉ EXISTE NEUROCANVAS', problemTitle: 'Es difícil confiar en una respuesta de IA cuando desaparece la prueba.', problemLead: 'NeuroCanvas mantiene juntos la respuesta, sus fuentes, sus riesgos y la decisión humana.',
      problemHallucination: 'Una respuesta parece segura', problemHallucinationSub: 'Mirá qué afirmaciones tienen evidencia y cuáles todavía necesitan revisión.',
      problemContext: 'Se pierde contexto importante', problemContextSub: 'Guardá objetivo, hechos, decisiones y fuentes antes de cambiar de chat o modelo.',
      problemPrivacy: 'Es fácil pasar por alto datos privados', problemPrivacySub: 'Encontrá credenciales, contactos e instrucciones sospechosas antes de compartir.',
      problemAgents: 'Nadie sabe qué cambió', problemAgentsSub: 'Conservá un historial visible y exigí aprobación humana para acciones importantes.',
      differentiator: 'LA DIFERENCIA', differentiatorTitle: 'No es otro chatbot. Es un registro claro alrededor de la respuesta de IA.', guided: 'Mostrame cómo funciona',
      legacyPasteLabel: 'Pegar información'
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
    setText('#simpleModeBtn', window.ExoviaSimpleMode?.isEnabled?.() ? (language === 'es' ? 'Más opciones' : 'More options') : t.simple);
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
    if (announce) window.ExoviaNotify?.(language === 'es' ? 'Interfaz en español.' : 'Interface in English.', 'success');
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
