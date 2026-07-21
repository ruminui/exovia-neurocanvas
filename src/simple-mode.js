(() => {
  'use strict';

  const STORAGE_KEY = 'exovia:simpleMode';
  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let enabled = localStorage.getItem(STORAGE_KEY) === 'true';
  let step = 0;

  const steps = [
    { title: '1. Choose what you want to organize or verify', body: 'Start with the real outcome: verify an AI answer, preserve context, compare outputs, control an agent or make a decision.', target: 'purposeBtn', action: 'Choose a purpose' },
    { title: '2. Add the original information', body: 'Import the document, conversation or AI answer. NeuroCanvas keeps the exact source so conclusions can be checked later.', target: 'pasteBtn', action: 'Import information' },
    { title: '3. Run the local Trust Scan', body: 'Check for missing sources, contradictions, credentials, personal data, prompt injection and broken context before trusting or sharing the result.', target: 'trustCenterBtn', action: 'Verify the project' },
    { title: '4. Preserve context for the next AI', body: 'Create a compact Context Capsule with evidence, decisions, open risks and rules. It can be reused with any model without starting over.', target: 'capsuleBtn', action: 'Create a context capsule' },
    { title: '5. Save a durable proof', body: 'Save while working. Export a backup or generate a Proof Pack when another person needs to verify evidence, decisions and the audit trail.', target: 'saveProjectBtn', action: 'Save the project' }
  ];

  function applyMode(value, announce = false) {
    enabled = Boolean(value); document.documentElement.classList.toggle('simpleMode', enabled); localStorage.setItem(STORAGE_KEY, String(enabled));
    const button = $('simpleModeBtn'); if (button) { button.setAttribute('aria-pressed', String(enabled)); button.textContent = enabled ? 'Standard view' : 'Simple view'; button.title = enabled ? 'Return to the full interface' : 'Use larger text and fewer choices'; }
    if (announce) notify(enabled ? 'Simple view enabled.' : 'Standard view enabled.', 'success');
  }
  function targetElement(id) { return $(id) || document.querySelector(`[data-simple-target="${id}"]`); }
  function clearHighlight() { document.querySelectorAll('.simpleGuideTarget').forEach(element => element.classList.remove('simpleGuideTarget')); }
  function renderGuide() { const current = steps[step]; $('simpleGuideStep').textContent = `${step + 1} of ${steps.length}`; $('simpleGuideTitle').textContent = current.title; $('simpleGuideBody').textContent = current.body; $('simpleGuideAction').textContent = current.action; $('simpleGuidePrev').disabled = step === 0; $('simpleGuideNext').textContent = step === steps.length - 1 ? 'Done' : 'Next'; clearHighlight(); const target = targetElement(current.target); if (target) { target.classList.add('simpleGuideTarget'); target.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: enabled ? 'auto' : 'smooth' }); } }
  function performCurrentAction() { const target = targetElement(steps[step].target); if (!target) return notify('This action is not available yet. Open or create a workspace first.', 'info'); target.click(); }
  function openGuide() { step = 0; applyMode(true); renderGuide(); $('simpleGuideDialog').showModal(); }
  function build() {
    if ($('simpleModeBtn')) return;
    const toolbar = document.querySelector('.toolbar');
    const modeButton = document.createElement('button'); modeButton.id = 'simpleModeBtn'; modeButton.type = 'button'; modeButton.className = 'simpleModeButton'; modeButton.addEventListener('click', () => applyMode(!enabled, true));
    const guideButton = document.createElement('button'); guideButton.id = 'simpleGuideBtn'; guideButton.type = 'button'; guideButton.textContent = 'Guide me'; guideButton.title = 'Open a step-by-step guide'; guideButton.addEventListener('click', openGuide);
    toolbar?.prepend(guideButton); toolbar?.prepend(modeButton);
    const dialog = document.createElement('dialog'); dialog.id = 'simpleGuideDialog'; dialog.className = 'simpleGuideDialog'; dialog.setAttribute('aria-labelledby', 'simpleGuideTitle');
    dialog.innerHTML = `<div class="simpleGuideHead"><div><small>STEP-BY-STEP HELP</small><span id="simpleGuideStep"></span></div><button type="button" data-close aria-label="Close guide">×</button></div><div class="simpleGuideContent"><h2 id="simpleGuideTitle"></h2><p id="simpleGuideBody"></p><button id="simpleGuideAction" type="button" class="simpleGuideAction"></button><div class="simpleGuideSafety"><strong>You cannot damage the original information.</strong><span>Save often and use Export for a backup.</span></div></div><div class="simpleGuideFooter"><button id="simpleGuidePrev" type="button">Back</button><button id="simpleGuideNext" type="button">Next</button></div>`;
    document.body.append(dialog); dialog.querySelector('[data-close]').addEventListener('click', () => { clearHighlight(); dialog.close(); }); dialog.addEventListener('close', clearHighlight); $('simpleGuideAction').addEventListener('click', performCurrentAction); $('simpleGuidePrev').addEventListener('click', () => { step = Math.max(0, step - 1); renderGuide(); }); $('simpleGuideNext').addEventListener('click', () => { if (step === steps.length - 1) { clearHighlight(); dialog.close(); return; } step += 1; renderGuide(); }); applyMode(enabled);
  }
  window.ExoviaSimpleMode = { enable: () => applyMode(true, true), disable: () => applyMode(false, true), openGuide, isEnabled: () => enabled, steps };
  window.addEventListener('DOMContentLoaded', build);
})();
