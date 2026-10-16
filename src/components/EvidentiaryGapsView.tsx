import React from "react";
import { AlertTriangle, Compass, ShieldQuestion, ArrowUpRight } from "lucide-react";
import { EvidentiaryGap } from "../types/ediscovery";

interface EvidentiaryGapsViewProps {
  gaps: EvidentiaryGap[];
}

export const EvidentiaryGapsView: React.FC<EvidentiaryGapsViewProps> = ({
  gaps
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header */}
      <div className="pb-5 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldQuestion className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Vacíos Probatorios y Hechos sin Respaldo</span>
              <span className="text-xs font-normal text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                {gaps.length} puntos de vulnerabilidad
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Hechos alegados, ventanas temporales huérfanas de prueba y diligencias procesales sugeridas para sanear la teoría del caso.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of gaps */}
      {gaps.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No se detectaron vacíos probatorios críticos en la documentación analizada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="border border-slate-200 rounded-xl p-5 bg-white hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header: ID & Priority */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    {gap.id}
                  </span>
                  <span
                    className={`text-xs font-semibold ${
                      gap.prioridad === "Alta"
                        ? "text-rose-700"
                        : gap.prioridad === "Media"
                        ? "text-amber-700"
                        : "text-blue-700"
                    }`}
                  >
                    Prioridad {gap.prioridad}
                  </span>
                </div>

                {/* Description */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                  {gap.descripcion}
                </h3>

                {/* Period or fact affected */}
                <div className="mb-3 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Ventana Afectada: </span>
                  {gap.hecho_o_periodo_afectado}
                </div>

                {/* Procedural risk */}
                <div className="p-2.5 rounded-lg bg-rose-50/50 border border-rose-100 text-xs text-rose-900 mb-3">
                  <span className="font-semibold block mb-0.5">Riesgo Procesal:</span>
                  {gap.riesgo_procesal}
                </div>
              </div>

              {/* Action / Diligence recommendation */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-1.5 text-xs text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">
                      Diligencia Probatoria Sugerida:
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {gap.diligencia_o_prueba_sugerida}
                    </p>
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
