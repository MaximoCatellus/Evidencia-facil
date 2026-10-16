/**
 * @file lib/bayesianEngine.ts
 * @description Motor matemático determinista puro para evaluación probatoria mediante inferencia bayesiana.
 * Implementa el Teorema de Bayes exacto, formulación de Odds, Razones de Verosimilitud (Likelihood Ratios)
 * y Peso de la Evidencia (Weight of Evidence en decibanes de I.J. Good y Alan Turing).
 * 
 * GARANTÍA ARQUITECTÓNICA:
 * Ningún cálculo probabilístico es generado por el LLM para evitar alucinaciones.
 * El LLM únicamente extrae la topología causal (hipótesis, nodos de evidencia y verosimilitudes sugeridas);
 * este motor ejecuta la matemática determinista en TypeScript tanto en cliente como en servidor.
 */

export type BayesianEvidenceState = "presente" | "ausente" | "desconocida";

export interface BayesianEvidenceNode {
  id: string;
  nombre: string;
  descripcion: string;
  fuente_documental: string;
  cita_clave: string;
  probabilidad_si_hipotesis_cierta: number; // P(E|H) ej. 0.85
  probabilidad_si_hipotesis_falsa: number;  // P(E|~H) ej. 0.15
  justificacion_probabilistica: string;
  estado_observado: BayesianEvidenceState;
}

export interface BayesianHypothesis {
  id: string;
  descripcion: string;
  estado_positivo: string; // ej. "Despido Injustificado / Incumplimiento Contractual"
  estado_negativo: string; // ej. "Despido Procedente / Cumplimiento Contractual"
  probabilidad_a_priori: number; // P(H) ej. 0.50
  fundamentacion_previa: string;
}

export interface BayesianNetworkTopology {
  hipotesis: BayesianHypothesis;
  evidencias: BayesianEvidenceNode[];
  tesis_probatoria: string;
}

export interface BayesianCalculatedNode extends BayesianEvidenceNode {
  razon_verosimilitud: number; // Likelihood Ratio (LR)
  peso_evidencia_db: number;   // Weight of evidence en decibanes: 10 * log10(LR)
  direccion_apoyo: "favorece_hipotesis" | "desfavorece_hipotesis" | "neutro";
  fuerza_probatoria: "Concluyente" | "Fuerte" | "Moderada" | "Débil" | "Inapreciable";
}

export interface BayesianInferenceResult {
  probabilidad_a_posteriori: number; // P(H|E) en rango [0, 1]
  probabilidad_a_priori: number;     // P(H)
  odds_a_priori: number;             // O(H)
  odds_a_posteriori: number;         // O(H|E)
  factor_bayes_global: number;       // Global Bayes Factor = Product(LR_i)
  peso_probatorio_total_db: number;  // Decibanes acumulados
  estandar_probatorio_alcanzado: string;
  nivel_certeza: "Muy Alto" | "Alto" | "Preponderante" | "Insuficiente";
  nodos: BayesianCalculatedNode[];
}

/**
 * Normaliza probabilidades para evitar divisiones por cero o singularidades numéricas.
 */
export function clampProbability(p: number, min = 0.001, max = 0.999): number {
  if (isNaN(p) || p === null || p === undefined) return 0.5;
  return Math.min(Math.max(p, min), max);
}

/**
 * Calcula la razón de verosimilitud (Likelihood Ratio) y el peso probatorio para un nodo de prueba:
 * 
 * Si E está presente:   LR = P(E | H) / P(E | ~H)
 * Si E está ausente:    LR = (1 - P(E | H)) / (1 - P(E | ~H))
 * Si E es desconocida:  LR = 1.0 (evidencia neutra, sin impacto)
 */
export function calculateNodeLikelihoodRatio(
  node: BayesianEvidenceNode,
  state: BayesianEvidenceState = node.estado_observado
): {
  lr: number;
  weightDb: number;
  direction: "favorece_hipotesis" | "desfavorece_hipotesis" | "neutro";
  strength: "Concluyente" | "Fuerte" | "Moderada" | "Débil" | "Inapreciable";
} {
  const pH = clampProbability(node.probabilidad_si_hipotesis_cierta);
  const pNotH = clampProbability(node.probabilidad_si_hipotesis_falsa);

  let lr = 1.0;

  if (state === "presente") {
    lr = pH / pNotH;
  } else if (state === "ausente") {
    lr = (1 - pH) / (1 - pNotH);
  } else {
    // Desconocida: no aporta información al caso
    lr = 1.0;
  }

  // Weight of Evidence en decibanes (dB) según I.J. Good y Alan Turing:
  // W = 10 * log10(LR)
  const weightDb = lr > 0 ? 10 * Math.log10(lr) : 0;

  // Dirección procesal
  let direction: "favorece_hipotesis" | "desfavorece_hipotesis" | "neutro" = "neutro";
  if (lr > 1.05) {
    direction = "favorece_hipotesis";
  } else if (lr < 0.95) {
    direction = "desfavorece_hipotesis";
  }

  // Escala de fuerza probatoria estándar en ciencias forenses y prueba judicial (ENFSI / Aitken & Taroni)
  const absDb = Math.abs(weightDb);
  let strength: "Concluyente" | "Fuerte" | "Moderada" | "Débil" | "Inapreciable" = "Inapreciable";
  if (absDb >= 20) {
    strength = "Concluyente"; // LR >= 100
  } else if (absDb >= 10) {
    strength = "Fuerte";      // LR >= 10
  } else if (absDb >= 5) {
    strength = "Moderada";    // LR >= 3.16
  } else if (absDb >= 1) {
    strength = "Débil";       // LR >= 1.25
  } else {
    strength = "Inapreciable";
  }

  return { lr, weightDb, direction, strength };
}

/**
 * Determina el estándar judicial alcanzado según el porcentaje a posteriori.
 */
export function getLegalStandard(posteriorProb: number): {
  standard: string;
  level: "Muy Alto" | "Alto" | "Preponderante" | "Insuficiente";
} {
  if (posteriorProb >= 0.95) {
    return {
      standard: "Más allá de toda duda razonable (Estándar penal / Certeza pericial plena)",
      level: "Muy Alto"
    };
  }
  if (posteriorProb >= 0.75) {
    return {
      standard: "Prueba clara y convincente (Estándar civil cualificado / Certeza razonable)",
      level: "Alto"
    };
  }
  if (posteriorProb >= 0.50) {
    return {
      standard: "Preponderancia de la prueba (Probabilidad preponderante > 50% en litigio civil y laboral)",
      level: "Preponderante"
    };
  }
  return {
    standard: "Insuficiencia probatoria (No supera el umbral de convicción preponderante)",
    level: "Insuficiente"
  };
}

/**
 * Ejecuta la actualización bayesiana determinista completa sobre una red
 * utilizando la formulación de Odds y Teorema de Bayes:
 * 
 * Posterior Odds = Prior Odds * Product(LR_i)
 * Posterior Prob = Posterior Odds / (1 + Posterior Odds)
 */
export function runBayesianInference(
  network: BayesianNetworkTopology,
  overrides?: {
    priorProbability?: number;
    nodeStates?: Record<string, BayesianEvidenceState>;
    nodeLikelihoods?: Record<string, { pH: number; pNotH: number }>;
  }
): BayesianInferenceResult {
  const priorProb = clampProbability(
    overrides?.priorProbability ?? network.hipotesis?.probabilidad_a_priori ?? 0.5
  );

  // Prior Odds: O(H) = P(H) / (1 - P(H))
  const priorOdds = priorProb / (1 - priorProb);

  let cumulativeLR = 1.0;
  let totalWeightDb = 0;

  const calculatedNodes: BayesianCalculatedNode[] = (network.evidencias || []).map((node) => {
    const currentState = overrides?.nodeStates?.[node.id] ?? node.estado_observado ?? "presente";
    const customLikelihoods = overrides?.nodeLikelihoods?.[node.id];

    const effectiveNode: BayesianEvidenceNode = {
      ...node,
      estado_observado: currentState,
      probabilidad_si_hipotesis_cierta: customLikelihoods
        ? customLikelihoods.pH
        : node.probabilidad_si_hipotesis_cierta,
      probabilidad_si_hipotesis_falsa: customLikelihoods
        ? customLikelihoods.pNotH
        : node.probabilidad_si_hipotesis_falsa
    };

    const { lr, weightDb, direction, strength } = calculateNodeLikelihoodRatio(
      effectiveNode,
      currentState
    );

    cumulativeLR *= lr;
    totalWeightDb += weightDb;

    return {
      ...effectiveNode,
      razon_verosimilitud: Number(lr.toFixed(3)),
      peso_evidencia_db: Number(weightDb.toFixed(2)),
      direccion_apoyo: direction,
      fuerza_probatoria: strength
    };
  });

  // Posterior Odds: O(H|E) = O(H) * Product(LR)
  const posteriorOdds = priorOdds * cumulativeLR;

  // Posterior Probability: P(H|E) = O(H|E) / (1 + O(H|E))
  let posteriorProb = posteriorOdds / (1 + posteriorOdds);
  if (isNaN(posteriorProb)) posteriorProb = 0.5;
  posteriorProb = Math.min(Math.max(posteriorProb, 0.0001), 0.9999);

  const { standard, level } = getLegalStandard(posteriorProb);

  return {
    probabilidad_a_posteriori: Number(posteriorProb.toFixed(4)),
    probabilidad_a_priori: Number(priorProb.toFixed(4)),
    odds_a_priori: Number(priorOdds.toFixed(3)),
    odds_a_posteriori: Number(posteriorOdds.toFixed(3)),
    factor_bayes_global: Number(cumulativeLR.toFixed(3)),
    peso_probatorio_total_db: Number(totalWeightDb.toFixed(2)),
    estandar_probatorio_alcanzado: standard,
    nivel_certeza: level,
    nodos: calculatedNodes
  };
}

/**
 * Simulación de sensibilidad procesal (Análisis "What-If"):
 * Determina cómo varía la probabilidad a posteriori si una prueba concreta
 * es admitida ("presente"), tachada/descartada ("ausente") o queda sin acreditar ("desconocida").
 */
export function simulateSensitivity(
  network: BayesianNetworkTopology,
  targetNodeId: string,
  targetState: BayesianEvidenceState,
  currentStates?: Record<string, BayesianEvidenceState>,
  currentPrior?: number
): {
  nuevaProbabilidad: number;
  diferenciaPorcentual: number;
  estandarAlcanzado: string;
} {
  const mergedStates = {
    ...(currentStates || {}),
    [targetNodeId]: targetState
  };

  const currentResult = runBayesianInference(network, {
    priorProbability: currentPrior,
    nodeStates: currentStates
  });

  const simulatedResult = runBayesianInference(network, {
    priorProbability: currentPrior,
    nodeStates: mergedStates
  });

  const delta = (simulatedResult.probabilidad_a_posteriori - currentResult.probabilidad_a_posteriori) * 100;

  return {
    nuevaProbabilidad: simulatedResult.probabilidad_a_posteriori,
    diferenciaPorcentual: Number(delta.toFixed(1)),
    estandarAlcanzado: simulatedResult.estandar_probatorio_alcanzado
  };
}
