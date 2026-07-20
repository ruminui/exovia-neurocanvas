(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  let step = 0;
  const steps = [
    {
      title: '1. The problem',
      body: 'Teams use documents, notes and AI answers, but later cannot prove where an answer came from or how a decision was made.',
      action: 'Start with the problem — not the feature list.'
    },
    {
      title: '2. Turn information into a map',
      body: 'Create or import a workspace. NeuroCanvas converts scattered information into an inspectable graph.',
      action: 'Press New workspace or Import text.'
    },
    {
      title: '3. Verify an answer',
      body: 'Ask a question in Answer & Audit, navigate to the strongest result and inspect its exact evidence.',
      action: 'Show the answer, citation and selected evidence node.'
    },
    {
      title: '4. Check knowledge quality',
      body: 'Knowledge Health and Contradiction Radar expose weak coverage, missing support and conflicting claims.',
      action: 'Show one quality signal, not every panel.'
    },
    {
      title: '5. Replay how the result was produced',
      body: 'Agent Replay and Live Room make human, workflow and AI activity visible instead of hiding it in a black box.',
      action: 'End with traceability and human approval.'
    }
  ];

  function render() {
    const current = steps[step];
    $('clarityStep').textContent = `${step + 1}/${steps.length}`;
    $('clarityTitle').textContent = current.title;
    $('clarityBody').textContent = current.body;
    $('clarityAction').textContent = current.action;
    $('clarityPrev').disabled = step === 0;
    $('clarityNext').textContent = step === steps.length - 1 ? 'Finish' : 'Next';
  }

  function build() {
    if ($('clarityBtn')) return;
    const button = document.createElement('button');
    button.id = 'clarityBtn';
    button.type = 'button';
    button.textContent = 'What problem does this solve?';
    button.title = 'Open the judge-first explanation';
    document.querySelector('.toolbar')?.prepend(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'clarityDialog';
    dialog.className = 'clarityDialog';
    dialog.setAttribute('aria-labelledby', 'clarityTitle');
    dialog.innerHTML = `
      <div class="clarityHead">
        <div><small>JUDGE-FIRST EXPLANATION</small><span id="clarityStep"></span></div>
        <button type="button" data-close aria-label="Close explanation">×</button>
      </div>
      <div class="clarityContent">
        <h2 id="clarityTitle"></h2>
        <p id="clarityBody"></p>
        <div id="clarityAction" class="clarityAction"></div>
        <div class="clarityPromise">
          <strong>One-sentence value:</strong>
          <p>NeuroCanvas turns scattered information and AI activity into a visual, evidence-linked workspace where every answer and decision can be verified and replayed.</p>
        </div>
      </div>
      <div class="clarityFooter">
        <button id="clarityPrev" type="button">Back</button>
        <button id="clarityNext" type="button">Next</button>
      </div>`;
    document.body.append(dialog);

    button.addEventListener('click', () => { step = 0; render(); dialog.showModal(); });
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('clarityPrev').addEventListener('click', () => { step = Math.max(0, step - 1); render(); });
    $('clarityNext').addEventListener('click', () => {
      if (step === steps.length - 1) return dialog.close();
      step += 1;
      render();
    });
  }

  window.ExoviaClarity = { open: () => $('clarityBtn')?.click(), steps };
  window.addEventListener('DOMContentLoaded', build);
})();