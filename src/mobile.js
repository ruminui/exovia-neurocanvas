(() => {
  'use strict';

  const body = document.body;
  const canvas = document.getElementById('canvas');
  const fitButton = document.getElementById('fitBtn');
  const searchInput = document.getElementById('searchInput');
  const mq = window.matchMedia('(max-width: 760px)');
  let pointers = new Map();
  let lastPinchDistance = 0;
  let lastTapAt = 0;

  function setAppHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`);
  }

  function closeSheets() {
    body.classList.remove('mobile-left-open', 'mobile-right-open', 'mobile-actions-open');
    updatePressed();
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

  function buildMobileUi() {
    if (document.getElementById('mobileNav')) return;

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'mobileSheetBackdrop';
    backdrop.setAttribute('aria-label', 'Close mobile panel');
    backdrop.addEventListener('click', closeSheets);
    body.appendChild(backdrop);

    const nav = document.createElement('nav');
    nav.id = 'mobileNav';
    nav.className = 'mobileNav';
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.innerHTML = `
      <button type="button" data-mobile-sheet="left" aria-pressed="false"><span>⌕</span><span>Explore</span></button>
      <button type="button" id="mobileFit"><span>◎</span><span>Fit</span></button>
      <button type="button" id="mobileSearch"><span>↗</span><span>Answer</span></button>
      <button type="button" data-mobile-sheet="right" aria-pressed="false"><span>≡</span><span>Evidence</span></button>
      <button type="button" data-mobile-sheet="actions" aria-pressed="false"><span>＋</span><span>Actions</span></button>`;
    body.appendChild(nav);

    nav.querySelectorAll('[data-mobile-sheet]').forEach(button => {
      button.addEventListener('click', () => toggleSheet(button.dataset.mobileSheet));
    });
    nav.querySelector('#mobileFit').addEventListener('click', () => {
      fitButton?.click();
      closeSheets();
    });
    nav.querySelector('#mobileSearch').addEventListener('click', () => {
      toggleSheet('left');
      setTimeout(() => searchInput?.focus(), 240);
    });
  }

  function dispatchMouse(type, point) {
    canvas.dispatchEvent(new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      clientX: point.clientX,
      clientY: point.clientY,
      button: 0,
      buttons: type === 'mouseup' ? 0 : 1
    }));
  }

  function distance(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  }

  function midpoint(a, b) {
    return { clientX: (a.clientX + b.clientX) / 2, clientY: (a.clientY + b.clientY) / 2 };
  }

  function enableTouchCanvas() {
    if (!canvas || canvas.dataset.mobileTouchReady) return;
    canvas.dataset.mobileTouchReady = 'true';

    canvas.addEventListener('pointerdown', event => {
      if (!mq.matches || event.pointerType === 'mouse') return;
      event.preventDefault();
      canvas.setPointerCapture?.(event.pointerId);
      pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

      if (pointers.size === 1) {
        dispatchMouse('mousedown', event);
      } else if (pointers.size === 2) {
        dispatchMouse('mouseup', event);
        const [a, b] = [...pointers.values()];
        lastPinchDistance = distance(a, b);
      }
    }, { passive: false });

    canvas.addEventListener('pointermove', event => {
      if (!mq.matches || event.pointerType === 'mouse' || !pointers.has(event.pointerId)) return;
      event.preventDefault();
      pointers.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });

      if (pointers.size === 1) {
        dispatchMouse('mousemove', event);
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const currentDistance = distance(a, b);
        if (lastPinchDistance > 0) {
          const center = midpoint(a, b);
          const delta = Math.max(-120, Math.min(120, (lastPinchDistance - currentDistance) * 2.4));
          canvas.dispatchEvent(new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            clientX: center.clientX,
            clientY: center.clientY,
            deltaY: delta,
            deltaMode: 0
          }));
        }
        lastPinchDistance = currentDistance;
      }
    }, { passive: false });

    function finishPointer(event) {
      if (!mq.matches || event.pointerType === 'mouse') return;
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
      if (pointers.size === 1) {
        const remaining = [...pointers.values()][0];
        dispatchMouse('mousedown', remaining);
      }
    }

    canvas.addEventListener('pointerup', finishPointer, { passive: false });
    canvas.addEventListener('pointercancel', finishPointer, { passive: false });
  }

  function adaptLabels() {
    const hint = document.querySelector('.leftPanel .hint');
    if (!hint) return;
    hint.textContent = mq.matches
      ? 'Drag with one finger · pinch to zoom · tap a node to inspect · double tap to fit'
      : 'Drag to pan · wheel to zoom · click a node to inspect · Ctrl+S to save · Ctrl+E to edit';
  }

  function onModeChange() {
    setAppHeight();
    adaptLabels();
    if (!mq.matches) closeSheets();
  }

  buildMobileUi();
  enableTouchCanvas();
  setAppHeight();
  adaptLabels();

  mq.addEventListener?.('change', onModeChange);
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', () => setTimeout(setAppHeight, 120));
  window.visualViewport?.addEventListener('resize', setAppHeight);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeSheets();
  });
})();
