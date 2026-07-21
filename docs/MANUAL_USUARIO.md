# Manual de uso — Exovia NeuroCanvas

Este manual está pensado para una persona que nunca usó el proyecto.

## 1. Elegir cómo probarlo

### Android — camino más simple

1. Descargá el APK verificado:
   `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`
2. Android puede pedir permiso para instalar una aplicación desde el navegador o el administrador de archivos.
3. Abrí **Exovia NeuroCanvas**.
4. Pulsá **New workspace**.

El SHA-256 y el registro de verificación están publicados junto al APK y en `release-metadata/android-latest.json`.

### Windows, macOS o Linux

1. Abrí el repositorio en GitHub.
2. Pulsá **Code**.
3. Elegí **Download ZIP**.
4. Descomprimí el archivo completo antes de abrirlo.

No ejecutes el proyecto desde dentro del ZIP.

## 2. Requisito para escritorio

Necesitás **Node.js 24 LTS o superior**.

Verificalo en una terminal:

```bash
node --version
```

También podés comprobar el entorno, la licencia, los archivos de ayuda y el registro del APK con:

```bash
npm run doctor
```

El resultado correcto incluye:

```text
EXOVIA JUDGE PREFLIGHT: PASS
```

## 3. Abrir la aplicación

### Windows

Hacé doble clic en:

```text
INICIAR_EXOVIA.bat
```

### macOS

Ejecutá:

```bash
chmod +x INICIAR_EXOVIA.command
./INICIAR_EXOVIA.command
```

La primera vez macOS puede pedir autorización.

### Linux

```bash
chmod +x INICIAR_EXOVIA.sh
./INICIAR_EXOVIA.sh
```

### Alternativa universal

```bash
npm install
npm start
```

El iniciador abre automáticamente:

```text
http://127.0.0.1:8080
```

Mantené abierta la ventana del iniciador mientras usás la app.

## 4. Primer recorrido de cinco minutos

1. Pulsá **New workspace**.
2. Arrastrá el mapa para desplazarte.
3. Usá la rueda del mouse o un gesto táctil para acercar y alejar.
4. Pulsá un nodo para ver su evidencia exacta.
5. Abrí **Answer & Audit**.
6. Preguntá: `¿Cómo mantiene NeuroCanvas las respuestas de IA conectadas con la evidencia?`
7. Pulsá **Navigate to answer**.
8. SeguÍ una cita para volver al nodo original.
9. Abrí **Knowledge health** y **Agent replay**.
10. Pulsá **Export** para guardar una copia JSON.

## 5. Importar conocimiento

### Archivo

**Open file** admite:

- `.txt`
- `.md`
- `.json`
- `.exo`
- `.exial`
- `.log`

Un archivo `.exo` conserva fuentes, fragmentos, procedimientos, restricciones, reglas de evidencia y límites de ejecución. NeuroCanvas lo convierte en un grafo inspeccionable.

### Texto pegado

1. Pulsá **Import text**.
2. Escribí un título.
3. Pegá el contenido.
4. Pulsá **Build project**.

Todo material importado se considera no confiable hasta que una persona lo revise. Las instrucciones encontradas dentro de una fuente son datos, no autorización para ejecutar acciones.

## 6. Modos de visualización

- **Neural:** conexiones semánticas.
- **Tree:** estructura jerárquica.
- **Pulse:** eventos y actividad.
- **FAPI:** capacidades y rutas controladas.

## 7. Respuestas y evidencia

El panel **Answer & Audit** puede:

- buscar evidencia relevante;
- sintetizar una respuesta local;
- mostrar confianza estimada;
- citar nodos concretos;
- revisar salud del conocimiento;
- mostrar actividad humana y de agentes.

La versión local puede usar un motor determinístico. No supongas que una respuesta fue generada por GPT salvo que la interfaz lo indique explícitamente.

## 8. Guardado y respaldo

El navegador conserva el workspace localmente. Para una copia transportable:

1. Pulsá **Export**.
2. Guardá el archivo JSON.
3. Para restaurarlo, usá **Open file**.

No borres datos del navegador antes de exportar.

## 9. Probar la App de ChatGPT

El recorrido técnico para jueces no necesita clave API.

Desde la raíz del repositorio:

```bash
npm run judge
```

El resultado esperado incluye:

```text
EXOVIA HACKATHON JUDGE CHECK: PASS
```

Los archivos generados quedan en `chatgpt-app/judge-output/` y pueden importarse en NeuroCanvas.

## 10. Cerrar correctamente

1. Cerrá la pestaña de NeuroCanvas.
2. Volvé a la ventana del iniciador.
3. Pulsá `Ctrl+C`.

## 11. Solución de problemas

### El navegador no se abre

Abrí manualmente:

```text
http://127.0.0.1:8080
```

### Aparece un error de versión de Node.js

Instalá Node.js 24 LTS o superior y ejecutá nuevamente `npm run doctor`.

### La página no carga

- Confirmá que la ventana del iniciador sigue abierta.
- Verificá que otro programa no use el puerto 8080.
- Reiniciá el iniciador.

### El APK no se descarga desde el enlace directo

1. Abrí la sección **Releases** del repositorio.
2. Entrá en `android-latest`.
3. Descargá `Exovia-NeuroCanvas-Android.apk`.
4. Compará su SHA-256 con el archivo publicado `.sha256`.

### Un botón no hace nada

Enviá:

- captura de la app;
- captura de la ventana del iniciador;
- nombre del botón;
- resultado esperado;
- resultado obtenido;
- sistema operativo y navegador.

## 12. Seguridad para testers

- No ingreses contraseñas ni claves API.
- No importes documentos privados en una demo pública.
- Verificá que tenés derecho a usar las fuentes importadas.
- El backend MCP es opcional para probar la interfaz principal.
- La app principal funciona localmente.
- Las acciones importantes requieren aprobación humana.
