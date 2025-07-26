import React, { useState, useMemo } from 'react';
import { X, Users, Search, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Tournament } from '../../../types';
import ClubListItem from '../../../components/common/ClubListItem';
import { useGlobalStore } from '../../store/globalStore';

interface Props {
  tournament: Tournament;
  onClose: () => void;
}

const ManageParticipantsModal: React.FC<Props> = ({ tournament: initialTournament, onClose }) => {
  const clubs = useGlobalStore(state => state.clubs);
  const tournaments = useGlobalStore(state => state.tournaments);
  const updateTournaments = useGlobalStore(state => state.updateTournaments);

  // Obtener el torneo actualizado del store por ID
  const tournament = useMemo(() => tournaments.find(t => t.id === initialTournament.id) || initialTournament, [tournaments, initialTournament]);

  const [search, setSearch] = useState('');

  // Participantes actuales (club objects)
  const participantClubs = useMemo(
    () => clubs.filter(c => (tournament.participants || []).includes(c.name)),
    [clubs, tournament.participants]
  );

  // Clubes disponibles para añadir
  const availableClubs = useMemo(
    () => clubs.filter(c => !(tournament.participants || []).includes(c.name) && c.name.toLowerCase().includes(search.toLowerCase())),
    [clubs, tournament.participants, search]
  );

  const maxTeams = (tournament.maxTeams || 20);
  const canAdd = (tournament.participants?.length || 0) < maxTeams;

  const handleAdd = (clubName: string) => {
    if (!canAdd) return;
    const updated = tournaments.map(t =>
      t.id === tournament.id
        ? { ...t, participants: [...(t.participants || []), clubName] }
        : t
    );
    updateTournaments(updated);
  };

  const handleRemove = (clubName: string) => {
    const updated = tournaments.map(t =>
      t.id === tournament.id
        ? { ...t, participants: (t.participants || []).filter(name => name !== clubName) }
        : t
    );
    updateTournaments(updated);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gradient-to-br from-dark-lighter to-dark rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-800/70 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center mr-4">
              <Users size={22} className="text-dark" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Gestionar Participantes
              </h3>
              <p className="text-gray-400 text-sm">{tournament.name}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Participantes actuales */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <CheckCircle size={18} className="mr-2 text-green-400" />
              Participantes actuales ({participantClubs.length}/{maxTeams})
            </h4>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {participantClubs.length === 0 && (
                <p className="text-gray-400 text-sm">No hay participantes aún.</p>
              )}
              {participantClubs.map(club => (
                <div key={club.id} className="flex items-center justify-between bg-dark-lighter rounded-lg p-3 border border-gray-700/50">
                  <div className="flex-1">
                    <ClubListItem club={club} to={"#"} className="bg-transparent hover:bg-transparent p-0" />
                  </div>
                  <button
                    className="ml-2 text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                    onClick={() => handleRemove(club.name)}
                    title="Quitar participante"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Añadir participantes */}
          <div>
            <h4 className="text-lg font-semibold mb-4 flex items-center">
              <Plus size={18} className="mr-2 text-primary" />
              Añadir Club
            </h4>
            <div className="flex items-center mb-4">
              <div className="relative w-full">
                <input
                  className="input w-full bg-dark border-gray-700 focus:border-primary pl-10"
                  placeholder="Buscar club..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  disabled={!canAdd}
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {availableClubs.length === 0 && (
                <p className="text-gray-400 text-sm">{canAdd ? 'No hay clubes disponibles.' : 'Cupo máximo alcanzado.'}</p>
              )}
              {availableClubs.map(club => (
                <div key={club.id} className="flex items-center justify-between bg-dark-lighter rounded-lg p-3 border border-gray-700/50">
                  <div className="flex-1">
                    <ClubListItem club={club} to={"#"} className="bg-transparent hover:bg-transparent p-0" />
                  </div>
                  <button
                    className="ml-2 text-primary hover:text-white p-2 rounded-lg hover:bg-primary/20 transition-colors"
                    onClick={() => handleAdd(club.name)}
                    disabled={!canAdd}
                    title="Añadir participante"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              ))}
            </div>
            {!canAdd && (
              <p className="text-xs text-yellow-400 mt-3">Has alcanzado el máximo de participantes para este torneo.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageParticipantsModal; 