/**
 * @file src/lib/chronologyEngine.ts
 * @description Motor determinista de ordenación cronológica y detección algorítmica de vacíos probatorios.
 */

export interface RawChronologyEvent {
  id: string;
  fecha_hora: string;
  hecho: string;
  personas_involucradas?: string[];
  fuente_documental: string;
  cita_o_referencia: string;
  relevancia?: "Alta" | "Media" | "Baja";
  tipo_evento?: string;
  analisis_procesal?: string;
}

export interface NormalizedChronologyEvent extends RawChronologyEvent {
  timestampMs: number;
  fechaNormalizada: string;
  diasDesdeEventoAnterior?: number;
  esInicioCaso?: boolean;
  esFinCaso?: boolean;
}

export interface DetectedEvidentiaryGap {
  id: string;
  diasInactividad: number;
  periodoAfectado: string;
  eventoPrevio: {
    id: string;
    fecha: string;
    hecho: string;
    fuente: string;
  };
  eventoPosterior: {
    id: string;
    fecha: string;
    hecho: string;
    fuente: string;
  };
  nivelRiesgo: "Crítico" | "Alto" | "Moderado";
  riesgoProcesal: string;
  diligenciaSugerida: string;
}

export interface ChronologyMetrics {
  totalEventos: number;
  fechaInicio: string;
  fechaFin: string;
  duracionTotalDias: number;
  promedioDiasEntreEventos: number;
  mesMayorActividad: string;
  vaciosDetectados: number;
}

const MONTH_NAMES_ES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
};

export function parseFlexibleDateToTimestamp(dateStr: string): number {
  if (!dateStr || typeof dateStr !== "string") return 0;
  const clean = dateStr.trim();

  const standardDate = new Date(clean);
  if (!isNaN(standardDate.getTime()) && standardDate.getFullYear() > 1990 && standardDate.getFullYear() < 2100) {
    return standardDate.getTime();
  }

  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    let year = parseInt(dmyMatch[3], 10);
    if (year < 100) year += 2000;
    const hours = dmyMatch[4] ? parseInt(dmyMatch[4], 10) : 12;
    const minutes = dmyMatch[5] ? parseInt(dmyMatch[5], 10) : 0;
    const seconds = dmyMatch[6] ? parseInt(dmyMatch[6], 10) : 0;

    const parsed = new Date(year, month, day, hours, minutes, seconds);
    if (!isNaN(parsed.getTime())) return parsed.getTime();
  }

  const spanishMatch = clean.match(/(\d{1,2})\s+de\s+([a-zA-ZáéíóúÁÉÍÓÚ]+)\s+(?:de\s+)?(\d{4})/i);
  if (spanishMatch) {
    const day = parseInt(spanishMatch[1], 10);
    const monthName = spanishMatch[2].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const year = parseInt(spanishMatch[3], 10);

    if (MONTH_NAMES_ES[monthName] !== undefined) {
      const parsed = new Date(year, MONTH_NAMES_ES[monthName], day, 12, 0, 0);
      if (!isNaN(parsed.getTime())) return parsed.getTime();
    }
  }

  const yearMatch = clean.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1], 10), 0, 1).getTime();
  }

  return 0;
}

export function sortAndNormalizeChronology(
  events: RawChronologyEvent[]
): NormalizedChronologyEvent[] {
  if (!events || events.length === 0) return [];

  const enriched = events.map((ev, idx) => {
    const ts = parseFlexibleDateToTimestamp(ev.fecha_hora);
    return {
      ...ev,
      id: ev.id || `H-${String(idx + 1).padStart(3, "0")}`,
      timestampMs: ts || Date.now() + idx,
      fechaNormalizada: ev.fecha_hora || "Fecha no acreditada"
    };
  });

  enriched.sort((a, b) => {
    if (a.timestampMs !== b.timestampMs) {
      return a.timestampMs - b.timestampMs;
    }
    return a.id.localeCompare(b.id);
  });

  return enriched.map((ev, idx) => {
    let diasDesdeEventoAnterior: number | undefined = undefined;

    if (idx > 0 && ev.timestampMs > 0 && enriched[idx - 1].timestampMs > 0) {
      const diffMs = ev.timestampMs - enriched[idx - 1].timestampMs;
      diasDesdeEventoAnterior = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      ...ev,
      diasDesdeEventoAnterior,
      esInicioCaso: idx === 0,
      esFinCaso: idx === enriched.length - 1
    };
  });
}

export function detectEvidentiaryGaps(
  events: RawChronologyEvent[],
  thresholdDays = 30
): DetectedEvidentiaryGap[] {
  const normalized = sortAndNormalizeChronology(events);
  const detectedGaps: DetectedEvidentiaryGap[] = [];

  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];

    const deltaDays = curr.diasDesdeEventoAnterior ?? 0;

    if (deltaDays >= thresholdDays) {
      let nivelRiesgo: "Crítico" | "Alto" | "Moderado" = "Moderado";
      if (deltaDays >= 90) nivelRiesgo = "Crítico";
      else if (deltaDays >= 45) nivelRiesgo = "Alto";

      const periodo = `${prev.fechaNormalizada} ➔ ${curr.fechaNormalizada} (${deltaDays} días)`;

      let riesgoProcesal = "";
      let diligenciaSugerida = "";

      if (deltaDays >= 90) {
        riesgoProcesal = `Laguna probatoria grave (${deltaDays} días). Posible prescripción, caducidad o ruptura de la continuidad fáctica.`;
        diligenciaSugerida = `Oficiar a entidades bancarias y de telecomunicaciones para verificar registros entre ${prev.fechaNormalizada} y ${curr.fechaNormalizada}.`;
      } else if (deltaDays >= 45) {
        riesgoProcesal = `Salto temporal de ${deltaDays} días sin constancia escrita.`;
        diligenciaSugerida = `Aportar copias de respaldo de mensajería, bitácora o testimoniales intermedias.`;
      } else {
        riesgoProcesal = `Inactividad de ${deltaDays} días entre comunicaciones.`;
        diligenciaSugerida = `Solicitar al tribunal requerimiento de exhibición de correos del periodo.`;
      }

      detectedGaps.push({
        id: `GAP-AUTO-${detectedGaps.length + 1}`,
        diasInactividad: deltaDays,
        periodoAfectado: periodo,
        eventoPrevio: {
          id: prev.id,
          fecha: prev.fechaNormalizada,
          hecho: prev.hecho,
          fuente: prev.fuente_documental
        },
        eventoPosterior: {
          id: curr.id,
          fecha: curr.fechaNormalizada,
          hecho: curr.hecho,
          fuente: curr.fuente_documental
        },
        nivelRiesgo,
        riesgoProcesal,
        diligenciaSugerida
      });
    }
  }

  return detectedGaps;
}

export function calculateChronologyMetrics(
  events: RawChronologyEvent[]
): ChronologyMetrics {
  const normalized = sortAndNormalizeChronology(events);
  if (normalized.length === 0) {
    return {
      totalEventos: 0,
      fechaInicio: "N/A",
      fechaFin: "N/A",
      duracionTotalDias: 0,
      promedioDiasEntreEventos: 0,
      mesMayorActividad: "N/A",
      vaciosDetectados: 0
    };
  }

  const first = normalized[0];
  const last = normalized[normalized.length - 1];

  let duracionTotalDias = 0;
  if (first.timestampMs > 0 && last.timestampMs > 0) {
    duracionTotalDias = Math.max(
      0,
      Math.round((last.timestampMs - first.timestampMs) / (1000 * 60 * 60 * 24))
    );
  }

  const gaps = detectEvidentiaryGaps(events, 30);
  const intervals = normalized
    .slice(1)
    .map((e) => e.diasDesdeEventoAnterior || 0)
    .filter((d) => d > 0);

  const promedioDias = intervals.length > 0
    ? Math.round(intervals.reduce((a, b) => a + b, 0) / intervals.length)
    : 0;

  return {
    totalEventos: normalized.length,
    fechaInicio: first.fechaNormalizada,
    fechaFin: last.fechaNormalizada,
    duracionTotalDias,
    promedioDiasEntreEventos: promedioDias,
    mesMayorActividad: "Actividad concentrada",
    vaciosDetectados: gaps.length
  };
}
