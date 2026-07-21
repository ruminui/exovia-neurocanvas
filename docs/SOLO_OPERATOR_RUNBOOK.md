# Exovia NeuroCanvas — Solo Operator Runbook

Este documento parte de una regla: **la entrega debe poder cerrarse aunque nadie externo ayude**.

## Objetivo

Permitir que Luciano prepare, valide, diagnostique y entregue NeuroCanvas con un flujo reproducible y sin depender de Marce, Gastón u otros colaboradores.

## Botón principal en Windows

Ejecutar:

```text
FINALIZAR_SOLO.bat
```

El script:

1. verifica Node.js 24 o superior;
2. genera un `package-lock.json` auténtico mediante npm si todavía falta;
3. instala dependencias con `npm ci`;
4. instala Chromium para Playwright;
5. ejecuta frontend, backend, readiness, pruebas unitarias y pruebas de navegador;
6. conserva logs y un informe JSON en `artifacts/solo-finish/`;
7. termina con código distinto de cero cuando existe un fallo real.

## Comando equivalente

```bash
npm run finish:solo
```

Este comando no instala dependencias. Está pensado para un entorno ya preparado.

## Evidencia generada

```text
artifacts/solo-finish/solo-finish-report.json
artifacts/solo-finish/*.log
artifacts/release-readiness.json
playwright-report/
test-results/
```

No borrar estos archivos antes de revisar los resultados.

## Regla de interpretación

- `PASS`: la fase terminó con código 0.
- `FAIL`: la fase se ejecutó y falló.
- `BLOCKED`: falta una condición externa o un artefacto legítimo.
- `SKIPPED`: fue omitida explícitamente.

La existencia del código no se considera prueba aprobada.

## Corrección en bucle

Cuando algo falle:

1. abrir el log exacto;
2. corregir únicamente la causa observada;
3. volver a ejecutar `FINALIZAR_SOLO.bat`;
4. comprobar que el fallo desapareció y que no apareció una regresión;
5. conservar el nuevo informe.

## Trabajo que todavía exige una cuenta, no otra persona

Luciano puede realizarlo personalmente:

- habilitar GitHub Pages;
- comprobar la URL pública;
- completar Devpost;
- obtener un Codex `/feedback` auténtico desde una sesión propia;
- subir la imagen;
- publicar el video cuando esté listo.

Ninguna de estas tareas debe marcarse como terminada antes de observar el resultado en la cuenta correspondiente.

## Modo sin Playwright temporal

Solo para diagnosticar fases anteriores:

Windows PowerShell:

```powershell
$env:EXOVIA_SKIP_E2E='1'; npm run finish:solo
```

Esto no sirve como validación final. La entrega final requiere las pruebas E2E.

## Criterio de cierre técnico

El cierre técnico autónomo requiere:

- `package-lock.json` real;
- `npm ci` correcto;
- frontend sin errores;
- backend sin errores;
- pruebas unitarias aprobadas;
- Playwright aprobado;
- reporte de readiness sin `FAIL`;
- app pública y offline verificadas por Luciano.

El video se gestiona aparte y no forma parte de este runbook.
