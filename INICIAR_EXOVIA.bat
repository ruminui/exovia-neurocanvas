@echo off
setlocal
cd /d "%~dp0"
title Exovia NeuroCanvas

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js no esta instalado.
  echo Descargalo desde https://nodejs.org y elegi Node.js 24 LTS o superior.
  echo Luego cerra esta ventana y hace doble clic nuevamente en INICIAR_EXOVIA.bat
  echo.
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set NODE_MAJOR=%%V
if %NODE_MAJOR% LSS 24 (
  echo.
  echo [ERROR] Se requiere Node.js 24 LTS o superior.
  echo Version encontrada:
  node --version
  echo Actualiza Node.js desde https://nodejs.org y volve a intentarlo.
  echo.
  pause
  exit /b 1
)

echo Iniciando Exovia NeuroCanvas con Node.js %NODE_MAJOR%...
node scripts\launch.mjs

if errorlevel 1 (
  echo.
  echo No se pudo iniciar la aplicacion.
  echo Revisa el archivo LEEME_PRIMERO.txt o manda una captura de esta ventana.
  echo.
  pause
)