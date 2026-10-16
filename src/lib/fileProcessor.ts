/**
 * @file src/lib/fileProcessor.ts
 * @description Utilidad de pre-procesamiento en el navegador del cliente.
 * Optimizado para el plan gratuito de Vercel (límite de 4.5MB payload y timeout de 10s).
 */

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

  if (
    file.type.includes("text") ||
    file.name.endsWith(".txt") ||
    file.name.endsWith(".csv") ||
    file.name.endsWith(".md")
  ) {
    const text = await file.text();
    return {
      id,
      name: file.name,
      type: file.type || "text/plain",
      size: text.length,
      originalSize,
      compressionRatio: 0,
      textContent: text,
      isTextOnly: true
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
        isTextOnly: true
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
      isTextOnly: false
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
        isTextOnly: false
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
        isTextOnly: false
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
    isTextOnly: !!textContent
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
