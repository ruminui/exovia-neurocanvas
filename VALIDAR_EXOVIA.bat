@echo off
setlocal
cd /d "%~dp0"
title Exovia NeuroCanvas - Validacion completa

echo ==========================================================
echo   EXOVIA NEUROCANVAS - VALIDACION COMPLETA
echo ==========================================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 24 LTS o superior no esta instalado.
  echo Descargalo desde https://nodejs.org y volve a ejecutar este archivo.
  pause
  exit /b 1
)

for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set NODE_MAJOR=%%V
if %NODE_MAJOR% LSS 24 (
  echo [ERROR] Se requiere Node.js 24 LTS o superior.
  node --version
  pause
  exit /b 1
)

echo Node detectado:
node --version
echo.

echo [1/5] Generando evidencia del entorno...
call node scripts\collect-qa-evidence.mjs
if errorlevel 1 goto :failed

echo [2/5] Instalando dependencias de prueba...
if exist package-lock.json (
  call npm ci --no-audit --no-fund
) else (
  echo [AVISO] package-lock.json no existe. Se usara npm install y el resultado no sera totalmente reproducible.
  call npm install --no-audit --no-fund
)
if errorlevel 1 goto :failed

echo [3/5] Instalando Chromium para Playwright...
call npx playwright install chromium
if errorlevel 1 goto :failed

echo [4/5] Ejecutando validacion completa...
call npm run verify
if errorlevel 1 goto :failed

echo [5/5] Validando backend local...
pushd server
call npm run verify
set BACKEND_RESULT=%ERRORLEVEL%
popd
if not "%BACKEND_RESULT%"=="0" goto :failed

echo.
echo ==========================================================
echo   RESULTADO: TODAS LAS VALIDACIONES PASARON
echo ==========================================================
echo Evidencia del entorno:
echo   artifacts\qa-environment.json
echo   artifacts\qa-environment.txt
echo Informe de readiness:
echo   artifacts\release-readiness.json
pause
exit /b 0

:failed
echo.
echo ==========================================================
echo   RESULTADO: HAY VALIDACIONES FALLIDAS
echo ==========================================================
echo Conserva los archivos de artifacts y copia o captura el primer error completo.
echo Consulta docs\MARCE_GASTON_HELP_PLAN.md para preparar la entrega de evidencia.
pause
exit /b 1
