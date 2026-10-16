# Democratizador de E-Discovery (EvidenciaFácil) ⚖️🔍

> Plataforma web para ciudadanos, litigantes y despachos jurídicos que permite cargar capturas de pantalla (WhatsApp, Telegram), correos electrónicos, contratos y recibos, procesándolos con la API de Google Gemini para construir cronologías fácticas objetivas, detectar contradicciones procesales y señalar vacíos probatorios con trazabilidad documental 1:1.

---

## 🌟 Características Principales

1. **Zona de Carga Multimodal**:
   - Soporte Drag & Drop para imágenes (`PNG`, `JPG`, `WEBP`), documentos (`PDF`) y transcripciones (`TXT`).
   - Previsualización inmediata y categorización de archivos (chats, correos, contratos, comprobantes).
   - Casos demo precargados para validación instantánea sin necesidad de subir archivos propios.

2. **Procesamiento Inteligente con Gemini (JSON Estructurado)**:
   - Endpoint `/api/analyze` que valida el acervo documental mediante `responseSchema` estricto.
   - **Cronología Procesal**: Fecha y hora exacta/estimada, descripción objetiva, intervinientes, fuente documental específica y cita textual literal.
   - **Detección de Contradicciones**: Comparador visual lado a lado (Versión A vs. Versión B), grado de severidad y evaluación del impacto procesal en juicio.
   - **Señalamiento de Vacíos Probatorios**: Lagunas fácticas sin respaldo documental y diligencias probatorias recomendadas (oficios bancarios, inspección judicial, peritaje informático).

3. **Panel de Resultados & Auditoría**:
   - Vista de Línea de Tiempo interactiva con filtros dinámicos por relevancia y persona.
   - Matriz de Pruebas tabular con función de copiado rápido de citas al portapapeles.
   - Modal de inspección profunda para cotejar cada afirmación con el documento y cita original.
   - Exportación flexible: Formato Imprimible oficial judicial (`PDF / Imprimir`), Markdown estructurado (`.md`) y JSON forense (`.json`).

4. **Principios Éticos y Legales**:
   - **Disclaimer visible**: *"Esta herramienta organiza información y no emite juicios de valor ni sustituye el criterio legal o judicial."*
   - Cero alucinaciones gracias a la trazabilidad forzada al documento de origen.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 / Next.js 14/15 (App Router, TypeScript), Tailwind CSS, Lucide React, Motion.
- **Backend**: Next.js Route Handlers (`app/api/analyze/route.ts`) / Servidor Express (`server.ts`).
- **IA Multimodal**: `@google/genai` (utilizando el modelo de alta velocidad y razonamiento multimodal `gemini-3.8-flash`).
- **Despliegue**: Optimizado para Vercel o contenedores Node.js.

---

## 🚀 Instalación y Ejecución Local

### 1. Clonar el Repositorio e Instalar Dependencias

```bash
git clone https://github.com/tu-usuario/evidencia-facil.git
cd evidencia-facil
npm install
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y agrega tu clave de API de Google Gemini (puedes obtenerla de forma gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey)):

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:
```env
GEMINI_API_KEY="AIzaSyTuClaveDeGeminiAqui"
```

### 3. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## ☁️ Despliegue en Vercel (100% Serverless)

El proyecto está preparado para desplegarse directamente en Vercel:

1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Ingresa a [Vercel](https://vercel.com) y selecciona **"Add New Project"**.
3. Importa tu repositorio.
4. En la sección **Environment Variables**, añade:
   - `GEMINI_API_KEY`: Tu clave de la API de Google Gemini.
5. Haz clic en **Deploy**.

Vercel detectará la estructura de rutas API y compilará la aplicación automáticamente sin requerir configuración adicional de bases de datos.

---

## ⚖️ Principios Forenses y Aviso Legal

Este software ha sido desarrollado para el auxilio técnico y la democratización del acceso a la justicia. La autenticidad procesal de las pruebas digitales ante un tribunal siempre requerirá la preservación adecuada de la cadena de custodia y, cuando corresponda, peritajes informáticos forenses sobre los dispositivos emisores o receptores.
