# OpenAI Build Week Submission

## Project name

Exovia NeuroCanvas

## Creator

Luciano — Exovia

## Recommended track

**Developer Tools**

NeuroCanvas is a visual development and knowledge infrastructure tool for understanding documents, agent activity, code, system capabilities and execution traces in one inspectable graph.

## Tagline

**Navigate knowledge like a living neural map.**

## One-line description

An offline-first infinite canvas that transforms documents, conversations, code and compact agent pulses into a navigable semantic tree, neural graph and auditable execution map with exact source evidence behind every node.

## About the project

Today we navigate the physical world with maps, but we still navigate knowledge as flat pages, isolated logs and endless chat history. Exovia NeuroCanvas turns complex information into a living visual territory.

Users begin with a global view of a corpus, zoom into themes and subthemes, discover semantic relationships, and finally inspect the exact original source text. The project combines local text processing, hierarchical organization, graph visualization, progressive detail and a distinctive **Zoom to Answer** interaction.

The expanded version also imports compact ExiaL agent pulses, visualizes actors and events, replays activity through the graph, previews safe Exil-style intents and models FAPI capabilities such as routing, health, streaming and budget control.

The current MVP is offline-first and runs without API credits. It performs local chunking, keyword extraction, clustering, similarity scoring, tree generation, graph generation, search, camera focus, pulse parsing, event normalization and audit visualization. The architecture is designed so GPT-5.6, OpenAI embeddings and grounded Responses API answers can be added as secure server-side providers without removing the local mode.

## Problem

Modern AI systems create more context than people can effectively inspect:

- long conversations hide earlier decisions;
- codebases and documentation fragment knowledge across files;
- agent systems produce logs without a clear spatial model;
- summaries remove detail and may obscure evidence;
- search finds strings but does not reveal structure or causality;
- agent dashboards show status but rarely connect actions back to exact evidence.

## Solution

NeuroCanvas preserves the source while creating synchronized views:

- a hierarchical tree for structure;
- a neural graph for cross-topic relationships;
- an infinite canvas for spatial navigation;
- an evidence inspector for verification;
- Zoom to Answer for moving directly from a query to relevant source nodes;
- Pulse Mode for replaying agent communication;
- FAPI Mode for visualizing capabilities and routes;
- an audit trail connecting intent, event, evidence and result.

## Innovation

The visualization is not treated as the memory itself. It is a doorway into structured, verifiable memory.

The key innovation is that **memory, communication, intent and execution share the same inspectable graph**.

Traditional knowledge graphs show what is connected. NeuroCanvas can additionally show:

- which actor created an event;
- which evidence supports a node;
- which route produced a result;
- which capability was used;
- which operation was previewed, accepted or rejected;
- how information moved through the system.

This combines four Exovia layers:

```text
NeuroCanvas — visual memory and evidence
ExiaL — compact observable agent pulses
EXIR — canonical validated events
Exil — compact intent preview
FAPI — capability and route layer
```

## What was built during OpenAI Build Week

The project existed previously as a broader Exovia research direction. During the submission period, Codex and GPT-5.6 were used to substantially develop a new standalone Build Week implementation, including:

- the public `exovia-neurocanvas` repository;
- the offline infinite-canvas MVP;
- local document ingestion and semantic grouping;
- Neural and Tree views;
- Zoom to Answer;
- exact evidence inspection;
- ExiaL pulse import and replay;
- FAPI capability visualization;
- safe Exil intent preview;
- validation scripts, smoke tests and GitHub workflow;
- architecture, operational evidence and submission documentation.

Timestamped commits in the public repository document this development history.

## Thoughtful use of GPT-5.6 and Codex

GPT-5.6 and Codex were used as development collaborators to:

- recover and reconcile prior technical research;
- distinguish verified functionality from historical claims;
- design the product architecture;
- implement the browser application;
- integrate FAPI, ExiaL, EXIR and Exil concepts;
- improve safety boundaries and auditability;
- create validation and test infrastructure;
- prepare technical and public-facing documentation.

The project does not present model-generated output as unquestioned truth. Its core design instead emphasizes source preservation, inspectable evidence and explicit boundaries between current implementation, historical benchmarks and future integrations.

## Built with

- GPT-5.6
- Codex
- HTML5 Canvas
- JavaScript
- CSS
- local semantic heuristics
- ExiaL pulse parsing
- EXIR-style canonical event normalization
- JSON project persistence
- GitHub Actions
- offline-first architecture prepared for secure OpenAI integration

## Technical implementation

### Local knowledge pipeline

```text
Text or Markdown
→ normalization
→ structural chunking
→ keyword extraction
→ similarity scoring
→ topic hierarchy
→ semantic edges
→ infinite-canvas rendering
```

### Agent activity pipeline

```text
ExiaL pulse or log
→ parser
→ canonical event
→ actor, action and target nodes
→ replayable graph route
→ audit timeline
```

### Future secure AI pipeline

```text
User question
→ server-side OpenAI provider
→ embeddings and grounded retrieval
→ cited answer
→ Zoom to Answer animation
→ exact source inspection
```

## Design and user experience

The interface uses Exovia’s black-and-gold visual identity and is designed around progressive disclosure:

- distant view: global structure;
- medium zoom: topics and activity routes;
- close view: individual evidence nodes;
- selection: exact source, keywords and semantic path.

The user can move from overview to proof without leaving the same visual environment.

## Impact

Potential applications include:

- organizational memory;
- codebase and architecture exploration;
- agent observability;
- education and research;
- consulting knowledge bases;
- long-term conversation memory;
- local-first personal knowledge systems;
- auditability for AI-assisted workflows;
- visual coordination for small businesses and collaborative teams.

For Exovia, the long-term goal is to make advanced AI infrastructure accessible to real people and small businesses, including community projects and businesses operated by the creator’s friends.

## Demo flow

1. Open the application and load the built-in knowledge demo.
2. Pan and zoom through the neural map.
3. Switch between Neural and Tree views.
4. Search for “privacy” or “Zoom to Answer.”
5. Watch the camera focus on the strongest evidence.
6. Open a node and show the exact source text.
7. Load the ExiaL demo.
8. Switch to Pulse Mode and replay agent events.
9. Open FAPI Mode and inspect capability nodes.
10. Enter a safe Exil-style intent and preview its effect.
11. Paste a new document and generate a new map locally.
12. Export the project as JSON.

## Three-minute judging narrative

### 0:00–0:25 — Problem

“We have maps for cities, but knowledge is still trapped in pages, chats and logs. Search finds words, summaries hide evidence, and agent dashboards separate activity from the source that caused it.”

### 0:25–1:10 — Core product

Load a document, show the infinite graph, zoom from corpus to topic to exact text, then demonstrate Zoom to Answer.

### 1:10–2:05 — Differentiator

Load ExiaL pulses, replay activity, show the agent route and open FAPI capability nodes. Explain that memory, communication, intent and execution share one auditable graph.

### 2:05–2:35 — Trust

Open the evidence inspector and audit trail. Emphasize that the source remains intact and that actions require explicit validation and approval.

### 2:35–3:00 — Impact

Explain the applications for developers, organizations, education and small businesses, then end with the core phrase.

## Key phrases

**Knowledge should be navigated, not merely scrolled.**

**Agent activity should be visible. Execution should be explainable.**

**The visualization is not the memory. It is the doorway into a structured, verifiable memory.**

## Repository

https://github.com/ruminui/exovia-neurocanvas

## Submission integrity

The submission should claim only features visible in the public repository or demonstrated in the video. Historical Exovia benchmarks and components should be described as prior validated work unless they are re-tested in the current environment before submission.