@echo off
setlocal
cd /d "%~dp0"
title Exovia NeuroCanvas

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo [ERROR] Node.js no esta instalado.
  echo Descargalo desde https://nodejs.org y elegi la version LTS.
  echo Luego cerra esta ventana y hace doble clic nuevamente en INICIAR_EXOVIA.bat
  echo.
  pause
  exit /b 1
)

echo Iniciando Exovia NeuroCanvas...
node scripts\launch.mjs

if errorlevel 1 (
  echo.
  echo No se pudo iniciar la aplicacion.
  echo Revisa el archivo LEEME_PRIMERO.txt o manda una captura de esta ventana.
  echo.
  pause
)
