(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);

  const templates = [
    { id: 'verify-ai', icon: '◇', title: 'Verify an AI answer', description: 'Import an answer and connect every important claim to evidence, risks and unknowns.', center: 'AI answer to verify', branches: ['Original question', 'AI answer', 'Verified evidence', 'Unsupported claims', 'Contradictions', 'Human decision'] },
    { id: 'context', icon: '▣', title: 'Build reusable AI context', description: 'Preserve goals, facts, decisions, constraints and sources for the next model or agent.', center: 'Reusable context', branches: ['Goal', 'Verified facts', 'Decisions already made', 'Constraints', 'Open questions', 'Source evidence'] },
    { id: 'compare-ai', icon: '↔', title: 'Compare AI outputs', description: 'Evaluate answers from different models using the same evidence and decision criteria.', center: 'AI output comparison', branches: ['Shared question', 'Model A answer', 'Model B answer', 'Evidence quality', 'Risks and omissions', 'Best supported result'] },
    { id: 'agent-control', icon: '◎', title: 'Control an AI agent', description: 'Define permissions, inspect actions, require approval and keep a replayable audit trail.', center: 'Agent governance', branches: ['Goal', 'Allowed actions', 'Forbidden actions', 'Evidence required', 'Approval gates', 'Activity replay'] },
    { id: 'research', icon: '⌕', title: 'Research a topic', description: 'Connect claims, sources, contradictions and open questions.', center: 'Research question', branches: ['What we know', 'Sources', 'Claims', 'Contradictions', 'Open questions', 'Conclusions'] },
    { id: 'decision', icon: '◆', title: 'Make an important decision', description: 'Compare options with evidence, uncertainty, risks and a documented final choice.', center: 'Decision to make', branches: ['Goal', 'Options', 'Evidence', 'Risks', 'Unknowns', 'Final decision'] },
    { id: 'work', icon: '◫', title: 'Organize a work project', description: 'Keep goals, people, tasks, risks and decisions together.', center: 'Work project', branches: ['Goal', 'People', 'Tasks', 'Decisions', 'Risks', 'Evidence and files'] },
    { id: 'study', icon: '✦', title: 'Study or prepare a class', description: 'Turn notes into topics, examples, questions and evidence.', center: 'Study topic', branches: ['Main ideas', 'Definitions', 'Examples', 'Questions', 'Sources', 'What I still need to learn'] },
    { id: 'family', icon: '♥', title: 'Save family memories', description: 'Organize people, stories, dates, photos and important moments.', center: 'Our family story', branches: ['People', 'Important dates', 'Stories', 'Photos and documents', 'Questions to ask', 'Places'] },
    { id: 'custom', icon: '+', title: 'Start with my own information', description: 'Paste text or open a simple file and let NeuroCanvas organize it.', custom: true }
  ];

  function node(id, title, type, text, parent = null, level = 0) { return { id, title, type, text, summary: text, keywords: title.toLowerCase().split(/\s+/), parent, level }; }

  function buildTemplate(template) {
    const rootId = `template-${template.id}`;
    const nodes = [node(rootId, template.center, 'corpus', `A simple starting point for: ${template.title}. Replace each example with your own information.`)];
    const edges = [];
    template.branches.forEach((title, index) => { const id = `${rootId}-${index + 1}`; nodes.push(node(id, title, 'topic', `Add your information about ${title.toLowerCase()} here.`, rootId, 1)); edges.push({ id: `${rootId}-${id}`, a: rootId, b: id, type: 'contains' }); });
    return { format: 'neurocanvas-v3', projectId: `${rootId}-${Date.now()}`, title: template.title, kind: 'network', nodes, edges, audit: [{ time: new Date().toISOString(), action: 'STARTER_TEMPLATE_CREATED', detail: template.title }] };
  }

  function choose(template) {
    if (template.custom) { $('purposeDialog').close(); $('pasteBtn')?.click(); return; }
    window.ExoviaRuntime?.loadMap?.(buildTemplate(template), 'network');
    $('purposeDialog').close();
    notify(`${template.title} starter created. Replace the examples with your own information.`, 'success');
  }

  function build() {
    if ($('purposeBtn')) return;
    const toolbar = document.querySelector('.toolbar');
    const button = document.createElement('button'); button.id = 'purposeBtn'; button.type = 'button'; button.textContent = 'What do you want to do?'; button.title = 'Choose a simple starting point'; toolbar?.prepend(button);
    const dialog = document.createElement('dialog'); dialog.id = 'purposeDialog'; dialog.className = 'purposeDialog'; dialog.setAttribute('aria-labelledby', 'purposeTitle');
    dialog.innerHTML = `<div class="purposeHead"><div><small>START WITH A PURPOSE</small><h2 id="purposeTitle">What would you like to accomplish?</h2><p>Choose the closest goal. You can change everything later.</p></div><button type="button" data-close aria-label="Close purpose chooser">×</button></div><div id="purposeGrid" class="purposeGrid"></div><div class="purposeSafety"><strong>There is no wrong choice.</strong> This only creates a transparent starting structure.</div>`;
    document.body.append(dialog);
    $('purposeGrid').innerHTML = templates.map(template => `<button type="button" class="purposeCard" data-template="${template.id}"><span class="purposeIcon" aria-hidden="true">${template.icon}</span><strong>${template.title}</strong><span>${template.description}</span></button>`).join('');
    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-template]').forEach(card => card.addEventListener('click', () => choose(templates.find(item => item.id === card.dataset.template))));
  }

  window.ExoviaUseCases = { templates, buildTemplate, open: () => $('purposeBtn')?.click() };
  window.addEventListener('DOMContentLoaded', build);
})();
