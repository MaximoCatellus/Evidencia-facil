import React from "react";
import { Briefcase, Calendar, Users, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { CaseSummary, AnalysisMetadata } from "../types/ediscovery";

interface ExecutiveSummaryProps {
  summary: CaseSummary;
  metadata: AnalysisMetadata;
  recommendations: string[];
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  summary,
  metadata,
  recommendations
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Title & Temporal Span */}
      <div className="border-b border-slate-100 pb-5 mb-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Auditoría Forense Digital · Dictamen E-Discovery
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {summary.titulo_caso}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2 shrink-0">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div>
              <span className="block text-[10px] text-slate-400 uppercase">Periodo Documentado</span>
              <span className="font-medium text-slate-800">
                {summary.periodo_temporal.inicio} — {summary.periodo_temporal.fin}
              </span>
            </div>
          </div>
        </div>

        {/* Executive summary narrative */}
        <p className="mt-4 text-sm text-slate-700 leading-relaxed font-normal bg-slate-50/50 p-4 rounded-lg border border-slate-100">
          {summary.resumen_ejecutivo}
        </p>
      </div>

      {/* Grid: Parties & Evidence Quality Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Parties (2 columns on large screen) */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Partes e Intervinientes Identificados ({summary.partes_identificadas.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {summary.partes_identificadas.map((party, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg border border-slate-200/90 bg-slate-50/40 hover:bg-white transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-900">{party.nombre}</span>
                  <span className="text-[11px] text-blue-700 font-medium">{party.rol}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{party.detalles}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Forensic Metadata & Integrity Notice */}
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Calidad Probatoria
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Folios/Archivos:</span>
                <span className="font-semibold text-slate-800">{metadata.total_documentos} documentos</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Valoración Global:</span>
                <span className="font-semibold text-emerald-700">{metadata.calidad_evidencia}</span>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-600 bg-amber-50/80 border border-amber-200/60 p-2.5 rounded text-left">
              <span className="font-medium text-amber-900 block mb-0.5">Nota de Integridad Procesal:</span>
              {metadata.alerta_integridad}
            </div>
          </div>
        </div>
      </div>

      {/* Legal & Procedural Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
            Estrategia Probatoria Recomendada para Litigación
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {recommendations.map((rec, i) => (
              <li
                key={i}
                className="text-xs text-slate-700 bg-white border border-slate-200/80 rounded-md p-2.5 flex items-start gap-2"
              >
                <span className="font-bold text-slate-400 shrink-0 text-[11px]">{i + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
