import React, { useMemo } from "react";
import {
  ArgumentGraph,
  ArgumentNode,
  buildArgumentGraphFromAnalysis
} from "../lib/argumentGraph";
import {
  GitFork,
  CheckCircle2,
  AlertTriangle,
  Scale,
  FileText,
  Info,
  ShieldCheck
} from "lucide-react";
import { AnalysisResult } from "../types/ediscovery";

interface ArgumentGraphViewProps {
  analysis: AnalysisResult;
}

export const ArgumentGraphView: React.FC<ArgumentGraphViewProps> = ({ analysis }) => {
  const graph: ArgumentGraph = useMemo(() => {
    const rawHypothesis = analysis.red_bayesiana?.hipotesis || {
      descripcion: analysis.resumen_caso?.titulo_caso || "Pretensión jurídica objeto de debate",
      id: "H-MAIN"
    };

    const rawBayesianEvidence = analysis.red_bayesiana?.evidencias || [];
    const contradictions = analysis.contradicciones || [];

    return buildArgumentGraphFromAnalysis(
      rawHypothesis,
      analysis.cronologia || [],
      rawBayesianEvidence,
      contradictions
    );
  }, [analysis]);

  const premises: ArgumentNode[] = graph.nodos.filter((n: ArgumentNode) => n.tipo === "premisa_factica");
  const objections: ArgumentNode[] = graph.nodos.filter((n: ArgumentNode) => n.tipo === "objecion_contraparte");
  const warrants: ArgumentNode[] = graph.nodos.filter((n: ArgumentNode) => n.tipo === "garantia_legal");

  const getRobustnessBar = (score: number) => {
    if (score >= 80) return "bg-emerald-600";
    if (score >= 55) return "bg-blue-600";
    return "bg-rose-500";
  };

  return (
    <div className="space-y-6">
      {/* Dialectical Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                <GitFork className="w-5 h-5" />
              </span>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Grafo Argumentativo (Esquema Dialéctico de Toulmin)
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  Algoritmo Determinista en Cliente
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Mapeo de la pretensión procesal frente a sus premisas fácticas acreditadas, garantías de inferencia jurídica y excepciones u objeciones de la contraparte.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-center shrink-0 min-w-[170px]">
            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5">
              Solidez Argumental
            </span>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="text-2xl font-black font-mono text-white">
                {graph.indiceSolidez}%
              </span>
              <span className="text-xs text-indigo-300 font-semibold">
                {graph.indiceSolidez >= 80 ? "Sólida" : graph.indiceSolidez >= 55 ? "Favorable" : "Vulnerable"}
              </span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getRobustnessBar(graph.indiceSolidez)}`}
                style={{ width: `${graph.indiceSolidez}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Claim */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span className="flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-indigo-600" />
            Pretensión Principal / Conclusión Jurídica (Claim)
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[10px]">
            Objeto del Litigio
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-900 leading-snug">
          "{graph.conclusionPrincipal.contenido}"
        </h3>

        <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <p>{graph.resumenDialectico}</p>
        </div>
      </div>

      {/* Premises and Objections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Premises */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Premisas Fácticas Probadas ({premises.length})
            </h4>
            <span className="text-[11px] text-slate-500">Hechos que sustentan la pretensión</span>
          </div>

          <div className="space-y-3">
            {premises.map((p: ArgumentNode, idx: number) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Premisa P-{idx + 1}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Soporta Pretensión (+{(p.peso * 100).toFixed(0)}%)
                  </span>
                </div>

                <h5 className="text-xs font-bold text-slate-900">{p.titulo}</h5>
                <p className="text-xs text-slate-600 leading-relaxed">{p.contenido}</p>

                {p.fuenteDocumental && (
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Fuente documental: <strong>{p.fuenteDocumental}</strong></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Warrants and Objections */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-3">
            <div className="border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Garantía de Inferencia Legal (Warrant)
              </h4>
            </div>

            {warrants.map((w: ArgumentNode) => (
              <div key={w.id} className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs space-y-1.5">
                <span className="font-bold text-blue-950 block">{w.titulo}</span>
                <p className="text-blue-900 leading-relaxed">{w.contenido}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Objeciones de la Contraparte ({objections.length})
              </h4>
              <span className="text-[11px] text-slate-500">Puntos de excepción</span>
            </div>

            {objections.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 text-center">
                No se detectaron objeciones o contradicciones documentadas en el acervo aportado.
              </div>
            ) : (
              objections.map((obj: ArgumentNode, idx: number) => (
                <div
                  key={obj.id}
                  className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                      Objeción O-{idx + 1}
                    </span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      Riesgo de Refutación
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-900">{obj.titulo}</h5>
                  <p className="text-xs text-slate-600 leading-relaxed">{obj.contenido}</p>

                  {obj.fuenteDocumental && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      Cotejo: {obj.fuenteDocumental}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
