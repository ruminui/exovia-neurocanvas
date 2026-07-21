(() => {
  'use strict';

  const body = document.body;
  const canvas = document.getElementById('canvas');
  const fitButton = document.getElementById('fitBtn');
  const searchInput = document.getElementById('searchInput');
  const mq = window.matchMedia('(max-width: 760px)');
  const MOBILE_PREF = 'exovia:mobileReady';
  let pointers = new Map();
  let lastPinchDistance = 0;
  let lastTapAt = 0;
  let deferredInstallPrompt = null;

  function isMobile() { return mq.matches; }

  function setAppHeight() {
    const viewport = window.visualViewport;
    const height = viewport?.height || window.innerHeight;
    const offsetTop = viewport?.offsetTop || 0;
    document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
    document.documentElement.style.setProperty('--viewport-offset-top', `${Math.round(offsetTop)}px`);
    body.classList.toggle('mobile-keyboard-open', isMobile() && height < window.innerHeight * 0.76);
  }

  function closeSheets({ restoreFocus = false } = {}) {
    body.classList.remove('mobile-left-open', 'mobile-right-open', 'mobile-actions-open', 'mobile-help-open');
    updatePressed();
    if (restoreFocus) document.getElementById('mobileMap')?.focus();
  }

  function toggleSheet(name) {
    const cls = `mobile-${name}-open`;
    const willOpen = !body.classList.contains(cls);
    closeSheets();
    if (willOpen) body.classList.add(cls);
    updatePressed();
  }

  function updatePressed() {
    document.querySelectorAll('[data-mobile-sheet]').forEach(button => {
      const name = button.dataset.mobileSheet;
      button.setAttribute('aria-pressed', String(body.classList.contains(`mobile-${name}-open`)));
    });
  }

  function mobileText(en, es) {
    return window.ExoviaLanguage?.get?.() === 'es' ? es : en;
  }

  function updateMobileLabels() {
    const labels = {
      mobileHome: mobileText('Home', 'Inicio'),
      mobileMap: mobileText('Canvas', 'Lienzo'),
      mobileVerify: mobileText('Verify', 'Verificar'),
      mobileContext: mobileText('Context', 'Contexto'),
      mobileActions: mobileText('More', 'Más'),
      mobileExplore: mobileText('Explore project', 'Explorar proyecto'),
      mobileEvidence: mobileText('Evidence inspector', 'Fuentes y evidencia'),
      mobileInstall: mobileText('Install app', 'Instalar app'),
      mobileHelp: mobileText('How to use', 'Cómo usar'),
      mobileClose: mobileText('Close panel', 'Cerrar panel')
    };
    Object.entries(labels).forEach(([id, label]) => {
      const button = document.getElementById(id);
      const text = button?.querySelector('[data-mobile-label]');
      if (text) text.textContent = label;
      if (button) button.setAttribute('aria-label', label);
    });
    const backdrop = document.querySelector('.mobileSheetBackdrop');
    if (backdrop) backdrop.setAttribute('aria-label', labels.mobileClose);
    const hint = document.querySelector('.leftPanel .hint');
    if (hint && isMobile()) hint.textContent = mobileText(
      'Drag with one finger · pinch to zoom · tap an idea to inspect · double tap to fit',
      'Arrastrá con un dedo · juntá o separá dos dedos para zoom · tocá una idea · doble toque para encuadrar'
    );
  }

  function buildMobileUi() {
    if (document.getElementById('mobileNav')) return;

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'mobileSheetBackdrop';
    backdrop.setAttribute('aria-label', 'Close mobile panel');
    backdrop.addEventListener('click', () => closeSheets({ restoreFocus: true }));
    body.appendChild(backdrop);

    const nav = document.createElement('nav');
    nav.id = 'mobileNav';
    nav.className = 'mobileNav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML = `
      <button type="button" id="mobileHome" class="active"><span aria-hidden="true">⌂</span><span data-mobile-label>Home</span></button>
      <button type="button" id="mobileMap"><span aria-hidden="true">◎</span><span data-mobile-label>Canvas</span></button>
      <button type="button" id="mobileVerify"><span aria-hidden="true">◇</span><span data-mobile-label>Verify</span></button>
      <button type="button" id="mobileContext"><span aria-hidden="true">▣</span><span data-mobile-label>Context</span></button>
      <button type="button" id="mobileActions" data-mobile-sheet="actions" aria-pressed="false"><span aria-hidden="true">•••</span><span data-mobile-label>More</span></button>`;
    body.appendChild(nav);

    const quick = document.createElement('div');
    quick.id = 'mobileQuickActions';
    quick.className = 'mobileQuickActions';
    quick.innerHTML = `
      <button id="mobileExplore" type="button" data-mobile-sheet="left" aria-pressed="false"><span aria-hidden="true">⌕</span><span data-mobile-label>Explore project</span></button>
      <button id="mobileEvidence" type="button" data-mobile-sheet="right" aria-pressed="false"><span aria-hidden="true">≡</span><span data-mobile-label>Evidence inspector</span></button>
      <button id="mobileHelp" type="button"><span aria-hidden="true">ⓘ</span><span data-mobile-label>How to use</span></button>
      <button id="mobileInstall" type="button" hidden><span aria-hidden="true">⇩</span><span data-mobile-label>Install app</span></button>`;
    document.querySelector('.toolbar')?.prepend(quick);

    document.querySelectorAll('[data-mobile-sheet]').forEach(button => button.addEventListener('click', () => toggleSheet(button.dataset.mobileSheet)));
    const setActive = id => nav.querySelectorAll('button').forEach(button => button.classList.toggle('active', button.id === id));
    document.getElementById('mobileHome').addEventListener('click', () => { closeSheets(); window.ExoviaTrustCenter?.showHome?.(); setActive('mobileHome'); });
    document.getElementById('mobileMap').addEventListener('click', () => { window.ExoviaTrustCenter?.closeHome?.(); fitButton?.click(); closeSheets(); setActive('mobileMap'); });
    document.getElementById('mobileVerify').addEventListener('click', () => { closeSheets(); window.ExoviaTrustCenter?.open?.('scan'); setActive('mobileVerify'); });
    document.getElementById('mobileContext').addEventListener('click', () => { closeSheets(); window.ExoviaTrustCenter?.open?.('capsule'); setActive('mobileContext'); });
    window.addEventListener('exovia:map-changed', () => setActive('mobileMap'));
    document.body.addEventListener('click', event => { if (event.target.closest('#homeBtn,#mobileHome')) setActive('mobileHome'); });
    document.getElementById('mobileHelp').addEventListener('click', () => {
      closeSheets();
      const simple = document.getElementById('simpleModeBtn');
      if (simple && !window.ExoviaSimpleMode?.isEnabled?.()) simple.click();
      document.getElementById('simpleGuideBtn')?.click();
    });
    document.getElementById('mobileInstall').addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
      document.getElementById('mobileInstall').hidden = true;
    });

    document.querySelector('.leftPanel')?.addEventListener('click', event => {
      if (!isMobile()) return;
      if (event.target.closest('.result,[data-node-id]')) setTimeout(() => closeSheets(), 100);
    });

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault();
      deferredInstallPrompt = event;
      const install = document.getElementById('mobileInstall');
      if (install) install.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      const install = document.getElementById('mobileInstall');
      if (install) install.hidden = true;
    });
  }

  function dispatchMouse(type, point) {
    canvas?.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: point.clientX, clientY: point.clientY, button: 0, buttons: type === 'mouseup' ? 0 : 1 }));
  }

  const distance = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const midpoint = (a, b) => ({ clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 });

  function enableTouchCanvas() {
    if (!canvas || canvas.dataset.mobileTouchReady) return;
    canvas.dataset.mobileTouchReady = 'true';

    canvas.addEventListener('pointerdown', event => {
      if (!isMobile() || event.pointerType === 'mouse') return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
      if (pointers.size === 1) dispatchMouse('mousedown', event);
      else if (pointers.size === 2) {
        dispatchMouse('mouseup', event);
        const [a, b] = [...pointers.values()];
        lastPinchDistance = distance(a, b);
      }
    }, { passive: false });

    canvas.addEventListener('pointermove', event => {
      if (!isMobile() || event.pointerType === 'mouse' || !pointers.has(event.pointerId)) return;
      event.preventDefault();
      pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
      if (pointers.size === 1) dispatchMouse('mousemove', event);
      else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const currentDistance = distance(a, b);
        if (lastPinchDistance > 0) {
          const center = midpoint(a, b);
          const delta = Math.max(-120, Math.min(120, (lastPinchDistance - currentDistance) * 2.4));
          canvas.dispatchEvent(new WheelEvent('wheel', { bubbles: true, cancelable: true, clientX: center.clientX, clientY: center.clientY, deltaY: delta, deltaMode: 0 }));
        }
        lastPinchDistance = currentDistance;
      }
    }, { passive: false });

    function finishPointer(event) {
      if (!isMobile() || event.pointerType === 'mouse') return;
      event.preventDefault();
      const wasSingle = pointers.size === 1;
      pointers.delete(event.pointerId);
      if (wasSingle) {
        dispatchMouse('mouseup', event);
        const now = Date.now();
        if (now - lastTapAt < 320) fitButton?.click();
        lastTapAt = now;
      }
      if (pointers.size < 2) lastPinchDistance = 0;
      if (pointers.size === 1) dispatchMouse('mousedown', [...pointers.values()][0]);
    }
    canvas.addEventListener('pointerup', finishPointer, { passive: false });
    canvas.addEventListener('pointercancel', finishPointer, { passive: false });
  }

  function prepareMobileDefaults() {
    if (!isMobile() || localStorage.getItem(MOBILE_PREF)) return;
    localStorage.setItem(MOBILE_PREF, '1');
    if (!localStorage.getItem('exovia:language') && /^es\b/i.test(navigator.language || '')) window.ExoviaLanguage?.set?.('es');
    setTimeout(() => {
      window.ExoviaTrustCenter?.showHome?.();
    }, 700);
  }

  function onModeChange() {
    setAppHeight();
    updateMobileLabels();
    if (!isMobile()) closeSheets();
  }

  buildMobileUi();
  enableTouchCanvas();
  setAppHeight();
  updateMobileLabels();
  prepareMobileDefaults();

  mq.addEventListener?.('change', onModeChange);
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', () => setTimeout(() => { setAppHeight(); fitButton?.click(); }, 180));
  window.visualViewport?.addEventListener('resize', setAppHeight);
  window.visualViewport?.addEventListener('scroll', setAppHeight);
  window.addEventListener('exovia:language-changed', updateMobileLabels);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeSheets({ restoreFocus: true }); });

  window.ExoviaMobile = { closeSheets, toggleSheet, setAppHeight, isMobile };
})();
