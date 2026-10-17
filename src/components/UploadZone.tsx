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
  BookOpen
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
  onOpenGuide
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Expediente de Evidencias Digitales</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded">
              {files.length} {files.length === 1 ? "documento" : "documentos"}
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Sube capturas de pantalla de chats (WhatsApp/Telegram), correos electrónicos, contratos escaneados o recibos bancarios.
          </p>
        </div>

        {/* Preloaded demo trigger & Guide button */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 inline-flex items-center gap-1.5 shadow-2xs"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>¿Cómo funciona? Guía Práctica</span>
            </button>
          )}

          <span className="text-xs text-slate-400 hidden sm:inline">·</span>

          <button
            type="button"
            onClick={() => onLoadSample("disputa-contractual")}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Cargar Caso Real Demo
          </button>
        </div>
      </div>

      {/* Peruvian Ley 29733 Privacy & Zero-Knowledge Guarantee Card */}
      <div className="mb-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 rounded-xl p-4 text-xs text-emerald-950 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-900 text-xs">
                  Garantía de Privacidad y Protección de Datos Personales (Ley N° 29733 - Perú)
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  Cero Servidores Privados
                </span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Tus chats, fotos y documentos <strong>NO se envían a ningún servidor privado ni base de datos externa</strong>. El creador y administrador de la plataforma <strong>NO tiene forma técnica ni acceso alguno para ver, leer o almacenar tus archivos</strong>. Todo el preprocesamiento ocurre localmente en la memoria de tu propio navegador web.
              </p>
            </div>
          </div>
          {onOpenPrivacyPolicy && (
            <button
              type="button"
              onClick={onOpenPrivacyPolicy}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors shrink-0 shadow-2xs inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Ver Términos Ley 29733</span>
            </button>
          )}
        </div>
      </div>

      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-blue-500 bg-blue-50/50 scale-[1.005]"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/60"
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

        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-blue-100/70 text-blue-700 flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            Arrastra y suelta aquí tus pruebas o haz clic para explorar
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-3">
            Formatos admitidos: PNG, JPG, WEBP (capturas de chat/móvil), PDF (contratos/notificaciones), TXT (correos/transcripciones)
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Procesamiento confidencial</span>
            <span aria-hidden="true">·</span>
            <span>Extracción OCR & Multimodal</span>
          </div>
        </div>
      </div>

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
            {files.map((file) => (
              <div
                key={file.id}
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
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-3.5 h-3.5 text-slate-400" />
          <span>Trazabilidad garantizada: cada hecho tendrá cita al archivo original</span>
        </div>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={files.length === 0 || isLoading}
          className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-sm inline-flex items-center justify-center gap-2 transition-all shadow-sm ${
            files.length === 0 || isLoading
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-slate-900 hover:bg-slate-800 text-white"
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analizando Evidencias con Gemini...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Procesar E-Discovery ({files.length} {files.length === 1 ? "archivo" : "archivos"})</span>
            </>
          )}
        </button>
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
