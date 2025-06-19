import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Tournament, Match } from '../../types';

interface ResultModalProps {
  tournament: Tournament;
  onClose: () => void;
}

const MatchResultModal = ({ tournament, onClose }: ResultModalProps) => {
  const { tournaments, updateTournaments } = useDataStore();
  const pending = tournament.matches.filter(m => m.status !== 'finished');
  const [matchId, setMatchId] = useState(pending[0]?.id || '');
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchId) return;
    const updated = tournaments.map(t => {
      if (t.id !== tournament.id) return t;
      const matches = t.matches.map(m =>
        m.id === matchId ? { ...m, homeScore: home, awayScore: away, status: 'finished' } : m
      );
      const resultMatch = matches.find(m => m.id === matchId) as Match;
      return { ...t, matches, results: [...(t.results || []), resultMatch] };
    });
    updateTournaments(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Ingresar Resultado</h3>
        {pending.length === 0 ? (
          <p>No hay partidos pendientes.</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Partido</label>
              <select className="input w-full" value={matchId} onChange={e => setMatchId(e.target.value)}>
                {pending.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.homeTeam} vs {m.awayTeam}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Local</label>
                <input type="number" className="input w-full" value={home} onChange={e => setHome(Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Visitante</label>
                <input type="number" className="input w-full" value={away} onChange={e => setAway(Number(e.target.value))} />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full">Guardar</button>
          </form>
        )}
      </div>
    </div>
  );
};

interface WinnerModalProps {
  tournament: Tournament;
  onClose: () => void;
}

const WinnerModal = ({ tournament, onClose }: WinnerModalProps) => {
  const { tournaments, updateTournaments } = useDataStore();
  const [winner, setWinner] = useState(tournament.winner || tournament.teams[0] || '');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winner) return;
    const updated = tournaments.map(t =>
      t.id === tournament.id ? { ...t, winner, status: 'finished' } : t
    );
    updateTournaments(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Marcar Campeón</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Equipo</label>
            <select className="input w-full" value={winner} onChange={e => setWinner(e.target.value)}>
              {tournament.teams.map(team => (
                <option key={team} value={team}>
                  {team}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </div>
    </div>
  );
};

const TournamentsAdminPanel = () => {
  const { tournaments, addTournament } = useDataStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'cup' | 'friendly'>('league');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState<Tournament | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showWinner, setShowWinner] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) return;
    const newTournament: Tournament = {
      id: `${Date.now()}`,
      name,
      type,
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=7f39fb&color=fff&size=128`,
      startDate,
      endDate,
      status: 'upcoming',
      teams: [],
      rounds: 0,
      matches: [],
      results: [],
      description: ''
    };
    addTournament(newTournament);
    setName('');
    setStartDate('');
    setEndDate('');
  };

  const active = tournaments.filter(t => t.status !== 'finished');
  const finished = tournaments.filter(t => t.status === 'finished');

  const openResult = (t: Tournament) => {
    setCurrent(t);
    setShowResult(true);
  };

  const openWinner = (t: Tournament) => {
    setCurrent(t);
    setShowWinner(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Torneos</h2>
      <form onSubmit={handleSubmit} className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Nombre</label>
          <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Inicio</label>
            <input type="date" className="input w-full" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fin</label>
            <input type="date" className="input w-full" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Tipo</label>
          <select
            className="input w-full"
            value={type}
            onChange={e =>
              setType(e.target.value as 'league' | 'cup' | 'friendly')
            }
          >
            <option value="league">Liga</option>
            <option value="cup">Copa</option>
            <option value="friendly">Amistoso</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Crear Torneo</button>
      </form>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden mb-6">
        <div className="px-4 py-3 font-bold border-b border-gray-800">Torneos Activos</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {active.map(t => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-center">{t.type}</td>
                  <td className="px-4 py-3 text-center">{t.status}</td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <button className="text-primary" onClick={() => openResult(t)}>Resultado</button>
                    <button className="text-primary" onClick={() => openWinner(t)}>Campeón</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 font-bold border-b border-gray-800">Torneos Finalizados</div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-center">Campeón</th>
                <th className="px-4 py-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {finished.map(t => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-center">{t.winner || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Link to={`/torneos/${t.id}`} className="text-primary">Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {current && showResult && (
        <MatchResultModal tournament={current} onClose={() => setShowResult(false)} />
      )}
      {current && showWinner && (
        <WinnerModal tournament={current} onClose={() => setShowWinner(false)} />
      )}
    </div>
  );
};

export default TournamentsAdminPanel;
