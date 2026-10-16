import React, { useState, useMemo } from "react";
import {
  Clock,
  FileText,
  Search,
  Filter,
  ExternalLink,
  ChevronRight,
  ArrowUpDown,
  User,
  Quote
} from "lucide-react";
import { TimelineEvent } from "../types/ediscovery";

interface TimelineViewProps {
  events: TimelineEvent[];
  onSelectEvent: (event: TimelineEvent) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  onSelectEvent
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [relevanceFilter, setRelevanceFilter] = useState<string>("all");
  const [personFilter, setPersonFilter] = useState<string>("all");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  // Extract unique persons for filter dropdown
  const allPersons = useMemo(() => {
    const set = new Set<string>();
    events.forEach((ev) => {
      ev.personas_involucradas?.forEach((p) => set.add(p));
    });
    return Array.from(set).sort();
  }, [events]);

  // Filtered and sorted events
  const filteredEvents = useMemo(() => {
    return events
      .filter((ev) => {
        const matchesSearch =
          ev.hecho.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.cita_o_referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.fuente_documental.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.tipo_evento?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRelevance =
          relevanceFilter === "all" || ev.relevancia === relevanceFilter;

        const matchesPerson =
          personFilter === "all" ||
          ev.personas_involucradas?.some((p) => p.toLowerCase().includes(personFilter.toLowerCase()));

        return matchesSearch && matchesRelevance && matchesPerson;
      })
      .sort((a, b) => {
        const dateA = new Date(a.fecha_hora).getTime() || 0;
        const dateB = new Date(b.fecha_hora).getTime() || 0;
        return sortAsc ? dateA - dateB : dateB - dateA;
      });
  }, [events, searchTerm, relevanceFilter, personFilter, sortAsc]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      {/* View Header & Interactive Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-700" />
            <span>Línea de Tiempo Procesal</span>
            <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {filteredEvents.length} de {events.length} hechos
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Secuencia fáctica cronológica con trazabilidad al documento original y cita textual.
          </p>
        </div>

        {/* Filter Controls (Segmented buttons & inputs) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en hechos o citas..."
              className="text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg w-44 sm:w-56 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50"
            />
          </div>

          {/* Relevance Segmented Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setRelevanceFilter("all")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                relevanceFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setRelevanceFilter("Alta")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                relevanceFilter === "Alta"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-rose-700"
              }`}
            >
              Alta
            </button>
            <button
              type="button"
              onClick={() => setRelevanceFilter("Media")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                relevanceFilter === "Media"
                  ? "bg-white text-amber-700 shadow-xs"
                  : "text-slate-600 hover:text-amber-700"
              }`}
            >
              Media
            </button>
          </div>

          {/* Filter by Person */}
          {allPersons.length > 0 && (
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              aria-label="Filtrar hechos por persona involucrada"
              className="text-xs py-1.5 px-2.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Todas las personas</option>
              {allPersons.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          )}

          {/* Sort Order Toggle */}
          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            title={sortAsc ? "Orden cronológico ascendente" : "Orden cronológico descendente"}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="mt-8 relative">
        {/* Continuous vertical line */}
        <div className="absolute left-4 sm:left-6 top-3 bottom-3 w-0.5 bg-slate-200" />

        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No se encontraron hechos que coincidan con los filtros aplicados.
            </div>
          ) : (
            filteredEvents.map((event, idx) => (
              <div key={event.id || idx} className="relative pl-11 sm:pl-16 group">
                {/* Node indicator */}
                <div
                  className={`absolute left-2.5 sm:left-4.5 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full border-2 bg-white transition-transform group-hover:scale-125 ${
                    event.relevancia === "Alta"
                      ? "border-rose-600 bg-rose-50"
                      : event.relevancia === "Media"
                      ? "border-amber-500 bg-amber-50"
                      : "border-slate-400 bg-slate-50"
                  }`}
                />

                {/* Event Card */}
                <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-xs transition-all">
                  {/* Clean unboxed metadata header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 font-mono">
                        {event.fecha_hora}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-600 font-medium">
                        {event.tipo_evento || "Hecho Procesal"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-medium ${
                          event.relevancia === "Alta"
                            ? "text-rose-700"
                            : event.relevancia === "Media"
                            ? "text-amber-700"
                            : "text-slate-500"
                        }`}
                      >
                        Relevancia {event.relevancia}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      ID: {event.id}
                    </span>
                  </div>

                  {/* Fact description */}
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {event.hecho}
                  </h4>

                  {/* Literal quotation / source evidence citation */}
                  <div className="mt-3 p-3 rounded-lg bg-slate-50 border-l-2 border-slate-400 text-xs text-slate-700 italic">
                    <div className="flex items-start gap-2">
                      <Quote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">"{event.cita_o_referencia}"</span>
                    </div>
                  </div>

                  {/* Procedural relevance analysis */}
                  {event.analisis_procesal && (
                    <p className="mt-2 text-xs text-slate-600 leading-normal">
                      <strong className="text-slate-700 font-medium">Pertinencia procesal: </strong>
                      {event.analisis_procesal}
                    </p>
                  )}

                  {/* Footer: Parties involved & Document link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {/* People */}
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {event.personas_involucradas && event.personas_involucradas.length > 0
                          ? event.personas_involucradas.join(" · ")
                          : "Intervinientes en autos"}
                      </span>
                    </div>

                    {/* Source File Trigger */}
                    <button
                      type="button"
                      onClick={() => onSelectEvent(event)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50/70 hover:bg-blue-100/70 px-2.5 py-1 rounded transition-colors"
                      title="Ver trazabilidad al documento fuente"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{event.fuente_documental}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
