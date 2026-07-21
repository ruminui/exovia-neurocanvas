(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:simpleMode';
  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let enabled = localStorage.getItem(STORAGE_KEY) === 'true';
  let step = 0;

  const steps = [
    {
      title: '1. Start with your information',
      body: 'Use a sample workspace, paste text or open a simple file. NeuroCanvas turns the information into a visual map.',
      target: 'demoBtn',
      action: 'Create a sample map'
    },
    {
      title: '2. Select one idea',
      body: 'Click any circle in the map. The right side shows what that idea means and where it came from.',
      target: 'canvas',
      action: 'Look at the map'
    },
    {
      title: '3. Ask a question',
      body: 'Open Answer & Audit, type a normal question and follow the answer back to its evidence.',
      target: 'answerAuditBtn',
      action: 'Open Answer & Audit'
    },
    {
      title: '4. Save your work',
      body: 'Use Save while working and Export when you want a portable backup file.',
      target: 'saveProjectBtn',
      action: 'Save the project'
    }
  ];

  function applyMode(value, announce = false) {
    enabled = Boolean(value);
    document.documentElement.classList.toggle('simpleMode', enabled);
    localStorage.setItem(STORAGE_KEY, String(enabled));
    const button = $('simpleModeBtn');
    if (button) {
      button.setAttribute('aria-pressed', String(enabled));
      button.textContent = enabled ? 'Standard view' : 'Simple view';
      button.title = enabled ? 'Return to the full interface' : 'Use larger text and fewer choices';
    }
    if (announce) notify(enabled ? 'Simple view enabled.' : 'Standard view enabled.', 'success');
  }

  function targetElement(id) {
    return $(id) || document.querySelector(`[data-simple-target="${id}"]`);
  }

  function clearHighlight() {
    document.querySelectorAll('.simpleGuideTarget').forEach(element => element.classList.remove('simpleGuideTarget'));
  }

  function renderGuide() {
    const current = steps[step];
    $('simpleGuideStep').textContent = `${step + 1} of ${steps.length}`;
    $('simpleGuideTitle').textContent = current.title;
    $('simpleGuideBody').textContent = current.body;
    $('simpleGuideAction').textContent = current.action;
    $('simpleGuidePrev').disabled = step === 0;
    $('simpleGuideNext').textContent = step === steps.length - 1 ? 'Done' : 'Next';
    clearHighlight();
    const target = targetElement(current.target);
    if (target) {
      target.classList.add('simpleGuideTarget');
      target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: enabled ? 'auto' : 'smooth' });
    }
  }

  function performCurrentAction() {
    const current = steps[step];
    const target = targetElement(current.target);
    if (!target) return notify('This action is not available yet. Open or create a workspace first.', 'info');
    if (current.target === 'canvas') {
      target.focus();
      notify('Select any circle in the map to inspect it.', 'info');
      return;
    }
    target.click();
  }

  function openGuide() {
    step = 0;
    applyMode(true);
    renderGuide();
    $('simpleGuideDialog').showModal();
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
    guideButton.textContent = 'Guide me';
    guideButton.title = 'Open a step-by-step guide';
    guideButton.addEventListener('click', openGuide);

    toolbar?.prepend(guideButton);
    toolbar?.prepend(modeButton);

    const dialog = document.createElement('dialog');
    dialog.id = 'simpleGuideDialog';
    dialog.className = 'simpleGuideDialog';
    dialog.setAttribute('aria-labelledby', 'simpleGuideTitle');
    dialog.innerHTML = `
      <div class="simpleGuideHead">
        <div><small>STEP-BY-STEP HELP</small><span id="simpleGuideStep"></span></div>
        <button type="button" data-close aria-label="Close guide">×</button>
      </div>
      <div class="simpleGuideContent">
        <h2 id="simpleGuideTitle"></h2>
        <p id="simpleGuideBody"></p>
        <button id="simpleGuideAction" type="button" class="simpleGuideAction"></button>
        <div class="simpleGuideSafety"><strong>You cannot damage the original information.</strong><span>Save often and use Export for a backup.</span></div>
      </div>
      <div class="simpleGuideFooter">
        <button id="simpleGuidePrev" type="button">Back</button>
        <button id="simpleGuideNext" type="button">Next</button>
      </div>`;
    document.body.append(dialog);

    dialog.querySelector('[data-close]').addEventListener('click', () => { clearHighlight(); dialog.close(); });
    dialog.addEventListener('close', clearHighlight);
    $('simpleGuideAction').addEventListener('click', performCurrentAction);
    $('simpleGuidePrev').addEventListener('click', () => { step = Math.max(0, step - 1); renderGuide(); });
    $('simpleGuideNext').addEventListener('click', () => {
      if (step === steps.length - 1) { clearHighlight(); dialog.close(); return; }
      step += 1;
      renderGuide();
    });

    applyMode(enabled);
  }

  window.ExoviaSimpleMode = { enable: () => applyMode(true, true), disable: () => applyMode(false, true), openGuide, isEnabled: () => enabled };
  window.addEventListener('DOMContentLoaded', build);
})();