import { useMemo, useState } from 'react';
import { Calendar, Shield, X } from 'lucide-react';
import { Tournament } from '../../types';
import { CUP_STAGE_OPTIONS, isCupTournament } from '../../utils/matchStages';

interface NewMatchModalProps {
  onClose: () => void;
  onCreate: (data: { date: string; homeTeam: string; awayTeam: string; tournamentId?: string; round?: number }) => void | Promise<void>;
  teams: string[];
  tournaments?: Tournament[];
  defaultTournamentId?: string;
}

const NewMatchModal = ({ onClose, onCreate, teams, tournaments, defaultTournamentId }: NewMatchModalProps) => {
  const [date, setDate] = useState<string>('');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>(defaultTournamentId || '');
  const [home, setHome] = useState<string>(teams[0] || '');
  const [away, setAway] = useState<string>(teams[1] || '');
  const [round, setRound] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedTournament = useMemo(
    () => tournaments?.find((t) => t.id === selectedTournamentId),
    [tournaments, selectedTournamentId]
  );
  const isCupMode = isCupTournament(selectedTournament?.type, selectedTournament?.name);
  const allowUndecidedTeams = isCupMode && round >= 2;

  const availableTeams = useMemo(() => {
    if (tournaments && selectedTournamentId) {
      const tournament = tournaments.find((t) => t.id === selectedTournamentId);
      return tournament?.teams || teams;
    }
    return teams;
  }, [tournaments, selectedTournamentId, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!date || (!allowUndecidedTeams && (!home || !away))) {
      setError('Completa fecha y equipos');
      return;
    }
    if (home && away && home === away) {
      setError('Los equipos deben ser distintos');
      return;
    }
    if (tournaments && tournaments.length > 0 && !selectedTournamentId) {
      setError('Selecciona un torneo');
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.resolve(
        onCreate({
          date,
          homeTeam: home.trim(),
          awayTeam: away.trim(),
          tournamentId: selectedTournamentId || undefined,
          round: Math.max(1, round || 1)
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="absolute inset-0" onClick={() => (!isSubmitting ? onClose() : null)}></div>
      <div className="relative bg-dark-light rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-700 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-primary" />
            <div>
              <h3 className="text-xl font-bold text-white">Nuevo partido</h3>
              <p className="text-sm text-gray-400">Programa un encuentro para un torneo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="p-3 bg-red-500/20 text-red-300 rounded-lg text-sm">{error}</div>}

            <div className="bg-gray-900/80 rounded-lg p-5 border border-gray-700 space-y-4">
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
                      setRound(1);
                    }}
                    required
                    disabled={isSubmitting}
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
                <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="datetime-local"
                    className="input w-full pl-10"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Local</label>
                <select
                  className="input w-full"
                  value={home}
                  onChange={(e) => setHome(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">{allowUndecidedTeams ? 'Por definir' : 'Selecciona equipo local'}</option>
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Visitante</label>
                <select
                  className="input w-full"
                  value={away}
                  onChange={(e) => setAway(e.target.value)}
                  disabled={isSubmitting}
                >
                  <option value="">{allowUndecidedTeams ? 'Por definir' : 'Selecciona equipo visitante'}</option>
                  {availableTeams.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">{isCupMode ? 'Fase' : 'Jornada'}</label>
                {isCupMode ? (
                  <select
                    className="input w-full"
                    value={round}
                    onChange={(e) => setRound(parseInt(e.target.value, 10) || 1)}
                    disabled={isSubmitting}
                  >
                    {CUP_STAGE_OPTIONS.map((stage) => (
                      <option key={stage.value} value={stage.value}>
                        {stage.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="number"
                    className="input w-full"
                    value={round}
                    onChange={(e) => setRound(parseInt(e.target.value, 10) || 1)}
                    min={1}
                    required
                    disabled={isSubmitting}
                  />
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Añadir'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewMatchModal;

