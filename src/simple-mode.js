(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:simpleMode';
  const storedMode = localStorage.getItem(STORAGE_KEY);
  const $ = id => document.getElementById(id);
  const isSpanish = () => window.ExoviaLanguage?.get?.() === 'es';
  const tr = (en, es) => isSpanish() ? es : en;
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let enabled = storedMode == null ? true : storedMode === 'true';
  let step = 0;

  function getSteps() {
    return [
      {
        title: tr('1. Add the original information', '1. Agregá la información original'),
        body: tr(
          'Paste the complete AI answer, original question, notes or document. NeuroCanvas keeps the exact source so you can verify it later. Choose what you want to organize or verify after the information is visible.',
          'Pegá la respuesta completa de la IA, la pregunta original, tus notas o el documento. NeuroCanvas conserva la fuente exacta para que después puedas revisarla.'
        ),
        target: 'pasteBtn',
        action: tr('Add my information', 'Agregar mi información')
      },
      {
        title: tr('2. Check before trusting', '2. Revisá antes de confiar'),
        body: tr(
          'NeuroCanvas checks for missing proof, contradictions, private data, credentials and instructions that may try to manipulate an AI. The check happens on this device.',
          'NeuroCanvas busca falta de prueba, contradicciones, datos privados, credenciales e instrucciones que podrían intentar manipular una IA. La revisión se hace en este dispositivo.'
        ),
        target: 'trustCenterBtn',
        action: tr('Check this project', 'Revisar este proyecto')
      },
      {
        title: tr('3. Save a clear record', '3. Guardá un registro claro'),
        body: tr(
          'Save the useful facts, decisions, risks and source references so another AI or person can continue without starting again. You can also export a Proof Pack when you need formal evidence.',
          'Guardá los hechos útiles, decisiones, riesgos y referencias para que otra IA o persona pueda continuar sin empezar de cero. También podés exportar un Paquete de prueba cuando necesites evidencia formal.'
        ),
        target: 'capsuleBtn',
        action: tr('Save the useful context', 'Guardar el contexto útil')
      }
    ];
  }

  function setButtonText(id, en, es) {
    const element = $(id);
    if (element) element.textContent = tr(en, es);
  }

  function applyPlainLabels() {
    if (!enabled) return;
    setButtonText('simpleGuideBtn', 'How it works', 'Cómo funciona');
    setButtonText('simpleModeBtn', 'More options', 'Más opciones');
    setButtonText('purposeBtn', 'Choose a goal', 'Elegir objetivo');
    setButtonText('pasteBtn', 'Add information', 'Agregar información');
    setButtonText('trustCenterBtn', 'Check AI', 'Revisar IA');
    setButtonText('capsuleBtn', 'Save context', 'Guardar contexto');
    setButtonText('exportBtn', 'Save / Share', 'Guardar / compartir');
    setButtonText('workspaceBtn', 'My work', 'Mis trabajos');
    const fileLabel = document.querySelector('.fileButton');
    if (fileLabel?.firstChild) fileLabel.firstChild.textContent = tr('Open', 'Abrir');
  }

  function applyMode(value, announce = false) {
    enabled = Boolean(value);
    document.documentElement.classList.toggle('simpleMode', enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    const button = $('simpleModeBtn');
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? tr('More options', 'Más opciones') : tr('Simple view', 'Vista simple');
      button.title = enabled ? tr('Show advanced tools', 'Mostrar herramientas avanzadas') : tr('Use fewer choices and larger controls', 'Usar menos opciones y controles más grandes');
    }
    applyPlainLabels();
    if (announce) notify(enabled ? tr('Simple view enabled.', 'Vista simple activada.') : tr('Advanced options enabled.', 'Opciones avanzadas activadas.'), 'success');
  }

  function targetElement(id) { return $(id) || document.querySelector(`[data-simple-target="${id}"]`); }
  function clearHighlight() { document.querySelectorAll('.simpleGuideTarget').forEach(element => element.classList.remove('simpleGuideTarget')); }

  function updateStaticCopy() {
    const dialog = $('simpleGuideDialog');
    if (!dialog) return;
    const eyebrow = dialog.querySelector('[data-guide-eyebrow]');
    const close = dialog.querySelector('[data-close]');
    const safetyStrong = dialog.querySelector('[data-guide-safety-title]');
    const safetyBody = dialog.querySelector('[data-guide-safety-body]');
    if (eyebrow) eyebrow.textContent = tr('THREE SIMPLE STEPS', 'TRES PASOS SIMPLES');
    if (close) close.setAttribute('aria-label', tr('Close guide', 'Cerrar guía'));
    if (safetyStrong) safetyStrong.textContent = tr('You cannot damage the original information.', 'No podés dañar la información original.');
    if (safetyBody) safetyBody.textContent = tr('Changes save automatically on this device. Export a copy before deleting or replacing a project.', 'Los cambios se guardan automáticamente en este dispositivo. Exportá una copia antes de borrar o reemplazar un proyecto.');
  }

  function renderGuide() {
    const steps = getSteps();
    const current = steps[step];
    $('simpleGuideStep').textContent = isSpanish() ? `${step + 1} de ${steps.length}` : `${step + 1} of ${steps.length}`;
    $('simpleGuideTitle').textContent = current.title;
    $('simpleGuideBody').textContent = current.body;
    $('simpleGuideAction').textContent = current.action;
    $('simpleGuidePrev').textContent = tr('Back', 'Atrás');
    $('simpleGuidePrev').disabled = step === 0;
    $('simpleGuideNext').textContent = step === steps.length - 1 ? tr('Done', 'Listo') : tr('Next', 'Siguiente');
    clearHighlight();
    const target = targetElement(current.target);
    if (target) {
      target.classList.add('simpleGuideTarget');
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: enabled ? 'auto' : 'smooth' });
    }
    updateStaticCopy();
  }

  function closeGuide() {
    clearHighlight();
    const dialog = $('simpleGuideDialog');
    if (dialog?.open) dialog.close();
  }

  function performCurrentAction() {
    const current = getSteps()[step];
    closeGuide();
    setTimeout(() => {
      const target = targetElement(current.target);
      if (!target) return notify(tr('Create or open a project first.', 'Primero creá o abrí un proyecto.'), 'info');
      target.click();
    }, 60);
  }

  function openGuide() {
    ['purposeDialog', 'trustCenterDialog', 'pasteDialog', 'intentDialog'].forEach(id => {
      const dialog = $(id);
      if (dialog?.open) dialog.close();
    });
    step = 0;
    applyMode(true);
    renderGuide();
    const dialog = $('simpleGuideDialog');
    if (dialog && !dialog.open) dialog.showModal();
  }

  function build() {
    if ($('simpleModeBtn')) return;
    const toolbar = document.querySelector('.toolbar');
    const modeButton = document.createElement('button');
    modeButton.id = 'simpleModeBtn';
    modeButton.type = 'button';
    modeButton.className = 'simpleModeButton';
    modeButton.addEventListener('click', () => applyMode(!enabled, true));

    const guideButton = document.createElement('button');
    guideButton.id = 'simpleGuideBtn';
    guideButton.type = 'button';
    guideButton.textContent = tr('How it works', 'Cómo funciona');
    guideButton.title = tr('Open the three-step guide', 'Abrir la guía de tres pasos');
    guideButton.addEventListener('click', openGuide);
    toolbar?.prepend(guideButton);
    toolbar?.prepend(modeButton);

    const dialog = document.createElement('dialog');
    dialog.id = 'simpleGuideDialog';
    dialog.className = 'simpleGuideDialog';
    dialog.setAttribute('aria-labelledby', 'simpleGuideTitle');
    dialog.innerHTML = `<div class="simpleGuideHead"><div><small data-guide-eyebrow></small><span id="simpleGuideStep"></span></div><button type="button" data-close>×</button></div><div class="simpleGuideContent"><h2 id="simpleGuideTitle"></h2><p id="simpleGuideBody"></p><button id="simpleGuideAction" type="button" class="simpleGuideAction"></button><div class="simpleGuideSafety"><strong data-guide-safety-title></strong><span data-guide-safety-body></span></div></div><div class="simpleGuideFooter"><button id="simpleGuidePrev" type="button"></button><button id="simpleGuideNext" type="button"></button></div>`;
    document.body.append(dialog);

    dialog.querySelector('[data-close]').addEventListener('click', closeGuide);
    dialog.addEventListener('close', clearHighlight);
    $('simpleGuideAction').addEventListener('click', performCurrentAction);
    $('simpleGuidePrev').addEventListener('click', () => { step = Math.max(0, step - 1); renderGuide(); });
    $('simpleGuideNext').addEventListener('click', () => {
      const steps = getSteps();
      if (step === steps.length - 1) return closeGuide();
      step += 1;
      renderGuide();
    });
    applyMode(enabled);
    updateStaticCopy();
  }

  window.ExoviaSimpleMode = {
    enable: () => applyMode(true, true),
    disable: () => applyMode(false, true),
    openGuide,
    isEnabled: () => enabled,
    get steps() { return getSteps(); }
  };

  window.addEventListener('DOMContentLoaded', build);
  window.addEventListener('exovia:language-changed', () => {
    applyMode(enabled);
    if ($('simpleGuideDialog')?.open) renderGuide();
    else updateStaticCopy();
  });
})();
