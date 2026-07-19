# Manual para invitados y personas que quieran ayudar

Este documento está pensado para amigos, familiares, testers, diseñadores, editores de video y desarrolladores que quieran colaborar con Exovia NeuroCanvas.

No hace falta saber programar.

## 1. Qué es Exovia NeuroCanvas

Es una aplicación visual que convierte documentos, notas y actividad de agentes en un mapa navegable. Permite buscar información, abrir la evidencia original, revisar la salud del conocimiento y observar acciones humanas y de IA.

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

Requisito: Node.js 20 o superior.

## 3. Prueba rápida de cinco minutos

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
11. Pulsar `Agent replay`.
12. Abrir `System check`.
13. Copiar o fotografiar el resultado.
14. Pulsar `Export` para guardar el proyecto.
15. Recargar la página y confirmar que el mapa continúa abierto.

## 4. Cómo puede ayudar una persona sin programar

### Probar la aplicación

Registrar:

- qué botón pulsó;
- qué esperaba que ocurriera;
- qué ocurrió realmente;
- dispositivo y sistema operativo;
- navegador;
- captura o video.

### Revisar facilidad de uso

Responder:

- ¿Entendió qué hace la aplicación en menos de 30 segundos?
- ¿Pudo abrirla sin ayuda?
- ¿Pudo crear un proyecto?
- ¿Pudo encontrar una respuesta y su evidencia?
- ¿Qué palabras o botones resultaron confusos?
- ¿Qué quitaría de la pantalla principal?
- ¿Qué función mostraría primero?

### Ayudar con imágenes

Se necesitan capturas limpias de:

- mapa principal;
- Evidence Inspector;
- Answer & Audit;
- Knowledge Health;
- Agent Replay;
- System Check;
- vista móvil.

No deben aparecer contraseñas, tokens, correos privados ni documentos personales.

### Ayudar con el video

La grabación debe mostrar una experiencia real y reproducible. No debe afirmar que una función usa GPT-5.6 o Codex cuando la interfaz no lo demuestra.

Registrar el video en 1080p, con cursor visible, voz clara y textos legibles.

### Ayudar con textos

Puede señalar:

- errores de ortografía;
- expresiones difíciles;
- traducciones poco naturales;
- afirmaciones que no se puedan demostrar;
- instrucciones incompletas.

## 5. Cómo informar un error

Copiar esta plantilla:

```text
TÍTULO:

DISPOSITIVO:

SISTEMA OPERATIVO:

NAVEGADOR Y VERSIÓN:

PASOS PARA REPRODUCIR:
1.
2.
3.

RESULTADO ESPERADO:

RESULTADO REAL:

¿OCURRE SIEMPRE?:

RESULTADO DE SYSTEM CHECK:

CAPTURA O VIDEO:

GRAVEDAD:
[ ] Bloquea completamente
[ ] Función importante dañada
[ ] Problema visual o de comprensión
[ ] Sugerencia
```

Un error útil debe poder repetirse.

## 6. Cómo sugerir una mejora

Usar esta estructura:

```text
PROBLEMA DEL USUARIO:

QUIÉN LO SUFRE:

SOLUCIÓN PROPUESTA:

QUÉ CAMBIARÍA EN LA PANTALLA:

BENEFICIO:

RIESGO O POSIBLE CONFUSIÓN:
```

Evitar propuestas genéricas como “hacerlo más moderno”. Explicar qué acción concreta debería resultar más fácil.

## 7. Cómo colaborar con código

Leer primero `CONTRIBUTING.md`.

Flujo recomendado:

```bash
git clone https://github.com/ruminui/exovia-neurocanvas.git
cd exovia-neurocanvas
npm install
npm start
```

Crear una rama independiente:

```bash
git checkout -b fix/nombre-corto
```

Después del cambio:

```bash
npm run verify
```

Backend, cuando corresponda:

```bash
cd server
npm run verify
```

Abrir un Pull Request. No modificar `main` directamente sin autorización.

## 8. Reglas para no dañar el proyecto

- No borrar archivos sin explicar el motivo.
- No reemplazar todo el diseño para corregir un botón.
- No agregar dependencias innecesarias.
- No colocar claves API en el frontend.
- No subir `.env`, bases de datos, backups o documentos privados.
- No usar datos reales de clientes en pruebas.
- No presentar resultados no ejecutados como verificados.
- No describir una idea futura como función terminada.
- Mantener el estilo negro y dorado.
- Conservar la evidencia y la auditoría.

## 9. Etiquetas de estado

Toda contribución debe distinguir:

- `IMPLEMENTED`: el código existe.
- `AUTOMATED TESTED`: existe una prueba automática.
- `RUNTIME VERIFIED`: fue ejecutado con éxito.
- `PARTIAL`: funciona solo una parte.
- `EXPERIMENTAL`: no está listo para uso estable.
- `BLOCKED`: depende de acceso, credenciales o decisiones pendientes.

## 10. Seguridad y privacidad

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

## 11. Qué enviar al terminar una prueba

Enviar una sola carpeta o mensaje con:

1. nombre del tester;
2. dispositivo y navegador;
3. checklist completado;
4. reporte de System Check;
5. errores encontrados;
6. capturas o videos;
7. tres cosas fáciles;
8. tres cosas confusas;
9. recomendación principal.

## 12. Recorrido recomendado para grabar una demo

1. Abrir la app.
2. Crear `New workspace`.
3. Mostrar Neural y Tree.
4. Seleccionar evidencia.
5. Hacer una pregunta en Answer & Audit.
6. Abrir una cita y regresar al mapa.
7. Mostrar Knowledge Health.
8. Mostrar Agent Replay.
9. Mostrar System Check.
10. Mostrar la vista móvil.

No utilizar funciones inestables en el video principal salvo que estén claramente marcadas como experimentales.

## 13. Contacto y coordinación

Antes de una modificación grande, abrir un issue o hablar con Luciano / Exovia para evitar que dos personas trabajen sobre lo mismo.

Las contribuciones más valiosas son pequeñas, verificables y fáciles de revisar.
