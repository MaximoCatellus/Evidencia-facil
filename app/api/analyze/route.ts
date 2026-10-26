import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION_FORENSIC, FORENSIC_JSON_SCHEMA } from '@/lib/prompts/forensicPrompt';

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const documentText = body?.documentText || (Array.isArray(body?.files) ? body.files.map((f: any) => f.textContent || "").join("\n\n") : "");

    if (!documentText || documentText.trim().length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionó texto de archivo ni contenido documental para auditar.' },
        { status: 400 }
      );
    }

    const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest", "gemini-1.5-pro"];
    let responseText = "";

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [{ text: `Analiza y audita con rigor forense 1:1 el siguiente expediente documental:\n\n${documentText}` }]
            }
          ],
          config: {
            systemInstruction: SYSTEM_INSTRUCTION_FORENSIC,
            responseMimeType: 'application/json',
            responseSchema: FORENSIC_JSON_SCHEMA as any,
            temperature: 0.1, // Baja temperatura para respuestas factuales estrictas sin alucinaciones
          }
        });
        responseText = response.text ?? '{}';
        if (responseText.trim() && responseText.trim() !== '{}') break;
      } catch (modelErr: any) {
        console.warn(`[Analyze/route] Advertencia con modelo ${modelName}:`, modelErr?.message || modelErr);
      }
    }

    const forensicData = JSON.parse(responseText);

    return NextResponse.json({ success: true, data: forensicData });
  } catch (error: any) {
    console.error('Error en auditoría forense:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno en el procesamiento forense' },
      { status: 500 }
    );
  }
}
