# Nexus Íntimo

Nexus Íntimo es una aplicación web diseñada para parejas e individuos que buscan explorar la intimidad, la conexión y el placer a través de una serie de herramientas interactivas, juegos y guías impulsadas por la IA generativa de Gemini.

## ✨ Características Principales

- **StoryWeaver AI**: Genera historias eróticas personalizadas basadas en parámetros definidos por el usuario.
- **Nexo Guía**: Un asistente de chat IA que ofrece consejos, ideas y respuestas a preguntas sobre intimidad.
- **El Sendero del Deseo**: Un juego de tablero erótico para parejas con desafíos generados dinámicamente.
- **Pasaporte de la Pasión**: Un diario donde las parejas pueden registrar sus "hitos" íntimos (nuevas posturas, fantasías cumplidas, etc.) y desbloquear logros.
- **Cofre de los Deseos**: Un sistema donde los miembros de la pareja pueden escribir deseos secretos que solo pueden ser revelados usando "llaves" ganadas en la app.
- **Mapa del Cuerpo**: Una herramienta visual para marcar y guardar zonas de placer en una silueta corporal.
- **Diario Tándem**: Los miembros de la pareja responden a la misma pregunta en secreto, y las respuestas se revelan simultáneamente.
- **Espejo del Alma**: Analiza las actividades de la pareja en la app para generar una "Brújula de la Pasión" y una reflexión poética sobre su conexión.
- **Guías de Intimidad**: Contenido educativo y guías sobre temas como la anatomía del placer, técnicas de comunicación y más.
- **Sincronización en Tiempo Real**: Toda la información compartida se sincroniza en tiempo real entre los dispositivos de la pareja mediante Server-Sent Events (SSE).

## 🚀 Stack Tecnológico

- **Frontend**:
  - **Framework**: React 18
  - **Lenguaje**: TypeScript
  - **Enrutamiento**: React Router
  - **Estilos**: Tailwind CSS
  - **Bundler**: esbuild (para desarrollo y producción)

- **Backend**:
  - **Framework**: Express.js
  - **Lenguaje**: TypeScript
  - **Base de Datos**: Base de datos simple basada en archivos (`db.json`) para persistencia de datos de sesión.
  - **IA**: Google Gemini API (`@google/genai`)

- **Entorno**:
  - **Servidor de desarrollo**: `nodemon` para recarga en caliente del backend.
  - **Ejecución de scripts**: `concurrently` para correr frontend y backend simultáneamente.

## ⚙️ Configuración y Ejecución

Sigue estos pasos para poner en marcha el proyecto en tu máquina local.

### Prerrequisitos

- Node.js (v18 o superior)
- npm (generalmente viene con Node.js)

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd nexus-intimo
```

### 2. Instalar dependencias

Ejecuta el siguiente comando en la raíz del proyecto para instalar todas las dependencias del frontend y backend:

```bash
npm install
```

### 3. Configurar las variables de entorno

La aplicación requiere una clave de API de Google Gemini para funcionar.

1.  Crea un archivo llamado `.env` en la raíz del proyecto.
2.  Añade tu clave de API al archivo de la siguiente manera:

    ```env
    API_KEY=tu_clave_de_api_de_gemini_aqui
    ```

    Asegúrate de reemplazar `tu_clave_de_api_de_gemini_aqui` con tu clave real.

### 4. Ejecutar la aplicación en modo de desarrollo

Para iniciar tanto el servidor backend como el frontend en modo de desarrollo con recarga en caliente, utiliza:

```bash
npm run dev
```

Esto hará lo siguiente:
- Iniciará el servidor de Express en `http://localhost:3001` con `nodemon`.
- Servirá el frontend con `esbuild` en `http://localhost:8000`.

Abre `http://localhost:8000` en tu navegador para ver la aplicación.

## 📜 Scripts de NPM

- `npm run dev`: Inicia el entorno de desarrollo completo.
- `npm run build`: Compila el frontend y el backend de TypeScript a JavaScript en el directorio `dist/`.
- `npm start`: Ejecuta la aplicación en modo de producción desde los archivos compilados en `dist/`.
- `dev:backend`: Inicia solo el servidor backend en modo de desarrollo.
- `dev:frontend`: Inicia solo el servidor de desarrollo del frontend.
