import React from "react";
import { AlertCircle, ArrowRightLeft, FileQuestion, ShieldAlert, Sparkles } from "lucide-react";
import { Contradiction } from "../types/ediscovery";

interface ContradictionsViewProps {
  contradictions: Contradiction[];
}

export const ContradictionsView: React.FC<ContradictionsViewProps> = ({
  contradictions
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Detección de Contradicciones e Inconsistencias Fácticas</span>
                <span className="text-xs font-normal text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {contradictions.length} identificadas
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Puntos donde dos o más documentos probatorios se oponen o desmienten recíprocamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contradictions List */}
      {contradictions.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No se detectaron contradicciones sustanciales entre los documentos aportados.
        </div>
      ) : (
        <div className="space-y-6">
          {contradictions.map((c) => (
            <div
              key={c.id}
              className="border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Header card with severity */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700">
                    {c.id}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <h3 className="text-sm font-bold text-slate-900">{c.titulo}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="text-slate-400">Gravedad Probatoria:</span>
                  <span
                    className={
                      c.nivel_gravedad === "Crítica"
                        ? "text-rose-700 font-bold"
                        : c.nivel_gravedad === "Moderada"
                        ? "text-amber-700 font-semibold"
                        : "text-blue-700 font-semibold"
                    }
                  >
                    {c.nivel_gravedad}
                  </span>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Version A */}
                  <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-200/60 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
                        Versión / Documento A
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {c.hecho_a.autor_o_parte}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-serif italic mb-3">
                      "{c.hecho_a.declaracion}"
                    </p>

                    <div className="pt-2 border-t border-amber-200/50 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="text-slate-400">Fuente:</span>
                      <span className="font-mono text-slate-700 font-medium truncate max-w-[200px]" title={c.hecho_a.fuente}>
                        {c.hecho_a.fuente}
                      </span>
                    </div>
                  </div>

                  {/* Version B */}
                  <div className="p-4 rounded-lg bg-rose-50/40 border border-rose-200/60 relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-rose-900 uppercase tracking-wider">
                        Versión Opuesta / Documento B
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {c.hecho_b.autor_o_parte}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 leading-relaxed font-serif italic mb-3">
                      "{c.hecho_b.declaracion}"
                    </p>

                    <div className="pt-2 border-t border-rose-200/50 text-[11px] text-slate-500 flex items-center justify-between">
                      <span className="text-slate-400">Fuente:</span>
                      <span className="font-mono text-slate-700 font-medium truncate max-w-[200px]" title={c.hecho_b.fuente}>
                        {c.hecho_b.fuente}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Forensic Discrepancy analysis */}
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                  <div className="text-xs">
                    <strong className="text-slate-800 font-semibold block mb-0.5">
                      Análisis Pericial de la Inconsistencia:
                    </strong>
                    <p className="text-slate-600 leading-relaxed">{c.explicacion_discrepancia}</p>
                  </div>

                  <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <strong className="text-blue-900 font-semibold block mb-0.5">
                      Impacto Procesal y Teoría del Caso:
                    </strong>
                    <p className="text-slate-700 leading-relaxed">{c.impacto_procesal}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
