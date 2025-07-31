import { X } from 'lucide-react';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  category: 'partido' | 'entrenamiento' | 'finanzas' | 'mercado';
  homeTeam?: string;
  awayTeam?: string;
  homeLogo?: string;
  awayLogo?: string;
  venue?: string;
  weather?: string;
  moral?: string;
}

interface Props {
  event: CalendarEvent;
  onClose: () => void;
}

const EventModal = ({ event, onClose }: Props) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
    <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
      >
        <X size={24} />
      </button>
      <h3 className="text-xl font-bold mb-4">{event.title}</h3>
      {event.category === 'partido' && event.homeTeam && event.awayTeam && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {event.homeLogo && (
              <img src={event.homeLogo} alt={event.homeTeam} className="h-8 w-8 rounded-full" />
            )}
            <span>{event.homeTeam}</span>
          </div>
          <span className="text-sm text-gray-400">vs</span>
          <div className="flex items-center gap-2">
            {event.awayLogo && (
              <img src={event.awayLogo} alt={event.awayTeam} className="h-8 w-8 rounded-full" />
            )}
            <span>{event.awayTeam}</span>
          </div>
        </div>
      )}
      <ul className="space-y-1 text-sm text-gray-300">
        {event.venue && <li>Sede: {event.venue}</li>}
        {event.weather && <li>Clima: {event.weather}</li>}
        {event.moral && <li>Ánimo: {event.moral}</li>}
      </ul>
    </div>
  </div>
);

export default EventModal;
