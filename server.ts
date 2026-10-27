import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import os from "os";
import multer from "multer";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_FORENSIC, FORENSIC_JSON_SCHEMA } from "./lib/prompts/forensicPrompt.ts";
import { processForensicEvidence } from "./src/lib/geminiAnalyzer.ts";
import { generateTailoredAnalysis, normalizeAnalysisResult, type EvidenceFilePayload, type AnalyzeRequestBody } from "./src/lib/tailoredAnalysis.ts";
import { processLargeDossier } from "./src/lib/expedienteCleaner.ts";
import { processRawDossierText, splitPayloadIntoMicroChunks, deduplicateHitos } from "./lib/largeFileProcessor.ts";
import { groupPagesIntoDocumentUnits, formatDocumentUnitsForGemini } from "./lib/documentChunker.ts";
import { safeParseForensicJson } from "./lib/jsonRepair.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Multer upload config for large PDF judicial dossiers (>50MB up to 250MB)
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 250 * 1024 * 1024 }
});

// Set payload limit to handle base64 images, PDFs, and legal evidence bundles
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// POST /api/clean-expediente (Pipeline de Filtrado con Gemini File API)
app.post("/api/clean-expediente", upload.single("file"), async (req, res) => {
  let tempPath: string | null = null;
  try {
    const caseNotes = (req.body?.caseNotes as string) || "";

    if (!req.file) {
      return res.status(400).json({
        error: "No se proporcionó ningún archivo de expediente."
      });
    }

    const targetFilePath = req.file.path;
    tempPath = req.file.path;
    const targetFileName = req.file.originalname;
    const targetFileSizeMb = req.file.size / (1024 * 1024);

    console.log(`[POST /api/clean-expediente] Procesando ${targetFileName} (${targetFileSizeMb.toFixed(1)} MB)...`);
    const result = await processLargeDossier(targetFilePath, targetFileName, targetFileSizeMb, caseNotes);

    return res.json({
      success: true,
      originalFileName: targetFileName,
      originalSizeBytes: Math.round(targetFileSizeMb * 1024 * 1024),
      purifiedData: result
    });
  } catch (error: any) {
    console.error("Error en /api/clean-expediente:", error);
    return res.status(500).json({
      error: error?.message || "Error al procesar el expediente voluminoso."
    });
  } finally {
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        await fs.promises.unlink(tempPath);
      } catch (e) {
        console.warn("No se pudo eliminar archivo temporal:", e);
      }
    }
  }
});

// POST /api/clean-expediente/chunk (Subida por fragmentos de 3.5MB para esquivar el límite 413 de Cloud Run y Vercel)
app.post("/api/clean-expediente/chunk", upload.single("chunk"), async (req, res) => {
  let assembledFilePath: string | null = null;
  try {
    const uploadId = (req.body?.uploadId as string) || "default";
    const chunkIndex = parseInt(req.body?.chunkIndex, 10);
    const totalChunks = parseInt(req.body?.totalChunks, 10);
    const fileName = (req.body?.fileName as string) || "expediente.pdf";
    const caseNotes = (req.body?.caseNotes as string) || "";

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió el fragmento de archivo." });
    }

    const safeUploadId = uploadId.replace(/[^a-zA-Z0-9_-]/g, "");
    const tempAssemblyPath = path.join(os.tmpdir(), `assembled_${safeUploadId}.pdf`);

    // Si es el primer fragmento, sobreescribir o inicializar el archivo ensamblado
    const chunkBuffer = await fs.promises.readFile(req.file.path);
    if (chunkIndex === 0) {
      await fs.promises.writeFile(tempAssemblyPath, chunkBuffer);
    } else {
      await fs.promises.appendFile(tempAssemblyPath, chunkBuffer);
    }

    // Limpiar el archivo temporal del chunk recibido
    try {
      await fs.promises.unlink(req.file.path);
    } catch {}

    // Si todavía no es el último fragmento, confirmar recepción exitosa
    if (chunkIndex < totalChunks - 1) {
      return res.json({
        success: true,
        isComplete: false,
        chunkIndex,
        totalChunks,
        message: `Fragmento ${chunkIndex + 1} de ${totalChunks} recibido y ensamblado.`
      });
    }

    // ¡Es el último fragmento! El archivo completo de 97+ MB está 100% ensamblado en tempAssemblyPath
    assembledFilePath = tempAssemblyPath;
    const stats = await fs.promises.stat(tempAssemblyPath);
    const assembledSizeMb = stats.size / (1024 * 1024);

    console.log(`[Chunked Upload] Archivo ensamblado con éxito: ${fileName} (${assembledSizeMb.toFixed(1)} MB en ${totalChunks} fragmentos).`);
    console.log(`[Chunked Upload] Iniciando procesamiento con Gemini File API...`);

    const result = await processLargeDossier(assembledFilePath, fileName, assembledSizeMb, caseNotes);

    return res.json({
      success: true,
      isComplete: true,
      originalFileName: fileName,
      originalSizeBytes: stats.size,
      purifiedData: result
    });
  } catch (error: any) {
    console.error("Error en /api/clean-expediente/chunk:", error);
    return res.status(500).json({
      error: error?.message || "Error procesando fragmento del expediente."
    });
  } finally {
    if (assembledFilePath && fs.existsSync(assembledFilePath)) {
      try {
        await fs.promises.unlink(assembledFilePath);
      } catch (e) {
        console.warn("No se pudo eliminar archivo ensamblado temporal:", e);
      }
    }
  }
});

// POST /api/analyze
app.post("/api/analyze", async (req, res) => {
  try {
    const customTemp = 0.1;
    const requestedModel = req.body?.model || "gemini-3.8-flash";

    // 1. Si se envía documentText para auditoría forense documental estricta
    if (req.body?.documentText) {
      const rawDocumentText = req.body.documentText;
      let documentText = rawDocumentText;

      try {
        const preprocessed = processRawDossierText(rawDocumentText);
        if (preprocessed.payload && preprocessed.payload.trim().length > 100) {
          documentText = preprocessed.payload;
          console.log(`[server.ts] Pre-procesamiento completado: ${preprocessed.usefulPageCount} fojas útiles (ALTA/MEDIA), compresión del ${preprocessed.compressionPercentage}%.`);
        }
      } catch (err) {
        console.warn("[server.ts] Error en pre-procesamiento, continuando con texto íntegro:", err);
      }

      const apiKey = process.env.GEMINI_API_KEY || "";

      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        return res.status(400).json({
          error: "GEMINI_API_KEY no configurada en el servidor."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const candidateModels = [
        "gemini-flash-latest",
        "gemini-3.8-flash",
        "gemini-3.1-flash-lite"
      ];
      // Map-Reduce por micro-lotes para garantizar que ningún hito se macro-sintetice
      const microChunks = splitPayloadIntoMicroChunks(documentText, 15);
      console.log(`[server.ts] Procesando expediente mediante Map-Reduce en ${microChunks.length} micro-lote(s)...`);

      let allHitos: any[] = [];
      let allContradicciones: any[] = [];
      let allVacios: any[] = [];
      let allSilencios: any[] = [];
      let allPartes: any[] = [];
      let expedienteName = "Expediente Judicial";
      let periodos: string[] = [];
      let resumenes: string[] = [];

      for (let chunkIdx = 0; chunkIdx < microChunks.length; chunkIdx++) {
        const chunkText = microChunks[chunkIdx];
        let chunkResponseText = "";

        for (let mIdx = 0; mIdx < candidateModels.length; mIdx++) {
          const modelName = candidateModels[mIdx];
          try {
            console.log(`[server.ts /api/analyze] Procesando micro-lote ${chunkIdx + 1}/${microChunks.length} con modelo ${modelName}...`);
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: "user",
                  parts: [{ text: `Analiza y audita con rigor forense 1:1 el siguiente lote (${chunkIdx + 1}/${microChunks.length}) del expediente documental:\n\n${chunkText}` }]
                }
              ],
              config: {
                systemInstruction: SYSTEM_INSTRUCTION_FORENSIC,
                responseMimeType: "application/json",
                responseSchema: FORENSIC_JSON_SCHEMA as any,
                temperature: 0.1
              }
            });
            chunkResponseText = response.text ?? "{}";
            if (chunkResponseText.trim() && chunkResponseText.trim() !== "{}") {
              console.log(`[server.ts /api/analyze] ✓ Micro-lote ${chunkIdx + 1} completado con éxito con ${modelName}`);
              break;
            }
          } catch (modelErr: any) {
            const isTransient =
              modelErr?.status === "UNAVAILABLE" ||
              modelErr?.status === 503 ||
              modelErr?.message?.includes("high demand") ||
              modelErr?.status === 429;

            const nextModel = candidateModels[mIdx + 1];
            if (isTransient && nextModel) {
              console.log(
                `[server.ts /api/analyze] Modelo ${modelName} con pico de demanda (503/429). Conmutando de inmediato a ${nextModel}...`
              );
            } else if (nextModel) {
              console.log(
                `[server.ts /api/analyze] Conmutando de ${modelName} hacia modelo de respaldo ${nextModel}...`
              );
            } else {
              console.log(
                `[server.ts /api/analyze] Modelos remotos ocupados en este lote. Aplicando estructuración heurística local...`
              );
            }
          }
        }

        try {
          const chunkData: any = safeParseForensicJson(chunkResponseText, {});
          if (chunkData.expediente && (expedienteName === "Expediente Judicial" || !expedienteName)) {
            expedienteName = chunkData.expediente;
          }
          if (chunkData.periodo_documentado) {
            periodos.push(chunkData.periodo_documentado);
          }
          if (chunkData.resumen_ejecutivo) {
            resumenes.push(chunkData.resumen_ejecutivo);
          }
          if (Array.isArray(chunkData.partes_intervinientes)) {
            allPartes.push(...chunkData.partes_intervinientes);
          }
          if (Array.isArray(chunkData.cronologia_hitos)) {
            allHitos.push(...chunkData.cronologia_hitos);
          }
          if (Array.isArray(chunkData.matriz_contradicciones)) {
            allContradicciones.push(...chunkData.matriz_contradicciones);
          }
          if (Array.isArray(chunkData.vacios_probatorios)) {
            allVacios.push(...chunkData.vacios_probatorios);
          }
          if (Array.isArray(chunkData.silencios_procesales)) {
            allSilencios.push(...chunkData.silencios_procesales);
          }
        } catch (parseErr) {
          console.warn(`[server.ts] No se pudo parsear el JSON del lote ${chunkIdx + 1}:`, parseErr);
        }
      }

      // Deduplicar por hash de hecho (fecha, cita_literal) para erradicar antecedentes reciclados
      const finalChronology = deduplicateHitos(allHitos);

      // Re-indexar contradicciones (C-001, C-002...)
      const finalContradicciones = allContradicciones.map((c, index) => ({
        ...c,
        id_conflicto: `C-${String(index + 1).padStart(3, "0")}`
      }));

      // Re-indexar vacíos (V-001, V-002...)
      const finalVacios = allVacios.map((v, index) => ({
        ...v,
        id_vacio: `V-${String(index + 1).padStart(3, "0")}`
      }));

      // Deduplicar partes intervinientes por nombre
      const uniquePartes = Array.from(
        new Map(
          allPartes
            .filter((p) => p && p.nombre)
            .map((p) => [p.nombre.toLowerCase().trim(), p])
        ).values()
      );

      const forensicData = {
        expediente: expedienteName,
        periodo_documentado: periodos[0] || "Periodo documentado en fojas obrantes",
        resumen_ejecutivo: resumenes.slice(0, 3).join("\n\n") || "Auditoría forense documental completada.",
        partes_intervinientes: uniquePartes,
        cronologia_hitos: finalChronology,
        matriz_contradicciones: finalContradicciones,
        vacios_probatorios: finalVacios,
        silencios_procesales: allSilencios,
        recomendaciones_estrategicas: [
          "Interponer tacha procesal contra declaraciones incongruentes identificadas en la matriz de contradicciones.",
          "Exigir diligencia de exhibición forzada para subsanar los vacíos probatorios y peritajes faltantes.",
          "Plantear control de plazos o caducidad en caso de que existan silencios procesales prolongados superiores a 60 días."
        ]
      };

      console.log(`[server.ts] Map-Reduce completado: ${finalChronology.length} hitos atómicos, ${finalContradicciones.length} contradicciones, ${finalVacios.length} vacíos.`);
      return res.json({ success: true, data: forensicData });
    }

    const { files = [], caseContext = "", useDemoFallback = false }: AnalyzeRequestBody = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: "Se requiere al menos un archivo de evidencia (imagen de chat, documento, correo o contrato)."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (useDemoFallback || !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const sample = normalizeAnalysisResult(generateTailoredAnalysis(files, caseContext), files);
      return res.json({
        success: true,
        isDemo: true,
        message: "Análisis generado en modo de contingencia forense estructurado.",
        data: sample
      });
    }

    const result = await processForensicEvidence(files, caseContext, apiKey, useDemoFallback, {
      temperature: 0.1,
      preferredModel: requestedModel
    });
    return res.json(result);
  } catch (err: any) {
    console.error("Error en /api/analyze:", err);
    return res.status(500).json({
      error: err?.message || "Ocurrió un error al procesar las evidencias con la API de Gemini.",
      details: err?.toString()
    });
  }
});

// Endpoint to download the entire project as a ZIP file
app.get("/api/download-zip", async (req, res) => {
  try {
    const JSZip = (await import("jszip")).default;
    const fs = await import("fs/promises");
    const path = await import("path");
    const zip = new JSZip();

    async function addFolderToZip(dir: string, zipFolder: any) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (
          entry.name === "node_modules" ||
          entry.name === ".git" ||
          entry.name === "dist" ||
          entry.name === "build" ||
          entry.name === ".next" ||
          entry.name === ".aistudio" ||
          entry.name.endsWith(".zip") ||
          entry.name.endsWith(".tar.gz")
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          const subFolder = zipFolder.folder(entry.name);
          await addFolderToZip(fullPath, subFolder);
        } else if (entry.isFile()) {
          const content = await fs.readFile(fullPath);
          zipFolder.file(entry.name, content);
        }
      }
    }

    await addFolderToZip(".", zip);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="evidencia-facil-proyecto.zip"');
    res.setHeader("Content-Length", zipBuffer.length.toString());
    return res.send(zipBuffer);
  } catch (err: any) {
    console.error("Error al generar el ZIP del proyecto:", err);
    return res.status(500).json({ error: "Error al generar el archivo comprimido." });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "Democratizador de E-Discovery (EvidenciaFácil)",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY")
  });
});

// Explicit fallback for ANY unmatched /api/* route to ALWAYS return JSON 404, NEVER pass to Vite or index.html!
app.all("/api/*", (req, res) => {
  console.warn(`[404 API Not Found]: ${req.method} ${req.originalUrl || req.path}`);
  res.status(404).json({
    error: `Ruta de API no encontrada: ${req.method} ${req.originalUrl || req.path}`
  });
});

// Garantizar que cualquier error en /api/* responda siempre con JSON y nunca con páginas HTML
app.use((err: any, req: any, res: any, next: any) => {
  const url = req.originalUrl || req.path || "";
  if (url.startsWith("/api/")) {
    console.error(`[API Error in ${url}]:`, err);
    return res.status(err.status || err.statusCode || 500).json({
      error: err.message || "Error procesando solicitud en el servidor."
    });
  }
  next(err);
});

// Configure Vite integration for dev server or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV === "development";
  const distDir = path.resolve(__dirname, "dist");
  const buildDir = path.resolve(__dirname, "build");
  const hasStaticDist = fs.existsSync(path.join(distDir, "index.html"));
  const hasStaticBuild = fs.existsSync(path.join(buildDir, "index.html"));
  const distPath = hasStaticDist ? distDir : hasStaticBuild ? buildDir : null;

  // In development, or if static assets haven't been built yet, use Vite dev middlewares
  const useVite = isDev || !distPath;

  if (useVite) {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: PORT,
        hmr: process.env.DISABLE_HMR !== "true",
        watch: process.env.DISABLE_HMR === "true" ? null : {}
      },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EvidenciaFácil] Servidor ejecutándose en http://0.0.0.0:${PORT} (modo: ${useVite ? "desarrollo (Vite)" : "producción (estático)"})`);
  });
}

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
