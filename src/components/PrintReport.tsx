import React from "react";
import { AnalysisResult } from "../types/ediscovery";

interface PrintReportProps {
  analysis: AnalysisResult;
}

export const PrintReport: React.FC<PrintReportProps> = ({ analysis }) => {
  const { resumen_caso, cronologia, contradicciones, vacios_probatorios, recomendaciones_legales, metadata_analisis } =
    analysis;

  return (
    <div className="hidden print:block p-8 bg-white text-black text-xs leading-normal">
      {/* Formal Legal Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              DICTAMEN PERICIAL DE E-DISCOVERY Y TRAZABILIDAD PROCESAL
            </h1>
            <p className="text-sm font-semibold mt-1">{resumen_caso.titulo_caso}</p>
          </div>
          <div className="text-right text-[10px] text-gray-600">
            <p>FECHA: {new Date().toLocaleDateString("es-ES")}</p>
            <p>EXPEDIENTE DIGITAL DE PRUEBAS</p>
          </div>
        </div>
      </div>

      {/* Ethics notice */}
      <div className="p-2.5 bg-gray-100 border border-gray-300 text-[10px] italic mb-6">
        <strong>ADVERTENCIA LEGAL:</strong> Este reporte ha sido generado para estructuración fáctica, cotejo de fuentes y auxilio técnico. No reemplaza el criterio judicial, la valoración soberana de la prueba por el tribunal ni el patrocinio letrado.
      </div>

      {/* 1. Resumen Ejecutivo */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
          1. RESUMEN EJECUTIVO Y PERIODO CONTROVERTIDO
        </h2>
        <p className="text-justify mb-2">{resumen_caso.resumen_ejecutivo}</p>
        <p>
          <strong>Periodo Fáctico Documentado:</strong> {resumen_caso.periodo_temporal.inicio} a {resumen_caso.periodo_temporal.fin}
        </p>
        <p>
          <strong>Total de Documentos Analizados:</strong> {metadata_analisis.total_documentos} | <strong>Calidad Probatoria:</strong> {metadata_analisis.calidad_evidencia}
        </p>
      </div>

      {/* 2. Partes Identificadas */}
      <div className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
          2. PARTES E INTERVINIENTES IDENTIFICADOS
        </h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-[11px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 w-1/3">Nombre</th>
              <th className="border border-gray-300 p-1.5 w-1/4">Rol Procesal</th>
              <th className="border border-gray-300 p-1.5">Detalles / Representación</th>
            </tr>
          </thead>
          <tbody>
            {resumen_caso.partes_identificadas.map((p, idx) => (
              <tr key={idx}>
                <td className="border border-gray-300 p-1.5 font-semibold">{p.nombre}</td>
                <td className="border border-gray-300 p-1.5">{p.rol}</td>
                <td className="border border-gray-300 p-1.5">{p.detalles}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Cronología Procesal */}
      <div className="mb-6 page-break-before">
        <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
          3. CRONOLOGÍA PROCESAL DE HECHOS (CON CITA Y TRAZABILIDAD)
        </h2>
        <table className="w-full text-left border-collapse border border-gray-300 text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-1.5 w-24">Fecha/Hora</th>
              <th className="border border-gray-300 p-1.5">Hecho Fáctico</th>
              <th className="border border-gray-300 p-1.5 w-44">Soporte y Cita Literal</th>
              <th className="border border-gray-300 p-1.5 w-28">Fuente</th>
              <th className="border border-gray-300 p-1.5 w-16">Relevancia</th>
            </tr>
          </thead>
          <tbody>
            {cronologia.map((ev) => (
              <tr key={ev.id}>
                <td className="border border-gray-300 p-1.5 font-mono font-semibold">{ev.fecha_hora}</td>
                <td className="border border-gray-300 p-1.5">
                  <div className="font-semibold">{ev.hecho}</div>
                  {ev.analisis_procesal && <div className="text-[9px] text-gray-600 mt-0.5">{ev.analisis_procesal}</div>}
                </td>
                <td className="border border-gray-300 p-1.5 italic">"{ev.cita_o_referencia}"</td>
                <td className="border border-gray-300 p-1.5 font-mono">{ev.fuente_documental}</td>
                <td className="border border-gray-300 p-1.5 text-center font-bold">{ev.relevancia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Contradicciones */}
      {contradicciones.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
            4. CONTRADICCIONES PROCESALES E INCONSISTENCIAS IDENTIFICADAS
          </h2>
          <div className="space-y-4">
            {contradicciones.map((c) => (
              <div key={c.id} className="border border-gray-300 p-3">
                <div className="flex justify-between font-bold mb-1">
                  <span>[{c.id}] {c.titulo}</span>
                  <span>Gravedad: {c.nivel_gravedad}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                  <div className="bg-gray-50 p-2 border border-gray-200">
                    <strong>Versión A ({c.hecho_a.autor_o_parte} - {c.hecho_a.fuente}):</strong>
                    <p className="italic">"{c.hecho_a.declaracion}"</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-gray-200">
                    <strong>Versión B ({c.hecho_b.autor_o_parte} - {c.hecho_b.fuente}):</strong>
                    <p className="italic">"{c.hecho_b.declaracion}"</p>
                  </div>
                </div>
                <p className="text-[10px]"><strong>Inconsistencia:</strong> {c.explicacion_discrepancia}</p>
                <p className="text-[10px] mt-1"><strong>Impacto Procesal:</strong> {c.impacto_procesal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Vacíos Probatorios */}
      {vacios_probatorios.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
            5. VACÍOS PROBATORIOS Y DILIGENCIAS SUGERIDAS
          </h2>
          <div className="space-y-2">
            {vacios_probatorios.map((g) => (
              <div key={g.id} className="border border-gray-300 p-2 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>[{g.id}] {g.descripcion}</span>
                  <span>Prioridad: {g.prioridad}</span>
                </div>
                <p><strong>Ventana afectada:</strong> {g.hecho_o_periodo_afectado}</p>
                <p><strong>Riesgo procesal:</strong> {g.riesgo_procesal}</p>
                <p><strong>Diligencia recomendada:</strong> {g.diligencia_o_prueba_sugerida}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature block */}
      <div className="mt-12 pt-6 border-t border-gray-400 flex justify-between text-[10px]">
        <div>
          <p>AUDITORÍA FORENSE DIGITAL</p>
          <p>SISTEMA E-DISCOVERY EVIDENCIAFÁCIL</p>
        </div>
        <div className="text-right">
          <p>CONFORMIDAD DE REVISIÓN LITIGANTE</p>
          <p className="mt-8 border-t border-black w-48 text-center pt-1">Firma / R.U.T. / Matrícula</p>
        </div>
      </div>
    </div>
  );
};
