/**
 * @file lib/largeFileProcessor.ts
 * @description Generador de payloads optimizados para Gemini descartando fojas de mero trámite
 * y preservando fojas de relevancia ALTA y MEDIA con demarcadores claros.
 */

import type {
  PageTextContent,
  ClassificationReport
} from "./sectionClassifier.ts";
import {
  sanitizePageText,
  classifyPages,
  atomizePageText
} from "./sectionClassifier.ts";

export interface DossierProcessingResult {
  payload: string;
  report: ClassificationReport;
  originalCharacterCount: number;
  purifiedCharacterCount: number;
  compressionPercentage: number;
  usefulPageCount: number;
}

/**
 * Construye el payload ultraliviano para Gemini incluyendo fojas ALTA y MEDIA,
 * excluyendo únicamente el ruido burocrático estricto y delimitando sub-bloques atómicos.
 */
export function buildLightweightGeminiPayload(
  pages: PageTextContent[],
  report: ClassificationReport
): string {
  // Se procesan tanto fojas de relevancia ALTA como MEDIA
  const usefulPages = report.classifiedPages.filter(
    (p) => !p.isNoise && (p.relevance === "ALTA" || p.relevance === "MEDIA")
  );
  const usefulSet = new Set(usefulPages.map((p) => p.pageNumber));

  return pages
    .filter((p) => usefulSet.has(p.pageNumber))
    .map((p) => {
      const info = report.classifiedPages.find((cp) => cp.pageNumber === p.pageNumber)!;

      // Aplicar sub-segmentación si la foja es extensa
      const subChunks = atomizePageText(p.text, p.pageNumber);

      const formattedChunks =
        subChunks.length > 0
          ? subChunks.map((sc) => `  [SUB-BLOQUE ${sc.subId}]:\n  "${sc.text}"`).join("\n\n")
          : sanitizePageText(p.text);

      return `=== INICIO FOJA ${p.pageNumber} [CATEGORÍA: ${info.category} | RELEVANCIA: ${info.relevance}] ===\n${formattedChunks}\n=== FIN FOJA ${p.pageNumber} ===`;
    })
    .join("\n\n");
}

/**
 * Parsea un texto masivo con delimitadores de fojas (ej. "--- [FOJA / PÁGINA N] ---" o "\f" o "Foja N")
 * y genera el payload estructurado depurado junto con las métricas de filtrado.
 */
export function processRawDossierText(rawText: string): DossierProcessingResult {
  const pages: PageTextContent[] = [];

  // Intento de división por delimitadores de foja
  const fojaDelimiter = /---+\s*\[?(?:FOJA|PÁGINA|PAGINA)\s*(\d+)\]?[^-\n]*---+/gi;
  const matches = Array.from(rawText.matchAll(fojaDelimiter));

  if (matches.length > 0) {
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const pageNum = parseInt(match[1], 10);
      const startIndex = match.index! + match[0].length;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index! : rawText.length;
      const text = rawText.slice(startIndex, endIndex);

      pages.push({
        pageNumber: pageNum,
        text
      });
    }
  } else if (rawText.includes("\f")) {
    // Delimitador estándar de salto de página PDF
    const splitPages = rawText.split("\f");
    splitPages.forEach((text, idx) => {
      if (text.trim()) {
        pages.push({
          pageNumber: idx + 1,
          text
        });
      }
    });
  } else {
    // Si no hay delimitador explícito, subdividir en bloques de ~2000 caracteres como páginas virtuales
    const CHUNK_SIZE = 2500;
    const totalVirtualPages = Math.ceil(rawText.length / CHUNK_SIZE);
    for (let i = 0; i < totalVirtualPages; i++) {
      pages.push({
        pageNumber: i + 1,
        text: rawText.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
      });
    }
  }

  const report = classifyPages(pages);
  const payload = buildLightweightGeminiPayload(pages, report);

  const origChars = rawText.length;
  const purifChars = payload.length;
  const compression = origChars > 0 ? Math.round(((origChars - purifChars) / origChars) * 100) : 0;

  return {
    payload,
    report,
    originalCharacterCount: origChars,
    purifiedCharacterCount: purifChars,
    compressionPercentage: Math.max(0, compression),
    usefulPageCount: report.classifiedPages.filter(
      (p) => !p.isNoise && (p.relevance === "ALTA" || p.relevance === "MEDIA")
    ).length
  };
}

/**
 * Divide un payload grande en micro-lotes de N fojas sustanciales
 * para procesamiento Map-Reduce en paralelo o secuencial sin sobre-sintetizar.
 */
export function splitPayloadIntoMicroChunks(fullPayload: string, fojasPerBatch: number = 15): string[] {
  const fojaRegex = /(=== INICIO FOJA [\s\S]*?=== FIN FOJA \d+ ===)/g;
  const matches = fullPayload.match(fojaRegex);

  if (!matches || matches.length <= fojasPerBatch) {
    return [fullPayload];
  }

  const batches: string[] = [];
  for (let i = 0; i < matches.length; i += fojasPerBatch) {
    const chunk = matches.slice(i, i + fojasPerBatch).join("\n\n");
    batches.push(chunk);
  }
  return batches;
}

/**
 * Deduplica un arreglo de hitos procesales comprobando la tupla normalizada (fecha, cita_literal)
 * para eliminar registros duplicados entre tomos y antecedentes reciclados en resoluciones posteriores.
 */
export function deduplicateHitos<T extends { fecha?: string; cita_literal?: string; [key: string]: any }>(
  hitos: T[]
): T[] {
  if (!Array.isArray(hitos) || hitos.length === 0) return [];

  const seenHashes = new Set<string>();
  const uniqueHitos: T[] = [];

  for (const hito of hitos) {
    const rawFecha = (hito.fecha || "sin-fecha").trim().toLowerCase();

    // Normalizar la cita literal (remover comillas, puntuación, saltos de línea y espacios dobles)
    const normalizedCita = (hito.cita_literal || "")
      .toLowerCase()
      .replace(/["'«»“”]/g, "")
      .replace(/[.,;:\n\r]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // Clave de hash basada en fecha + los primeros 70 caracteres significativos de la cita literal
    const keySubstring = normalizedCita.length > 70 ? normalizedCita.slice(0, 70) : normalizedCita;
    const hash = `${rawFecha}:::${keySubstring}`;

    if (!seenHashes.has(hash)) {
      seenHashes.add(hash);
      uniqueHitos.push(hito);
    }
  }

  // Re-indexar con identificadores correlativos uniformes H-001, H-002...
  return uniqueHitos.map((h, idx) => ({
    ...h,
    id_hito: `H-${String(idx + 1).padStart(3, "0")}`
  }));
}

