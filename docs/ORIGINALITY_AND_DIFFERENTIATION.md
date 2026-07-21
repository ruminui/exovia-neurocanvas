# Exovia NeuroCanvas — Originality, differentiation and adjacent-project review

Reviewed on **2026-07-21** for OpenAI Build Week.

## Purpose

This document records a factual comparison between Exovia NeuroCanvas and two adjacent public projects that recently appeared in social-media posts. It is intended to help judges understand the overlap created by broad industry trends, the distinctive Exovia architecture, the public chronology, and the intellectual-property boundary of this submission.

**No source code, assets, prompts or documentation from the reviewed projects have been copied or integrated into Exovia NeuroCanvas.** They are not dependencies of this repository.

## Conclusion

The public evidence reviewed does **not** support a claim that either project copied Exovia or that Exovia copied either project.

A recent TikTok upload date is not a repository creation date. Both reviewed repositories existed publicly before the July 2026 NeuroCanvas Build Week implementation commits. Their overlap with Exovia is at the level of common trends—MCP, persistent memory, graphs, document reuse and token efficiency—while their products, data models, workflows and outputs are materially different.

Public chronology cannot prove that no private information was ever leaked. A copying claim would require stronger evidence such as matching non-public code, distinctive text, unique assets, private access records or a demonstrable sequence of access and reuse. No such evidence was found in this review.

## Adjacent public projects

### DeusData/codebase-memory-mcp

**Public purpose:** a code-intelligence MCP server that parses software repositories, creates a persistent structural knowledge graph and answers questions about functions, classes, calls, routes and architecture.

**Overlap with Exovia:** MCP, graph representation, persistent machine-readable memory and token-efficient retrieval.

**Material difference:** it is optimized for software-source structure and coding-agent queries. Exovia is a mixed-evidence and AI-reliability workspace for documents, conversations, agent activity, exact evidence, context preservation, privacy checks, human approval, replay and verifiable proof artifacts.

**Public chronology:** its repository contains a zero-parent initial-release commit and published releases preceding July 2026; release `v0.6.1` was public by 2026-05-04.

**License:** MIT. No code from this project is used here.

### virgiliojr94/book-to-skill

**Public purpose:** converts books and documents into reusable Claude/Amp-compatible skill folders containing a `SKILL.md`, chapter references, glossary, patterns and a cheatsheet loaded on demand.

**Overlap with Exovia:** document ingestion, context efficiency, structured knowledge and reuse by AI agents.

**Material difference:** its principal output is a generated agent skill derived from one or more written sources. Exovia produces an inspectable visual evidence graph, reliability findings, portable context, safe routing guidance, replayable events, human-approval state and SHA-256 Proof Packs across heterogeneous sources and AI activity.

**Public chronology:** public release `v1.0.0` is dated 2026-06-08, with later June releases.

**License:** MIT. No code from this project is used here.

## The distinctive Exovia stack

The differentiator is not any one generic graph or importer. It is the combination of six layers in one inspectable human-controlled workflow.

### NeuroCanvas

The visual memory and evidence workspace. It links answers, sources, decisions, actors, events and quality signals, and lets the user navigate back to exact evidence.

### ProofLayer

The deterministic AI-reliability layer exposed through the ChatGPT App. It scans outputs, protects portable context, compares answers, recommends safer routes, creates a NeuroCanvas handoff and generates integrity-fingerprinted Proof Packs.

### ExiaL

A compact semantic pulse format for observable graph and agent activity. NeuroCanvas can import ExiaL-style events, visualize their routes and replay them as an audit timeline.

### EXIR

The canonical intermediate representation and validation boundary between raw messages or intents and accepted graph events or mutations. It separates transport from validation, replay and rendering.

### Exil

An experimental compact intent language. The implemented hackathon slice is a constrained, non-executing preview: parse, validate, display the expected graph effect and preserve human control. Exil text is not treated as permission to execute an external action.

### FAPI

The capability, routing, health, streaming and budget plane. The current product visualizes capability information and safe routing concepts; unrestricted production execution through a live FAPI mesh is not claimed.

## Combined system

```text
Documents / conversations / AI outputs / ExiaL pulses
                         ↓
               ProofLayer + EXIR
        evidence, privacy, context, validation
                         ↓
                 NeuroCanvas graph
       inspect, navigate, compare, replay, approve
                         ↓
               Exil intent preview
                         ↓
         optional controlled FAPI routing
                         ↓
              new evidence + Proof Pack
```

The central claim is:

> **A visual knowledge system where memory, communication, intent and execution share one inspectable graph.**

## Public Exovia implementation chronology

Representative public commits in this repository include:

- `4da84bebfa30ed2bc5eecec1a06b3ad67639357a` — integrate the FAPI, ExiaL and Exil architecture;
- `72d4878f0ee9a987006cd0f7f24367fb6079e141` — document the FAPI, ExiaL, EXIR and Exil innovation layer, dated 2026-07-19;
- `ade588a55f15b71e201c5d486e286d586ab89fb2` — add working ExiaL pulse, Exil intent and FAPI capability UI, dated 2026-07-19;
- `01edce515f24016037652f96fa3885e56c27536d` — implement ExiaL replay, FAPI capability mesh and safe Exil preview.

These commits establish when the recovered prior Exovia concepts were documented and implemented in the public Build Week repository. They do not, by themselves, prove the date of every earlier private research idea; earlier-work claims should rely on their own retained records.

## Implemented versus roadmap

### Implemented and testable

- visual evidence-linked workspaces;
- mixed text, Markdown, JSON, logs and ExiaL import;
- neural, tree, pulse and FAPI capability views;
- ExiaL pulse representation and replay;
- constrained Exil intent validation and visual preview;
- EXIR-style canonical events and audit records;
- evidence inspection, contradiction and health signals;
- Answer & Audit and navigation back to evidence;
- human and agent replay;
- Context Capsules with sensitive-value redaction;
- AI-output comparison and safe provider-neutral routing;
- AI-to-human NeuroCanvas JSON handoff;
- Proof Packs with SHA-256 integrity;
- ChatGPT Apps SDK/MCP server with six read-only tools;
- local, Docker and Codespaces judge paths.

### Explicitly not claimed as production-complete

- a full general-purpose Exil compiler;
- unrestricted external execution from Exil text;
- a live distributed FAPI service mesh;
- binary ExiaL-Omega transport performance in the current application;
- production multiuser synchronization;
- always-on hosted MCP availability unless separately deployed and demonstrated.

## What the adjacent projects can teach us

These projects are useful prior art and product-design references without being code dependencies.

1. **Fast structural indexing:** a future optional code adapter could import architecture data from a compatible code-graph tool as evidence nodes.
2. **Progressive disclosure:** large sources should be compiled into a small index plus on-demand detail, reducing context cost.
3. **One-command onboarding:** installation, verification and first success should require the fewest possible steps.
4. **Measured claims:** token, latency and quality claims should be backed by reproducible benchmarks rather than marketing language.
5. **Portable capability packages:** a future Exovia format could package sources, procedures, constraints, graph links, approvals and integrity data for use by different agents.

Any future direct reuse of third-party code must be reviewed separately, comply with its license, retain notices and be disclosed. It should not be added merely to imitate another product.

## Build Week compliance boundary

OpenAI Build Week permits pre-existing projects only when they are meaningfully extended with Codex and/or GPT-5.6 during the submission period, and requires clear separation of prior and new work. It also permits open-source components when licenses are followed and the submission genuinely enhances them rather than repackaging them.

For this submission:

- prior Exovia research is described as prior or recovered work;
- Build Week implementation is evidenced through dated commits and the public build record;
- implemented features are separated from roadmap architecture;
- no code from the two adjacent projects reviewed above is included;
- external projects must not be shown in the demo video in a way that introduces unlicensed third-party trademarks or copyrighted media;
- the repository, judge instructions and demo must describe only behavior that can be reproduced.

## Judge-facing differentiation

| Product category | Primary object | Main output | Exovia difference |
|---|---|---|---|
| Code graph MCP | Source-code structure | Calls, symbols and architecture queries | Exovia handles heterogeneous evidence, AI outputs, decisions, privacy, approvals and replay |
| Document-to-skill compiler | Book or document | Agent skill files loaded on demand | Exovia keeps exact evidence and uncertainty in a visual, auditable, provider-neutral workspace |
| RAG or AI chat | Retrieved chunks and generated answer | Conversational answer | Exovia preserves the answer, evidence, quality findings, actors, route, approval state and proof artifact |
| Agent dashboard | Tools, jobs and status | Operational monitoring | Exovia joins operational activity to knowledge, source evidence, intent validation and human decisions |

## Integrity statement

This comparison is an evidence-based technical review, not an accusation. Similarity in a fast-moving field is not proof of copying. Exovia should compete by making its distinctive architecture visible, testable and honestly bounded—not by making unsupported claims about other creators.
