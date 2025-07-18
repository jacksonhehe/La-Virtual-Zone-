import React, { useMemo, useState } from 'react';
import { X, Calendar as CalendarIcon, Trash2, Shuffle, Plus } from 'lucide-react';
import { Tournament, Match } from '../../../types';
import { useGlobalStore } from '../../store/globalStore';

interface Props {
  tournament: Tournament;
  onClose: () => void;
}

const ManageMatchesModal: React.FC<Props> = ({ tournament: initialTournament, onClose }) => {
  const tournaments = useGlobalStore(state => state.tournaments);
  const updateTournaments = useGlobalStore(state => state.updateTournaments);

  // Obtener la referencia actualizada del torneo por ID
  const tournament = useMemo(() => tournaments.find(t => t.id === initialTournament.id) || initialTournament, [tournaments, initialTournament]);

  const participants = tournament.participants || [];

  // Estado para crear partido manualmente
  const [newMatch, setNewMatch] = useState({
    homeTeam: '',
    awayTeam: '',
    date: '',
    round: 1,
  });

  const isValidNewMatch =
    newMatch.homeTeam &&
    newMatch.awayTeam &&
    newMatch.homeTeam !== newMatch.awayTeam &&
    newMatch.date;

  const resetNewMatch = () =>
    setNewMatch({ homeTeam: '', awayTeam: '', date: '', round: 1 });

  const handleAddMatch = () => {
    if (!isValidNewMatch) return;

    const match: Match = {
      id: `m_${Date.now()}`,
      tournamentId: tournament.id,
      round: newMatch.round,
      date: newMatch.date,
      homeTeam: newMatch.homeTeam,
      awayTeam: newMatch.awayTeam,
      status: 'scheduled',
    };

    const updated = tournaments.map(t =>
      t.id === tournament.id
        ? { ...t, matches: [...(t.matches || []), match] }
        : t
    );
    updateTournaments(updated);
    resetNewMatch();
  };

  const handleGenerateMatches = () => {
    if (participants.length < 2) return;

    const newMatches: Match[] = [];
    let idx = 0;
    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        newMatches.push({
          id: `m_${Date.now()}_${idx++}`,
          tournamentId: tournament.id,
          round: 1,
          date: new Date().toISOString(),
          homeTeam: participants[i],
          awayTeam: participants[j],
          status: 'scheduled'
        });
      }
    }

    // Actualizar torneo en el store
    const updated = tournaments.map(t =>
      t.id === tournament.id ? { ...t, matches: newMatches } : t
    );
    updateTournaments(updated);
  };

  const handleRemoveMatch = (matchId: string) => {
    const updated = tournaments.map(t =>
      t.id === tournament.id ? { ...t, matches: (t.matches || []).filter(m => m.id !== matchId) } : t
    );
    updateTournaments(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gradient-to-br from-dark-lighter to-dark rounded-2xl shadow-2xl max-w-4xl w-full border border-gray-800/70 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
              <CalendarIcon size={22} className="text-dark" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Gestionar Partidos
              </h3>
              <p className="text-gray-400 text-sm">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Sección de crear partido manual */}
            <div className="bg-dark-lighter p-4 rounded-lg border border-gray-700/50 space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Plus size={18} className="mr-2" />
                Crear partido manualmente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="text-sm text-gray-400">Local</label>
                  <select
                    className="input w-full bg-dark border-gray-700 focus:border-primary"
                    value={newMatch.homeTeam}
                    onChange={e => setNewMatch({ ...newMatch, homeTeam: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {participants.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Visitante</label>
                  <select
                    className="input w-full bg-dark border-gray-700 focus:border-primary"
                    value={newMatch.awayTeam}
                    onChange={e => setNewMatch({ ...newMatch, awayTeam: e.target.value })}
                  >
                    <option value="">Seleccionar</option>
                    {participants.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Fecha</label>
                  <input
                    type="datetime-local"
                    className="input w-full bg-dark border-gray-700 focus:border-primary"
                    value={newMatch.date}
                    onChange={e => setNewMatch({ ...newMatch, date: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAddMatch}
                    disabled={!isValidNewMatch}
                    className="btn-primary w-full flex items-center justify-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    <span>Añadir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Barra superior de lista de partidos y generación automática */}
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">Partidos ({tournament.matches?.length || 0})</h4>
              <button
                onClick={handleGenerateMatches}
                className="btn-outline flex items-center space-x-2"
              >
                <Shuffle size={18} />
                <span>Generar Fixture</span>
              </button>
            </div>
          </div>

          {(tournament.matches || []).length === 0 && (
            <p className="text-gray-400 text-sm">Aún no se han generado partidos.</p>
          )}

          {(tournament.matches || []).map(match => (
            <div key={match.id} className="flex items-center justify-between bg-dark-lighter rounded-lg p-4 border border-gray-700/50">
              <span className="text-white font-medium">{match.homeTeam} vs {match.awayTeam}</span>
              <button
                className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                onClick={() => handleRemoveMatch(match.id)}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageMatchesModal; 