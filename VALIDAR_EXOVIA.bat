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

echo [1/4] Instalando dependencias de prueba...
if exist package-lock.json (
  call npm ci --no-audit --no-fund
) else (
  echo [AVISO] package-lock.json no existe. Se usara npm install y el resultado no sera totalmente reproducible.
  call npm install --no-audit --no-fund
)
if errorlevel 1 goto :failed

echo [2/4] Instalando Chromium para Playwright...
call npx playwright install chromium
if errorlevel 1 goto :failed

echo [3/4] Ejecutando validacion completa...
call npm run verify
if errorlevel 1 goto :failed

echo [4/4] Validando backend local...
pushd server
call npm run verify
set BACKEND_RESULT=%ERRORLEVEL%
popd
if not "%BACKEND_RESULT%"=="0" goto :failed

echo.
echo ==========================================================
echo   RESULTADO: TODAS LAS VALIDACIONES PASARON
echo ==========================================================
echo El informe de readiness esta en artifacts\release-readiness.json
pause
exit /b 0

:failed
echo.
echo ==========================================================
echo   RESULTADO: HAY VALIDACIONES FALLIDAS
echo ==========================================================
echo Copia o captura el error mostrado arriba y compartilo con el equipo.
pause
exit /b 1
