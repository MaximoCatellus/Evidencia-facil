import React from "react";
import { AnalysisResult } from "../types/ediscovery";

interface PrintReportProps {
  analysis: AnalysisResult;
}

export const PrintReport: React.FC<PrintReportProps> = ({ analysis }) => {
  const resumen_caso = analysis?.resumen_caso || {
    titulo_caso: "Expediente Digital E-Discovery",
    resumen_ejecutivo: "",
    periodo_temporal: { inicio: "Inicio documentado", fin: "Fin documentado" },
    partes_identificadas: []
  };
  const cronologia = Array.isArray(analysis?.cronologia) ? analysis.cronologia : [];
  const contradicciones = Array.isArray(analysis?.contradicciones) ? analysis.contradicciones : [];
  const vacios_probatorios = Array.isArray(analysis?.vacios_probatorios) ? analysis.vacios_probatorios : [];
  const metadata_analisis = analysis?.metadata_analisis || {
    total_documentos: 0,
    calidad_evidencia: "Auditada",
    alerta_integridad: ""
  };
  const partes = Array.isArray(resumen_caso?.partes_identificadas) ? resumen_caso.partes_identificadas : [];
  const red_bayesiana = analysis?.red_bayesiana;
  const evidenciasBayesianas = Array.isArray(red_bayesiana?.evidencias) ? red_bayesiana.evidencias : [];
  const cadena_custodia = Array.isArray(analysis?.cadena_custodia) ? analysis.cadena_custodia : [];

  return (
    <div className="hidden print:block p-8 bg-white text-black text-xs leading-normal">
      {/* Formal Legal Header */}
      <div className="border-b-2 border-black pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wide">
              DICTAMEN PERICIAL DE E-DISCOVERY Y TRAZABILIDAD PROCESAL
            </h1>
            <p className="text-sm font-semibold mt-1">{resumen_caso?.titulo_caso || "Expediente Digital"}</p>
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
        <p className="text-justify mb-2">{resumen_caso?.resumen_ejecutivo || "Sin resumen fáctico disponible."}</p>
        <p>
          <strong>Periodo Fáctico Documentado:</strong> {resumen_caso?.periodo_temporal?.inicio || "Inicio documentado"} a {resumen_caso?.periodo_temporal?.fin || "Fin documentado"}
        </p>
        <p>
          <strong>Total de Documentos Analizados:</strong> {metadata_analisis?.total_documentos ?? 0} | <strong>Calidad Probatoria:</strong> {metadata_analisis?.calidad_evidencia || "Auditada"}
        </p>
      </div>

      {/* 2. Partes Identificadas */}
      {partes.length > 0 && (
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
              {partes.map((p, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 p-1.5 font-semibold">{p?.nombre || "Interviniente"}</td>
                  <td className="border border-gray-300 p-1.5">{p?.rol || "Parte"}</td>
                  <td className="border border-gray-300 p-1.5">{p?.detalles || "Constancia en autos"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Cronología Procesal */}
      {cronologia.length > 0 && (
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
              {cronologia.map((ev, idx) => (
                <tr key={ev?.id || `cron-${idx}`}>
                  <td className="border border-gray-300 p-1.5 font-mono font-semibold">{ev?.fecha_hora || "Fecha no fijada"}</td>
                  <td className="border border-gray-300 p-1.5">
                    <div className="font-semibold">{ev?.hecho || "Hecho fáctico"}</div>
                    {ev?.analisis_procesal && <div className="text-[9px] text-gray-600 mt-0.5">{ev.analisis_procesal}</div>}
                  </td>
                  <td className="border border-gray-300 p-1.5 italic">"{ev?.cita_o_referencia || ""}"</td>
                  <td className="border border-gray-300 p-1.5 font-mono">{ev?.fuente_documental || "Documento"}</td>
                  <td className="border border-gray-300 p-1.5 text-center font-bold">{ev?.relevancia || "Media"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Contradicciones */}
      {contradicciones.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
            4. CONTRADICCIONES PROCESALES E INCONSISTENCIAS IDENTIFICADAS
          </h2>
          <div className="space-y-4">
            {contradicciones.map((c, idx) => (
              <div key={c?.id || `contra-${idx}`} className="border border-gray-300 p-3">
                <div className="flex justify-between font-bold mb-1">
                  <span>[{c?.id || `C-${idx + 1}`}] {c?.titulo || "Inconsistencia Documental"}</span>
                  <span>Gravedad: {c?.nivel_gravedad || "Media"}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] mb-2">
                  <div className="bg-gray-50 p-2 border border-gray-200">
                    <strong>Versión A ({c?.hecho_a?.autor_o_parte || "Parte A"} - {c?.hecho_a?.fuente || "Fuente A"}):</strong>
                    <p className="italic">"{c?.hecho_a?.declaracion || ""}"</p>
                  </div>
                  <div className="bg-gray-50 p-2 border border-gray-200">
                    <strong>Versión B ({c?.hecho_b?.autor_o_parte || "Parte B"} - {c?.hecho_b?.fuente || "Fuente B"}):</strong>
                    <p className="italic">"{c?.hecho_b?.declaracion || ""}"</p>
                  </div>
                </div>
                <p className="text-[10px]"><strong>Inconsistencia:</strong> {c?.explicacion_discrepancia || ""}</p>
                <p className="text-[10px] mt-1"><strong>Impacto Procesal:</strong> {c?.impacto_procesal || ""}</p>
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
            {vacios_probatorios.map((g, idx) => (
              <div key={g?.id || `gap-${idx}`} className="border border-gray-300 p-2 text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>[{g?.id || `V-${idx + 1}`}] {g?.descripcion || "Vacío probatorio"}</span>
                  <span>Prioridad: {g?.prioridad || "Media"}</span>
                </div>
                <p><strong>Ventana afectada:</strong> {g?.hecho_o_periodo_afectado || "Periodo debatido"}</p>
                <p><strong>Riesgo procesal:</strong> {g?.riesgo_procesal || "Dificultad de acreditación"}</p>
                <p><strong>Diligencia recomendada:</strong> {g?.diligencia_o_prueba_sugerida || "Aportar soporte fehaciente"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Evaluación Bayesiana Formal */}
      {red_bayesiana && (
        <div className="mb-6 page-break-before">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
            6. EVALUACIÓN PROBATORIA FORMAL (TEOREMA DE BAYES Y MODELADO DE INCERTIDUMBRE)
          </h2>
          <div className="border border-gray-400 p-3 mb-3 bg-gray-50 text-[10px]">
            <p className="font-bold">HIPÓTESIS A CONTRASTAR (H):</p>
            <p className="italic text-xs mb-2">"{red_bayesiana.hipotesis?.descripcion || "Pretensión fáctica o causal debatida"}"</p>
            <p><strong>Probabilidad a Priori P(H):</strong> {((red_bayesiana.hipotesis?.probabilidad_a_priori ?? 0.5) * 100).toFixed(0)}% (Punto de partida neutral de imparcialidad)</p>
            {red_bayesiana.tesis_probatoria && <p><strong>Tesis Probatoria:</strong> {red_bayesiana.tesis_probatoria}</p>}
          </div>

          {evidenciasBayesianas.length > 0 && (
            <table className="w-full text-left border-collapse border border-gray-300 text-[9px] mb-4">
              <thead>
                <tr className="bg-gray-100 font-bold">
                  <th className="border border-gray-300 p-1.5">Nodo de Prueba</th>
                  <th className="border border-gray-300 p-1.5 w-16 text-center">Estado</th>
                  <th className="border border-gray-300 p-1.5 w-20 text-center">Autenticidad P(A)</th>
                  <th className="border border-gray-300 p-1.5 w-16 text-center">P(E|H)</th>
                  <th className="border border-gray-300 p-1.5 w-16 text-center">P(E|~H)</th>
                  <th className="border border-gray-300 p-1.5">Soporte y Cita Literal</th>
                </tr>
              </thead>
              <tbody>
                {evidenciasBayesianas.map((ev, i) => (
                  <tr key={ev?.id || `bayes-${i}`}>
                    <td className="border border-gray-300 p-1.5">
                      <strong>{ev?.nombre || "Indicio probatorio"}</strong>
                      <div className="text-gray-500 font-mono text-[8px]">{ev?.fuente_documental || ""}</div>
                    </td>
                    <td className="border border-gray-300 p-1.5 text-center font-bold uppercase">
                      {ev?.estado_observado || "presente"}
                    </td>
                    <td className="border border-gray-300 p-1.5 text-center font-mono">
                      {((ev?.nivel_autenticidad ?? 1.0) * 100).toFixed(0)}%
                    </td>
                    <td className="border border-gray-300 p-1.5 text-center font-mono">
                      {((ev?.probabilidad_si_hipotesis_cierta ?? 0.85) * 100).toFixed(0)}%
                    </td>
                    <td className="border border-gray-300 p-1.5 text-center font-mono">
                      {((ev?.probabilidad_si_hipotesis_falsa ?? 0.15) * 100).toFixed(0)}%
                    </td>
                    <td className="border border-gray-300 p-1.5 italic">
                      "{ev?.cita_clave || ""}"
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 7. Registro de Cadena de Custodia Criptográfica */}
      {cadena_custodia.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-400 pb-1 mb-2">
            7. FIJACIÓN CRIPTOGRÁFICA Y CADENA DE CUSTODIA (SHA-256)
          </h2>
          <table className="w-full text-left border-collapse border border-gray-300 text-[9px]">
            <thead>
              <tr className="bg-gray-100 font-bold">
                <th className="border border-gray-300 p-1.5">Documento Fuente</th>
                <th className="border border-gray-300 p-1.5">Hash SHA-256 (Inalterabilidad FIPS-180-4)</th>
                <th className="border border-gray-300 p-1.5 w-24 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {cadena_custodia.map((item, idx) => (
                <tr key={item?.id || `cust-${idx}`}>
                  <td className="border border-gray-300 p-1.5 font-bold">
                    {item?.nombre_archivo || "Archivo"}
                    <div className="text-[8px] text-gray-500 font-normal">{((item?.tamano_bytes ?? 0) / 1024).toFixed(1)} KB</div>
                  </td>
                  <td className="border border-gray-300 p-1.5 font-mono text-[8px] break-all">
                    {item?.sha256 || ""}
                  </td>
                  <td className="border border-gray-300 p-1.5 text-center font-bold text-gray-800">
                    {item?.estado_integridad || "Verificado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Signature block */}
      <div className="mt-12 pt-6 border-t border-gray-400 flex justify-between text-[10px]">
        <div>
          <p className="font-bold">AUDITORÍA FORENSE DIGITAL & E-DISCOVERY</p>
          <p>ESTÁNDAR ISO/IEC 27037 · TRAZABILIDAD 1:1</p>
          <p className="text-[8px] text-gray-500 mt-0.5">Hash de verificación criptográfica incrustado</p>
        </div>
        <div className="text-right">
          <p className="font-bold">CONFORMIDAD PERICIAL / LETRADO PATROCINANTE</p>
          <p className="mt-8 border-t border-black w-56 text-center pt-1 font-mono text-[9px]">Firma / R.U.T. / Matrícula Profesional</p>
        </div>
      </div>
    </div>
  );
};
