# Checklist para testers

Plan específico para Marce y Gastón:

- [`MARCE_GASTON_HELP_PLAN.md`](MARCE_GASTON_HELP_PLAN.md)

Nombre:

Equipo / dispositivo:

Sistema operativo:

Node.js:

Navegador:

Commit o fecha del ZIP:

Fecha:

## Apertura limpia

- [ ] Descargué el ZIP en una carpeta nueva.
- [ ] Descomprimí la carpeta completamente.
- [ ] Confirmé Node.js 24 o superior.
- [ ] Abrí el iniciador correspondiente.
- [ ] El navegador se abrió solo.
- [ ] La dirección fue `http://127.0.0.1:8080` o la indicada por el iniciador.
- [ ] La pantalla principal cargó sin errores visibles.
- [ ] La ventana del iniciador no mostró errores.

## Recorrido principal

- [ ] `New workspace` creó un mapa.
- [ ] Pude mover y ampliar el canvas.
- [ ] Pude seleccionar nodos.
- [ ] Evidence Inspector mostró contenido.
- [ ] `Answer & Audit` abrió correctamente.
- [ ] `Navigate to answer` devolvió evidencia.
- [ ] Pude abrir una cita y volver al mapa.
- [ ] `Knowledge health` mostró un resultado.
- [ ] `Contradiction Radar` abrió correctamente.
- [ ] `Agent replay` abrió correctamente.
- [ ] `System check` abrió correctamente.
- [ ] System Check no mostró fallos.

## Living Evidence Room

- [ ] El botón `Live room` apareció.
- [ ] La sala mostró participantes.
- [ ] La sala mostró evidencias multimedia.
- [ ] La sala mostró decisiones y aprobaciones.
- [ ] La sala mostró ejecuciones.
- [ ] La línea temporal mostró eventos ordenados.
- [ ] El aviso de vertical local y no multiusuario fue visible.
- [ ] `Project room into graph` creó un mapa.
- [ ] Pude seleccionar nodos de persona, agente, workflow, evidencia, decisión y ejecución.
- [ ] Pude buscar contenido de la sala proyectada.

## Persistencia

- [ ] Guardé un proyecto.
- [ ] El proyecto siguió disponible después de recargar.
- [ ] El proyecto siguió disponible después de cerrar y abrir el navegador.
- [ ] Pude duplicar el proyecto.
- [ ] Cambiar la copia no modificó el original.
- [ ] Pude crear un snapshot.
- [ ] Pude restaurar un snapshot.
- [ ] Pude eliminar un proyecto sin dejar datos visibles huérfanos.

## Importación y exportación

- [ ] Pude importar texto pegado.
- [ ] Pude abrir un archivo TXT.
- [ ] Pude abrir un archivo Markdown.
- [ ] Pude importar texto en español con tildes y ñ.
- [ ] Pude abrir un JSON exportado por NeuroCanvas.
- [ ] Un JSON malformado fue rechazado sin borrar el proyecto actual.
- [ ] Pude abrir un archivo ExiaL o log de ejemplo.
- [ ] `Export` descargó un JSON.
- [ ] El JSON exportado volvió a abrirse.
- [ ] Nodos, conexiones y evidencia se conservaron.

## Offline y PWA

- [ ] Abrí la aplicación con conexión.
- [ ] Abrí `Live room` al menos una vez.
- [ ] Desconecté la red o activé modo avión.
- [ ] Recargué la aplicación.
- [ ] `New workspace` siguió funcionando.
- [ ] `Live room` siguió abriendo.
- [ ] No aparecieron archivos viejos o pantallas en blanco después de actualizar.
- [ ] La opción de instalar la PWA apareció cuando correspondía.

## Móvil

- [ ] La pantalla entra correctamente en el ancho del celular.
- [ ] Los botones principales se pueden tocar.
- [ ] El canvas responde a gestos.
- [ ] No hay texto o controles cortados.
- [ ] Los diálogos se pueden cerrar.
- [ ] Live room es usable en vertical.
- [ ] Live room es usable en horizontal.

## Validación completa

- [ ] Ejecuté `VALIDAR_EXOVIA.bat`.
- [ ] Guardé una captura del resultado final.
- [ ] Guardé el primer error completo cuando falló.
- [ ] Conservé `artifacts/release-readiness.json` cuando se generó.
- [ ] Conservé `playwright-report` o `test-results` cuando existieron.

## Evaluación rápida

¿Entendiste qué hace NeuroCanvas en menos de 30 segundos?

¿Qué parte te resultó más clara?

¿Qué parte te resultó confusa?

¿Entendiste qué representa Live room?

¿Qué función mostrarías primero en el video?

¿Qué función sacarías del video?

¿La demostración completa entra en menos de tres minutos?

¿Lo recomendarías? ¿Por qué?

## Plantilla de error

**Función:**

**Paso:**

**Qué esperaba:**

**Qué ocurrió:**

**Se puede repetir:** Sí / No

**Mensaje completo:**

**System Check:**

**Captura adjunta:** Sí / No

**Video adjunto:** Sí / No

**Mensaje de la ventana del iniciador:**

**Gravedad:** bloqueante / pérdida de datos / importante / menor / sugerencia

## Resultado general

- [ ] APROBADO PARA DEMO
- [ ] APROBADO CON PROBLEMAS MENORES
- [ ] NO APROBADO — REQUIERE CORRECCIÓN

Motivo principal:
