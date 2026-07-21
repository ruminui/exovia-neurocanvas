(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:simpleMode';
  const $ = id => document.getElementById(id);
  const isSpanish = () => window.ExoviaLanguage?.get?.() === 'es';
  const tr = (en, es) => isSpanish() ? es : en;
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let enabled = localStorage.getItem(STORAGE_KEY) === 'true';
  let step = 0;

  function getSteps() {
    return [
      {
        title: tr('1. Start with your information', '1. Empezá con tu información'),
        body: tr(
          'Paste the original AI answer, conversation or document. NeuroCanvas keeps the exact source so you can verify it later. Choose the real outcome after the information is visible.',
          'Pegá la respuesta original de la IA, la conversación o el documento. NeuroCanvas conserva la fuente exacta para que después puedas verificarla.'
        ),
        target: 'pasteBtn',
        action: tr('Paste information', 'Pegar información')
      },
      {
        title: tr('2. Verify before trusting', '2. Verificá antes de confiar'),
        body: tr(
          'Trust Scan finds missing sources, unsupported claims, contradictions, personal data, credentials and prompt-injection patterns locally on this device.',
          'El Análisis de confianza busca fuentes faltantes, afirmaciones sin respaldo, contradicciones, datos personales, credenciales e inyecciones de prompt. El análisis se hace en este dispositivo.'
        ),
        target: 'trustCenterBtn',
        action: tr('Run Trust Scan', 'Analizar el proyecto')
      },
      {
        title: tr('3. Preserve context for the next AI', '3. Conservá el contexto para la próxima IA'),
        body: tr(
          'Create a compact Context Capsule with verified facts, decisions, risks and source references. Reuse it with any AI instead of starting from zero.',
          'Creá una Cápsula de contexto con hechos verificados, decisiones, riesgos y referencias. Podés usarla con cualquier IA sin volver a empezar desde cero.'
        ),
        target: 'capsuleBtn',
        action: tr('Create Context Capsule', 'Crear Cápsula de contexto')
      },
      {
        title: tr('4. Export something another person can verify', '4. Exportá algo que otra persona pueda verificar'),
        body: tr(
          'Generate a Proof Pack with evidence, risks, decisions, agent activity and a SHA-256 integrity fingerprint. Important actions always remain under human approval.',
          'Generá un Paquete de prueba con evidencia, riesgos, decisiones, actividad de agentes y una huella SHA-256. Las acciones importantes siempre quedan bajo aprobación humana.'
        ),
        target: 'trustCenterBtn',
        action: tr('Open Proof Pack', 'Abrir Paquete de prueba'),
        special: 'proof'
      }
    ];
  }

  function applyMode(value, announce = false) {
    enabled = Boolean(value);
    document.documentElement.classList.toggle('simpleMode', enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    const button = $('simpleModeBtn');
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? tr('Standard view', 'Vista completa') : tr('Simple view', 'Vista simple');
      button.title = enabled ? tr('Return to the full interface', 'Volver a la interfaz completa') : tr('Use larger text and fewer choices', 'Usar texto más grande y menos opciones');
    }
    if (announce) notify(enabled ? tr('Simple view enabled.', 'Vista simple activada.') : tr('Standard view enabled.', 'Vista completa activada.'), 'success');
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
    if (eyebrow) eyebrow.textContent = tr('HOW TO USE NEUROCANVAS', 'CÓMO USAR NEUROCANVAS');
    if (close) close.setAttribute('aria-label', tr('Close guide', 'Cerrar guía'));
    if (safetyStrong) safetyStrong.textContent = tr('You cannot damage the original information.', 'No podés dañar la información original.');
    if (safetyBody) safetyBody.textContent = tr('Everything stays local by default. Save a backup before deleting or replacing a project.', 'Todo queda local por defecto. Guardá una copia antes de borrar o reemplazar un proyecto.');
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
      if (current.special === 'proof') {
        window.ExoviaTrustCenter?.open?.('proof');
        return;
      }
      const target = targetElement(current.target);
      if (!target) return notify(tr('This action is not available yet. Open or create a workspace first.', 'Esta acción todavía no está disponible. Primero abrí o creá un proyecto.'), 'info');
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
    guideButton.textContent = tr('Guide me', 'Guiame');
    guideButton.title = tr('Open a step-by-step guide', 'Abrir una guía paso a paso');
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
    const guideButton = $('simpleGuideBtn');
    if (guideButton) {
      guideButton.textContent = tr('Guide me', 'Guiame');
      guideButton.title = tr('Open a step-by-step guide', 'Abrir una guía paso a paso');
    }
    applyMode(enabled);
    if ($('simpleGuideDialog')?.open) renderGuide();
    else updateStaticCopy();
  });
})();
