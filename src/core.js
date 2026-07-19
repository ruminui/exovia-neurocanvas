(() => {
  'use strict';

  const STOP = new Set('the and for that with from this into are was were have has had not but you your our their its can will would should could about over under between through como para que una del las los por con sin sus este esta desde sobre entre donde cuando porque muy más pero'.split(' '));
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const state = {
    map: null, view: 'network', scale: 1, x: 0, y: 0, dragging: false, lastX: 0, lastY: 0,
    selected: null, highlighted: new Set(), pulseIndex: -1, pulseTimer: null, intentHits: []
  };

  const demoText = `Exovia NeuroCanvas is a visual memory and agent observability workspace. It converts documents, conversations, code, agent events and operational knowledge into an editable, persistent graph.

Every node remains connected to exact evidence. Users can search, edit, add, remove, save, restore and export knowledge without surrendering the original source.

Zoom to Answer connects a query to the strongest evidence and moves the canvas directly to it. ExiaL pulses expose agent handoffs and operational events. EXIR-style validation normalizes messages. FAPI represents capabilities. Exil provides a safe, previewable intent layer.

The workspace is local-first. Projects and recovery snapshots are stored in IndexedDB. The application remains useful without API credits and without sending private documents to an external service.`;

  const pulseDemo = `>>1|S>User|A>INGEST|P>{"target":"NeuroCanvas","document":"Exovia architecture"}
>>2|S>NeuroCanvas|A>CHUNK|P>{"fragments":8,"status":"ok"}
>>3|S>NeuroCanvas|A>ROUTE|P>{"to":"FAPI","request":"capability discovery"}
>>4|S>FAPI|A>FAPI_HELLO|P>{"version":1,"actions":["ROUTE","GENERATE","STREAM","HEALTH","BUDGET","WARMUP"]}
>>5|S>FAPI|A>HEALTH|P>{"service":"local-router","status":"ok"}
>>6|S>ResearchAgent|A>ASSIGN|P>{"task":"find ExiaL evidence","status":"accepted"}
>>7|S>ResearchAgent|A>EVIDENCE|P>{"source":"Drive","result":"EXIR 33/33 tests PASS"}
>>8|S>EXIR|A>VALIDATE|P>{"event":"EVIDENCE","status":"canonical"}
>>9|S>NeuroCanvas|A>ZOOM_TO_ANSWER|P>{"query":"low overhead agent memory","hits":["FAPI","ExiaL","EXIR"]}
>>10|S>Policy|A>BUDGET|P>{"mode":"offline","tokens":0,"status":"allowed"}`;

  const capabilities = [
    { name: 'FAPI Router', actions: ['ROUTE', 'HEALTH', 'BUDGET'], status: 'ready', description: 'Local capability discovery and routing plane.' },
    { name: 'Generator Adapter', actions: ['GENERATE', 'STREAM'], status: 'optional', description: 'Secure server-side model adapter, disabled in local-only mode.' },
    { name: 'Warmup Manager', actions: ['WARMUP', 'HEALTH'], status: 'ready', description: 'Tracks service readiness.' },
    { name: 'EXIR Validator', actions: ['PARSE', 'VALIDATE', 'NORMALIZE'], status: 'ready', description: 'Canonicalizes events before graph mutation.' },
    { name: 'Exil Preview', actions: ['FIND', 'FOCUS', 'LINK', 'EXPLAIN'], status: 'sandboxed', description: 'Safe declarative graph operations.' }
  ];

  function emit(name, detail = {}) { window.dispatchEvent(new CustomEvent(name, { detail })); }
  function words(text) { return (String(text).toLowerCase().match(/[a-záéíóúñü0-9_:-]{3,}/g) || []).filter(word => !STOP.has(word)); }
  function keywords(text, limit = 7) { const freq = {}; words(text).forEach(word => freq[word] = (freq[word] || 0) + 1); return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word]) => word); }
  function similarity(a, b) { const A = new Set(a), B = new Set(b); let matches = 0; A.forEach(value => { if (B.has(value)) matches++; }); return matches / Math.max(1, new Set([...A, ...B]).size); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
  function chunks(text) {
    const paragraphs = String(text).replace(/\r/g, '').split(/\n\s*\n/).map(value => value.trim()).filter(Boolean);
    const output = [];
    paragraphs.forEach(paragraph => {
      if (paragraph.length < 900) output.push(paragraph);
      else {
        const sentences = paragraph.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [paragraph];
        let current = '';
        sentences.forEach(sentence => { if ((current + sentence).length > 700 && current) { output.push(current.trim()); current = ''; } current += sentence; });
        if (current.trim()) output.push(current.trim());
      }
    });
    return output;
  }
  function titleFor(text, index) { const first = (text.split(/[.!?\n]/)[0] || '').trim(); return first.length > 64 ? `${first.slice(0, 61)}…` : first || `Fragment ${index + 1}`; }

  function buildMap(title, text) {
    const parts = chunks(text), nodes = [], edges = [];
    nodes.push({ id: 'root', type: 'corpus', title, summary: `${parts.length} source fragments`, text, keywords: keywords(text, 10), x: 0, y: 0, parent: null, level: 0 });
    const raw = parts.map((part, index) => ({ id: `chunk-${index}`, type: 'chunk', title: titleFor(part, index), summary: part.slice(0, 160), text: part, keywords: keywords(part), parent: null, level: 2 }));
    const groups = new Map();
    raw.forEach(node => { const key = node.keywords[0] || 'context'; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(node); });
    let groupIndex = 0;
    for (const [key, list] of groups) {
      const id = `topic-${groupIndex++}`, joined = list.map(node => node.text).join('\n\n');
      nodes.push({ id, type: 'topic', title: key[0].toUpperCase() + key.slice(1), summary: `${list.length} related fragments`, text: joined, keywords: keywords(joined), parent: 'root', level: 1 });
      edges.push({ a: 'root', b: id, type: 'hierarchical', weight: 1 });
      list.forEach(node => { node.parent = id; nodes.push(node); edges.push({ a: id, b: node.id, type: 'hierarchical', weight: 1 }); });
    }
    for (let i = 0; i < raw.length; i++) for (let j = i + 1; j < raw.length; j++) {
      const score = similarity(raw[i].keywords, raw[j].keywords);
      if (score >= 0.16) edges.push({ a: raw[i].id, b: raw[j].id, type: 'semantic', weight: score });
    }
    return { format: 'neurocanvas-v3', title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), kind: 'memory', nodes, edges, events: [], audit: [{ time: new Date().toISOString(), action: 'MAP_CREATED', detail: `${nodes.length} nodes generated locally` }] };
  }

  function parseExialLine(line, index) {
    const trimmed = line.trim(); if (!trimmed || !trimmed.startsWith('>>')) return null;
    const version = (trimmed.match(/^>>(\d+)/) || [])[1] || '1';
    const body = trimmed.replace(/^>>\d+\|?/, '');
    const source = ((body.match(/(?:^|\|)S>([^|]+)/) || body.match(/^([^>|]+)>/) || [])[1] || 'unknown').trim();
    const action = ((body.match(/(?:^|\|)A>([^|]+)/) || [])[1] || 'EVENT').trim();
    const payloadRaw = ((body.match(/(?:^|\|)P>(.*)$/) || [])[1] || '').trim();
    let payload = payloadRaw; try { payload = JSON.parse(payloadRaw); } catch {}
    return { id: `event-${index}`, version, source, action, payload, payloadRaw, timestamp: new Date(Date.now() + index).toISOString(), status: 'observed', traceId: `trace-${String(index + 1).padStart(3, '0')}` };
  }

  function buildPulseMap(title, text) {
    const events = text.split(/\r?\n/).map(parseExialLine).filter(Boolean); if (!events.length) throw new Error('No valid ExiaL pulses found.');
    const nodes = [{ id: 'root', type: 'corpus', title, summary: `${events.length} validated pulses`, text, keywords: ['exial', 'pulse', 'audit'], parent: null, level: 0 }], edges = [], actors = new Map();
    const actor = name => {
      if (actors.has(name)) return actors.get(name);
      const id = `actor-${actors.size}`; actors.set(name, id);
      nodes.push({ id, type: name === 'FAPI' ? 'capability' : 'agent', title: name, summary: 'ExiaL actor', text: `Actor: ${name}`, keywords: keywords(name), parent: 'root', level: 1 });
      edges.push({ a: 'root', b: id, type: 'hierarchical', weight: 1 });
      return id;
    };
    events.forEach((event, index) => {
      const from = actor(event.source); let target = 'NeuroCanvas';
      if (event.payload && typeof event.payload === 'object') target = event.payload.to || event.payload.target || event.payload.service || target;
      const to = actor(String(target)), id = `pulse-${index}`;
      nodes.push({ id, type: 'event', title: event.action, summary: `${event.source} → ${target}`, text: event.payloadRaw || JSON.stringify(event.payload), keywords: keywords(`${event.source} ${event.action} ${event.payloadRaw}`), parent: from, level: 2, event });
      edges.push({ a: from, b: id, type: 'pulse-source', weight: 1, eventIndex: index }, { a: id, b: to, type: 'pulse-target', weight: 1, eventIndex: index });
    });
    return { format: 'neurocanvas-v3', title, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), kind: 'pulse', nodes, edges, events, audit: events.map(event => ({ time: event.timestamp, action: event.action, detail: `${event.source}: ${event.payloadRaw}` })) };
  }

  function buildCapabilityMap() {
    const nodes = [{ id: 'root', type: 'corpus', title: 'FAPI Capability Mesh', summary: `${capabilities.length} capability declarations`, text: 'Inspectable capability map. Actions are not executed automatically.', keywords: ['fapi', 'capabilities', 'routing'], parent: null, level: 0 }], edges = [];
    capabilities.forEach((capability, index) => {
      const id = `cap-${index}`;
      nodes.push({ id, type: 'capability', title: capability.name, summary: capability.description, text: JSON.stringify(capability, null, 2), keywords: capability.actions.map(value => value.toLowerCase()), parent: 'root', level: 1, capability });
      edges.push({ a: 'root', b: id, type: 'capability', weight: 1 });
      capability.actions.forEach((action, actionIndex) => {
        const actionId = `action-${index}-${actionIndex}`;
        nodes.push({ id: actionId, type: 'action', title: action, summary: `${capability.name} supports ${action}`, text: `Capability: ${capability.name}\nAction: ${action}\nStatus: ${capability.status}`, keywords: [action.toLowerCase(), capability.status], parent: id, level: 2 });
        edges.push({ a: id, b: actionId, type: 'hierarchical', weight: 1 });
      });
    });
    return { format: 'neurocanvas-v3', title: 'FAPI Capability Mesh', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), kind: 'capability', nodes, edges, events: [], audit: [{ time: new Date().toISOString(), action: 'CAPABILITY_DISCOVERY', detail: 'Loaded local declarations in read-only mode' }] };
  }

  function setView(view) {
    state.view = view;
    ['network', 'tree', 'pulse', 'capability'].forEach(name => document.getElementById(`${name}View`)?.classList.toggle('active', name === view));
    document.getElementById('pulseControls').classList.toggle('hidden', view !== 'pulse');
    layout(); fit();
  }

  function layout() {
    if (!state.map) return;
    const root = state.map.nodes.find(node => node.id === 'root') || state.map.nodes[0];
    const level1 = state.map.nodes.filter(node => node.parent === 'root'); root.x = 0; root.y = 0;
    if (state.view === 'tree') {
      root.x = -470;
      level1.forEach((topic, index) => {
        topic.x = -150; topic.y = (index - (level1.length - 1) / 2) * 150;
        const children = state.map.nodes.filter(node => node.parent === topic.id);
        children.forEach((node, childIndex) => { node.x = 250 + (childIndex % 2) * 180; node.y = topic.y + (childIndex - (children.length - 1) / 2) * 70; });
      });
    } else if (state.view === 'pulse' && state.map.kind === 'pulse') {
      const actors = state.map.nodes.filter(node => ['agent', 'capability'].includes(node.type));
      actors.forEach((node, index) => { node.x = -360 + (index % 3) * 360; node.y = -220 + Math.floor(index / 3) * 280; });
      state.map.nodes.filter(node => node.type === 'event').forEach((node, index) => { const source = state.map.nodes.find(item => item.id === node.parent); node.x = (source?.x || 0) + 120 + (index % 4) * 75; node.y = (source?.y || 0) + 50 + (index % 3) * 55; });
    } else {
      level1.forEach((topic, index) => {
        const angle = index / Math.max(1, level1.length) * Math.PI * 2; topic.x = Math.cos(angle) * 270; topic.y = Math.sin(angle) * 220;
        const children = state.map.nodes.filter(node => node.parent === topic.id);
        children.forEach((node, childIndex) => { const childAngle = angle + (childIndex - (children.length - 1) / 2) * 0.18, radius = 430 + (childIndex % 3) * 55; node.x = Math.cos(childAngle) * radius; node.y = Math.sin(childAngle) * radius * 0.78; });
      });
    }
  }

  function resize() { const rect = canvas.getBoundingClientRect(), ratio = devicePixelRatio || 1; canvas.width = rect.width * ratio; canvas.height = rect.height * ratio; ctx.setTransform(ratio, 0, 0, ratio, 0, 0); draw(); }
  function screen(node) { const rect = canvas.getBoundingClientRect(); return { x: rect.width / 2 + state.x + (node.x || 0) * state.scale, y: rect.height / 2 + state.y + (node.y || 0) * state.scale }; }
  function nodeStyle(node) { if (node.type === 'corpus') return ['#d8aa42', 25]; if (node.type === 'topic') return ['#8d6d27', 16]; if (node.type === 'agent') return ['#5e512e', 17]; if (node.type === 'capability') return ['#7d6427', 18]; if (node.type === 'event') return ['#211b0d', 9]; if (node.type === 'action') return ['#15130e', 8]; if (node.type === 'note') return ['#3d321b', 10]; return ['#201b10', 8]; }

  function draw() {
    const rect = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, rect.width, rect.height); if (!state.map) return;
    state.map.edges.forEach(edge => {
      const a = state.map.nodes.find(node => node.id === edge.a), b = state.map.nodes.find(node => node.id === edge.b); if (!a || !b) return;
      const A = screen(a), B = screen(b), active = Number.isInteger(edge.eventIndex) && edge.eventIndex === state.pulseIndex;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
      ctx.strokeStyle = active ? 'rgba(255,244,198,.95)' : edge.type === 'semantic' ? `rgba(216,170,66,${0.08 + edge.weight * 0.34})` : edge.type.startsWith('pulse') ? 'rgba(216,170,66,.28)' : 'rgba(216,170,66,.2)';
      ctx.lineWidth = active ? 4 : edge.type === 'semantic' ? 1 : 1.4; ctx.stroke();
      if (active) { const x = A.x + (B.x - A.x) * 0.55, y = A.y + (B.y - A.y) * 0.55; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = '#fff3c8'; ctx.fill(); }
    });
    state.map.nodes.forEach(node => {
      const point = screen(node), [fill, base] = nodeStyle(node), radius = base * Math.max(0.75, Math.min(1.4, state.scale));
      const selected = state.selected === node.id, highlighted = state.highlighted.has(node.id), pulse = node.type === 'event' && Number(node.id.split('-')[1]) === state.pulseIndex;
      ctx.beginPath(); ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
      ctx.strokeStyle = selected ? '#fff3c8' : pulse ? '#ffffff' : highlighted ? '#f0d28a' : '#d8aa42'; ctx.lineWidth = selected || highlighted || pulse ? 3 : 1.2; ctx.stroke();
      if (state.scale > 0.62 || node.type !== 'chunk') { ctx.fillStyle = selected || highlighted || pulse ? '#fff3c8' : '#d8d2c3'; ctx.font = `${node.type === 'corpus' ? 14 : ['topic', 'agent', 'capability'].includes(node.type) ? 12 : 10}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(node.title.slice(0, 34), point.x, point.y + radius + 15); }
    });
  }

  function fit() { if (!state.map?.nodes.length) return; const xs = state.map.nodes.map(node => node.x || 0), ys = state.map.nodes.map(node => node.y || 0), rect = canvas.getBoundingClientRect(), width = Math.max(...xs) - Math.min(...xs) + 180, height = Math.max(...ys) - Math.min(...ys) + 180; state.scale = Math.max(0.22, Math.min(1.2, Math.min(rect.width / width, rect.height / height))); state.x = 0; state.y = 0; draw(); }

  function inspect(node) {
    state.selected = node.id;
    const path = []; let current = node;
    while (current) { path.unshift(current.title); current = state.map.nodes.find(item => item.id === current.parent); }
    const extra = node.event ? `<dl><dt>Source</dt><dd>${escapeHtml(node.event.source)}</dd><dt>Action</dt><dd>${escapeHtml(node.event.action)}</dd><dt>Trace</dt><dd>${escapeHtml(node.event.traceId)}</dd><dt>Status</dt><dd>${escapeHtml(node.event.status)}</dd></dl>` : node.capability ? `<dl><dt>Status</dt><dd>${escapeHtml(node.capability.status)}</dd><dt>Actions</dt><dd>${escapeHtml(node.capability.actions.join(', '))}</dd><dt>Execution</dt><dd>Read-only declaration</dd></dl>` : '';
    document.getElementById('details').className = 'details';
    document.getElementById('details').innerHTML = `<div class="type">${escapeHtml(node.type)}</div><h2>${escapeHtml(node.title)}</h2><div class="path">${path.map(escapeHtml).join(' → ')}</div>${extra}<div class="chips">${(node.keywords || []).map(keyword => `<span class="chip">${escapeHtml(keyword)}</span>`).join('')}</div><div class="source">${escapeHtml(node.text || node.summary || '')}</div>`;
    draw(); emit('exovia:selection-changed', { node });
  }

  function updateUI() {
    const map = state.map; document.getElementById('emptyState').classList.toggle('hidden', Boolean(map)); if (!map) return;
    const topics = map.nodes.filter(node => node.type === 'topic').length, evidence = map.nodes.filter(node => ['chunk', 'event', 'action', 'note'].includes(node.type)).length;
    document.getElementById('stats').innerHTML = `<div class="stat"><strong>${map.nodes.length}</strong><span>nodes</span></div><div class="stat"><strong>${map.edges.length}</strong><span>connections</span></div><div class="stat"><strong>${topics || map.events?.length || 0}</strong><span>${map.kind === 'pulse' ? 'pulses' : 'topics'}</span></div><div class="stat"><strong>${evidence}</strong><span>evidence</span></div>`;
    document.getElementById('pulseStatus').textContent = `${map.events?.length || 0} events`;
    document.getElementById('auditTrail').innerHTML = (map.audit || []).slice(-12).reverse().map(item => `<div class="auditItem"><time>${escapeHtml(new Date(item.time).toLocaleTimeString())}</time><strong>${escapeHtml(item.action)}</strong><span>${escapeHtml(item.detail)}</span></div>`).join('');
  }

  function loadMap(map, view) { stopPulses(); state.map = map; state.highlighted.clear(); state.selected = null; state.pulseIndex = -1; setView(view || (map.kind === 'pulse' ? 'pulse' : 'network')); layout(); updateUI(); fit(); emit('exovia:map-changed', { reason: 'load' }); }
  function loadText(title, text) { loadMap(buildMap(title, text), 'network'); }
  function searchMap(query, limit = 6) { if (!state.map) return []; const text = query.trim(); if (!text) return []; const queryKeywords = keywords(text, 8), lower = text.toLowerCase(); return state.map.nodes.filter(node => node.type !== 'corpus').map(node => ({ n: node, s: (String(node.text).toLowerCase().includes(lower) ? 2 : 0) + similarity(queryKeywords, node.keywords || []) + (node.title.toLowerCase().includes(lower) ? 1 : 0) })).filter(result => result.s > 0).sort((a, b) => b.s - a.s).slice(0, limit); }
  function renderResults(results) { state.highlighted = new Set(results.map(result => result.n.id)); document.getElementById('results').innerHTML = results.length ? results.map((result, index) => `<div class="result" data-id="${result.n.id}"><strong>${index + 1}. ${escapeHtml(result.n.title)}</strong><small>${escapeHtml(result.n.type)} · relevance ${result.s.toFixed(2)}</small></div>`).join('') : '<div class="hint">No evidence found in this map.</div>'; document.querySelectorAll('.result').forEach(element => element.onclick = () => focusNode(element.dataset.id)); if (results[0]) focusNode(results[0].n.id); draw(); }
  function search() { renderResults(searchMap(document.getElementById('searchInput').value)); }
  function focusNode(id) { const node = state.map?.nodes.find(item => item.id === id); if (!node) return; state.scale = Math.max(state.scale, 1.15); state.x = -(node.x || 0) * state.scale; state.y = -(node.y || 0) * state.scale; inspect(node); draw(); }
  function hit(x, y) { if (!state.map) return null; for (let index = state.map.nodes.length - 1; index >= 0; index--) { const node = state.map.nodes[index], point = screen(node), radius = nodeStyle(node)[1] + 6; if (Math.hypot(x - point.x, y - point.y) < radius) return node; } return null; }

  function playPulses() { if (!state.map?.events?.length) return; stopPulses(); state.pulseIndex = -1; state.pulseTimer = setInterval(() => { state.pulseIndex++; if (state.pulseIndex >= state.map.events.length) return stopPulses(); const node = state.map.nodes.find(item => item.id === `pulse-${state.pulseIndex}`); if (node) { inspect(node); document.getElementById('pulseStatus').textContent = `${state.pulseIndex + 1}/${state.map.events.length} · ${node.event.action}`; } draw(); }, 850); }
  function stopPulses() { if (state.pulseTimer) clearInterval(state.pulseTimer); state.pulseTimer = null; if (document.getElementById('pulseStatus')) document.getElementById('pulseStatus').textContent = `${state.map?.events?.length || 0} events`; draw(); }

  function parseIntent(text) {
    const result = { map: 'current', query: '', top: 5, threshold: 0.2, evidence: true, errors: [] };
    text.split(/\r?\n/).map(line => line.trim()).filter(Boolean).forEach((line, index) => {
      const [command, ...rest] = line.split(/\s+/), tail = rest.join(' ');
      switch (command.toUpperCase()) {
        case 'MAP': result.map = tail || 'current'; break;
        case 'FIND': { const match = tail.match(/(?:topic:)?["']([^"']+)["']/) || tail.match(/(?:topic:)?(.+)/); result.query = match?.[1]?.trim() || ''; break; }
        case 'FOCUS': { const match = tail.match(/top:(\d+)/i); if (match) result.top = Math.max(1, Math.min(20, Number(match[1]))); else result.errors.push(`Line ${index + 1}: FOCUS requires top:N`); break; }
        case 'LINK': { const match = tail.match(/threshold:([0-9.]+)/i); if (match) result.threshold = Math.max(0, Math.min(1, Number(match[1]))); else result.errors.push(`Line ${index + 1}: LINK requires threshold:N`); break; }
        case 'EXPLAIN': result.evidence = !/false/i.test(tail); break;
        default: result.errors.push(`Line ${index + 1}: unsupported command ${command}`);
      }
    });
    if (!result.query) result.errors.push('FIND query is required'); return result;
  }

  function previewIntent() { const intent = parseIntent(document.getElementById('intentInput').value), preview = document.getElementById('intentPreview'), apply = document.getElementById('applyIntentBtn'); if (intent.errors.length) { state.intentHits = []; preview.textContent = `INVALID INTENT\n${intent.errors.join('\n')}`; apply.disabled = true; return; } const hits = searchMap(intent.query, intent.top); state.intentHits = hits.map(result => result.n.id); preview.textContent = JSON.stringify({ status: 'VALIDATED_PREVIEW', execution: 'none', map: intent.map, operation: 'semantic_focus', query: intent.query, top: intent.top, linkThreshold: intent.threshold, requireEvidence: intent.evidence, affectedNodes: hits.map(result => ({ id: result.n.id, title: result.n.title, score: Number(result.s.toFixed(3)) })) }, null, 2); apply.disabled = !hits.length; }
  function applyIntentFocus() { const results = state.intentHits.map(id => ({ n: state.map.nodes.find(node => node.id === id), s: 1 })).filter(result => result.n); renderResults(results); state.map.audit = state.map.audit || []; state.map.audit.push({ time: new Date().toISOString(), action: 'EXIL_VISUAL_FOCUS', detail: `Applied to ${results.length} nodes; no external execution` }); updateUI(); document.getElementById('intentDialog').close(); emit('exovia:map-changed', { reason: 'intent' }); }

  canvas.addEventListener('mousedown', event => { const node = hit(event.offsetX, event.offsetY); if (node) return inspect(node); state.dragging = true; state.lastX = event.clientX; state.lastY = event.clientY; });
  window.addEventListener('mousemove', event => { if (!state.dragging) return; state.x += event.clientX - state.lastX; state.y += event.clientY - state.lastY; state.lastX = event.clientX; state.lastY = event.clientY; draw(); });
  window.addEventListener('mouseup', () => state.dragging = false);
  canvas.addEventListener('wheel', event => { event.preventDefault(); const old = state.scale; state.scale = Math.max(0.18, Math.min(3.5, state.scale * Math.exp(-event.deltaY * 0.001))); const rect = canvas.getBoundingClientRect(), mouseX = event.clientX - rect.left - rect.width / 2, mouseY = event.clientY - rect.top - rect.height / 2; state.x = mouseX - (mouseX - state.x) * (state.scale / old); state.y = mouseY - (mouseY - state.y) * (state.scale / old); draw(); }, { passive: false });

  document.getElementById('demoBtn').onclick = document.getElementById('emptyDemoBtn').onclick = () => loadText('Exovia NeuroCanvas Workspace', demoText);
  document.getElementById('pulseDemoBtn').onclick = document.getElementById('emptyPulseBtn').onclick = () => loadMap(buildPulseMap('ExiaL Operational Pulse Map', pulseDemo), 'pulse');
  document.getElementById('pasteBtn').onclick = () => document.getElementById('pasteDialog').showModal();
  document.getElementById('intentBtn').onclick = () => document.getElementById('intentDialog').showModal();
  document.getElementById('previewIntentBtn').onclick = previewIntent;
  document.getElementById('applyIntentBtn').onclick = applyIntentFocus;
  document.getElementById('buildBtn').onclick = event => { const text = document.getElementById('textInput').value.trim(); if (!text) return; event.preventDefault(); try { if (text.split(/\r?\n/).some(line => line.trim().startsWith('>>'))) loadMap(buildPulseMap(document.getElementById('docTitle').value || 'ExiaL map', text), 'pulse'); else loadText(document.getElementById('docTitle').value || 'Knowledge map', text); document.getElementById('pasteDialog').close(); } catch (error) { alert(error.message); } };
  document.getElementById('fileInput').onchange = async event => { const file = event.target.files[0]; if (!file) return; const text = await file.text(); try { if (file.name.endsWith('.json')) loadMap(JSON.parse(text)); else if (/\.(exial|log)$/i.test(file.name) || text.split(/\r?\n/).some(line => line.trim().startsWith('>>'))) loadMap(buildPulseMap(file.name, text), 'pulse'); else loadText(file.name.replace(/\.[^.]+$/, ''), text); } catch (error) { alert(`Unable to load file: ${error.message}`); } finally { event.target.value = ''; } };
  document.getElementById('exportBtn').onclick = () => { if (!state.map) return; const blob = new Blob([JSON.stringify(state.map, null, 2)], { type: 'application/json' }), anchor = document.createElement('a'); anchor.href = URL.createObjectURL(blob); anchor.download = `${state.map.kind || 'map'}-exovia-neurocanvas.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(anchor.href), 0); };
  document.getElementById('fitBtn').onclick = fit;
  document.getElementById('searchBtn').onclick = search;
  document.getElementById('searchInput').onkeydown = event => { if (event.key === 'Enter') search(); };
  document.getElementById('networkView').onclick = () => setView('network');
  document.getElementById('treeView').onclick = () => setView('tree');
  document.getElementById('pulseView').onclick = () => state.map?.kind === 'pulse' ? setView('pulse') : loadMap(buildPulseMap('ExiaL Operational Pulse Map', pulseDemo), 'pulse');
  document.getElementById('capabilityView').onclick = () => loadMap(buildCapabilityMap(), 'capability');
  document.getElementById('playPulsesBtn').onclick = playPulses;
  document.getElementById('stopPulsesBtn').onclick = stopPulses;

  window.ExoviaRuntime = {
    getMap: () => state.map,
    loadMap,
    getSelectedNode: () => state.map?.nodes.find(node => node.id === state.selected) || null,
    getView: () => state.view,
    setView,
    searchMap,
    focusNode,
    refresh: () => { layout(); updateUI(); fit(); emit('exovia:map-changed', { reason: 'refresh' }); }
  };

  window.addEventListener('resize', resize); resize();
})();