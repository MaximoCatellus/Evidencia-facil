/**
 * @file src/lib/argumentGraph.ts
 * @description Estructuración y cálculo de grafos argumentativos jurídicos (Esquema de Toulmin / Walton).
 */

export type ArgumentNodeType =
  | "conclusion"
  | "premisa_factica"
  | "garantia_legal"
  | "respaldo_normativo"
  | "objecion_contraparte";

export interface ArgumentNode {
  id: string;
  tipo: ArgumentNodeType;
  titulo: string;
  contenido: string;
  fuenteDocumental?: string;
  estado: "acreditado" | "controvertido" | "desvirtuado" | "hipotetico";
  peso: number;
}

export interface ArgumentEdge {
  id: string;
  origenId: string;
  destinoId: string;
  relacion: "soporta" | "refuta" | "garantiza" | "respalda" | "condiciona";
  fuerza: "Concluyente" | "Fuerte" | "Moderada" | "Débil";
}

export interface ArgumentGraph {
  conclusionPrincipal: ArgumentNode;
  nodos: ArgumentNode[];
  aristas: ArgumentEdge[];
  indiceSolidez: number;
  resumenDialectico: string;
}

export function buildArgumentGraphFromAnalysis(
  hipotesis: { descripcion: string; id?: string },
  _hechos: Array<{ id: string; hecho: string; fuente_documental: string; cita_o_referencia?: string }>,
  evidenciasBayesianas: Array<{
    id: string;
    nombre: string;
    descripcion: string;
    fuente_documental: string;
    estado_observado: string;
    probabilidad_si_hipotesis_cierta: number;
    probabilidad_si_hipotesis_falsa: number;
  }>,
  contradicciones?: Array<{
    id: string;
    titulo: string;
    hecho_a: { declaracion: string; fuente: string };
    hecho_b: { declaracion: string; fuente: string };
    explicacion_discrepancia: string;
  }>
): ArgumentGraph {
  const nodos: ArgumentNode[] = [];
  const aristas: ArgumentEdge[] = [];

  const conclusionNode: ArgumentNode = {
    id: "ARG-CLAIM-1",
    tipo: "conclusion",
    titulo: "Pretensión Principal",
    contenido: hipotesis.descripcion || "Pretensión jurídica objeto de debate procesal",
    estado: "acreditado",
    peso: 1.0
  };
  nodos.push(conclusionNode);

  const warrantNode: ArgumentNode = {
    id: "ARG-WARRANT-1",
    tipo: "garantia_legal",
    titulo: "Regla de Inferencia Probatoria",
    contenido:
      "La concurrencia armónica y unívoca de documentos auténticos y comunicaciones fehacientes acredita la veracidad de la pretensión (Principio de libre valoración de la sana crítica).",
    estado: "acreditado",
    peso: 0.95
  };
  nodos.push(warrantNode);

  aristas.push({
    id: "EDGE-WARRANT-1",
    origenId: warrantNode.id,
    destinoId: conclusionNode.id,
    relacion: "garantiza",
    fuerza: "Fuerte"
  });

  let activeSupportersCount = 0;
  evidenciasBayesianas.forEach((ev, idx) => {
    const isSupporter =
      ev.probabilidad_si_hipotesis_cierta > ev.probabilidad_si_hipotesis_falsa;
    const isPresent = ev.estado_observado === "presente";

    const premiseNode: ArgumentNode = {
      id: `ARG-PREMISE-${idx + 1}`,
      tipo: "premisa_factica",
      titulo: ev.nombre,
      contenido: ev.descripcion,
      fuenteDocumental: ev.fuente_documental,
      estado: isPresent ? "acreditado" : "desvirtuado",
      peso: isPresent ? (isSupporter ? 0.85 : 0.3) : 0.1
    };
    nodos.push(premiseNode);

    if (isPresent && isSupporter) {
      activeSupportersCount++;
    }

    aristas.push({
      id: `EDGE-PREMISE-${idx + 1}`,
      origenId: premiseNode.id,
      destinoId: conclusionNode.id,
      relacion: isSupporter && isPresent ? "soporta" : "refuta",
      fuerza: isPresent ? "Fuerte" : "Débil"
    });
  });

  if (contradicciones && contradicciones.length > 0) {
    contradicciones.forEach((c, idx) => {
      const objectionNode: ArgumentNode = {
        id: `ARG-REBUTTAL-${idx + 1}`,
        tipo: "objecion_contraparte",
        titulo: `Discrepancia: ${c.titulo}`,
        contenido: c.explicacion_discrepancia,
        fuenteDocumental: `${c.hecho_a.fuente} vs. ${c.hecho_b.fuente}`,
        estado: "controvertido",
        peso: 0.7
      };
      nodos.push(objectionNode);

      aristas.push({
        id: `EDGE-REBUTTAL-${idx + 1}`,
        origenId: objectionNode.id,
        destinoId: conclusionNode.id,
        relacion: "refuta",
        fuerza: "Moderada"
      });
    });
  }

  const totalPremises = evidenciasBayesianas.length || 1;
  const supportRatio = activeSupportersCount / totalPremises;
  const objectionsPenalty = (contradicciones?.length || 0) * 8;
  const rawScore = Math.max(10, Math.min(98, Math.round(supportRatio * 90 + 10 - objectionsPenalty)));

  let resumenDialectico = "";
  if (rawScore >= 80) {
    resumenDialectico = "Estructura argumental sólida: premisas fácticas congruentes con escasas o refutadas objeciones de la contraparte.";
  } else if (rawScore >= 55) {
    resumenDialectico = "Estructura argumental preponderante: convicción positiva susceptible de debate en puntos específicos de contradicción.";
  } else {
    resumenDialectico = "Estructura argumental vulnerable: insuficiencia probatoria o presencia de excepciones no neutralizadas.";
  }

  return {
    conclusionPrincipal: conclusionNode,
    nodos,
    aristas,
    indiceSolidez: rawScore,
    resumenDialectico
  };
}
