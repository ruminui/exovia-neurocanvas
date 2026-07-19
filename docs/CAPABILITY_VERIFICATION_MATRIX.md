# NeuroCanvas capability verification matrix

This document prevents product claims from outrunning evidence.

Status vocabulary:

- **IMPLEMENTED** — code and UI entry point exist.
- **AUTOMATED TESTED** — a repository test covers the behavior.
- **RUNTIME VERIFIED** — a real execution completed successfully and evidence was captured.
- **PARTIAL** — a limited workflow exists but not the full advertised capability.
- **BLOCKED** — requires credentials, account configuration or external hardware.

| Capability | Current status | Evidence gate |
|---|---|---|
| One-click Windows launcher | IMPLEMENTED | External Windows double-click test pending |
| macOS/Linux launcher | IMPLEMENTED | Device execution pending |
| Text/Markdown import | IMPLEMENTED | Browser E2E import-content assertion still required |
| JSON/ExiaL/log import | IMPLEMENTED | Per-format fixture tests still required |
| Neural/tree/pulse/FAPI views | IMPLEMENTED | Visual regression and interaction tests still required |
| Search and Zoom to Answer | IMPLEMENTED | Exact focus-path assertion still required |
| Evidence inspector | IMPLEMENTED | Exact source preservation fixture test still required |
| Persistent workspaces | AUTOMATED TESTED | Playwright reload test exists; CI result pending |
| JSON export | IMPLEMENTED | Round-trip export/import test still required |
| Local answer engine | AUTOMATED TESTED | Answer and citation UI covered; semantic quality needs human review |
| Knowledge Health | AUTOMATED TESTED | UI covered; scoring calibration needs corpus review |
| Contradiction Radar | IMPLEMENTED | Dedicated conflict fixtures still required |
| Agent Replay | AUTOMATED TESTED | UI covered; real MCP event replay still pending |
| Guided Judge Mode | IMPLEMENTED | Full timed browser test pending |
| Secondary Brain panel | AUTOMATED TESTED | Dialog opens; each connector requires separate validation |
| Obsidian/Joplin workflow | PARTIAL | Import/export based workflow; no native vault mutation claim |
| PDF workflow | PARTIAL | Do not claim universal PDF extraction or page-perfect navigation until fixtures pass |
| Wikipedia workflow | PARTIAL | Network and source-specific runtime validation pending |
| Human + AI bridge UI | AUTOMATED TESTED | Dialog and local URL covered |
| Durable MCP/hooks backend | IMPLEMENTED | Server integration tests exist; CI/runtime result pending |
| GPT-5.6 live provider | BLOCKED | Requires secure server credential and real provider call |
| Codex Session ID | BLOCKED | Requires real Codex session and `/feedback` output |
| Mobile responsive UI | AUTOMATED TESTED | Playwright Pixel viewport covered; physical device pending |
| PWA install/offline | IMPLEMENTED | HTTPS deployment and physical install test pending |
| GitHub Pages deployment | BLOCKED | Repository Pages configuration and successful manual workflow required |
| In-app System Check | IMPLEMENTED | Browser test covers PASS result on demo workspace; CI result pending |

## Release rule

A feature may appear in the submission video as fully working only after it reaches **RUNTIME VERIFIED** or after the video itself visibly demonstrates the complete behavior without cuts that hide the result.

Anything marked **PARTIAL** must be described with its actual limitation. Anything marked **BLOCKED** must not be simulated.
