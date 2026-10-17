import React from "react";
import { ShieldCheck, Lock, EyeOff, ServerOff, FileCheck, X, CheckCircle2, AlertCircle } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:hidden">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">
                Aviso de Privacidad y Cumplimiento Ley N° 29733 (Perú)
              </h2>
              <p className="text-xs text-slate-400">
                Garantía técnica de confidencialidad, cero servidores privados e inaccesibilidad total
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Main Hero Callout */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 text-emerald-950 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-emerald-900">
                Compromiso Inquebrantable de Privacidad y Secreto de la Información
              </h3>
              <p className="text-xs text-emerald-900 leading-relaxed">
                En estricto cumplimiento de la <strong>Ley N° 29733 — Ley de Protección de Datos Personales de la República del Perú</strong> y su Reglamento (D.S. 003-2013-JUS), certificamos que la información sensible, conversaciones de mensajería (WhatsApp, Telegram), contratos, correos electrónicos e imágenes que usted carga en esta plataforma <strong>gozan de absoluta confidencialidad fáctica y técnica</strong>.
              </p>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pillar 1: No Private Servers */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ServerOff className="w-4 h-4 text-rose-600" />
                <span>Cero Servidores Privados</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Sus archivos y datos fácticos <strong>NO son enviados ni almacenados en ningún servidor privado</strong>, disco duro centralizado, servidor FTP ni base de datos propia.
              </p>
            </div>

            {/* Pillar 2: Creator Cannot See Chats */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <EyeOff className="w-4 h-4 text-blue-600" />
                <span>Inaccesibilidad del Creador</span>
              </div>
              <p className="text-[11px] text-slate-600">
                <strong>El creador y administrador de la plataforma NO tiene ninguna forma de ver, interceptar, leer, copiar ni descargar sus chats o documentos.</strong> El sistema carece deliberadamente de paneles de administración con visibilidad de datos.
              </p>
            </div>

            {/* Pillar 3: Client-Side Local Storage */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Lock className="w-4 h-4 text-emerald-600" />
                <span>Procesamiento Local en Navegador</span>
              </div>
              <p className="text-[11px] text-slate-600">
                La compresión de fotos, extracción de texto de PDFs y cálculos matemáticos (Teorema de Bayes, cronología y hashes SHA-256) se ejecutan <strong>directamente en la memoria de su navegador web</strong>.
              </p>
            </div>

            {/* Pillar 4: Local Storage Exclusivity */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileCheck className="w-4 h-4 text-amber-600" />
                <span>Persistencia Única en su Dispositivo</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Si decide guardar el caso para no perderlo al recargar la página, se almacena únicamente en el <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">localStorage</code> de su dispositivo físico. Al pulsar <strong>"Nuevo Análisis"</strong>, todo se destruye de la memoria local.
              </p>
            </div>
          </div>

          {/* Legal Compliance Section */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Principios Aplicables de la Ley Peruana N° 29733:
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-600 pl-4 list-disc">
              <li>
                <strong>Principio de Finalidad (Art. 6):</strong> Los datos fácticos se analizan exclusivamente con el propósito de organizar la línea temporal y evaluar la consistencia probatoria a petición expresa del propio usuario.
              </li>
              <li>
                <strong>Principio de Proporcionalidad (Art. 7):</strong> No se solicita registro de identidad, correo electrónico, documento nacional de identidad (DNI) ni creación de cuentas para utilizar la herramienta.
              </li>
              <li>
                <strong>Principio de Seguridad y Confidencialidad (Arts. 9 y 10):</strong> Garantizado por diseño arquitectónico mediante la ausencia de persistencia en backend y la imposibilidad de lectura de datos por parte de terceros o administradores.
              </li>
            </ul>
          </div>

          {/* Forensic / Judicial Integrity Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600">
            <strong>Inferencia Inteligente Efímera:</strong> Para la estructuración fáctica se emplea la API de Google Gemini en modo sin retención de entrenamiento (stateless), asegurando que el contenido documental no sea utilizado para nutrir modelos públicos ni quede indexado.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Jurisdicción: República del Perú · Ley N° 29733
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
          >
            Entendido y Conforme
          </button>
        </div>
      </div>
    </div>
  );
};
