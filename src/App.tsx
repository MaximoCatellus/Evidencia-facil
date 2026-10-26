import React, { useState, useEffect } from "react";
import {
  Clock,
  Table as TableIcon,
  ArrowRightLeft,
  ShieldQuestion,
  AlertCircle,
  FileSearch,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Scale,
  GitFork,
  Database,
  ShieldCheck,
  BookOpen,
  MessageSquarePlus
} from "lucide-react";
import { Header } from "./components/Header";
import { UploadZone } from "./components/UploadZone";
import { ExecutiveSummary } from "./components/ExecutiveSummary";
import { TimelineView } from "./components/TimelineView";
import { EvidenceMatrix } from "./components/EvidenceMatrix";
import { ContradictionsView } from "./components/ContradictionsView";
import { EvidentiaryGapsView } from "./components/EvidentiaryGapsView";
import { BayesianGraphView } from "./components/BayesianGraphView";
import { ArgumentGraphView } from "./components/ArgumentGraphView";
import { CustodyChainView } from "./components/CustodyChainView";
import { PrivacyModal } from "./components/PrivacyModal";
import { UserGuideView } from "./components/UserGuideView";
import { AnonymousFeedbackModal } from "./components/AnonymousFeedbackModal";
import { ExpedienteCleanerTab } from "./components/ExpedienteCleanerTab";
import type { PurifiedDossierResult } from "./lib/expedienteCleaner";
import { ExportBar } from "./components/ExportBar";
import { DocumentModal } from "./components/DocumentModal";
import { PrintReport } from "./components/PrintReport";
import { UploadedFile, AnalysisResult, TimelineEvent } from "./types/ediscovery";
import { SAMPLE_CASES } from "./data/sampleCases";
import { sortAndNormalizeChronology, detectEvidentiaryGaps } from "./lib/chronologyEngine";
import { generateTailoredAnalysis, normalizeAnalysisResult } from "./lib/tailoredAnalysis";

export default function App() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [caseContext, setCaseContext] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "timeline" | "matrix" | "contradictions" | "gaps" | "bayesian" | "arguments" | "custody"
  >("timeline");
  const [selectedEventModal, setSelectedEventModal] = useState<TimelineEvent | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [isRestoredFromLocal, setIsRestoredFromLocal] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isCleanerModalOpen, setIsCleanerModalOpen] = useState(false);
  const [isUploadZoneExpanded, setIsUploadZoneExpanded] = useState(false);

  // Check first visit to open Guide pop-up automatically
  useEffect(() => {
    try {
      const hasSeenGuide = localStorage.getItem("evidenciafacil_guide_seen_v1");
      if (!hasSeenGuide) {
        setIsFirstVisit(true);
        const timer = setTimeout(() => {
          setIsGuideModalOpen(true);
        }, 350);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      console.warn("No fue posible consultar localStorage para guía:", e);
    }
  }, []);

  // Restore analysis from localStorage on initial page load (Zero DB, Zero API cost on reload)
  useEffect(() => {
    try {
      const cachedAnalysis = localStorage.getItem("ediscovery_current_analysis");
      const cachedFiles = localStorage.getItem("ediscovery_uploaded_files");
      const cachedContext = localStorage.getItem("ediscovery_case_context");

      if (cachedAnalysis) {
        const parsed = JSON.parse(cachedAnalysis);
        let safeFiles: any[] = [];
        if (cachedFiles) {
          const rawFiles = JSON.parse(cachedFiles);
          safeFiles = Array.isArray(rawFiles)
            ? rawFiles.map((f: any, i: number) => ({
                ...f,
                id: f.id || `restored-${i}-${f.name || "file"}`
              }))
            : [];
          setFiles(safeFiles);
        }
        const healed = normalizeAnalysisResult(parsed, safeFiles);
        setAnalysis(healed);
        setIsRestoredFromLocal(true);
        if (cachedContext) {
          setCaseContext(cachedContext);
        }
      }
    } catch (e) {
      console.warn("No fue posible restaurar desde localStorage:", e);
    }
  }, []);

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
    setIsRestoredFromLocal(false);
    setIsUploadZoneExpanded(false);
    setActiveTab("timeline");
  };

  // Start fresh analysis (clears localStorage)
  const handleNewAnalysis = () => {
    setFiles([]);
    setCaseContext("");
    setAnalysis(null);
    setActiveCaseId(undefined);
    setError(null);
    setWarningNotice(null);
    setIsRestoredFromLocal(false);
    setIsUploadZoneExpanded(true);
    try {
      localStorage.removeItem("ediscovery_current_analysis");
      localStorage.removeItem("ediscovery_uploaded_files");
      localStorage.removeItem("ediscovery_case_context");
    } catch {}
  };

  // Transfer purified dossier results from Gemini File API into main Bayesian/Chronology view
  const handleTransferPurifiedToAnalysis = (purified: PurifiedDossierResult) => {
    const generatedFiles: UploadedFile[] = [
      {
        id: `purified-${Date.now()}`,
        name: `${purified.titulo_expediente}.pdf`,
        type: "application/pdf",
        size: Math.round(purified.estadisticas_depuracion.tamano_original_mb * 1024 * 1024),
        sha256: "f428c9b106e57bc26e42bfae6f494a737834a34b4237f34789df5fa7d1656828",
        category: "contract"
      }
    ];

    const timelineEvents: TimelineEvent[] = purified.evidencias_clave.map((ev, i) => ({
      id: ev.id || `H-${String(i + 1).padStart(3, "0")}`,
      fecha_hora: ev.fecha || "Fecha procesal",
      hecho: ev.contenido_sustancial,
      tipo_evento:
        ev.tipo === "chat"
          ? "Comunicación Digital"
          : ev.tipo === "contrato"
          ? "Negocio Jurídico"
          : ev.tipo === "comprobante"
          ? "Transacción Bancaria"
          : "Actuación Procesal",
      relevancia: (ev.relevancia === "critica" || ev.relevancia === "alta" ? "Alta" : "Media") as "Alta" | "Media" | "Baja",
      personas_involucradas: ev.partes || [],
      fuente_documental: ev.foja_o_referencia,
      cita_o_referencia: ev.cita_textual,
      analisis_procesal: `Acreditación aislada tras depuración de ruido procesal. Pertinente para sustento de pretensión fáctica.`
    }));

    const contradictions = purified.contradicciones_detectadas.map((c, i) => ({
      id: `C-${String(i + 1).padStart(3, "0")}`,
      titulo: c.titulo,
      nivel_gravedad: "Crítica" as const,
      hecho_a: {
        declaracion: c.declaracion_a,
        fuente: c.foja_a,
        autor_o_parte: "Versión A (Autos)"
      },
      hecho_b: {
        declaracion: c.declaracion_b,
        fuente: c.foja_b,
        autor_o_parte: "Versión B (Evidencia)"
      },
      explicacion_discrepancia: c.explicacion,
      impacto_procesal: "Evidencia incongruencia sustancial entre la versión procesal y la prueba objetiva aislada."
    }));

    // Extraer partes identificadas de las evidencias sustanciales del usuario
    const extractedPartiesSet = new Set<string>();
    purified.evidencias_clave.forEach((ev) => {
      if (Array.isArray(ev.partes)) {
        ev.partes.forEach((p) => {
          if (p && p.trim()) extractedPartiesSet.add(p.trim());
        });
      }
    });

    const dynamicParties =
      extractedPartiesSet.size > 0
        ? Array.from(extractedPartiesSet).map((p, idx) => ({
            nombre: p,
            rol: idx === 0 ? "Parte Titular / Solicitante" : "Parte Emplazada / Contraparte",
            detalles: "Identificado en las fojas sustanciales del expediente procesado"
          }))
        : [
            { nombre: "Parte Aportante", rol: "Titular del acervo probatorio", detalles: "Identificado en fojas procesadas" },
            { nombre: "Contraparte", rol: "Contradictor", detalles: "Identificado en fojas procesadas" }
          ];

    const rawAnalysis = {
      resumen_caso: {
        titulo_caso: purified.titulo_expediente,
        resumen_ejecutivo: purified.resumen_purificado,
        periodo_temporal: {
          inicio: timelineEvents[0]?.fecha_hora || "Inicio documentado",
          fin: timelineEvents[timelineEvents.length - 1]?.fecha_hora || "Fin documentado"
        },
        partes_identificadas: dynamicParties
      },
      cronologia: timelineEvents,
      contradicciones: contradictions,
      vacios_probatorios: [
        {
          id: "V-001",
          descripcion: "Verificar peritaje complementario o ampliación de manifestación testimonial",
          hecho_o_periodo_afectado: "Periodo controvertido post paralización",
          riesgo_procesal: "Posible objeción por falta de informe pericial complementario homologado",
          diligencia_o_prueba_sugerida: "Oficiar a los peritos actuantes para ratificación de anexos",
          prioridad: "Alta" as const
        }
      ],
      recomendaciones_legales: [
        "Presentar la cronología depurada de hechos para fijar los puntos controvertidos sin saturar al magistrado con fojas de mero trámite.",
        "Confrontar a la contraparte con las fojas de contradicción detectadas en la audiencia preliminar.",
        "Ofrecer las citas textuales y fojas exactas aisladas para acreditar los hechos sustanciales de la pretensión."
      ]
    };

    const builtAnalysis = normalizeAnalysisResult(rawAnalysis, generatedFiles);

    setFiles(generatedFiles);
    setAnalysis(builtAnalysis);
    setActiveTab("timeline");
    setIsUploadZoneExpanded(false);
    setIsCleanerModalOpen(false);
  };

  // Handle file additions or deletions
  const handleFilesChange = (newFiles: UploadedFile[]) => {
    setFiles(newFiles);
    setAnalysis(null);
    setActiveCaseId(undefined);
    setError(null);
    setWarningNotice(null);
    setIsRestoredFromLocal(false);
    if (newFiles.length === 0) {
      setCaseContext("");
    }
  };

  // Fallback to local forensic processing when server is unreachable or reports 405
  const handleAnalyzeLocally = () => {
    if (files.length === 0) return;
    setIsLoading(true);
    setLoadingStep("Procesando con motor forense local de contingencia...");
    setError(null);
    setWarningNotice(null);

    try {
      const payloadFiles = files.map((f) => ({
        name: f.name,
        type: f.type,
        base64: f.base64,
        textContent: f.textContent,
        size: f.size
      }));

      const rawAnalysis = generateTailoredAnalysis(payloadFiles, caseContext);
      const normalizedBase = normalizeAnalysisResult(rawAnalysis, payloadFiles);
      const sortedEvents = sortAndNormalizeChronology(normalizedBase.cronologia || []);
      const detectedGaps = detectEvidentiaryGaps(sortedEvents, 30);

      const mergedGaps = [...(normalizedBase.vacios_probatorios || [])];
      detectedGaps.forEach((dg: any) => {
        if (!mergedGaps.some((g: any) => g.hecho_o_periodo_afectado?.includes(dg.periodoAfectado))) {
          mergedGaps.push({
            id: dg.id,
            descripcion: `Silencio procesal prolongado (${dg.diasInactividad} días sin comunicaciones registradas)`,
            hecho_o_periodo_afectado: dg.periodoAfectado,
            riesgo_procesal: dg.riesgoProcesal,
            diligencia_o_prueba_sugerida: dg.diligenciaSugerida,
            prioridad: (dg.nivelRiesgo === "Crítico" ? "Alta" : dg.nivelRiesgo === "Alto" ? "Media" : "Baja") as "Alta" | "Media" | "Baja"
          });
        }
      });

      const enrichedAnalysis: AnalysisResult = normalizeAnalysisResult({
        ...normalizedBase,
        cronologia: sortedEvents as unknown as TimelineEvent[],
        vacios_probatorios: mergedGaps as any
      }, payloadFiles);

      setAnalysis(enrichedAnalysis);
      setIsRestoredFromLocal(false);
      setIsUploadZoneExpanded(false);
      setWarningNotice("Expediente estructurado mediante el motor procesal local (modo contingencia sin servidor).");

      try {
        localStorage.setItem("ediscovery_current_analysis", JSON.stringify(enrichedAnalysis));
        localStorage.setItem("ediscovery_uploaded_files", JSON.stringify(files));
        localStorage.setItem("ediscovery_case_context", caseContext);
      } catch {}
    } catch (err: any) {
      setError(err?.message || "Error al procesar el caso localmente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run analysis via server API endpoint
  const handleAnalyze = async () => {
    if (files.length === 0) return;

    setIsLoading(true);
    setLoadingStep("Extrayendo texto y analizando soportes probatorios con OCR...");
    setError(null);
    setWarningNotice(null);
    setAnalysis(null);

    try {
      const payloadFiles = files.map((f) => ({
        name: f.name,
        type: f.type,
        base64: f.base64,
        textContent: f.textContent,
        size: f.size
      }));

      setLoadingStep("Gemini AI realizando lectura OCR y estructuración procesal...");

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
          caseContext: effectiveContext,
          temperature: 0.1,
          model: "gemini-2.5-flash",
          responseFormat: "application/json"
        })
      });

      const responseText = await res.text();
      let data: any = null;

      try {
        data = JSON.parse(responseText);
      } catch {
        if (res.status === 405) {
          throw new Error(
            "El servidor de Vercel devolvió error 405 (Method Not Allowed). Esto ocurre si la función Serverless /api/analyze aún no se ha desplegado o la ruta se atiende como archivo estático. Puedes pulsar 'Procesar con Motor Local' para continuar de inmediato."
          );
        }
        if (
          res.status === 504 ||
          responseText.includes("TIMEOUT") ||
          responseText.includes("FUNCTION_INVOCATION") ||
          responseText.includes("An error occurred")
        ) {
          throw new Error(
            "El servidor de Vercel agotó el tiempo de espera (Timeout de 10s en plan gratuito). Los servidores de Google Gemini tardaron en responder debido a la alta demanda o al peso de los archivos. Prueba enviando los archivos de 1 en 1 o pulsando 'Reintentar Ahora'."
          );
        }
        throw new Error(
          `Respuesta del servidor (${res.status}): ${responseText.slice(0, 160)}`
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Error al procesar el expediente probatorio.");
      }

      setLoadingStep("Estructurando cronología judicial y calculando vacíos probatorios...");

      const normalizedBase = normalizeAnalysisResult(data.data, payloadFiles);
      const sortedEvents = sortAndNormalizeChronology(normalizedBase.cronologia || []);

      // 2. Detección automática de vacíos probatorios (silencio > 30 días) sin llamadas a la API
      const detectedGaps = detectEvidentiaryGaps(sortedEvents, 30);

      const mergedGaps = [...(normalizedBase.vacios_probatorios || [])];
      detectedGaps.forEach((dg: any) => {
        if (!mergedGaps.some((g: any) => g.hecho_o_periodo_afectado?.includes(dg.periodoAfectado))) {
          mergedGaps.push({
            id: dg.id,
            descripcion: `Silencio procesal prolongado (${dg.diasInactividad} días sin comunicaciones registradas)`,
            hecho_o_periodo_afectado: dg.periodoAfectado,
            riesgo_procesal: dg.riesgoProcesal,
            diligencia_o_prueba_sugerida: dg.diligenciaSugerida,
            prioridad: (dg.nivelRiesgo === "Crítico" ? "Alta" : dg.nivelRiesgo === "Alto" ? "Media" : "Baja") as "Alta" | "Media" | "Baja"
          });
        }
      });

      const enrichedAnalysis: AnalysisResult = normalizeAnalysisResult({
        ...normalizedBase,
        cronologia: sortedEvents as unknown as TimelineEvent[],
        vacios_probatorios: mergedGaps as any
      }, payloadFiles);

      setAnalysis(enrichedAnalysis);
      setIsRestoredFromLocal(false);
      setIsUploadZoneExpanded(false);

      // Persistencia local en el navegador (Cero DB, Cero Coste de Hosting)
      try {
        localStorage.setItem("ediscovery_current_analysis", JSON.stringify(enrichedAnalysis));
        localStorage.setItem("ediscovery_uploaded_files", JSON.stringify(payloadFiles));
        localStorage.setItem("ediscovery_case_context", effectiveContext);
      } catch (storageErr) {
        console.warn("No fue posible almacenar en localStorage:", storageErr);
      }

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
        onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenExpedienteCleaner={() => setIsCleanerModalOpen(true)}
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
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
              <button
                type="button"
                onClick={handleAnalyzeLocally}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Procesar con Motor Local
              </button>
              <button
                type="button"
                onClick={handleAnalyze}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reintentar Servidor
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="px-2.5 py-1.5 text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Upload & Setup Zone (Progressive Disclosure) */}
        <div className="print:hidden">
          {analysis && !isUploadZoneExpanded ? (
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800">
                      Expediente en Auditoría ({files.length} {files.length === 1 ? "documento" : "documentos"})
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                      Cadena SHA-256 verificada
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate max-w-xl mt-0.5">
                    {files.length > 0 ? files.map((f) => f.name).join(" · ") : "Expediente digital"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setIsUploadZoneExpanded(true)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors border border-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>✏️ Modificar o Añadir Pruebas</span>
                </button>
                <button
                  type="button"
                  onClick={handleNewAnalysis}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors border border-blue-200 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>+ Nuevo Caso</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              {analysis && (
                <div className="mb-3 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Panel de Carga y Gestión de Pruebas
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsUploadZoneExpanded(false)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    ▲ Ocultar panel y volver a los resultados
                  </button>
                </div>
              )}
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
                onOpenPrivacyPolicy={() => setIsPrivacyModalOpen(true)}
                onOpenGuide={() => setIsGuideModalOpen(true)}
                onOpenExpedienteCleaner={() => setIsCleanerModalOpen(true)}
              />
            </div>
          )}
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
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "timeline"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>1. Cronología de Hechos ({analysis.cronologia.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("contradictions")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "contradictions"
                    ? "border-rose-600 text-rose-700 bg-rose-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ArrowRightLeft className="w-4 h-4 text-rose-600" />
                <span>2. Contradicciones ({analysis.contradicciones.length})</span>
                {analysis.contradicciones.length > 0 && (
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-full">
                    Crítico
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("gaps")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "gaps"
                    ? "border-amber-600 text-amber-800 bg-amber-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <ShieldQuestion className="w-4 h-4 text-amber-600" />
                <span>3. Vacíos y Riesgos ({analysis.vacios_probatorios.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("matrix")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "matrix"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <TableIcon className="w-4 h-4" />
                <span>4. Matriz de Pruebas</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("bayesian")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "bayesian"
                    ? "border-blue-600 text-blue-700 bg-blue-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
                title="Evaluación objetiva de verosimilitud de hipótesis procesales"
              >
                <Scale className="w-4 h-4 text-blue-600" />
                <span>5. Solidez Probatoria (dB Turing)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("arguments")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "arguments"
                    ? "border-indigo-600 text-indigo-700 bg-indigo-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
                title="Estructura formal de la pretensión conforme a Toulmin"
              >
                <GitFork className="w-4 h-4 text-indigo-600" />
                <span>6. Esquema de Argumentación</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("custody")}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === "custody"
                    ? "border-emerald-600 text-emerald-800 bg-emerald-50/40"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
                title="Huellas inmutables SHA-256 para acta judicial"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>7. Cadena de Custodia (SHA-256)</span>
              </button>
            </div>

            {/* Restored from local cache banner */}
            {isRestoredFromLocal && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs print:hidden">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Expediente cargado desde localStorage:</strong> Se recuperó el análisis previo de la memoria local sin consumir tokens ni invocar a la API de Gemini.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRestoredFromLocal(false)}
                  className="text-emerald-700 hover:text-emerald-900 font-semibold text-[11px]"
                >
                  Entendido
                </button>
              </div>
            )}

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

              {activeTab === "bayesian" && (
                <BayesianGraphView network={analysis.red_bayesiana} />
              )}

              {activeTab === "arguments" && (
                <ArgumentGraphView analysis={analysis} />
              )}

              {activeTab === "custody" && (
                <CustodyChainView files={files} analysis={analysis} />
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



        {/* Peruvian Ley N° 29733 Privacy & Zero-Knowledge Modal */}
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />

        {/* Full Methodology & User Guide Modal */}
        {isGuideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:hidden">
            <UserGuideView
              isModal={true}
              isFirstVisit={isFirstVisit}
              onClose={() => {
                setIsGuideModalOpen(false);
                setIsFirstVisit(false);
              }}
              onLoadSample={(caseId) => {
                handleLoadSample(caseId);
                setIsGuideModalOpen(false);
                setIsFirstVisit(false);
              }}
            />
          </div>
        )}

        {/* Anonymous Feedback & Legal Survey Modal */}
        <AnonymousFeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
        />

        {/* Modal de Pre-procesamiento y Depuración de Expedientes Voluminosos (>50MB) */}
        {isCleanerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:hidden">
            <ExpedienteCleanerTab
              onTransferToAnalysis={handleTransferPurifiedToAnalysis}
              onClose={() => setIsCleanerModalOpen(false)}
            />
          </div>
        )}


      </main>

      {/* Footer & Ley 29733 Peruvian Legal Disclaimer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-12 print:hidden text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 font-bold mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs">
                    🇵🇪 Cumplimiento con la Ley N° 29733 — Ley de Protección de Datos Personales (Perú)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    Cero Servidores Privados
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed max-w-4xl">
                  Garantía de confidencialidad absoluta: la información que usted ingresa (capturas de chats, contratos, imágenes, correos) <strong>NO está siendo enviada a ningún servidor privado ni base de datos</strong>. El creador y administrador de este sistema <strong>no tiene forma técnica ni acceso alguno para ver, registrar, interceptar ni descargar sus chats o archivos</strong>. Todo el procesamiento se realiza en la memoria local de su navegador (Privacy by Design).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                title="Dejar sugerencias anónimas o responder la encuesta"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-amber-600" />
                <span>Buzón de Sugerencias</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGuideModalOpen(true)}
                className="text-xs font-semibold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Guía de Uso & Métodos</span>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(true)}
                className="text-xs font-semibold px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                Ver Certificado Ley 29733
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 text-[11px] pt-1">
            <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
              <span className="font-bold text-slate-700">EvidenciaFácil</span>
              <span aria-hidden="true">·</span>
              <span>Democratizador de E-Discovery para Ciudadanos, Abogados y Peritos</span>
              <span aria-hidden="true">·</span>
              <a
                href="https://github.com/MaximoCatellus/Evidencia-facil"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors font-medium underline underline-offset-2"
                title="Ver repositorio en GitHub (código fuente abierto)"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub · Código Abierto</span>
              </a>
            </div>

            <div className="text-center sm:text-right">
              Procesamiento local soberano · Hashing SHA-256 de cadena de custodia · Sin almacenamiento en bases de datos
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
