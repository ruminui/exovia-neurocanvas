# Exovia NeuroCanvas — prueba completa en Android

Esta prueba está pensada para que Luciano pueda validar la aplicación sin depender de otra persona.

## Preparación

1. Abrir la URL pública en Chrome para Android.
2. Esperar a que termine la primera carga.
3. Mantener el teléfono en vertical para comenzar.
4. No borrar los datos del navegador durante la prueba.

## Resultado esperado al abrir por primera vez

- La interfaz detecta español si el teléfono está configurado en español.
- Se activa `Vista simple`.
- Se abre el selector `¿Qué querés organizar?`.
- Aparece una barra inferior con cinco acciones:
  - `Explorar`;
  - `Mapa`;
  - `Preguntar`;
  - `Fuente`;
  - `Más`.

## Prueba principal

### 1. Crear un proyecto

1. Elegir `Guardar recuerdos familiares`, `Organizar un proyecto de trabajo` u otra plantilla.
2. Confirmar que aparece un mapa.
3. Tocar un círculo.
4. Abrir `Fuente` y verificar que se muestra información de esa idea.

### 2. Navegar con gestos

- Arrastrar con un dedo para mover el mapa.
- Juntar o separar dos dedos para acercar o alejar.
- Hacer doble toque para encuadrar el mapa.
- Girar el teléfono a horizontal y volver a vertical.

La aplicación no debe quedar cortada ni mostrar desplazamiento horizontal.

### 3. Preguntar

1. Pulsar `Preguntar`.
2. Confirmar que se abre el panel izquierdo y el teclado enfoca el buscador.
3. Escribir una pregunta.
4. Pulsar buscar.
5. Elegir un resultado.
6. Confirmar que el panel se cierra y vuelve al mapa.

### 4. Guardar y recuperar

1. Modificar o agregar una idea.
2. Esperar a que aparezca `Todos los cambios están guardados`.
3. Recargar la página.
4. Abrir `Más` → `Mis proyectos`.
5. Confirmar que el proyecto continúa disponible.

### 5. Probar sin conexión

1. Con la aplicación ya cargada, activar modo avión.
2. Recargar la página.
3. Confirmar que la aplicación abre.
4. Abrir el proyecto guardado.
5. Desactivar modo avión al terminar.

### 6. Instalar como aplicación

En `Más`, pulsar `Instalar app` cuando esté disponible. También se puede usar el menú de Chrome → `Agregar a pantalla principal` o `Instalar aplicación`.

Después:

1. cerrar Chrome;
2. abrir NeuroCanvas desde el icono;
3. confirmar que se abre sin barra del navegador;
4. repetir una pregunta y un guardado.

## Controles especiales para Android

- La barra inferior se oculta mientras el teclado ocupa gran parte de la pantalla.
- Los botones principales tienen un mínimo táctil de 48 px.
- Los paneles se desplazan independientemente.
- Los diálogos mantienen los botones de confirmación visibles.
- El modo horizontal reduce elementos decorativos para dejar espacio al contenido.
- `Cómo usar` activa la vista simple y abre la guía paso a paso.

## Qué registrar si algo falla

Abrir `Más` → `Informe de ayuda` y guardar el JSON. Registrar también:

- modelo del teléfono;
- versión de Android;
- versión de Chrome;
- paso exacto en que falló;
- captura de pantalla;
- si estaba conectado, sin conexión o en modo avión.

El informe técnico no incluye el contenido de los nodos ni el texto privado del proyecto.

## Criterio de aprobación

La versión Android se considera aprobada cuando puede completar sin bloqueo:

```text
Abrir
→ elegir propósito
→ tocar una idea
→ ver su fuente
→ preguntar
→ guardar
→ recargar
→ abrir offline
→ instalar como app
```

Hasta ejecutar esta prueba real, el estado correcto es `IMPLEMENTADA Y PENDIENTE DE VALIDACIÓN FÍSICA EN ANDROID`.
