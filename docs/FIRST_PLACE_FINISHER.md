# Exovia NeuroCanvas — First Place Finisher

Status: IMPLEMENTED / RUNTIME VALIDATION PENDING

## Product center

NeuroCanvas is not presented as a collection of importers. Its center is one verifiable workflow:

1. Add knowledge.
2. Ask a complex question.
3. Navigate to the answer.
4. Inspect exact evidence.
5. Detect contradictions and missing provenance.
6. Replay human and agent activity.
7. Review every mutation.

## Implemented differentiators

### Evidence Answer Contract

Every answer returns:

- query;
- synthesized answer;
- confidence estimate;
- ranked citations;
- exact excerpts;
- source metadata when available;
- engine identity and generation time.

The current engine is deterministic and local. It does not pretend to be GPT-5.6. A future server-side GPT-5.6 provider must preserve the same evidence contract and may improve synthesis but may not remove citations.

### Contradiction Radar

The local analyzer finds candidate conflicts across separate nodes, initially focused on dates, status/version claims and normative statements. Results are explicitly candidates for human review, not infallible facts.

### Knowledge Health

The health report measures:

- evidence-free nodes;
- missing provenance;
- broken edges;
- orphan nodes;
- duplicate titles;
- contradiction candidates.

It produces a visible score and concrete issue lists.

### Human and Agent Replay

Audit entries and ExiaL-style events are merged chronologically into a replayable sequence showing actor, time, operation and detail.

### Guided Judge Mode

A guided experience demonstrates:

- workspace creation;
- a complex evidence question;
- knowledge health;
- agent/human replay.

This is a deterministic in-product path for recording the final video. Timing and runtime behavior still require browser validation.

## GPT-5.6 provider boundary

A secure provider may be added only in the backend. Required input:

```json
{
  "question": "string",
  "evidence": [
    { "node_id": "string", "title": "string", "excerpt": "string", "source": {} }
  ]
}
```

Required output:

```json
{
  "answer": "string",
  "citations": [1, 2],
  "uncertainties": ["string"],
  "contradictions": ["string"]
}
```

Rules:

- no browser API key;
- no unsupported claims;
- citations must refer only to supplied evidence;
- provider failure falls back to the local engine;
- model output remains reviewable and auditable;
- the README and video must distinguish local deterministic behavior from live GPT behavior.

## Remaining first-place gates

- execute frontend syntax and integration checks;
- execute backend tests;
- validate on desktop and mobile browsers;
- test the guided flow in under three minutes;
- connect a genuine GPT-5.6 server provider when credentials are available;
- obtain authentic Codex session evidence when Codex is available;
- record a real product video;
- create screenshots from the running application;
- verify public deployment.

No unexecuted gate may be marked complete.
