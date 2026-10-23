import { processForensicEvidence } from "../src/lib/geminiAnalyzer.ts";
import { generateTailoredAnalysis, normalizeAnalysisResult } from "../src/lib/tailoredAnalysis.ts";

export const config = {
  maxDuration: 60,
};

export default async function handler(req: any, res: any) {
  // Configurar cabeceras CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: `Método ${req.method} no permitido. Esta ruta espera una petición POST con los documentos probatorios.`
    });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { files = [], caseContext = "", useDemoFallback = false } = body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: "Se requiere al menos un archivo de evidencia (imagen de chat, documento, correo o contrato)."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key en las variables de entorno de Vercel, proveer análisis procesal inmediato
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const fallbackData = normalizeAnalysisResult(generateTailoredAnalysis(files, caseContext), files);
      return res.status(200).json({
        success: true,
        isDemo: true,
        message: "Análisis procesal generado mediante el motor forense local de contingencia (sin API Key configurada en Vercel).",
        data: fallbackData
      });
    }

    const result = await processForensicEvidence(files, caseContext, apiKey, useDemoFallback);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error("[Vercel /api/analyze Error]:", err);
    return res.status(500).json({
      error: err?.message || "Ocurrió un error al procesar las evidencias con la API de Gemini.",
      details: err?.toString()
    });
  }
}
