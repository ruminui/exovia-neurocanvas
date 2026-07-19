# FAPI, ExiaL and Exil Integration

## Purpose

This document defines how prior Exovia research around **FAPI**, **ExiaL** and **Exil** can evolve Exovia NeuroCanvas from a visual document explorer into a low-overhead visual memory and agent coordination layer.

The implementation status of the historical components must be treated carefully: some recovered documents describe completed experiments, others describe architecture, handoffs or research targets. NeuroCanvas will reuse the strongest verified ideas without claiming that every historical subsystem is currently operational.

---

## 1. FAPI as the execution and routing layer

Recovered Exovia material describes FAPI as a local routing interface able to expose actions such as:

- `ROUTE`
- `GENERATE`
- `STREAM`
- `HEALTH`
- `BUDGET`
- `WARMUP`

The historical router connection format used an ExiaL pulse such as:

```text
>>1|TU_AGENTE>Router|FAPI_HELLO|{"version":1,"acciones":["ROUTE","GENERATE","STREAM","HEALTH","BUDGET","WARMUP"]}
```

### NeuroCanvas integration

FAPI becomes the optional **execution plane** behind the visual map.

A knowledge node can represent more than text. It can also represent:

- an agent capability;
- an executable tool;
- a workflow;
- a health endpoint;
- a budget policy;
- a streaming process;
- a model or local service.

This enables a new interaction model:

```text
Knowledge node
  ↓
Capability metadata
  ↓
FAPI route resolution
  ↓
Approved local action
  ↓
Result returned as new evidence nodes
```

The visual map therefore becomes both a memory and a controlled interface to actions.

### Safety boundary

NeuroCanvas must default to read-only visualization. Any action-capable node must visibly declare:

- required permission;
- target service;
- estimated cost;
- local or remote execution;
- destructive or non-destructive status;
- audit trail.

No action should execute merely because a user zoomed or clicked a node.

---

## 2. ExiaL as the compact semantic pulse format

Recovered Exovia work shows ExiaL as a compact message language using structured fields such as:

```text
>>1|S>sender|A>ACTION|P>payload
```

It was used for task assignment, agent communication, document conversion and router handshakes.

Historical research also defined an **ExiaL-Omega** transport experiment using a compact binary UDP frame for local loopback communication. A recovered handoff reported a benchmark around tens of microseconds and tens of thousands of messages per second on its test environment. These figures are historical experimental results, not guaranteed NeuroCanvas performance.

### NeuroCanvas integration

ExiaL becomes the **native pulse representation** of graph activity.

Every important event can be expressed as a small structured pulse:

```text
>>1|S>NeuroCanvas|A>NODE_SELECTED|P>{"map":"m1","node":"n42"}
>>1|S>Search|A>ZOOM_TO_ANSWER|P>{"query":"memory routing","hits":["n42","n87"]}
>>1|S>FAPI|A>HEALTH|P>{"service":"local-router","status":"ok"}
```

### Why this matters

Traditional knowledge graphs store state but often lack a native language for describing the movement of attention through the graph.

ExiaL allows NeuroCanvas to represent:

- node creation;
- search focus;
- agent handoffs;
- evidence retrieval;
- task assignment;
- state transitions;
- route decisions;
- health and budget events.

The graph can therefore visualize not only **what knowledge exists**, but also **how knowledge and work move through the system**.

### Visual pulse layer

NeuroCanvas should add an optional timeline where ExiaL pulses appear as animated routes between nodes.

Examples:

- gold pulse: hierarchical navigation;
- white pulse: evidence retrieval;
- amber pulse: agent handoff;
- red pulse: failed route or policy denial;
- dotted pulse: simulated or proposed action.

---

## 3. EXIR as a formal intermediate representation

Recovered material describes **EXIR** as an intermediate representation compiler for ExiaL, with a formal pipeline accepting multiple ExiaL formats.

### NeuroCanvas integration

EXIR can become the normalization layer between raw pulses and graph objects:

```text
Raw ExiaL / JSON / Markdown / logs
  ↓
Parser
  ↓
Canonical EXIR event
  ↓
Validated graph mutation
  ↓
Visual rendering and persistence
```

A canonical event could contain:

```json
{
  "version": 1,
  "source": "agent-a",
  "action": "ASSIGN",
  "payload": {"task": "index corpus"},
  "timestamp": "2026-07-19T00:00:00Z",
  "traceId": "trace-123",
  "confidence": 1,
  "status": "observed"
}
```

This gives NeuroCanvas:

- deterministic parsing;
- schema validation;
- replayable histories;
- import compatibility;
- better testing;
- separation between transport and visualization.

---

## 4. Exil as the zero-token executable intent layer

Recovered records confirm that Exil was treated as a native Exovia language alongside ExiaL and was targeted for research into architectural, syntactic and extreme efficiency improvements.

The available recovered material does not yet provide enough verified specification detail to claim a stable Exil grammar. Therefore NeuroCanvas should integrate Exil initially as a clearly labeled **experimental intent language**, not as a finished compiler.

### Proposed role inside NeuroCanvas

- **ExiaL** describes compact events and communication pulses.
- **Exil** describes compact executable intentions, policies and graph transformations.
- **EXIR** normalizes either form into validated internal operations.
- **FAPI** routes approved operations to tools or services.

Example experimental Exil intent:

```text
MAP current
FIND topic:"context compression"
FOCUS top:5
LINK semantic threshold:0.72
EXPLAIN evidence:true
```

Equivalent graph operation:

```json
{
  "operation": "semantic_focus",
  "mapId": "current",
  "query": "context compression",
  "limit": 5,
  "threshold": 0.72,
  "requireEvidence": true
}
```

### Design rule

Exil text must never execute directly. It must pass through:

1. parser;
2. schema validation;
3. capability check;
4. permission policy;
5. preview;
6. explicit user confirmation for mutations;
7. audited execution.

---

## 5. The combined innovation

The integrated system can be described as four layers:

```text
NEUROCANVAS
Visual infinite memory and evidence navigation

EXIAL
Compact semantic pulses and observable graph activity

EXIL + EXIR
Intent language and canonical validated operations

FAPI
Capability discovery, routing, health, streaming and budget control
```

This produces a differentiated concept:

> A visual knowledge system where memory, communication, intent and execution share one inspectable graph.

Most knowledge graph products only visualize stored relationships. This architecture can also reveal:

- which agent created a node;
- which evidence supported it;
- which route produced it;
- what budget was consumed;
- what intent triggered the change;
- which actions were rejected;
- how a result propagated through the map.

---

## 6. New NeuroCanvas modes

### Memory Mode

Explore documents, source fragments and semantic relationships.

### Pulse Mode

Replay ExiaL events through the graph as an animated timeline.

### Intent Mode

Write or select an experimental Exil command and preview its graph effect before execution.

### Capability Mode

Visualize FAPI services, tools, agents, health and supported actions.

### Audit Mode

Inspect the complete route from user intent to source evidence and resulting mutation.

---

## 7. Hackathon MVP scope

The realistic MVP should implement the concept without pretending that every historical component is production-ready.

### Implement now

- ExiaL pulse parser for the canonical text form;
- import of ExiaL logs as graph events;
- pulse timeline and animated route visualization;
- capability nodes with mock/local FAPI metadata;
- EXIR-style canonical event schema;
- Exil preview panel using a small safe declarative subset;
- no automatic external execution;
- audit trail for every graph mutation.

### Demonstrate as future architecture

- binary ExiaL-Omega transport;
- live FAPI router integration;
- full Exil compiler;
- multi-agent orchestration;
- budget-aware model routing;
- persistent distributed event replay.

---

## 8. Submission positioning

### One-line description

**Exovia NeuroCanvas turns documents, agent pulses, executable intent and tool capabilities into one infinite, inspectable visual memory.**

### Differentiator

It is not only a knowledge graph and not only an agent dashboard. It connects:

- human-readable evidence;
- compact machine communication;
- safe executable intent;
- capability routing;
- visual auditability.

### Core claim

**Knowledge should be navigated. Agent activity should be visible. Execution should be explainable.**

---

## 9. Implementation roadmap

### Phase A — Current offline MVP

- text ingestion;
- tree and semantic graph;
- local search;
- exact source recovery.

### Phase B — ExiaL Pulse Graph

- parse pulse logs;
- canonicalize events;
- animate routes;
- event filters and replay.

### Phase C — Exil Intent Preview

- constrained grammar;
- parser and validator;
- graph-diff preview;
- explicit approval workflow.

### Phase D — FAPI Capability Mesh

- capability discovery;
- health and budget nodes;
- read-only calls first;
- controlled action execution;
- complete audit trails.

### Phase E — OpenAI integration

- embeddings;
- structured extraction;
- grounded answers;
- semantic labeling;
- optional agent coordination through server-side tools.

---

## 10. Integrity statement

This integration preserves the recovered Exovia ideas while distinguishing clearly between:

- features already implemented in NeuroCanvas;
- historically documented experiments;
- architecture that can be implemented next;
- research concepts that still require formal specification.

That distinction is essential for a credible hackathon presentation.