(() => {
  'use strict';

  const WARN_BYTES = 2 * 1024 * 1024;
  const HARD_BYTES = 20 * 1024 * 1024;
  const $ = id => document.getElementById(id);
  const approvedInputs = new WeakSet();
  let pendingInput = null;

  function sizeLabel(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function inspectFile(file) {
    return {
      name: file.name,
      size: file.size,
      sizeLabel: sizeLabel(file.size),
      warning: file.size >= WARN_BYTES,
      blocked: file.size > HARD_BYTES
    };
  }

  function close(clear = false) {
    if (clear && pendingInput) pendingInput.value = '';
    pendingInput = null;
    $('largeInputDialog')?.close();
  }

  function continueProcessing() {
    const input = pendingInput;
    if (!input) return close(false);
    approvedInputs.add(input);
    close(false);
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function build() {
    if ($('largeInputDialog')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <dialog id="largeInputDialog" class="largeInputDialog" aria-labelledby="largeInputTitle">
        <div class="resilienceHead"><div><small>LARGE INPUT SAFETY</small><h2 id="largeInputTitle">This file may take longer</h2></div></div>
        <div class="largeInputBody">
          <p id="largeInputSummary"></p>
          <p id="largeInputAdvice">Keep this tab open while NeuroCanvas builds the map. A large file may use more memory, especially on a phone.</p>
          <div class="largeInputChoices">
            <button id="largeInputCancel" type="button">Cancel</button>
            <button id="largeInputContinue" type="button">Process complete file</button>
          </div>
        </div>
      </dialog>`);
    $('largeInputCancel').addEventListener('click', () => close(true));
    $('largeInputContinue').addEventListener('click', continueProcessing);

    document.addEventListener('change', event => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || input.id !== 'fileInput' || !input.files?.length) return;
      if (approvedInputs.has(input)) {
        approvedInputs.delete(input);
        return;
      }
      const info = inspectFile(input.files[0]);
      if (!info.warning) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (info.blocked) {
        input.value = '';
        window.ExoviaNotify?.(`File is ${info.sizeLabel}. Use a smaller file or split it into sections.`, 'error');
        return;
      }
      pendingInput = input;
      $('largeInputSummary').textContent = `${info.name} is ${info.sizeLabel}. Processing can temporarily slow the interface.`;
      $('largeInputDialog').showModal();
    }, true);
  }

  window.ExoviaLargeInput = { inspectFile, continueProcessing, limits: { warningBytes: WARN_BYTES, maximumBytes: HARD_BYTES } };
  window.addEventListener('DOMContentLoaded', build, { once: true });
})();
