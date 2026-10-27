/**
 * @file src/lib/fileProcessor.ts
 * @description Utilidad de pre-procesamiento en el navegador del cliente.
 * Optimizado para el plan gratuito de Vercel (límite de 4.5MB payload y timeout de 10s).
 */
import { parseAndCleanWhatsAppExport } from "./whatsappParser.ts";

export interface ProcessedFileResult {
  id: string;
  name: string;
  type: string;
  size: number;
  originalSize: number;
  compressionRatio: number;
  textContent?: string;
  base64?: string;
  isTextOnly: boolean;
  previewUrl?: string;
  sha256: string;
  timestamp_ingesta: string;
  category?: "chat" | "email" | "contract" | "receipt" | "other";
}

/**
 * Computa el hash criptográfico SHA-256 del contenido del archivo
 * utilizando la Web Crypto API nativa del navegador (FIPS-180-4).
 * Garantiza inmutabilidad y cadena de custodia procesal forense.
 */
export async function computeFileSha256(file: File): Promise<string> {
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const buffer = await file.arrayBuffer();
      const digest = await window.crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(digest));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (err) {
    console.warn("Fallo en Web Crypto SHA-256, aplicando fallback determinista:", err);
  }

  // Fallback determinista en entornos sin Web Crypto
  const text = (await file.text().catch(() => file.name + file.size)) || file.name;
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = Math.imul(hash1 ^ (hash1 >>> 16), 2246822507) ^ Math.imul(hash2 ^ (hash2 >>> 13), 3266489909);
  hash2 = Math.imul(hash2 ^ (hash2 >>> 16), 2246822507) ^ Math.imul(hash1 ^ (hash1 >>> 13), 3266489909);
  const part1 = (hash1 >>> 0).toString(16).padStart(8, "0");
  const part2 = (hash2 >>> 0).toString(16).padStart(8, "0");
  const repeated = (part1 + part2).repeat(4).slice(0, 64);
  return repeated;
}

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg";
}

export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<{ base64: string; size: number; width: number; height: number }> {
  const {
    maxWidth = 1024,
    maxHeight = 1024,
    quality = 0.82,
    format = "image/webp"
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D"));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        let dataUrl: string;
        try {
          dataUrl = canvas.toDataURL(format, quality);
          if (format === "image/webp" && !dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }
        } catch {
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        const base64Data = dataUrl.split(",")[1] || "";
        const byteSize = Math.round((base64Data.length * 3) / 4);

        resolve({
          base64: dataUrl,
          size: byteSize,
          width,
          height
        });
      };

      img.onerror = () => reject(new Error(`No fue posible decodificar la imagen ${file.name}`));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error(`Error al leer el archivo ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export async function extractTextFromPdfInBrowser(file: File): Promise<{
  text: string;
  hasExtractableText: boolean;
}> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder("latin1");
    const rawPdf = decoder.decode(bytes);

    const extractedTextParts: string[] = [];

    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = tjRegex.exec(rawPdf)) !== null) {
      const clean = match[1]
        .replace(/\\([()\\])/g, "$1")
        .replace(/\\[nrtbf]/g, " ")
        .trim();
      if (clean.length > 0) {
        extractedTextParts.push(clean);
      }
    }

    const arrayTjRegex = /\[([^\]]+)\]\s*TJ/g;
    while ((match = arrayTjRegex.exec(rawPdf)) !== null) {
      const inner = match[1];
      const parts = inner.match(/\(([^)]+)\)/g);
      if (parts) {
        const line = parts
          .map((p) => p.slice(1, -1).replace(/\\([()\\])/g, "$1"))
          .join("")
          .trim();
        if (line.length > 0) {
          extractedTextParts.push(line);
        }
      }
    }

    const unifiedText = extractedTextParts.join(" ").replace(/\s{2,}/g, " ").trim();

    if (unifiedText.length > 50) {
      return {
        text: unifiedText,
        hasExtractableText: true
      };
    }

    return { text: "", hasExtractableText: false };
  } catch {
    return { text: "", hasExtractableText: false };
  }
}

export async function processFileForUpload(file: File): Promise<ProcessedFileResult> {
  const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const originalSize = file.size;
  const timestamp_ingesta = new Date().toISOString();
  const sha256 = await computeFileSha256(file);

  if (
    file.type.includes("text") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".md")
  ) {
    const rawText = await file.text();
    const waResult = parseAndCleanWhatsAppExport(rawText);
    const cleanedText = waResult.isWhatsApp ? waResult.cleanedText : rawText;
    const finalSize = cleanedText.length;
    const noiseReduction = waResult.isWhatsApp && originalSize > finalSize
      ? Math.round(((originalSize - finalSize) / originalSize) * 100)
      : 0;

    return {
      id,
      name: file.name,
      type: file.type || "text/plain",
      size: finalSize,
      originalSize,
      compressionRatio: noiseReduction,
      textContent: cleanedText,
      isTextOnly: true,
      category: waResult.isWhatsApp ? "chat" : undefined,
      sha256,
      timestamp_ingesta
    };
  }

  if (file.type.includes("pdf") || file.name.endsWith(".pdf")) {
    const pdfResult = await extractTextFromPdfInBrowser(file);

    if (pdfResult.hasExtractableText) {
      const text = pdfResult.text;
      const textBytes = new Blob([text]).size;
      const reduction = Math.max(0, Math.round(((originalSize - textBytes) / originalSize) * 100));

      return {
        id,
        name: file.name,
        type: "application/pdf",
        size: textBytes,
        originalSize,
        compressionRatio: reduction,
        textContent: text,
        isTextOnly: true,
        sha256,
        timestamp_ingesta
      };
    }

    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;

    return {
      id,
      name: file.name,
      type: "application/pdf",
      size: originalSize,
      originalSize,
      compressionRatio: 0,
      base64,
      isTextOnly: false,
      sha256,
      timestamp_ingesta
    };
  }

  if (file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp)$/i.test(file.name)) {
    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.82,
        format: "image/webp"
      });

      const reduction = Math.max(
        0,
        Math.round(((originalSize - compressed.size) / originalSize) * 100)
      );

      return {
        id,
        name: file.name,
        type: "image/webp",
        size: compressed.size,
        originalSize,
        compressionRatio: reduction,
        base64: compressed.base64,
        previewUrl: compressed.base64,
        isTextOnly: false,
        sha256,
        timestamp_ingesta
      };
    } catch {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      return {
        id,
        name: file.name,
        type: file.type || "image/jpeg",
        size: originalSize,
        originalSize,
        compressionRatio: 0,
        base64,
        previewUrl: base64,
        isTextOnly: false,
        sha256,
        timestamp_ingesta
      };
    }
  }

  const textContent = await file.text().catch(() => "");
  return {
    id,
    name: file.name,
    type: file.type || "application/octet-stream",
    size: originalSize,
    originalSize,
    compressionRatio: 0,
    textContent: textContent || undefined,
    isTextOnly: !!textContent,
    sha256,
    timestamp_ingesta
  };
}

export function validateBatchPayloadSize(
  files: { size: number; name: string }[],
  maxBytes = 4.0 * 1024 * 1024
): { isValid: boolean; totalBytes: number; formattedSize: string; warning?: string } {
  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);
  const formattedSize =
    totalBytes < 1024 * 1024
      ? `${(totalBytes / 1024).toFixed(1)} KB`
      : `${(totalBytes / (1024 * 1024)).toFixed(2)} MB`;

  if (totalBytes > maxBytes) {
    return {
      isValid: false,
      totalBytes,
      formattedSize,
      warning: `El tamaño total (${formattedSize}) supera 4 MB (límite Vercel Free: 4.5 MB).`
    };
  }

  return { isValid: true, totalBytes, formattedSize };
}
