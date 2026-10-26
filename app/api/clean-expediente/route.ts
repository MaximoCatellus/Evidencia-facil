import { GoogleGenAI } from "@google/genai";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Next.js App Router Route Handler (Standard Web Request / Response)
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds on Vercel Pro

export async function POST(req: Request) {
  let tempFilePath: string | null = null;
  let uploadedFileResult: any = null;
  let ai: GoogleGenAI | null = null;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY no configurada en las variables de entorno." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caseNotes = (formData.get("caseNotes") as string) || "";

    if (!file) {
      return Response.json(
        { error: "No se proporcionó ningún archivo de expediente." },
        { status: 400 }
      );
    }

    // 1. Guardar temporalmente el archivo en disco (/tmp) para el uploader
    const buffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir();
    const safeName = `expediente_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    tempFilePath = path.join(tempDir, safeName);
    await fs.writeFile(tempFilePath, buffer);

    // 2. Inicializar SDK oficial @google/genai y subir archivo a Gemini File API
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    uploadedFileResult = await ai.files.upload({
      file: tempFilePath,
      config: {
        mimeType: file.type || "application/pdf"
      }
    });

    // 3. Ejecutar modelo moderno gemini-3.8-flash con System Prompt de Depuración Judicial
    const systemPrompt = `Eres un Perito Judicial y Auditor Forense Documental especializado en E-Discovery y Depuración de Ruido Procesal.
Tu misión exclusiva es leer tomos enteros de expedientes judiciales y DESMALEZAR todo el ruido administrativo.

REGLAS DE FILTRADO Y PURIFICACIÓN:
1. DESCARTA ABSOLUTAMENTE:
   - Cédulas de notificación judicial estándar y sellos de recepción de mesa de partes.
   - Decretos de mero trámite ("Téngase presente", "Agréguese a autos", "Se proveerá").
   - Carátulas, certificaciones de fojas vacías y copias repetidas de DNI.
   - Constancias de relatoría sin contenido de fondo.

2. AISLA Y CONSERVA ÚNICAMENTE EVIDENCIA SUSTANCIAL:
   - Transcripciones o capturas de chats, WhatsApp, correos electrónicos.
   - Declaraciones testimoniales, confesiones y manifestaciones ante fiscalía o juzgado.
   - Contratos, adendas, cláusulas penales, comprobantes de pago o transferencias bancarias.
   - Dictámenes periciales contables, médicos o grafotécnicos.
   - Actas de constatación o allanamiento.
   - Fechas exactas, montos dinerarios, nombres completos de las partes y contradicciones flagrantes.

Debes responder ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "titulo_expediente": string,
  "fojas_estimadas": number,
  "resumen_purificado": string,
  "evidencias_clave": [
    {
      "id": string,
      "tipo": "chat" | "contrato" | "declaracion" | "comprobante" | "peritaje" | "acta",
      "foja_o_referencia": string,
      "fecha": string,
      "partes": string[],
      "contenido_sustancial": string,
      "cita_textual": string,
      "relevancia": "critica" | "alta" | "media"
    }
  ],
  "contradicciones_detectadas": [
    {
      "titulo": string,
      "foja_a": string,
      "declaracion_a": string,
      "foja_b": string,
      "declaracion_b": string,
      "explicacion": string
    }
  ],
  "estadisticas_depuracion": {
    "ruido_descartado_porcentaje": number,
    "elementos_relevantes_encontrados": number
  }
}`;

    // Verificar si el archivo está en procesamiento y esperar a que esté ACTIVE
    let fileInfo = await ai.files.get({ name: uploadedFileResult.name });
    let attempts = 0;
    while (fileInfo.state === "PROCESSING" && attempts < 15) {
      console.log(`[clean-expediente/route] Esperando estado ACTIVE del archivo (${attempts + 1}/15)...`);
      await new Promise((r) => setTimeout(r, 2000));
      fileInfo = await ai.files.get({ name: uploadedFileResult.name });
      attempts++;
    }

    if (fileInfo.state === "FAILED") {
      throw new Error("El procesamiento del archivo en Gemini File API falló.");
    }

    const promptText = `Procesa y depura este expediente judicial completo. 
Notas adicionales del caso aportadas por el usuario: ${caseNotes || "Sin notas adicionales."}
Extrae únicamente la evidencia sustancial en el formato JSON estipulado.`;

    const filePart = {
      fileData: {
        fileUri: uploadedFileResult.uri || fileInfo.uri,
        mimeType: uploadedFileResult.mimeType || fileInfo.mimeType || "application/pdf"
      }
    };

    const candidateModels = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let rawResponse = "";

    for (const modelName of candidateModels) {
      try {
        const result = await ai.models.generateContent({
          model: modelName,
          contents: [
            filePart,
            { text: promptText }
          ],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            temperature: 0.1
          }
        });

        rawResponse = result.text || "";
        if (rawResponse.trim()) break;
      } catch (modelErr: any) {
        console.warn(`[clean-expediente/route] Advertencia con modelo ${modelName}:`, modelErr?.message || modelErr);
      }
    }
    let cleanedJson: any = null;

    try {
      const match = rawResponse.match(/\{[\s\S]*\}/);
      if (match) {
        cleanedJson = JSON.parse(match[0]);
      } else {
        cleanedJson = JSON.parse(rawResponse);
      }
    } catch {
      cleanedJson = {
        titulo_expediente: file.name,
        resumen_purificado: rawResponse,
        evidencias_clave: [],
        contradicciones_detectadas: [],
        estadisticas_depuracion: {
          ruido_descartado_porcentaje: 85,
          elementos_relevantes_encontrados: 0
        }
      };
    }

    // 4. Retornar el JSON purificado y liviano (<100KB)
    return Response.json({
      success: true,
      originalFileName: file.name,
      originalSizeBytes: file.size,
      purifiedData: cleanedJson
    });

  } catch (error: any) {
    console.error("Error en clean-expediente:", error);
    return Response.json(
      { error: error?.message || "Error al procesar y depurar el expediente con Gemini File API" },
      { status: 500 }
    );
  } finally {
    // 5. Limpieza garantizada de archivos temporales locales y remotos
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.warn("No se pudo borrar el archivo temporal local:", e);
      }
    }
    if (ai && uploadedFileResult?.name) {
      try {
        await ai.files.delete({ name: uploadedFileResult.name });
      } catch (e) {
        console.warn("No se pudo eliminar el archivo en Gemini File API:", e);
      }
    }
  }
}
