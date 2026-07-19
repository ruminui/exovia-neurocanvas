(() => {
  'use strict';

  const DEFAULT_URL = 'http://127.0.0.1:8787';
  let bridgeUrl = localStorage.getItem('exovia:bridgeUrl') || DEFAULT_URL;
  let bridgeToken = localStorage.getItem('exovia:bridgeToken') || '';
  let eventSource = null;

  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);

  function getMap() {
    return window.ExoviaRuntime?.getMap?.() || null;
  }

  function authHeaders() {
    return bridgeToken ? { Authorization: `Bearer ${bridgeToken}` } : {};
  }

  async function request(path, options = {}) {
    const response = await fetch(`${bridgeUrl}${path}`, {
      ...options,
      headers: { 'content-type': 'application/json', ...authHeaders(), ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Bridge request failed: ${response.status}`);
    return payload;
  }

  async function checkHealth() {
    const health = await request('/health', { method: 'GET', headers: authHeaders() });
    renderStatus(health);
    notify('AI bridge connected.', 'success');
    return health;
  }

  async function syncProject(source = 'human-ui') {
    const project = getMap();
    if (!project) throw new Error('Open or create a project first.');
    const projectId = project.projectId || `project-${Date.now().toString(36)}`;
    project.projectId = projectId;
    const result = await request('/hooks/project', {
      method: 'POST',
      body: JSON.stringify({ projectId, project, source })
    });
    notify('Project synchronized with the local AI bridge.', 'success');
    return result;
  }

  async function callMcp(method, params = {}) {
    return request('/mcp', {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', id: crypto.randomUUID(), method, params })
    });
  }

  async function listMcpTools() {
    const result = await callMcp('tools/list');
    const tools = result.result?.tools || [];
    const host = $('mcpToolList');
    if (host) host.innerHTML = tools.map(tool => `<article><strong>${escapeHtml(tool.name)}</strong><span>${escapeHtml(tool.description || '')}</span></article>`).join('');
    return tools;
  }

  async function pullReviewedChanges() {
    const current = getMap();
    const projectId = current?.projectId;
    if (!projectId) throw new Error('Sync the active project before pulling AI changes.');
    const result = await callMcp('tools/call', {
      name: 'neurocanvas_get_project',
      arguments: { project_id: projectId }
    });
    const project = result.result?.structuredContent;
    if (!project || !Array.isArray(project.nodes) || !Array.isArray(project.edges)) throw new Error('The bridge did not return a valid project.');
    const summary = `${project.nodes.length} nodes and ${project.edges.length} edges`;
    if (!confirm(`Review and load AI-side changes for “${project.title || projectId}” (${summary})?\n\nCurrent unsaved browser changes will be replaced.`)) return;
    project.audit ||= [];
    project.audit.push({ time: new Date().toISOString(), action: 'AI_CHANGES_REVIEWED_AND_LOADED', detail: 'Human approved loading the bridge version into the visual workspace.' });
    const view = window.ExoviaRuntime?.getView?.() || (project.kind === 'pulse' ? 'pulse' : 'network');
    window.ExoviaRuntime?.loadMap?.(project, view);
    notify('Reviewed AI changes loaded. Save the project to persist them locally.', 'success');
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }

  function renderStatus(health) {
    const host = $('bridgeStatus');
    if (!host) return;
    host.innerHTML = `<strong>${escapeHtml(health.status || 'unknown')}</strong><span>${Number(health.projects || 0)} projects · ${Number(health.events || 0)} events</span>`;
    host.dataset.state = health.status === 'ok' ? 'ok' : 'warn';
  }

  function renderEvent(event) {
    const host = $('hookEventList');
    if (!host) return;
    const row = document.createElement('article');
    row.innerHTML = `<time>${escapeHtml(new Date(event.time).toLocaleTimeString())}</time><strong>${escapeHtml(event.type)}</strong><span>${escapeHtml(JSON.stringify(event.payload))}</span>`;
    host.prepend(row);
    while (host.children.length > 20) host.lastElementChild.remove();
    if (event.type === 'project.changed') notify('AI-side project change detected. Review it from Human + AI.', 'info');
  }

  function subscribe() {
    eventSource?.close();
    const url = new URL(`${bridgeUrl}/hooks/events`);
    eventSource = new EventSource(url);
    eventSource.onmessage = event => {
      try { renderEvent(JSON.parse(event.data)); } catch {}
    };
    eventSource.onerror = () => renderStatus({ status: 'disconnected', projects: 0, events: 0 });
  }

  function saveSettings() {
    bridgeUrl = $('bridgeUrl').value.trim().replace(/\/$/, '') || DEFAULT_URL;
    bridgeToken = $('bridgeToken').value.trim();
    localStorage.setItem('exovia:bridgeUrl', bridgeUrl);
    if (bridgeToken) localStorage.setItem('exovia:bridgeToken', bridgeToken); else localStorage.removeItem('exovia:bridgeToken');
    subscribe();
    checkHealth().catch(error => notify(error.message, 'error'));
  }

  function buildUi() {
    if ($('aiBridgeBtn')) return;
    const button = document.createElement('button');
    button.id = 'aiBridgeBtn';
    button.type = 'button';
    button.textContent = 'Human + AI';
    document.querySelector('.toolbar')?.append(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'aiBridgeDialog';
    dialog.className = 'productDialog aiBridgeDialog';
    dialog.innerHTML = `
      <div class="productDialogHead">
        <div><small>EXOVIA INTEROPERABILITY</small><h2>Human + AI bridge</h2></div>
        <button type="button" data-close aria-label="Close">×</button>
      </div>
      <div class="bridgeGrid">
        <section>
          <h3>Connection</h3>
          <label>Bridge URL<input id="bridgeUrl" value="${escapeHtml(bridgeUrl)}" /></label>
          <label>Optional local token<input id="bridgeToken" type="password" value="${escapeHtml(bridgeToken)}" autocomplete="off" /></label>
          <div class="bridgeActions">
            <button id="bridgeSaveBtn" type="button">Connect</button>
            <button id="bridgeSyncBtn" type="button">Sync active project</button>
            <button id="bridgePullBtn" type="button">Review AI changes</button>
          </div>
          <div id="bridgeStatus" class="bridgeStatus"><strong>not connected</strong><span>Start the local bridge first.</span></div>
          <p class="bridgeNote">Human interactions happen in NeuroCanvas. AI clients use the same projects through MCP tools and resources. Hook events keep both sides observable. AI changes are loaded only after explicit human review.</p>
        </section>
        <section>
          <h3>MCP tools</h3>
          <button id="bridgeToolsBtn" type="button">Load tool catalog</button>
          <div id="mcpToolList" class="mcpToolList"></div>
        </section>
        <section>
          <h3>Hook event stream</h3>
          <div id="hookEventList" class="hookEventList"></div>
        </section>
      </div>`;
    document.body.append(dialog);

    button.addEventListener('click', () => dialog.showModal());
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('bridgeSaveBtn').addEventListener('click', saveSettings);
    $('bridgeSyncBtn').addEventListener('click', () => syncProject().catch(error => notify(error.message, 'error')));
    $('bridgePullBtn').addEventListener('click', () => pullReviewedChanges().catch(error => notify(error.message, 'error')));
    $('bridgeToolsBtn').addEventListener('click', () => listMcpTools().catch(error => notify(error.message, 'error')));
  }

  window.ExoviaBridge = { checkHealth, syncProject, pullReviewedChanges, callMcp, listMcpTools };
  window.addEventListener('DOMContentLoaded', () => {
    buildUi();
    subscribe();
    checkHealth().catch(() => {});
  });
})();
