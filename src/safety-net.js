(() => {
  'use strict';

  const MAX_HISTORY = 20;
  const SAVE_DELAY_MS = 2800;
  const clone = value => JSON.parse(JSON.stringify(value));
  const $ = id => document.getElementById(id);
  let undoStack = [];
  let redoStack = [];
  let lastFingerprint = '';
  let restoring = false;
  let saveTimer = null;

  function runtimeMap() {
    return window.ExoviaRuntime?.getMap?.() || null;
  }

  function fingerprint(map) {
    if (!map) return '';
    return JSON.stringify({
      title: map.title,
      nodes: map.nodes,
      edges: map.edges,
      events: map.events,
      audit: map.audit
    });
  }

  function setStatus(state, message) {
    const host = $('safeSaveStatus');
    if (!host) return;
    host.dataset.state = state;
    host.querySelector('strong').textContent = message;
    const detail = host.querySelector('span');
    if (state === 'saved') detail.textContent = `Stored in this browser · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (state === 'saving') detail.textContent = 'Please keep this tab open for a moment.';
    if (state === 'error') detail.textContent = 'Use Save or Export to protect your work.';
    if (state === 'idle') detail.textContent = 'Create or open a project to begin.';
  }

  function updateButtons() {
    const undo = $('safeUndoBtn');
    const redo = $('safeRedoBtn');
    if (undo) undo.disabled = undoStack.length < 2;
    if (redo) redo.disabled = redoStack.length === 0;
  }

  function rememberCurrent() {
    if (restoring) return;
    const map = runtimeMap();
    if (!map) return;
    const nextFingerprint = fingerprint(map);
    if (!nextFingerprint || nextFingerprint === lastFingerprint) return;
    undoStack.push({ map: clone(map), view: window.ExoviaRuntime?.getView?.() || 'network' });
    if (undoStack.length > MAX_HISTORY) undoStack.shift();
    redoStack = [];
    lastFingerprint = nextFingerprint;
    updateButtons();
  }

  async function saveNow(reason = 'automatic safety save') {
    const map = runtimeMap();
    if (!map) return setStatus('idle', 'Nothing to save yet');
    clearTimeout(saveTimer);
    setStatus('saving', 'Saving automatically…');
    try {
      if (!window.ExoviaWorkspace?.saveCurrent) throw new Error('Local workspace is not ready.');
      await window.ExoviaWorkspace.saveCurrent({ reason });
      setStatus('saved', 'All changes saved');
    } catch (error) {
      console.error(error);
      setStatus('error', 'Automatic save needs attention');
    }
  }

  function scheduleSave() {
    clearTimeout(saveTimer);
    setStatus('saving', 'Saving automatically…');
    saveTimer = setTimeout(() => saveNow(), SAVE_DELAY_MS);
  }

  function restoreEntry(entry, action) {
    if (!entry || !window.ExoviaRuntime?.loadMap) return;
    restoring = true;
    window.ExoviaRuntime.loadMap(clone(entry.map), entry.view || 'network');
    lastFingerprint = fingerprint(entry.map);
    restoring = false;
    entry.map.audit ||= [];
    entry.map.audit.push({ time: new Date().toISOString(), action, detail: 'Restored from the session safety history.' });
    updateButtons();
    scheduleSave();
  }

  function undo() {
    if (undoStack.length < 2) return;
    const current = undoStack.pop();
    redoStack.push(current);
    restoreEntry(undoStack[undoStack.length - 1], 'UNDO_APPLIED');
  }

  function redo() {
    if (!redoStack.length) return;
    const entry = redoStack.pop();
    undoStack.push(entry);
    restoreEntry(entry, 'REDO_APPLIED');
  }

  async function safeExportReminder() {
    const map = runtimeMap();
    if (!map) return;
    await saveNow('before export reminder');
    window.ExoviaNotify?.('Saved locally. Export creates a second portable backup.', 'success');
  }

  function buildUi() {
    if ($('safeSaveStatus')) return;
    const status = document.createElement('div');
    status.id = 'safeSaveStatus';
    status.className = 'safeSaveStatus';
    status.dataset.state = 'idle';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.innerHTML = '<span class="safeDot" aria-hidden="true"></span><div><strong>Nothing to save yet</strong><span>Create or open a project to begin.</span></div>';
    document.querySelector('.canvasWrap')?.append(status);

    const tools = document.querySelector('.canvasTools');
    if (tools) {
      const undo = document.createElement('button');
      undo.id = 'safeUndoBtn';
      undo.type = 'button';
      undo.textContent = '↶ Undo';
      undo.title = 'Undo the last change in this session';
      undo.disabled = true;
      const redo = document.createElement('button');
      redo.id = 'safeRedoBtn';
      redo.type = 'button';
      redo.textContent = '↷ Redo';
      redo.title = 'Restore the change you just undid';
      redo.disabled = true;
      tools.prepend(redo);
      tools.prepend(undo);
      undo.addEventListener('click', undo);
      redo.addEventListener('click', redo);
    }

    $('exportBtn')?.addEventListener('click', safeExportReminder, { capture: true });
    document.addEventListener('keydown', event => {
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) return;
      if (event.key.toLowerCase() === 'z' && !event.shiftKey) { event.preventDefault(); undo(); }
      if ((event.key.toLowerCase() === 'y') || (event.key.toLowerCase() === 'z' && event.shiftKey)) { event.preventDefault(); redo(); }
    });

    window.addEventListener('exovia:map-changed', () => {
      rememberCurrent();
      scheduleSave();
    });
    setTimeout(() => { rememberCurrent(); if (runtimeMap()) setStatus('saved', 'Project ready'); }, 700);
  }

  window.ExoviaSafetyNet = {
    undo,
    redo,
    saveNow,
    getState: () => ({ undo: undoStack.length, redo: redoStack.length, status: $('safeSaveStatus')?.dataset.state || 'missing' })
  };
  window.addEventListener('DOMContentLoaded', buildUi);
})();