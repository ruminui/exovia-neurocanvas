#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no esta instalado. Instala Node.js 24 LTS o superior desde https://nodejs.org"
  exit 1
fi

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "$NODE_MAJOR" -lt 24 ]; then
  echo "Se requiere Node.js 24 LTS o superior. Version encontrada: $(node --version)"
  exit 1
fi

node scripts/launch.mjs
