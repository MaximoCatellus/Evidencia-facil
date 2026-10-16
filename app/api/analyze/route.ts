// Next.js App Router compatible response helper (compatible with Next.js 14/15)
class NextResponse extends Response {
  static json(data: any, init?: ResponseInit) {
    return Response.json(data, init);
  }
}
import { GoogleGenAI, Type } from "@google/genai";

// Response schema for structured legal E-Discovery analysis
const legalAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    resumen_caso: {
      type: Type.OBJECT,
      properties: {
        titulo_caso: { type: Type.STRING },
        resumen_ejecutivo: { type: Type.STRING },
        periodo_temporal: {
          type: Type.OBJECT,
          properties: {
            inicio: { type: Type.STRING },
            fin: { type: Type.STRING }
          },
          required: ["inicio", "fin"]
        },
        partes_identificadas: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nombre: { type: Type.STRING },
              rol: { type: Type.STRING },
              detalles: { type: Type.STRING }
            },
            required: ["nombre", "rol", "detalles"]
          }
        }
      },
      required: ["titulo_caso", "resumen_ejecutivo", "periodo_temporal", "partes_identificadas"]
    },
    cronologia: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          fecha_hora: { type: Type.STRING },
          hecho: { type: Type.STRING },
          personas_involucradas: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          fuente_documental: { type: Type.STRING },
          cita_o_referencia: { type: Type.STRING },
          relevancia: { type: Type.STRING },
          tipo_evento: { type: Type.STRING },
          analisis_procesal: { type: Type.STRING }
        },
        required: [
          "id",
          "fecha_hora",
          "hecho",
          "personas_involucradas",
          "fuente_documental",
          "cita_o_referencia",
          "relevancia",
          "tipo_evento",
          "analisis_procesal"
        ]
      }
    },
    contradicciones: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          titulo: { type: Type.STRING },
          hecho_a: {
            type: Type.OBJECT,
            properties: {
              declaracion: { type: Type.STRING },
              fuente: { type: Type.STRING },
              autor_o_parte: { type: Type.STRING }
            },
            required: ["declaracion", "fuente", "autor_o_parte"]
          },
          hecho_b: {
            type: Type.OBJECT,
            properties: {
              declaracion: { type: Type.STRING },
              fuente: { type: Type.STRING },
              autor_o_parte: { type: Type.STRING }
            },
            required: ["declaracion", "fuente", "autor_o_parte"]
          },
          explicacion_discrepancia: { type: Type.STRING },
          impacto_procesal: { type: Type.STRING },
          nivel_gravedad: { type: Type.STRING }
        },
        required: ["id", "titulo", "hecho_a", "hecho_b", "explicacion_discrepancia", "impacto_procesal", "nivel_gravedad"]
      }
    },
    vacios_probatorios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          descripcion: { type: Type.STRING },
          hecho_o_periodo_afectado: { type: Type.STRING },
          riesgo_procesal: { type: Type.STRING },
          diligencia_o_prueba_sugerida: { type: Type.STRING },
          prioridad: { type: Type.STRING }
        },
        required: ["id", "descripcion", "hecho_o_periodo_afectado", "riesgo_procesal", "diligencia_o_prueba_sugerida", "prioridad"]
      }
    },
    recomendaciones_legales: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    metadata_analisis: {
      type: Type.OBJECT,
      properties: {
        total_documentos: { type: Type.NUMBER },
        calidad_evidencia: { type: Type.STRING },
        alerta_integridad: { type: Type.STRING }
      },
      required: ["total_documentos", "calidad_evidencia", "alerta_integridad"]
    }
  },
  required: ["resumen_caso", "cronologia", "contradicciones", "vacios_probatorios", "recomendaciones_legales", "metadata_analisis"]
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { files = [], caseContext = "" } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un archivo o soporte probatorio para analizar." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY no está configurada en las variables de entorno del servidor." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    const parts: any[] = [];

    const systemPrompt = `Actúa como un perito forense digital y analista procesal de E-Discovery judicial.
Tu cometido es analizar minuciosamente los documentos proporcionados (capturas de chats de WhatsApp, Telegram, emails, contratos, comprobantes de pago o recibos bancarios).

INSTRUCCIONES PERICIALES DE OCR Y EXTRACCIÓN:
1. Para cada captura de pantalla o imagen de chat: realiza OCR completo, identifica quién escribe (izquierda/derecha), fecha y hora exacta visible (ej. "10:14 a. m."), y transcribe cada mensaje textual relevante en 'cita_o_referencia' con comillas literales ("...").
2. Está estrictamente prohibido emitir respuestas genéricas tipo placeholder ("Soporte probatorio...", "Aportación probatoria del soporte visual..."). Debes extraer el contenido real visible.
3. Detecta contradicciones entre versiones y vacíos probatorios precisos recomendando diligencias concretas.

${caseContext ? `Contexto del caso aportado por el litigante:\n"${caseContext}"\n` : ""}`;

    parts.push({ text: systemPrompt });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = file.name || `Documento_${i + 1}`;
      const mimeType = file.type || "image/png";

      if (file.textContent) {
        parts.push({
          text: `[DOCUMENTO PROBATORIO #${i + 1}: ${fileName}]\n${file.textContent}\n[FIN DOCUMENTO #${i + 1}]\n`
        });
      } else if (file.base64) {
        const cleanBase64 = file.base64.replace(/^data:[^;]+;base64,/, "");
        parts.push({
          text: `[SOPORTE DIGITAL #${i + 1}: ${fileName} (${mimeType}) - Realiza lectura visual y OCR completo:]`
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
    let parsedData: any = null;

    for (const modelName of candidateModels) {
      const maxRetries = modelName === "gemini-3.1-flash-lite" ? 4 : 2;
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: { parts },
            config: {
              systemInstruction: "Eres un perito forense de E-Discovery judicial. Genera respuestas estrictas en JSON estructurado basadas en hechos y citas reales de los documentos.",
              responseMimeType: "application/json",
              responseSchema: legalAnalysisSchema,
              temperature: 0.1
            }
          });

          const text = response.text;
          if (text) {
            parsedData = JSON.parse(text);
            break;
          }
        } catch (err: any) {
          console.warn(`Intento ${attempt} con modelo ${modelName} falló:`, err?.message || err);
          const is503 = err?.status === 503 || String(err?.message || "").includes("503");
          if (is503 && attempt < maxRetries) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
            continue;
          }
          break;
        }
      }
      if (parsedData) break;
    }

    if (!parsedData) {
      throw new Error("No fue posible generar el análisis estructurado con los modelos disponibles tras los reintentos.");
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Error en /api/analyze:", error);
    return NextResponse.json(
      { error: error?.message || "Error procesando el análisis legal con Gemini." },
      { status: 500 }
    );
  }
}
