(() => {
  'use strict';

  const FORMAT = 'exo-capability-pack-v1';

  function safeArray(value) { return Array.isArray(value) ? value : []; }
  function safeText(value) { return typeof value === 'string' ? value : JSON.stringify(value ?? '', null, 2); }
  function keywords(value) {
    return [...new Set((safeText(value).toLowerCase().match(/[a-záéíóúñü0-9_-]{3,}/g) || []))].slice(0, 10);
  }

  function edge(a, b, type = 'hierarchical') { return { a, b, type, weight: 1 }; }

  function toNeuroCanvas(exo) {
    if (!exo || exo.format !== FORMAT) throw new Error(`Unsupported EXO format. Expected ${FORMAT}.`);
    const nodes = [];
    const edges = [];
    const rootId = 'root';
    const title = exo.title || 'EXO capability pack';

    nodes.push({
      id: rootId,
      type: 'corpus',
      title,
      summary: `${safeArray(exo.sources).length} sources · ${safeArray(exo.chunks).length} on-demand chunks`,
      text: safeText({
        objective: exo.objective,
        progressiveDisclosure: exo.progressiveDisclosure,
        evidenceRules: exo.evidenceRules,
        privacy: exo.privacy,
        integrity: exo.integrity,
      }),
      keywords: keywords(`${title} ${exo.objective || ''} EXO capability evidence`),
      parent: null,
      level: 0,
      exoManifest: exo.manifest || {},
    });

    for (const source of safeArray(exo.sources)) {
      const sourceId = `exo-${source.id}`;
      nodes.push({
        id: sourceId,
        type: 'source',
        title: source.title || source.id,
        summary: source.summary || `${safeArray(source.chunkIds).length} chunks`,
        text: safeText(source),
        keywords: keywords(`${source.title || ''} ${source.summary || ''}`),
        parent: rootId,
        level: 1,
        sourceRef: source.id,
      });
      edges.push(edge(rootId, sourceId, 'contains-source'));
    }

    for (const chunk of safeArray(exo.chunks)) {
      const id = `exo-${chunk.id}`;
      const parent = `exo-${chunk.sourceId}`;
      nodes.push({
        id,
        type: 'evidence',
        title: chunk.title || chunk.id,
        summary: safeText(chunk.text).slice(0, 180),
        text: safeText(chunk.text),
        keywords: safeArray(chunk.keywords).length ? chunk.keywords : keywords(chunk.text),
        parent,
        level: 2,
        sourceRef: chunk.sourceId,
        chunkRef: chunk.id,
        contentHash: chunk.contentHash || null,
      });
      edges.push(edge(parent, id, 'contains-evidence'));
    }

    const groups = [
      ['exo-procedures', 'Procedures', 'procedure', safeArray(exo.procedures)],
      ['exo-constraints', 'Constraints', 'constraint', safeArray(exo.constraints)],
      ['exo-glossary', 'Glossary', 'concept', safeArray(exo.glossary).map(item => typeof item === 'string' ? item : `${item.term}: ${item.count}`)],
      ['exo-allowed', 'Allowed actions', 'action', safeArray(exo.capability?.allowedActions)],
      ['exo-prohibited', 'Prohibited actions', 'policy', safeArray(exo.capability?.prohibitedActions)],
    ];

    for (const [groupId, groupTitle, type, items] of groups) {
      if (!items.length) continue;
      nodes.push({ id: groupId, type: 'topic', title: groupTitle, summary: `${items.length} items`, text: items.join('\n'), keywords: keywords(items.join(' ')), parent: rootId, level: 1 });
      edges.push(edge(rootId, groupId));
      items.forEach((item, index) => {
        const id = `${groupId}-${index + 1}`;
        nodes.push({ id, type, title: safeText(item).slice(0, 90), summary: safeText(item), text: safeText(item), keywords: keywords(item), parent: groupId, level: 2 });
        edges.push(edge(groupId, id));
      });
    }

    return {
      format: 'neurocanvas-v3',
      title,
      createdAt: exo.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      kind: 'capability',
      nodes,
      edges,
      events: [],
      audit: [{
        time: new Date().toISOString(),
        action: 'EXO_CAPABILITY_PACK_IMPORTED',
        detail: `${nodes.length} nodes imported; integrity ${exo.integrity?.algorithm || 'unknown'}:${exo.integrity?.hash || 'not supplied'}`,
      }],
      exo: {
        format: exo.format,
        integrity: exo.integrity || null,
        progressiveDisclosure: exo.progressiveDisclosure || null,
        privacy: exo.privacy || null,
      },
    };
  }

  function installImporter() {
    const input = document.getElementById('fileInput');
    if (!input || input.dataset.exoReady) return;
    input.dataset.exoReady = 'true';
    if (!input.accept.includes('.exo')) input.accept = `${input.accept},.exo`;
    const original = input.onchange;

    input.onchange = async event => {
      const file = event.target.files?.[0];
      if (!file || !/\.exo$/i.test(file.name)) return original?.call(input, event);
      try {
        const parsed = JSON.parse(await file.text());
        const map = toNeuroCanvas(parsed);
        window.ExoviaRuntime?.loadMap?.(map, 'network');
        window.ExoviaNotify?.(`EXO pack imported: ${map.nodes.length} inspectable nodes.`, 'success');
      } catch (error) {
        window.ExoviaNotify?.(`Unable to import EXO pack: ${error.message}`, 'error');
        if (!window.ExoviaNotify) alert(`Unable to import EXO pack: ${error.message}`);
      } finally {
        event.target.value = '';
      }
    };
  }

  window.ExoviaExoPack = { format: FORMAT, toNeuroCanvas, installImporter };
  window.addEventListener('DOMContentLoaded', installImporter);
  installImporter();
})();
