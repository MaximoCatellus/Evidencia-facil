# Módulo de Preparación y Triaje de Tomos Judiciales Masivos (>50MB)

Arquitectura e interfaz integrada para procesar expedientes judiciales voluminosos (como los Tomos I, II y III del Caso 55-2021 de más de 210 MB combinados) sin colapsar la memoria del navegador, permitiendo al usuario marcar fojas y piezas clave antes de ejecutar el análisis de hechos, contradicciones y vacíos probatorios.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Decisiones confirmadas por el usuario en Fase 1:**
> 1. **Estrategia de ingesta:** Pipeline backend mediante **Gemini File API** con particionamiento y *chunking* semántico, evitando la codificación masiva en Base64 en el navegador.
> 2. **Tratamiento del ruido administrativo:** **Triaje interactivo de fojas y capítulos**, permitiendo al usuario seleccionar rangos de fojas (ej. peritajes contables, actas de allanamiento, contratos) y descartar proveídos de mero trámite y notificaciones formales.
> 3. **Ubicación de la solución:** **Módulo integrado directamente en la plataforma** como un paso previo de "Preparación y Triaje de Expedientes Voluminosos" accesible desde la zona de subida.

---

## 1. Overview & Core Concept

- **Problema:** Los expedientes judiciales escaneados (tomos de 50 MB a 150 MB por tomo) no pueden ser procesados directamente mediante carga Base64 en el navegador porque saturan la memoria del cliente (OutOfMemory) y superan el payload HTTP estándar. Además, un tomo contiene hasta 80% de "ruido procesal" (cédulas de notificación vacías, carátulas, proveídos que dicen "téngase presente"), lo que diluye la ventana de contexto de la IA.
- **Solución integrada:** Un flujo en dos etapas:
  1. **Etapa 1 (Triaje y Preparación):** El usuario carga el tomo o lote pesado. La herramienta realiza una extracción rápida de índice de fojas/piezas procesales y le permite marcar qué secciones analizar (ej. "Foja 45 a 120: Contrato y Adendas", "Foja 310 a 380: Informe Pericial").
  2. **Etapa 2 (Ingesta con Gemini File API & Chunking):** El backend transfiere el documento mediante streaming a la File API de Gemini (`ai.files.upload`), segmenta las secciones seleccionadas en ventanas contextuales coherentes y genera el **Análisis de Pruebas** consolidado.

---

## 2. User Experience & Visual Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ZONA DE SUBIDA HABITUAL                         │
│  [ Arrastra capturas, fotos o documentos (hasta 30 MB) ]               │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ⚡ ¿Tienes un expediente o tomo escaneado pesado (+50MB)?         │  │
│  │    [ Abrir Módulo de Preparación y Triaje de Tomos Judiciales ]  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ (clic)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│ MODAL INTEGRADO: "PREPARACIÓN Y TRIAJE DE TOMOS JUDICIALES"            │
│ Paso 1: Carga por fragmentos (Streaming) ──> Detecta Tomos I, II, III  │
│                                                                        │
│ Paso 2: Selector de Fojas y Piezas Procesales Relevantes               │
│  ☑ Tomo I: Fojas 1–40 (Demanda y Contrato Marco)                       │
│  ☐ Tomo I: Fojas 41–180 (Cédulas y notificaciones de mero trámite)    │
│  ☑ Tomo II: Fojas 85–140 (Actas de Inspección y Comunicaciones)        │
│  ☑ Tomo III: Fojas 12–95 (Peritaje Financiero y Anexos Contables)      │
│                                                                        │
│  Rango personalizado: [ De Foja: 12 ] a [ Foja: 95 ]  [+ Agregar]      │
│                                                                        │
│ Paso 3: [ Procesar Fojas Seleccionadas con Gemini File API ]           │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
      Generación del Análisis de Pruebas (Cronología, Contradicciones,
               Vacíos y Exportación en Markdown .md / JSON)
```

### Flujo del Usuario
1. **Detección inteligente de archivos pesados:** Si el usuario arrastra un archivo > 30MB (o hace clic en el nuevo botón *"Procesar Tomos Masivos"*), se activa el asistente de preparación.
2. **Triaje y selección de fojas:** El usuario puede seleccionar fojas preconfiguradas o ingresar rangos manuales (ej. `1-50, 110-180`), evitando enviar las fojas de notificaciones administrativas que NotebookLM suele procesar con alto costo de tokens.
3. **Barra de progreso de streaming:** Muestra el progreso real de subida al servidor y la vinculación con Gemini File API con retroalimentación clara.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Gemini File API en lugar de Base64 Inline**
  - *Elección:* El backend utiliza `ai.files.upload` de `@google/genai` con soporte de archivos de hasta 2 GB por archivo.
  - *Por qué:* Los 3 tomos del usuario suman 211 MB (`TOMO_I`: 98MB, `TOMO_II`: 80MB, `TOMO_III`: 33MB). Base64 aumentaría esto a ~280 MB en memoria, provocando caídas del navegador.
- **Decisión 2: Filtrado y Selector de Fojas en el Cliente/Servidor**
  - *Elección:* Permitir excluir fojas de mero trámite.
  - *Por qué:* Aumenta drásticamente la calidad del análisis de pruebas, disminuye la latencia de respuesta y reduce el riesgo de alucinaciones en fechas de simples proveídos judiciales.
- **Decisión 3: Módulo Integrado con Estado React**
  - *Elección:* Un componente modular (`DossierTriageModal.tsx`) integrado sin salir de la plataforma.
  - *Por qué:* El usuario no tiene que usar una herramienta externa; mantiene todo el flujo en una sola interfaz soberana.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────┐
│ CLIENTE (React 19 / Vite SPA)                          │
│ - DossierTriageModal.tsx (Selector de folios y tomos)  │
│ - Chunked Upload Handler (Multipart / Fetch stream)    │
└───────────────────────────┬────────────────────────────┘
                            │ POST /api/dossier/process-large
                            ▼
┌────────────────────────────────────────────────────────┐
│ SERVIDOR EXPRESS (server.ts)                           │
│ - Multipart stream handler                             │
│ - Validador de rangos de fojas                         │
│ - Gemini File API Client (`ai.files.upload`)           │
│ - Generación estructurada con `gemini-3.8-flash`       │
└───────────────────────────┬────────────────────────────┘
                            │ Streaming response / JSON
                            ▼
┌────────────────────────────────────────────────────────┐
│ GOOGLE GEMINI BACKEND                                  │
│ - File API (Procesamiento nativo de PDF multimodal)    │
│ - Extracción focalizada en fojas marcadas              │
│ - Retorno a la canalización de Análisis de Pruebas     │
└────────────────────────────────────────────────────────┘
```

### Componentes y Rutas a Crear/Modificar
1. `/src/components/DossierTriageModal.tsx`: Modal para triaje de tomos judiciales, selección de folios, descarte de ruido procesal y monitor de subida.
2. `/server.ts`: Endpoint `/api/dossier/process-large` con soporte de subida multipart/stream y conexión a Gemini File API.
3. `/src/components/UploadZone.tsx`: Integración del botón de acceso directo *"⚡ ¿Tienes un expediente o tomo judicial de más de 50MB? Procesar aquí"*.
