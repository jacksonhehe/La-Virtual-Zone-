import { lazy, Suspense, useEffect, useState } from 'react';
import type { EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import DtMenuTabs from '../components/DtMenuTabs';
import EventModal, { CalendarEvent } from '../components/calendar/EventModal';
import CardSkeleton from '../components/common/CardSkeleton';
import fixtures from '../data/fixtures.json';
import { VZ_CALENDAR_PREFS_KEY } from '../utils/storageKeys';

const FullCalendar = lazy(() => import('@fullcalendar/react'));

interface Filters {
  partidos: boolean;
  entrenos: boolean;
  finanzas: boolean;
  mercado: boolean;
}

const defaultFilters: Filters = {
  partidos: true,
  entrenos: true,
  finanzas: true,
  mercado: true
};

const Calendario = () => {
  const [filters, setFilters] = useState<Filters>(() => {
    const saved = localStorage.getItem(VZ_CALENDAR_PREFS_KEY);
    return saved ? JSON.parse(saved) : defaultFilters;
  });
  const [selected, setSelected] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    localStorage.setItem(VZ_CALENDAR_PREFS_KEY, JSON.stringify(filters));
  }, [filters]);

  const handleEventClick = (arg: EventClickArg) => {
    const event = fixtures.find(f => f.id === arg.event.id);
    if (event) setSelected(event);
  };

  const filteredEvents = fixtures.filter(ev => {
    if (ev.category === 'partido' && !filters.partidos) return false;
    if (ev.category === 'entrenamiento' && !filters.entrenos) return false;
    if (ev.category === 'finanzas' && !filters.finanzas) return false;
    if (ev.category === 'mercado' && !filters.mercado) return false;
    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <DtMenuTabs />
      <h1 className="mb-4 text-2xl font-bold">Calendario</h1>
      <div className="mb-4 flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.partidos}
            onChange={() => setFilters(f => ({ ...f, partidos: !f.partidos }))}
          />
          Partidos
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.entrenos}
            onChange={() => setFilters(f => ({ ...f, entrenos: !f.entrenos }))}
          />
          Entrenamientos
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.finanzas}
            onChange={() => setFilters(f => ({ ...f, finanzas: !f.finanzas }))}
          />
          Finanzas
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={filters.mercado}
            onChange={() => setFilters(f => ({ ...f, mercado: !f.mercado }))}
          />
          Mercado
        </label>
      </div>
      <Suspense fallback={<CardSkeleton lines={4} /> }>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={filteredEvents}
          eventClick={handleEventClick}
        />
      </Suspense>
      {selected && <EventModal event={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Calendario;
