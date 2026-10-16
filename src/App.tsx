import React, { useState } from "react";
import {
  Clock,
  Table as TableIcon,
  ArrowRightLeft,
  ShieldQuestion,
  AlertCircle,
  FileSearch,
  Sparkles,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { Header } from "./components/Header";
import { UploadZone } from "./components/UploadZone";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { TimelineView } from "./components/TimelineView";
import { EvidenceMatrix } from "./components/EvidenceMatrix";
import { ContradictionsView } from "./components/ContradictionsView";
import { EvidentiaryGapsView } from "./components/EvidentiaryGapsView";
import { ExportBar } from "./components/ExportBar";
import { DocumentModal } from "./components/DocumentModal";
import { PrintReport } from "./components/PrintReport";
import { UploadedFile, AnalysisResult, TimelineEvent } from "./types/ediscovery";
import { SAMPLE_CASES } from "./data/sampleCases";

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseContext, setCaseContext] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "matrix" | "contradictions" | "gaps">("timeline");
  const [selectedEventModal, setSelectedEventModal] = useState<TimelineEvent | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);

  // Load a pre-configured sample case
  const handleLoadSample = (caseId: string) => {
    const sample = SAMPLE_CASES.find((c) => c.id === caseId);
    if (!sample) return;

    setFiles(sample.files);
    setCaseContext(sample.suggestedContext);
    setAnalysis(sample.precomputedResult);
    setActiveCaseId(caseId);
    setError(null);
    setWarningNotice(null);
    setActiveTab("timeline");
  };

  // Start fresh analysis
  const handleNewAnalysis = () => {
    setFiles([]);
    setCaseContext("");
    setAnalysis(null);
    setActiveCaseId(undefined);
    setError(null);
    setWarningNotice(null);
  };

  // Handle file additions or deletions
  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    // If user changes files, clear the previous analysis so results always match current files
    setAnalysis(null);
    setActiveCaseId(undefined);
    setError(null);
    setWarningNotice(null);
    if (newFiles.length === 0) {
      setCaseContext("");
    }
  };

  // Run analysis via server API endpoint
  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setLoadingStep("Extrayendo texto y analizando soportes probatorios con OCR...");
    setError(null);
    setWarningNotice(null);
    setAnalysis(null); // Clear previous analysis immediately

    try {
      const payloadFiles = files.map((f) => ({
        name: f.name,
        type: f.type,
        base64: f.base64,
        textContent: f.textContent,
        size: f.size
      }));

      setLoadingStep("Gemini AI realizando lectura OCR y estructuración procesal...");

      // Ensure stale sample context does not leak into user's own new files
      const isSampleFileSet = files.some((f) => f.id.startsWith("cf-") || f.id.startsWith("lab-"));
      let effectiveContext = caseContext.trim();
      if (!isSampleFileSet && (effectiveContext.toLowerCase().includes("los robles") || effectiveContext.toLowerCase().includes("constructora delta"))) {
        effectiveContext = "";
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: payloadFiles,
          caseContext: effectiveContext
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al procesar el expediente probatorio.");
      }

      setLoadingStep("Estructurando cronología judicial...");
      setAnalysis(data.data);
      if (data.warning) {
        setWarningNotice(data.warning);
      }
      setActiveCaseId(undefined);
      setActiveTab("timeline");
    } catch (err: any) {
      console.error("Error analizando expediente:", err);
      setError(
        err.message || "Ocurrió un error inesperado al comunicarse con el servidor de análisis."
      );
    } finally {
      setIsLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased flex flex-col">
      {/* Navbar & Ethics Banner */}
      <Header
        onLoadSample={handleLoadSample}
        activeCaseId={activeCaseId}
        hasAnalysis={Boolean(analysis)}
        onNewAnalysis={handleNewAnalysis}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Error notification if any */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Aviso del Sistema Procesal:</span>
                <p>
                  {error.includes("503") || error.includes("high demand")
                    ? "Los servidores de IA de Google experimentaron un pico de alta demanda temporal (Error 503). Esto suele solucionarse de inmediato. Haz clic en 'Reintentar Ahora'."
                    : error}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handleAnalyze}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-xs transition-colors inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar Ahora
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="px-2.5 py-1.5 text-rose-700 hover:text-rose-900 font-medium"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Upload & Setup Zone */}
        <div className="print:hidden">
          <UploadZone
            files={files}
            onFilesChange={handleFilesChange}
            caseContext={caseContext}
            onCaseContextChange={setCaseContext}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            onLoadSample={handleLoadSample}
            activeCaseId={activeCaseId}
            onClearCase={handleNewAnalysis}
          />
        </div>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-blue-200 shadow-sm p-8 text-center my-6 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Procesando Expediente de E-Discovery
            </h3>
            <p className="text-xs text-blue-700 font-medium font-mono">
              {loadingStep || "Analizando documentos con inteligencia artificial..."}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Extrayendo fechas, personas, citas literales y trazabilidad documental 1:1...
            </p>
          </div>
        )}

        {/* Warning notice with retry button if applicable */}
        {warningNotice && !isLoading && (
          <div className="mb-6 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs print:hidden">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{warningNotice}</span>
            </div>
            <button
              type="button"
              onClick={handleAnalyze}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded text-xs shrink-0 transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reintentar con Gemini AI
            </button>
          </div>
        )}

        {/* Results Dashboard */}
        {analysis && !isLoading && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="print:hidden">
              <ExecutiveSummary
                summary={analysis.resumen_caso}
                metadata={analysis.metadata_analisis}
                recommendations={analysis.recomendaciones_legales}
              />
            </div>

            {/* Export Toolbar */}
            <ExportBar analysis={analysis} />

            {/* Dashboard Navigation Tabs */}
            <div className="border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px print:hidden">
              <button
                type="button"
                onClick={() => setActiveTab("timeline")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "timeline"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Línea de Tiempo ({analysis.cronologia.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "matrix"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>Matriz de Pruebas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contradictions")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "contradictions"
                    ? "border-rose-600 text-rose-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Contradicciones ({analysis.contradicciones.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gaps")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === "gaps"
                    ? "border-amber-600 text-amber-800"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldQuestion className="w-4 h-4" />
                <span>Vacíos Probatorios ({analysis.vacios_probatorios.length})</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="print:hidden">
              {activeTab === "timeline" && (
                <TimelineView
                  events={analysis.cronologia}
                  onSelectEvent={(ev) => setSelectedEventModal(ev)}
                />
              )}

              {activeTab === "matrix" && (
                <EvidenceMatrix
                  events={analysis.cronologia}
                  onSelectEvent={(ev) => setSelectedEventModal(ev)}
                />
              )}

              {activeTab === "contradictions" && (
                <ContradictionsView contradictions={analysis.contradicciones} />
              )}

              {activeTab === "gaps" && (
                <EvidentiaryGapsView gaps={analysis.vacios_probatorios} />
              )}
            </div>

            {/* Printable official legal layout */}
            <PrintReport analysis={analysis} />
          </div>
        )}

        {/* Source Citation & Document Inspection Modal */}
        {selectedEventModal && (
          <DocumentModal
            event={selectedEventModal}
            uploadedFiles={files}
            onClose={() => setSelectedEventModal(null)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 print:hidden text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">EvidenciaFácil</span>
            <span aria-hidden="true">·</span>
            <span>Democratizador de E-Discovery para Ciudadanos y Litigantes</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400">
            Procesamiento multimodal con Gemini API · Trazabilidad 1:1 · Cumplimiento de Admisibilidad Digital
          </div>
        </div>
      </footer>
    </div>
  );
}
