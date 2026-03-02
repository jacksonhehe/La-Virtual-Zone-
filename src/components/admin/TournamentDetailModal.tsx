import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Tournament, Match } from '../../types';
import { formatDate } from '../../utils/format';
import MatchScore from '../common/MatchScore';

interface TournamentDetailModalProps {
  tournament: Tournament;
  onClose: () => void;
}

const TournamentDetailModal = ({ tournament, onClose }: TournamentDetailModalProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const normalizeTeamRef = (value: string | undefined) => String(value || '').trim().toLowerCase();
  const visibleTeams = (tournament.teams || []).filter((team) => {
    const normalized = normalizeTeamRef(team);
    return normalized && normalized !== 'libre' && normalized !== 'free';
  });
  
  // Cargar partidos desde la tabla independiente en lugar de tournament.matches
  useEffect(() => {
    const loadMatches = async () => {
      try {
        const { getMatchesByTournament } = await import('../../utils/matchService');
        const tournamentMatches = await getMatchesByTournament(tournament.id);
        setMatches(tournamentMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
        setMatches([]);
      }
    };
    
    loadMatches();
  }, [tournament.id]);
  const hasMatches = matches.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={20} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <img src={tournament.logo} alt={tournament.name} className="w-8 h-8" />
          <h3 className="text-xl font-bold">{tournament.name}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-2">Información</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <div>Tipo: <span className="text-gray-400">{tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}</span></div>
              <div>Fechas: <span className="text-gray-400">{formatDate(tournament.startDate)} — {formatDate(tournament.endDate)}</span></div>
              <div>Estado: <span className="text-gray-400">{tournament.status === 'active' ? 'Activo' : tournament.status === 'upcoming' ? 'Próximo' : 'Finalizado'}</span></div>
              <div>Jornadas: <span className="text-gray-400">{tournament.rounds}</span></div>
              {tournament.description && <div>Descripción: <span className="text-gray-400">{tournament.description}</span></div>}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Equipos ({visibleTeams.length})</h4>
            <div className="text-sm text-gray-300 grid grid-cols-2 gap-1 max-h-40 overflow-auto p-2 bg-dark rounded">
              {visibleTeams.map((team) => (
                <div key={team} className="truncate" title={team}>{team}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Partidos</h4>
          {!hasMatches ? (
            <div className="text-gray-400 text-sm">No hay partidos programados.</div>
          ) : (
            <div className="bg-dark rounded border border-gray-700 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-700">
                    <th className="px-3 py-2 text-left">Fecha</th>
                    <th className="px-3 py-2 text-center">Local</th>
                    <th className="px-3 py-2 text-center">Visitante</th>
                    <th className="px-3 py-2 text-center">Marcador</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((m) => (
                    <tr key={m.id} className="border-b border-gray-700">
                      <td className="px-3 py-2">{formatDate(m.date)}</td>
                      <td className="px-3 py-2 text-center">{m.homeTeam}</td>
                      <td className="px-3 py-2 text-center">{m.awayTeam}</td>
                      <td className="px-3 py-2 text-center">{m.homeScore !== undefined && m.awayScore !== undefined ? <MatchScore match={m} /> : '-'}</td>
                      <td className="px-3 py-2 text-center">{m.status === 'scheduled' ? 'Programado' : m.status === 'live' ? 'En juego' : 'Finalizado'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailModal;

