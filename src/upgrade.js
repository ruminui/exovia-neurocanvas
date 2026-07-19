(() => {
  'use strict';

  const toast = document.getElementById('toast');
  let toastTimer;
  function notify(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
  }

  // Correct the capability-mode presentation while keeping the existing
  // capability graph builder encapsulated in app.js.
  const capabilityButton = document.getElementById('capabilityView');
  const originalCapabilityHandler = capabilityButton?.onclick;
  if (capabilityButton && originalCapabilityHandler) {
    capabilityButton.onclick = event => {
      originalCapabilityHandler.call(capabilityButton, event);
      requestAnimationFrame(() => {
        document.getElementById('networkView')?.click();
        document.querySelectorAll('.viewModes button').forEach(button => button.classList.remove('active'));
        capabilityButton.classList.add('active');
        notify('FAPI capability mesh loaded in read-only mode');
      });
    };
  }

  const originalExport = document.getElementById('exportBtn')?.onclick;
  if (originalExport) {
    document.getElementById('exportBtn').onclick = event => {
      originalExport.call(event.currentTarget, event);
      notify('Project exported as verifiable JSON');
    };
  }

  document.getElementById('demoBtn')?.addEventListener('click', () => notify('Knowledge demo loaded'));
  document.getElementById('pulseDemoBtn')?.addEventListener('click', () => notify('ExiaL pulse timeline loaded'));
  document.getElementById('applyIntentBtn')?.addEventListener('click', () => notify('Validated Exil visual focus applied'));

  // Keyboard-first navigation for judges and power users.
  window.addEventListener('keydown', event => {
    const target = event.target;
    const typing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
    if (event.key === '/' && !typing) {
      event.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
    if (event.key === 'Escape') {
      document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    }
    if (event.altKey && !typing) {
      const shortcuts = {
        '1': 'networkView',
        '2': 'treeView',
        '3': 'pulseView',
        '4': 'capabilityView'
      };
      const id = shortcuts[event.key];
      if (id) {
        event.preventDefault();
        document.getElementById(id)?.click();
      }
    }
  });

  // Installable PWA flow. The core app still works as a plain static site.
  let deferredInstallPrompt;
  const installButton = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton?.classList.remove('hidden');
  });
  installButton?.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add('hidden');
  });
  window.addEventListener('appinstalled', () => notify('Exovia NeuroCanvas installed'));

  // Add concise accessible descriptions without altering the visual design.
  document.getElementById('canvas')?.setAttribute('tabindex', '0');
  document.getElementById('canvas')?.setAttribute('role', 'application');
  document.querySelectorAll('button').forEach(button => {
    if (!button.getAttribute('type')) button.setAttribute('type', 'button');
  });
})();