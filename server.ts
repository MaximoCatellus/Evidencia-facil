import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { processForensicEvidence } from "./src/lib/geminiAnalyzer.ts";
import { generateTailoredAnalysis, EvidenceFilePayload, AnalyzeRequestBody } from "./src/lib/tailoredAnalysis.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Set payload limit to handle base64 images, PDFs, and legal evidence bundles
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// POST /api/analyze
app.post("/api/analyze", async (req, res) => {
  try {
    const { files = [], caseContext = "", useDemoFallback = false }: AnalyzeRequestBody = req.body;

    if (!Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: "Se requiere al menos un archivo de evidencia (imagen de chat, documento, correo o contrato)."
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (useDemoFallback || !apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      const sample = generateTailoredAnalysis(files, caseContext);
      return res.json({
        success: true,
        isDemo: true,
        message: "Análisis generado en modo de contingencia forense estructurado.",
        data: sample
      });
    }

    const result = await processForensicEvidence(files, caseContext, apiKey, useDemoFallback);
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

// Configure Vite integration for dev server or static serving in production
async function startServer() {
  const isCloudRun = process.env.K_SERVICE !== undefined || process.env.K_REVISION !== undefined;
  const isProduction = process.env.NODE_ENV === "production" || isCloudRun;

  if (!isProduction) {
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
    const distPath = fs.existsSync(path.resolve(__dirname, "dist"))
      ? path.resolve(__dirname, "dist")
      : path.resolve(__dirname, "build");

    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EvidenciaFácil] Servidor ejecutándose en http://0.0.0.0:${PORT} (modo: ${isProduction ? "producción" : "desarrollo"})`);
  });
}

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
  process.exit(1);
});
