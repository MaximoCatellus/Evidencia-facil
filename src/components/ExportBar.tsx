import React, { useState } from "react";
import { Printer, Download, FileCode, Check, Copy, Award } from "lucide-react";
import { AnalysisResult } from "../types/ediscovery";

interface ExportBarProps {
  analysis: AnalysisResult;
  onOpenJudicialReport?: () => void;
}

export const ExportBar: React.FC<ExportBarProps> = ({ analysis, onOpenJudicialReport }) => {
  const [copied, setCopied] = useState(false);

  // Generate clean Markdown representation
  const generateMarkdown = () => {
    const s = analysis.resumen_caso;
    let md = `# INFORME PERICIAL DE E-DISCOVERY Y CRONOLOGÍA PROCESAL\n\n`;
    md += `**CASO:** ${s?.titulo_caso || "Expediente Digital"}\n`;
    md += `**PERIODO:** ${s?.periodo_temporal?.inicio || "Inicio documentado"} a ${s?.periodo_temporal?.fin || "Fin documentado"}\n`;
    md += `**FECHA DE DICTAMEN:** ${new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}\n\n`;

    md += `## 1. RESUMEN EJECUTIVO\n\n${s?.resumen_ejecutivo || "Auditoría forense digital y estructuración de los elementos probatorios incorporados en autos."}\n\n`;

    const partesList = Array.isArray(s?.partes_identificadas) ? s.partes_identificadas : [];
    if (partesList.length > 0) {
      md += `## 2. PARTES IDENTIFICADAS\n\n`;
      partesList.forEach((p) => {
        md += `- **${p.nombre || "Parte"}** (${p.rol || "Interviniente"}): ${p.detalles || "Consta en expediente"}\n`;
      });
      md += `\n`;
    }

    const cronoList = Array.isArray(analysis.cronologia) ? analysis.cronologia : [];
    md += `## 3. CRONOLOGÍA PROCESAL DE HECHOS (TRAZABILIDAD 1:1)\n\n`;
    cronoList.forEach((ev, idx) => {
      const id = ev.id || `H-${String(idx + 1).padStart(3, "0")}`;
      const fecha = ev.fecha_hora || "Fecha documentada";
      const tipo = ev.tipo_evento || "Actuación Procesal";
      const rel = ev.relevancia || "Alta";
      md += `### [${id}] ${fecha} - ${tipo} (Relevancia: ${rel})\n`;
      md += `**Hecho:** ${ev.hecho || "Hecho documentado"}\n`;
      if (Array.isArray(ev.personas_involucradas) && ev.personas_involucradas.length > 0) {
        md += `**Personas:** ${ev.personas_involucradas.join(", ")}\n`;
      }
      md += `**Fuente:** \`${ev.fuente_documental || "Expediente Digital"}\`\n`;
      md += `**Cita Literal:** > "${ev.cita_o_referencia || ev.hecho}"\n`;
      if (ev.analisis_procesal) {
        md += `**Pertinencia Procesal:** ${ev.analisis_procesal}\n`;
      }
      md += `\n`;
    });

    const contrasList = Array.isArray(analysis.contradicciones) ? analysis.contradicciones : [];
    if (contrasList.length > 0) {
      md += `## 4. CONTRADICCIONES DETECTADAS\n\n`;
      contrasList.forEach((c, idx) => {
        const id = c.id || `C-${String(idx + 1).padStart(3, "0")}`;
        const grav = c.nivel_gravedad || "Crítica";
        md += `### [${id}] ${c.titulo || "Inconsistencia"} (Gravedad: ${grav})\n`;
        md += `- **Versión A (${c.hecho_a?.autor_o_parte || "Parte A"} / ${c.hecho_a?.fuente || "Fuente A"}):** "${c.hecho_a?.declaracion || "Constancia inicial"}"\n`;
        md += `- **Versión B (${c.hecho_b?.autor_o_parte || "Parte B"} / ${c.hecho_b?.fuente || "Fuente B"}):** "${c.hecho_b?.declaracion || "Constancia divergente"}"\n`;
        md += `**Discrepancia:** ${c.explicacion_discrepancia || "Divergencia insubsanable entre versiones"}\n`;
        md += `**Impacto Procesal:** ${c.impacto_procesal || "Afecta la credibilidad probatoria"}\n\n`;
      });
    }

    const vaciosList = Array.isArray(analysis.vacios_probatorios) ? analysis.vacios_probatorios : [];
    if (vaciosList.length > 0) {
      md += `## 5. VACÍOS PROBATORIOS Y DILIGENCIAS SUGERIDAS\n\n`;
      vaciosList.forEach((g, idx) => {
        const id = g.id || `V-${String(idx + 1).padStart(3, "0")}`;
        const prio = g.prioridad || "Alta";
        md += `### [${id}] ${g.descripcion || "Laguna probatoria"} (Prioridad: ${prio})\n`;
        md += `- **Periodo Afectado:** ${g.hecho_o_periodo_afectado || "Periodo en litigio"}\n`;
        md += `- **Riesgo:** ${g.riesgo_procesal || "Riesgo de duda razonable"}\n`;
        md += `- **Diligencia Sugerida:** ${g.diligencia_o_prueba_sugerida || "Solicitar prueba de informes o exhibición"}\n\n`;
      });
    }

    const recs = Array.isArray(analysis.recomendaciones_legales)
      ? analysis.recomendaciones_legales
      : typeof analysis.recomendaciones_legales === "string"
      ? [analysis.recomendaciones_legales]
      : [];

    if (recs.length > 0) {
      md += `## 6. RECOMENDACIONES DE ESTRATEGIA PROCESAL\n\n`;
      recs.forEach((rec, idx) => {
        md += `${idx + 1}. ${rec}\n`;
      });
      md += `\n`;
    }

    md += `---\n*Dictamen automatizado para organización documental. No reemplaza el patrocinio de abogado habilitado ni el dictamen judicial.*\n`;
    return md;
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (analysis.resumen_caso?.titulo_caso || "Caso").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    link.download = `Reporte_EDiscovery_${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (analysis.resumen_caso?.titulo_caso || "Caso").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    link.download = `EDiscovery_Forense_${safeTitle}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
      <div>
        <h3 className="text-sm font-bold tracking-tight">
          Exportar Dictamen de E-Discovery
        </h3>
        <p className="text-xs text-slate-300 mt-0.5">
          Genera un informe procesal listo para juicio, anexo de demanda o revisión colegiada.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {/* Formal Judicial Dictamen Modal Button */}
        {onOpenJudicialReport && (
          <button
            type="button"
            onClick={onOpenJudicialReport}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            title="Abrir Dictamen Pericial Judicial completo con carátula de juzgado, modelado bayesiano de certeza y cadena de custodia"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Dictamen Pericial Judicial</span>
          </button>
        )}

        {/* Print / PDF Button */}
        <button
          type="button"
          onClick={handlePrint}
          className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-blue-600" />
          <span>Imprimir / PDF</span>
        </button>

        {/* Markdown Export (Reporte E-Discovery Clásico) */}
        <button
          type="button"
          onClick={handleDownloadMarkdown}
          className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
          title="Descargar el informe pericial estructurado de E-Discovery en Markdown (.md)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Reporte E-Discovery (.md)</span>
        </button>

        {/* JSON Export */}
        <button
          type="button"
          onClick={handleDownloadJSON}
          className="px-3 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors inline-flex items-center justify-center gap-1 border border-slate-700"
          title="Descargar JSON Forense Estructurado"
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>

        {/* Copy text */}
        <button
          type="button"
          onClick={handleCopySummary}
          className="p-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors inline-flex items-center justify-center border border-slate-700"
          title="Copiar informe completo al portapapeles"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};
