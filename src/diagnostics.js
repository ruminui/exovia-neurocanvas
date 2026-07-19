(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  async function checkFetch(path) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      return { ok: response.ok, detail: `${response.status} ${response.statusText}` };
    } catch (error) {
      return { ok: false, detail: error.message };
    }
  }

  async function runDiagnostics() {
    const checks = [];
    const add = (name, ok, detail = '') => checks.push({ name, ok: Boolean(ok), detail });

    add('Application shell', Boolean(document.querySelector('main') && $('canvas')));
    add('Core runtime', Boolean(window.ExoviaRuntime?.getMap));
    add('Project workspace', Boolean(window.ExoviaProduct || $('projectLibraryBtn') || $('demoBtn')));
    add('Answer and audit engine', Boolean(window.ExoviaIntelligence?.answer));
    add('Knowledge health', Boolean(window.ExoviaIntelligence?.health));
    add('Contradiction radar', Boolean(window.ExoviaIntelligence?.contradictionRadar));
    add('Agent replay', Boolean(window.ExoviaIntelligence?.replay));
    add('Secondary brain interface', Boolean($('brainBtn')));
    add('Human and AI bridge interface', Boolean($('aiBridgeBtn')));
    add('IndexedDB support', 'indexedDB' in window);
    add('Local storage support', (() => { try { localStorage.setItem('__exovia_diag__', '1'); localStorage.removeItem('__exovia_diag__'); return true; } catch { return false; } })());
    add('Service worker support', 'serviceWorker' in navigator, location.protocol === 'file:' ? 'Unavailable on file://; use the launcher.' : '');
    add('Secure or local origin', location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname), location.origin);

    const requiredAssets = [
      './manifest.webmanifest', './sw.js', './src/core.js', './src/product.js',
      './src/mobile.js', './src/brain.js', './src/ai-bridge.js', './src/intelligence.js'
    ];
    for (const asset of requiredAssets) {
      const result = await checkFetch(asset);
      add(`Asset ${asset}`, result.ok, result.detail);
    }

    const project = window.ExoviaRuntime?.getMap?.();
    add('Active project', Boolean(project), project ? `${project.nodes?.length || 0} nodes · ${project.edges?.length || 0} edges` : 'Create or open a workspace.');
    if (project) {
      add('Project node structure', Array.isArray(project.nodes) && project.nodes.every(node => node && typeof node.id === 'string'));
      add('Project edge structure', Array.isArray(project.edges));
      const ids = new Set((project.nodes || []).map(node => node.id));
      const broken = (project.edges || []).filter(edge => !ids.has(edge.a) || !ids.has(edge.b));
      add('No broken graph edges', broken.length === 0, broken.length ? `${broken.length} broken edge(s)` : '');
    }

    const passed = checks.filter(check => check.ok).length;
    return {
      generatedAt: new Date().toISOString(),
      passed,
      failed: checks.length - passed,
      total: checks.length,
      status: checks.every(check => check.ok) ? 'PASS' : 'ATTENTION',
      checks
    };
  }

  function render(report) {
    $('diagnosticsSummary').innerHTML = `<strong>${esc(report.status)}</strong><span>${report.passed}/${report.total} checks passed</span>`;
    $('diagnosticsResults').innerHTML = report.checks.map(check => `
      <article class="diagnosticRow ${check.ok ? 'pass' : 'fail'}">
        <span aria-hidden="true">${check.ok ? '✓' : '!'}</span>
        <div><strong>${esc(check.name)}</strong>${check.detail ? `<small>${esc(check.detail)}</small>` : ''}</div>
      </article>`).join('');
    $('diagnosticsCopyBtn').dataset.report = JSON.stringify(report, null, 2);
  }

  function build() {
    const button = document.createElement('button');
    button.id = 'diagnosticsBtn';
    button.type = 'button';
    button.textContent = 'System check';
    document.querySelector('.toolbar')?.append(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'diagnosticsDialog';
    dialog.className = 'productDialog diagnosticsDialog';
    dialog.innerHTML = `<div class="productDialogHead"><div><small>EXOVIA DIAGNOSTICS</small><h2>System check</h2></div><button type="button" data-close aria-label="Close diagnostics">×</button></div>
      <div class="diagnosticsBody"><div id="diagnosticsSummary" class="diagnosticsSummary">Not run yet.</div>
      <div class="diagnosticsActions"><button id="diagnosticsRunBtn" type="button">Run complete check</button><button id="diagnosticsCopyBtn" type="button">Copy report</button></div>
      <div id="diagnosticsResults" class="diagnosticsResults"><p>This check verifies the browser, core modules, assets, storage and active graph integrity.</p></div></div>`;
    document.body.append(dialog);

    button.addEventListener('click', async () => { dialog.showModal(); render(await runDiagnostics()); });
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('diagnosticsRunBtn').addEventListener('click', async () => render(await runDiagnostics()));
    $('diagnosticsCopyBtn').addEventListener('click', async event => {
      const text = event.currentTarget.dataset.report || 'No diagnostic report yet.';
      try { await navigator.clipboard.writeText(text); event.currentTarget.textContent = 'Copied'; }
      catch { event.currentTarget.textContent = 'Copy unavailable'; }
      setTimeout(() => { event.currentTarget.textContent = 'Copy report'; }, 1400);
    });
  }

  window.ExoviaDiagnostics = { run: runDiagnostics };
  window.addEventListener('DOMContentLoaded', build);
})();
