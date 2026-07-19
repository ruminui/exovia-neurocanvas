# Operational Evidence — FAPI, ExiaL, EXIR and Exil

## Confirmed by recovered project records

### FAPI

Recovered handoffs record a completed cross-program wiring audit and EXAGENT executor pulse integration with status `OK`. Router documentation defines the live-style handshake and supported actions `ROUTE`, `GENERATE`, `STREAM`, `HEALTH`, `BUDGET` and `WARMUP` over the ExiaL bus.

### ExiaL Omega

Recovered implementation notes describe a binary UDP codec, sender/receiver and loopback benchmark. The archived benchmark reported approximately 29.1 microseconds average latency, p99 63.1 microseconds and roughly 34,000 messages per second for the tested frame and environment.

These values are preserved as measured historical evidence. They must be re-benchmarked on the current machine before being described as current performance.

### EXIR

Recovered EXIR documentation identifies version 0.1.0 as `MVP COMPLETE` with `33/33 tests PASS`. It describes a formal parsing and intermediate-representation pipeline for ExiaL v1, v2 and canonical ASCII formats.

### Exil

Recovered task and research records confirm Exil as a native Exovia language under active improvement alongside ExiaL, with an explicit focus on architecture, syntax and Zero-Token efficiency. A complete stable grammar was not located in the currently indexed Drive results, so NeuroCanvas implements a safe working subset for visual intent preview rather than claiming full compiler compatibility.

## Implemented now in NeuroCanvas

The public NeuroCanvas repository now contains working offline implementations of:

- ExiaL canonical text pulse parsing;
- EXIR-style canonical event records;
- conversion of pulse logs into actor, event and target graph nodes;
- animated pulse replay;
- event audit trail;
- FAPI capability mesh visualization;
- declarations for ROUTE, GENERATE, STREAM, HEALTH, BUDGET and WARMUP;
- safe Exil intent parser for MAP, FIND, FOCUS, LINK and EXPLAIN;
- validation and preview of affected graph nodes;
- explicit visual application with no external execution;
- local import and export.

## Validation boundary

There are three different meanings of “working”:

1. **Historically implemented and tested** — supported by recovered handoffs, test records or benchmark output.
2. **Implemented in the current NeuroCanvas repository** — code exists in the public repository.
3. **Revalidated today on the original Windows services** — requires access to the current local Exovia installation and its running ports/processes.

The first two are supported. The third cannot be inferred solely from archived Drive documents and should be performed when the local machine is available.

This distinction does not downgrade the work. It protects the project from replacing verified engineering evidence with an unrepeatable claim.