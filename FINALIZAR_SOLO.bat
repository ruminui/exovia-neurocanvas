@echo off
setlocal
cd /d "%~dp0"
echo.
echo ==============================================
echo  EXOVIA NEUROCANVAS - FINALIZACION AUTONOMA
echo ==============================================
echo.
where node >nul 2>nul || (
  echo ERROR: Node.js 24 no esta instalado o no esta en PATH.
  pause
  exit /b 1
)
for /f "tokens=1 delims=." %%V in ('node -p "process.versions.node"') do set NODE_MAJOR=%%V
if %NODE_MAJOR% LSS 24 (
  echo ERROR: Se necesita Node.js 24 o superior.
  node -v
  pause
  exit /b 1
)
if not exist package-lock.json (
  echo AVISO: Falta package-lock.json autentico.
  echo Se generara con npm usando este entorno Node 24.
  call npm install --package-lock-only --ignore-scripts --no-audit --no-fund
  if errorlevel 1 (
    echo ERROR: No se pudo generar package-lock.json.
    pause
    exit /b 1
  )
)
if not exist node_modules (
  echo Instalando dependencias reproducibles...
  call npm ci --no-audit --no-fund
  if errorlevel 1 (
    echo ERROR: npm ci fallo.
    pause
    exit /b 1
  )
)
echo Instalando Chromium para las pruebas si hace falta...
call npx playwright install chromium
if errorlevel 1 (
  echo ERROR: No se pudo instalar Chromium.
  pause
  exit /b 1
)
echo Ejecutando cierre autonomo completo...
call npm run finish:solo
set RESULT=%ERRORLEVEL%
echo.
if %RESULT% EQU 0 (
  echo FINALIZACION TECNICA COMPLETADA SIN FALLOS DETECTADOS.
) else (
  echo SE DETECTARON FALLOS. Revisar artifacts\solo-finish\
)
echo.
pause
exit /b %RESULT%
