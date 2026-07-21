(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);

  const templates = [
    {
      id: 'family', icon: '♥', title: 'Save family memories', description: 'Organize people, stories, dates, photos and important moments.',
      center: 'Our family story', branches: ['People', 'Important dates', 'Stories', 'Photos and documents', 'Questions to ask', 'Places']
    },
    {
      id: 'study', icon: '✦', title: 'Study or prepare a class', description: 'Turn notes into topics, examples, questions and evidence.',
      center: 'Study topic', branches: ['Main ideas', 'Definitions', 'Examples', 'Questions', 'Sources', 'What I still need to learn']
    },
    {
      id: 'work', icon: '◆', title: 'Organize a work project', description: 'Keep goals, people, tasks, risks and decisions together.',
      center: 'Work project', branches: ['Goal', 'People', 'Tasks', 'Decisions', 'Risks', 'Evidence and files']
    },
    {
      id: 'compare', icon: '↔', title: 'Compare options', description: 'Compare products, services, ideas or important choices.',
      center: 'Decision to make', branches: ['Option A', 'Option B', 'Advantages', 'Disadvantages', 'Evidence', 'Final decision']
    },
    {
      id: 'recipes', icon: '○', title: 'Organize recipes or a hobby', description: 'Keep materials, steps, variations and personal notes.',
      center: 'My collection', branches: ['Items', 'Materials', 'Steps', 'Tips', 'Variations', 'Favorites']
    },
    {
      id: 'research', icon: '⌕', title: 'Research a topic', description: 'Connect claims, sources, contradictions and open questions.',
      center: 'Research question', branches: ['What we know', 'Sources', 'Claims', 'Contradictions', 'Open questions', 'Conclusions']
    },
    {
      id: 'meeting', icon: '◎', title: 'Remember a meeting', description: 'Record participants, decisions, tasks and exact evidence.',
      center: 'Meeting', branches: ['Participants', 'Topics', 'Decisions', 'Tasks', 'Questions', 'Evidence']
    },
    {
      id: 'custom', icon: '+', title: 'Start with my own information', description: 'Paste text or open a simple file and let NeuroCanvas organize it.',
      custom: true
    }
  ];

  function node(id, title, type, text, parent = null, level = 0) {
    return { id, title, type, text, summary: text, keywords: title.toLowerCase().split(/\s+/), parent, level };
  }

  function buildTemplate(template) {
    const rootId = `template-${template.id}`;
    const nodes = [node(rootId, template.center, 'corpus', `A simple starting point for: ${template.title}. Replace each example with your own information.`)];
    const edges = [];
    template.branches.forEach((title, index) => {
      const id = `${rootId}-${index + 1}`;
      nodes.push(node(id, title, 'topic', `Add your information about ${title.toLowerCase()} here.`, rootId, 1));
      edges.push({ id: `${rootId}-${id}`, a: rootId, b: id, type: 'contains' });
    });
    return {
      format: 'neurocanvas-v3',
      projectId: `${rootId}-${Date.now()}`,
      title: template.title,
      kind: 'network',
      nodes,
      edges,
      audit: [{ time: new Date().toISOString(), action: 'STARTER_TEMPLATE_CREATED', detail: template.title }]
    };
  }

  function choose(template) {
    if (template.custom) {
      $('purposeDialog').close();
      $('pasteBtn')?.click();
      return;
    }
    const map = buildTemplate(template);
    window.ExoviaRuntime?.loadMap?.(map, 'network');
    $('purposeDialog').close();
    notify(`${template.title} starter created. Replace the examples with your own information.`, 'success');
  }

  function build() {
    if ($('purposeBtn')) return;
    const toolbar = document.querySelector('.toolbar');
    const button = document.createElement('button');
    button.id = 'purposeBtn';
    button.type = 'button';
    button.textContent = 'What do you want to do?';
    button.title = 'Choose a simple starting point';
    toolbar?.prepend(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'purposeDialog';
    dialog.className = 'purposeDialog';
    dialog.setAttribute('aria-labelledby', 'purposeTitle');
    dialog.innerHTML = `
      <div class="purposeHead">
        <div><small>START WITH A PURPOSE</small><h2 id="purposeTitle">What would you like to organize?</h2><p>Choose the closest example. You can change everything later.</p></div>
        <button type="button" data-close aria-label="Close purpose chooser">×</button>
      </div>
      <div id="purposeGrid" class="purposeGrid"></div>
      <div class="purposeSafety"><strong>There is no wrong choice.</strong> This only creates a simple starting map.</div>`;
    document.body.append(dialog);

    $('purposeGrid').innerHTML = templates.map(template => `
      <button type="button" class="purposeCard" data-template="${template.id}">
        <span class="purposeIcon" aria-hidden="true">${template.icon}</span>
        <strong>${template.title}</strong>
        <span>${template.description}</span>
      </button>`).join('');

    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelectorAll('[data-template]').forEach(card => card.addEventListener('click', () => choose(templates.find(item => item.id === card.dataset.template))));
  }

  window.ExoviaUseCases = { templates, buildTemplate, open: () => $('purposeBtn')?.click() };
  window.addEventListener('DOMContentLoaded', build);
})();