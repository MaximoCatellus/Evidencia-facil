import React from "react";
import { Scale, ShieldCheck, FileText, BookOpen, MessageSquarePlus } from "lucide-react";

interface HeaderProps {
  onLoadSample: (caseId: string) => void;
  activeCaseId?: string;
  hasAnalysis: boolean;
  onNewAnalysis: () => void;
  onOpenJudicialReport?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenGuide?: () => void;
  onOpenFeedback?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSample,
  activeCaseId,
  hasAnalysis,
  onNewAnalysis,
  onOpenJudicialReport,
  onOpenPrivacyPolicy,
  onOpenGuide,
  onOpenFeedback
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-30 print:hidden">
      {/* Top Legal Ethics & Disclaimer Banner */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs font-normal border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              🇵🇪 Ley N° 29733 (Perú)
            </span>
            <span>
              <strong className="text-white font-medium">Privacidad Total:</strong> Tus archivos y chats <strong>NO se envían a ningún servidor privado</strong> y el administrador <strong>NO tiene forma de verlos</strong>.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-300 shrink-0">
            {onOpenPrivacyPolicy && (
              <button
                type="button"
                onClick={onOpenPrivacyPolicy}
                className="text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer transition-colors"
              >
                Garantía Ley 29733
              </button>
            )}
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Procesamiento Local</span>
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
            <>
              {onOpenJudicialReport && (
                <button
                  type="button"
                  onClick={onOpenJudicialReport}
                  className="ml-1 text-xs px-3 py-1.5 rounded-md font-semibold bg-amber-400 hover:bg-amber-500 text-slate-950 transition-colors shadow-2xs inline-flex items-center gap-1.5"
                  title="Abrir Dictamen Pericial Judicial completo con modelado bayesiano y cadena de custodia"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Dictamen Pericial</span>
                </button>
              )}

              <button
                type="button"
                onClick={onNewAnalysis}
                className="text-xs px-3 py-1.5 rounded-md font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                + Nuevo Análisis
              </button>
            </>
          )}

          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="text-xs px-3 py-1.5 rounded-md font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-300 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Abrir Guía Metodológica, explicación de evaluación bayesiana y manual de uso"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Guía de Uso</span>
            </button>
          )}

          {onOpenFeedback && (
            <button
              type="button"
              onClick={onOpenFeedback}
              className="text-xs px-3 py-1.5 rounded-md font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Dejar sugerencias anónimas o responder la encuesta para mejorar el sistema"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Sugerencias</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
