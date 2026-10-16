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

export interface AnalysisMetadata {
  total_documentos: number;
  calidad_evidencia: string;
  alerta_integridad: string;
}

export interface AnalysisResult {
  resumen_caso: CaseSummary;
  cronologia: TimelineEvent[];
  contradicciones: Contradiction[];
  vacios_probatorios: EvidentiaryGap[];
  recomendaciones_legales: string[];
  metadata_analisis: AnalysisMetadata;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  previewUrl?: string;
  textContent?: string;
  category?: "chat" | "email" | "contract" | "receipt" | "other";
}
