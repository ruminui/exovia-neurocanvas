# Plan final de ayuda para Marce y Gastón

## Estado actual

La imagen principal ya está preparada. La prioridad restante es:

1. producir un video claro de menos de tres minutos;
2. confirmar que la aplicación funciona desde una descarga limpia;
3. conservar evidencia de cualquier error antes de entregar.

## La explicación que ambos deben entender

> Exovia NeuroCanvas convierte documentos, notas y actividad de IA dispersa en un espacio visual donde cada respuesta y decisión puede verificarse contra evidencia exacta.

### Problema real

Las personas y equipos usan documentos, notas y respuestas de IA, pero después cuesta saber:

- de dónde salió una respuesta;
- qué evidencia la sostiene;
- si la información está incompleta o se contradice;
- qué hizo una persona, workflow o agente;
- por qué se tomó una decisión.

### Resultado para el usuario

El usuario importa información, hace una pregunta, navega a la respuesta, inspecciona la fuente, revisa la calidad del conocimiento y reproduce cómo se llegó a la decisión.

### Diferencia frente a un chat común

Un chat entrega respuestas. NeuroCanvas conserva un proyecto visual persistente con evidencia, relaciones, actores, acciones, calidad y decisiones.

## Marce — prioridad absoluta: video

Leer primero:

- [`VIDEO_SCRIPT_MARCE.md`](VIDEO_SCRIPT_MARCE.md)

Marce no necesita improvisar ni describir todas las funcionalidades. Debe mostrar un solo caso de uso completo:

```text
Información dispersa
→ mapa visual
→ pregunta
→ respuesta
→ evidencia exacta
→ calidad del conocimiento
→ replay humano/IA
→ Living Evidence Room
```

### Pregunta preparada

```text
How does NeuroCanvas keep AI answers connected to evidence?
```

Debe probarse antes de grabar.

### Qué mostrar

1. Mapa principal.
2. Un nodo seleccionado y Evidence Inspector.
3. Answer & Audit.
4. Navigate to Answer.
5. Knowledge Health.
6. Contradiction Radar durante pocos segundos.
7. Agent Replay.
8. Live room.
9. Project room into graph.
10. Cierre con el mapa proyectado.

### Qué no mostrar ni explicar

- instalación de Neko o n8n;
- CRDT, WebRTC o JSON Schema;
- Node.js o service workers;
- todos los botones;
- funciones futuras como si estuvieran operativas;
- errores, notificaciones, archivos privados o tokens.

### Criterio de aprobación del video

Una persona que nunca vio NeuroCanvas debe poder responder:

1. ¿Qué problema resuelve?
2. ¿Quién lo usaría?
3. ¿Qué hace el usuario?
4. ¿Qué resultado obtiene?
5. ¿Por qué es diferente de un chat común?

Duración máxima: **2:45 recomendada; nunca superar 3:00**.

## Gastón — prioridad: prueba externa

### Inicio limpio

1. Descargar un ZIP nuevo.
2. Extraerlo completamente.
3. Confirmar Node.js 24 LTS o superior.
4. Ejecutar `INICIAR_EXOVIA.bat`.
5. Crear `New workspace`.
6. Ejecutar `System check`.
7. Guardar captura completa.

### Validación completa

Ejecutar:

```text
VALIDAR_EXOVIA.bat
```

Conservar:

- carpeta `artifacts`;
- captura del resultado final;
- primer error completo cuando falle;
- versión de Windows y Node;
- fecha o commit probado.

### Recorrido mínimo

- New workspace;
- seleccionar evidencia;
- Answer & Audit;
- Navigate to Answer;
- Knowledge Health;
- Agent Replay;
- Live room;
- Project room into graph;
- Export;
- recargar y confirmar persistencia.

### Pruebas adicionales prioritarias

- cerrar por completo y volver a abrir el navegador;
- exportar y reimportar JSON;
- probar TXT y Markdown;
- abrir una vez online, desconectar la red y recargar;
- probar la interfaz desde celular;
- registrar botones sin respuesta, texto cortado o demoras.

## Formato de errores

```text
TESTER:
FECHA:
COMMIT O FECHA DEL ZIP:
DISPOSITIVO:
SISTEMA OPERATIVO:
NODE:
NAVEGADOR:
FUNCIÓN:
PASOS:
RESULTADO ESPERADO:
RESULTADO REAL:
SE REPITE: Sí / No
MENSAJE COMPLETO:
SYSTEM CHECK:
CAPTURA O VIDEO:
GRAVEDAD: bloqueante / importante / menor / sugerencia
```

## Carpeta de entrega

```text
QA_MARCE_GASTON_YYYY-MM-DD/
├── VIDEO_FINAL/
├── SYSTEM_CHECK/
├── VALIDACION/
├── ERRORES/
├── MOVIL/
├── OFFLINE/
└── REPORTE.txt
```

## Regla final

No necesitamos que Marce memorice la arquitectura ni que Gastón interprete los errores. Necesitamos:

- que Marce comunique una historia simple y creíble;
- que Gastón conserve evidencia técnica completa;
- que ninguna afirmación del video sea mayor que lo demostrado en pantalla.
