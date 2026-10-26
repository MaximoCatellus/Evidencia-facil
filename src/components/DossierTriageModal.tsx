import React, { useState, useEffect } from "react";
import {
  Layers,
  FileText,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  ArrowRight,
  X,
  Sparkles,
  ShieldCheck,
  Loader2,
  HardDrive
} from "lucide-react";
import type { AnalysisResult, UploadedFile } from "../types/ediscovery.ts";

interface AvailableTomo {
  id: string;
  filename: string;
  filePath: string;
  displayName: string;
  sizeBytes: number;
  sizeFormatted: string;
  description: string;
  estimatedFojas: number;
  suggestedRanges: Array<{ label: string; range: string; description: string }>;
}

interface DossierTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisComplete: (result: AnalysisResult, files: UploadedFile[]) => void;
}

export const DossierTriageModal: React.FC<DossierTriageModalProps> = ({
  isOpen,
  onClose,
  onAnalysisComplete
}) => {
  const [availableTomos, setAvailableTomos] = useState<AvailableTomo[]>([]);
  const [selectedTomoId, setSelectedTomoId] = useState<string>("tomo-1");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [useCustomFile, setUseCustomFile] = useState(false);

  // Filtros de ruido y fojas
  const [filterNoise, setFilterNoise] = useState(true);
  const [fojasRanges, setFojasRanges] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "Demanda, Contestación y Pretensiones",
    "Contratos, Adendas y Comprobantes de Pago",
    "Peritajes Técnicos y Balances Económicos",
    "Actas de Inspección y Comunicaciones"
  ]);
  const [caseContext, setCaseContext] = useState("");

  // Estado de procesamiento
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Cargar tomos disponibles al abrir
  useEffect(() => {
    if (isOpen) {
      fetch("/api/dossier/available-tomos")
        .then((res) => res.json())
        .then((data) => {
          if (data?.tomos && Array.isArray(data.tomos) && data.tomos.length > 0) {
            setAvailableTomos(data.tomos);
            setSelectedTomoId(data.tomos[0].id);
          }
        })
        .catch((err) => {
          console.warn("No se pudieron cargar los tomos disponibles:", err);
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTomo = availableTomos.find((t) => t.id === selectedTomoId);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleApplyRange = (range: string) => {
    setFojasRanges(range);
  };

  const handleCustomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomFile(file);
      setUseCustomFile(true);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      setProcessingStep("1/3: Vinculando expediente masivo con Gemini File API...");

      const formData = new FormData();
      formData.append("filterAdministrativeNoise", String(filterNoise));
      formData.append("fojasRanges", fojasRanges.trim());
      formData.append("categories", JSON.stringify(selectedCategories));
      formData.append("caseContext", caseContext.trim());

      let uploadedFileObj: UploadedFile;

      if (useCustomFile && customFile) {
        formData.append("file", customFile);
        formData.append("displayName", customFile.name);
        uploadedFileObj = {
          id: `dossier-${Date.now()}`,
          name: customFile.name,
          size: customFile.size,
          type: customFile.type || "application/pdf"
        };
      } else if (currentTomo) {
        formData.append("tomoId", currentTomo.id);
        formData.append("serverFilePath", currentTomo.filePath);
        formData.append("displayName", currentTomo.displayName);
        uploadedFileObj = {
          id: `tomo-${currentTomo.id}-${Date.now()}`,
          name: currentTomo.displayName,
          size: currentTomo.sizeBytes,
          type: "application/pdf"
        };
      } else {
        throw new Error("Por favor selecciona un tomo judicial o sube un archivo PDF.");
      }

      setProcessingStep("2/3: Descartando ruido procesal y focalizando fojas marcadas...");

      const response = await fetch("/api/dossier/process-large", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error en el servidor HTTP ${response.status}`);
      }

      setProcessingStep("3/3: Estructurando cronología procesal y detectando contradicciones...");
      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || "No se recibieron datos estructurados del análisis.");
      }

      // Éxito: pasar datos al estado principal
      onAnalysisComplete(result.data, [uploadedFileObj]);
      onClose();
    } catch (err: any) {
      console.error("Error al procesar tomo judicial:", err);
      setError(err?.message || "Ocurrió un error inesperado al procesar el expediente masivo.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  Preparación y Triaje de Tomos Judiciales (+50MB)
                </h2>
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full">
                  Gemini File API
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Procesamiento de expedientes pesados sin colapsar el navegador, con filtrado inteligente de ruido procesal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs">Error al procesar expediente:</p>
                <p className="text-[11px] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* PASO 1: SELECCIÓN DEL EXPEDIENTE / TOMO */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Selecciona el Tomo o Archivo Pesado</span>
              </label>
              <span className="text-[11px] text-slate-500">
                Archivos detectados en el servidor
              </span>
            </div>

            {availableTomos.length > 0 && (
              <div className="grid grid-cols-1 gap-2.5">
                {availableTomos.map((tomo) => {
                  const isSelected = !useCustomFile && selectedTomoId === tomo.id;
                  return (
                    <div
                      key={tomo.id}
                      onClick={() => {
                        setSelectedTomoId(tomo.id);
                        setUseCustomFile(false);
                      }}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 shadow-2xs"
                          : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {tomo.displayName}
                            </span>
                            <span className="font-mono text-[10px] bg-white border border-slate-300 px-1.5 py-0.2 rounded text-slate-600">
                              {tomo.sizeFormatted}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {tomo.description}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="text-[10px] text-slate-500 block">
                          ~{tomo.estimatedFojas} fojas
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-bold text-blue-700 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Seleccionado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Opción de subir archivo propio */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <label className="text-[11px] text-slate-600 font-medium">
                ¿Deseas probar otro archivo PDF pesado de tu computadora (+50MB)?
              </label>
              <label className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-medium text-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors">
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>{customFile ? customFile.name : "Examinar archivo PDF..."}</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleCustomFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* PASO 2: FILTRO DE RUIDO ADMINISTRATIVO */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Filtro de Ruido Procesal (NotebookLM vs. E-Discovery)</span>
              </label>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filterNoise}
                  onChange={(e) => setFilterNoise(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 text-xs block">
                    Descartar proveídos de mero trámite y notificaciones rutinarias (Recomendado)
                  </span>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Instruye a Gemini para ignorar cédulas de notificación formal sin controversia, proveídos que dicen únicamente <em>"Téngase presente"</em> o <em>"Agréguese"</em>, y sellos de mesa de partes que saturan el contexto.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* PASO 3: TRIAJE DE FOJAS / PIEZAS PROCESALES CLAVE */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                <span>3. Categorías y Fojas Prioritarias a Extraer</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                "Demanda, Contestación y Pretensiones",
                "Contratos, Adendas y Comprobantes de Pago",
                "Peritajes Técnicos y Balances Económicos",
                "Actas de Inspección y Comunicaciones"
              ].map((cat) => {
                const checked = selectedCategories.includes(cat);
                return (
                  <div
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer flex items-center gap-2 transition-colors ${
                      checked
                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-950 font-medium"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                    />
                    <span>{cat}</span>
                  </div>
                );
              })}
            </div>

            {/* Rangos sugeridos del tomo seleccionado */}
            {currentTomo?.suggestedRanges && !useCustomFile && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-700 block">
                  Rangos sugeridos para {currentTomo.displayName.split("·")[0]}:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {currentTomo.suggestedRanges.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplyRange(sug.range)}
                      className={`text-xs px-2.5 py-1 rounded-md border transition-colors inline-flex items-center gap-1 cursor-pointer ${
                        fojasRanges === sug.range
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                      }`}
                      title={sug.description}
                    >
                      <span className="font-bold">{sug.label}</span>
                      <span className="text-[10px] opacity-80">(Fojas {sug.range})</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFojasRanges("")}
                    className="text-[11px] text-slate-500 hover:text-slate-800 underline px-1"
                  >
                    Todo el tomo
                  </button>
                </div>
              </div>
            )}

            {/* Rango manual de fojas */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>Rango específico de fojas o folios a analizar:</span>
                <span className="text-slate-400 font-normal">Opcional (deja vacío para todo)</span>
              </label>
              <input
                type="text"
                value={fojasRanges}
                onChange={(e) => setFojasRanges(e.target.value)}
                placeholder="ej. 1-60, 110-185, 240-300"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            {/* Contexto opcional */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                <span>Enfoque probatorio o controversia a esclarecer:</span>
                <span className="text-slate-400 font-normal">Opcional</span>
              </label>
              <textarea
                value={caseContext}
                onChange={(e) => setCaseContext(e.target.value)}
                rows={2}
                placeholder="ej. Enfatizar el acta de entrega de terreno, si hubo prórrogas autorizadas y el cálculo del informe pericial."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Barra de progreso de ejecución */}
          {isProcessing && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-blue-950">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  <span>Procesando expediente masivo...</span>
                </div>
                <span className="text-[10px] font-mono text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Gemini File API
                </span>
              </div>
              <p className="text-[11px] text-blue-800">{processingStep}</p>
              <div className="w-full bg-blue-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full w-2/3 animate-pulse rounded-full" />
              </div>
            </div>
          )}

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Streaming directo al servidor · Sin desbordar la memoria de tu navegador</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 sm:flex-none px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Procesando con File API...</span>
                  </>
                ) : (
                  <>
                    <span>Iniciar Triaje y Análisis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
