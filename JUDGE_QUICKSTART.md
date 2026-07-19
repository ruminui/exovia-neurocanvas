# Exovia NeuroCanvas — Judge Quickstart

## Run

```bash
python -m http.server 8080
```

Open `http://localhost:8080` in Chrome, Edge or Firefox.

No account, API key, dependency installation, database or build step is required.

## Three-minute evaluation path

1. Select **Load knowledge demo**.
2. Pan and zoom the neural map.
3. Select **Tree** to inspect hierarchy.
4. Search for `evidence`, `privacy` or `Zoom to Answer`.
5. Select a highlighted node and inspect exact source evidence.
6. Select **Pulse**, then **Play pulses** to replay the ExiaL audit sequence.
7. Select **FAPI** to inspect the read-only capability mesh.
8. Select **Exil intent**, validate the included intent and apply its visual focus.
9. Export the project as JSON.

## What is implemented in the public MVP

- local document ingestion and chunking;
- keyword extraction and similarity scoring;
- hierarchical and semantic graph construction;
- infinite pan and zoom canvas;
- Zoom to Answer;
- exact evidence inspection;
- ExiaL pulse parsing and replay;
- EXIR-style canonical event records;
- FAPI capability visualization;
- safe Exil intent parsing, validation and visual application;
- audit trail;
- JSON import/export;
- offline cache and installable PWA shell;
- keyboard navigation and accessible interaction labels.

## Safety model

- core processing remains local;
- no API secret is embedded;
- FAPI mode is read-only;
- Exil cannot execute external services;
- visual mutations require validation and an explicit user action;
- historical Exovia evidence is separated from current repository claims.

## Keyboard shortcuts

- `/` — focus search
- `Alt+1` — Neural
- `Alt+2` — Tree
- `Alt+3` — Pulse
- `Alt+4` — FAPI
- `Esc` — close dialogs
