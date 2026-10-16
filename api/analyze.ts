import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb"
    }
  }
};

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido. Utilice POST." });
  }

  try {
    const { files = [], caseContext = "" } = req.body || {};

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: "Se requiere al menos un archivo probatorio (imagen de chat, contrato, correo o documento)."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY no está configurada en las variables de entorno de Vercel."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "evidencia-facil-vercel" }
      }
    });

    const promptInstructions = `Eres un perito forense digital y analista procesal senior de E-Discovery judicial.
Tu misión es auditar de manera minuciosa, objetiva y técnica los documentos aportados (capturas de chats como WhatsApp o Telegram, correos electrónicos, contratos, pagarés, facturas o recibos bancarios).

INSTRUCCIONES PERICIALES OBLIGATORIAS (OCR, EXTRACCIÓN LITERAL Y ANÁLISIS DE FONDO):
1. OCR Y LECTURA VISUAL EXHAUSTIVA DE IMÁGENES:
   - Para CADA captura de pantalla o imagen aportada: LEE Y TRANSCRIBE TODO el texto real visible en la imagen.
   - En capturas de mensajería (WhatsApp, Telegram, Signal, SMS):
     * Identifica el contacto o interlocutor en la cabecera.
     * Lee cada bocadillo de mensaje: fecha, hora exacta (ej. "10:14 a. m.") y transcribe cada mensaje textual en 'cita_o_referencia' con comillas literales ("...").
     * En 'hecho': Describe el hecho fáctico que acredita procesalmente.
   - En contratos, recibos o facturas: Extrae montos, fechas de vencimiento, cláusulas y partes firmantes.
   - PROHIBICIÓN ABSOLUTA DE FALSOS PLACEHOLDERS: Prohibido emitir textos genéricos como "Aportación probatoria del soporte visual...". Extrae los datos reales de la imagen.

2. DETECCIÓN DE CONTRADICCIONES:
   - Cruza las versiones entre mensajes o documentos señalando la discrepancia concreta y su impacto probatorio.

3. SEÑALAMIENTO DE VACÍOS PROBATORIOS:
   - Detecta saltos temporales, transferencias sin confirmación o documentos no adjuntados, sugiriendo diligencias judiciales concretas.

${caseContext ? `\nCONTEXTO PROCESAL APORTADO POR EL USUARIO:\n"""${caseContext}"""\n` : ""}

Debes responder ÚNICAMENTE con un objeto JSON válido (sin formato markdown) con la estructura:
{
  "resumen_caso": {
    "titulo_caso": "Título procesal descriptivo",
    "resumen_ejecutivo": "Síntesis probatoria de 2 a 3 párrafos",
    "periodo_temporal": { "inicio": "Fecha inicial", "fin": "Fecha final" },
    "partes_identificadas": [
      { "nombre": "Nombre", "rol": "Demandante / Demandado / Interlocutor", "detalles": "Cargo o función" }
    ]
  },
  "cronologia": [
    {
      "id": "H-001",
      "fecha_hora": "Fecha y hora exacta visible",
      "hecho": "Descripción concreta del hecho o mensaje",
      "personas_involucradas": ["Nombre"],
      "fuente_documental": "Nombre exacto del archivo",
      "cita_o_referencia": "\\"Texto literal entre comillas\\"",
      "relevancia": "Alta",
      "tipo_evento": "Comunicación / Transacción / Notificación / Requerimiento",
      "analisis_procesal": "Valor probatorio para el juicio"
    }
  ],
  "contradicciones": [
    {
      "id": "C-001",
      "titulo": "Título de la contradicción",
      "hecho_a": { "declaracion": "Versión A", "fuente": "Archivo y fecha A", "autor_o_parte": "Parte A" },
      "hecho_b": { "declaracion": "Versión B opuesta", "fuente": "Archivo y fecha B", "autor_o_parte": "Parte B" },
      "explicacion_discrepancia": "Análisis pericial de la discrepancia",
      "impacto_procesal": "Afectación a la credibilidad",
      "nivel_gravedad": "Crítica"
    }
  ],
  "vacios_probatorios": [
    {
      "id": "V-001",
      "descripcion": "Descripción del vacío o prueba faltante",
      "hecho_o_periodo_afectado": "Ventana temporal",
      "riesgo_procesal": "Riesgo jurídico",
      "diligencia_o_prueba_sugerida": "Diligencia probatoria concreta a solicitar",
      "prioridad": "Alta"
    }
  ],
  "recomendaciones_legales": ["Recomendación 1", "Recomendación 2"],
  "metadata_analisis": {
    "total_documentos": ${files.length},
    "calidad_evidencia": "Sólida con Trazabilidad Documental 1:1",
    "alerta_integridad": "Trazabilidad documental verificada mediante OCR multimodal."
  }
}`;

    const parts: any[] = [{ text: promptInstructions }];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name || `Evidencia_${i + 1}`;
      const mimeType = file.type || "image/png";

      if (file.textContent) {
        parts.push({
          text: `\n--- DOCUMENTO PROBATORIO #${i + 1}: [${fileName}] ---\n${file.textContent}\n`
        });
      } else if (file.base64) {
        const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, "");
        parts.push({
          text: `\n[SOPORTE DIGITAL ADJUNTO #${i + 1}: ${fileName} (${mimeType}). Realiza lectura visual y OCR completo de esta imagen:]`
        });
        parts.push({
          inlineData: {
            mimeType: mimeType.includes("pdf") ? "application/pdf" : mimeType,
            data: cleanBase64
          }
        });
      }
    }

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash"];
    let structuredData: any = null;
    let lastError: any = null;

    for (const modelName of candidateModels) {
      const maxRetries = modelName === "gemini-3.1-flash-lite" ? 4 : 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              responseMimeType: "application/json",
              temperature: 0.1
            }
          });

          const text = response.text;
          if (text) {
            const cleanJson = text.trim().replace(/^```json/i, "").replace(/```$/i, "").trim();
            structuredData = JSON.parse(cleanJson);
            break;
          }
        } catch (err: any) {
          lastError = err;
          const is503 = err?.status === 503 || String(err?.message || "").includes("503");
          if (is503 && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
            continue;
          }
          break;
        }
      }
      if (structuredData) break;
    }

    if (!structuredData) {
      throw new Error(lastError?.message || "No fue posible procesar las evidencias con la API de Gemini.");
    }

    return res.status(200).json({
      success: true,
      isDemo: false,
      data: structuredData
    });
  } catch (error: any) {
    console.error("Error en Vercel Serverless /api/analyze:", error);
    return res.status(500).json({
      error: error?.message || "Error al procesar el expediente probatorio."
    });
  }
}
