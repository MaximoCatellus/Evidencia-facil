/**
 * @file lib/prompts/forensicPrompt.ts
 * @description System Prompt y Schema JSON estricto para Auditoría Forense Documental y E-Discovery.
 */

export const SYSTEM_INSTRUCTION_FORENSIC = `
ROL Y CAPACIDAD TÉCNICA:
Actúas como un Perito Judicial y Auditor Forense Documental especializado en E-Discovery, Análisis Probatorio y Estructuración de Casos Complejos. Tu función es auditar expedientes jurídicos, carpetas fiscales y tomos judiciales con alto volumen de información y ruido documental, convirtiéndolos en un informe estructurado y trazable de alta precisión.

OBJETIVO GENERAL:
Procesar la documentación del caso, filtrar el contenido puramente administrativo de mero trámite, extraer los hechos fácticos comprobables con citas textuales y ubicar fojas exactas, identificando la cronología del caso, contradicciones, vacíos probatorios, silencios procesales y recomendaciones estratégicas.

===============================================================================
1. REGLAS ESTRICTAS DE FILTRADO Y DESCARTE DE RUIDO (ANTI-NOISE RULES)
===============================================================================
Deberás aplicar una depuración rigurosa para evitar sobrecargas y redundancias:
A. CONTENIDO A DESCARTAR O IGNORAR (RUIDO):
- Proveídos y providencias de mero trámite ("Agréguese", "Téngase por recibido", "Cúmplase con notificar", "Póngase a despacho").
- Cédulas de notificación física o electrónica (SINOE), cargos de recepción, sellos de agua, membretes repetitivos y carátulas de tomos.
- Decretos de programación de fecha que no contengan una manifestación o hecho de fondo.
B. CONTENIDO DE VALOR RELEVANTE (EXTRAER OBLIGATORIAMENTE):
- Disposiciones fiscales (Apertura, Formalización, Declaración de Complejidad, Conclusión de Investigación).
- Actas de Declaración Indagatoria, Testimoniales y Actas de Reconocimiento Fotográfico o Presencial.
- Sentencias o Resoluciones Judiciales de fondo (Absoluciones, Condenas, Sobreseimientos).
- Informes Periciales, Certificados Médicos, Evaluaciones RUV / CVR e Historiales Clínicos.
- Documentos de descargo (Oficios de pases a disponibilidad, planillas, boletas de pago, sentencias de homonimia).
- Escritos de partes que soliciten control de plazo, prescripción o sobreseimiento.

===============================================================================
2. RIGOR METODOLÓGICO Y TRAZABILIDAD ESTRICTA (1:1 GROUNDING)
===============================================================================
1. CITA LITERAL OBLIGATORIA: Cada hito o hecho extraído debe ir acompañado de un fragmento textual exacto e inalterado entre comillas extraído de la fuente origen.
2. FUENTE Y FOJA EXACTA: Es obligatorio precisar el documento origen y la foja/página concreta (Ejemplo: "TOMO II, Foja 215").
3. PROHIBICIÓN ABSOLUTA DE ALUCINACIÓN: Jamás inventes fechas, nombres, cargos ni fojas. Si un dato no figura expresamente, indica "Dato no precisado en la fuente".
4. REGISTRO DE ANOMALÍAS: Si un documento está borroso, ilegible o incompleto, debes registrarlo como un vacío probatorio.

===============================================================================
3. ESTRUCTURA ANALÍTICA REQUERIDA (6 SECCIONES CLAVE)
===============================================================================
1. RESUMEN EJECUTIVO Y TEORÍA DEL CASO: Síntesis del núcleo de la controversia, pretensiones de las partes y estado procesal actual en 2 o 3 párrafos.
2. PARTES E INTERVINIENTES IDENTIFICADOS: Lista individualizada de personas naturales, jurídicas y autoridades con su rol procesal exacto y entidad.
3. CRONOLOGÍA PROCESAL DE HECHOS (TRAZABILIDAD 1:1): Secuencia de hitos cronológicos con fecha (AAAA-MM-DD), categoría del hecho, nivel de relevancia (Alta/Media/Baja), hecho objetivo, intervinientes, fuente con foja exacta y cita literal.
4. MATRIZ DE CONTRADICCIONES FÁCTICAS: Discordancias directas entre documentos, certificados o testimonios (Versión A vs Versión B, explicación del conflicto e impacto procesal).
5. VACÍOS PROBATORIOS Y RIESGOS DE ORFANDAD: Identificación de documentos o peritajes faltantes, riesgo procesal y diligencia probatoria sugerida.
6. SILENCIOS PROCESALES PROLONGADOS: Lapsos de más de 30 o 60 días sin actuación registrada entre dos fechas del expediente.
7. RECOMENDACIONES DE ESTRATEGIA PROCESAL: Medidas jurídicas concretas (Excepciones de improcedencia de acción, sobreseimientos, tachas, intimación de plazos, etc.).
`;

export const FORENSIC_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    expediente: {
      type: "STRING",
      description: "Nombre oficial del caso, contrato, carpeta fiscal o expediente analizado."
    },
    periodo_documentado: {
      type: "STRING",
      description: "Rango de fechas desde el hecho/documento más antiguo hasta el más reciente (AAAA-MM-DD a AAAA-MM-DD)."
    },
    resumen_ejecutivo: {
      type: "STRING",
      description: "Síntesis en 2 o 3 párrafos sobre el núcleo de la controversia, pretensiones y estado procesal o legal actual."
    },
    partes_intervinientes: {
      type: "ARRAY",
      description: "Lista de personas naturales, jurídicas o autoridades identificadas.",
      items: {
        type: "OBJECT",
        properties: {
          nombre: { type: "STRING" },
          rol_procesal: { type: "STRING", description: "Ej. Agraviado, Imputado, Demandante, Demandado, Perito, Notario, etc." },
          entidad: { type: "STRING", description: "Institución o empresa a la que pertenece." }
        },
        required: ["nombre", "rol_procesal"]
      }
    },
    cronologia_hitos: {
      type: "ARRAY",
      description: "Lista cronológica de hitos fácticos o procesales descartando ruido administrativo.",
      items: {
        type: "OBJECT",
        properties: {
          id_hito: { type: "STRING", description: "Ej. H-001, H-002" },
          fecha: { type: "STRING", description: "Formato AAAA-MM-DD o 'Sin fecha precisa'" },
          tipo_hito: { type: "STRING", description: "Categoría: Notificación, Contrato, Declaración, Peritaje, Sentencia, etc." },
          relevancia: { type: "STRING", enum: ["Alta", "Media", "Baja"] },
          hecho_objetivo: { type: "STRING", description: "Descripción fáctica e imparcial del evento" },
          personas_involucradas: {
            type: "ARRAY",
            items: { type: "STRING" }
          },
          fuente_foja: { type: "STRING", description: "Documento origen y foja/página exacta" },
          cita_literal: { type: "STRING", description: "Transcripción TEXTUAL e inalterada entre comillas" }
        },
        required: ["id_hito", "fecha", "tipo_hito", "hecho_objetivo", "fuente_foja", "cita_literal"]
      }
    },
    matriz_contradicciones: {
      type: "ARRAY",
      description: "Discrepancias directas entre documentos, anexos o declaraciones.",
      items: {
        type: "OBJECT",
        properties: {
          id_conflicto: { type: "STRING", description: "Ej. C-001" },
          tema: { type: "STRING", description: "Materia del conflicto o discrepancia" },
          version_a: { type: "STRING", description: "Postura o cita textual de la Fuente A con foja/página" },
          version_b: { type: "STRING", description: "Postura o cita textual de la Fuente B con foja/página" },
          discrepancia_factica: { type: "STRING", description: "Explicación de la contradicción" },
          impacto_procesal: { type: "STRING", description: "Efecto o riesgo para el caso/contrato" }
        },
        required: ["id_conflicto", "tema", "version_a", "version_b", "discrepancia_factica"]
      }
    },
    vacios_probatorios: {
      type: "ARRAY",
      description: "Documentos, anexos o pruebas faltantes.",
      items: {
        type: "OBJECT",
        properties: {
          id_vacio: { type: "STRING", description: "Ej. V-001" },
          descripcion: { type: "STRING", description: "Detalle del documento o prueba ausente" },
          periodo_afectado: { type: "STRING", description: "Etapa o hecho afectado" },
          riesgo_procesal: { type: "STRING", description: "Peligro resultante" },
          diligencia_sugerida: { type: "STRING", description: "Medida para subsanar la laguna" }
        },
        required: ["id_vacio", "descripcion", "riesgo_procesal", "diligencia_sugerida"]
      }
    },
    silencios_procesales: {
      type: "ARRAY",
      description: "Lapsos prolongados de inactividad entre actuaciones o comunicaciones.",
      items: {
        type: "OBJECT",
        properties: {
          rango_fechas: { type: "STRING" },
          dias_inactividad: { type: "NUMBER" },
          laguna_procesal: { type: "STRING" }
        }
      }
    },
    recomendaciones_estrategicas: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: [
    "expediente",
    "resumen_ejecutivo",
    "partes_intervinientes",
    "cronologia_hitos",
    "matriz_contradicciones",
    "vacios_probatorios"
  ]
};

export interface ForensicParty {
  nombre: string;
  rol_procesal: string;
  entidad?: string;
}

export interface ForensicTimelineMilestone {
  id_hito: string;
  fecha: string;
  tipo_hito: string;
  relevancia: "Alta" | "Media" | "Baja";
  hecho_objetivo: string;
  personas_involucradas?: string[];
  fuente_foja: string;
  cita_literal: string;
}

export interface ForensicContradiction {
  id_conflicto: string;
  tema: string;
  version_a: string;
  version_b: string;
  discrepancia_factica: string;
  impacto_procesal: string;
}

export interface ForensicEvidentiaryGap {
  id_vacio: string;
  descripcion: string;
  periodo_afectado: string;
  riesgo_procesal: string;
  diligencia_sugerida: string;
}

export interface ForensicProceduralSilence {
  rango_fechas: string;
  dias_inactividad: number;
  laguna_procesal: string;
}

export interface ForensicCaseOutput {
  expediente: string;
  periodo_documentado?: string;
  resumen_ejecutivo: string;
  partes_intervinientes: ForensicParty[];
  cronologia_hitos: ForensicTimelineMilestone[];
  matriz_contradicciones: ForensicContradiction[];
  vacios_probatorios: ForensicEvidentiaryGap[];
  silencios_procesales?: ForensicProceduralSilence[];
  recomendaciones_estrategicas?: string[];
}
