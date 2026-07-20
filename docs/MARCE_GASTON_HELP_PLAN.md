# Plan de ayuda para Marce y Gastón

Este documento explica exactamente dónde necesitamos ayuda externa y cómo colaborar sin tocar partes sensibles del proyecto.

## Objetivo

Transformar Exovia NeuroCanvas de un release candidate avanzado en una entrega demostrablemente terminada.

La prioridad no es agregar funciones al azar. La prioridad es conseguir evidencia real de que la aplicación:

- abre en otra computadora;
- funciona para una persona que no la desarrolló;
- conserva proyectos;
- importa y exporta correctamente;
- funciona en celular;
- comunica su valor en menos de tres minutos;
- no muestra errores, secretos ni funciones falsas.

## Roles sugeridos

### Marce — experiencia, demo y comunicación

Marce puede concentrarse en:

- probar la aplicación como usuario nuevo;
- señalar pasos confusos;
- cronometrar la demostración;
- grabar o ayudar a editar el video;
- revisar pronunciación, subtítulos y textos en inglés;
- elegir las capturas más claras;
- comprobar que el mensaje se entiende en menos de 30 segundos.

### Gastón — prueba técnica externa y evidencia

Gastón puede concentrarse en:

- descargar un ZIP limpio;
- instalar o confirmar Node.js 24 LTS;
- ejecutar el iniciador de Windows;
- ejecutar `VALIDAR_EXOVIA.bat`;
- probar persistencia, importación, exportación y offline;
- registrar mensajes de consola;
- enviar capturas, videos y pasos exactos de cada error.

Los roles pueden intercambiarse. Lo importante es que una persona haga la prueba de usuario y otra conserve evidencia técnica.

## Tarea 1 — prueba limpia en otra computadora

1. Descargar el repositorio como ZIP.
2. Extraerlo completamente en una carpeta nueva.
3. Confirmar Node.js 24 o superior:

```text
node --version
```

4. Ejecutar:

```text
INICIAR_EXOVIA.bat
```

5. Registrar:

- si el navegador se abrió solo;
- cuánto tardó;
- dirección mostrada;
- cualquier mensaje de la ventana negra;
- cualquier error visual.

6. Crear `New workspace`.
7. Abrir `System check`.
8. Guardar una captura completa del resultado.

Resultado esperado:

```text
La aplicación abre sin ayuda manual y System Check no muestra fallos.
```

## Tarea 2 — validación completa

Ejecutar:

```text
VALIDAR_EXOVIA.bat
```

No cerrar la ventana hasta que termine.

Guardar:

- captura del resultado final;
- texto del primer error, cuando falle;
- carpeta `artifacts`;
- carpeta `playwright-report`, cuando exista;
- versión de Windows;
- versión de Node;
- commit o fecha del ZIP probado.

No es necesario interpretar el error. Es más útil conservarlo completo.

## Tarea 3 — recorrido principal

Comprobar uno por uno:

- `New workspace`;
- mover y ampliar el mapa;
- seleccionar un nodo;
- leer Evidence Inspector;
- abrir Answer & Audit;
- hacer una pregunta;
- usar Navigate to Answer;
- abrir Knowledge Health;
- abrir Contradiction Radar;
- abrir Agent Replay;
- abrir Live room;
- usar `Project room into graph`;
- exportar el proyecto;
- recargar la página;
- confirmar que el proyecto continúa disponible.

Registrar cualquier botón que:

- no haga nada;
- tarde demasiado;
- muestre texto cortado;
- cierre una ventana inesperadamente;
- resulte difícil de entender.

## Tarea 4 — Live room

La nueva demostración debe mostrar:

- tres participantes;
- evidencias multimedia;
- una decisión;
- una ejecución;
- una línea temporal;
- el aviso que aclara que el multiusuario real todavía no está desplegado.

Después pulsar:

```text
Project room into graph
```

Confirmar que aparecen nodos de:

- sala;
- persona;
- agente;
- workflow;
- video;
- decisión;
- ejecución.

Confirmar también que se pueden seleccionar y buscar.

## Tarea 5 — importación y exportación

Probar con archivos sin datos privados:

- TXT;
- Markdown;
- JSON exportado por NeuroCanvas;
- texto en español con ñ y tildes;
- archivo log o ExiaL de ejemplo.

Después:

1. exportar el proyecto;
2. abrir el JSON exportado;
3. comprobar que nodos y conexiones siguen presentes;
4. informar cualquier pérdida de texto o evidencia.

## Tarea 6 — persistencia

1. Crear un proyecto.
2. Guardarlo.
3. Recargar la página.
4. Cerrar completamente el navegador.
5. Abrir nuevamente la aplicación.
6. Confirmar que el proyecto sigue disponible.
7. Duplicar el proyecto.
8. Modificar solo la copia.
9. Confirmar que el original no cambió.
10. Crear y restaurar un snapshot.

## Tarea 7 — prueba móvil

Abrir la versión pública o una URL local accesible desde el celular.

Comprobar:

- botones táctiles;
- ancho de pantalla;
- paneles cortados;
- desplazamiento;
- canvas;
- diálogos;
- Live room;
- orientación vertical y horizontal.

Grabar un video corto cuando algo no funcione.

## Tarea 8 — prueba offline

Después de una primera carga completa:

1. abrir la aplicación;
2. abrir `Live room` al menos una vez;
3. activar modo avión o desconectar la red;
4. recargar;
5. abrir New workspace;
6. abrir Live room nuevamente.

Resultado esperado: los recursos ya almacenados continúan funcionando.

## Tarea 9 — evaluación de la demo

Cronometrar este recorrido:

```text
Problema
→ New workspace
→ evidencia
→ Answer & Audit
→ Navigate to Answer
→ Knowledge Health
→ Agent Replay
→ Live room
→ Project room into graph
→ cierre
```

Objetivo: menos de tres minutos sin correr ni ocultar errores.

Responder:

- ¿Se entiende el problema en 15 segundos?
- ¿Se entiende la diferencia frente a un chat común?
- ¿La función más impresionante aparece antes del minuto 1:30?
- ¿Live room suma valor o distrae?
- ¿Qué parte eliminarían del video?

## Qué capturas necesitamos

- portada del mapa principal;
- evidencia seleccionada;
- Answer & Audit con citas;
- Knowledge Health;
- Contradiction Radar;
- Agent Replay;
- Live room;
- Live room proyectada al grafo;
- System Check PASS;
- vista móvil.

Formato recomendado:

- sin ventanas privadas;
- sin notificaciones personales;
- sin correo visible;
- sin tokens;
- resolución alta;
- cursor fuera del texto importante.

## Cómo reportar un error

```text
TESTER: Marce / Gastón
FECHA:
COMMIT O FECHA DEL ZIP:
DISPOSITIVO:
SISTEMA OPERATIVO:
NODE:
NAVEGADOR:

FUNCIÓN:
PASOS:
1.
2.
3.

RESULTADO ESPERADO:
RESULTADO REAL:
SE REPITE: Sí / No
MENSAJE COMPLETO:
SYSTEM CHECK:
CAPTURA O VIDEO:
GRAVEDAD: bloqueante / importante / menor / sugerencia
```

## Qué no deben hacer

- no usar documentos personales;
- no compartir claves o tokens;
- no corregir directamente `main`;
- no borrar archivos;
- no instalar integraciones como Neko o n8n en el equipo principal sin coordinación;
- no afirmar que GPT-5.6, multiusuario, Neko o n8n están funcionando cuando solo existe la arquitectura;
- no grabar un error y ocultarlo en el video final.

## Entrega de evidencia

Crear una carpeta:

```text
QA_MARCE_GASTON_YYYY-MM-DD
```

Contenido sugerido:

```text
01_INICIO
02_SYSTEM_CHECK
03_VALIDACION
04_RECORRIDO
05_LIVE_ROOM
06_IMPORT_EXPORT
07_PERSISTENCIA
08_MOVIL
09_OFFLINE
10_VIDEO_DEMO
REPORTE.txt
```

## Criterio de éxito

La ayuda está completa cuando recibimos:

- una prueba limpia en otra computadora;
- resultado de `VALIDAR_EXOVIA.bat`;
- System Check;
- recorrido principal completo;
- prueba móvil;
- prueba offline;
- errores reproducibles;
- capturas finales;
- evaluación del video de menos de tres minutos.

No hace falta que todo pase a la primera. Encontrar y documentar un error antes de la entrega es una contribución valiosa.