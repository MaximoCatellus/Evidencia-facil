import React, { useState } from "react";
import {
  MessageSquarePlus,
  Send,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Star,
  Copy,
  ExternalLink,
  X,
  Sparkles,
  HelpCircle,
  ThumbsUp,
  FileText,
  Scale
} from "lucide-react";

interface AnonymousFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FeedbackSubmission {
  id: string;
  timestamp: string;
  userRole: string;
  jurisdiction: string;
  ratings: {
    extractionAccuracy: number;
    chronologyUtility: number;
    bayesianClarity: number;
    custodyChainTrust: number;
    judicialReportUsability: number;
  };
  biggestFriction: string;
  desiredFeatures: string[];
  openSuggestion: string;
}

const DESIRED_FEATURE_OPTIONS = [
  "Transcripción y análisis de audios de WhatsApp (.opus / .m4a)",
  "Exportación de demandas y contestaciones en formato Word (.docx)",
  "Reconocimiento de firmas electrónicas y certificados digitales",
  "Simulador de contrainterrogatorio basado en las contradicciones",
  "Plantillas específicas por materia (Penal, Laboral, Civil, Arbitraje)",
  "Soporte para expedientes de más de 100 páginas o 50 archivos a la vez",
  "Modo colaborativo para estudio de abogados (sin servidor central)"
];

export const AnonymousFeedbackModal: React.FC<AnonymousFeedbackModalProps> = ({
  isOpen,
  onClose
}) => {
  const [userRole, setUserRole] = useState<string>("Abogado litigante");
  const [jurisdiction, setJurisdiction] = useState<string>("Perú");
  const [extractionAccuracy, setExtractionAccuracy] = useState<number>(4);
  const [chronologyUtility, setChronologyUtility] = useState<number>(5);
  const [bayesianClarity, setBayesianClarity] = useState<number>(4);
  const [custodyChainTrust, setCustodyChainTrust] = useState<number>(5);
  const [judicialReportUsability, setJudicialReportUsability] = useState<number>(4);
  const [biggestFriction, setBiggestFriction] = useState<string>(
    "La evaluación bayesiana requiere familiarizarse con los decibeles (dB) y probabilidades"
  );
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    "Exportación de demandas y contestaciones en formato Word (.docx)",
    "Transcripción y análisis de audios de WhatsApp (.opus / .m4a)"
  ]);
  const [openSuggestion, setOpenSuggestion] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
    );
  };

  const generateFeedbackSummary = (): string => {
    return `=== ENCUESTA Y SUGERENCIA ANÓNIMA - EVIDENCIAFÁCIL ===
Fecha: ${new Date().toLocaleString("es-ES")}
Perfil: ${userRole} (${jurisdiction})

CALIFICACIONES (1 a 5 estrellas):
- Precisión de Extracción Documental (OCR/Chats): ${extractionAccuracy}/5
- Utilidad de la Cronología Procesal: ${chronologyUtility}/5
- Claridad de la Evaluación Bayesiana: ${bayesianClarity}/5
- Confianza en Cadena de Custodia SHA-256: ${custodyChainTrust}/5
- Utilidad del Dictamen Pericial: ${judicialReportUsability}/5

MAYOR DIFICULTAD O FRICCIÓN ENCONTRADA:
"${biggestFriction}"

FUNCIONALIDADES MÁS DESEADAS:
${selectedFeatures.map((f) => `- ${f}`).join("\n")}

SUGERENCIA ABIERTA / COMENTARIOS DE MEJORA:
"${openSuggestion || "Sin comentarios adicionales"}"
======================================================`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submission: FeedbackSubmission = {
      id: `feed-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userRole,
      jurisdiction,
      ratings: {
        extractionAccuracy,
        chronologyUtility,
        bayesianClarity,
        custodyChainTrust,
        judicialReportUsability
      },
      biggestFriction,
      desiredFeatures: selectedFeatures,
      openSuggestion
    };

    // Store in localStorage without requiring any remote private database
    try {
      const existing = localStorage.getItem("ediscovery_anonymous_feedback");
      const list = existing ? JSON.parse(existing) : [];
      list.push(submission);
      localStorage.setItem("ediscovery_anonymous_feedback", JSON.stringify(list));
    } catch (err) {
      console.warn("No fue posible guardar feedback en localStorage:", err);
    }

    setIsSubmitted(true);
  };

  const handleCopy = () => {
    const summary = generateFeedbackSummary();
    navigator.clipboard.writeText(summary);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setOpenSuggestion("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto print:hidden animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">
                  Buzón de Sugerencias & Encuesta Anónima
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Confidencial
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tu opinión técnica nos ayuda a perfeccionar la precisión forense y la experiencia de litigio
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Privacy Guarantee Notice */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-3.5 text-emerald-950 flex items-start gap-3">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-[11px]">
              <span className="font-bold text-emerald-900 block">
                Garantía de Anonimato Total (Ley N° 29733 - Perú):
              </span>
              <p className="text-emerald-800 leading-relaxed">
                No solicitamos tu nombre, teléfono, dirección IP ni correo electrónico. Esta encuesta busca retroalimentación real de abogados y litigantes para elevar la calidad probatoria del sistema.
              </p>
            </div>
          </div>

          {isSubmitted ? (
            /* Thank You State */
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  ¡Muchas gracias por tu sugerencia técnica!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tu retroalimentación ha sido registrada de forma 100% anónima. Además, puedes copiar el resumen para compartirlo en foros jurídicos o con los desarrolladores.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto text-left font-mono text-[11px] text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                {generateFeedbackSummary()}
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copiedText ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedText ? "¡Copiado al Portapapeles!" : "Copiar Resumen para Enviar"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Enviar otra sugerencia
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Survey Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Question 1: Role & Jurisdiction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1">
                    1. ¿Cuál es tu perfil o rol principal?
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Abogado litigante">Abogado litigante independiente</option>
                    <option value="Abogado de estudio / corporativo">Abogado de estudio / firma legal</option>
                    <option value="Ciudadano / Demandante / Demandado">Ciudadano (demandante o demandado)</option>
                    <option value="Perito judicial / Informático forense">Perito judicial / Informático forense</option>
                    <option value="Estudiante de Derecho / Académico">Estudiante de Derecho / Académico</option>
                    <option value="Funcionario judicial / Árbitro">Funcionario judicial / Magistrado / Árbitro</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 text-xs mb-1">
                    Jurisdicción habitual:
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Perú">Perú (Poder Judicial / Arbitraje)</option>
                    <option value="Chile">Chile (Poder Judicial)</option>
                    <option value="Colombia">Colombia (Rama Judicial)</option>
                    <option value="México">México (Poder Judicial)</option>
                    <option value="Argentina">Argentina</option>
                    <option value="España">España</option>
                    <option value="Otra jurisdicción">Otra jurisdicción</option>
                  </select>
                </div>
              </div>

              {/* Question 2: Star Ratings for Modules */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block font-bold text-slate-800 text-xs">
                  2. Califica los módulos según tu experiencia (1 = Deficiente, 5 = Excelente):
                </label>

                <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                  {/* Rating 1: Extraction */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-700">Precisión en extracción de hechos y citas de chats/PDFs:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setExtractionAccuracy(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= extractionAccuracy ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating 2: Chronology */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-700">Utilidad de la Cronología Procesal y detección de silencios:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setChronologyUtility(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= chronologyUtility ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating 3: Bayesian */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-700">Claridad de la Evaluación Bayesiana P(H|E) y decibeles:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setBayesianClarity(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= bayesianClarity ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating 4: Custody Chain */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-700">Confianza que genera la Cadena de Custodia SHA-256 ante el juez:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCustodyChainTrust(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= custodyChainTrust ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating 5: Judicial Report */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                    <span className="text-slate-700">Utilidad práctica del Dictamen Pericial exportable:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setJudicialReportUsability(star)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className={`w-4 h-4 ${star <= judicialReportUsability ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 3: Biggest Friction / What would you improve? */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <label className="block font-bold text-slate-800 text-xs">
                  3. ¿Cuál consideras que es la mayor barrera o aspecto a mejorar actualmente?
                </label>
                <select
                  value={biggestFriction}
                  onChange={(e) => setBiggestFriction(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="La evaluación bayesiana requiere familiarizarse con los decibeles (dB) y probabilidades">
                    La evaluación bayesiana matemática resulta compleja si el abogado o juez no sabe estadística
                  </option>
                  <option value="Me gustaría que la IA proponga directamente el texto del escrito de demanda">
                    Falta un generador automático del texto de la demanda articulado por numerales procesales
                  </option>
                  <option value="A veces se omiten detalles pequeños en chats muy extensos de WhatsApp">
                    En chats muy largos de WhatsApp se omiten detalles contextuales o emojis relevantes
                  </option>
                  <option value="El formato de impresión judicial podría incluir más sellos o membretes oficiales">
                    El diseño del Dictamen judicial necesita más opciones de membrete o carátula de juzgado
                  </option>
                  <option value="El límite de archivos o peso para el plan gratuito">
                    El peso o cantidad de archivos que se pueden subir al mismo tiempo
                  </option>
                  <option value="Ninguna, el sistema funciona de manera fluida y precisa">
                    Ninguna, el sistema cumple y supera las expectativas actuales
                  </option>
                </select>
              </div>

              {/* Question 4: Desired Features Checkboxes */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block font-bold text-slate-800 text-xs">
                  4. ¿Qué nuevas funcionalidades te gustaría ver en las próximas versiones?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  {DESIRED_FEATURE_OPTIONS.map((feat) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <label
                        key={feat}
                        onClick={() => toggleFeature(feat)}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer select-none transition-colors ${
                          isChecked
                            ? "bg-blue-50/70 border-blue-300 text-blue-950 font-medium"
                            : "bg-slate-50/60 border-slate-200 text-slate-600 hover:bg-slate-100/60"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                        />
                        <span className="leading-snug">{feat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Question 5: Open Suggestion Box */}
              <div className="space-y-1.5 pt-1 border-t border-slate-100">
                <label className="block font-bold text-slate-800 text-xs">
                  5. Sugerencia libre, crítica constructiva o caso específico:
                </label>
                <textarea
                  rows={3}
                  value={openSuggestion}
                  onChange={(e) => setOpenSuggestion(e.target.value)}
                  placeholder="Ej: 'Me gustaría que al calcular el vacío probatorio me sugiera el artículo específico del Código Procesal Civil para pedir la exhibición...'"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    title="Copiar las respuestas para pegarlas en un correo o mensaje"
                  >
                    {copiedText ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? "¡Copiado!" : "Copiar Encuesta"}</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Guardar Sugerencia Anónima</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
