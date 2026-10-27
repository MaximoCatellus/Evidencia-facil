/**
 * @file lib/sectionClassifier.ts
 * @description Filtro y clasificador de fojas documentales con mecanismo de rescate fáctico.
 */

export interface PageTextContent {
  pageNumber: number;
  text: string;
}

export type PageRelevance = "ALTA" | "MEDIA" | "BAJA";

export interface ClassifiedPage {
  pageNumber: number;
  isNoise: boolean;
  category: string;
  relevance: PageRelevance;
  matchedRules: string[];
  isRescued: boolean;
  snippet?: string;
}

export interface ClassificationReport {
  totalPages: number;
  noiseCount: number;
  substantiveCount: number;
  classifiedPages: ClassifiedPage[];
}

export function sanitizePageText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// 1. Patrones de ruido burocrático y mero trámite
export const NOISE_PATTERNS: RegExp[] = [
  /cúmplase con notificar/i,
  /cumplase con notificar/i,
  /téngase por recibido/i,
  /tengase por recibido/i,
  /téngase presente/i,
  /tengase presente/i,
  /agréguese a los autos/i,
  /agreguese a los autos/i,
  /agréguese a autos/i,
  /agreguese a autos/i,
  /cédula de notificación/i,
  /cedula de notificacion/i,
  /notifíquese conforme a ley/i,
  /notifiquese conforme a ley/i,
  /póngase a despacho/i,
  /pongase a despacho/i,
  /sinoe\b/i,
  /cargo de notificación/i,
  /cargo de notificacion/i,
  /aviso de notificación/i,
  /constancia de relatoría/i,
  /constancia de relatoria/i,
  /vuelvan los autos/i,
  /proveído número/i,
  /proveido numero/i,
  /se proveerá en su oportunidad/i,
  /mesa de partes virtual/i
];

// 2. Patrones de rescate fáctico (RESCUE_KEYWORDS)
export const RESCUE_KEYWORDS: RegExp[] = [
  /saturnino/i,
  /llicahua/i,
  /cunyaq/i,
  /1987/i,
  /1989/i,
  /1998/i,
  /tortura/i,
  /homonimia/i,
  /disponibilidad/i,
  /fallecimiento/i,
  /absolut/i,
  /atestado/i,
  /enetan/i,
  /ruv/i,
  /cvr/i,
  /pip/i,
  /dirrehum/i
];

// 3. Patrones de relevancia sustancial (ALTA)
export const HIGH_RELEVANCE_PATTERNS: RegExp[] = [
  /declaraci[oó]n/i,
  /indagatoria/i,
  /testimonial/i,
  /acta de reconocimiento/i,
  /peritaje/i,
  /dictamen pericial/i,
  /informe pericial/i,
  /sentencia/i,
  /sobreseimiento/i,
  /acusaci[oó]n/i,
  /disposici[oó]n fiscal/i,
  /contrato/i,
  /adenda/i,
  /cl[aá]usula/i,
  /transferencia bancaria/i,
  /voucher/i,
  /recibo de pago/i,
  /acta de allanamiento/i,
  /acta de constataci[oó]n/i,
  /homonimia/i,
  /tortura/i,
  /atestado/i
];

// 4. Patrones de relevancia media (MEDIA)
export const MEDIUM_RELEVANCE_PATTERNS: RegExp[] = [
  /escrito\b/i,
  /solicito\b/i,
  /recurso de apelaci[oó]n/i,
  /recurso de queja/i,
  /control de plazos/i,
  /oficio n[°º]/i,
  /comunicaci[oó]n/i,
  /informe t[eé]cnico/i,
  /aclaraci[oó]n/i,
  /reconsideraci[oó]n/i
];

export function classifyPage(page: PageTextContent): ClassifiedPage {
  const cleanText = sanitizePageText(page.text);
  const matchedRules: string[] = [];

  // Chequeo de ruido
  let noiseMatches = 0;
  for (const pattern of NOISE_PATTERNS) {
    if (pattern.test(cleanText)) {
      noiseMatches++;
      matchedRules.push(`NOISE: ${pattern.source}`);
    }
  }

  // 2. Evaluar si la foja contiene palabras clave de rescate
  const isRescued = RESCUE_KEYWORDS.some((pattern) => pattern.test(cleanText));
  if (isRescued) {
    matchedRules.push("RESCUED: Contiene términos de rescate fáctico protegidos");
  }

  // Solo es ruido puro si NO tiene términos de rescate Y cumple patrones de ruido
  const isPureNoise =
    (noiseMatches >= 2 && !isRescued) ||
    (noiseMatches === 1 && cleanText.length < 200 && !isRescued);

  if (isPureNoise) {
    return {
      pageNumber: page.pageNumber,
      isNoise: true,
      category: "MERO_TRAMITE",
      relevance: "BAJA",
      matchedRules,
      isRescued: false,
      snippet: cleanText.slice(0, 150)
    };
  }

  // Determinar categoría y relevancia
  let category = "ACTUACION_PROCESAL";
  let relevance: PageRelevance = "MEDIA";

  const isHighRelevance = HIGH_RELEVANCE_PATTERNS.some((p) => p.test(cleanText));
  const isMediumRelevance = MEDIUM_RELEVANCE_PATTERNS.some((p) => p.test(cleanText));

  if (isRescued || isHighRelevance) {
    relevance = "ALTA";
    if (/declaraci[oó]n|indagatoria|manifestaci[oó]n/i.test(cleanText)) {
      category = "DECLARACION_TESTIMONIAL";
    } else if (/peritaje|dictamen|m[eé]dic/i.test(cleanText)) {
      category = "INFORME_PERICIAL";
    } else if (/sentencia|resoluci[oó]n|auto\b/i.test(cleanText)) {
      category = "RESOLUCION_JUDICIAL";
    } else if (/contrato|adenda|cl[aá]usula/i.test(cleanText)) {
      category = "INSTRUMENTO_CONTRACTUAL";
    } else if (/atestado|homonimia|tortura|ruv|cvr/i.test(cleanText)) {
      category = "EVIDENCIA_SUSTANCIAL";
    } else {
      category = "FONDO_DEL_ASUNTO";
    }
  } else if (isMediumRelevance) {
    relevance = "MEDIA";
    category = "ESCRITO_O_RECURSO";
  } else {
    // Si no es ruido ni contiene patrones altos, se conserva con relevancia media si tiene extensión sustancial
    relevance = cleanText.length > 250 ? "MEDIA" : "BAJA";
    category = "DOCUMENTACION_COMPLEMENTARIA";
  }

  return {
    pageNumber: page.pageNumber,
    isNoise: false,
    category,
    relevance,
    matchedRules,
    isRescued,
    snippet: cleanText.slice(0, 150)
  };
}

export function classifyPages(pages: PageTextContent[]): ClassificationReport {
  const classifiedPages = pages.map((p) => classifyPage(p));
  const noiseCount = classifiedPages.filter((p) => p.isNoise).length;
  const substantiveCount = classifiedPages.length - noiseCount;

  return {
    totalPages: pages.length,
    noiseCount,
    substantiveCount,
    classifiedPages
  };
}

export interface SubChunk {
  subId: string;
  pageNumber: number;
  text: string;
}

/**
 * Divide fojas extensas en fragmentos atómicos según delimitadores procesales
 */
export function atomizePageText(pageText: string, pageNumber: number): SubChunk[] {
  // Subdivide por patrones de fecha (ej. "10 de marzo de 2021"), encabezados o preguntas
  const blocks = pageText.split(
    /(?=\b(?:\d{1,2}\s+de\s+[a-z]+\s+de\s+\d{4}|\d{4}-\d{2}-\d{2}|PREGUNTADO DIJO:|SE DISPONE:|FALLA:)\b)/i
  );

  return blocks
    .map((block, index) => ({
      subId: `F${pageNumber}_P${index + 1}`,
      pageNumber,
      text: block.trim(),
    }))
    .filter((chunk) => chunk.text.length > 50); // Filtra fragmentos insignificantes
}

/**
 * Sub-segmentación granular por párrafos o hitos temporales dentro de una foja extensa.
 */
export function extractSubChunks(pageText: string, pageNumber: number): SubChunk[] {
  return atomizePageText(pageText, pageNumber);
}
