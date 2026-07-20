(() => {
  'use strict';

  const EXAMPLE_URL = './examples/live-evidence-room.json';
  const $ = id => document.getElementById(id);
  const notify = (message, kind = 'info') => window.ExoviaNotify ? window.ExoviaNotify(message, kind) : console.log(message);
  let activeRoom = null;

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  const formatTime = value => value ? new Date(value).toLocaleString() : '—';
  const formatDuration = value => {
    const total = Math.max(0, Number(value || 0));
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };
  const keywords = value => [...new Set(String(value || '').toLowerCase().match(/[a-záéíóúñü0-9_:-]{3,}/g) || [])].slice(0, 10);

  function requireId(value, label) {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} requires a non-empty ID.`);
    return value;
  }

  function validateRoom(room) {
    if (!room || room.format !== 'exovia-live-room-v1') throw new Error('Unsupported live room format.');
    requireId(room.roomId, 'Live room');
    if (typeof room.title !== 'string' || !room.title.trim()) throw new Error('Live room requires a title.');
    if (!Number.isInteger(room.revision) || room.revision < 0) throw new Error('Live room revision must be a non-negative integer.');

    for (const key of ['participants', 'evidenceAssets', 'decisions', 'executions', 'events']) {
      if (!Array.isArray(room[key])) throw new Error(`Live room is missing ${key}.`);
    }

    const entities = [
      { id: room.roomId, label: 'room' },
      ...room.participants.map(item => ({ id: item.id, label: 'participant' })),
      ...room.evidenceAssets.map(item => ({ id: item.id, label: 'evidence asset' })),
      ...room.decisions.map(item => ({ id: item.id, label: 'decision' })),
      ...room.executions.map(item => ({ id: item.id, label: 'execution' })),
      ...room.events.map(item => ({ id: item.id, label: 'event' }))
    ];
    entities.forEach(entity => requireId(entity.id, entity.label));
    const allIds = entities.map(entity => entity.id);
    if (new Set(allIds).size !== allIds.length) throw new Error('Live room contains duplicate IDs.');

    const participantIds = new Set(room.participants.map(item => item.id));
    const evidenceIds = new Set(room.evidenceAssets.map(item => item.id));
    const executionIds = new Set(room.executions.map(item => item.id));
    const targetIds = new Set([...allIds, room.roomId]);

    for (const asset of room.evidenceAssets) {
      if (asset.createdBy && !participantIds.has(asset.createdBy)) throw new Error(`Unknown evidence creator: ${asset.createdBy}`);
    }

    const references = [
      ...room.decisions.flatMap(item => item.evidence || []),
      ...room.executions.flatMap(item => item.evidence || [])
    ];
    for (const reference of references) {
      if (!evidenceIds.has(reference.assetId)) throw new Error(`Missing evidence asset: ${reference.assetId}`);
      if (reference.startMs !== undefined || reference.endMs !== undefined) {
        if (!Number.isInteger(reference.startMs) || !Number.isInteger(reference.endMs) || reference.startMs < 0 || reference.endMs < reference.startMs) {
          throw new Error('Invalid temporal evidence range.');
        }
      }
    }

    for (const execution of room.executions) {
      if (!participantIds.has(execution.actorId)) throw new Error(`Unknown execution actor: ${execution.actorId}`);
      if (execution.approvedBy && !participantIds.has(execution.approvedBy)) throw new Error(`Unknown execution approver: ${execution.approvedBy}`);
      if (!execution.contract || typeof execution.contract.objective !== 'string' || !execution.contract.objective.trim()) throw new Error(`Execution ${execution.id} requires an objective.`);
      if (!Array.isArray(execution.contract.allowedTools) || !Array.isArray(execution.contract.successCriteria) || !execution.contract.successCriteria.length) throw new Error(`Execution ${execution.id} has an incomplete contract.`);
      if (execution.contract.approvalPolicy !== 'none' && !execution.approvedBy && ['completed', 'running'].includes(execution.status)) throw new Error(`Execution ${execution.id} requires explicit approval.`);
    }

    for (const decision of room.decisions) {
      if (!participantIds.has(decision.proposedBy)) throw new Error(`Unknown decision proposer: ${decision.proposedBy}`);
      if (decision.approvedBy && !participantIds.has(decision.approvedBy)) throw new Error(`Unknown decision approver: ${decision.approvedBy}`);
      if (decision.status === 'approved' && !decision.approvedBy) throw new Error(`Approved decision ${decision.id} requires an approver.`);
      for (const executionId of decision.linkedExecutionIds || []) if (!executionIds.has(executionId)) throw new Error(`Unknown linked execution: ${executionId}`);
    }

    const sequences = room.events.map(event => event.sequence);
    if (sequences.some(value => !Number.isInteger(value) || value < 0) || new Set(sequences).size !== sequences.length) throw new Error('Replay event sequences must be unique non-negative integers.');
    for (let index = 1; index < sequences.length; index++) if (sequences[index] <= sequences[index - 1]) throw new Error('Replay events must be ordered by sequence.');
    for (const event of room.events) {
      if (!participantIds.has(event.actorId)) throw new Error(`Unknown event actor: ${event.actorId}`);
      if (event.targetId && !targetIds.has(event.targetId)) throw new Error(`Unknown event target: ${event.targetId}`);
      if (event.executionId && !executionIds.has(event.executionId)) throw new Error(`Unknown event execution: ${event.executionId}`);
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
    return `<article class="liveCard participantCard" data-kind="${escapeHtml(item.kind)}"><div><strong>${escapeHtml(item.displayName)}</strong><small>${escapeHtml(item.kind)} · ${escapeHtml(item.role)}</small></div><span class="presence ${escapeHtml(item.presence || 'offline')}">${escapeHtml(item.presence || 'offline')}</span><p>${(item.capabilities || []).map(value => `<code>${escapeHtml(value)}</code>`).join(' ')}</p></article>`;
  }

  function evidenceCard(item) {
    const temporal = item.durationMs ? `<span>${formatDuration(item.durationMs)}</span>` : '';
    return `<article class="liveCard evidenceCard"><header><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.kind)}</span></header><p>${escapeHtml(item.transcript || item.uri || 'Addressable evidence asset')}</p><footer><span>${escapeHtml(item.reviewState)}</span>${temporal}</footer></article>`;
  }

  function decisionCard(item) {
    const refs = (item.evidence || []).map(reference => {
      const range = reference.startMs !== undefined ? ` · ${formatDuration(reference.startMs)}–${formatDuration(reference.endMs)}` : '';
      return `<li>${escapeHtml(reference.assetId)}${range}${reference.quote ? ` — “${escapeHtml(reference.quote)}”` : ''}</li>`;
    }).join('');
    return `<article class="liveCard decisionCard"><header><strong>${escapeHtml(item.status)}</strong><span>revision ${Number(item.revision || 0)}</span></header><p>${escapeHtml(item.statement)}</p><small>Proposed by ${escapeHtml(item.proposedBy)}${item.approvedBy ? ` · approved by ${escapeHtml(item.approvedBy)}` : ''}</small><ul>${refs}</ul></article>`;
  }

  function executionCard(item) {
    const contract = item.contract || {};
    return `<article class="liveCard executionCard"><header><strong>${escapeHtml(item.status)}</strong><span>${escapeHtml(item.kind)}</span></header><p>${escapeHtml(contract.objective || '')}</p><dl><dt>Actor</dt><dd>${escapeHtml(item.actorId)}</dd><dt>Approval</dt><dd>${escapeHtml(contract.approvalPolicy || 'none')}</dd><dt>Tools</dt><dd>${(contract.allowedTools || []).map(escapeHtml).join(', ') || 'none'}</dd></dl></article>`;
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
    $('liveTimeline').innerHTML = room.events.map(eventRow).join('');
    if (!$('liveRoomDialog').open) $('liveRoomDialog').showModal();
  }

  function projectRoom(room) {
    validateRoom(room);
    const nodes = [];
    const edges = [];
    const rootId = room.roomId;
    const addNode = ({ id, title, type, text, parent = rootId, level = 1, metadata }) => nodes.push({
      id, title, type, text, summary: String(text || '').slice(0, 180), keywords: keywords(`${title} ${type} ${text}`), parent, level, metadata
    });
    const addEdge = (a, b, type, weight = 1) => {
      if (!nodes.some(node => node.id === a) || !nodes.some(node => node.id === b)) return;
      edges.push({ a, b, type, weight });
    };

    addNode({ id: rootId, title: room.title, type: 'corpus', text: `Governed Living Evidence Room. Revision ${room.revision}.`, parent: null, level: 0, metadata: { entity: 'room' } });
    for (const item of room.participants) addNode({ id: item.id, title: item.displayName, type: item.kind === 'human' ? 'agent' : item.kind, text: `${item.role}. Capabilities: ${(item.capabilities || []).join(', ')}`, metadata: item });
    for (const item of room.evidenceAssets) addNode({ id: item.id, title: item.title, type: ['audio', 'video', 'image', 'text'].includes(item.kind) ? 'chunk' : 'note', text: item.transcript || item.uri || item.kind, metadata: item });
    for (const item of room.executions) addNode({ id: item.id, title: item.contract.objective, type: 'event', text: `Status: ${item.status}. Actor: ${item.actorId}. Approval: ${item.contract.approvalPolicy}.`, metadata: item });
    for (const item of room.decisions) addNode({ id: item.id, title: item.statement, type: 'topic', text: `Status: ${item.status}. Proposed by ${item.proposedBy}. Approved by ${item.approvedBy || 'pending'}.`, metadata: item });

    for (const item of room.participants) addEdge(rootId, item.id, 'participant');
    for (const item of room.evidenceAssets) {
      addEdge(rootId, item.id, 'evidence');
      if (item.createdBy) addEdge(item.createdBy, item.id, 'created');
    }
    for (const item of room.executions) {
      addEdge(item.actorId, item.id, 'executed');
      for (const reference of item.evidence || []) addEdge(reference.assetId, item.id, 'supports');
      if (item.approvedBy) addEdge(item.approvedBy, item.id, 'approved');
    }
    for (const item of room.decisions) {
      addEdge(item.proposedBy, item.id, 'proposed');
      if (item.approvedBy) addEdge(item.approvedBy, item.id, 'approved');
      for (const reference of item.evidence || []) addEdge(reference.assetId, item.id, 'supports');
      for (const executionId of item.linkedExecutionIds || []) addEdge(executionId, item.id, 'produced');
    }

    const now = new Date().toISOString();
    const map = {
      format: 'neurocanvas-v3', projectId: `live-${room.roomId}`, title: `${room.title} — Live Evidence Projection`, kind: 'memory',
      createdAt: room.createdAt || now, updatedAt: now, nodes, edges, events: room.events,
      audit: [{ time: now, action: 'LIVE_ROOM_PROJECTED', detail: `${room.participants.length} participants, ${room.evidenceAssets.length} evidence assets, ${room.decisions.length} decisions and ${room.events.length} replay events.` }]
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
    dialog.innerHTML = `<div class="productDialogHead"><div><small>LIVING EVIDENCE ROOM · LOCAL VERTICAL SLICE</small><h2 id="liveRoomTitle">Live room</h2><p id="liveRoomMeta"></p></div><button type="button" data-close aria-label="Close live room">×</button></div><div class="liveRoomNotice"><strong>Governed preview.</strong> This demonstrates the room contract, multimedia evidence, approvals and replay. It does not claim deployed real-time multiuser synchronization.</div><div class="liveRoomActions"><button id="liveProjectBtn" type="button">Project room into graph</button><button id="liveReloadBtn" type="button">Reload example</button></div><div class="liveRoomGrid"><section><h3>Participants</h3><div id="liveParticipants" class="liveStack"></div></section><section><h3>Evidence assets</h3><div id="liveEvidence" class="liveStack"></div></section><section><h3>Decisions</h3><div id="liveDecisions" class="liveStack"></div></section><section><h3>Executions</h3><div id="liveExecutions" class="liveStack"></div></section><section class="liveTimelineSection"><h3>Replay timeline</h3><ol id="liveTimeline" class="liveTimeline"></ol></section></div>`;
    document.body.append(dialog);

    button.addEventListener('click', () => loadExample().catch(error => notify(error.message, 'error')));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    $('liveReloadBtn').addEventListener('click', () => loadExample().catch(error => notify(error.message, 'error')));
    $('liveProjectBtn').addEventListener('click', () => activeRoom ? projectRoom(activeRoom) : notify('Load the live room first.', 'error'));
  }

  window.ExoviaLiveRoom = { loadExample, validateRoom, projectRoom, getRoom: () => activeRoom };
  window.addEventListener('DOMContentLoaded', buildUi);
})();