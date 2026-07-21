# EXO Capability Pack v1

Reviewed on **2026-07-21** for OpenAI Build Week.

## Purpose

An `.exo` file is a transparent, source-linked capability package for humans and AI agents. It preserves reusable knowledge without turning a document into an opaque prompt, trained model or automatically executable plugin.

The format learns from broad industry patterns such as progressive context loading, MCP tools and structured knowledge packaging, but its implementation and schema are original to Exovia NeuroCanvas. No code from the adjacent projects reviewed by this submission is copied into the compiler.

## Core design goals

1. **Human inspectability** — the file is plain JSON and can be opened without proprietary software.
2. **Source provenance** — every reusable fragment retains a source ID, chunk ID and content hash.
3. **Progressive disclosure** — agents load the compact manifest and index first, then retrieve only the chunks needed for the current task.
4. **Privacy before export** — credential-like values and personal contact data are replaced before the package leaves the compiler.
5. **No hidden execution** — extracted procedures are information, not permission to perform actions.
6. **Human control** — consequential actions always require explicit approval.
7. **Integrity** — the package receives a SHA-256 fingerprint covering every field except the integrity block itself.
8. **Honest source-rights boundary** — the compiler does not claim to verify whether a user is authorized to package supplied material.

## File extension and encoding

Recommended filename:

```text
project-name.exo
```

Encoding:

```text
UTF-8 JSON
```

MIME type for downloads:

```text
application/json
```

The custom extension communicates purpose; it does not hide or encrypt the content.

## Top-level structure

```json
{
  "format": "exo-capability-pack-v1",
  "kind": "exo_capability_pack",
  "createdAt": "2026-07-21T00:00:00.000Z",
  "title": "Reliable AI operations",
  "objective": "Help humans and agents reuse verified operating knowledge",
  "language": "es",
  "sourceType": "mixed",
  "manifest": {},
  "progressiveDisclosure": {},
  "capability": {},
  "sources": [],
  "chunks": [],
  "searchIndex": {},
  "glossary": [],
  "procedures": [],
  "constraints": [],
  "evidenceRules": [],
  "privacy": {},
  "integrity": {}
}
```

## Manifest

The manifest declares the safety, execution and intellectual-property boundary:

```json
{
  "product": "Exovia NeuroCanvas",
  "layers": ["NeuroCanvas", "ProofLayer", "ExiaL", "EXIR", "Exil", "FAPI"],
  "humanApprovalRequired": true,
  "externalActionsExecuted": false,
  "generatedLocally": true,
  "persistedByServer": false,
  "bundledThirdPartyRuntimeCode": false,
  "adjacentProjectCodeCopied": false,
  "sourceRightsVerifiedByCompiler": false
}
```

The fields mean:

- `bundledThirdPartyRuntimeCode:false` — the generated data package does not add executable third-party runtime code;
- `adjacentProjectCodeCopied:false` — the Exovia compiler does not copy code from the adjacent projects reviewed in this repository;
- `sourceRightsVerifiedByCompiler:false` — the compiler cannot determine whether the user owns or is authorized to use supplied source material.

Source content and executable runtime code are different things. A user may intentionally provide licensed third-party text or code as inspectable source data. The user remains responsible for authorization, attribution, license notices and any restrictions that apply.

## Source records

Each source receives:

- stable package-local ID;
- title;
- source type;
- optional URL supplied by the user;
- short summary;
- ordered chunk IDs;
- estimated token count;
- SHA-256 content hash.

Example:

```json
{
  "id": "source-1",
  "title": "Operations manual",
  "type": "policy",
  "url": null,
  "summary": "Production changes require human approval.",
  "chunkIds": ["source-1-chunk-1"],
  "estimatedTokens": 180,
  "contentHash": "..."
}
```

## Evidence chunks

Chunks preserve inspectable content and provenance:

```json
{
  "id": "source-1-chunk-1",
  "sourceId": "source-1",
  "order": 1,
  "title": "Approval rules",
  "text": "Production changes require human approval.",
  "estimatedTokens": 12,
  "keywords": ["production", "changes", "approval"],
  "contentHash": "..."
}
```

An AI should cite both source and chunk IDs when using a claim from the package.

## Progressive disclosure

The compiler reports:

- estimated total source tokens;
- estimated compact index tokens;
- estimated initial reduction percentage;
- requested token budget;
- an explicit `index-first-on-demand` loading strategy.

The estimate uses a transparent character-based heuristic. It is useful for comparison and planning, but it is not a tokenizer benchmark and must not be described as exact provider billing or guaranteed savings.

Recommended agent behavior:

```text
1. Read manifest, source summaries, glossary and search index.
2. Identify relevant source and chunk IDs.
3. Load only those chunks.
4. Preserve IDs in the final answer.
5. Separate source observation from inference.
6. State unknowns, conflicts and missing evidence.
```

## Procedures and constraints

The deterministic compiler extracts likely procedures and restrictions using visible text patterns.

Examples:

```json
"procedures": [
  "1. Import the original evidence.",
  "2. Scan the AI answer for unsupported claims."
]
```

```json
"constraints": [
  "Production changes require human approval.",
  "The agent must not execute external actions."
]
```

These lists are heuristic navigation aids. They do not replace the original source, prove that a procedure is correct or authorize execution.

## Capability contract

```json
{
  "allowedActions": ["inspect", "search", "summarize", "compare", "cite", "propose"],
  "prohibitedActions": [
    "execute_external_action_without_approval",
    "hide_source_ids",
    "invent_missing_evidence",
    "restore_redacted_values"
  ],
  "approvalPolicy": "explicit-human-approval-for-consequential-actions"
}
```

This contract is the connection point to future Exil and FAPI work. A production execution layer would still need authentication, authorization, policy validation, preview and explicit confirmation.

## Privacy

Before export, the compiler replaces recognized patterns such as:

- API-key and credential-like strings;
- private-key headers;
- email addresses;
- common Argentine telephone or identifier patterns.

The package records the total redaction count. Pattern-based redaction cannot guarantee detection of every sensitive value, so human review remains necessary.

## Integrity verification

The compiler sorts object keys recursively and hashes the package without its `integrity` field:

```json
{
  "algorithm": "SHA-256",
  "hash": "64-lowercase-hex-characters",
  "scope": "all-package-fields-except-integrity"
}
```

The hash detects modifications. It does not prove that a source was truthful, complete, licensed or supplied by an authorized person.

## NeuroCanvas import

The web and Android application accept `.exo` files. On import, NeuroCanvas converts the package into a `neurocanvas-v3` graph with:

- root package node;
- source nodes;
- evidence chunk nodes;
- procedure group;
- constraint group;
- glossary concepts;
- allowed and prohibited action groups;
- audit record containing the supplied integrity fingerprint.

This creates the human side of the workflow:

```text
AI compiles reusable knowledge
            ↓
     transparent .exo file
            ↓
NeuroCanvas visual inspection
            ↓
 human correction and approval
            ↓
 Context Capsule or Proof Pack
```

## Build Week compliance

The feature was implemented during the submission period as an original extension of Exovia NeuroCanvas. It does not import code from the adjacent public repositories reviewed in [`ORIGINALITY_AND_DIFFERENTIATION.md`](ORIGINALITY_AND_DIFFERENTIATION.md).

When a user packages third-party documents, code or data, that user must have authorization and comply with relevant licenses or terms. Generated EXO packs should retain source attribution and must not be used to conceal, relicense or redistribute protected material unlawfully.

## Current limitations

- extraction is heuristic rather than semantic-model-based;
- token estimates are approximate;
- URLs are retained only when supplied, not fetched;
- the compiler does not verify legal rights to source material;
- the compiler does not train a model;
- the compiler does not install a skill;
- the compiler does not execute a procedure;
- full Exil compilation and live FAPI execution remain roadmap work.
