# EvidenciaFácil ⚖️🔍 — Democratizador de E-Discovery y Valoración Probatoria Forense

> **Plataforma web de E-Discovery, Mapeo Argumentativo y Modelado Bayesiano Forense** diseñada para ciudadanos, abogados litigantes y peritos judiciales. Permite transformar capturas de pantalla de chats (WhatsApp, Telegram), correos electrónicos, contratos escaneados y recibos en **acervos probatorios estructurados, blindados criptográficamente y auditables 1:1 ante cualquier tribunal**.

---

## 🧭 ¿Qué problema resuelve y cómo te ayuda?

En los litigios reales (laborales, comerciales, civiles o de consumo), la mayoría de las pruebas decisivas residen en conversaciones de mensajería informal, audios y documentos dispersos. Los grandes estudios jurídicos utilizan suites de e-discovery como *Relativity* o *Everlaw* con costos de miles de dólares mensuales. Los ciudadanos y pequeños despachos quedaban en desventaja, teniendo que revisar manualmente cientos de hojas o pantallazos.

**EvidenciaFácil resuelve esto con tres pilares:**
1. **Extracción Multimodal 1 sola vez:** Google Gemini realiza la lectura OCR y estructuración documental en una única llamada ultraligera.
2. **Cómputo Local y Soberano (Zero DB / Zero Cost):** Los cálculos matemáticos, ordenamiento cronológico, detección de vacíos y teorema de Bayes corren **100% en la memoria RAM de tu propio navegador web**.
3. **Privacidad Absoluta (Ley N° 29733 - Perú):** **Cero servidores privados**. Tus chats y contratos no se almacenan en ninguna base de datos remota y **el creador de la plataforma no tiene forma técnica de ver tus archivos**.

### Casos de Uso de la Vida Real
* **💼 Despido Arbitrario y Horas Extra:** Sube los chats de WhatsApp donde tu jefe te daba órdenes los fines de semana o después de hora. La app genera la cronología fáctica con fecha y hora exacta que acredita la subordinación laboral y destruye las negativas de la empresa.
* **📄 Disputas Contractuales y Cobro de Facturas:** Sube el contrato marco y los chats donde el cliente te pedía cambios verbales o aceptaba prórrogas. La app detecta contradicciones entre el contrato escrito y los acuerdos informales, demostrando que no existió incumplimiento culpable.
* **🏠 Arrendamientos y Devolución de Garantía:** Acredita transferencias bancarias, acuerdos de prórroga y fotos del estado del inmueble con citas exactas para evitar retenciones indebidas.
* **🛒 Reclamos de Consumo (ej. INDECOPI / SERNAC / PROFECO):** Identifica el "Silencio Procesal" (días sin respuesta de la empresa) listo para adjuntar como prueba en una denuncia administrativa.

---

## 🚀 Flujo Rápido de Uso en 4 Pasos

```text
[ 1. Cargar Archivos ]  ──> [ 2. Lectura IA (1 vez) ] ──> [ 3. Análisis en Navegador ] ──> [ 4. Exportar Dictamen ]
 (WhatsApp, PDF, Fotos)       (Extracción estructurada)     (Bayes, Cronología, SHA-256)     (PDF, HTML o Demanda)
```

1. **Cargar Documentos:** Arrastra capturas de chats, contratos en PDF, recibos o pega transcripciones de texto. El navegador comprime imágenes a WebP y extrae texto con `pdfjs-dist` para no saturar la red.
2. **Contexto Opcional:** Escribe un breve resumen de lo que buscas acreditar (ej. *"Demanda por despido nulo y cobro de horas extras no remuneradas"*).
3. **Procesar E-Discovery:** Gemini extrae los hechos, las citas literales y las probabilidades iniciales.
4. **Navegar y Auditar:** Explora la Cronología, el Comparador de Contradicciones, los Vacíos Probatorios, el Grafo Argumental y la Cadena de Custodia. Modifica el peso de las pruebas interactivamente sin gastar tokens.

---

## 📊 Guía de Interpretación de las Herramientas

### 1. Evaluación Bayesiana $P(H|E)$ (Explicada para No Matemáticos)
Los tribunales no exigen "certeza infinita", sino **la sana crítica** y el estándar de la **probabilidad prevaleciente**. El Teorema de Bayes calcula exactamente cómo cada documento modifica la convicción judicial.

$$\large P(H|E) = \frac{P(E|H) \cdot P(H)}{P(E)}$$

* **Hipótesis ($H$):** La afirmación central que quieres probar (ej. *"Existió prórroga tácita de entrega"* o *"El despido fue injustificado"*).
* **Probabilidad a Priori ($P(H)$):** El punto de inicio de la balanza judicial (fijado en 50% = presunción de neutralidad e inocencia).
* **Razón de Verosimilitud (Likelihood Ratio - $LR$):** Mide la fuerza discriminante de la prueba:
  $$LR = \frac{P(E|H)}{P(E|\sim H)}$$
  *¿Cuántas veces es más probable que este mensaje de WhatsApp exista si dices la verdad frente a si fuera un invento?* Si $LR = 10$, la prueba es 10 veces más probable bajo tu teoría del caso.
* **Peso de la Evidencia en Decibeles (Escala de Alan Turing):**
  Para evitar multiplicar probabilidades complicadas, el célebre matemático Alan Turing introdujo la suma en **decibeles** ($\text{dB} = 10 \cdot \log_{10}(LR)$):
  * **$> +20\text{ dB}$:** **Prueba Concluyente** (convicción casi indiscutible).
  * **$+10\text{ a }+20\text{ dB}$:** **Prueba Fuerte** (respaldo sólido y coherente).
  * **$+3\text{ a }+10\text{ dB}$:** **Prueba Moderada** (indicio complementario).
  * **$0\text{ a }+3\text{ dB}$:** **Prueba Débil**.
  * **$< 0\text{ dB}$:** **Refuta la hipótesis** (favorece la posición de la contraparte).

#### 🛡️ Inferencia en Cascada de 2 Niveles (Modelo de Schum para Impugnaciones)
¿Qué ocurre si la contraparte afirma: *"Esa captura de WhatsApp es falsa o fue editada"*?
* En la pestaña **Evaluación Bayesiana**, cada prueba cuenta con un **Deslizador de Autenticidad / Integridad (0% a 100%)**.
* Si la prueba está 100% cotejada, aporta todo su peso.
* Si la contraparte genera dudas (ej. 50% de sospecha), bajas el deslizador y **el sistema recalcula en tiempo real en tu navegador cómo se debilita el caso**, permitiéndote preparar tu estrategia para la audiencia sin gastar dinero.

---

### 2. Cronología Procesal y Matriz de Pruebas
* **Ordenamiento Determinista en Cliente:** Las fechas se normalizan e intercalan cronológicamente de forma estricta.
* **Trazabilidad 1:1:** Cada hecho fáctico viene acompañado de la **cita textual literal** y el **nombre exacto del archivo** de respaldo. Al hacer clic, puedes inspeccionar el documento original y copiar la cita para tu escrito judicial.

### 3. Comparador de Contradicciones
* Muestra lado a lado la **Versión A (ej. declaración formal en carta notarial)** contra la **Versión B (ej. reconocimiento espontáneo en un audio o chat)**.
* Asigna un nivel de severidad procesal (*Crítica, Alta, Media*) y te da la fundamentación jurídica para contrainterrogar a la contraparte.

### 4. Detección Automática de Vacíos Probatorios (Silencios Procesales)
* Un algoritmo determinista en JavaScript audita los lapsos temporales del expediente.
* Si transcurren **más de 30 días sin comunicación documental** entre las partes, salta una alerta automática de **Silencio Procesal**.
* Te sugiere **diligencias concretas** (ej. *"Solicitar oficio bancario de movimientos de cuenta"*, *"Inspección ocular"*, *"Peritaje de metadatos"*).

### 5. Grafo Argumentativo (Modelo de Stephen Toulmin)
Estructura la lógica de la demanda conectando formalmente:
$$\text{Pretensión (Conclusión)} \longleftarrow \text{Datos (Hechos probados)} \longleftarrow \text{Garantía (Fundamento legal)} \longleftarrow \text{Respaldo}$$

### 6. Cadena de Custodia Criptográfica (SHA-256 e ISO/IEC 27037)
Para evitar que un juez declare inadmisible una prueba digital:
* En el instante de subir un archivo, la **Web Crypto API del navegador** calcula su huella criptográfica **SHA-256**.
* Si alguien altera un solo píxel de la imagen o una coma del PDF, el hash cambia completamente.
* **Botón "Copiar Acta para Demanda":** Genera un texto legal estructurado con el inventario de huellas para incluirlo como Otrosí en tu demanda.

### 7. Dictamen Pericial Judicial
Permite exportar un informe pericial completo con membrete, metadatos editables (N° de Causa, Tribunal, Perito responsable), tabla de verosimilitud bayesiana, cronología y firmas:
* Impresión directa y guardado en **PDF**.
* Descarga en **Markdown (.md)** o **HTML autosuficiente**.

---

## 🔒 Privacidad Soberana y Cumplimiento Ley N° 29733 (Perú)

La aplicación implementa de manera estricta los principios de la **Ley N° 29733 (Ley de Protección de Datos Personales de la República del Perú)** y su Reglamento (**D.S. 003-2013-JUS**):

1. **Cero Servidores Privados:** Los documentos no se suben a ningún backend propio, FTP ni base de datos externa.
2. **Inaccesibilidad Total del Creador:** El administrador del software **no tiene ninguna forma técnica de ver, leer, interceptar ni descargar tus chats o contratos**. No existen paneles administrativos con visibilidad de datos.
3. **Persistencia Local (`localStorage`):** Si guardas un caso para no perderlo al recargar la página, se almacena exclusivamente en la memoria de tu propio dispositivo. Al pulsar **"Nuevo Análisis"**, todo se destruye de la memoria local.
4. **Procesamiento Efímero en IA:** La llamada a Gemini se realiza sin almacenamiento de sesión para entrenamiento de modelos públicos.

---

## 🛠️ Stack Tecnológico

* **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons.
* **Procesamiento en Cliente:** Web Crypto API (SHA-256), `pdfjs-dist` (extracción local de texto), Canvas API (compresión WebP/JPEG).
* **Motores Deterministas:** 
  * `lib/bayesianEngine.ts`: Cálculo probabilístico exacto y decibeles de Turing con inferencia en cascada (Schum).
  * `lib/chronologyEngine.ts`: Ordenación cronológica y detección matemática de lagunas temporales.
  * `lib/fileProcessor.ts`: Compresión y hashing local previo al envío.
* **IA Multimodal:** Google Gemini API (`gemini-3.8-flash` o `gemini-1.5-flash`) con JSON Schema estricto.
* **Backend:** Next.js Route Handler / Express con compatibilidad para despliegues Serverless en Vercel (límite 4.5MB y 10s de timeout).

---

## 💻 Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/evidencia-facil.git
cd evidencia-facil
npm install
```

### 2. Configurar la clave de Gemini
Obtén una clave de API gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).
Crea tu archivo `.env.local`:
```env
GEMINI_API_KEY="AIzaSyTuClaveDeGeminiAqui"
```

### 3. Iniciar el entorno de desarrollo
```bash
npm run dev
```
Abre en tu navegador: [http://localhost:3000](http://localhost:3000)

---

## ☁️ Despliegue en Vercel (Plan Gratuito 100% Optimizado)

1. Sube el código a tu repositorio de GitHub.
2. En [Vercel](https://vercel.com), selecciona **Add New Project** e importa el repositorio.
3. En la sección **Environment Variables**, añade:
   * `GEMINI_API_KEY`: Tu clave de Gemini.
4. Haz clic en **Deploy**.
   * *La app está especialmente optimizada para respetar el timeout de 10 segundos y el límite de 4.5MB de Vercel gracias al preprocesamiento en el cliente.*

---

## ⚖️ Aviso Legal y Deontología Forense

*EvidenciaFácil* es una herramienta de auxilio técnico y sistematización objetiva de la evidencia documental. No sustituye el patrocinio de un abogado colegiado ni las resoluciones de los tribunales de justicia. Los cálculos de probabilidad bayesiana y las huellas criptográficas SHA-256 se proporcionan como soporte técnico explicable bajo el principio de motivación de las decisiones judiciales.
