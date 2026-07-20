# Manual para invitados y personas que quieran ayudar

Este documento está pensado para Marce, Gastón, amigos, familiares, testers, diseñadores, editores de video y desarrolladores que quieran colaborar con Exovia NeuroCanvas.

No hace falta saber programar.

Plan específico para Marce y Gastón:

- [`MARCE_GASTON_HELP_PLAN.md`](MARCE_GASTON_HELP_PLAN.md)

## 1. Qué es Exovia NeuroCanvas

Es una aplicación visual local-first que convierte documentos, notas y actividad de agentes en un mapa navegable. Permite buscar información, abrir la evidencia original, revisar la salud del conocimiento y observar acciones humanas y de IA.

También incluye una vertical llamada **Living Evidence Room**, que representa personas, agentes, workflows, evidencias multimedia, decisiones y aprobaciones dentro de un mismo grafo verificable.

Repositorio oficial:

`https://github.com/ruminui/exovia-neurocanvas`

## 2. Cómo descargar y abrir

### Windows

1. Entrar al repositorio.
2. Pulsar `Code`.
3. Pulsar `Download ZIP`.
4. Descomprimir completamente el ZIP.
5. Abrir la carpeta.
6. Hacer doble clic en:

```text
INICIAR_EXOVIA.bat
```

7. Mantener abierta la ventana negra.
8. Esperar a que se abra el navegador.

Dirección habitual:

```text
http://127.0.0.1:8080
```

### macOS

```bash
chmod +x INICIAR_EXOVIA.command
./INICIAR_EXOVIA.command
```

### Linux

```bash
chmod +x INICIAR_EXOVIA.sh
./INICIAR_EXOVIA.sh
```

Requisito actual: **Node.js 24 LTS o superior**.

## 3. Prueba rápida de siete minutos

1. Pulsar `New workspace`.
2. Mover el mapa con el mouse.
3. Acercar y alejar.
4. Pulsar un nodo.
5. Leer la evidencia del panel derecho.
6. Abrir `Answer & Audit`.
7. Escribir una pregunta.
8. Pulsar `Navigate to answer`.
9. Abrir una cita.
10. Pulsar `Knowledge health`.
11. Abrir `Contradiction Radar`.
12. Pulsar `Agent replay`.
13. Abrir `Live room`.
14. Pulsar `Project room into graph`.
15. Abrir `System check`.
16. Copiar o fotografiar el resultado.
17. Pulsar `Export`.
18. Recargar la página y confirmar que el mapa continúa disponible.

## 4. Ayuda prioritaria que necesitamos

### Prueba en otra computadora

Necesitamos saber si alguien que no desarrolló la aplicación puede:

- descargarla;
- abrirla;
- entenderla;
- crear un proyecto;
- encontrar evidencia;
- ejecutar System Check;
- exportar y volver a abrir el proyecto.

### Validación completa

En Windows ejecutar:

```text
VALIDAR_EXOVIA.bat
```

Enviar una captura del resultado final y el primer error completo cuando falle.

### Prueba móvil

Comprobar:

- botones táctiles;
- paneles cortados;
- canvas;
- diálogos;
- Live room;
- orientación vertical y horizontal.

### Prueba offline

Después de cargar la aplicación una vez:

1. abrir `Live room`;
2. desconectar la red;
3. recargar;
4. probar nuevamente New workspace y Live room.

### Video y capturas

Se necesitan capturas limpias de:

- mapa principal;
- Evidence Inspector;
- Answer & Audit;
- Knowledge Health;
- Contradiction Radar;
- Agent Replay;
- Live room;
- Live room proyectada al grafo;
- System Check;
- vista móvil.

No deben aparecer contraseñas, tokens, correos privados ni documentos personales.

## 5. Evaluación de facilidad de uso

Responder:

- ¿Entendió qué hace la aplicación en menos de 30 segundos?
- ¿Pudo abrirla sin ayuda?
- ¿Pudo crear un proyecto?
- ¿Pudo encontrar una respuesta y su evidencia?
- ¿Entendió qué representa Live room?
- ¿Qué palabras o botones resultaron confusos?
- ¿Qué quitaría de la pantalla principal?
- ¿Qué función mostraría primero?
- ¿Qué parte no debería aparecer en el video?

## 6. Cómo informar un error

```text
TÍTULO:
TESTER:
COMMIT O FECHA DEL ZIP:
DISPOSITIVO:
SISTEMA OPERATIVO:
NODE:
NAVEGADOR Y VERSIÓN:

PASOS PARA REPRODUCIR:
1.
2.
3.

RESULTADO ESPERADO:
RESULTADO REAL:
¿OCURRE SIEMPRE?:
RESULTADO DE SYSTEM CHECK:
MENSAJE COMPLETO:
CAPTURA O VIDEO:

GRAVEDAD:
[ ] Bloquea completamente
[ ] Riesgo de pérdida de datos
[ ] Función importante dañada
[ ] Problema visual o de comprensión
[ ] Sugerencia
```

Un error útil debe poder repetirse o incluir suficiente evidencia para investigarlo.

## 7. Cómo sugerir una mejora

```text
PROBLEMA DEL USUARIO:
QUIÉN LO SUFRE:
SOLUCIÓN PROPUESTA:
QUÉ CAMBIARÍA EN LA PANTALLA:
BENEFICIO:
RIESGO O POSIBLE CONFUSIÓN:
CÓMO COMPROBARÍAMOS QUE MEJORÓ:
```

Evitar propuestas genéricas como “hacerlo más moderno”. Explicar qué acción concreta debería resultar más fácil.

## 8. Cómo colaborar con código

Leer primero `CONTRIBUTING.md`.

```bash
git clone https://github.com/ruminui/exovia-neurocanvas.git
cd exovia-neurocanvas
npm install --no-audit --no-fund
npm start
```

Cuando exista `package-lock.json`, usar `npm ci` para instalaciones limpias.

Crear una rama independiente:

```bash
git checkout -b fix/nombre-corto
```

Después del cambio:

```bash
npm run verify
```

Backend:

```bash
cd server
npm run verify
```

Abrir un Pull Request. No modificar `main` directamente sin autorización.

## 9. Reglas para no dañar el proyecto

- No borrar archivos sin explicar el motivo.
- No reemplazar todo el diseño para corregir un botón.
- No agregar dependencias innecesarias.
- No colocar claves API en el frontend.
- No subir `.env`, bases de datos, backups o documentos privados.
- No usar datos reales de clientes en pruebas.
- No presentar resultados no ejecutados como verificados.
- No describir una idea futura como función terminada.
- No instalar Neko, n8n o infraestructura multiusuario en el equipo principal sin coordinación.
- Mantener el estilo negro y dorado.
- Conservar evidencia, aprobaciones y auditoría.

## 10. Etiquetas de estado

- `IMPLEMENTED`: el código existe.
- `AUTOMATED TESTED`: existe una prueba automática.
- `RUNTIME VERIFIED`: fue ejecutado con éxito.
- `PARTIAL`: funciona solo una parte.
- `EXPERIMENTAL`: no está listo para uso estable.
- `BLOCKED`: depende de acceso, credenciales o decisiones pendientes.

## 11. Seguridad y privacidad

Usar archivos sintéticos o públicos.

Nunca compartir:

- contraseñas;
- tokens;
- claves API;
- documentos familiares;
- conversaciones privadas;
- información de clientes;
- archivos con derechos de terceros sin autorización.

Si aparece un secreto en una captura, no subirla. Recortarla o repetir la prueba.

## 12. Qué enviar al terminar

Crear una carpeta o mensaje con:

1. nombre del tester;
2. commit o fecha del ZIP;
3. dispositivo y navegador;
4. versión de Node;
5. checklist completado;
6. reporte de System Check;
7. resultado de `VALIDAR_EXOVIA.bat`;
8. errores encontrados;
9. capturas o videos;
10. tres cosas fáciles;
11. tres cosas confusas;
12. recomendación principal.

## 13. Recorrido recomendado para la demo

1. Problema que resuelve.
2. `New workspace`.
3. seleccionar evidencia.
4. Answer & Audit.
5. Navigate to Answer.
6. Knowledge Health.
7. Agent Replay.
8. Live room.
9. Project room into graph.
10. cierre: `Navigate knowledge. Verify every answer. Replay every decision.`

No utilizar funciones inestables en el video principal salvo que estén claramente marcadas como experimentales.

## 14. Contacto y coordinación

Antes de una modificación grande, abrir un issue o hablar con Luciano / Exovia para evitar trabajo duplicado.

Las contribuciones más valiosas son pequeñas, verificables y fáciles de revisar.