import React from "react";
import { X, FileText, Quote, Calendar, User, ShieldCheck, Copy, Check } from "lucide-react";
import { TimelineEvent, UploadedFile } from "../types/ediscovery";

interface DocumentModalProps {
  event: TimelineEvent | null;
  uploadedFiles: UploadedFile[];
  onClose: () => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  event,
  uploadedFiles,
  onClose
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!event) return null;

  // Find corresponding uploaded file if available
  const matchingFile = uploadedFiles.find(
    (f) => f.name.toLowerCase() === event.fuente_documental.toLowerCase()
  );

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(`"${event.cita_o_referencia}"`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                Trazabilidad Documental 1:1
              </span>
              <h3 className="text-sm font-bold text-slate-900 truncate max-w-md">
                {event.fuente_documental}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Linked Fact Card */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-mono font-semibold text-slate-800">
                  {event.fecha_hora}
                </span>
                <span aria-hidden="true">·</span>
                <span>{event.tipo_evento}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Ref: {event.id}
              </span>
            </div>

            <h4 className="text-sm font-bold text-slate-900 mb-2">
              {event.hecho}
            </h4>

            {event.personas_involucradas && event.personas_involucradas.length > 0 && (
              <div className="flex items-center gap-1.5 text-slate-600 mt-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Intervinientes: {event.personas_involucradas.join(", ")}</span>
              </div>
            )}
          </div>

          {/* Literal Quotation with Copy Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-slate-500" />
                Cita Textual Extraída del Soporte
              </label>

              <button
                type="button"
                onClick={handleCopyQuote}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Copiada</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copiar Cita</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-50/40 border border-amber-200/60 font-serif italic text-slate-800 leading-relaxed text-xs">
              "{event.cita_o_referencia}"
            </div>
          </div>

          {/* Procedural Analysis */}
          {event.analisis_procesal && (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                Pertinencia Procesal
              </label>
              <p className="text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                {event.analisis_procesal}
              </p>
            </div>
          )}

          {/* Document Content / Preview if file exists */}
          {matchingFile && (
            <div>
              <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
                Contenido del Archivo Aportado ({matchingFile.name})
              </label>

              {matchingFile.previewUrl ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 flex justify-center">
                  <img
                    src={matchingFile.previewUrl}
                    alt={matchingFile.name}
                    className="max-h-72 object-contain"
                  />
                </div>
              ) : matchingFile.textContent ? (
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {matchingFile.textContent}
                </pre>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 text-center">
                  Documento binario anexado al expediente digital ({matchingFile.size} bytes).
                </div>
              )}
            </div>
          )}

          {/* Forensic Integrity Banner */}
          <div className="p-3 bg-slate-100 rounded-lg flex items-center gap-2.5 text-slate-600 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              La trazabilidad documental 1:1 asegura que cada afirmación del informe pericial remite a una prueba existente sin alucinaciones.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
};
