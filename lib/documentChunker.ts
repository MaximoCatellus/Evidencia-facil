/**
 * @file lib/documentChunker.ts
 * @description Agrupamiento por Unidad Documental (resoluciones, disposiciones, actas, peritajes, contratos)
 * identificando inicio y fin de cada instrumento procesal para evitar procesar fojas sueltas descontextualizadas.
 */

import type { PageTextContent } from "./sectionClassifier.ts";
import { sanitizePageText } from "./sectionClassifier.ts";

export interface DocumentUnit {
  documentId: string;
  title: string;
  type:
    | "DISPOSICION_FISCAL"
    | "RESOLUCION_JUDICIAL"
    | "ACTA_O_MANIFESTACION"
    | "INFORME_PERICIAL"
    | "ATESTADO_POLICIAL"
    | "CONTRATO_O_ADENDA"
    | "ESCRITO_DE_PARTE"
    | "ACTUACION_GENERAL";
  startPage: number;
  endPage: number;
  pageCount: number;
  fullText: string;
  headerSnippet: string;
}

// Patrones regex que señalan el inicio formal de una unidad documental sustancial
export const DOCUMENT_START_PATTERNS: { regex: RegExp; type: DocumentUnit["type"]; name: string }[] = [
  {
    regex: /(?:DISPOSICI[OÓ]N\s+(?:FISCAL\s+)?(?:N[°º]|NUMERO)?\s*[\w\d-]+|DISPONE:)/i,
    type: "DISPOSICION_FISCAL",
    name: "Disposición Fiscal"
  },
  {
    regex: /(?:RESOLUCI[OÓ]N\s+(?:N[°º]|NUMERO)?\s*[\w\d-]+|AUTO\s+(?:APERTORIO|FINAL|INTERLOCUTORIO)|SENTENCIA|FALLA:)/i,
    type: "RESOLUCION_JUDICIAL",
    name: "Resolución Judicial / Sentencia"
  },
  {
    regex: /(?:ATESTADO\s+POLICIAL\s+(?:N[°º]|NUMERO)?\s*[\w\d-]+|INFORME\s+POLICIAL)/i,
    type: "ATESTADO_POLICIAL",
    name: "Atestado Policial"
  },
  {
    regex: /(?:DICTAMEN\s+PERICIAL|INFORME\s+PERICIAL|CERTIFICADO\s+M[EÉ]DICO\s+LEGAL|PERITAJE\s+GRAFOT[EÉ]CNICO|PERITAJE\s+CONTABLE)/i,
    type: "INFORME_PERICIAL",
    name: "Informe / Dictamen Pericial"
  },
  {
    regex: /(?:ACTA\s+DE\s+(?:DECLARACI[OÓ]N|INDAGATORIA|TESTIMONIAL|MANIFESTACI[OÓ]N|RECONOCIMIENTO|CONSTATACI[OÓ]N|ALLANAMIENTO)|PREGUNTADO\s+DIJO:)/i,
    type: "ACTA_O_MANIFESTACION",
    name: "Acta de Declaración / Manifestación"
  },
  {
    regex: /(?:CONTRATO\s+DE\s+|ADENDA\s+(?:N[°º]|NUMERO)?|MINUTA\s+DE\s+ACUERDO|CONVENIO)/i,
    type: "CONTRATO_O_ADENDA",
    name: "Contrato / Adenda"
  },
  {
    regex: /(?:SOLICITO:|SUMILLA:|RECURSO\s+DE\s+APELACI[OÓ]N|EXCEPCI[OÓ]N\s+DE\s+|CONTROL\s+DE\s+PLAZOS)/i,
    type: "ESCRITO_DE_PARTE",
    name: "Escrito de Parte"
  }
];

export function extractDocumentTitle(text: string, defaultName: string): string {
  const match = text.match(
    /(?:DISPOSICI[OÓ]N\s+(?:FISCAL\s+)?N[°º]?\s*[\w\d-]+|RESOLUCI[OÓ]N\s+N[°º]?\s*[\w\d-]+|ATESTADO\s+(?:POLICIAL\s+)?N[°º]?\s*[\w\d-]+|DICTAMEN\s+PERICIAL\s+N[°º]?\s*[\w\d-]+|SENTENCIA\s+N[°º]?\s*[\w\d-]+)/i
  );
  if (match) {
    return match[0].toUpperCase().trim();
  }
  const lines = text.trim().split("\n");
  const firstLine = (lines[0] || "").trim().replace(/^[^a-zA-Z0-9]+/, "");
  return firstLine.length > 5 && firstLine.length < 80 ? firstLine : defaultName;
}

/**
 * Agrupa una lista de fojas procesales en unidades documentales completas (inicio a fin)
 * Ejemplo: [DOCUMENTO: Disposición N° 04-2022 | FOJAS: 206-228]
 */
export function groupPagesIntoDocumentUnits(pages: PageTextContent[]): DocumentUnit[] {
  if (!pages || pages.length === 0) return [];

  const units: DocumentUnit[] = [];
  let currentPages: PageTextContent[] = [];
  let currentType: DocumentUnit["type"] = "ACTUACION_GENERAL";
  let currentTitle = "Actuación Procesal";
  let docCounter = 1;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const cleanText = sanitizePageText(page.text);

    // Chequear si esta foja es el inicio de un nuevo documento sustancial
    let detectedType: DocumentUnit["type"] | null = null;
    let detectedName = "";

    for (const pattern of DOCUMENT_START_PATTERNS) {
      if (pattern.regex.test(cleanText)) {
        detectedType = pattern.type;
        detectedName = pattern.name;
        break;
      }
    }

    // Si detectamos inicio de nuevo documento y ya teníamos páginas acumuladas
    if (detectedType && currentPages.length > 0) {
      const startP = currentPages[0].pageNumber;
      const endP = currentPages[currentPages.length - 1].pageNumber;
      const fullText = currentPages
        .map((p) => `[Foja ${p.pageNumber}]\n${sanitizePageText(p.text)}`)
        .join("\n\n");
      const title = extractDocumentTitle(currentPages[0].text, `${currentTitle} (Fojas ${startP}-${endP})`);

      units.push({
        documentId: `DOC-${String(docCounter++).padStart(3, "0")}`,
        title,
        type: currentType,
        startPage: startP,
        endPage: endP,
        pageCount: currentPages.length,
        fullText,
        headerSnippet: sanitizePageText(currentPages[0].text).slice(0, 200)
      });

      currentPages = [page];
      currentType = detectedType;
      currentTitle = detectedName;
    } else {
      if (detectedType && currentPages.length === 0) {
        currentType = detectedType;
        currentTitle = detectedName;
      }
      currentPages.push(page);
    }
  }

  // Guardar última unidad acumulada
  if (currentPages.length > 0) {
    const startP = currentPages[0].pageNumber;
    const endP = currentPages[currentPages.length - 1].pageNumber;
    const fullText = currentPages
      .map((p) => `[Foja ${p.pageNumber}]\n${sanitizePageText(p.text)}`)
      .join("\n\n");
    const title = extractDocumentTitle(currentPages[0].text, `${currentTitle} (Fojas ${startP}-${endP})`);

    units.push({
      documentId: `DOC-${String(docCounter++).padStart(3, "0")}`,
      title,
      type: currentType,
      startPage: startP,
      endPage: endP,
      pageCount: currentPages.length,
      fullText,
      headerSnippet: sanitizePageText(currentPages[0].text).slice(0, 200)
    });
  }

  return units;
}

/**
 * Formatea las unidades documentales con delimitadores explícitos por instrumento procesal
 */
export function formatDocumentUnitsForGemini(units: DocumentUnit[]): string {
  return units
    .map((doc) => {
      return `=== [DOCUMENTO: ${doc.title} | FOJAS: ${doc.startPage}-${doc.endPage} | TIPO: ${doc.type}] ===\n${doc.fullText}\n=== [FIN DOCUMENTO: ${doc.title}] ===`;
    })
    .join("\n\n");
}
