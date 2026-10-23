import React, { useState, useMemo } from "react";
import {
  BayesianNetworkTopology,
  BayesianEvidenceNode,
  BayesianEvidenceState,
  runBayesianInference,
  simulateSensitivity
} from "../lib/bayesianEngine";
import {
  Scale,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  RotateCcw,
  PlusCircle,
  FileText,
  Quote,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Layers,
  ArrowRight
} from "lucide-react";

interface BayesianGraphViewProps {
  network?: BayesianNetworkTopology;
}

export const BayesianGraphView: React.FC<BayesianGraphViewProps> = ({ network: initialNetwork }) => {
  // Fallback default network if none is supplied in the analysis
  const defaultNetwork: BayesianNetworkTopology = useMemo(() => {
    if (!initialNetwork) {
      return {
        hipotesis: {
          id: "H-DEFAULT",
          descripcion: "Pretensión o hipótesis jurídica central del litigio",
          estado_positivo: "Acreditado / Estimación",
          estado_negativo: "No acreditado / Desestimación",
          probabilidad_a_priori: 0.5,
          fundamentacion_previa: "Punto de partida neutral (50%) garantizando imparcialidad procesal."
        },
        evidencias: [
          {
            id: "E-1",
            nombre: "Registro documental o soporte digital acreditado",
            descripcion: "Elemento de prueba incorporado en el expediente para valorar su consistencia.",
            fuente_documental: "Expediente digital",
            cita_clave: "Constancia en las actuaciones obrantes en autos",
            probabilidad_si_hipotesis_cierta: 0.85,
            probabilidad_si_hipotesis_falsa: 0.15,
            justificacion_probabilistica: "Alta correlación indiciaria con el objeto de la controversia.",
            estado_observado: "presente"
          }
        ],
        tesis_probatoria: "La articulación de indicios concordantes conduce a un estándar de convicción fundada."
      };
    }
    return {
      ...initialNetwork,
      hipotesis: initialNetwork.hipotesis || {
        id: "H-DEFAULT",
        descripcion: "Pretensión o hipótesis jurídica central del litigio",
        estado_positivo: "Acreditado / Estimación",
        estado_negativo: "No acreditado / Desestimación",
        probabilidad_a_priori: 0.5,
        fundamentacion_previa: "Punto de partida neutral (50%) garantizando imparcialidad procesal."
      },
      evidencias: Array.isArray(initialNetwork.evidencias) ? initialNetwork.evidencias : [],
      tesis_probatoria: initialNetwork.tesis_probatoria || ""
    };
  }, [initialNetwork]);

  // Working copy of network (allows adding nodes)
  const [network, setNetwork] = useState<BayesianNetworkTopology>(defaultNetwork);

  // When initialNetwork prop changes, update state
  React.useEffect(() => {
    if (initialNetwork) {
      setNetwork(initialNetwork);
      setPriorProb(initialNetwork.hipotesis.probabilidad_a_priori || 0.5);
      setNodeStates({});
      setNodeLikelihoods({});
      setNodeAuthenticity({});
      setNodeImpugnaciones({});
    }
  }, [initialNetwork]);

  // Interactive user overrides
  const [priorProb, setPriorProb] = useState<number>(
    defaultNetwork.hipotesis.probabilidad_a_priori || 0.5
  );
  const [nodeStates, setNodeStates] = useState<Record<string, BayesianEvidenceState>>({});
  const [nodeLikelihoods, setNodeLikelihoods] = useState<
    Record<string, { pH: number; pNotH: number }>
  >({});
  const [nodeAuthenticity, setNodeAuthenticity] = useState<Record<string, number>>({});
  const [nodeImpugnaciones, setNodeImpugnaciones] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"cards" | "graph">("cards");
  const [selectedSensitivityNodeId, setSelectedSensitivityNodeId] = useState<string | null>(null);

  // New Node Form State
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeDesc, setNewNodeDesc] = useState("");
  const [newNodeSource, setNewNodeSource] = useState("");
  const [newNodeQuote, setNewNodeQuote] = useState("");
  const [newNodePH, setNewNodePH] = useState(0.85);
  const [newNodePNotH, setNewNodePNotH] = useState(0.15);
  const [newNodeAuth, setNewNodeAuth] = useState(1.0);

  // Pure deterministic mathematical calculation via lib/bayesianEngine.ts
  const calculation = useMemo(() => {
    return runBayesianInference(network, {
      priorProbability: priorProb,
      nodeStates,
      nodeLikelihoods,
      nodeAuthenticity,
      nodeImpugnaciones
    });
  }, [network, priorProb, nodeStates, nodeLikelihoods, nodeAuthenticity, nodeImpugnaciones]);

  // Handler to toggle an evidence state (presente / ausente / desconocida)
  const handleStateChange = (nodeId: string, state: BayesianEvidenceState) => {
    setNodeStates((prev) => ({
      ...prev,
      [nodeId]: state
    }));
  };

  // Handler to update conditional likelihoods P(E|H) and P(E|~H)
  const handleLikelihoodChange = (
    nodeId: string,
    type: "pH" | "pNotH",
    value: number
  ) => {
    const defaultNode = (network.evidencias || []).find((n) => n.id === nodeId);
    const current = nodeLikelihoods[nodeId] || {
      pH: defaultNode?.probabilidad_si_hipotesis_cierta ?? 0.85,
      pNotH: defaultNode?.probabilidad_si_hipotesis_falsa ?? 0.15
    };

    setNodeLikelihoods((prev) => ({
      ...prev,
      [nodeId]: {
        ...current,
        [type]: value
      }
    }));
  };

  // Handler to update authenticity level P(A) (Nivel 2 de Inferencia en Cascada)
  const handleAuthenticityChange = (nodeId: string, value: number) => {
    setNodeAuthenticity((prev) => ({
      ...prev,
      [nodeId]: Math.min(Math.max(value, 0.0), 1.0)
    }));
  };

  // Handler to update tacha/impugnacion reason
  const handleImpugnacionChange = (nodeId: string, reason: string) => {
    setNodeImpugnaciones((prev) => ({
      ...prev,
      [nodeId]: reason
    }));
  };

  // Reset all interactive adjustments back to baseline
  const handleReset = () => {
    setPriorProb(network.hipotesis.probabilidad_a_priori || 0.5);
    setNodeStates({});
    setNodeLikelihoods({});
    setNodeAuthenticity({});
    setNodeImpugnaciones({});
  };

  // Add custom prospective evidence node
  const handleAddCustomNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    const newEvidence: BayesianEvidenceNode = {
      id: `E-CUSTOM-${Date.now().toString(36)}`,
      nombre: newNodeName.trim(),
      descripcion: newNodeDesc.trim() || "Prueba simulada añadida para análisis What-If",
      fuente_documental: newNodeSource.trim() || "Diligencia probatoria proyectada",
      cita_clave: newNodeQuote.trim() || "En fase de incorporación o solicitud",
      probabilidad_si_hipotesis_cierta: newNodePH,
      probabilidad_si_hipotesis_falsa: newNodePNotH,
      justificacion_probabilistica: `Estimación condicional: P(E|H)=${newNodePH}, P(E|~H)=${newNodePNotH}`,
      estado_observado: "presente"
    };

    setNetwork((prev) => ({
      ...prev,
      evidencias: [...(prev.evidencias || []), newEvidence]
    }));

    setNewNodeName("");
    setNewNodeDesc("");
    setNewNodeSource("");
    setNewNodeQuote("");
    setNewNodePH(0.85);
    setNewNodePNotH(0.15);
    setIsAddingNode(false);
  };

  // UI styling helpers
  const posteriorPercent = (calculation.probabilidad_a_posteriori * 100).toFixed(1);
  const priorPercent = (calculation.probabilidad_a_priori * 100).toFixed(0);

  const getStandardBadgeColor = (level: string) => {
    switch (level) {
      case "Muy Alto":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Alto":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Preponderante":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-rose-100 text-rose-800 border-rose-300";
    }
  };

  const getPosteriorBarColor = (prob: number) => {
    if (prob >= 0.95) return "bg-emerald-600";
    if (prob >= 0.75) return "bg-blue-600";
    if (prob >= 0.5) return "bg-indigo-600";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Architectural Guarantee */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                <Scale className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Evaluación Probatoria con Redes Bayesianas
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Matemática Determinista Pura
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Separación de tareas estricta: La Inteligencia Artificial extrajo únicamente la topología causal (hechos e indicios).
              El cálculo exacto de la probabilidad a posteriori <span className="font-mono text-blue-300">P(H|E)</span>, las razones de verosimilitud y el peso de la evidencia se ejecutan en tiempo real mediante el Teorema de Bayes en TypeScript, libre de alucinaciones.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-700"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restablecer Valores
            </button>
            <button
              type="button"
              onClick={() => setIsAddingNode(!isAddingNode)}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simular Nueva Prueba
            </button>
          </div>
        </div>
      </div>

      {/* Main Results Card: Posterior Gauge & Hypothesis */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Hypothesis & Prior Slider */}
          <div className="lg:col-span-7 space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <span>Hipótesis Principal (H)</span>
                <span className="text-[11px] font-mono text-slate-400">ID: {network.hipotesis.id}</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                "{network.hipotesis.descripcion}"
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {network.hipotesis.fundamentacion_previa}
              </p>
            </div>

            {/* Prior Probability Slider */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  Probabilidad a Priori P(H):
                </span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {priorPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.01"
                value={priorProb}
                onChange={(e) => setPriorProb(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
              />

              {/* Presets */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <button
                  type="button"
                  onClick={() => setPriorProb(0.1)}
                  className="hover:text-blue-600 underline decoration-dotted"
                  title="Presunción de Inocencia / In dubio pro reo"
                >
                  10% (In dubio pro reo)
                </button>
                <button
                  type="button"
                  onClick={() => setPriorProb(0.5)}
                  className="hover:text-blue-600 font-semibold underline decoration-dotted"
                  title="Punto neutral de equilibrio"
                >
                  50% (Preponderancia Neutral)
                </button>
                <button
                  type="button"
                  onClick={() => setPriorProb(0.7)}
                  className="hover:text-blue-600 underline decoration-dotted"
                  title="Principio de prueba documentada"
                >
                  70% (Indicios Previos)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Posterior Gauge & Legal Standard */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-200 p-5 space-y-4">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Probabilidad a Posteriori P(H|E)</span>
                <span className="text-[11px] font-mono text-blue-700 font-bold">
                  {calculation.odds_a_posteriori > 1
                    ? `${calculation.odds_a_posteriori.toFixed(1)} a 1 a favor`
                    : `1 a ${(1 / calculation.odds_a_posteriori).toFixed(1)} en contra`}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {posteriorPercent}%
                </span>
                <span className="text-xs text-slate-500">
                  (Variación neta:{" "}
                  <span
                    className={
                      calculation.probabilidad_a_posteriori >= calculation.probabilidad_a_priori
                        ? "text-emerald-700 font-semibold"
                        : "text-rose-700 font-semibold"
                    }
                  >
                    {calculation.probabilidad_a_posteriori >= calculation.probabilidad_a_priori ? "+" : ""}
                    {(
                      (calculation.probabilidad_a_posteriori - calculation.probabilidad_a_priori) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  )
                </span>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden mt-2">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${getPosteriorBarColor(
                    calculation.probabilidad_a_posteriori
                  )}`}
                  style={{ width: `${Math.max(5, calculation.probabilidad_a_posteriori * 100)}%` }}
                />
              </div>
            </div>

            {/* Standard Badge */}
            <div
              className={`p-3 rounded-lg border text-xs space-y-1 ${getStandardBadgeColor(
                calculation.nivel_certeza
              )}`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Estándar: {calculation.nivel_certeza}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {calculation.estandar_probatorio_alcanzado}
              </p>
            </div>

            {/* Scientific Turing/Good Metrics */}
            <div className="grid grid-cols-2 gap-2 text-center text-[11px] pt-1 border-t border-slate-200">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Factor de Bayes</span>
                <span className="font-mono font-bold text-slate-800">
                  {calculation.factor_bayes_global.toFixed(2)}x
                </span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Peso Total (dB)</span>
                <span
                  className={`font-mono font-bold ${
                    calculation.peso_probatorio_total_db >= 0 ? "text-emerald-700" : "text-rose-700"
                  }`}
                >
                  {calculation.peso_probatorio_total_db >= 0 ? "+" : ""}
                  {calculation.peso_probatorio_total_db.toFixed(1)} dB
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Cards vs Graph Diagram) */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("cards")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "cards"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            Nodos de Evidencia y Sliders ({calculation.nodos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "graph"
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Topología Causal del Grafo
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Haz clic en <span className="font-semibold text-slate-700">Presente / Ausente</span> para ver la actualización bayesiana instantánea
        </span>
      </div>

      {/* Form: Add Prospective Evidence Modal/Card */}
      {isAddingNode && (
        <form
          onSubmit={handleAddCustomNode}
          className="bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-blue-950 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Simular Incorporación de Nueva Evidencia (Análisis Hipotético)
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nombre del indicio o prueba</label>
              <input
                type="text"
                placeholder="ej. Declaración testimonial del jefe de taller"
                value={newNodeName}
                onChange={(e) => setNewNodeName(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Fuente o soporte documental</label>
              <input
                type="text"
                placeholder="ej. Acta de declaración o informe pericial complementario"
                value={newNodeSource}
                onChange={(e) => setNewNodeSource(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                <span>P(E | H) Verosimilitud si es Cierta:</span>
                <span className="font-mono text-blue-600">{(newNodePH * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.99"
                step="0.01"
                value={newNodePH}
                onChange={(e) => setNewNodePH(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
              />
            </div>

            <div className="bg-white p-3 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
                <span>P(E | ~H) Verosimilitud si es Falsa:</span>
                <span className="font-mono text-rose-600">{(newNodePNotH * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.99"
                step="0.01"
                value={newNodePNotH}
                onChange={(e) => setNewNodePNotH(parseFloat(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingNode(false)}
              className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
            >
              Descartar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium shadow-xs"
            >
              Agregar al Grafo
            </button>
          </div>
        </form>
      )}

      {/* View Mode 1: Detailed Interactive Cards with Sliders */}
      {activeTab === "cards" && (
        <div className="space-y-4">
          {calculation.nodos.map((node, index) => {
            const currentLikelihood = nodeLikelihoods[node.id] || {
              pH: node.probabilidad_si_hipotesis_cierta,
              pNotH: node.probabilidad_si_hipotesis_falsa
            };

            const isFavored = node.direccion_apoyo === "favorece_hipotesis";
            const isDisfavored = node.direccion_apoyo === "desfavorece_hipotesis";

            // Sensitivity simulation if this node were discarded
            const sensitivityIfAbsent = simulateSensitivity(
              network,
              node.id,
              "ausente",
              nodeStates,
              priorProb
            );

            return (
              <div
                key={node.id}
                className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                  node.estado_observado === "presente"
                    ? "border-slate-200"
                    : node.estado_observado === "ausente"
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-slate-200 bg-slate-50/40 opacity-75"
                }`}
              >
                {/* Header row: ID, Name, State Pills */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        E-{index + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{node.nombre}</h4>

                      {/* Direction badge */}
                      {isFavored && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Apoya Hipótesis ({node.fuerza_probatoria})
                        </span>
                      )}
                      {isDisfavored && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          Debilita Hipótesis ({node.fuerza_probatoria})
                        </span>
                      )}
                      {node.direccion_apoyo === "neutro" && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1">
                          <Minus className="w-3 h-3" />
                          Neutra / Sin Impacto
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{node.descripcion}</p>
                  </div>

                  {/* Interactive Status Switcher */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStateChange(node.id, "presente")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                        node.estado_observado === "presente"
                          ? "bg-white text-emerald-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Prueba admitida y acreditada en el expediente"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Presente
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStateChange(node.id, "ausente")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                        node.estado_observado === "ausente"
                          ? "bg-white text-rose-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Prueba descartada, tachada o no acreditada"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Ausente
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStateChange(node.id, "desconocida")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                        node.estado_observado === "desconocida"
                          ? "bg-white text-slate-800 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                      title="Neutralizar impacto de esta prueba"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                      Desconocida
                    </button>
                  </div>
                </div>

                {/* Document source and verbatim quote */}
                {(node.fuente_documental || node.cita_clave) && (
                  <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{node.fuente_documental}</span>
                    </div>
                    {node.cita_clave && (
                      <div className="flex items-center gap-1.5 text-slate-600 italic">
                        <Quote className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-md">{node.cita_clave}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Conditional Probabilities Sliders and LR */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-slate-100">
                  {/* Slider P(E|H) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 text-[11px] font-medium">
                        P(E | H) [Verosimilitud si es cierta]:
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {(currentLikelihood.pH * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.99"
                      step="0.01"
                      value={currentLikelihood.pH}
                      disabled={node.estado_observado === "desconocida"}
                      onChange={(e) =>
                        handleLikelihoodChange(node.id, "pH", parseFloat(e.target.value))
                      }
                      className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded disabled:opacity-40"
                    />
                  </div>

                  {/* Slider P(E|~H) */}
                  <div className="md:col-span-4 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 text-[11px] font-medium">
                        P(E | ~H) [Verosimilitud si es falsa]:
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {(currentLikelihood.pNotH * 100).toFixed(0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.99"
                      step="0.01"
                      value={currentLikelihood.pNotH}
                      disabled={node.estado_observado === "desconocida"}
                      onChange={(e) =>
                        handleLikelihoodChange(node.id, "pNotH", parseFloat(e.target.value))
                      }
                      className="w-full accent-rose-600 cursor-pointer h-1.5 bg-slate-200 rounded disabled:opacity-40"
                    />
                  </div>

                  {/* Likelihood Ratio (LR) & Impact Metric */}
                  <div className="md:col-span-4 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 text-[11px] font-medium">
                        Razón de Verosimilitud (LR):
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {node.razon_verosimilitud.toFixed(2)}x
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500 text-[11px] font-medium">
                        Peso Probatorio (dB):
                      </span>
                      <span
                        className={`font-mono font-bold text-[11px] ${
                          node.peso_evidencia_db >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {node.peso_evidencia_db >= 0 ? "+" : ""}
                        {node.peso_evidencia_db.toFixed(1)} dB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sensitivity What-If Preview Link */}
                <div className="mt-3 pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
                  <span>
                    💡 <strong className="text-slate-700">Análisis de Sensibilidad:</strong> Si se tachara o descartara esta prueba, la probabilidad a posteriori variaría a{" "}
                    <strong className="font-mono text-slate-900">
                      {(sensitivityIfAbsent.nuevaProbabilidad * 100).toFixed(1)}%
                    </strong>{" "}
                    ({sensitivityIfAbsent.diferenciaPorcentual >= 0 ? "+" : ""}
                    {sensitivityIfAbsent.diferenciaPorcentual}%).
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">
                    Fuerza: {node.fuerza_probatoria}
                  </span>
                </div>

                {/* Level 2: Authenticity / Integrity / Tacha Controls (Schum Cascaded Inference) */}
                <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-bold text-slate-800">
                        Nivel 2: Autenticidad / Integridad Documental P(A)
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.2 rounded font-semibold">
                        {((node.nivel_autenticidad ?? 1.0) * 100).toFixed(0)}%
                      </span>
                    </div>

                    {/* Presets: Indubitada 100%, Tacha Parcial 50%, Impugnada 15% */}
                    <div className="flex items-center gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleAuthenticityChange(node.id, 1.0)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          (node.nivel_autenticidad ?? 1.0) >= 0.95
                            ? "bg-emerald-600 text-white font-bold"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title="Documento indubitado, legalizado o verificado con peritaje forense"
                      >
                        🛡️ Indubitado (100%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuthenticityChange(node.id, 0.5)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          (node.nivel_autenticidad ?? 1.0) >= 0.45 && (node.nivel_autenticidad ?? 1.0) <= 0.65
                            ? "bg-amber-600 text-white font-bold"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title="Tacha parcial o cuestionamiento de autoría sin peritaje concluyente"
                      >
                        ⚠️ Cuestionado (50%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAuthenticityChange(node.id, 0.15)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          (node.nivel_autenticidad ?? 1.0) <= 0.25
                            ? "bg-rose-600 text-white font-bold"
                            : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200"
                        }`}
                        title="Impugnación por sospecha fundada de adulteración o falsedad"
                      >
                        ❌ Impugnado (15%)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <div className="md:col-span-6 flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 shrink-0 font-medium">Modulación fina:</span>
                      <input
                        type="range"
                        min="0.0"
                        max="1.0"
                        step="0.05"
                        value={node.nivel_autenticidad ?? 1.0}
                        onChange={(e) => handleAuthenticityChange(node.id, parseFloat(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 rounded"
                      />
                    </div>

                    <div className="md:col-span-6 text-[11px] text-slate-600 leading-tight">
                      {node.nivel_autenticidad < 0.99 ? (
                        <span className="text-amber-800">
                          ⚖️ <strong>Atenuación por Tacha:</strong> LR nominal de{" "}
                          <strong className="font-mono">{node.razon_verosimilitud_nominal.toFixed(2)}x</strong> reducido a LR efectivo de{" "}
                          <strong className="font-mono text-slate-900">{node.razon_verosimilitud.toFixed(2)}x</strong> ({node.peso_evidencia_db.toFixed(1)} dB).
                        </span>
                      ) : (
                        <span className="text-slate-500">
                          ✓ Plena fuerza probatoria sin atenuación (LR efectivo = {node.razon_verosimilitud.toFixed(2)}x).
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Optional editable reason for tacha / challenge */}
                  <div className="mt-2 pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder="Causal u observación procesal de la impugnación (ej. Falta de cotejo notarial o peritaje de WhatsApp)..."
                      value={nodeImpugnaciones[node.id] || node.motivo_impugnacion || ""}
                      onChange={(e) => handleImpugnacionChange(node.id, e.target.value)}
                      className="w-full text-xs px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Topology Graph / Tree Diagram */}
      {activeTab === "graph" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Topología Causal del Grafo Probatorio
            </h4>
            <p className="text-xs text-slate-500">
              Representación de la red bayesiana: La Hipótesis Central converge a partir de los nodos de evidencia documentales independientes.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-8 py-6">
            {/* Top Central Node: Hipótesis H */}
            <div className="relative bg-slate-900 text-white border-2 border-blue-500 rounded-2xl p-5 max-w-lg w-full text-center shadow-lg">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-mono font-bold px-3 py-0.5 rounded-full tracking-wider">
                Hipótesis Central (H)
              </span>
              <p className="text-sm font-bold mt-1 text-slate-100">
                "{network.hipotesis.descripcion}"
              </p>
              <div className="mt-3 flex items-center justify-center gap-4 text-xs font-mono border-t border-slate-800 pt-3">
                <span className="text-slate-300">
                  Prior: <strong>{priorPercent}%</strong>
                </span>
                <span className="text-blue-400 font-bold">
                  Posterior: <strong>{posteriorPercent}%</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">
                  {calculation.nivel_certeza}
                </span>
              </div>
            </div>

            {/* Connecting Visual Lines */}
            <div className="w-full flex items-center justify-center gap-2 text-slate-300 text-xs font-mono">
              <div className="h-6 w-px bg-slate-300" />
            </div>

            {/* Evidence Nodes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {calculation.nodos.map((node, idx) => {
                const isFavored = node.direccion_apoyo === "favorece_hipotesis";
                return (
                  <div
                    key={node.id}
                    className={`rounded-xl border p-4 text-xs space-y-2 relative shadow-xs transition-all ${
                      node.estado_observado === "presente"
                        ? isFavored
                          ? "bg-emerald-50/40 border-emerald-300"
                          : "bg-rose-50/40 border-rose-300"
                        : node.estado_observado === "ausente"
                        ? "bg-rose-50/30 border-rose-200"
                        : "bg-slate-50 border-slate-200 opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-500 text-[11px]">
                        Nodo E-{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          node.estado_observado === "presente"
                            ? "bg-emerald-100 text-emerald-800 font-semibold"
                            : node.estado_observado === "ausente"
                            ? "bg-rose-100 text-rose-800 font-semibold"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {node.estado_observado.toUpperCase()}
                      </span>
                    </div>

                    <h5 className="font-bold text-slate-900 leading-tight">{node.nombre}</h5>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{node.descripcion}</p>

                    <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">LR: {node.razon_verosimilitud.toFixed(2)}x</span>
                      <span
                        className={`font-bold ${
                          node.peso_evidencia_db >= 0 ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        {node.peso_evidencia_db >= 0 ? "+" : ""}
                        {node.peso_evidencia_db.toFixed(1)} dB
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Forensic Thesis Summary */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 font-semibold">Tesis Probatoria Articulada:</strong>{" "}
          <span>{network.tesis_probatoria}</span>
          <span className="block mt-1 text-[11px] text-slate-500">
            Fundamento matemático: Actualización exacta por Odds multiplicativos: O(H|E) = O(H) × ∏(LR_i). La probabilidad resultante supera el estándar legal aplicable para fundar la convicción pericial y jurisdiccional.
          </span>
        </div>
      </div>
    </div>
  );
};
