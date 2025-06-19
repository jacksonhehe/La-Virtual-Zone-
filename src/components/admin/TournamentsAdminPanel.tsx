import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { Match, Tournament } from '../../types';

const TournamentsAdminPanel = () => {
  const { tournaments, addTournament, updateTournaments } = useDataStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<'league' | 'cup' | 'friendly'>('league');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [editId, setEditId] = useState(tournaments[0]?.id || '');

  const selectedTournament = tournaments.find(t => t.id === editId);

  const updateMatchResult = (match: Match, home: number, away: number) => {
    const updated = tournaments.map(t => {
      if (t.id !== editId) return t;
      const updatedMatches = t.matches.map(m =>
        m.id === match.id ? { ...m, homeScore: home, awayScore: away, status: 'finished' } : m
      );
      return { ...t, matches: updatedMatches, results: updatedMatches };
    });
    updateTournaments(updated);
  };

  const changeStatus = (status: 'upcoming' | 'active' | 'finished') => {
    const updated = tournaments.map(t =>
      t.id === editId ? { ...t, status } : t
    );
    updateTournaments(updated);
  };

  const changeWinner = (winner: string) => {
    const updated = tournaments.map(t =>
      t.id === editId ? { ...t, winner } : t
    );
    updateTournaments(updated);
  };

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
            onChange={e => setType(e.target.value as 'league' | 'cup' | 'friendly')}
          >
            <option value="league">Liga</option>
            <option value="cup">Copa</option>
            <option value="friendly">Amistoso</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full">Crear Torneo</button>
      </form>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">{t.name}</td>
                  <td className="px-4 py-3 text-center">{t.type}</td>
                  <td className="px-4 py-3 text-center">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>

      {/* Edit section */}
      {selectedTournament && (
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4 mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Torneo</label>
            <select className="input w-full" value={editId} onChange={e => setEditId(e.target.value)}>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select
              className="input w-full"
              value={selectedTournament.status}
              onChange={e => changeStatus(e.target.value as 'upcoming' | 'active' | 'finished')}
            >
              <option value="upcoming">Próximamente</option>
              <option value="active">Activo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Campeón</label>
            <select
              className="input w-full"
              value={selectedTournament.winner || ''}
              onChange={e => changeWinner(e.target.value)}
            >
              <option value="">--</option>
              {selectedTournament.teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="font-bold mb-2">Resultados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="px-2 py-2">Local</th>
                    <th className="px-2 py-2">Marcador</th>
                    <th className="px-2 py-2">Visitante</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTournament.matches.map(match => (
                    <tr key={match.id} className="border-b border-gray-800">
                      <td className="px-2 py-1 text-right">{match.homeTeam}</td>
                      <td className="px-2 py-1 text-center">
                        <input
                          type="number"
                          className="w-12 text-center bg-gray-800 rounded mr-1"
                          value={match.homeScore ?? ''}
                          onChange={e =>
                            updateMatchResult(
                              match,
                              Number(e.target.value),
                              match.awayScore ?? 0
                            )
                          }
                        />
                        -
                        <input
                          type="number"
                          className="w-12 text-center bg-gray-800 rounded ml-1"
                          value={match.awayScore ?? ''}
                          onChange={e =>
                            updateMatchResult(
                              match,
                              match.homeScore ?? 0,
                              Number(e.target.value)
                            )
                          }
                        />
                      </td>
                      <td className="px-2 py-1">{match.awayTeam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentsAdminPanel;
