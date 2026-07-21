(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:contextHelp';
  const $ = id => document.getElementById(id);
  let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
  let activeTarget = null;

  const help = {
    demoBtn: ['Nuevo ejemplo', 'Crea un proyecto de demostración para aprender sin usar tus propios datos.'],
    pulseDemoBtn: ['Actividad de IA', 'Abre un ejemplo que muestra acciones y decisiones realizadas por agentes.'],
    fileInput: ['Abrir archivo', 'Importa texto, Markdown, JSON, ExiaL o registros guardados.'],
    pasteBtn: ['Pegar información', 'Pegá notas, documentos o conversaciones para convertirlos en un mapa visual.'],
    intentBtn: ['Instrucción segura', 'Previsualiza una instrucción antes de aplicarla al mapa.'],
    exportBtn: ['Exportar copia', 'Descarga una copia portátil del proyecto para guardarla o compartirla.'],
    fitBtn: ['Ver mapa completo', 'Ajusta el zoom para que todas las ideas entren en pantalla.'],
    searchInput: ['Buscar o preguntar', 'Escribí una palabra o una pregunta normal para encontrar la respuesta más relevante.'],
    searchBtn: ['Buscar', 'Busca coincidencias y acerca el mapa al resultado.'],
    networkView: ['Vista de red', 'Muestra relaciones entre ideas como una red.'],
    treeView: ['Vista de árbol', 'Ordena las ideas desde la principal hacia sus ramas.'],
    pulseView: ['Vista de actividad', 'Muestra el orden de eventos y acciones registradas.'],
    capabilityView: ['Vista de capacidades', 'Agrupa las funciones y herramientas detectadas en el proyecto.'],
    canvas: ['Mapa visual', 'Arrastrá para mover, usá dos dedos para zoom y tocá una idea para ver su fuente.'],
    simpleModeBtn: ['Vista simple', 'Aumenta texto y botones y oculta opciones avanzadas.'],
    simpleGuideBtn: ['Guía paso a paso', 'Te acompaña desde crear un proyecto hasta guardarlo.'],
    purposeBtn: ['Elegir para qué usarlo', 'Crea un mapa inicial para familia, estudio, trabajo, recetas, reuniones o investigación.'],
    saveProjectBtn: ['Guardar', 'Guarda los cambios dentro de este navegador.'],
    snapshotBtn: ['Copia de recuperación', 'Guarda una versión anterior para volver atrás más adelante.'],
    workspaceBtn: ['Mis proyectos', 'Abre la lista de proyectos guardados en este dispositivo.'],
    safeUndoBtn: ['Deshacer', 'Vuelve al cambio anterior de esta sesión.'],
    safeRedoBtn: ['Rehacer', 'Recupera un cambio que acabás de deshacer.'],
    accessibilityListBtn: ['Vista en lista', 'Muestra todas las ideas como una lista fácil de leer y usar con teclado.'],
    supportReportBtn: ['Informe de ayuda', 'Genera un diagnóstico técnico sin incluir el contenido privado del proyecto.'],
    languageBtn: ['Idioma', 'Cambia entre español e inglés sin modificar tus datos.'],
    mobileExplore: ['Explorar', 'Abre el buscador, resultados y registro de actividad.'],
    mobileMap: ['Mapa', 'Vuelve al mapa y lo encuadra completo.'],
    mobileAsk: ['Preguntar', 'Abre el buscador y enfoca el campo para escribir una pregunta.'],
    mobileEvidence: ['Fuente', 'Muestra la información exacta detrás de la idea seleccionada.'],
    mobileActions: ['Más opciones', 'Abre herramientas de guardar, importar, exportar y configuración.']
  };

  function language() { return window.ExoviaLanguage?.get?.() || 'en'; }

  function translated(entry) {
    if (!entry) return null;
    if (language() === 'es') return { title: entry[0], body: entry[1] };
    return { title: entry[0], body: entry[1] };
  }

  function targetFor(element) {
    if (!element) return null;
    if (element.id === 'fileInput') return element.closest('.fileButton') || element;
    return element.closest('[id]') || element;
  }

  function position(card, target) {
    const rect = target.getBoundingClientRect();
    const margin = 10;
    card.style.left = `${Math.max(margin, Math.min(window.innerWidth - card.offsetWidth - margin, rect.left))}px`;
    const below = rect.bottom + margin;
    const above = rect.top - card.offsetHeight - margin;
    card.style.top = `${below + card.offsetHeight < window.innerHeight ? below : Math.max(margin, above)}px`;
  }

  function show(element) {
    if (!enabled) return;
    const target = targetFor(element);
    const entry = help[target?.id] || help[element?.id];
    if (!target || !entry) return;
    activeTarget = target;
    const card = $('contextHelpCard');
    const copy = translated(entry);
    $('contextHelpTitle').textContent = copy.title;
    $('contextHelpBody').textContent = copy.body;
    card.hidden = false;
    card.dataset.target = target.id;
    requestAnimationFrame(() => position(card, target));
  }

  function hide() {
    activeTarget = null;
    const card = $('contextHelpCard');
    if (card) card.hidden = true;
  }

  function toggle(value = !enabled) {
    enabled = Boolean(value);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    document.documentElement.classList.toggle('contextHelpEnabled', enabled);
    const button = $('contextHelpToggle');
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'Ayuda flotante: activa' : 'Ayuda flotante: apagada';
    }
    if (!enabled) hide();
  }

  function build() {
    if ($('contextHelpCard')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <aside id="contextHelpCard" class="contextHelpCard" role="status" aria-live="polite" hidden>
        <div><strong id="contextHelpTitle"></strong><p id="contextHelpBody"></p></div>
        <button type="button" id="contextHelpClose" aria-label="Cerrar explicación">×</button>
      </aside>`);
    const toggleButton = document.createElement('button');
    toggleButton.id = 'contextHelpToggle';
    toggleButton.type = 'button';
    toggleButton.className = 'contextHelpToggle';
    toggleButton.addEventListener('click', () => toggle());
    document.querySelector('.toolbar')?.prepend(toggleButton);
    $('contextHelpClose').addEventListener('click', hide);

    document.addEventListener('pointerover', event => {
      if (event.pointerType === 'touch') return;
      const candidate = event.target.closest('[id],.fileButton');
      if (candidate) show(candidate);
    });
    document.addEventListener('focusin', event => show(event.target));
    document.addEventListener('click', event => {
      const candidate = event.target.closest('[id],.fileButton');
      if (window.matchMedia('(pointer:coarse)').matches && candidate && candidate.id !== 'contextHelpClose') show(candidate);
    });
    document.addEventListener('pointerout', event => {
      if (event.pointerType === 'touch') return;
      if (!event.relatedTarget?.closest?.('#contextHelpCard')) hide();
    });
    window.addEventListener('resize', () => { if (activeTarget) position($('contextHelpCard'), activeTarget); });
    window.addEventListener('scroll', () => { if (activeTarget) position($('contextHelpCard'), activeTarget); }, true);
    toggle(enabled);
  }

  window.ExoviaContextHelp = { show, hide, toggle, isEnabled: () => enabled, entries: help };
  window.addEventListener('DOMContentLoaded', build);
})();