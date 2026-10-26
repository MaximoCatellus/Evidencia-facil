import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  File,
  X,
  Plus,
  Play,
  AlertCircle,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Lock,
  ShieldCheck,
  ServerOff,
  EyeOff,
  BookOpen,
  ArrowRight
} from "lucide-react";
import { UploadedFile } from "../types/ediscovery";

interface UploadZoneProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  caseContext: string;
  onCaseContextChange: (ctx: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  onLoadSample: (id: string) => void;
  activeCaseId?: string;
  onClearCase?: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenGuide?: () => void;
  onOpenExpedienteCleaner?: () => void;
}

import { processFileForUpload, validateBatchPayloadSize } from "../lib/fileProcessor";

export const UploadZone: React.FC<UploadZoneProps> = ({
  files,
  onFilesChange,
  caseContext,
  onCaseContextChange,
  onAnalyze,
  isLoading,
  onLoadSample,
  activeCaseId,
  onClearCase,
  onOpenPrivacyPolicy,
  onOpenGuide,
  onOpenExpedienteCleaner
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showTextModal, setShowTextModal] = useState(false);
  const [textSnippetTitle, setTextSnippetTitle] = useState("");
  const [textSnippetContent, setTextSnippetContent] = useState("");
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [batchWarning, setBatchWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFileList = async (fileList: FileList | File[]) => {
    const fileArray = Array.from(fileList);
    setNoticeMessage("Comprimiendo imágenes y extrayendo texto en el navegador...");

    const resolvedFiles: UploadedFile[] = [];

    for (const file of fileArray) {
      try {
        const processed = await processFileForUpload(file);

        let category: UploadedFile["category"] = "other";
        const lower = file.name.toLowerCase();
        if (
          lower.includes("chat") ||
          lower.includes("whatsapp") ||
          lower.includes("telegram") ||
          lower.includes("captura")
        ) {
          category = "chat";
        } else if (lower.includes("mail") || lower.includes("correo")) {
          category = "email";
        } else if (
          lower.includes("contrato") ||
          lower.includes("acuerdo") ||
          lower.includes("notarial")
        ) {
          category = "contract";
        } else if (
          lower.includes("recibo") ||
          lower.includes("pago") ||
          lower.includes("transferencia") ||
          lower.includes("factura")
        ) {
          category = "receipt";
        }

        resolvedFiles.push({
          id: processed.id,
          name: processed.name,
          type: processed.type,
          size: processed.size,
          originalSize: processed.originalSize,
          compressionRatio: processed.compressionRatio,
          textContent: processed.textContent,
          base64: processed.base64,
          previewUrl: processed.previewUrl,
          sha256: processed.sha256,
          timestamp_ingesta: processed.timestamp_ingesta,
          category
        });
      } catch (err: any) {
        console.error("Error al procesar archivo en cliente:", err);
      }
    }

    const isDemoActive =
      Boolean(activeCaseId) ||
      files.some((f) => f.id.startsWith("cf-") || f.id.startsWith("lab-"));

    const newBatch = isDemoActive ? resolvedFiles : [...files, ...resolvedFiles];

    // Validar límite estricto de Vercel Serverless (4.5 MB)
    const validation = validateBatchPayloadSize(newBatch);
    if (!validation.isValid && validation.warning) {
      setBatchWarning(validation.warning);
    } else {
      setBatchWarning(null);
    }

    if (isDemoActive) {
      onFilesChange(resolvedFiles);
      onCaseContextChange("");
      setNoticeMessage(
        `Se cargaron ${resolvedFiles.length} archivo(s) optimizados para Vercel Free.`
      );
    } else {
      onFilesChange(newBatch);
      setNoticeMessage(
        `Se añadieron ${resolvedFiles.length} archivo(s) preprocesados en el navegador.`
      );
    }

    setTimeout(() => setNoticeMessage(null), 5000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
      // Reset input value so re-selecting same file triggers change
      e.target.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id);
    onFilesChange(updated);
    if (updated.length === 0 && onClearCase) {
      onClearCase();
    }
  };

  const handleAddTextSnippet = () => {
    if (!textSnippetTitle.trim() || !textSnippetContent.trim()) return;

    const newSnippet: UploadedFile = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: textSnippetTitle.trim().endsWith(".txt") ? textSnippetTitle.trim() : `${textSnippetTitle.trim()}.txt`,
      type: "text/plain",
      size: textSnippetContent.length,
      textContent: textSnippetContent,
      category: "other"
    };

    const isDemoActive =
      Boolean(activeCaseId) ||
      files.some((f) => f.id.startsWith("cf-") || f.id.startsWith("lab-"));

    if (isDemoActive) {
      onFilesChange([newSnippet]);
      onCaseContextChange("");
    } else {
      onFilesChange([...files, newSnippet]);
    }

    setTextSnippetTitle("");
    setTextSnippetContent("");
    setShowTextModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Dynamic Feedback Banner */}
      {noticeMessage && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Demo Case Active Alert */}
      {activeCaseId && (
        <div className="mb-4 p-3.5 rounded-lg bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Caso de demostración activo:</strong> Estás explorando un ejemplo procesal. Si subes tus propios archivos (chats, imágenes o contratos), se vaciará este ejemplo automáticamente.
            </span>
          </div>
          {onClearCase && (
            <button
              type="button"
              onClick={onClearCase}
              className="text-xs font-semibold px-2.5 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded shrink-0 transition-colors"
            >
              Iniciar Caso Vacío
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Expediente de Evidencias Digitales</span>
            <span className="text-xs font-normal text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
              {files.length} {files.length === 1 ? "documento" : "documentos"}
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingresa capturas de WhatsApp o Telegram, contratos en PDF, comprobantes de pago o correos electrónicos.
          </p>
        </div>

        {onOpenGuide && (
          <button
            type="button"
            onClick={onOpenGuide}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>¿Cómo funciona? Guía Práctica</span>
          </button>
        )}
      </div>

      {/* Drag & Drop Area with 3-step Empty State */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50/60 scale-[1.005]"
            : "border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
          className="hidden"
          onChange={handleFileInputChange}
        />

        <div className="max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100/80 text-blue-700 flex items-center justify-center mb-2.5 shadow-2xs">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm sm:text-base font-bold text-slate-800">
            {files.length === 0
              ? "Arrastra aquí tus archivos o haz clic para explorar tu equipo"
              : "Haz clic o arrastra más archivos para incorporarlos al expediente"}
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Admite capturas de pantalla (PNG, JPG, WEBP), contratos o documentos (PDF) y textos (TXT)
          </p>

          {/* 3 Numbered Steps Pattern */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full text-left pt-2 border-t border-slate-200/60">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Sube tus pruebas</p>
                <p className="text-[11px] text-slate-500 leading-tight">Chats de WhatsApp, contratos o fotos.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">La IA audita los hechos</p>
                <p className="text-[11px] text-slate-500 leading-tight">Extrae fechas, citas textuales y contradicciones.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/90 border border-slate-200/80 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800">Análisis de pruebas</p>
                <p className="text-[11px] text-slate-500 leading-tight">Guía organizada y cronológica para preparar tu caso.</p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Heavy Dossier & Gemini File API Callout */}
      {onOpenExpedienteCleaner && (
        <div className="mt-3 p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white block">
                  ¿Tienes un expediente o tomo judicial pesado (&gt;50MB a 200MB)?
                </span>
                <span className="text-[10px] font-mono uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.2 rounded font-semibold">
                  Gemini File API
                </span>
              </div>
              <span className="text-[11px] text-slate-300">
                Filtra el ruido procesal (cédulas vacías, sellos y proveídos de mero trámite) y extrae únicamente la evidencia sustancial.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenExpedienteCleaner}
            className="text-xs font-bold px-3.5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all inline-flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
          >
            <span>Abrir Depuración de Tomos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Manual text snippet button */}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setShowTextModal(true)}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1 py-1 px-2 rounded hover:bg-slate-100 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          O pegar transcripción de texto o correo manualmente
        </button>
      </div>

      {/* Uploaded File List */}
      {files.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Documentos en el lote probatorio ({files.length})
            </span>
            <div className="flex items-center gap-3">
              {onClearCase && (
                <button
                  type="button"
                  onClick={onClearCase}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                >
                  Nuevo Caso Limpio
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onFilesChange([]);
                  if (onClearCase) onClearCase();
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Vaciar lote
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file, idx) => (
              <div
                key={`upload-file-${file.id || "doc"}-${idx}-${file.name || "item"}`}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    {file.type.startsWith("image/") ? (
                      file.previewUrl ? (
                        <img
                          src={file.previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                      )
                    ) : file.type.includes("pdf") ? (
                      <File className="w-4 h-4 text-red-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                      <span>{formatFileSize(file.size)}</span>
                      {file.compressionRatio !== undefined && file.compressionRatio > 0 && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono font-semibold px-1.5 py-0.2 rounded border border-emerald-200">
                          -{file.compressionRatio}%
                        </span>
                      )}
                      {file.textContent && !file.base64 && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.2 rounded border border-blue-200">
                          Texto puro
                        </span>
                      )}
                      {file.category && <span>· {file.category}</span>}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar archivo"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Case Context / Legal Theory notes */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <label htmlFor="caseContext" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          Contexto del Caso o Teoría Jurídica (Opcional)
        </label>
        <textarea
          id="caseContext"
          rows={2}
          value={caseContext}
          onChange={(e) => onCaseContextChange(e.target.value)}
          placeholder="Ej: Juicio ordinario por cobro de honorarios y adendas. El demandante alega mora mientras los chats acreditan prórrogas tácitas acordadas entre las partes..."
          className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
        <p className="text-[11px] text-slate-400 mt-1">
          Proporcionar el contexto ayuda a Gemini a enfocar el análisis en los puntos jurídicos controvertidos de la litis.
        </p>
      </div>

      {/* Action / Analyze Bar */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Trazabilidad 1:1: cada hecho fáctico tendrá cita textual al documento original</span>
          </div>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={files.length === 0 || isLoading}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer ${
              files.length === 0 || isLoading
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando Evidencias con IA Forense...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white text-white" />
                <span>
                  {files.length === 0
                    ? "Selecciona o Arrastra Archivos para Iniciar"
                    : `Analizar ${files.length} ${files.length === 1 ? "Documento" : "Documentos"} con IA Forense`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Discreet Privacy Micro-badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            Tus archivos nunca salen de tu navegador ni se guardan en servidores (Cumplimiento <strong>Ley N° 29733</strong>).
          </span>
          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer ml-1"
            >
              Ver garantía técnica
            </button>
          )}
        </div>
      </div>

      {/* Modal for manual text snippet insertion */}
      {showTextModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">
                Añadir Transcripción de Texto o Mensaje
              </h3>
              <button
                type="button"
                onClick={() => setShowTextModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Documento / Identificador
                </label>
                <input
                  type="text"
                  value={textSnippetTitle}
                  onChange={(e) => setTextSnippetTitle(e.target.value)}
                  placeholder="Ej: Correo_Confirmacion_Acuerdo_12Marzo.txt"
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Texto íntegro (correo, chat, extracto)
                </label>
                <textarea
                  rows={8}
                  value={textSnippetContent}
                  onChange={(e) => setTextSnippetContent(e.target.value)}
                  placeholder="Pega aquí el contenido textual con fecha, remitente, destinatario y mensajes..."
                  className="w-full text-xs p-2.5 border border-slate-200 rounded-lg font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTextModal(false)}
                className="text-xs px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAddTextSnippet}
                disabled={!textSnippetTitle.trim() || !textSnippetContent.trim()}
                className="text-xs px-4 py-2 font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                Añadir al Expediente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
