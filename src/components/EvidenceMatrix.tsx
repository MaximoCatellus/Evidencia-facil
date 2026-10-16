import React, { useState, useMemo } from "react";
import {
  Table as TableIcon,
  Search,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Filter
} from "lucide-react";
import { TimelineEvent } from "../types/ediscovery";

interface EvidenceMatrixProps {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
}

export const EvidenceMatrix: React.FC<EvidenceMatrixProps> = ({
  events,
  onSelectEvent
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<string>("all");
  const [selectedRelevance, setSelectedRelevance] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allPersons = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => ev.personas_involucradas?.forEach((p) => set.add(p)));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchSearch =
        ev.hecho.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.cita_o_referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.fuente_documental.toLowerCase().includes(searchTerm.toLowerCase());

      const matchPerson =
        selectedPerson === "all" ||
        ev.personas_involucradas?.some((p) => p.toLowerCase().includes(selectedPerson.toLowerCase()));

      const matchRelevance =
        selectedRelevance === "all" || ev.relevancia === selectedRelevance;

      return matchSearch && matchPerson && matchRelevance;
    });
  }, [events, searchTerm, selectedPerson, selectedRelevance]);

  const handleCopyCitation = (event: TimelineEvent) => {
    const citationText = `[HECHO ${event.id} - ${event.fecha_hora}] ${event.hecho} | Fuente: ${event.fuente_documental} | Cita: "${event.cita_o_referencia}"`;
    navigator.clipboard.writeText(citationText);
    setCopiedId(event.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-slate-700" />
            <span>Matriz de Pruebas y Trazabilidad Documental</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {filteredEvents.length} registros
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tabla consolidada para preparación de interrogatorios, contestación de demanda o alegatos de clausura.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar término probatorio..."
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg w-48 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            />
          </div>

          {/* Filter by Person */}
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            aria-label="Filtrar por interviniente"
            className="text-xs py-1.5 px-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="all">Todos los intervinientes</option>
            {allPersons.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          {/* Filter by Relevance */}
          <select
            value={selectedRelevance}
            onChange={(e) => setSelectedRelevance(e.target.value)}
            aria-label="Filtrar por relevancia procesal"
            className="text-xs py-1.5 px-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700"
          >
            <option value="all">Todas las relevancias</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-28">Fecha / ID</th>
              <th className="py-3 px-3">Hecho Fáctico</th>
              <th className="py-3 px-3 w-40">Intervinientes</th>
              <th className="py-3 px-3">Soporte Literal (Cita)</th>
              <th className="py-3 px-3 w-44">Fuente Documental</th>
              <th className="py-3 px-3 w-24">Relevancia</th>
              <th className="py-3 px-3 w-20 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No se encontraron hechos procesales con los criterios indicados.
                </td>
              </tr>
            ) : (
              filteredEvents.map((ev) => (
                <tr
                  key={ev.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Date & ID */}
                  <td className="py-3 px-3 align-top">
                    <span className="font-mono text-slate-900 block font-semibold">
                      {ev.fecha_hora}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ev.id}
                    </span>
                  </td>

                  {/* Fact */}
                  <td className="py-3 px-3 align-top">
                    <p className="font-medium text-slate-900 leading-snug">
                      {ev.hecho}
                    </p>
                    {ev.analisis_procesal && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        {ev.analisis_procesal}
                      </p>
                    )}
                  </td>

                  {/* Parties */}
                  <td className="py-3 px-3 align-top text-slate-600">
                    {ev.personas_involucradas && ev.personas_involucradas.length > 0 ? (
                      <div className="space-y-0.5">
                        {ev.personas_involucradas.map((p, idx) => (
                          <div key={idx} className="truncate" title={p}>
                            {p}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">No especificado</span>
                    )}
                  </td>

                  {/* Citation */}
                  <td className="py-3 px-3 align-top italic text-slate-700 bg-slate-50/30">
                    <span className="line-clamp-3">"{ev.cita_o_referencia}"</span>
                  </td>

                  {/* Document Source */}
                  <td className="py-3 px-3 align-top">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(ev)}
                      className="text-blue-700 hover:text-blue-900 font-medium inline-flex items-center gap-1 group-hover:underline text-left max-w-full truncate"
                      title="Inspeccionar archivo fuente"
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{ev.fuente_documental}</span>
                    </button>
                  </td>

                  {/* Relevance */}
                  <td className="py-3 px-3 align-top">
                    <span
                      className={`font-semibold ${
                        ev.relevancia === "Alta"
                          ? "text-rose-700"
                          : ev.relevancia === "Media"
                          ? "text-amber-700"
                          : "text-slate-500"
                      }`}
                    >
                      {ev.relevancia}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 align-top text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyCitation(ev)}
                      className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Copiar extracto al portapapeles"
                    >
                      {copiedId === ev.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
