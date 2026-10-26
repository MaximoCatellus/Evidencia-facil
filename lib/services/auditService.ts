/**
 * @file lib/services/auditService.ts
 * @description Servicio de auditoría forense y conexión con los motores de cronología y cálculo probabilístico de EvidenciaFácil.
 */

import { ForensicCaseOutput } from "../prompts/forensicPrompt";
import {
  sortAndNormalizeChronology,
  detectEvidentiaryGaps,
  calculateChronologyMetrics,
  type RawChronologyEvent,
  type NormalizedChronologyEvent,
  type DetectedEvidentiaryGap,
  type ChronologyMetrics
} from "../../src/lib/chronologyEngine";
import type { AnalysisResult, TimelineEvent, Contradiction, EvidentiaryGap } from "../../src/types/ediscovery";

/**
 * Envía el texto purificado o extraído del expediente a la API de auditoría forense.
 */
export async function analyzeDocumentForense(cleanedText: string): Promise<ForensicCaseOutput> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documentText: cleanedText })
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.error || "Fallo al auditar documento");
  }

  const json = await res.json();
  const data: ForensicCaseOutput = json.data || json;

  return data;
}

/**
 * Conecta los hitos cronológicos con el motor determinista local de cronología de EvidenciaFácil
 * para calcular silencios procesales, lapsos de inactividad y métricas.
 */
export function enrichForensicWithChronologyEngine(data: ForensicCaseOutput): {
  normalizedEvents: NormalizedChronologyEvent[];
  calculatedGaps: DetectedEvidentiaryGap[];
  metrics: ChronologyMetrics;
} {
  const rawEvents: RawChronologyEvent[] = (data.cronologia_hitos || []).map((h) => ({
    id: h.id_hito,
    fecha_hora: h.fecha,
    hecho: h.hecho_objetivo,
    personas_involucradas: h.personas_involucradas || [],
    fuente_documental: h.fuente_foja,
    cita_o_referencia: h.cita_literal,
    relevancia: h.relevancia,
    tipo_evento: h.tipo_hito,
    analisis_procesal: `Cita textual: "${h.cita_literal}" en ${h.fuente_foja}`
  }));

  const normalizedEvents = sortAndNormalizeChronology(rawEvents);
  const calculatedGaps = detectEvidentiaryGaps(rawEvents, 30);
  const metrics = calculateChronologyMetrics(rawEvents);

  return {
    normalizedEvents,
    calculatedGaps,
    metrics
  };
}

/**
 * Transforma la salida estructurada de la auditoría forense a la estructura unificada de EvidenciaFácil (AnalysisResult)
 * para renderizado inmediato en las pestañas de Cronología, Contradicciones, Vacíos y Análisis Bayesiano.
 */
export function convertForensicToAnalysisResult(data: ForensicCaseOutput): AnalysisResult {
  const { normalizedEvents, calculatedGaps } = enrichForensicWithChronologyEngine(data);

  const timelineEvents: TimelineEvent[] = normalizedEvents.map((ev) => ({
    id: ev.id,
    fecha_hora: ev.fechaNormalizada || ev.fecha_hora,
    hecho: ev.hecho,
    personas_involucradas: ev.personas_involucradas || [],
    fuente_documental: ev.fuente_documental,
    cita_o_referencia: ev.cita_o_referencia,
    relevancia: (ev.relevancia as "Alta" | "Media" | "Baja") || "Media",
    tipo_evento: ev.tipo_evento || "Actuación Forense",
    analisis_procesal: ev.analisis_procesal || ""
  }));

  const contradictions: Contradiction[] = (data.matriz_contradicciones || []).map((c, idx) => ({
    id: c.id_conflicto || `C-${String(idx + 1).padStart(3, "0")}`,
    titulo: c.tema,
    hecho_a: {
      declaracion: c.version_a,
      fuente: "Versión A acreditada en autos",
      autor_o_parte: "Testimonio / Documento A"
    },
    hecho_b: {
      declaracion: c.version_b,
      fuente: "Versión B acreditada en autos",
      autor_o_parte: "Testimonio / Documento B"
    },
    explicacion_discrepancia: c.discrepancia_factica,
    impacto_procesal: c.impacto_procesal,
    nivel_gravedad: "Crítica"
  }));

  const gaps: EvidentiaryGap[] = (data.vacios_probatorios || []).map((v, idx) => ({
    id: v.id_vacio || `V-${String(idx + 1).padStart(3, "0")}`,
    descripcion: v.descripcion,
    hecho_o_periodo_afectado: v.periodo_afectado,
    riesgo_procesal: v.riesgo_procesal,
    diligencia_o_prueba_sugerida: v.diligencia_sugerida,
    prioridad: "Alta"
  }));

  if (Array.isArray(data.silencios_procesales)) {
    data.silencios_procesales.forEach((s, idx) => {
      gaps.push({
        id: `SILENCIO-${idx + 1}`,
        descripcion: `Silencio procesal de ${s.dias_inactividad} días: ${s.laguna_procesal}`,
        hecho_o_periodo_afectado: s.rango_fechas,
        riesgo_procesal: `Posible abandono, caducidad o ruptura de continuidad fáctica (${s.dias_inactividad} días sin actuación).`,
        diligencia_o_prueba_sugerida: "Verificar escritos en trámite, estados de proveído o interponer excepción/control de plazos.",
        prioridad: s.dias_inactividad >= 60 ? "Alta" : "Media"
      });
    });
  }

  // Incorporar vacíos detectados automáticamente por lapsos superiores a 30 días
  calculatedGaps.forEach((cg) => {
    const alreadyPresent = gaps.some((g) => g.hecho_o_periodo_afectado === cg.periodoAfectado);
    if (!alreadyPresent) {
      gaps.push({
        id: cg.id,
        descripcion: `Inactividad de ${cg.diasInactividad} días entre ${cg.eventoPrevio.fecha} y ${cg.eventoPosterior.fecha}`,
        hecho_o_periodo_afectado: cg.periodoAfectado,
        riesgo_procesal: cg.riesgoProcesal,
        diligencia_o_prueba_sugerida: cg.diligenciaSugerida,
        prioridad: cg.nivelRiesgo === "Crítico" ? "Alta" : "Media"
      });
    }
  });

  const parties = (data.partes_intervinientes || []).map((p) => ({
    nombre: p.nombre,
    rol: p.rol_procesal,
    detalles: p.entidad ? `Entidad: ${p.entidad}` : "Parte interviniente procesada"
  }));

  const startPeriod = data.periodo_documentado?.split("a")[0]?.trim() || (timelineEvents[0]?.fecha_hora ?? "N/A");
  const endPeriod = data.periodo_documentado?.split("a")[1]?.trim() || (timelineEvents[timelineEvents.length - 1]?.fecha_hora ?? "N/A");

  return {
    resumen_caso: {
      titulo_caso: data.expediente || "Auditoría Forense de Expediente Judicial",
      resumen_ejecutivo: data.resumen_ejecutivo,
      periodo_temporal: {
        inicio: startPeriod,
        fin: endPeriod
      },
      partes_identificadas: parties
    },
    cronologia: timelineEvents,
    contradicciones: contradictions,
    vacios_probatorios: gaps,
    recomendaciones_legales: data.recomendaciones_estrategicas || [],
    metadata_analisis: {
      total_documentos: timelineEvents.length,
      calidad_evidencia: "Auditoría Forense Estricta (1:1 Grounding con Fojas)",
      alerta_integridad: contradictions.length > 0
        ? `Se identificaron ${contradictions.length} discordancias fácticas entre testimonios y documentos en autos.`
        : "Expediente auditado sin discrepancias fácticas directas detectadas."
    }
  };
}
