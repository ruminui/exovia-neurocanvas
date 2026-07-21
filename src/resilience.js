(() => {
  'use strict';

  const RECOVERY_KEY = 'exovia:emergencyRecovery';
  const SESSION_ID = `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const CHANNEL_NAME = 'exovia-neurocanvas-session';
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  let channel = null;
  let otherSessionSeenAt = 0;
  let recoveryTimer = null;

  function runtimeMap() { return window.ExoviaRuntime?.getMap?.() || null; }
  function notify(message, kind = 'info') { window.ExoviaNotify?.(message, kind); }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])); }

  function saveEmergencyRecovery() {
    const map = runtimeMap();
    if (!map) return;
    try {
      localStorage.setItem(RECOVERY_KEY, JSON.stringify({ savedAt: new Date().toISOString(), map: clone(map), view: window.ExoviaRuntime?.getView?.() || 'network' }));
    } catch (error) {
      console.warn('Emergency recovery unavailable', error);
    }
  }

  function clearEmergencyRecovery() {
    try { localStorage.removeItem(RECOVERY_KEY); } catch {}
  }

  function scheduleEmergencyRecovery() {
    clearTimeout(recoveryTimer);
    recoveryTimer = setTimeout(saveEmergencyRecovery, 1200);
  }

  function recoveryRecord() {
    try { return JSON.parse(localStorage.getItem(RECOVERY_KEY) || 'null'); } catch { return null; }
  }

  function offerRecovery() {
    const record = recoveryRecord();
    if (!record?.map?.nodes?.length || runtimeMap()) return;
    const dialog = $('recoveryDialog');
    $('recoveryTime').textContent = new Date(record.savedAt).toLocaleString();
    dialog.showModal();
  }

  function restoreRecovery() {
    const record = recoveryRecord();
    if (!record || !window.ExoviaRuntime?.loadMap) return;
    const map = clone(record.map);
    map.audit ||= [];
    map.audit.push({ time: new Date().toISOString(), action: 'EMERGENCY_RECOVERY_RESTORED', detail: 'Recovered from local emergency copy.' });
    window.ExoviaRuntime.loadMap(map, record.view || 'network');
    $('recoveryDialog').close();
    notify('Recovery copy restored. Save or Export to keep it.', 'success');
  }

  function dismissRecovery() {
    clearEmergencyRecovery();
    $('recoveryDialog').close();
  }

  function renderAccessibleList() {
    const host = $('accessibleGraphList');
    const map = runtimeMap();
    if (!map) {
      host.innerHTML = '<p>No project is open.</p>';
      return;
    }
    const nodeById = new Map(map.nodes.map(node => [node.id, node]));
    const children = new Map();
    map.nodes.forEach(node => {
      const parent = node.parent || '__root__';
      if (!children.has(parent)) children.set(parent, []);
      children.get(parent).push(node);
    });
    const roots = map.nodes.filter(node => !node.parent || !nodeById.has(node.parent));
    const seen = new Set();
    const renderNode = (node, depth = 0) => {
      if (seen.has(node.id)) return '';
      seen.add(node.id);
      const related = map.edges.filter(edge => edge.a === node.id || edge.b === node.id).length;
      const nested = (children.get(node.id) || []).map(child => renderNode(child, depth + 1)).join('');
      return `<li style="--depth:${Math.min(depth, 8)}"><button type="button" data-node-id="${escapeHtml(node.id)}"><strong>${escapeHtml(node.title || 'Untitled idea')}</strong><span>${escapeHtml(node.summary || node.text || 'No description yet.')}</span><small>${related} relations · ${escapeHtml(node.type || 'idea')}</small></button>${nested ? `<ul>${nested}</ul>` : ''}</li>`;
    };
    const ordered = roots.map(node => renderNode(node)).join('');
    const leftovers = map.nodes.filter(node => !seen.has(node.id)).map(node => renderNode(node)).join('');
    host.innerHTML = `<p class="accessibleListIntro">${map.nodes.length} ideas. Select one to inspect its original information.</p><ul>${ordered}${leftovers}</ul>`;
    host.querySelectorAll('[data-node-id]').forEach(button => button.addEventListener('click', () => {
      const id = button.dataset.nodeId;
      window.ExoviaRuntime?.selectNode?.(id);
      const node = nodeById.get(id);
      notify(`Selected ${node?.title || 'idea'}.`, 'success');
    }));
  }

  function openAccessibleList() {
    renderAccessibleList();
    $('accessibleListDialog').showModal();
  }

  function showMultiTabWarning() {
    otherSessionSeenAt = Date.now();
    const warning = $('multiTabWarning');
    if (!warning) return;
    warning.hidden = false;
    warning.querySelector('strong').textContent = 'This project may be open in another tab.';
    warning.querySelector('span').textContent = 'Save a separate Export copy before continuing in both places.';
  }

  function setupMultiTab() {
    if (!('BroadcastChannel' in window)) return;
    channel = new BroadcastChannel(CHANNEL_NAME);
    channel.onmessage = event => {
      const message = event.data || {};
      if (message.sessionId === SESSION_ID) return;
      if (message.type === 'HELLO') {
        showMultiTabWarning();
        channel.postMessage({ type: 'HELLO_ACK', sessionId: SESSION_ID, at: Date.now() });
      }
      if (message.type === 'HELLO_ACK' || message.type === 'MAP_CHANGED') showMultiTabWarning();
    };
    channel.postMessage({ type: 'HELLO', sessionId: SESSION_ID, at: Date.now() });
    window.addEventListener('exovia:map-changed', () => channel?.postMessage({ type: 'MAP_CHANGED', sessionId: SESSION_ID, at: Date.now() }));
    window.addEventListener('beforeunload', () => channel?.close());
  }

  function supportReport() {
    const map = runtimeMap();
    const report = {
      generatedAt: new Date().toISOString(),
      application: 'Exovia NeuroCanvas',
      location: location.origin + location.pathname,
      language: document.documentElement.lang,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      serviceWorkerControlled: Boolean(navigator.serviceWorker?.controller),
      storage: {
        localStorageAvailable: (() => { try { localStorage.setItem('exovia:probe', '1'); localStorage.removeItem('exovia:probe'); return true; } catch { return false; } })(),
        indexedDbAvailable: 'indexedDB' in window
      },
      project: map ? {
        format: map.format,
        nodeCount: map.nodes?.length || 0,
        edgeCount: map.edges?.length || 0,
        approximateBytes: new Blob([JSON.stringify(map)]).size
      } : null,
      safety: {
        emergencyRecoveryPresent: Boolean(recoveryRecord()),
        anotherTabRecentlySeen: Date.now() - otherSessionSeenAt < 30000,
        simpleMode: window.ExoviaSimpleMode?.isEnabled?.() || false,
        safetyNet: window.ExoviaSafetyNet?.getState?.() || null
      },
      privacy: 'This report intentionally excludes project titles, text, node contents, tokens, local paths and personal identifiers.'
    };
    return report;
  }

  function downloadSupportReport() {
    const report = supportReport();
    const blob = new Blob([`${JSON.stringify(report, null, 2)}\n`], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `exovia-support-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    notify('Privacy-safe support report created.', 'success');
  }

  function buildUi() {
    if ($('accessibilityListBtn')) return;
    const toolbar = document.querySelector('.toolbar');
    toolbar?.insertAdjacentHTML('afterbegin', '<button id="accessibilityListBtn" type="button" title="Open a keyboard and screen-reader friendly list">List view</button><button id="supportReportBtn" type="button" title="Create a privacy-safe technical report">Help report</button>');
    document.querySelector('.canvasWrap')?.insertAdjacentHTML('afterbegin', '<div id="multiTabWarning" class="multiTabWarning" role="alert" hidden><strong></strong><span></span><button type="button" aria-label="Dismiss warning">×</button></div>');
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="accessibleListDialog" class="accessibleListDialog" aria-labelledby="accessibleListTitle">
        <div class="resilienceHead"><div><small>ACCESSIBLE ALTERNATIVE</small><h2 id="accessibleListTitle">Ideas as a list</h2></div><button type="button" data-close="accessibleListDialog" aria-label="Close list">×</button></div>
        <div id="accessibleGraphList" class="accessibleGraphList"></div>
      </dialog>
      <dialog id="recoveryDialog" class="recoveryDialog" aria-labelledby="recoveryTitle">
        <div class="resilienceHead"><div><small>LOCAL SAFETY COPY</small><h2 id="recoveryTitle">Recover previous work?</h2></div></div>
        <p>NeuroCanvas found a local recovery copy from <strong id="recoveryTime"></strong>.</p>
        <p>Restoring it does not delete the copy. Save or Export after checking it.</p>
        <div class="dialogActions"><button id="discardRecoveryBtn" type="button">Discard copy</button><button id="restoreRecoveryBtn" type="button">Restore work</button></div>
      </dialog>`);
    $('accessibilityListBtn').addEventListener('click', openAccessibleList);
    $('supportReportBtn').addEventListener('click', downloadSupportReport);
    $('multiTabWarning').querySelector('button').addEventListener('click', () => { $('multiTabWarning').hidden = true; });
    $('restoreRecoveryBtn').addEventListener('click', restoreRecovery);
    $('discardRecoveryBtn').addEventListener('click', dismissRecovery);
    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close)?.close()));
    window.addEventListener('exovia:map-changed', scheduleEmergencyRecovery);
    window.addEventListener('exovia:safe-saved', clearEmergencyRecovery);
    setTimeout(offerRecovery, 900);
    setupMultiTab();
  }

  window.ExoviaResilience = { saveEmergencyRecovery, clearEmergencyRecovery, restoreRecovery, openAccessibleList, supportReport, downloadSupportReport };
  window.addEventListener('DOMContentLoaded', buildUi, { once: true });
})();
