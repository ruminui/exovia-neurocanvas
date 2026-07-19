# Manual de uso — Exovia NeuroCanvas

Este manual está pensado para una persona que nunca usó el proyecto.

## 1. Descargar

1. Abrí el repositorio en GitHub.
2. Pulsá **Code**.
3. Elegí **Download ZIP**.
4. Descomprimí el archivo completo antes de abrirlo.

No ejecutes el proyecto desde dentro del ZIP.

## 2. Requisito único

Necesitás **Node.js 20 o superior**.

Podés verificarlo abriendo una terminal y escribiendo:

```bash
node --version
```

## 3. Abrir la aplicación

### Windows

Hacé doble clic en:

```text
INICIAR_EXOVIA.bat
```

### macOS

Abrí:

```text
INICIAR_EXOVIA.command
```

La primera vez macOS puede pedir autorización. También puede ejecutarse desde Terminal con:

```bash
chmod +x INICIAR_EXOVIA.command
./INICIAR_EXOVIA.command
```

### Linux

```bash
chmod +x INICIAR_EXOVIA.sh
./INICIAR_EXOVIA.sh
```

### Alternativa universal

```bash
npm start
```

El iniciador abre automáticamente:

```text
http://127.0.0.1:8080
```

Mantené abierta la ventana del iniciador mientras usás la app.

## 4. Recorrido inicial de cinco minutos

1. Pulsá **New workspace**.
2. Arrastrá el mapa para desplazarte.
3. Usá la rueda del mouse o gesto táctil para acercar y alejar.
4. Pulsá un nodo para ver su evidencia exacta.
5. Abrí **Answer & Audit**.
6. Escribí una pregunta y pulsá **Navigate to answer**.
7. Revisá las fuentes y pulsá una cita para volver al nodo.
8. Abrí **Knowledge health**.
9. Abrí **Agent replay**.
10. Pulsá **Export** para guardar una copia JSON.

## 5. Importar conocimiento

### Archivo

**Open file** admite:

- `.txt`
- `.md`
- `.json`
- `.exial`
- `.log`

### Texto pegado

1. Pulsá **Import text**.
2. Escribí un título.
3. Pegá el contenido.
4. Pulsá **Build project**.

## 6. Modos de visualización

- **Neural:** conexiones semánticas.
- **Tree:** estructura jerárquica.
- **Pulse:** eventos y actividad.
- **FAPI:** capacidades y rutas de ejecución.

## 7. Respuestas y evidencia

El panel **Answer & Audit** puede:

- buscar evidencia relevante;
- sintetizar una respuesta local;
- mostrar confianza estimada;
- citar nodos concretos;
- revisar salud del conocimiento;
- mostrar actividad humana y de agentes.

La versión actual puede usar un motor local determinístico. No presupongas que una respuesta fue generada por GPT salvo que la interfaz lo indique explícitamente.

## 8. Guardado y respaldo

El navegador conserva el workspace localmente. Para una copia transportable:

1. Pulsá **Export**.
2. Guardá el archivo JSON.
3. Para restaurarlo, usá **Open file**.

No borres datos del navegador antes de exportar.

## 9. Cerrar correctamente

1. Cerrá la pestaña de NeuroCanvas.
2. Volvé a la ventana del iniciador.
3. Pulsá `Ctrl+C`.

## 10. Solución de problemas

### El navegador no se abre

Abrí manualmente:

```text
http://127.0.0.1:8080
```

### Aparece “Node.js no está instalado”

Instalá Node.js LTS y ejecutá nuevamente el iniciador.

### La página no carga

- Confirmá que la ventana del iniciador sigue abierta.
- Verificá que otro programa no use el puerto 8080.
- Reiniciá el iniciador.

### Un botón no hace nada

Enviá:

- captura de la app;
- captura de la ventana del iniciador;
- nombre del botón;
- resultado esperado;
- resultado obtenido;
- sistema operativo y navegador.

## 11. Seguridad para testers

- No ingresar contraseñas ni claves API.
- No importar documentos privados para la demo.
- El backend MCP/IA es opcional para probar la interfaz.
- La app principal funciona localmente.
