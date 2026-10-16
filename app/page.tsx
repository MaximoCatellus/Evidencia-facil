"use client";

import React, { useState } from "react";
import {
  Clock,
  Table as TableIcon,
  ArrowRightLeft,
  ShieldQuestion,
  AlertCircle,
  Play,
  UploadCloud,
  FileText,
  File,
  X,
  Plus,
  Scale,
  ShieldCheck,
  Calendar,
  Users,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Quote,
  User,
  Sparkles,
  Lock,
  ArrowUpDown,
  Search
} from "lucide-react";

// Types
interface TimelineEvent {
  id: string;
  fecha_hora: string;
  hecho: string;
  personas_involucradas: string[];
  fuente_documental: string;
  cita_o_referencia: string;
  relevancia: "Alta" | "Media" | "Baja";
  tipo_evento: string;
  analisis_procesal: string;
}

interface Contradiction {
  id: string;
  titulo: string;
  hecho_a: { declaracion: string; fuente: string; autor_o_parte: string };
  hecho_b: { declaracion: string; fuente: string; autor_o_parte: string };
  explicacion_discrepancia: string;
  impacto_procesal: string;
  nivel_gravedad: "Crítica" | "Moderada" | "Leve";
}

interface EvidentiaryGap {
  id: string;
  descripcion: string;
  hecho_o_periodo_afectado: string;
  riesgo_procesal: string;
  diligencia_o_prueba_sugerida: string;
  prioridad: "Alta" | "Media" | "Baja";
}

interface CaseParty {
  nombre: string;
  rol: string;
  detalles: string;
}

interface CaseSummary {
  titulo_caso: string;
  resumen_ejecutivo: string;
  periodo_temporal: { inicio: string; fin: string };
  partes_identificadas: CaseParty[];
}

interface AnalysisResult {
  resumen_caso: CaseSummary;
  cronologia: TimelineEvent[];
  contradicciones: Contradiction[];
  vacios_probatorios: EvidentiaryGap[];
  recomendaciones_legales: string[];
  metadata_analisis: { total_documentos: number; calidad_evidencia: string; alerta_integridad: string };
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  textContent?: string;
}

export default function EDiscoveryPage() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseContext, setCaseContext] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"timeline" | "matrix" | "contradictions" | "gaps">("timeline");
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState("all");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles: UploadedFile[] = [];
    Array.from(e.target.files).forEach((file) => {
      const reader = new FileReader();
      const isText = file.type.startsWith("text/") || file.name.endsWith(".txt");
      if (isText) {
        reader.onload = (event) => {
          setFiles((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: file.name,
              type: file.type || "text/plain",
              size: file.size,
              textContent: event.target?.result as string
            }
          ]);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          setFiles((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              base64: event.target?.result as string
            }
          ]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files, caseContext })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Fallo en el análisis procesal.");
      }
      setAnalysis(data.data);
      setActiveTab("timeline");
    } catch (err: any) {
      setError(err.message || "Error al conectar con la API de Gemini.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Ethics Disclaimer */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Principio Ético:</strong> Esta herramienta organiza información fáctica y no emite juicios de valor ni sustituye el criterio legal o judicial.
            </span>
          </div>
          <span className="hidden sm:inline text-slate-400">Trazabilidad Probatoria 1:1</span>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">EvidenciaFácil</h1>
              <p className="text-xs text-slate-500">Democratizador de E-Discovery para Ciudadanos y Litigantes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">×</button>
          </div>
        )}

        {/* Upload Zone */}
        <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs mb-8">
          <h2 className="text-base font-bold text-slate-900 mb-1">Carga Multimodal de Evidencias</h2>
          <p className="text-xs text-slate-500 mb-4">
            Adjunta capturas de WhatsApp, correos electrónicos, contratos o recibos en formato PNG, JPG o PDF.
          </p>

          <label className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-8 block text-center cursor-pointer bg-slate-50/50">
            <UploadCloud className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <span className="text-xs font-semibold text-slate-700 block">
              Haz clic o arrastra aquí las capturas y documentos
            </span>
            <span className="text-[11px] text-slate-400 block mt-1">PNG, JPG, PDF, TXT</span>
            <input type="file" multiple onChange={handleFileUpload} className="hidden" />
          </label>

          {files.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {files.map((file) => (
                <div key={file.id} className="p-2 border border-slate-200 rounded-lg flex items-center justify-between text-xs bg-slate-50">
                  <span className="truncate max-w-[200px] font-medium">{file.name}</span>
                  <button onClick={() => setFiles(files.filter((f) => f.id !== file.id))} className="text-slate-400 hover:text-rose-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contexto o Teoría Jurídica del Caso (Opcional)
            </label>
            <textarea
              rows={2}
              value={caseContext}
              onChange={(e) => setCaseContext(e.target.value)}
              placeholder="Ej: Reclamación por despido injustificado y cobro de horas extra..."
              className="w-full text-xs p-2.5 border border-slate-200 rounded-lg bg-slate-50"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={files.length === 0 || isLoading}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Procesando con Gemini..." : `Analizar Expediente (${files.length} archivos)`}
            </button>
          </div>
        </section>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-xl font-bold text-slate-900">{analysis.resumen_caso.titulo_caso}</h2>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                Periodo: {analysis.resumen_caso.periodo_temporal.inicio} a {analysis.resumen_caso.periodo_temporal.fin}
              </p>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
                {analysis.resumen_caso.resumen_ejecutivo}
              </p>

              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Calidad probatoria: <strong>{analysis.metadata_analisis.calidad_evidencia}</strong> ({analysis.metadata_analisis.total_documentos} documentos)
                </span>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg inline-flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
              </div>
            </section>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-2">
              <button
                onClick={() => setActiveTab("timeline")}
                className={`py-2 px-4 text-xs font-semibold border-b-2 ${
                  activeTab === "timeline" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500"
                }`}
              >
                Cronología ({analysis.cronologia.length})
              </button>
              <button
                onClick={() => setActiveTab("contradictions")}
                className={`py-2 px-4 text-xs font-semibold border-b-2 ${
                  activeTab === "contradictions" ? "border-rose-600 text-rose-700" : "border-transparent text-slate-500"
                }`}
              >
                Contradicciones ({analysis.contradicciones.length})
              </button>
              <button
                onClick={() => setActiveTab("gaps")}
                className={`py-2 px-4 text-xs font-semibold border-b-2 ${
                  activeTab === "gaps" ? "border-amber-600 text-amber-800" : "border-transparent text-slate-500"
                }`}
              >
                Vacíos Probatorios ({analysis.vacios_probatorios.length})
              </button>
            </div>

            {/* Tab content */}
            {activeTab === "timeline" && (
              <div className="space-y-4">
                {analysis.cronologia.map((event) => (
                  <div key={event.id} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono font-bold text-slate-800">{event.fecha_hora}</span>
                      <span className="text-slate-400">Fuente: {event.fuente_documental}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">{event.hecho}</p>
                    <div className="mt-2 p-2 bg-slate-50 border-l-2 border-slate-400 text-xs text-slate-700 italic">
                      "{event.cita_o_referencia}"
                    </div>
                    {event.analisis_procesal && (
                      <p className="text-[11px] text-slate-500 mt-2">{event.analisis_procesal}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === "contradictions" && (
              <div className="space-y-4">
                {analysis.contradicciones.map((c) => (
                  <div key={c.id} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{c.titulo}</span>
                      <span className="text-rose-700">{c.nivel_gravedad}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
                        <strong>Versión A ({c.hecho_a.autor_o_parte}):</strong>
                        <p className="italic mt-1">"{c.hecho_a.declaracion}"</p>
                      </div>
                      <div className="p-3 bg-rose-50/50 border border-rose-200 rounded-lg">
                        <strong>Versión B ({c.hecho_b.autor_o_parte}):</strong>
                        <p className="italic mt-1">"{c.hecho_b.declaracion}"</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-3">{c.explicacion_discrepancia}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "gaps" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.vacios_probatorios.map((gap) => (
                  <div key={gap.id} className="p-4 bg-white border border-slate-200 rounded-xl">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-mono text-slate-400">{gap.id}</span>
                      <span className="font-bold text-amber-700">Prioridad {gap.prioridad}</span>
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 mb-1">{gap.descripcion}</h3>
                    <p className="text-[11px] text-slate-500 mb-2">Afecta: {gap.hecho_o_periodo_afectado}</p>
                    <p className="text-[11px] text-rose-800 bg-rose-50 p-2 rounded mb-2">Riesgo: {gap.riesgo_procesal}</p>
                    <p className="text-xs text-slate-700"><strong>Diligencia sugerida:</strong> {gap.diligencia_o_prueba_sugerida}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
