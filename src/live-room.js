(() => {
  'use strict';

  const EXAMPLE_URL = './examples/live-evidence-room.json';
  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let activeRoom = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const formatTime = value => value ? new Date(value).toLocaleString() : '—';
  const ms = value => {
    const total = Math.max(0, Number(value || 0));
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  function validateRoom(room) {
    if (!room || room.format !== 'exovia-live-room-v1') throw new Error('Unsupported live room format.');
    for (const key of ['participants', 'evidenceAssets', 'decisions', 'executions', 'events']) {
      if (!Array.isArray(room[key])) throw new Error(`Live room is missing ${key}.`);
    }
    const allIds = [room.roomId, ...room.participants, ...room.evidenceAssets, ...room.decisions, ...room.executions, ...room.events]
      .map(item => typeof item === 'string' ? item : item.id);
    if (new Set(allIds).size !== allIds.length) throw new Error('Live room contains duplicate IDs.');
    const evidenceIds = new Set(room.evidenceAssets.map(item => item.id));
    for (const reference of [...room.decisions.flatMap(item => item.evidence || []), ...room.executions.flatMap(item => item.evidence || [])]) {
      if (!evidenceIds.has(reference.assetId)) throw new Error(`Missing evidence asset: ${reference.assetId}`);
      if (reference.startMs !== undefined && reference.endMs !== undefined && reference.endMs < reference.startMs) throw new Error('Invalid temporal evidence range.');
    }
    return room;
  }

  async function loadExample() {
    const response = await fetch(EXAMPLE_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Unable to load live room example (${response.status}).`);
    activeRoom = validateRoom(await response.json());
    render(activeRoom);
    return activeRoom;
  }

  function participantCard(item) {
    return `<article class="liveCard participantCard" data-kind="${escapeHtml(item.kind)}">
      <div><strong>${escapeHtml(item.displayName)}</strong><small>${escapeHtml(item.kind)} · ${escapeHtml(item.role)}</small></div>
      <span class="presence ${escapeHtml(item.presence || 'offline')}">${escapeHtml(item.presence || 'offline')}</span>
      <p>${(item.capabilities || []).map(value => `<code>${escapeHtml(value)}</code>`).join(' ')}</p>
    </article>`;
  }

  function evidenceCard(item) {
    const temporal = item.durationMs ? `<span>${ms(item.durationMs)}</span>` : '';
    return `<article class="liveCard evidenceCard">
      <header><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.kind)}</span></header>
      <p>${escapeHtml(item.transcript || item.uri || 'Addressable evidence asset')}</p>
      <footer><span>${escapeHtml(item.reviewState)}</span>${temporal}</footer>
    </article>`;
  }

  function decisionCard(item) {
    const refs = (item.evidence || []).map(reference => {
      const range = reference.startMs !== undefined ? ` · ${ms(reference.startMs)}–${ms(reference.endMs)}` : '';
      return `<li>${escapeHtml(reference.assetId)}${range}${reference.quote ? ` — “${escapeHtml(reference.quote)}”` : ''}</li>`;
    }).join('');
    return `<article class="liveCard decisionCard">
      <header><strong>${escapeHtml(item.status)}</strong><span>revision ${Number(item.revision || 0)}</span></header>
      <p>${escapeHtml(item.statement)}</p>
      <small>Proposed by ${escapeHtml(item.proposedBy)}${item.approvedBy ? ` · approved by ${escapeHtml(item.approvedBy)}` : ''}</small>
      <ul>${refs}</ul>
    </article>`;
  }

  function executionCard(item) {
    const contract = item.contract || {};
    return `<article class="liveCard executionCard">
      <header><strong>${escapeHtml(item.status)}</strong><span>${escapeHtml(item.kind)}</span></header>
      <p>${escapeHtml(contract.objective || '')}</p>
      <dl><dt>Actor</dt><dd>${escapeHtml(item.actorId)}</dd><dt>Approval</dt><dd>${escapeHtml(contract.approvalPolicy || 'none')}</dd><dt>Tools</dt><dd>${(contract.allowedTools || []).map(escapeHtml).join(', ') || 'none'}</dd></dl>
    </article>`;
  }

  function eventRow(item) {
    return `<li><time>${escapeHtml(formatTime(item.timestamp))}</time><strong>${escapeHtml(item.type)}</strong><span>${escapeHtml(item.actorId)}${item.reason ? ` — ${escapeHtml(item.reason)}` : ''}</span></li>`;
  }

  function render(room) {
    $('liveRoomTitle').textContent = room.title;
    $('liveRoomMeta').textContent = `${room.roomId} · revision ${room.revision} · ${room.participants.length} participants · ${room.events.length} events`;
    $('liveParticipants').innerHTML = room.participants.map(participantCard).join('');
    $('liveEvidence').innerHTML = room.evidenceAssets.map(evidenceCard).join('');
    $('liveDecisions').innerHTML = room.decisions.map(decisionCard).join('');
    $('liveExecutions').innerHTML = room.executions.map(executionCard).join('');
    $('liveTimeline').innerHTML = [...room.events].sort((a, b) => a.sequence - b.sequence).map(eventRow).join('');
    $('liveRoomDialog').showModal();
  }

  function projectRoom(room) {
    const nodes = [];
    const edges = [];
    const pushNode = (id, title, type, source, extra = {}) => nodes.push({ id, title, type, source, tags: [type], ...extra });
    const pushEdge = (source, target, relation) => edges.push({ id: `${source}-${relation}-${target}`, source, target, relation });

    pushNode(room.roomId, room.title, 'room', `Revision ${room.revision}. Governed Living Evidence Room.`);
    for (const item of room.participants) {
      pushNode(item.id, item.displayName, item.kind, `${item.role}. Capabilities: ${(item.capabilities || []).join(', ')}`);
      pushEdge(room.roomId, item.id, 'participant');
    }
    for (const item of room.evidenceAssets) {
      pushNode(item.id, item.title, `evidence:${item.kind}`, item.transcript || item.uri || item.kind);
      pushEdge(room.roomId, item.id, 'evidence');
      if (item.createdBy) pushEdge(item.createdBy, item.id, 'created');
    }
    for (const item of room.executions) {
      pushNode(item.id, item.contract?.objective || item.id, `execution:${item.kind}`, `Status: ${item.status}. Approval: ${item.contract?.approvalPolicy || 'none'}.`);
      pushEdge(item.actorId, item.id, 'executed');
      for (const reference of item.evidence || []) pushEdge(reference.assetId, item.id, 'supports');
      if (item.approvedBy) pushEdge(item.approvedBy, item.id, 'approved');
    }
    for (const item of room.decisions) {
      pushNode(item.id, item.statement, 'decision', `Status: ${item.status}. Revision: ${item.revision}.`);
      pushEdge(item.proposedBy, item.id, 'proposed');
      if (item.approvedBy) pushEdge(item.approvedBy, item.id, 'approved');
      for (const reference of item.evidence || []) pushEdge(reference.assetId, item.id, 'supports');
      for (const executionId of item.linkedExecutionIds || []) pushEdge(executionId, item.id, 'produced');
    }

    const map = {
      format: 'neurocanvas-v3',
      projectId: `live-${room.roomId}`,
      title: `${room.title} — Live Evidence Projection`,
      kind: 'network',
      nodes,
      edges,
      audit: [{ time: new Date().toISOString(), action: 'LIVE_ROOM_PROJECTED', detail: `${room.participants.length} participants, ${room.evidenceAssets.length} evidence assets and ${room.events.length} replay events.` }]
    };
    window.ExoviaRuntime?.loadMap?.(map, 'network');
    $('liveRoomDialog').close();
    notify('Living Evidence Room projected into the active graph.', 'success');
    return map;
  }

  function buildUi() {
    if ($('liveRoomBtn')) return;
    const button = document.createElement('button');
    button.id = 'liveRoomBtn';
    button.type = 'button';
    button.textContent = 'Live room';
    button.title = 'Open the governed collaboration and multimedia vertical slice';
    document.querySelector('.toolbar')?.append(button);

    const dialog = document.createElement('dialog');
    dialog.id = 'liveRoomDialog';
    dialog.className = 'productDialog liveRoomDialog';
    dialog.setAttribute('aria-labelledby', 'liveRoomTitle');
    dialog.innerHTML = `<div class="productDialogHead"><div><small>LIVING EVIDENCE ROOM · LOCAL VERTICAL SLICE</small><h2 id="liveRoomTitle">Live room</h2><p id="liveRoomMeta"></p></div><button type="button" data-close aria-label="Close live room">×</button></div>
      <div class="liveRoomNotice"><strong>Governed preview.</strong> This demonstrates the room contract, multimedia evidence, approvals and replay. It does not claim deployed real-time multiuser synchronization.</div>
      <div class="liveRoomActions"><button id="liveProjectBtn" type="button">Project room into graph</button><button id="liveReloadBtn" type="button">Reload example</button></div>
      <div class="liveRoomGrid">
        <section><h3>Participants</h3><div id="liveParticipants" class="liveStack"></div></section>
        <section><h3>Evidence assets</h3><div id="liveEvidence" class="liveStack"></div></section>
        <section><h3>Decisions</h3><div id="liveDecisions" class="liveStack"></div></section>
        <section><h3>Executions</h3><div id="liveExecutions" class="liveStack"></div></section>
        <section class="liveTimelineSection"><h3>Replay timeline</h3><ol id="liveTimeline" class="liveTimeline"></ol></section>
      </div>`;
    document.body.append(dialog);

    button.addEventListener('click', () => loadExample().catch(error => notify(error.message, 'error')));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('liveReloadBtn').addEventListener('click', () => loadExample().catch(error => notify(error.message, 'error')));
    $('liveProjectBtn').addEventListener('click', () => {
      if (!activeRoom) return notify('Load the live room first.', 'error');
      projectRoom(activeRoom);
    });
  }

  window.ExoviaLiveRoom = { loadExample, validateRoom, projectRoom, getRoom: () => activeRoom };
  window.addEventListener('DOMContentLoaded', buildUi);
})();