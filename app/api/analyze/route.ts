import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION_FORENSIC, FORENSIC_JSON_SCHEMA } from '@/lib/prompts/forensicPrompt';
import { processRawDossierText, splitPayloadIntoMicroChunks, deduplicateHitos } from '@/lib/largeFileProcessor';

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

const candidateModels = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite"
];

async function callGeminiWithSchema(chunkText: string): Promise<any> {
  for (const modelName of candidateModels) {
    const maxRetries = 2;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: `Analiza y audita con rigor forense 1:1 el siguiente lote de fojas del expediente documental:\n\n${chunkText}` }]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_FORENSIC,
            responseMimeType: 'application/json',
            responseSchema: FORENSIC_JSON_SCHEMA as any,
            temperature: 0.1,
          }
        });
        const text = response.text?.trim() || '{}';
        if (text && text !== '{}') {
          return JSON.parse(text);
        }
      } catch (err: any) {
        const isTransient = err?.status === "UNAVAILABLE" || err?.status === 503 || err?.message?.includes("high demand");
        if (isTransient && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 2000));
        } else {
          break;
        }
      }
    }
  }
  return {};
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawDocumentText =
      body?.documentText ||
      (Array.isArray(body?.files) ? body.files.map((f: any) => f.textContent || "").join("\n\n") : "");

    if (!rawDocumentText || rawDocumentText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionó texto de archivo ni contenido documental para auditar.' },
        { status: 400 }
      );
    }

    // Preprocesar con largeFileProcessor (rescate fáctico + fojas ALTA y MEDIA)
    const preprocessed = processRawDossierText(rawDocumentText);
    const payloadText = preprocessed.payload || rawDocumentText;

    // Dividir en micro-lotes de 15 fojas si el documento es extenso
    const microChunks = splitPayloadIntoMicroChunks(payloadText, 15);

    let allHitos: any[] = [];
    let allContradicciones: any[] = [];
    let allVacios: any[] = [];
    let allSilencios: any[] = [];
    let allPartes: any[] = [];
    let expedienteName = "Expediente Judicial";
    let periodos: string[] = [];
    let resumenes: string[] = [];

    for (const chunkText of microChunks) {
      const chunkResponse = await callGeminiWithSchema(chunkText);

      if (chunkResponse.expediente && (expedienteName === "Expediente Judicial" || !expedienteName)) {
        expedienteName = chunkResponse.expediente;
      }
      if (chunkResponse.periodo_documentado) {
        periodos.push(chunkResponse.periodo_documentado);
      }
      if (chunkResponse.resumen_ejecutivo) {
        resumenes.push(chunkResponse.resumen_ejecutivo);
      }
      if (Array.isArray(chunkResponse.partes_intervinientes)) {
        allPartes.push(...chunkResponse.partes_intervinientes);
      }
      if (Array.isArray(chunkResponse.cronologia_hitos)) {
        allHitos.push(...chunkResponse.cronologia_hitos);
      }
      if (Array.isArray(chunkResponse.matriz_contradicciones)) {
        allContradicciones.push(...chunkResponse.matriz_contradicciones);
      }
      if (Array.isArray(chunkResponse.vacios_probatorios)) {
        allVacios.push(...chunkResponse.vacios_probatorios);
      }
      if (Array.isArray(chunkResponse.silencios_procesales)) {
        allSilencios.push(...chunkResponse.silencios_procesales);
      }
    }

    // Deduplicar por hash de hecho (fecha, cita_literal) para erradicar antecedentes reciclados
    const finalChronology = deduplicateHitos(allHitos);

    const finalContradicciones = allContradicciones.map((c, index) => ({
      ...c,
      id_conflicto: `C-${String(index + 1).padStart(3, '0')}`
    }));

    const finalVacios = allVacios.map((v, index) => ({
      ...v,
      id_vacio: `V-${String(index + 1).padStart(3, '0')}`
    }));

    // Deduplicar partes intervinientes por nombre
    const uniquePartes = Array.from(
      new Map(
        allPartes
          .filter((p) => p && p.nombre)
          .map((p) => [p.nombre.toLowerCase().trim(), p])
      ).values()
    );

    const consolidatedResult = {
      expediente: expedienteName,
      periodo_documentado: periodos[0] || "Periodo según fojas obrantes",
      resumen_ejecutivo: resumenes.slice(0, 3).join("\n\n") || "Análisis documental completado.",
      partes_intervinientes: uniquePartes,
      cronologia_hitos: finalChronology,
      matriz_contradicciones: finalContradicciones,
      vacios_probatorios: finalVacios,
      silencios_procesales: allSilencios,
      recomendaciones_estrategicas: [
        "Presentar excepción de improcedencia respecto a las actuaciones que carecen de sustento fáctico directo.",
        "Solicitar diligencia de exhibición forzada respecto a los vacíos probatorios identificados.",
        "Interponer tacha contra declaraciones contradictorias detectadas entre fojas obrantes."
      ]
    };

    return NextResponse.json({ success: true, data: consolidatedResult });
  } catch (error: any) {
    console.error('Error en auditoría forense:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno en el procesamiento forense' },
      { status: 500 }
    );
  }
}
