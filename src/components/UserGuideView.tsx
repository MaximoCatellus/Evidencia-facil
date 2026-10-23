import React, { useState } from "react";
import {
  BookOpen,
  UploadCloud,
  Clock,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ChevronRight,
  ArrowRight
} from "lucide-react";

interface UserGuideViewProps {
  onLoadSample?: (caseId: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const UserGuideView: React.FC<UserGuideViewProps> = ({
  onLoadSample,
  onClose,
  isModal = false
}) => {
  const [activeTab, setActiveTab] = useState<"quickstart" | "cases" | "security">("quickstart");

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col ${
        isModal ? "max-w-4xl w-full max-h-[90vh]" : ""
      }`}
    >
      {/* Encabezado */}
      <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold">¿Cómo funciona EvidenciaFácil?</h2>
            <p className="text-xs text-slate-300">
              Guía rápida para ordenar tus pruebas y descubrir inconsistencias en minutos
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Selector de 3 pestañas */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("quickstart")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === "quickstart"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>1. Guía Rápida (3 Pasos)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cases")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === "cases"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>2. Situaciones en las que te ayuda</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-all ${
            activeTab === "security"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>3. Validez Legal y Privacidad</span>
        </button>
      </div>

      {/* Contenido Principal */}
      <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs max-h-[70vh]">
        {/* TAB 1: GUÍA RÁPIDA */}
        {activeTab === "quickstart" && (
          <div className="space-y-6">
            <div className="text-center max-w-xl mx-auto mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Transforma capturas desordenadas en un expediente judicial en 3 pasos
              </h3>
              <p className="text-slate-500 mt-1 text-[11px]">
                No necesitas ser abogado ni experto informático. La aplicación hace el trabajo pesado por ti.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                  1
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Sube tus pruebas</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Arrastra capturas de WhatsApp, fotos de contratos, recibos bancarios o correos. No importa si están desordenados.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                  2
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Revisa el análisis</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  El sistema ordena los hechos en una línea de tiempo y te alerta si la otra parte cayó en contradicciones o faltan comprobantes.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 relative">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px]">
                  3
                </span>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Obtén tu reporte</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Descarga un dictamen pericial con sello criptográfico, listo para que tu abogado lo presente en una demanda o audiencia.
                </p>
              </div>
            </div>

            {/* Banner de invitación rápida */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="font-bold text-slate-900 text-xs block">
                  ¿No tienes archivos a mano en este momento?
                </span>
                <span className="text-[11px] text-slate-600">
                  Prueba la aplicación cargando un caso predeterminado con un solo clic.
                </span>
              </div>
              {onLoadSample && (
                <button
                  type="button"
                  onClick={() => {
                    onLoadSample("caso-laboral");
                    if (onClose) onClose();
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5"
                >
                  <span>Cargar Caso Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SITUACIONES CONCRETAS */}
        {activeTab === "cases" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-base mb-1 block">💼</span>
              <h4 className="font-bold text-slate-900 text-xs mb-1">
                Problemas Laborales (Despidos, Horas Extra, Falta de Pago)
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                Sube las conversaciones donde te asignaban tareas fuera de turno o te cesaron injustificadamente.
              </p>
              <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 rounded p-2">
                <strong>Resultado:</strong> Acredita horarios y subordinación real, neutralizando los descargos de la empresa.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-base mb-1 block">📄</span>
              <h4 className="font-bold text-slate-900 text-xs mb-1">
                Contratos y Deudas por Servicios
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                Confronta el contrato firmado contra los chats donde el cliente pidió cambios o aprobó entregas.
              </p>
              <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded p-2">
                <strong>Resultado:</strong> Demuestra si las prórrogas fueron autorizadas y frena cobros abusivos de penalidades.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-base mb-1 block">🏠</span>
              <h4 className="font-bold text-slate-900 text-xs mb-1">
                Arrendamientos, Alquileres y Garantías
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                Sube comprobantes de transferencias bancarias y mensajes de entrega del departamento.
              </p>
              <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded p-2">
                <strong>Resultado:</strong> Prueba la puntualidad en los pagos y evita la retención arbitraria de depósitos.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-base mb-1 block">🛒</span>
              <h4 className="font-bold text-slate-900 text-xs mb-1">
                Reclamos de Consumo y Garantías (Indecopi)
              </h4>
              <p className="text-[11px] text-slate-600 mb-2">
                Sube capturas de compras por internet y correos de reclamo que nunca fueron respondidos.
              </p>
              <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                <strong>Resultado:</strong> Detecta los periodos de silencio del vendedor para sustentar una denuncia formal.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VALIDEZ LEGAL Y PRIVACIDAD */}
        {activeTab === "security" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-emerald-900">¿Por qué este reporte tiene valor en juicio?</h4>
                <p className="text-[11px] text-emerald-800 mt-1 leading-relaxed">
                  En un proceso judicial, la contraparte suele impugnar capturas alegando que fueron editadas con Photoshop. La plataforma calcula una huella matemática inmutable (Hash SHA-256) bajo el estándar <strong>ISO/IEC 27037</strong> para acreditar que el archivo no fue manipulado.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Lock className="w-4 h-4 text-blue-600" />
                  <span>Tus archivos no se guardan en internet</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Arquitectura <em>Zero-Knowledge</em>: tus documentos se procesan únicamente en la memoria local de tu navegador. Nadie (ni los creadores de la app) puede leer ni almacenar tus chats privados.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sana Crítica y Trazabilidad 1:1</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Cero invenciones: cada fecha y afirmación que genera el sistema se encuentra vinculada a la cita textual exacta del archivo que subiste.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer con Acciones Claras */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        <span className="text-[11px] text-slate-500">
          EvidenciaFácil · Auditoría documental accesible y confidencial
        </span>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onLoadSample && (
            <button
              type="button"
              onClick={() => {
                onLoadSample("caso-laboral");
                if (onClose) onClose();
              }}
              className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              Cargar Caso de Prueba (Demo)
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Subir mis propios documentos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};