(() => {
  'use strict';

  const DB_NAME = 'exovia-neurocanvas';
  const DB_VERSION = 1;
  const STORE_PROJECTS = 'projects';
  const STORE_SNAPSHOTS = 'snapshots';
  const AUTOSAVE_MS = 2500;
  let db = null;
  let saveTimer = null;
  let activeProjectId = null;

  const $ = id => document.getElementById(id);
  const now = () => new Date().toISOString();
  const uid = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const clone = value => JSON.parse(JSON.stringify(value));

  function openDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(STORE_PROJECTS)) {
          const projects = database.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
          projects.createIndex('updatedAt', 'updatedAt');
        }
        if (!database.objectStoreNames.contains(STORE_SNAPSHOTS)) {
          const snapshots = database.createObjectStore(STORE_SNAPSHOTS, { keyPath: 'id' });
          snapshots.createIndex('projectId', 'projectId');
          snapshots.createIndex('createdAt', 'createdAt');
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  function tx(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      let request;
      try { request = operation(store); } catch (error) { reject(error); return; }
      transaction.oncomplete = () => resolve(request?.result);
      transaction.onerror = () => reject(transaction.error || request?.error);
      transaction.onabort = () => reject(transaction.error || new Error('Database transaction aborted'));
    });
  }

  async function all(storeName) {
    return tx(storeName, 'readonly', store => store.getAll());
  }

  async function put(storeName, value) {
    return tx(storeName, 'readwrite', store => store.put(value));
  }

  async function remove(storeName, key) {
    return tx(storeName, 'readwrite', store => store.delete(key));
  }

  function getRuntimeMap() {
    return window.ExoviaRuntime?.getMap?.() || null;
  }

  function setRuntimeMap(map, view) {
    if (window.ExoviaRuntime?.loadMap) {
      window.ExoviaRuntime.loadMap(clone(map), view);
      return true;
    }
    return false;
  }

  function notify(message, kind = 'info') {
    if (window.ExoviaNotify) return window.ExoviaNotify(message, kind);
    const el = $('productStatus');
    if (el) {
      el.textContent = message;
      el.dataset.kind = kind;
    }
  }

  function normalizeMap(map) {
    if (!map || typeof map !== 'object') throw new Error('Project map must be an object.');
    if (!Array.isArray(map.nodes) || !Array.isArray(map.edges)) throw new Error('Project requires nodes and edges arrays.');
    const ids = new Set();
    map.nodes.forEach((node, index) => {
      if (!node || typeof node !== 'object') throw new Error(`Invalid node at position ${index}.`);
      node.id = String(node.id || uid('node'));
      if (ids.has(node.id)) throw new Error(`Duplicate node id: ${node.id}`);
      ids.add(node.id);
      node.title = String(node.title || 'Untitled node');
      node.text = String(node.text || node.summary || '');
      node.summary = String(node.summary || node.text.slice(0, 160));
      node.keywords = Array.isArray(node.keywords) ? node.keywords.map(String) : [];
      node.type = String(node.type || 'chunk');
      node.parent = node.parent == null ? null : String(node.parent);
    });
    map.edges = map.edges.filter(edge => edge && ids.has(String(edge.a)) && ids.has(String(edge.b))).map(edge => ({
      a: String(edge.a), b: String(edge.b), type: String(edge.type || 'semantic'), weight: Number.isFinite(Number(edge.weight)) ? Number(edge.weight) : 1
    }));
    map.title = String(map.title || 'Untitled NeuroCanvas project');
    map.format = 'neurocanvas-v3';
    map.updatedAt = now();
    map.audit = Array.isArray(map.audit) ? map.audit : [];
    map.events = Array.isArray(map.events) ? map.events : [];
    return map;
  }

  async function saveCurrent({ snapshot = false, reason = 'manual' } = {}) {
    const map = getRuntimeMap();
    if (!map) return notify('Open or create a map before saving.', 'warn');
    const normalized = normalizeMap(clone(map));
    activeProjectId ||= normalized.projectId || uid('project');
    normalized.projectId = activeProjectId;
    const record = {
      id: activeProjectId,
      title: normalized.title,
      kind: normalized.kind || 'memory',
      createdAt: normalized.createdAt || now(),
      updatedAt: now(),
      nodeCount: normalized.nodes.length,
      edgeCount: normalized.edges.length,
      map: normalized
    };
    await put(STORE_PROJECTS, record);
    if (snapshot) {
      await put(STORE_SNAPSHOTS, {
        id: uid('snapshot'), projectId: activeProjectId, createdAt: now(), reason, title: normalized.title, map: clone(normalized)
      });
      await pruneSnapshots(activeProjectId);
    }
    localStorage.setItem('exovia:lastProjectId', activeProjectId);
    renderProjectLibrary();
    renderHealth();
    notify(snapshot ? 'Project saved with recovery snapshot.' : 'Project saved locally.', 'success');
  }

  function scheduleAutosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveCurrent({ reason: 'autosave' }).catch(error => notify(error.message, 'error')), AUTOSAVE_MS);
  }

  async function pruneSnapshots(projectId) {
    const records = (await all(STORE_SNAPSHOTS)).filter(item => item.projectId === projectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    await Promise.all(records.slice(12).map(item => remove(STORE_SNAPSHOTS, item.id)));
  }

  async function loadProject(id) {
    const record = await tx(STORE_PROJECTS, 'readonly', store => store.get(id));
    if (!record) throw new Error('Project not found.');
    activeProjectId = id;
    setRuntimeMap(record.map, record.kind === 'pulse' ? 'pulse' : 'network');
    localStorage.setItem('exovia:lastProjectId', id);
    renderProjectLibrary();
    renderSnapshots();
    renderHealth();
    notify(`Opened “${record.title}”.`, 'success');
  }

  async function deleteProject(id) {
    const record = await tx(STORE_PROJECTS, 'readonly', store => store.get(id));
    if (!record || !confirm(`Delete “${record.title}” from this browser?`)) return;
    await remove(STORE_PROJECTS, id);
    const snapshots = (await all(STORE_SNAPSHOTS)).filter(item => item.projectId === id);
    await Promise.all(snapshots.map(item => remove(STORE_SNAPSHOTS, item.id)));
    if (activeProjectId === id) activeProjectId = null;
    renderProjectLibrary();
    renderSnapshots();
    notify('Local project deleted.', 'success');
  }

  async function duplicateProject(id) {
    const record = await tx(STORE_PROJECTS, 'readonly', store => store.get(id));
    if (!record) return;
    const copy = clone(record);
    copy.id = uid('project');
    copy.title = `${record.title} — Copy`;
    copy.createdAt = now();
    copy.updatedAt = now();
    copy.map.projectId = copy.id;
    copy.map.title = copy.title;
    await put(STORE_PROJECTS, copy);
    renderProjectLibrary();
    notify('Project duplicated.', 'success');
  }

  async function renderProjectLibrary() {
    const host = $('projectLibrary');
    if (!host || !db) return;
    const projects = (await all(STORE_PROJECTS)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    host.innerHTML = projects.length ? projects.map(project => `
      <article class="projectRow ${project.id === activeProjectId ? 'active' : ''}" data-project-id="${project.id}">
        <button class="projectOpen" type="button">
          <strong>${escapeHtml(project.title)}</strong>
          <span>${project.nodeCount} nodes · ${new Date(project.updatedAt).toLocaleString()}</span>
        </button>
        <button class="projectMore" type="button" data-action="duplicate" aria-label="Duplicate project">⧉</button>
        <button class="projectMore" type="button" data-action="delete" aria-label="Delete project">×</button>
      </article>`).join('') : '<p class="productEmpty">Saved projects will appear here.</p>';
    host.querySelectorAll('.projectRow').forEach(row => {
      const id = row.dataset.projectId;
      row.querySelector('.projectOpen').addEventListener('click', () => loadProject(id).catch(error => notify(error.message, 'error')));
      row.querySelector('[data-action="duplicate"]').addEventListener('click', () => duplicateProject(id));
      row.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProject(id));
    });
  }

  async function renderSnapshots() {
    const host = $('snapshotList');
    if (!host || !db || !activeProjectId) return host && (host.innerHTML = '<p class="productEmpty">Save a project to enable recovery snapshots.</p>');
    const snapshots = (await all(STORE_SNAPSHOTS)).filter(item => item.projectId === activeProjectId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    host.innerHTML = snapshots.length ? snapshots.map(item => `
      <button class="snapshotRow" type="button" data-snapshot-id="${item.id}">
        <strong>${escapeHtml(item.reason)}</strong><span>${new Date(item.createdAt).toLocaleString()}</span>
      </button>`).join('') : '<p class="productEmpty">No recovery snapshots yet.</p>';
    host.querySelectorAll('.snapshotRow').forEach(button => button.addEventListener('click', async () => {
      const snapshot = await tx(STORE_SNAPSHOTS, 'readonly', store => store.get(button.dataset.snapshotId));
      if (!snapshot || !confirm('Restore this snapshot? Current unsaved changes will be replaced.')) return;
      setRuntimeMap(snapshot.map, snapshot.map.kind === 'pulse' ? 'pulse' : 'network');
      notify('Snapshot restored. Save to keep it as the active version.', 'success');
    }));
  }

  function renderHealth() {
    const host = $('projectHealth');
    const map = getRuntimeMap();
    if (!host) return;
    if (!map) return host.innerHTML = '<p class="productEmpty">No active project.</p>';
    const nodeIds = new Set(map.nodes.map(node => node.id));
    const orphanNodes = map.nodes.filter(node => node.parent && !nodeIds.has(node.parent)).length;
    const brokenEdges = map.edges.filter(edge => !nodeIds.has(edge.a) || !nodeIds.has(edge.b)).length;
    const emptyEvidence = map.nodes.filter(node => node.type !== 'corpus' && !String(node.text || '').trim()).length;
    host.innerHTML = `
      <div class="healthGrid">
        <div><strong>${map.nodes.length}</strong><span>Nodes</span></div>
        <div><strong>${map.edges.length}</strong><span>Edges</span></div>
        <div><strong>${orphanNodes}</strong><span>Orphans</span></div>
        <div><strong>${emptyEvidence + brokenEdges}</strong><span>Warnings</span></div>
      </div>`;
  }

  function editSelectedNode() {
    const selected = window.ExoviaRuntime?.getSelectedNode?.();
    if (!selected) return notify('Select a node first.', 'warn');
    $('nodeEditId').value = selected.id;
    $('nodeEditTitle').value = selected.title || '';
    $('nodeEditType').value = selected.type || 'chunk';
    $('nodeEditKeywords').value = (selected.keywords || []).join(', ');
    $('nodeEditText').value = selected.text || '';
    $('nodeEditorDialog').showModal();
  }

  function saveNodeEdit() {
    const map = getRuntimeMap();
    const id = $('nodeEditId').value;
    const node = map?.nodes.find(item => item.id === id);
    if (!node) return;
    node.title = $('nodeEditTitle').value.trim() || 'Untitled node';
    node.type = $('nodeEditType').value.trim() || 'chunk';
    node.keywords = $('nodeEditKeywords').value.split(',').map(item => item.trim()).filter(Boolean);
    node.text = $('nodeEditText').value;
    node.summary = node.text.slice(0, 160);
    map.audit = map.audit || [];
    map.audit.push({ time: now(), action: 'NODE_UPDATED', detail: `${node.id}: ${node.title}` });
    setRuntimeMap(map, window.ExoviaRuntime?.getView?.());
    $('nodeEditorDialog').close();
    scheduleAutosave();
    notify('Node updated.', 'success');
  }

  function addNode() {
    const map = getRuntimeMap();
    if (!map) return notify('Open a project first.', 'warn');
    const selected = window.ExoviaRuntime?.getSelectedNode?.();
    const parent = selected?.id || 'root';
    const node = {
      id: uid('node'), type: 'note', title: 'New note', summary: 'Editable knowledge node', text: '', keywords: ['note'], parent, level: (selected?.level || 0) + 1,
      x: (selected?.x || 0) + 150, y: (selected?.y || 0) + 80
    };
    map.nodes.push(node);
    map.edges.push({ a: parent, b: node.id, type: 'hierarchical', weight: 1 });
    map.audit = map.audit || [];
    map.audit.push({ time: now(), action: 'NODE_CREATED', detail: `${node.id} under ${parent}` });
    setRuntimeMap(map, window.ExoviaRuntime?.getView?.());
    scheduleAutosave();
    notify('New editable node created.', 'success');
  }

  function deleteSelectedNode() {
    const map = getRuntimeMap();
    const selected = window.ExoviaRuntime?.getSelectedNode?.();
    if (!map || !selected || selected.id === 'root') return notify('Select a non-root node to delete.', 'warn');
    if (!confirm(`Delete “${selected.title}” and its direct connections?`)) return;
    map.nodes = map.nodes.filter(node => node.id !== selected.id);
    map.edges = map.edges.filter(edge => edge.a !== selected.id && edge.b !== selected.id);
    map.nodes.forEach(node => { if (node.parent === selected.id) node.parent = 'root'; });
    map.audit = map.audit || [];
    map.audit.push({ time: now(), action: 'NODE_DELETED', detail: selected.id });
    setRuntimeMap(map, window.ExoviaRuntime?.getView?.());
    scheduleAutosave();
    notify('Node deleted.', 'success');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
  }

  function injectUi() {
    const toolbar = document.querySelector('.toolbar');
    if (toolbar && !$('workspaceBtn')) {
      toolbar.insertAdjacentHTML('afterbegin', '<button id="workspaceBtn" type="button">Workspace</button><button id="saveProjectBtn" type="button">Save</button><button id="snapshotBtn" type="button">Snapshot</button>');
    }
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="workspaceDialog" class="productDialog">
        <div class="productDialogHead"><div><small>LOCAL-FIRST WORKSPACE</small><h2>Project library</h2></div><button type="button" data-close="workspaceDialog">×</button></div>
        <div class="workspaceGrid">
          <section><h3>Saved projects</h3><div id="projectLibrary"></div></section>
          <section><h3>Recovery snapshots</h3><div id="snapshotList"></div></section>
          <section><h3>Project health</h3><div id="projectHealth"></div><p id="productStatus" aria-live="polite"></p></section>
        </div>
      </dialog>
      <dialog id="nodeEditorDialog" class="productDialog nodeEditor">
        <div class="productDialogHead"><div><small>KNOWLEDGE EDITOR</small><h2>Edit selected node</h2></div><button type="button" data-close="nodeEditorDialog">×</button></div>
        <input id="nodeEditId" type="hidden">
        <label>Title<input id="nodeEditTitle"></label>
        <div class="editorColumns"><label>Type<input id="nodeEditType"></label><label>Keywords<input id="nodeEditKeywords" placeholder="comma, separated"></label></div>
        <label>Evidence / content<textarea id="nodeEditText"></textarea></label>
        <div class="dialogActions"><button type="button" data-close="nodeEditorDialog">Cancel</button><button id="saveNodeEditBtn" type="button">Save node</button></div>
      </dialog>
      <nav class="canvasTools" aria-label="Canvas editing tools">
        <button id="addNodeBtn" type="button" title="Add child node">＋ Node</button>
        <button id="editNodeBtn" type="button" title="Edit selected node">Edit</button>
        <button id="deleteNodeBtn" type="button" title="Delete selected node">Delete</button>
      </nav>`);

    $('workspaceBtn').addEventListener('click', () => { renderProjectLibrary(); renderSnapshots(); renderHealth(); $('workspaceDialog').showModal(); });
    $('saveProjectBtn').addEventListener('click', () => saveCurrent({ reason: 'manual' }).catch(error => notify(error.message, 'error')));
    $('snapshotBtn').addEventListener('click', () => saveCurrent({ snapshot: true, reason: 'manual checkpoint' }).catch(error => notify(error.message, 'error')));
    $('addNodeBtn').addEventListener('click', addNode);
    $('editNodeBtn').addEventListener('click', editSelectedNode);
    $('deleteNodeBtn').addEventListener('click', deleteSelectedNode);
    $('saveNodeEditBtn').addEventListener('click', saveNodeEdit);
    document.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => $(button.dataset.close).close()));
    document.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); saveCurrent({ reason: 'keyboard' }).catch(error => notify(error.message, 'error')); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'e') { event.preventDefault(); editSelectedNode(); }
    });
  }

  async function boot() {
    try {
      db = await openDb();
      injectUi();
      await renderProjectLibrary();
      const last = localStorage.getItem('exovia:lastProjectId');
      if (last) {
        const record = await tx(STORE_PROJECTS, 'readonly', store => store.get(last));
        if (record && !getRuntimeMap()) await loadProject(last);
      }
      window.addEventListener('exovia:map-changed', scheduleAutosave);
      window.addEventListener('exovia:selection-changed', renderHealth);
    } catch (error) {
      console.error(error);
      notify(`Workspace unavailable: ${error.message}`, 'error');
    }
  }

  window.ExoviaWorkspace = { saveCurrent, loadProject, normalizeMap };
  window.addEventListener('DOMContentLoaded', boot, { once: true });
})();