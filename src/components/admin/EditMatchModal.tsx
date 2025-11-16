import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Match } from '../../types';

interface EditMatchModalProps {
  match: Match & { tournamentName?: string };
  onClose: () => void;
  onSave: (data: Partial<Match>) => void;
  teams: string[];
}

const EditMatchModal = ({ match, onClose, onSave, teams }: EditMatchModalProps) => {
  const [date, setDate] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [status, setStatus] = useState<'scheduled' | 'live' | 'finished'>('scheduled');
  const [round, setRound] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Formatear fecha para input datetime-local
    const matchDate = new Date(match.date);
    const localDate = new Date(matchDate.getTime() - matchDate.getTimezoneOffset() * 60000);
    setDate(localDate.toISOString().slice(0, 16));
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setHomeScore(match.homeScore?.toString() || '');
    setAwayScore(match.awayScore?.toString() || '');
    setStatus(match.status);
    setRound(match.round);
  }, [match]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!date || !homeTeam || !awayTeam) {
      setError('Completa fecha y equipos');
      return;
    }

    if (homeTeam === awayTeam) {
      setError('Los equipos deben ser distintos');
      return;
    }

    if (status === 'finished' && (homeScore === '' || awayScore === '')) {
      setError('Los partidos finalizados deben tener resultado');
      return;
    }

    const updateData: Partial<Match> = {
      date: new Date(date).toISOString(),
      homeTeam,
      awayTeam,
      status,
      round,
    };

    if (status === 'finished' || status === 'live') {
      updateData.homeScore = homeScore ? parseInt(homeScore) : undefined;
      updateData.awayScore = awayScore ? parseInt(awayScore) : undefined;
    }

    onSave(updateData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold mb-4">Editar Partido</h3>
        {match.tournamentName && (
          <p className="text-sm text-gray-400 mb-4">Torneo: {match.tournamentName}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Equipo local</label>
            <select
              className="input w-full"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              required
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Equipo visitante</label>
            <select
              className="input w-full"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              required
            >
              {teams.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Ronda</label>
            <input
              type="number"
              className="input w-full"
              value={round}
              onChange={(e) => setRound(parseInt(e.target.value) || 1)}
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select
              className="input w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'scheduled' | 'live' | 'finished')}
              required
            >
              <option value="scheduled">Programado</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>

          {(status === 'live' || status === 'finished') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Goles local</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    min="0"
                    required={status === 'finished'}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Goles visitante</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    min="0"
                    required={status === 'finished'}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMatchModal;

