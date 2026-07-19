# Exovia NeuroCanvas — Release Status

Cycle: NC-PRODUCTION-20260719-C1
Status: ACTIVE / IMPLEMENTED WITH RUNTIME VALIDATION PENDING

## HECHO

- Public repository established.
- Offline-first knowledge map runtime.
- Neural, tree, pulse and capability views.
- Exact evidence inspector.
- Zoom to Answer search and camera focus.
- ExiaL parsing and pulse replay.
- EXIR-style canonical event representation.
- Safe Exil intent parsing, validation and visual preview.
- FAPI capability visualization in read-only mode.
- Persistent workspace using browser storage.
- Project library, editing, deletion, duplication and snapshots.
- Import and export paths.
- PWA manifest and service worker.
- Judge quickstart, architecture, submission and operational evidence documentation.
- Canonical Exovia execution protocol activated in-repository.

## BASE VERIFICADA

Repository commits prove the implementation exists. Recent production commits include persistent workspace, editable graph runtime and offline asset caching.

This does not yet prove every flow executes correctly in a physical browser after the latest changes.

## VALIDACIÓN ACTUAL

- Repository presence: VERIFIED.
- Source inspection: VERIFIED.
- Git commit lineage: VERIFIED.
- Browser runtime after latest production changes: PENDING.
- Cross-browser regression: PENDING.
- IndexedDB persistence after reload: PENDING.
- Import/export round trip: PENDING.
- Service-worker update behavior: PENDING.
- Devpost final submission: BLOCKED by video, image, Codex feedback session and user legal acceptance.

## CRITICAL QA MATRIX

- [ ] App starts through a local HTTP server.
- [ ] No blocking console errors.
- [ ] Knowledge demo loads.
- [ ] Real pasted document produces a usable map.
- [ ] TXT import succeeds.
- [ ] Markdown import succeeds.
- [ ] Valid project JSON import succeeds.
- [ ] Invalid JSON is rejected safely.
- [ ] ExiaL import creates pulses and audit records.
- [ ] Search returns relevant nodes.
- [ ] Zoom to Answer focuses the selected evidence.
- [ ] Node creation persists.
- [ ] Node editing persists.
- [ ] Node deletion requires confirmation and persists.
- [ ] Snapshot restores prior state.
- [ ] Project duplication creates an independent copy.
- [ ] Export can be re-imported without data loss.
- [ ] Offline reload works after first successful load.
- [ ] Service worker upgrades to the current asset set.
- [ ] Exil invalid commands are rejected.
- [ ] Exil preview causes no external execution.
- [ ] FAPI mode remains read-only.
- [ ] Keyboard navigation and focus states are usable.
- [ ] Judge flow completes in under three minutes.

## BLOQUEOS

1. A real browser execution environment is required to validate runtime behavior.
2. A substantial Codex session is required for the official feedback Session ID.
3. Devpost account actions, media upload and legal acceptance require Luciano's authenticated session.
4. Live FAPI router validation requires the original local Windows services.

## PENDIENTE PRIORIZADO

P0 — Release blockers

- Full browser smoke test and correction loop.
- Verify storage migration and persistence.
- Verify all imported project schemas.
- Confirm service-worker cache versioning.
- Produce final screenshots and video.
- Complete a genuine Codex audit and obtain feedback ID.

P1 — Product hardening

- Formal JSON schema and migration versioning.
- Search indexing for large corpora.
- Progressive rendering for large graphs.
- Undo/redo transaction history.
- User-controlled project backup bundle.
- Better mobile and narrow-screen navigation.

P2 — Connected architecture

- Secure optional OpenAI server provider.
- MCP tools.
- Permissioned live FAPI adapter.
- Real-time ExiaL streaming.
- Formal Exil compiler pipeline.

## SIGUIENTE ACCIÓN

Open the repository in Codex and execute the Production Finisher cycle against the P0 matrix. Every failed item must be fixed in the same session before claiming release readiness. Preserve the resulting Codex Session ID for Devpost.
