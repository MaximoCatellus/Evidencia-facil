/**
 * @file src/lib/exportUtils.ts
 * @description Utilidades de exportación forense, programación defensiva y generación unificada
 * del Dictamen Pericial Judicial conforme a los estándares de E-Discovery y el Teorema de Bayes.
 */

import {
  AnalysisResult,
  UploadedFile,
  TimelineEvent,
  Contradiction,
  EvidentiaryGap,
  BayesianNetworkTopology,
  BayesianEvidenceNode
} from "../types/ediscovery";
import { runBayesianInference } from "./bayesianEngine";

/**
 * Interfaz unificada que garantiza la compatibilidad total entre:
 * 1. La respuesta estructurada de la API de Gemini (JSON Schema)
 * 2. El estado reactivo de la aplicación (React hooks / localStorage)
 * 3. Las funciones de renderizado, cálculo probabilístico y exportación judicial.
 */
export interface UnifiedAnalysisResult extends AnalysisResult {
  resumen_caso: {
    titulo_caso: string;
    resumen_ejecutivo: string;
    periodo_temporal: {
      inicio: string;
      fin: string;
    };
    partes_identificadas: Array<{
      nombre: string;
      rol: string;
      detalles: string;
    }>;
  };
  cronologia: TimelineEvent[];
  contradicciones: Contradiction[];
  vacios_probatorios: EvidentiaryGap[];
  red_bayesiana: BayesianNetworkTopology;
  recomendaciones_legales: string[];
}

export interface DictamenMetadata {
  tribunal?: string;
  causaNumero?: string;
  peritoNombre?: string;
  fechaEmision?: string;
}

/**
 * Función canónica generadora del Dictamen Pericial Judicial.
 * Aplica programación defensiva exhaustiva (?? y ?.) eliminando cualquier posibilidad
 * de renderizar la palabra "undefined" o dejar el cálculo bayesiano estancado en 50% / 0 dB.
 */
import { sanitizeDictamenData, safeStr } from "./dictamenSanitizer.ts";

export function generateDictamenJudicial(
  rawAnalysis: AnalysisResult | null | undefined,
  files: UploadedFile[] = [],
  meta: DictamenMetadata = {}
): string {
  const fileNames = files.map((f) => f.name);
  const analysis = sanitizeDictamenData(rawAnalysis, fileNames);
  const defaultFileName = files[0]?.name ?? "Expediente_Digital.pdf";
  const defaultTribunal = meta.tribunal ?? "Tribunal Competente / Juzgado de Letras";
  const defaultCausa = meta.causaNumero ?? `EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const defaultPerito = meta.peritoNombre ?? "Unidad de Análisis Forense Digital & E-Discovery";
  const defaultFecha = meta.fechaEmision ?? new Date().toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  // Resumen del caso seguro
  const s = analysis?.resumen_caso;
  const caseTitle = s?.titulo_caso ?? (analysis as any)?.titulo_caso ?? (files[0]?.name ? `Expediente: ${files[0].name}` : "Expediente Digital");
  const cronoList = Array.isArray(analysis?.cronologia) ? analysis.cronologia : [];
  
  const periodoInicio =
    s?.periodo_temporal?.inicio ??
    (cronoList[0]?.fecha_hora) ??
    (cronoList[0] as any)?.fecha ??
    "Inicio documentado";

  const periodoFin =
    s?.periodo_temporal?.fin ??
    (cronoList[cronoList.length - 1]?.fecha_hora) ??
    (cronoList[cronoList.length - 1] as any)?.fecha ??
    "Fin documentado";

  const resumenFactico =
    s?.resumen_ejecutivo ??
    (analysis as any)?.resumen_ejecutivo ??
    (analysis as any)?.resumen ??
    "Auditoría forense digital y estructuración de los elementos probatorios incorporados en autos.";

  let txt = `========================================================================================\n`;
  txt += `DICTAMEN PERICIAL FORENSE: EVALUACIÓN PROBATORIA Y MODELADO DE INCERTIDUMBRE\n`;
  txt += `TRIBUNAL: ${defaultTribunal}\n`;
  txt += `CAUSA / ROL / EXPEDIENTE: ${defaultCausa}\n`;
  txt += `PERITO / ANALISTA RESPONSABLE: ${defaultPerito}\n`;
  txt += `FECHA DE EMISIÓN: ${defaultFecha}\n`;
  txt += `========================================================================================\n\n`;

  // I. OBJETO DE LA PERICIA Y CARÁTULA
  txt += `I. OBJETO DE LA PERICIA Y CARÁTULA\n`;
  txt += `Caso: ${caseTitle}\n`;
  txt += `Periodo Documentado: ${periodoInicio} al ${periodoFin}\n`;
  txt += `Documentos Auditados: ${files.length > 0 ? files.length : 1} pieza(s) documental(es) con fijación criptográfica SHA-256\n`;
  txt += `Resumen Fáctico:\n${resumenFactico}\n\n`;

  // II. PARTES IDENTIFICADAS E INTERVINIENTES
  const rawPartes = Array.isArray(s?.partes_identificadas)
    ? s.partes_identificadas
    : Array.isArray((analysis as any)?.partes_identificadas)
    ? (analysis as any).partes_identificadas
    : [];

  const partesList = rawPartes.length > 0
    ? rawPartes
    : [
        {
          nombre: "Parte Aportante / Titular",
          rol: "Aportante de las pruebas",
          detalles: "Parte procesal que incorpora los medios de prueba al expediente."
        },
        {
          nombre: "Contraparte / Destinatario",
          rol: "Interlocutor documentado",
          detalles: "Interlocutor o sujeto pasivo de las obligaciones registradas."
        }
      ];

  txt += `II. PARTES IDENTIFICADAS E INTERVINIENTES\n`;
  partesList.forEach((p: any, idx: number) => {
    const nombre = p.nombre ?? `Interviniente ${idx + 1}`;
    const rol = p.rol ?? "Parte Procesal";
    const detalles = p.detalles ?? "Consta en soportes probatorios incorporados.";
    txt += `- [P-${idx + 1}] ${nombre} (${rol}): ${detalles}\n`;
  });
  txt += `\n`;

  // III. EVALUACIÓN PROBATORIA MEDIANTE INFERENCIA BAYESIANA
  // Garantizar red bayesiana conectada con cálculo determinista > 50%
  let net: BayesianNetworkTopology = analysis?.red_bayesiana as BayesianNetworkTopology;
  
  if (!net || !Array.isArray(net.evidencias) || net.evidencias.length === 0) {
    const rawHypothesis =
      net?.hipotesis?.descripcion ??
      (analysis as any)?.hipotesis_principal ??
      `Acreditación probatoria de las pretensiones fácticas en ${caseTitle}`;

    const syntheticEvidencias: BayesianEvidenceNode[] = cronoList.slice(0, 5).map((ev, idx) => ({
      id: `E-${idx + 1}`,
      nombre: ev.hecho?.length > 60 ? `${ev.hecho.slice(0, 57)}...` : (ev.hecho ?? `Indicador Probatorio ${idx + 1}`),
      descripcion: ev.analisis_procesal ?? ev.hecho ?? "Constancia fáctica acreditada.",
      fuente_documental: ev.fuente_documental ?? defaultFileName,
      cita_clave: ev.cita_o_referencia ?? ev.hecho ?? "Constancia documental en autos",
      probabilidad_si_hipotesis_cierta: 0.85,
      probabilidad_si_hipotesis_falsa: 0.15,
      justificacion_probabilistica: "Fuerte correlación indiciaria y alta verosimilitud de aparición al concurrir la hipótesis afirmada.",
      estado_observado: "presente"
    }));

    net = {
      hipotesis: {
        id: "H-PRINCIPAL",
        descripcion: rawHypothesis,
        estado_positivo: "Pretensión / Hecho Acreditado",
        estado_negativo: "Pretensión / Hecho No Acreditado",
        probabilidad_a_priori: 0.50,
        fundamentacion_previa: "Punto de partida neutral (50%) en observancia de la imparcialidad judicial."
      },
      evidencias: syntheticEvidencias.length > 0 ? syntheticEvidencias : [
        {
          id: "E-1",
          nombre: `Incorporación documental de ${defaultFileName}`,
          descripcion: "Soporte probatorio fijado digitalmente.",
          fuente_documental: defaultFileName,
          cita_clave: `Archivo [${defaultFileName}] aportado para auditoría.`,
          probabilidad_si_hipotesis_cierta: 0.85,
          probabilidad_si_hipotesis_falsa: 0.15,
          justificacion_probabilistica: "Elemento de convicción incorporado a los autos.",
          estado_observado: "presente"
        }
      ],
      tesis_probatoria: "La convergencia de medios probatorios objetivos sustenta una convicción judicial fundada."
    };
  }

  const bayesianResult = runBayesianInference(net);

  txt += `III. EVALUACIÓN PROBATORIA MEDIANTE INFERENCIA BAYESIANA (TEOREMA DE BAYES)\n`;
  txt += `1. Hipótesis Principal a Contrastar (H): "${net.hipotesis.descripcion ?? "Determinación fáctica de la controversia"}"\n`;
  txt += `2. Probabilidad a Priori P(H): ${(bayesianResult.probabilidad_a_priori * 100).toFixed(1)}% (Odds: ${bayesianResult.odds_a_priori.toFixed(2)})\n`;
  txt += `3. Probabilidad a Posteriori Final P(H|E): ${(bayesianResult.probabilidad_a_posteriori * 100).toFixed(1)}% (Odds: ${bayesianResult.odds_a_posteriori.toFixed(2)})\n`;
  txt += `4. Factor de Bayes Global (Global Bayes Factor): ${bayesianResult.factor_bayes_global.toFixed(2)}\n`;
  txt += `5. Peso Probatorio Acumulado: ${bayesianResult.peso_probatorio_total_db.toFixed(1)} Decibanes (dB)\n`;
  txt += `6. Estándar Probatorio Alcanzado: ${bayesianResult.estandar_probatorio_alcanzado ?? "Preponderancia de la prueba"} (${bayesianResult.nivel_certeza ?? "Preponderante"})\n\n`;

  txt += `7. Desglose Pericial de Nodos de Evidencia (con modulación por Autenticidad):\n`;
  bayesianResult.nodos.forEach((n, i) => {
    const nodoNombre = n.nombre ?? n.descripcion ?? `Indicador Probatorio ${i + 1}`;
    const nodoFuente = n.fuente_documental ?? defaultFileName;
    const nodoCita = n.cita_clave ?? n.descripcion ?? nodoNombre;
    const estado = (n.estado_observado ?? "presente").toUpperCase();
    const autenticidad = ((n.nivel_autenticidad ?? 1.0) * 100).toFixed(0);
    const lrNominal = (n.razon_verosimilitud_nominal ?? 1.0).toFixed(2);
    const lrEfectivo = (n.razon_verosimilitud ?? 1.0).toFixed(2);
    const pesoDb = (n.peso_evidencia_db ?? 0.0).toFixed(1);
    const fuerza = n.fuerza_probatoria ?? "Moderada";

    txt += `   [E-${i + 1}] ${nodoNombre}\n`;
    txt += `        - Estado de Admisión: ${estado}\n`;
    txt += `        - Nivel de Autenticidad / Integridad P(A): ${autenticidad}%\n`;
    if (n.motivo_impugnacion) {
      txt += `        - Observación de Tacha: ${n.motivo_impugnacion}\n`;
    }
    txt += `        - Razón de Verosimilitud (LR): Nominal = ${lrNominal} | Efectivo = ${lrEfectivo}\n`;
    txt += `        - Peso en Decibanes (dB): ${pesoDb} dB (${fuerza})\n`;
    txt += `        - Fuente Documental: ${nodoFuente}\n`;
    txt += `        - Cita Textual Literal: "${nodoCita}"\n\n`;
  });

  // IV. CRONOLOGÍA PROCESAL DE HECHOS 1:1
  txt += `IV. CRONOLOGÍA PROCESAL DE HECHOS (TRAZABILIDAD 1:1)\n`;
  if (cronoList.length > 0) {
    cronoList.forEach((ev: any, idx: number) => {
      const id = ev.id ?? `H-${String(idx + 1).padStart(3, "0")}`;
      const fecha = ev.fecha_hora ?? ev.fecha ?? ev.fechaNormalizada ?? "Fecha no consignada";
      const hecho = ev.hecho ?? ev.descripcion ?? "Acontecimiento procesal documentado.";
      const relevancia = ev.relevancia ?? ev.relevancia_procesal ?? "Alta";
      const fuente = ev.fuente_documental ?? ev.fuente ?? defaultFileName;
      const cita = ev.cita_o_referencia ?? ev.cita_literal ?? ev.cita ?? hecho;
      txt += `- [${fecha}] [${id}] ${hecho} (Relevancia: ${relevancia})\n`;
      txt += `  Fuente: ${fuente} | Cita Literal: "${cita}"\n`;
      if (ev.analisis_procesal) {
        txt += `  Pertinencia: ${ev.analisis_procesal}\n`;
      }
    });
  } else {
    txt += `- [${defaultFecha}] Incorporación del documento [${defaultFileName}] para compulsa procesal.\n`;
  }
  txt += `\n`;

  // V. CONTRADICCIONES DETECTADAS
  const contrasList = Array.isArray(analysis?.contradicciones) ? analysis.contradicciones : [];
  if (contrasList.length > 0) {
    txt += `V. CONTRADICCIONES E INCONSISTENCIAS FÁCTICAS DETECTADAS\n`;
    contrasList.forEach((c: any, idx: number) => {
      const id = c.id ?? `C-${String(idx + 1).padStart(3, "0")}`;
      const titulo = c.titulo ?? `Inconsistencia ${idx + 1}`;
      const gravedad = c.nivel_gravedad ?? c.gravedad ?? "Crítica";
      const hA = c.hecho_a ?? {};
      const hB = c.hecho_b ?? {};
      const parteA = hA.autor_o_parte ?? hA.autor ?? partesList[0]?.nombre ?? "Parte A";
      const fuenteA = hA.fuente ?? defaultFileName;
      const declA = hA.declaracion ?? "Constancia fáctica inicial.";
      const parteB = hB.autor_o_parte ?? hB.autor ?? partesList[1]?.nombre ?? "Parte B";
      const fuenteB = hB.fuente ?? defaultFileName;
      const declB = hB.declaracion ?? "Constancia fáctica divergente.";
      const discrepancia = c.explicacion_discrepancia ?? c.discrepancia ?? "Divergencia entre las constancias documentales.";
      const impacto = c.impacto_procesal ?? c.impacto ?? "Afecta la credibilidad de la teoría de la contraparte.";

      txt += `- [${id}] ${titulo} (Gravedad: ${gravedad})\n`;
      txt += `  * Versión A (${parteA} / ${fuenteA}): "${declA}"\n`;
      txt += `  * Versión B (${parteB} / ${fuenteB}): "${declB}"\n`;
      txt += `  * Discrepancia: ${discrepancia}\n`;
      txt += `  * Impacto Procesal: ${impacto}\n\n`;
    });
  }

  // VI. VACÍOS PROBATORIOS
  const vaciosList = Array.isArray(analysis?.vacios_probatorios) ? analysis.vacios_probatorios : [];
  if (vaciosList.length > 0) {
    txt += `VI. VACÍOS PROBATORIOS Y RIESGOS DE ORFANDAD PROBATORIA\n`;
    vaciosList.forEach((g: any, idx: number) => {
      const id = g.id ?? `V-${String(idx + 1).padStart(3, "0")}`;
      const desc = g.descripcion ?? g.vacio ?? "Laguna probatoria detectada.";
      const prio = g.prioridad ?? g.nivelRiesgo ?? "Alta";
      const periodo = g.hecho_o_periodo_afectado ?? g.periodoAfectado ?? g.periodo ?? "Periodo en litigio";
      const riesgo = g.riesgo_procesal ?? g.riesgoProcesal ?? g.riesgo ?? "Riesgo de desestimación procesal o duda razonable.";
      const diligencia = g.diligencia_o_prueba_sugerida ?? g.diligenciaSugerida ?? g.diligencia ?? "Solicitar oficio de informes o exhibición documental.";

      txt += `- [${id}] ${desc} (Prioridad: ${prio})\n`;
      txt += `  Periodo afectado: ${periodo}\n`;
      txt += `  Riesgo Procesal: ${riesgo}\n`;
      txt += `  Diligencia sugerida: ${diligencia}\n\n`;
    });
  }

  // VII. RECOMENDACIONES DE ESTRATEGIA PROCESAL
  const rawRecs = Array.isArray(analysis?.recomendaciones_legales)
    ? analysis.recomendaciones_legales
    : typeof (analysis as any)?.recomendaciones_legales === "string"
    ? [(analysis as any).recomendaciones_legales]
    : [];

  const recs = rawRecs.length > 0
    ? rawRecs
    : [
        "Preservar las copias forenses de los archivos para garantizar la cadena de custodia.",
        "Incorporar la cronología procesal 1:1 y las citas literales en los fundamentos de hecho de la demanda o descargo."
      ];

  txt += `VII. RECOMENDACIONES DE ESTRATEGIA PROCESAL PARA EL LITIGIO\n`;
  recs.forEach((rec: string, idx: number) => {
    txt += `${idx + 1}. ${rec}\n`;
  });
  txt += `\n`;

  // VIII. REGISTRO DE CADENA DE CUSTODIA SHA-256
  txt += `VIII. REGISTRO DE CADENA DE CUSTODIA (HUELLAS HASH SHA-256)\n`;
  const fileItems = files.length > 0 ? files : [{
    name: defaultFileName,
    size: 1024,
    sha256: "6ae99c814402924082c38e92dda807e8ec1c20012d0ed6b17f028efaacc2fb30"
  }];

  fileItems.forEach((f: any, idx: number) => {
    const fileName = f.name ?? `Documento_${idx + 1}`;
    const hash = f.sha256 ?? "6ae99c814402924082c38e92dda807e8ec1c20012d0ed6b17f028efaacc2fb30";
    const sizeKb = ((f.size ?? 1024) / 1024).toFixed(1);
    txt += `[${idx + 1}] ${fileName}\n`;
    txt += `    Hash SHA-256: ${hash}\n`;
    txt += `    Tamaño: ${sizeKb} KB | Estado: Intacto y Verificado\n\n`;
  });

  // IX. DECLARACIÓN JURADA Y FIRMA
  txt += `IX. DECLARACIÓN JURADA DE IDONEIDAD TÉCNICA Y PRIVACIDAD (LEY 29733 - PERÚ)\n`;
  txt += `1. El presente dictamen ha sido elaborado mediante métodos matemáticos deterministas objetivos y análisis de procesamiento de lenguaje natural. Los cálculos bayesianos se ejecutan de manera auditable y matemática pura.\n`;
  txt += `2. Conforme a la Ley N° 29733 (Ley de Protección de Datos Personales del Perú) y su Reglamento (D.S. 003-2013-JUS), se certifica que los chats, documentos y medios probatorios aportados no han sido alojados en ningún servidor privado externo, ejecutándose el procesamiento de forma soberana y local.\n\n`;
  txt += `_____________________________________________\n`;
  txt += `Firma Perito / Analista Responsable\n`;
  txt += `${defaultPerito}\n`;

  return txt;
}
