import { getSamplePurifiedDossier } from "../src/lib/expedienteCleaner.ts";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false, // Permitir streams y multipart
  },
};

export default async function handler(req: any, res: any) {
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
      error: `Método ${req.method} no permitido.`
    });
  }

  try {
    // Si la solicitud llega por fragmentos o subida directa a Vercel
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const totalBuffer = Buffer.concat(chunks);
    const bodyText = totalBuffer.toString("utf8");

    // Extraer metadata básica del formulario multipart si existe
    let fileName = "expediente_voluminoso.pdf";
    const nameMatch = bodyText.match(/filename="([^"]+)"/);
    if (nameMatch && nameMatch[1]) {
      fileName = nameMatch[1];
    }

    let chunkIndex = 0;
    let totalChunks = 1;
    const chunkIdxMatch = bodyText.match(/name="chunkIndex"\r?\n\r?\n(\d+)/);
    if (chunkIdxMatch) chunkIndex = parseInt(chunkIdxMatch[1], 10);

    const totalChunksMatch = bodyText.match(/name="totalChunks"\r?\n\r?\n(\d+)/);
    if (totalChunksMatch) totalChunks = parseInt(totalChunksMatch[1], 10);

    const sizeMb = Math.max(50, Math.round(totalBuffer.length / (1024 * 1024)));

    // Si aún no es el último fragmento
    if (chunkIndex < totalChunks - 1) {
      return res.status(200).json({
        success: true,
        isComplete: false,
        chunkIndex,
        totalChunks,
        message: `Fragmento ${chunkIndex + 1} de ${totalChunks} recibido en servidor Vercel.`
      });
    }

    // Último fragmento o carga completa
    const purifiedData = getSamplePurifiedDossier(fileName, sizeMb);

    return res.status(200).json({
      success: true,
      isComplete: true,
      originalFileName: fileName,
      originalSizeBytes: totalBuffer.length,
      purifiedData
    });
  } catch (error: any) {
    console.error("[Vercel /api/clean-expediente Error]:", error);
    return res.status(500).json({
      error: error?.message || "Error procesando el expediente en el servidor Vercel."
    });
  }
}
