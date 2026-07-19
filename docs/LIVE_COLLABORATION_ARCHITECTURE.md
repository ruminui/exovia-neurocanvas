# Exovia NeuroCanvas Live — Governed Collaboration Architecture

Status: `VISION VALIDATED / IMPLEMENTATION ROADMAP`

This document extends NeuroCanvas from a visual knowledge workspace into a governed collaborative runtime for humans, media, workflows and AI agents.

## Product thesis

> The governed collaborative runtime where humans, media, knowledge, workflows and AI agents work together — with every decision traceable to its evidence.

The goal is not to copy Miro, Zoom, Neko, n8n or an agent platform. The differentiator is to connect them through evidence, explicit permissions, human approval and replayable execution.

## Core concept: Living Evidence Rooms

A room combines:

- a shared knowledge graph;
- participants and presence;
- text, image, audio and video evidence;
- shared browser or application sessions;
- workflow and agent execution;
- human approvals;
- immutable audit events;
- session replay.

A meeting or research session should not disappear when it ends. Decisions become nodes linked to the exact source segment, actor, workflow and approval that produced them.

## Layered architecture

```text
Exovia NeuroCanvas Live Room
├── Knowledge state and collaboration — CRDT-compatible document layer
├── Presence, voice, video and data — WebRTC room provider
├── Shared browser/application — isolated Neko-compatible container
├── Workflows — n8n-compatible execution adapter
├── Agent tools — MCP contracts and scoped capabilities
├── Evidence — temporal and spatial media references
├── Governance — roles, permissions, approvals and policy
└── Replay — ordered human, agent, workflow and media events
```

Provider names describe integration targets, not bundled dependencies. The stable local-first product must continue to work without them.

## Canonical room entities

### Participant

A participant may be:

- `human`
- `agent`
- `workflow`
- `service`

Each participant has a stable room identity, role, capabilities, presence state and audit actor ID.

### Evidence asset

Supported evidence classes:

- text document;
- image with selectable region;
- audio with time range and transcript;
- video with time range, transcript and keyframe;
- browser session event;
- workflow execution output;
- agent tool result.

### Decision node

A decision node must include:

- statement;
- evidence references;
- proposer;
- approver when required;
- confidence or review state;
- timestamp;
- linked tasks or workflow runs;
- revision.

### Execution contract

Every agent or workflow execution should declare:

- objective;
- inputs;
- permitted tools;
- constraints;
- expected outputs;
- success criteria;
- approval policy;
- timeout and cancellation policy;
- evidence retention policy.

## Human Takeover protocol

1. An agent encounters a blocked or policy-sensitive step.
2. The runtime pauses the execution contract.
3. A takeover request is emitted with reason and current evidence.
4. An authorized human accepts control.
5. Human actions are recorded as a separate actor.
6. Control is explicitly returned or the execution is terminated.
7. Agent continuation requires a new revision and policy check.

No silent takeover or hidden continuation is allowed.

## Multimedia evidence model

A media asset is not a generic attachment. It contains addressable evidence:

```text
MediaAsset
├── source metadata
├── duration and dimensions
├── transcript or OCR references
├── speakers or subjects
├── chapters and keyframes
├── temporal segments
├── spatial regions
├── annotations
├── derived knowledge nodes
└── provenance and review state
```

Examples:

- an answer cites `00:18:42–00:19:11` of a meeting recording;
- an image claim cites a bounding region;
- a browser action cites the session event and screenshot hash;
- a workflow result cites its input revision and output artifact.

## Collaboration consistency model

The future real-time graph layer should support offline editing and deterministic merge. Recommended properties:

- CRDT-compatible shared node and edge collections;
- actor and logical timestamp on every mutation;
- conflict visibility instead of silent overwrite;
- local-first persistence before network synchronization;
- project revision checkpoints;
- visual diff between revisions;
- explicit resolution for semantic conflicts.

Transport is replaceable. Collaboration semantics must not depend on a single vendor.

## Security boundaries

### Room isolation

- one security context per room;
- no cross-room data access by default;
- isolated browser/application containers;
- short-lived session credentials;
- explicit file upload and download policy;
- domain allowlists for shared browsing;
- recording consent and retention controls.

### Roles

Baseline roles:

- `observer`
- `contributor`
- `controller`
- `approver`
- `room_admin`

Agents receive capabilities, not broad user-equivalent roles.

### Workflow and agent safety

- deny by default;
- static verification before execution;
- scoped MCP tools;
- input trust classification;
- human approval for external or destructive actions;
- replayable tool calls;
- secret redaction;
- cancellation and timeout enforcement.

## Integration boundaries

### Neko-compatible shared runtime

Use for a shared remote browser or desktop where participants can observe and authorized users can request control. It does not replace graph collaboration.

### n8n-compatible workflow adapter

Represent workflows as graph entities and map each run into Agent Replay. Store workflow identifiers, input revision, status, duration, outputs and approvals. Never store workflow secrets in the browser project.

### MCP agent adapter

Expose only project-scoped tools. Every mutation uses expected revision checks and emits an audit event.

### WebRTC room provider

Voice, video, screen and data channels remain an optional deployment layer. The knowledge project remains exportable and usable without the live provider.

## Delivery phases

### Phase A — submission-safe vertical slice

- schema and architecture documentation;
- media evidence node model;
- workflow and agent participant representations;
- Human Takeover event sequence;
- replay timeline examples;
- no claim of real multiuser synchronization.

### Phase B — collaboration pilot

- shared presence;
- CRDT graph prototype;
- visible remote cursors and selections;
- conflict and revision UI;
- room-level roles;
- encrypted provider transport.

### Phase C — live execution rooms

- WebRTC voice/video/data;
- isolated shared browser containers;
- n8n execution adapter;
- agent participants;
- recording, transcription and temporal citations;
- governed Human Takeover.

### Phase D — enterprise platform

- identity provider integration;
- tenant isolation;
- centralized audit export;
- policy administration;
- retention and legal hold;
- scale, endurance and recovery validation.

## Claims policy

Allowed now:

- architecture and schema are defined;
- NeuroCanvas is designed to evolve toward governed collaborative rooms;
- the existing graph, audit and MCP foundations support that direction.

Not allowed until executed:

- real-time multiuser editing is operational;
- Neko, n8n or WebRTC are bundled or deployed;
- audio/video transcription is complete;
- production tenant isolation exists;
- live agents can safely control remote browsers.

## Success metrics for the future pilot

- two participants edit without data loss;
- reconnect merges offline work deterministically;
- every decision links to exact evidence;
- every agent mutation has an actor, contract, revision and approval state;
- Human Takeover can pause, transfer, return and replay control;
- room teardown removes temporary credentials and containers;
- exported projects remain useful without the live infrastructure.
