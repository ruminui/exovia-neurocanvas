# Quick Test Matrix

| Platform | Entry point | Expected first success |
|---|---|---|
| Any OS with Node.js 22+ | `npm run judge` | Judge preflight, MCP judge and artifact audit PASS |
| Windows with Node.js 24+ | `INICIAR_EXOVIA.bat` | Browser opens at `127.0.0.1:8080` and New workspace works |
| macOS with Node.js 24+ | `INICIAR_EXOVIA.command` | Browser opens and evidence nodes are selectable |
| Linux with Node.js 24+ | `INICIAR_EXOVIA.sh` | Browser opens and export creates JSON |
| Android | verified `android-latest` APK | Application opens and New workspace is usable |
| Docker | `cd chatgpt-app && docker compose up --build` | `/health` returns `ok: true` |
| ChatGPT Developer Mode | public HTTPS `/mcp` endpoint | Seven tools and black-and-gold widget load |

Never use private credentials or confidential source material in a public test.
