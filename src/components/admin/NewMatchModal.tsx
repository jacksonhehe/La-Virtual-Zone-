import { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { Tournament } from '../../types';

interface NewMatchModalProps {
  onClose: () => void;
  onCreate: (data: { date: string; homeTeam: string; awayTeam: string; tournamentId?: string }) => void;
  teams: string[];
  tournaments?: Tournament[];
  defaultTournamentId?: string;
}

const NewMatchModal = ({ onClose, onCreate, teams, tournaments, defaultTournamentId }: NewMatchModalProps) => {
  const [date, setDate] = useState<string>('');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(defaultTournamentId || '');
  const [home, setHome] = useState<string>(teams[0] || '');
  const [away, setAway] = useState<string>(teams[1] || '');
  const [error, setError] = useState<string | null>(null);

  // Obtener equipos del torneo seleccionado o todos los equipos
  const availableTeams = useMemo(() => {
    if (tournaments && selectedTournamentId) {
      const tournament = tournaments.find(t => t.id === selectedTournamentId);
      return tournament?.teams || teams;
    }
    return teams;
  }, [tournaments, selectedTournamentId, teams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!date || !home || !away) {
      setError('Completa fecha y equipos');
      return;
    }
    if (home === away) {
      setError('Los equipos deben ser distintos');
      return;
    }
    if (tournaments && tournaments.length > 0 && !selectedTournamentId) {
      setError('Selecciona un torneo');
      return;
    }
    onCreate({ 
      date, 
      homeTeam: home, 
      awayTeam: away,
      tournamentId: selectedTournamentId || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Añadir Partido</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
          {tournaments && tournaments.length > 0 && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Torneo</label>
              <select
                className="input w-full"
                value={selectedTournamentId}
                onChange={(e) => {
                  setSelectedTournamentId(e.target.value);
                  setHome('');
                  setAway('');
                }}
                required
              >
                <option value="">Selecciona un torneo</option>
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha</label>
            <input type="datetime-local" className="input w-full" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Local</label>
            <select className="input w-full" value={home} onChange={(e) => setHome(e.target.value)} required>
              <option value="">Selecciona equipo local</option>
              {availableTeams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Visitante</label>
            <select className="input w-full" value={away} onChange={(e) => setAway(e.target.value)} required>
              <option value="">Selecciona equipo visitante</option>
              {availableTeams.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary">Añadir</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewMatchModal;

