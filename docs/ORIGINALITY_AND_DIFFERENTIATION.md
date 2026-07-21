# Exovia NeuroCanvas — Originality, differentiation and adjacent-project review

Reviewed on **2026-07-21** for OpenAI Build Week.

## Purpose

This document records a factual comparison between Exovia NeuroCanvas and two adjacent public projects that recently appeared in social-media posts. It helps judges understand the overlap created by broad industry trends, the distinctive Exovia architecture, the public chronology and the intellectual-property boundary of this submission.

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

**Public chronology:** its repository contains a zero-parent initial-release commit and public versions preceding July 2026.

**License:** MIT. No code from this project is used here.

### virgiliojr94/book-to-skill

**Public purpose:** converts books and documents into reusable agent-skill folders with a compact index and reference material loaded on demand.

**Overlap with Exovia:** document ingestion, context efficiency, structured knowledge and reuse by AI agents.

**Material difference:** its principal output is a generated skill derived from written sources. Exovia creates an inspectable visual evidence graph, reliability findings, portable context, governed capability packages, replayable events, human-approval state and SHA-256 proof artifacts across heterogeneous sources and AI activity.

**Public chronology:** public releases preceded the July 2026 NeuroCanvas implementation.

**License:** MIT. No code from this project is used here.

## The distinctive Exovia stack

The differentiator is not any one generic graph or importer. It is the combination of seven components in one inspectable, human-controlled workflow.

### NeuroCanvas

The visual memory and evidence workspace. It links answers, sources, decisions, actors, events and quality signals, and lets the user navigate back to exact evidence.

### ProofLayer

The deterministic AI-reliability layer exposed through the ChatGPT App. It scans outputs, protects portable context, compares answers, recommends safer routes, creates a NeuroCanvas handoff and generates integrity-fingerprinted artifacts.

### EXO Capability Packs

A transparent UTF-8 JSON package using the `.exo` extension. It preserves source and chunk IDs, content hashes, an index-first progressive-disclosure plan, glossary, procedures, constraints, privacy redactions, action policies, human approval and SHA-256 integrity.

An EXO pack is inspectable data. It is not a trained model, an installed skill or permission to execute its procedures.

### ExiaL

A compact semantic pulse format for observable graph and agent activity. NeuroCanvas can import ExiaL-style events, visualize their routes and replay them as an audit timeline.

### EXIR

The canonical intermediate representation and validation boundary between raw messages or intents and accepted graph events or mutations. It separates transport from validation, replay and rendering.

### Exil

An experimental compact intent language. The implemented hackathon slice is a constrained, non-executing preview: parse, validate, display the expected graph effect and preserve human control. Exil text is not treated as permission to execute an external action.

### FAPI

The capability, routing, health, streaming and budget plane. The current product visualizes capability information and safe-routing concepts; unrestricted production execution through a live FAPI mesh is not claimed.

## Combined system

```text
Documents / conversations / AI outputs / ExiaL pulses
                         ↓
               ProofLayer + EXIR
        evidence, privacy, context, validation
                         ↓
          EXO pack + NeuroCanvas graph
 inspect, retrieve progressively, replay, approve
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
- `72d4878f0ee9a987006cd0f7f24367fb6079e141` — document the FAPI, ExiaL, EXIR and Exil innovation layer on 2026-07-19;
- `ade588a55f15b71e201c5d486e286d586ab89fb2` — add working ExiaL pulse, Exil intent and FAPI capability UI on 2026-07-19;
- `01edce515f24016037652f96fa3885e56c27536d` — implement ExiaL replay, FAPI capability mesh and safe Exil preview;
- PR #10 — implement original EXO capability-package compilation, import, tests and judge evidence during Build Week.

These records establish when recovered prior Exovia concepts and new Build Week extensions entered the public repository. They do not, by themselves, prove the date of every earlier private research idea; earlier-work claims should rely on retained records.

## Implemented versus roadmap

### Implemented and testable

- visual evidence-linked workspaces;
- mixed text, Markdown, JSON, `.exo`, logs and ExiaL import;
- neural, tree, pulse and FAPI capability views;
- ExiaL pulse representation and replay;
- constrained Exil validation and visual preview;
- EXIR-style canonical events and audit records;
- evidence inspection, contradiction and health signals;
- human and agent replay;
- Context Capsules with sensitive-value redaction;
- source-linked EXO packs with progressive disclosure and SHA-256;
- EXO import into a human-review NeuroCanvas graph;
- AI-output comparison and safe provider-neutral routing;
- AI-to-human NeuroCanvas JSON handoff;
- Proof Packs with SHA-256 integrity;
- ChatGPT Apps SDK/MCP server with seven read-only tools;
- local, Docker and Codespaces judge paths.

### Explicitly not claimed as production-complete

- a full general-purpose Exil compiler;
- unrestricted external execution from Exil text or an EXO package;
- a live distributed FAPI service mesh;
- binary ExiaL-Omega performance in the current application;
- production multiuser synchronization;
- always-on hosted MCP availability unless separately deployed and demonstrated.

## Lessons applied without copying

The reviewed projects are useful prior art and product-design references without being code dependencies.

1. **Progressive disclosure — implemented:** EXO packs load a compact manifest and search index first, then expose source-linked chunks on demand.
2. **Portable capability packaging — implemented:** `.exo` combines sources, procedures, constraints, action rules, approval requirements, privacy and integrity.
3. **One-command verification — implemented:** the judge command discovers all tools, runs the EXO workflow, audits artifacts and checks the container.
4. **Measured claims — implemented cautiously:** context reduction is reported as a transparent estimate, never as an exact billing or performance benchmark.
5. **Fast structural indexing — future adapter:** code-architecture data may later be imported from compatible tools as evidence, subject to a separate license and security review.

Any future direct reuse of third-party code must be reviewed separately, comply with its license, retain notices and be disclosed. It must not be added merely to imitate another product.

## Build Week compliance boundary

For this submission:

- prior Exovia research is described as prior or recovered work;
- Build Week implementation is evidenced through dated commits and the public build record;
- implemented features are separated from roadmap architecture;
- no code from the two adjacent projects reviewed above is included;
- the EXO compiler uses the project's existing licensed dependencies;
- generated packages disclose their safety and provenance boundary;
- external projects are not used as unlicensed demo media;
- the repository, judge instructions and demonstration describe reproducible behavior only.

## Judge-facing differentiation

| Product category | Primary object | Main output | Exovia difference |
|---|---|---|---|
| Code graph MCP | Source-code structure | Calls, symbols and architecture queries | Exovia handles heterogeneous evidence, AI outputs, decisions, privacy, approvals and replay |
| Document-to-skill compiler | Book or document | Agent skill files loaded on demand | EXO preserves source/chunk provenance, safety rules, human approval, privacy and integrity, then opens as a visual review graph |
| RAG or AI chat | Retrieved chunks and generated answer | Conversational answer | Exovia preserves the answer, evidence, quality findings, actors, route, approval state and proof artifact |
| Agent dashboard | Tools, jobs and status | Operational monitoring | Exovia joins operational activity to knowledge, source evidence, intent validation and human decisions |

## Integrity statement

This comparison is an evidence-based technical review, not an accusation. Similarity in a fast-moving field is not proof of copying. Exovia competes by making its architecture visible, testable and honestly bounded—not by making unsupported claims about other creators.
