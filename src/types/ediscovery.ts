export interface CaseParty {
  nombre: string;
  rol: string;
  detalles: string;
}

export interface CaseSummary {
  titulo_caso: string;
  resumen_ejecutivo: string;
  periodo_temporal: {
    inicio: string;
    fin: string;
  };
  partes_identificadas: CaseParty[];
}

export interface TimelineEvent {
  id: string;
  fecha_hora: string;
  hecho: string;
  personas_involucradas: string[];
  fuente_documental: string;
  cita_o_referencia: string;
  relevancia: "Alta" | "Media" | "Baja";
  tipo_evento: string;
  analisis_procesal: string;
}

export interface ContradictionPartyFact {
  declaracion: string;
  fuente: string;
  autor_o_parte: string;
}

export interface Contradiction {
  id: string;
  titulo: string;
  hecho_a: ContradictionPartyFact;
  hecho_b: ContradictionPartyFact;
  explicacion_discrepancia: string;
  impacto_procesal: string;
  nivel_gravedad: "Crítica" | "Moderada" | "Leve";
}

export interface EvidentiaryGap {
  id: string;
  descripcion: string;
  hecho_o_periodo_afectado: string;
  riesgo_procesal: string;
  diligencia_o_prueba_sugerida: string;
  prioridad: "Alta" | "Media" | "Baja";
}

export type BayesianEvidenceState = "presente" | "ausente" | "desconocida";

export interface BayesianEvidenceNode {
  id: string;
  nombre: string;
  descripcion: string;
  fuente_documental: string;
  cita_clave: string;
  probabilidad_si_hipotesis_cierta: number; // P(E|H) e.g. 0.85
  probabilidad_si_hipotesis_falsa: number;  // P(E|~H) e.g. 0.15
  justificacion_probabilistica: string;
  estado_observado: BayesianEvidenceState;
}

export interface BayesianHypothesis {
  id: string;
  descripcion: string;
  estado_positivo: string;
  estado_negativo: string;
  probabilidad_a_priori: number; // P(H) e.g. 0.50
  fundamentacion_previa: string;
}

export interface BayesianNetworkTopology {
  hipotesis: BayesianHypothesis;
  evidencias: BayesianEvidenceNode[];
  tesis_probatoria: string;
}

export interface BayesianCalculatedNode extends BayesianEvidenceNode {
  razon_verosimilitud: number; // Likelihood Ratio (LR)
  peso_evidencia_db: number;   // Weight of evidence in decibans: 10 * log10(LR)
  direccion_apoyo: "favorece_hipotesis" | "desfavorece_hipotesis" | "neutro";
  fuerza_probatoria: "Concluyente" | "Fuerte" | "Moderada" | "Débil" | "Inapreciable";
}

export interface BayesianInferenceResult {
  probabilidad_a_posteriori: number; // P(H|E)
  probabilidad_a_priori: number;     // P(H)
  odds_a_priori: number;
  odds_a_posteriori: number;
  factor_bayes_global: number;
  peso_probatorio_total_db: number;
  estandar_probatorio_alcanzado: string;
  nivel_certeza: "Muy Alto" | "Alto" | "Preponderante" | "Insuficiente";
  nodos: BayesianCalculatedNode[];
}

export interface AnalysisMetadata {
  total_documentos: number;
  calidad_evidencia: string;
  alerta_integridad: string;
}

export interface ArgumentPremise {
  id: string;
  premisa: string;
  hecho_vinculado_id?: string;
  soporte_documental?: string;
}

export interface ArgumentScheme {
  conclusion_principal: {
    id: string;
    afirmacion: string;
  };
  premisas: ArgumentPremise[];
  garantia_inferencia: string;
}

export interface AnalysisResult {
  resumen_caso: CaseSummary;
  cronologia: TimelineEvent[];
  contradicciones: Contradiction[];
  vacios_probatorios: EvidentiaryGap[];
  red_bayesiana?: BayesianNetworkTopology;
  esquema_argumental?: ArgumentScheme;
  recomendaciones_legales: string[];
  metadata_analisis: AnalysisMetadata;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  originalSize?: number;
  compressionRatio?: number;
  base64?: string;
  previewUrl?: string;
  textContent?: string;
  category?: "chat" | "email" | "contract" | "receipt" | "other";
}

