import React, { useState } from "react";
import {
  BookOpen,
  Scale,
  ShieldCheck,
  Clock,
  ArrowRightLeft,
  ShieldQuestion,
  GitFork,
  FileText,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Layers,
  Activity,
  Calculator,
  ChevronRight,
  ExternalLink,
  Sliders,
  FileCheck,
  Search
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
  const [activeSection, setActiveSection] = useState<
    "overview" | "bayesian" | "chronology" | "custody" | "reports" | "privacy"
  >("overview");

  const [interactivePrior, setInteractivePrior] = useState<number>(50);
  const [interactiveLr, setInteractiveLr] = useState<number>(8.5);
  const [interactiveAuth, setInteractiveAuth] = useState<number>(100);

  // Interactive bayesian formula demonstration in real time
  const priorOdds = interactivePrior / (100 - interactivePrior);
  // Attenuate nominal LR by authenticity level
  const effectiveLr = 1 + (interactiveLr - 1) * (interactiveAuth / 100);
  const posteriorOdds = priorOdds * effectiveLr;
  const posteriorProb = (posteriorOdds / (1 + posteriorOdds)) * 100;
  const weightDb = 10 * Math.log10(Math.max(0.0001, effectiveLr));

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${
        isModal ? "max-w-5xl w-full max-h-[90vh]" : ""
      }`}
    >
      {/* Top Guide Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                Manual de Uso, Interpretación y Métodos Forenses
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Guía Práctica
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Cómo transformar chats, contratos e imágenes en prueba judicial concluyente con rigor matemático
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors self-start sm:self-center"
          >
            Cerrar Guía
          </button>
        )}
      </div>

      {/* Guide Navigation Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 flex items-center gap-1 overflow-x-auto scrollbar-thin">
        <button
          type="button"
          onClick={() => setActiveSection("overview")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "overview"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          <span>1. ¿Cómo te ayuda esta app?</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("bayesian")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "bayesian"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Scale className="w-3.5 h-3.5 text-blue-600" />
          <span>2. Evaluación Bayesiana P(H|E)</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono">
            Matemática
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("chronology")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "chronology"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>3. Cronología & Vacíos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("custody")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "custody"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>4. Cadena de Custodia SHA-256</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("reports")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "reports"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>5. Dictamen Pericial & Exportación</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("privacy")}
          className={`px-3.5 py-3 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
            activeSection === "privacy"
              ? "border-blue-600 text-blue-700 bg-white"
              : "border-transparent text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>6. Privacidad Ley 29733 (Perú)</span>
        </button>
      </div>

      {/* Main Guide Content */}
      <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs leading-relaxed max-h-[75vh]">
        {/* SECTION 1: OVERVIEW & PRACTICAL VALUE */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-200 rounded-xl p-5">
              <h3 className="text-sm font-bold text-blue-950 mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                La Filosofía: La IA extrae datos una sola vez; la matemática y el navegador resuelven el análisis
              </h3>
              <p className="text-slate-700 mt-2 text-xs leading-relaxed">
                Tradicionalmente, el análisis de expedientes digitales (E-Discovery) estaba reservado para grandes firmas con licencias de miles de dólares al mes en herramientas como <em>Relativity</em> o <em>Everlaw</em>. <strong>EvidenciaFácil</strong> democratiza este acceso para ciudadanos, abogados litigantes y peritos mediante una arquitectura <strong>Local-First</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-2xs">
                  <span className="font-bold text-slate-900 block text-xs mb-1">
                    1. Cero Costos de Hosting y DB
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Tus archivos se procesan en la memoria RAM de tu navegador. No hay base de datos remota ni servidores privados reteniendo tus chats.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-2xs">
                  <span className="font-bold text-slate-900 block text-xs mb-1">
                    2. Trazabilidad Forzada 1:1
                  </span>
                  <p className="text-[11px] text-slate-600">
                    Cero alucinaciones: cada fecha, afirmación o contradicción cita textualmente el fragmento exacto del documento de origen.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-lg border border-blue-200 shadow-2xs">
                  <span className="font-bold text-slate-900 block text-xs mb-1">
                    3. Cálculo Matemático Puro
                  </span>
                  <p className="text-[11px] text-slate-600">
                    La convicción probatoria no es una opinión arbitraria de la IA: se calcula con el Teorema de Bayes en JavaScript sin volver a gastar tokens.
                  </p>
                </div>
              </div>
            </div>

            {/* Practical Real-World Scenarios */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¿En qué situaciones concretas te ayuda esta herramienta?
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                    <span className="text-base">💼</span>
                    <span>1. Juicios Laborales (Despido, Horas Extra, Hostigamiento)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Sube las capturas de WhatsApp donde tu empleador te asignaba tareas fuera de horario, mensajes de audio transcritos y cartas de despido.
                  </p>
                  <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 rounded p-2">
                    <strong>Resultado clave:</strong> Genera una cronología exacta minuto a minuto que acredita la subordinación y desbarata las negativas de la empresa.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                    <span className="text-base">📄</span>
                    <span>2. Conflictos Contractuales y Cobro de Facturas / Honorarios</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Sube el contrato marco original junto con correos o chats donde el cliente te pidió cambios o aceptó verbalmente prórrogas de entrega.
                  </p>
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded p-2">
                    <strong>Resultado clave:</strong> Demuestra que la "mora" alegada por la otra parte fue en realidad autorizada tácitamente por ellos mismos.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                    <span className="text-base">🏠</span>
                    <span>3. Inquilinato, Arriendos y Desalojos</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Sube comprobantes de transferencias bancarias, fotos de reparaciones del inmueble y chats con el arrendador.
                  </p>
                  <div className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-100 rounded p-2">
                    <strong>Resultado clave:</strong> Acredita el cumplimiento de pago y la entrega en fecha, evitando retenciones indebidas de la garantía.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-1.5">
                    <span className="text-base">🛒</span>
                    <span>4. Reclamos de Consumidor y Garantías Comerciales</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                    Sube capturas de compras online, tickets de soporte técnico que nunca respondieron y correos con el comercio.
                  </p>
                  <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">
                    <strong>Resultado clave:</strong> Identifica el "Silencio Procesal" (vacío probatorio del proveedor) listo para presentar ante autoridades de consumo (ej. INDECOPI).
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action to try samples */}
            {onLoadSample && (
              <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-xs block text-amber-400">¿Quieres verlo en acción ahora mismo?</span>
                  <span className="text-[11px] text-slate-300">
                    Carga un caso real simulado con contratos, chats y peritajes precomputados con 1 solo clic.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSample("disputa-contractual");
                      if (onClose) onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Cargar Disputa Contrato & Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadSample("caso-laboral");
                      if (onClose) onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-lg transition-colors border border-slate-700"
                  >
                    Cargar Caso Laboral
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: BAYESIAN EVALUATION & FORMULAS */}
        {activeSection === "bayesian" && (
          <div className="space-y-6">
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 text-blue-950">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-blue-900">
                    ¿Qué es la Evaluación Bayesiana en el Derecho Procesal?
                  </h3>
                  <p className="text-xs text-blue-900/90 mt-1 leading-relaxed">
                    En los tribunales, los jueces no operan con "certezas absolutas", sino con el estándar de <strong>la sana crítica</strong> y la <strong>probabilidad prevaleciente</strong> (o más allá de toda duda razonable en materia penal).
                    El <strong>Teorema de Bayes</strong> es el método matemático estándar internacional (empleado por el FBI, la Real Sociedad Estadística Británica y ciencias forenses) para calcular cómo cada nueva prueba cambia la probabilidad de que una hipótesis sea cierta.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Concepts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-blue-100 text-blue-800 flex items-center justify-center font-mono text-[11px] font-bold">
                    P(H)
                  </span>
                  <span>Probabilidad A Priori (El Punto de Partida)</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Es la probabilidad inicial de la hipótesis antes de revisar las pruebas. En un juicio suele fijarse en <strong>50% (0.50)</strong>, representando la neutralidad judicial y la presunción de inocencia (equilibrio de la balanza).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center font-mono text-[11px] font-bold">
                    P(H|E)
                  </span>
                  <span>Probabilidad A Posteriori (El Veredicto Matemático)</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Es la probabilidad final de que la hipótesis sea cierta <strong>una vez evaluadas todas las evidencias aportadas</strong>. Si supera el <strong>80% o 90%</strong>, el caso cuenta con un respaldo probatorio abrumador.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-mono text-[11px] font-bold">
                    LR
                  </span>
                  <span>Razón de Verosimilitud (Likelihood Ratio)</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Mide qué tan discriminante es una prueba: <code>P(E|H) / P(E|~H)</code>.
                  ¿Es más probable ver esta conversación si el acuerdo existió que si el acuerdo fuera una farsa? Un LR de 10 significa que la prueba es 10 veces más probable si dices la verdad.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-purple-100 text-purple-800 flex items-center justify-center font-mono text-[11px] font-bold">
                    dB
                  </span>
                  <span>Peso de la Evidencia en Decibeles (Escala de Alan Turing)</span>
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Para no multiplicar números complejos, el matemático Alan Turing ideó medir la evidencia en <strong>decibeles (dB = 10 * log10(LR))</strong>.
                  Las pruebas se suman directamente:
                  <br />
                  • <strong>+20 dB:</strong> Concluyente (casi irrefutable).
                  <br />
                  • <strong>+10 a +20 dB:</strong> Convicción Fuerte.
                  <br />
                  • <strong>+3 a +10 dB:</strong> Moderada.
                  <br />
                  • <strong>&lt; 0 dB:</strong> Desfavorece la hipótesis (favorece al contrario).
                </p>
              </div>
            </div>

            {/* 2-Level Cascaded Inference Explanation */}
            <div className="p-4 rounded-xl border-2 border-indigo-200 bg-indigo-50/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Novedad Forense: Inferencia en Cascada de 2 Niveles (Modelo de Schum)</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                ¿Qué ocurre si la contraparte objeta un pantallazo de WhatsApp alegando: <em>"Esa imagen pudo ser trucada"</em>?
                En nuestra herramienta, no tienes que descartar la prueba por completo. Puedes ajustar el <strong>Deslizador de Autenticidad / Integridad (0% a 100%)</strong>:
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-5">
                <li>
                  <strong>Si la prueba está 100% autenticada</strong> (ej. con acta notarial o cotejo pericial), aporta su 100% de fuerza en decibeles.
                </li>
                <li>
                  <strong>Si la prueba es impugnada a 50% de sospecha</strong>, su fuerza probatoria se reduce automáticamente a la mitad sin que tengas que volver a llamar a la IA ni gastar dinero.
                </li>
              </ul>
            </div>

            {/* Interactive Calculator Playground */}
            <div className="p-5 rounded-xl border border-slate-300 bg-white space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Simulador Interactivo del Teorema de Bayes
                </span>
                <span className="text-[11px] text-slate-400">Prueba los controles en tiempo real:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Probabilidad Inicial P(H)</span>
                    <span className="font-mono text-blue-600">{interactivePrior}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={interactivePrior}
                    onChange={(e) => setInteractivePrior(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">50% = Presunción Neutral</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Fuerza de la Prueba (LR)</span>
                    <span className="font-mono text-amber-600">{interactiveLr}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="0.5"
                    value={interactiveLr}
                    onChange={(e) => setInteractiveLr(Number(e.target.value))}
                    className="w-full accent-amber-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Cuánto favorece tu hipótesis</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                    <span>Autenticidad de la Prueba</span>
                    <span className="font-mono text-indigo-600">{interactiveAuth}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={interactiveAuth}
                    onChange={(e) => setInteractiveAuth(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">Bájalo si la contraparte la impugna</span>
                </div>
              </div>

              {/* Real-time result banner */}
              <div className="p-3.5 rounded-lg bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Probabilidad Final P(H|E)
                    </span>
                    <span className="text-2xl font-bold font-mono text-emerald-400">
                      {posteriorProb.toFixed(1)}%
                    </span>
                  </div>
                  <div className="border-l border-slate-700 pl-3">
                    <span className="text-[10px] text-slate-400 uppercase font-mono block">
                      Peso en Decibeles (Turing)
                    </span>
                    <span className="text-sm font-bold font-mono text-amber-300">
                      +{weightDb.toFixed(1)} dB
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px]">
                  <span className="px-2 py-1 rounded bg-slate-800 text-emerald-300 border border-slate-700 font-semibold inline-block">
                    {posteriorProb >= 90
                      ? "Convicción Plena (Casi Irrefutable)"
                      : posteriorProb >= 75
                      ? "Probabilidad Prevaleciente Fuerte"
                      : posteriorProb >= 50
                      ? "Indicio Favorable Débil"
                      : "Insuficiencia Probatoria"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: CHRONOLOGY, CONTRADICTIONS & GAPS */}
        {activeSection === "chronology" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Línea de Tiempo Procesal</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Todos los acontecimientos extraídos de fotos, correos y chats se ordenan cronológicamente de forma exacta en tu navegador. Puedes filtrar por persona involucrada o relevancia procesal (Alta, Media, Baja).
                </p>
                <div className="text-[10px] bg-slate-100 rounded p-2 text-slate-600">
                  <strong>Tip Litigante:</strong> Haz clic en cualquier hecho para abrir el modal de inspección y copiar la cita literal exacta para tu demanda.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ArrowRightLeft className="w-4 h-4 text-rose-600" />
                  <span>Detección de Contradicciones</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Compara visualmente la <strong>Versión A (ej. lo dicho en un correo formal)</strong> frente a la <strong>Versión B (ej. lo admitido en un audio o chat informal)</strong>.
                </p>
                <div className="text-[10px] bg-rose-50 border border-rose-200 rounded p-2 text-rose-800">
                  <strong>Impacto procesal:</strong> Esencial para contrainterrogar a la contraparte o testigos y evidenciar faltas a la verdad.
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <ShieldQuestion className="w-4 h-4 text-amber-600" />
                  <span>Vacíos Probatorios Automáticos</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Un algoritmo matemático en JavaScript detecta automáticamente <strong>"silencios procesales" (más de 30 días sin comunicación entre las partes)</strong> sin gastar tokens de la IA.
                </p>
                <div className="text-[10px] bg-amber-50 border border-amber-200 rounded p-2 text-amber-800">
                  <strong>Diligencias sugeridas:</strong> Te indica qué oficios bancarios, peritajes o requerimientos solicitar al juez para tapar esos huecos.
                </div>
              </div>
            </div>

            {/* Grafo Argumental */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-indigo-950 text-xs">
                <GitFork className="w-4 h-4 text-indigo-600" />
                <span>Mapeo Argumentativo (Modelo de Stephen Toulmin)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                El derecho exige que una afirmación no sea solo un deseo, sino un argumento estructurado. El sistema conecta automáticamente:
                <br />
                <strong>Pretensión (Conclusión)</strong> ← <strong>Datos fácticos (Hechos probados)</strong> ← <strong>Garantías y Refutaciones</strong>.
                Esto te permite redactar la sección de "Fundamentos de Hecho y Derecho" de tu escrito con coherencia lógica formal.
              </p>
            </div>
          </div>
        )}

        {/* SECTION 4: CHAIN OF CUSTODY (SHA-256) */}
        {activeSection === "custody" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-emerald-900">
                  ¿Por qué la Cadena de Custodia con SHA-256 es vital en juicio?
                </h3>
                <p className="text-xs text-emerald-900/90 mt-1 leading-relaxed">
                  En los tribunales, los abogados de la contraparte siempre intentan desacreditar las capturas de WhatsApp o PDFs diciendo: <em>"Esa prueba pudo haber sido modificada con Photoshop o alterada antes de imprimirse"</em>.
                  La norma internacional <strong>ISO/IEC 27037</strong> (Preservación de Evidencia Digital) establece que todo archivo digital debe tener una <strong>huella criptográfica fija</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 block">¿Qué hace el algoritmo SHA-256?</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Es una función matemática unidireccional que convierte cualquier archivo en una firma de 64 caracteres hexadecimales.
                  Si un solo píxel o una coma del archivo cambia, el hash resultante es completamente diferente. Si el hash que presentaste coincide con el archivo original, <strong>queda demostrado matemáticamente que nadie lo ha alterado</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="text-xs font-bold text-slate-900 block">Herramientas incluidas en la sección:</span>
                <ul className="text-[11px] text-slate-600 space-y-1.5 list-disc pl-4">
                  <li>
                    <strong>"Copiar Acta para Demanda":</strong> Genera un texto formal listo para pegar como otrosí probatorio en tu escrito judicial.
                  </li>
                  <li>
                    <strong>"Descargar .TXT":</strong> Guarda un archivo de texto con todas las huellas de tus pruebas para acompañar a tu expediente electrónico o memoria USB.
                  </li>
                  <li>
                    <strong>Buscador por Hash:</strong> Encuentra instantáneamente cualquier archivo entre docenas de documentos mediante su huella.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: REPORTS & EXPORT */}
        {activeSection === "reports" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center gap-2 font-bold text-purple-950 text-xs">
                <FileText className="w-4 h-4 text-purple-600" />
                <span>Dictamen Pericial Judicial de Evidencia Digital</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed">
                El sistema cuenta con un generador de dictámenes forenses oficiales con formato formal para presentar ante juzgados de paz, juzgados civiles, laborales o tribunales arbitrales:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <span className="font-bold text-slate-900 block text-xs">1. Metadatos Editables</span>
                  <span className="text-[10px] text-slate-500">
                    Puedes escribir el número de causa/expediente, el tribunal u órgano judicial y el nombre del perito o abogado firmante.
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <span className="font-bold text-slate-900 block text-xs">2. Impresión Directa / PDF</span>
                  <span className="text-[10px] text-slate-500">
                    Formato membretado con tablas de trazabilidad 1:1, evaluación de verosimilitud y huellas SHA-256.
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-purple-200">
                  <span className="font-bold text-slate-900 block text-xs">3. Exportación Multiformato</span>
                  <span className="text-[10px] text-slate-500">
                    Descarga en Markdown (.md), HTML independiente o cópialo directamente al portapapeles.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: PRIVACY & PERU LEY 29733 */}
        {activeSection === "privacy" && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-950 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-emerald-900">
                  Compromiso Absoluto de Privacidad y Cero Servidores Privados (Ley N° 29733)
                </h3>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  Sabemos que los chats de WhatsApp, contratos y fotos familiares contienen datos sumamente sensibles y confidenciales. La arquitectura de esta plataforma ha sido diseñada bajo el principio de <strong>Privacy by Design</strong>:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  1. Cero Servidores Privados & Cero Base de Datos
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Sus archivos y textos <strong>NO se guardan en ningún servidor privado</strong>, servidor FTP ni base de datos de terceros.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  2. El Administrador NO puede ver tus chats
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  El creador del software <strong>no tiene forma técnica ni acceso alguno para ver, espiar, registrar ni descargar sus documentos</strong>. No existen paneles de administración con visibilidad de datos.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  3. Persistencia Única en su Dispositivo (localStorage)
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Si recarga la página, el caso se restaura desde la memoria local de su propio navegador web. Al hacer clic en <strong>"Nuevo Análisis"</strong>, todo se borra inmediatamente.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <span className="font-bold text-slate-900 text-xs block">
                  4. Cumplimiento Ley Peruana N° 29733
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Respeta los principios de Finalidad, Proporcionalidad y Seguridad de la Ley de Protección de Datos Personales del Perú y su Reglamento (D.S. 003-2013-JUS).
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Guide Footer */}
      <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="font-bold text-slate-700">EvidenciaFácil</span>
          <span>·</span>
          <span>Guía Metodológica para Litigantes y Ciudadanos</span>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-2xs"
            >
              Comprendido, ir a la aplicación
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
