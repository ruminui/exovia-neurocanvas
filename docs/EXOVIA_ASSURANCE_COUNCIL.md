# Exovia Assurance Council

## Purpose

The Exovia Assurance Council turns years of Exovia agent-network work into a transparent review system for consequential AI-supported work.

It is designed for situations where one score is not enough. A launch plan can be strong on evidence but weak on privacy. A technically correct answer can still have no accountable owner. A safe route can still be impossible for another human to reproduce.

The Council therefore keeps specialist disagreement visible instead of averaging it away.

## Important boundary

The Council is **not twelve independent AI models** and does not claim model consensus.

It is a deterministic set of twelve inspectable review lenses. Every score, block, warning, handoff and recommendation is derived from submitted text, submitted evidence and documented rules. No external AI service is called.

## Twelve review lenses

| Lens | Responsibility |
|---|---|
| Core | Objective, central claim, decision and success criterion |
| Continuity | Memory, constraints, open questions, owner and next step |
| Evidence | Provenance, source coverage and evidence-bounded claims |
| QA | Unsupported numbers, overclaims, testability and reproducibility |
| Security | Prompt injection, authority changes and unsafe execution paths |
| Privacy | Credentials, personal data and minimum-necessary sharing |
| Prompt Boundary | Separation of source text, policy, intent and executable authority |
| Workflow | Reversibility, sequencing, ownership and recovery |
| FAPI / Capability | Provider-neutral local, hybrid or cloud route and controls |
| Documentation | Human understanding, reproduction and challengeability |
| Human Authority | Accountability and the right to approve, revise or reject |
| Judge | Final bounded verdict without hiding dissent |

## Outputs

The tool returns:

- one review for each role;
- a consensus score and grade;
- `ready`, `conditional` or `blocked` verdict;
- every blocking role;
- visible dissent;
- prioritized human actions;
- provider-neutral safe route;
- eleven ExiaL handoff pulses;
- eleven canonical EXIR handoff events;
- SHA-256 integrity fingerprint;
- a downloadable `neurocanvas-v3` council map;
- explicit human-approval and no-external-execution governance.

## Handoff network

```text
Core → Continuity → Evidence → QA → Judge
Security → Privacy → Prompt Boundary → Judge
Workflow → FAPI / Capability → Human Authority → Judge
Documentation → Judge
```

Every arrow is preserved as both:

- an **ExiaL pulse**, for observable role-to-role activity and replay;
- an **EXIR event**, for canonical validation, policy and human-approval state.

The same network is projected into a NeuroCanvas graph so a person can inspect every role and handoff visually.

## Why this is different

Many systems report one confidence score or ask several agents to vote. A single average can conceal a critical minority finding.

Exovia treats dissent as evidence:

- a Security block remains visible even if all other roles pass;
- a Privacy block cannot be cancelled by a high Documentation score;
- a high-consequence decision without an explicit human gate remains blocked;
- imported instructions remain data and never become executable authority;
- the final Judge lens summarizes, but does not erase specialist findings.

## Human and AI collaboration

The intended loop is:

```text
ChatGPT or another AI produces work
                 ↓
Exovia Assurance Council reviews it
                 ↓
blocking dissent and next actions stay visible
                 ↓
Council map opens in NeuroCanvas
                 ↓
human inspects evidence, changes and handoffs
                 ↓
human approves, revises or rejects
                 ↓
Context Capsule / EXO pack / Proof Pack preserves the result
```

The AI contributes speed and structure. The human retains authority, context and accountability.

## Privacy

Credential-like values and personal data are redacted from:

- role findings;
- evidence returned by the Council;
- ExiaL pulses;
- EXIR events;
- integrity artifact;
- NeuroCanvas handoff.

The report records the redaction count without returning the sensitive value.

## Judge test

From the repository root:

```bash
npm run judge
```

The automated scenario intentionally includes:

- a credential;
- personal data;
- prompt injection;
- an unsupported `40 percent` claim;
- absolute language;
- no valid human approval gate.

The expected result is:

- twelve role lenses discovered;
- verdict `blocked`;
- at least three blocking roles;
- visible Security and Privacy blocks;
- eleven ExiaL pulses;
- eleven EXIR events;
- valid SHA-256;
- importable NeuroCanvas council map;
- no sensitive demo values in any generated artifact.

## MCP tool

```text
run_assurance_council
```

Typical prompt:

> Run the Exovia Assurance Council on this proposed decision and its evidence. Keep blocking roles and dissent visible, prioritize the human actions, and create a NeuroCanvas handoff.

## Honest limitations

- Scores are heuristic and deterministic.
- The Council does not replace legal, medical, financial, security or domain-specialist review.
- It does not verify live facts unless current evidence is supplied.
- It does not approve, publish, deploy or execute anything.
- It does not claim independent model consensus.
- Its value is traceable multi-perspective review, visible dissent and accountable handoff.
