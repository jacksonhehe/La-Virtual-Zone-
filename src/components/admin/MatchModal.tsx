import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Match } from '../../types';

interface Props {
  onClose: () => void;
  tournamentId: string;
  match?: Match;
}

const MatchModal = ({ onClose, tournamentId, match }: Props) => {
  const { clubs, addMatch, updateMatch } = useDataStore();
  const editing = Boolean(match);

  const [homeTeam, setHomeTeam] = useState(match?.homeTeam || clubs[0]?.name || '');
  const [awayTeam, setAwayTeam] = useState(match?.awayTeam || clubs[1]?.name || '');
  const [date, setDate] = useState(match ? match.date.slice(0,16) : '');
  const [round, setRound] = useState(match?.round || 1);
  const [homeScore, setHomeScore] = useState(match?.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState(match?.awayScore?.toString() || '');
  const [status, setStatus] = useState<Match['status']>(match?.status || 'scheduled');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!homeTeam || !awayTeam || !date) {
      setError('Completa todos los campos');
      return;
    }

    const newMatch: Match = {
      id: match?.id || `${Date.now()}`,
      tournamentId,
      round: Number(round),
      date: new Date(date).toISOString(),
      homeTeam,
      awayTeam,
      status,
    };

    if (homeScore !== '' && awayScore !== '') {
      newMatch.homeScore = Number(homeScore);
      newMatch.awayScore = Number(awayScore);
    }

    if (editing) {
      updateMatch(tournamentId, newMatch);
    } else {
      addMatch(tournamentId, newMatch);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">{editing ? 'Editar Partido' : 'Nuevo Partido'}</h3>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Local</label>
            <select className="input w-full" value={homeTeam} onChange={e => setHomeTeam(e.target.value)}>
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Visitante</label>
            <select className="input w-full" value={awayTeam} onChange={e => setAwayTeam(e.target.value)}>
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
            <input type="datetime-local" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Jornada</label>
            <input type="number" className="input w-full" value={round} onChange={e => setRound(Number(e.target.value))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goles Local</label>
              <input type="number" className="input w-full" value={homeScore} onChange={e => setHomeScore(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Goles Visitante</label>
              <input type="number" className="input w-full" value={awayScore} onChange={e => setAwayScore(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select className="input w-full" value={status} onChange={e => setStatus(e.target.value as Match['status'])}>
              <option value="scheduled">Programado</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">{editing ? 'Guardar' : 'Crear'}</button>
        </form>
      </div>
    </div>
  );
};

export default MatchModal;
