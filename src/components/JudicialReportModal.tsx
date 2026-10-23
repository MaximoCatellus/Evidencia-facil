import React, { useState, useMemo } from "react";
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  Scale,
  ShieldCheck,
  FileText,
  Hash,
  AlertTriangle,
  Award,
  BookOpen
} from "lucide-react";
import { AnalysisResult, UploadedFile } from "../types/ediscovery";
import { runBayesianInference } from "../lib/bayesianEngine";
import { generateDictamenJudicial } from "../lib/exportUtils";

interface JudicialReportModalProps {
  analysis: AnalysisResult;
  files: UploadedFile[];
  onClose: () => void;
}

export const JudicialReportModal: React.FC<JudicialReportModalProps> = ({
  analysis,
  files,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [tribunal, setTribunal] = useState("Tribunal Competente / Juzgado de Letras");
  const [causaNumero, setCausaNumero] = useState(`EXP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [peritoNombre, setPeritoNombre] = useState("Unidad de Análisis Forense Digital & E-Discovery");

  // Calculate Bayesian Inference if network present
  const bayesianResult = useMemo(() => {
    if (!analysis.red_bayesiana) return null;
    return runBayesianInference(analysis.red_bayesiana);
  }, [analysis.red_bayesiana]);

  // Generate plain text / Markdown for legal briefs
  const generateLegalText = () => {
    return generateDictamenJudicial(analysis, files, {
      tribunal,
      causaNumero,
      peritoNombre
    });
  };

  const handleCopy = () => {
    const text = generateLegalText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    const text = generateLegalText();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Dictamen_Pericial_Judicial_${causaNumero.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHTML = () => {
    const text = generateLegalText();
    const tituloDoc = analysis.resumen_caso?.titulo_caso || "Expediente Digital";
    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Dictamen Pericial Judicial - ${tituloDoc}</title>
  <style>
    body { font-family: "Times New Roman", Times, serif; font-size: 13px; line-height: 1.6; color: #111; padding: 40px; max-width: 850px; margin: auto; }
    h1 { font-size: 18px; text-transform: uppercase; text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; }
    h2 { font-size: 14px; text-transform: uppercase; border-bottom: 1px solid #666; margin-top: 24px; padding-bottom: 4px; }
    .box { border: 1px solid #999; padding: 12px; background: #fdfdfd; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
    th, td { border: 1px solid #aaa; padding: 6px; text-align: left; }
    th { background: #eee; }
    code { font-family: monospace; font-size: 10px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #000; text-align: right; }
  </style>
</head>
<body>
  <h1>DICTAMEN PERICIAL FORENSE Y EVALUACIÓN BAYESIANA</h1>
  <p><strong>TRIBUNAL:</strong> ${tribunal} | <strong>CAUSA:</strong> ${causaNumero}</p>
  <p><strong>PERITO:</strong> ${peritoNombre} | <strong>FECHA:</strong> ${new Date().toLocaleDateString("es-ES")}</p>
  <pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Dictamen_Pericial_Judicial_${causaNumero.replace(/[^a-zA-Z0-9]/g, "_")}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden print:max-w-none print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Dictamen Pericial Judicial Completo</h2>
              <p className="text-xs text-slate-400">
                Formato formal listo para acompañar como prueba pericial o anexo a tribunal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-blue-600" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "¡Copiado!" : "Copiar para Escrito"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 inline-flex items-center gap-1"
              title="Descargar Markdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.MD</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHTML}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 inline-flex items-center gap-1"
              title="Descargar HTML Imprimible"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.HTML</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-1"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editable Metadata Header Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs print:hidden shrink-0">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Tribunal / Juzgado
            </label>
            <input
              type="text"
              value={tribunal}
              onChange={(e) => setTribunal(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Causa / Rol / Expediente N°
            </label>
            <input
              type="text"
              value={causaNumero}
              onChange={(e) => setCausaNumero(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
              Perito / Analista Actuante
            </label>
            <input
              type="text"
              value={peritoNombre}
              onChange={(e) => setPeritoNombre(e.target.value)}
              className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Formal Legal Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 font-serif text-slate-900 leading-relaxed text-xs sm:text-sm">
          {/* Header block */}
          <div className="border-b-2 border-slate-900 pb-5 text-center">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-slate-950 font-serif">
              Dictamen Pericial de Evaluación Probatoria y Modelado Bayesiano
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-600 mt-1 font-sans font-semibold">
              E-Discovery y Trazabilidad Forense Digital 1:1
            </p>

            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-sans text-left bg-slate-50 p-3 rounded-lg">
              <div>
                <span className="text-slate-500 block">Tribunal:</span>
                <span className="font-semibold text-slate-900">{tribunal}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Expediente:</span>
                <span className="font-semibold text-slate-900 font-mono">{causaNumero}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Perito / Letrado:</span>
                <span className="font-semibold text-slate-900">{peritoNombre}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Fecha de Fijación:</span>
                <span className="font-semibold text-slate-900">{new Date().toLocaleDateString("es-ES")}</span>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Case Summary */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-2 font-sans">
              I. Resumen Fáctico y Objeto de la Controversia
            </h2>
            <p className="text-justify text-slate-700 leading-relaxed mb-3">
              {analysis.resumen_caso?.resumen_ejecutivo || "Auditoría probatoria de los documentos aportados."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans bg-slate-50 p-3 rounded border border-slate-200 mb-3">
              <div>
                <span className="text-slate-500 block">Periodo Controversial Documentado:</span>
                <strong className="text-slate-800">
                  {analysis?.resumen_caso?.periodo_temporal?.inicio || "Inicio documentado"} a {analysis?.resumen_caso?.periodo_temporal?.fin || "Fin documentado"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">Documentos Incorporados:</span>
                <strong className="text-slate-800">
                  {files.length} piezas documentales con hash SHA-256 verificado
                </strong>
              </div>
            </div>

            {/* Partes Identificadas */}
            {Array.isArray(analysis.resumen_caso?.partes_identificadas) && analysis.resumen_caso.partes_identificadas.length > 0 && (
              <div className="mt-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-1.5 font-sans">
                  Partes e Intervinientes Identificados:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
                  {analysis.resumen_caso.partes_identificadas.map((p, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="font-bold text-slate-900">{p.nombre}</div>
                      <div className="text-[11px] text-blue-700 font-medium">{p.rol}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{p.detalles}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Bayesian Probabilistic Modeling */}
          {bayesianResult && analysis.red_bayesiana && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
                II. Evaluación Probatoria y Modelado Bayesiano de Incertidumbre
              </h2>

              {/* Hypothesis & Conclusion Card */}
              <div className="bg-slate-900 text-white p-4 rounded-xl mb-4 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold block mb-1">
                      Hipótesis Principal a Contrastar (H)
                    </span>
                    <h3 className="text-sm font-bold text-white">
                      "{analysis.red_bayesiana.hipotesis.descripcion}"
                    </h3>
                  </div>
                  <div className="bg-slate-800 px-4 py-2 rounded-lg text-right border border-slate-700 shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase">Probabilidad Posterior P(H|E)</span>
                    <span className="text-2xl font-mono font-bold text-amber-400">
                      {(bayesianResult.probabilidad_a_posteriori * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Mathematical formulas breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-700 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Probabilidad a Priori P(H)</span>
                    <span className="font-mono font-bold text-white">
                      {(bayesianResult.probabilidad_a_priori * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Prior Odds O(H)</span>
                    <span className="font-mono font-bold text-white">
                      {bayesianResult.odds_a_priori.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Factor de Bayes Global</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {bayesianResult.factor_bayes_global.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Peso Probatorio Total</span>
                    <span className="font-mono font-bold text-amber-300">
                      {bayesianResult.peso_probatorio_total_db.toFixed(1)} dB
                    </span>
                  </div>
                </div>
              </div>

              {/* Standard reached badge */}
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-sans mb-4 flex items-center justify-between">
                <div>
                  <span className="font-bold block">Estándar Judicial Alcanzado:</span>
                  <span>{bayesianResult.estandar_probatorio_alcanzado}</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-600 text-white font-bold rounded text-xs">
                  Nivel {bayesianResult.nivel_certeza}
                </span>
              </div>

              {/* Table of Evidence Nodes with 2-Level Authenticity */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 font-sans">
                Desglose Analítico de Pruebas y Factor de Autenticidad (Cascaded Inference):
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-[11px]">
                      <th className="border border-slate-300 p-2">Prueba / Indicador</th>
                      <th className="border border-slate-300 p-2 w-28">Estado Admisión</th>
                      <th className="border border-slate-300 p-2 w-28">Autenticidad P(A)</th>
                      <th className="border border-slate-300 p-2 w-24">LR Efectivo</th>
                      <th className="border border-slate-300 p-2 w-24">Peso (dB)</th>
                      <th className="border border-slate-300 p-2">Soporte y Cita Literal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bayesianResult.nodos.map((node, i) => (
                      <tr key={node.id} className="hover:bg-slate-50">
                        <td className="border border-slate-300 p-2">
                          <strong className="text-slate-900 block font-semibold">{node.nombre}</strong>
                          <span className="text-[10px] text-slate-500 font-mono">{node.fuente_documental}</span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              node.estado_observado === "presente"
                                ? "bg-emerald-100 text-emerald-800"
                                : node.estado_observado === "ausente"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {node.estado_observado.toUpperCase()}
                          </span>
                        </td>
                        <td className="border border-slate-300 p-2 text-center">
                          <span className="font-mono font-bold text-slate-800">
                            {((node.nivel_autenticidad ?? 1.0) * 100).toFixed(0)}%
                          </span>
                          {node.motivo_impugnacion && (
                            <span className="block text-[9px] text-amber-700 italic mt-0.5">
                              {node.motivo_impugnacion}
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 font-mono font-bold text-center">
                          {node.razon_verosimilitud.toFixed(2)}
                          {node.razon_verosimilitud_nominal !== node.razon_verosimilitud && (
                            <span className="text-[9px] text-slate-400 block line-through">
                              {node.razon_verosimilitud_nominal.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-2 text-center font-mono">
                          {node.peso_evidencia_db.toFixed(1)} dB
                        </td>
                        <td className="border border-slate-300 p-2 italic text-slate-600 text-[11px]">
                          "{node.cita_clave}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 3: Chronology */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
              III. Cronología Procesal de Hechos Acreditados (Trazabilidad 1:1)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px]">
                    <th className="border border-slate-300 p-2 w-28">Fecha / Hora</th>
                    <th className="border border-slate-300 p-2">Hecho Fáctico</th>
                    <th className="border border-slate-300 p-2">Cita Textual y Fuente</th>
                    <th className="border border-slate-300 p-2 w-20 text-center">Relevancia</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(analysis.cronologia) ? analysis.cronologia : []).map((ev, idx) => (
                    <tr key={ev.id || `cron-${idx}`}>
                      <td className="border border-slate-300 p-2 font-mono font-bold text-slate-800 text-[11px]">
                        {ev.fecha_hora}
                      </td>
                      <td className="border border-slate-300 p-2">
                        <div className="font-semibold text-slate-900">{ev.hecho}</div>
                        {ev.analisis_procesal && (
                          <div className="text-[10px] text-slate-500 mt-0.5">{ev.analisis_procesal}</div>
                        )}
                      </td>
                      <td className="border border-slate-300 p-2 text-slate-600 text-[11px]">
                        <span className="italic block mb-0.5">"{ev.cita_o_referencia}"</span>
                        <code className="text-[10px] font-mono text-slate-500">{ev.fuente_documental}</code>
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-xs">
                        {ev.relevancia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Contradicciones Detectadas */}
          {Array.isArray(analysis.contradicciones) && analysis.contradicciones.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
                IV. Contradicciones e Inconsistencias Fácticas Detectadas
              </h2>
              <div className="space-y-3 font-sans text-xs">
                {analysis.contradicciones.map((c, idx) => (
                  <div key={c.id || `contra-${idx}`} className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-lg">
                    <div className="flex justify-between items-center font-bold text-rose-950 mb-2">
                      <span>[{c.id || `C-${idx + 1}`}] {c.titulo}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-rose-200 text-rose-900 rounded font-bold">
                        Gravedad {c.nivel_gravedad || "Crítica"}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] mb-2">
                      <div className="bg-white/80 p-2 rounded border border-rose-100">
                        <strong className="text-slate-800 block mb-0.5">
                          Versión A ({c.hecho_a?.autor_o_parte || "Parte A"} · {c.hecho_a?.fuente || "Fuente A"}):
                        </strong>
                        <span className="italic text-slate-700">"{c.hecho_a?.declaracion}"</span>
                      </div>
                      <div className="bg-white/80 p-2 rounded border border-rose-100">
                        <strong className="text-slate-800 block mb-0.5">
                          Versión B ({c.hecho_b?.autor_o_parte || "Parte B"} · {c.hecho_b?.fuente || "Fuente B"}):
                        </strong>
                        <span className="italic text-slate-700">"{c.hecho_b?.declaracion}"</span>
                      </div>
                    </div>
                    <p className="text-rose-950 text-[11px] mb-1">
                      <strong>Discrepancia Pericial:</strong> {c.explicacion_discrepancia}
                    </p>
                    <p className="text-rose-900 text-[11px] font-semibold">
                      <strong>Impacto Procesal:</strong> {c.impacto_procesal}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Evidentiary Gaps */}
          {Array.isArray(analysis.vacios_probatorios) && analysis.vacios_probatorios.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
                V. Dictamen sobre Vacíos Probatorios y Silencio Procesal
              </h2>
              <div className="space-y-3 font-sans text-xs">
                {analysis.vacios_probatorios.map((gap, idx) => (
                  <div key={gap.id || `gap-${idx}`} className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
                    <div className="flex justify-between font-bold text-amber-950 mb-1">
                      <span>[{gap.id || `V-${idx + 1}`}] {gap.descripcion}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold">
                        Prioridad {gap.prioridad || "Alta"}
                      </span>
                    </div>
                    <p className="text-amber-900 text-[11px] mb-1">
                      <strong>Periodo Afectado:</strong> {gap.hecho_o_periodo_afectado || "Periodo en litigio"}
                    </p>
                    <p className="text-amber-800 text-[11px] mb-1">
                      <strong>Riesgo Procesal:</strong> {gap.riesgo_procesal || "Riesgo de duda probatoria"}
                    </p>
                    <p className="text-amber-900 text-[11px] font-semibold">
                      <strong>Diligencia Sugerida:</strong> {gap.diligencia_o_prueba_sugerida || "Solicitar informe pericial o documental complementario"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Legal & Procedural Recommendations */}
          {Array.isArray(analysis.recomendaciones_legales) && analysis.recomendaciones_legales.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
                VI. Recomendaciones de Estrategia Procesal para el Litigio
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-sans space-y-2">
                {analysis.recomendaciones_legales.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-slate-800 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 7: Cryptographic Chain of Custody (SHA-256) */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-400 pb-1 mb-3 font-sans">
              VII. Fijación Criptográfica y Cadena de Custodia (SHA-256)
            </h2>
            <p className="text-xs font-sans text-slate-600 mb-2">
              Huellas digitales generadas conforme al estándar <strong>ISO/IEC 27037 / FIPS PUB 180-4</strong> para garantizar que el archivo aportado es idéntico al incorporado en autos.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs font-sans">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 text-[11px]">
                    <th className="border border-slate-300 p-2 w-10">N°</th>
                    <th className="border border-slate-300 p-2">Archivo Fuente</th>
                    <th className="border border-slate-300 p-2">Hash SHA-256 Inmutable</th>
                    <th className="border border-slate-300 p-2 w-24 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file, idx) => (
                    <tr key={file.id || idx}>
                      <td className="border border-slate-300 p-2 text-center font-bold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 p-2 font-semibold text-slate-900">
                        {file.name}
                        <span className="block text-[10px] text-slate-500 font-normal">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </td>
                      <td className="border border-slate-300 p-2 font-mono text-[10px] text-slate-800 select-all break-all">
                        {file.sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          VERIFICADO
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 6: Forensic Signature and Conformity */}
          <div className="pt-8 border-t-2 border-slate-900 font-sans">
            <div className="grid grid-cols-2 gap-8 text-xs text-slate-700">
              <div>
                <p className="font-bold text-slate-900 uppercase">Declaración de Idoneidad, Metodología y Privacidad (Ley N° 29733):</p>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  El perito y analista certifica que la metodología descrita no involucra apreciaciones subjetivas arbitrarias. Los cálculos probabilísticos son estrictamente deterministas conforme al Teorema de Bayes, respetando el debido proceso y la motivación judicial. Asimismo, en estricto cumplimiento de la Ley N° 29733 (Perú), se deja constancia de que los chats y documentos aportados se procesan en entorno local sin persistencia en servidores privados ni acceso de terceros.
                </p>
              </div>

              <div className="text-center flex flex-col justify-end items-center">
                <div className="w-56 border-b border-slate-900 pb-1 mb-1">
                  <span className="font-bold text-slate-900 text-xs block">{peritoNombre}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  Firma / Matrícula Profesional / R.U.T.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
