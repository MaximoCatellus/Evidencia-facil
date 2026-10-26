import React from "react";
import { Scale, ShieldCheck, FileText, BookOpen, MessageSquarePlus } from "lucide-react";

interface HeaderProps {
  onLoadSample: (caseId: string) => void;
  activeCaseId?: string;
  hasAnalysis: boolean;
  onNewAnalysis: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenGuide?: () => void;
  onOpenFeedback?: () => void;
  onOpenExpedienteCleaner?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasAnalysis,
  onNewAnalysis,
  onOpenPrivacyPolicy,
  onOpenGuide,
  onOpenFeedback,
  onOpenExpedienteCleaner
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 print:hidden">
      {/* Sleek, uncluttered Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">EvidenciaFácil</span>
              <span className="text-[10px] sm:text-[11px] font-mono text-slate-600 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                Herramienta de Guía
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Organización cronológica de pruebas, cotejo documental y detección de contradicciones
            </p>
          </div>
        </div>

        {/* Compact, purposeful controls */}
        <div className="flex items-center gap-2.5">
          {/* Subtle Privacy Badge */}
          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Cumplimiento estricto Ley N° 29733 (Perú). Cero servidores privados."
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Memoria Local · Ley 29733</span>
            </button>
          )}

          {onOpenExpedienteCleaner && (
            <button
              type="button"
              onClick={onOpenExpedienteCleaner}
              className="text-xs px-2.5 py-1.5 rounded-lg font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Módulo de Pre-procesamiento y Depuración de Expedientes Voluminosos (>50MB)"
            >
              <span>⚡ Depurar Tomos (&gt;50MB)</span>
            </button>
          )}

          {hasAnalysis && (
            <button
              type="button"
              onClick={onNewAnalysis}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs inline-flex items-center gap-1 cursor-pointer"
            >
              <span>+ Nuevo Expediente</span>
            </button>
          )}



          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              title="Guía de uso y metodología"
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Guía</span>
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
              title="Buzón de sugerencias y comentarios"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Sugerencias</span>
            </button>
          )}

          {/* Discreet GitHub Repository Link */}
          <a
            href="https://github.com/MaximoCatellus/Evidencia-facil"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-2.5 py-1.5 rounded-lg font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer"
            title="Ver código fuente en GitHub (MaximoCatellus/Evidencia-facil)"
            aria-label="Repositorio de código en GitHub"
          >
            <svg className="w-3.5 h-3.5 fill-current text-slate-700" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
