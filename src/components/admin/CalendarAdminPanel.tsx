import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { Match } from '../../types';

const CalendarAdminPanel = () => {
  const { tournaments, updateTournaments, clubs } = useDataStore();
  const [tournamentId, setTournamentId] = useState(tournaments[0]?.id || '');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [date, setDate] = useState('');

  const addMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament || !home || !away || !date) return;
    const match: Match = {
      id: `${Date.now()}`,
      tournamentId,
      round: tournament.rounds + 1,
      date,
      homeTeam: home,
      awayTeam: away,
      status: 'scheduled'
    };
    const updated = tournaments.map(t =>
      t.id === tournamentId ? { ...t, matches: [...t.matches, match] } : t
    );
    updateTournaments(updated);
    setHome('');
    setAway('');
    setDate('');
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Calendario de Partidos</h2>
      <form onSubmit={addMatch} className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Torneo</label>
          <select className="input w-full" value={tournamentId} onChange={e => setTournamentId(e.target.value)}>
            {tournaments.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Local</label>
            <select className="input w-full" value={home} onChange={e => setHome(e.target.value)}>
              <option value="">--</option>
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Visitante</label>
            <select className="input w-full" value={away} onChange={e => setAway(e.target.value)}>
              <option value="">--</option>
              {clubs.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Fecha</label>
          <input type="datetime-local" className="input w-full" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <button type="submit" className="btn-primary w-full">Agregar Partido</button>
      </form>
    </div>
  );
};

export default CalendarAdminPanel;
