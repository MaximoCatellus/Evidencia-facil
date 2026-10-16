import React from "react";
import { Scale, ShieldCheck, FileSearch, Sparkles, BookOpen, Download } from "lucide-react";

interface HeaderProps {
  onLoadSample: (caseId: string) => void;
  activeCaseId?: string;
  hasAnalysis: boolean;
  onNewAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  activeCaseId,
  hasAnalysis,
  onNewAnalysis
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 print:hidden">
      {/* Top Legal Ethics & Disclaimer Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-1.5 text-xs font-normal">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong className="text-white font-medium">Principio de Transparencia y Trazabilidad Forense:</strong> Esta herramienta organiza información fáctica y no emite juicios de valor ni sustituye el criterio legal o judicial.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Auditabilidad 1:1</span>
            <span aria-hidden="true">·</span>
            <span>Gemini AI E-Discovery</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-sm">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">EvidenciaFácil</span>
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">Democratizador E-Discovery</span>
            </div>
            <p className="text-xs text-slate-500">
              Cronología procesal, detección de contradicciones y vacíos probatorios
            </p>
          </div>
        </div>

        {/* Quick Sample Pickers & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 hidden md:inline">Cargar caso de prueba:</span>
          
          <button
            type="button"
            onClick={() => onLoadSample("disputa-contractual")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors border ${
              activeCaseId === "disputa-contractual"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            📋 Disputa Contrato & Chat
          </button>

          <button
            type="button"
            onClick={() => onLoadSample("caso-laboral")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors border ${
              activeCaseId === "caso-laboral"
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            ⚖️ Despido & Horas Extra
          </button>

          {hasAnalysis && (
            <button
              type="button"
              onClick={onNewAnalysis}
              className="ml-1 text-xs px-3 py-1.5 rounded-md font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              + Nuevo Análisis
            </button>
          )}

          {/* Direct Download ZIP button */}
          <a
            href="/api/download-zip"
            download="evidencia-facil-proyecto.zip"
            className="ml-1 text-xs px-3 py-1.5 rounded-md font-medium bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-300 inline-flex items-center gap-1.5 shadow-2xs"
            title="Descargar todos los archivos del proyecto comprimidos en .ZIP"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Descargar Código (.ZIP)</span>
          </a>
        </div>
      </div>
    </header>
  );
};
