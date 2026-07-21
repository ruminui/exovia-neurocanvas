# Exovia NeuroCanvas — User Start Here / Guía inicial

A practical first-run guide for people who have never used the project. No OpenAI API key, account or database is required for the local product.

---

## English

### Choose the easiest path

**Android — no development setup**

1. Download the current verified test APK:
   `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`
2. Android may ask permission to install an app from your browser or file manager.
3. Open **Exovia NeuroCanvas** and select **New workspace**.

The matching SHA-256 and verification record are stored in `release-metadata/android-latest.json` and published beside the APK.

**Windows, macOS or Linux — local web app**

Requirements: Node.js 24 LTS or newer.

```bash
npm install
npm start
```

The launcher opens `http://127.0.0.1:8080`. Keep the terminal open while using the application.

### Five-minute first run

1. Select **New workspace**.
2. Drag the canvas and zoom with the mouse wheel or touch gesture.
3. Select a node to inspect its exact source.
4. Open **Answer & Audit**.
5. Ask: `How does NeuroCanvas keep AI answers connected to evidence?`
6. Select **Navigate to answer** and follow a citation back to its node.
7. Open **Knowledge health** and **Agent replay**.
8. Select **Export** to save a portable JSON copy.

### Import your own material

**Open file** accepts text, Markdown, JSON, `.exo`, ExiaL and log files. **Import text** lets you paste content directly.

Treat imported material as untrusted until you review it. Do not use passwords, API keys, confidential client files or personal information in a public demo.

### What is saved

Projects and recovery snapshots are stored locally in the browser. Export a JSON copy before clearing browser data or changing devices.

### Need more help?

- Spanish manual: [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- Judge and technical verification: [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md)
- EXO package format: [`docs/EXO_CAPABILITY_PACK.md`](docs/EXO_CAPABILITY_PACK.md)

---

## Español

### Elegí el camino más fácil

**Android — sin preparar un entorno de desarrollo**

1. Descargá el APK de prueba verificado:
   `https://github.com/ruminui/exovia-neurocanvas/releases/download/android-latest/Exovia-NeuroCanvas-Android.apk`
2. Android puede pedir permiso para instalar una aplicación desde el navegador o el administrador de archivos.
3. Abrí **Exovia NeuroCanvas** y pulsá **New workspace**.

El SHA-256 correspondiente y el registro de verificación están en `release-metadata/android-latest.json` y junto al APK publicado.

**Windows, macOS o Linux — aplicación web local**

Requisito: Node.js 24 LTS o superior.

```bash
npm install
npm start
```

El iniciador abre `http://127.0.0.1:8080`. Mantené la terminal abierta mientras usás la aplicación.

### Primer recorrido de cinco minutos

1. Pulsá **New workspace**.
2. Arrastrá el lienzo y acercá o alejá con la rueda del mouse o un gesto táctil.
3. Pulsá un nodo para inspeccionar su fuente exacta.
4. Abrí **Answer & Audit**.
5. Preguntá: `¿Cómo mantiene NeuroCanvas las respuestas de IA conectadas con la evidencia?`
6. Pulsá **Navigate to answer** y seguí una cita hasta su nodo.
7. Abrí **Knowledge health** y **Agent replay**.
8. Pulsá **Export** para guardar una copia JSON transportable.

### Importar material propio

**Open file** admite texto, Markdown, JSON, `.exo`, ExiaL y archivos de registro. **Import text** permite pegar contenido directamente.

Tratamos el material importado como no confiable hasta que una persona lo revise. No uses contraseñas, claves API, documentos confidenciales ni datos personales en una demostración pública.

### Qué se guarda

Los proyectos y las copias de recuperación se guardan localmente en el navegador. Exportá un JSON antes de borrar los datos del navegador o cambiar de dispositivo.

### Más ayuda

- Manual completo: [`docs/MANUAL_USUARIO.md`](docs/MANUAL_USUARIO.md)
- Verificación para jueces: [`JUDGE_START_HERE.md`](JUDGE_START_HERE.md)
- Formato de paquetes EXO: [`docs/EXO_CAPABILITY_PACK.md`](docs/EXO_CAPABILITY_PACK.md)
