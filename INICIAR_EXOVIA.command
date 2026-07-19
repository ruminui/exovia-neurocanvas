#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js no esta instalado. Instala la version LTS desde https://nodejs.org"
  read -r -p "Presiona Enter para cerrar..."
  exit 1
fi

node scripts/launch.mjs
