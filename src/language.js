(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:language';
  const $ = id => document.getElementById(id);
  const supported = ['en', 'es'];
  let language = supported.includes(localStorage.getItem(STORAGE_KEY)) ? localStorage.getItem(STORAGE_KEY) : 'en';

  const copy = {
    en: {
      toggle: 'Español',
      title: 'Exovia NeuroCanvas — Verify every answer',
      searchLabel: 'Search the active project',
      searchPlaceholder: 'Ask or search a concept…',
      zoom: 'Zoom',
      workspace: 'New workspace',
      pulse: 'See agent activity',
      open: 'Open file',
      import: 'Import text',
      export: 'Export backup',
      fit: 'Fit map',
      simple: 'Simple view',
      guide: 'Guide me',
      purpose: 'What do you want to do?',
      save: 'Save',
      snapshot: 'Recovery copy',
      library: 'My projects',
      undo: '↶ Undo',
      redo: '↷ Redo',
      explorer: 'Knowledge explorer',
      inspector: 'Evidence inspector',
      hint: 'Drag to move · wheel to zoom · click a circle to inspect it',
      details: 'Select a circle to see the exact source behind an answer or decision.',
      saved: 'All changes saved',
      saving: 'Saving automatically…'
    },
    es: {
      toggle: 'English',
      title: 'Exovia NeuroCanvas — Verificá cada respuesta',
      searchLabel: 'Buscar dentro del proyecto',
      searchPlaceholder: 'Escribí una pregunta o concepto…',
      zoom: 'Buscar',
      workspace: 'Nuevo ejemplo',
      pulse: 'Ver actividad de IA',
      open: 'Abrir archivo',
      import: 'Pegar información',
      export: 'Exportar copia',
      fit: 'Ver mapa completo',
      simple: 'Vista simple',
      guide: 'Guiame',
      purpose: '¿Qué querés organizar?',
      save: 'Guardar',
      snapshot: 'Copia de recuperación',
      library: 'Mis proyectos',
      undo: '↶ Deshacer',
      redo: '↷ Rehacer',
      explorer: 'Explorador de información',
      inspector: 'Fuente y evidencia',
      hint: 'Arrastrá para mover · usá la rueda para acercar · tocá un círculo para verlo',
      details: 'Seleccioná un círculo para ver la fuente exacta de una respuesta o decisión.',
      saved: 'Todos los cambios están guardados',
      saving: 'Guardando automáticamente…'
    }
  };

  function setText(selector, text) {
    const element = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (element) element.textContent = text;
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

    setText('label[for="searchInput"]', t.searchLabel);
    const search = $('searchInput');
    if (search) search.placeholder = t.searchPlaceholder;
    setText('#searchBtn', t.zoom);
    setText('#demoBtn', t.workspace);
    setText('#pulseDemoBtn', t.pulse);
    const fileLabel = document.querySelector('.fileButton');
    if (fileLabel?.firstChild) fileLabel.firstChild.textContent = t.open;
    setText('#pasteBtn', t.import);
    setText('#exportBtn', t.export);
    setText('#fitBtn', t.fit);
    setText('#simpleModeBtn', window.ExoviaSimpleMode?.isEnabled?.() ? (language === 'es' ? 'Vista completa' : 'Standard view') : t.simple);
    setText('#simpleGuideBtn', t.guide);
    setText('#useCaseBtn', t.purpose);
    setText('#saveProjectBtn', t.save);
    setText('#snapshotBtn', t.snapshot);
    setText('#workspaceBtn', t.library);
    setText('#safeUndoBtn', t.undo);
    setText('#safeRedoBtn', t.redo);
    setText('.leftPanel .panelTitle', t.explorer);
    setText('.rightPanel .panelTitle', t.inspector);
    setText('.hint', t.hint);
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
    setTimeout(() => apply(language), 150);
  }

  window.ExoviaLanguage = { set: apply, get: () => language, supported: [...supported] };
  window.addEventListener('DOMContentLoaded', build);
  window.addEventListener('exovia:map-changed', () => setTimeout(() => apply(language), 0));
})();