(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const words = value => String(value || '').toLowerCase().match(/[\p{L}\p{N}_-]{3,}/gu) || [];
  const uniq = values => [...new Set(values)];
  const now = () => new Date().toISOString();

  function map() { return window.ExoviaRuntime?.getMap?.() || null; }

  function scoreNode(node, query) {
    const terms = uniq(words(query));
    const title = String(node.title || '').toLowerCase();
    const text = String(node.text || node.summary || '').toLowerCase();
    const tags = (node.keywords || []).join(' ').toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (title.includes(term)) score += 4;
      if (tags.includes(term)) score += 2;
      if (text.includes(term)) score += 1;
    }
    return score / Math.max(1, terms.length);
  }

  function answer(query) {
    const project = map();
    if (!project) throw new Error('Open a project first.');
    const ranked = project.nodes.map(node => ({ node, score: scoreNode(node, query) }))
      .filter(item => item.score > 0).sort((a,b) => b.score - a.score).slice(0, 6);
    const citations = ranked.map((item, index) => ({
      index: index + 1,
      id: item.node.id,
      title: item.node.title || item.node.id,
      score: Number(item.score.toFixed(2)),
      excerpt: String(item.node.text || item.node.summary || '').trim().slice(0, 420),
      source: item.node.source || null
    }));
    const confidence = citations.length ? Math.min(0.96, 0.35 + citations[0].score / 8 + citations.length / 30) : 0;
    const synthesis = citations.length
      ? citations.slice(0, 3).map(c => c.excerpt).filter(Boolean).join(' ').slice(0, 900)
      : 'No evidence in the active project matched this question.';
    const result = { query, answer: synthesis, confidence, citations, generatedAt: now(), engine: 'local-evidence-engine-v1' };
    project.audit ||= [];
    project.audit.push({ time: now(), action: 'ANSWER_WITH_EVIDENCE', detail: `${query}; ${citations.length} citations` });
    return result;
  }

  function contradictionRadar() {
    const project = map();
    if (!project) return [];
    const claims = [];
    const patterns = [
      /\b(?:deadline|due|entrega|fecha)\b[^\n.]{0,80}/gi,
      /\b(?:version|versión|status|estado)\b[^\n.]{0,80}/gi,
      /\b(?:must|should|debe|tiene que)\b[^\n.]{0,100}/gi
    ];
    for (const node of project.nodes) {
      const text = String(node.text || '');
      for (const pattern of patterns) {
        for (const match of text.matchAll(pattern)) claims.push({ nodeId: node.id, title: node.title, claim: match[0].trim() });
      }
    }
    const conflicts = [];
    for (let i = 0; i < claims.length; i++) {
      for (let j = i + 1; j < claims.length; j++) {
        if (claims[i].nodeId === claims[j].nodeId) continue;
        const a = uniq(words(claims[i].claim));
        const b = uniq(words(claims[j].claim));
        const overlap = a.filter(x => b.includes(x));
        const datesA = claims[i].claim.match(/\b(?:20\d{2}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]20\d{2})\b/g) || [];
        const datesB = claims[j].claim.match(/\b(?:20\d{2}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]20\d{2})\b/g) || [];
        if (overlap.length >= 2 && datesA.length && datesB.length && datesA.join() !== datesB.join()) {
          conflicts.push({ type: 'date_conflict', a: claims[i], b: claims[j] });
        }
      }
    }
    return conflicts.slice(0, 20);
  }

  function health() {
    const project = map();
    if (!project) throw new Error('Open a project first.');
    const ids = new Set(project.nodes.map(n => n.id));
    const emptyEvidence = project.nodes.filter(n => n.type !== 'corpus' && !String(n.text || '').trim());
    const missingSource = project.nodes.filter(n => n.type !== 'corpus' && !n.source && !n.path && !n.parent);
    const brokenEdges = project.edges.filter(e => !ids.has(e.a) || !ids.has(e.b));
    const orphaned = project.nodes.filter(n => n.parent && !ids.has(n.parent));
    const duplicates = [];
    const seen = new Map();
    for (const node of project.nodes) {
      const key = String(node.title || '').trim().toLowerCase();
      if (!key) continue;
      if (seen.has(key)) duplicates.push([seen.get(key), node.id]); else seen.set(key, node.id);
    }
    const contradictions = contradictionRadar();
    const penalty = emptyEvidence.length + missingSource.length + brokenEdges.length * 2 + orphaned.length * 2 + duplicates.length + contradictions.length * 2;
    const score = Math.max(0, Math.round(100 - penalty / Math.max(1, project.nodes.length) * 100));
    return { score, emptyEvidence, missingSource, brokenEdges, orphaned, duplicates, contradictions };
  }

  function replay() {
    const project = map();
    const audit = project?.audit || [];
    const events = project?.events || [];
    return [...audit.map(x => ({ time:x.time, type:x.action, detail:x.detail, actor:'workspace' })),
      ...events.map(x => ({ time:x.time, type:x.type || x.action || 'event', detail:JSON.stringify(x.payload || x.detail || ''), actor:x.actor || 'agent' }))]
      .filter(x => x.time).sort((a,b) => String(a.time).localeCompare(String(b.time))).slice(-100);
  }

  function renderAnswer(result) {
    $('intelligenceOutput').innerHTML = `
      <section class="intelAnswer"><div class="intelHeadline"><strong>Answer</strong><span>${Math.round(result.confidence*100)}% confidence</span></div>
      <p>${esc(result.answer)}</p></section>
      <section><h3>Evidence</h3>${result.citations.map(c => `<button class="intelCitation" data-node="${esc(c.id)}"><b>[${c.index}] ${esc(c.title)}</b><span>${esc(c.excerpt || 'No excerpt')}</span><small>score ${c.score}${c.source?.url ? ` · ${esc(c.source.url)}` : ''}</small></button>`).join('') || '<p>No matching evidence.</p>'}</section>`;
    $('intelligenceOutput').querySelectorAll('[data-node]').forEach(button => button.addEventListener('click', () => {
      const node = map()?.nodes.find(n => n.id === button.dataset.node);
      if (node && window.ExoviaRuntime?.selectNode) window.ExoviaRuntime.selectNode(node.id);
    }));
  }

  function renderHealth(report) {
    $('intelligenceOutput').innerHTML = `<div class="healthScore"><strong>${report.score}</strong><span>Knowledge health</span></div>
      ${[['Empty evidence',report.emptyEvidence],['Missing provenance',report.missingSource],['Broken edges',report.brokenEdges],['Orphan nodes',report.orphaned],['Duplicate titles',report.duplicates],['Contradictions',report.contradictions]].map(([label,list]) => `<section><h3>${label} · ${list.length}</h3>${list.slice(0,8).map(item => `<div class="intelIssue">${esc(Array.isArray(item)?item.join(' ↔ '):(item.title || item.type || item.nodeId || JSON.stringify(item)))}</div>`).join('') || '<p class="intelOk">No issues found.</p>'}</section>`).join('')}`;
  }

  function renderReplay(items) {
    $('intelligenceOutput').innerHTML = `<section><h3>Agent and human replay</h3>${items.map((item,index) => `<article class="replayStep"><span>${index+1}</span><div><time>${esc(new Date(item.time).toLocaleString())}</time><strong>${esc(item.type)}</strong><p>${esc(item.detail)}</p></div></article>`).join('') || '<p>No auditable activity yet.</p>'}</section>`;
  }

  async function judgeMode() {
    const steps = [
      ['Load a workspace', () => $('demoBtn')?.click()],
      ['Ask a complex question', () => { $('intelQuestion').value = 'What evidence explains the architecture and why are agent changes auditable?'; renderAnswer(answer($('intelQuestion').value)); }],
      ['Inspect knowledge health', () => renderHealth(health())],
      ['Replay agent activity', () => renderReplay(replay())]
    ];
    for (const [label, action] of steps) {
      $('judgeProgress').textContent = label;
      action();
      await new Promise(resolve => setTimeout(resolve, 1600));
    }
    $('judgeProgress').textContent = 'Guided experience complete';
  }

  function build() {
    const button = document.createElement('button');
    button.id = 'intelligenceBtn'; button.type = 'button'; button.textContent = 'Answer & Audit';
    document.querySelector('.toolbar')?.append(button);
    const dialog = document.createElement('dialog');
    dialog.id = 'intelligenceDialog'; dialog.className = 'productDialog intelligenceDialog';
    dialog.innerHTML = `<div class="productDialogHead"><div><small>EXOVIA INTELLIGENCE</small><h2>Answer, verify and replay</h2></div><button type="button" data-close>×</button></div>
      <div class="intelLayout"><section class="intelControls"><label>Ask the active knowledge project<textarea id="intelQuestion" placeholder="Ask a question that requires evidence..."></textarea></label>
      <button id="intelAnswerBtn" type="button">Navigate to answer</button><button id="intelHealthBtn" type="button">Knowledge health</button><button id="intelReplayBtn" type="button">Agent replay</button><button id="judgeModeBtn" type="button">Start guided judge mode</button><div id="judgeProgress" aria-live="polite"></div>
      <p class="intelNote">Current engine is local and deterministic. A secure GPT-5.6 provider can replace synthesis without changing the evidence contract.</p></section><section id="intelligenceOutput" class="intelOutput"><p>Ask a question or inspect the project.</p></section></div>`;
    document.body.append(dialog);
    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('intelAnswerBtn').addEventListener('click', () => { try { renderAnswer(answer($('intelQuestion').value)); } catch(e) { $('intelligenceOutput').textContent = e.message; } });
    $('intelHealthBtn').addEventListener('click', () => { try { renderHealth(health()); } catch(e) { $('intelligenceOutput').textContent = e.message; } });
    $('intelReplayBtn').addEventListener('click', () => renderReplay(replay()));
    $('judgeModeBtn').addEventListener('click', judgeMode);
  }

  window.ExoviaIntelligence = { answer, health, contradictionRadar, replay };
  window.addEventListener('DOMContentLoaded', build);
})();
