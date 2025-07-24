import React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
  Layers,
} from 'lucide-react';
import { Tournament } from '../../../types';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';
import NewTournamentModal from './NewTournamentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TournamentDetailsModal from './TournamentDetailsModal';
import ManageParticipantsModal from './ManageParticipantsModal';
import ManageMatchesModal from './ManageMatchesModal';
import ManagePhasesModal from './ManagePhasesModal';
import { useGlobalStore } from '../../store/globalStore';

const TournamentsAdminPanel = () => {
  const tournaments = useGlobalStore(state => state.tournaments);
  const addTournament = useGlobalStore(state => state.addTournament);
  const updateTournaments = useGlobalStore(state => state.updateTournaments);
  const removeTournament = useGlobalStore(state => state.removeTournament);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);
  const [managingParticipants, setManagingParticipants] = useState<Tournament | null>(null);
  const [managingMatches, setManagingMatches] = useState<Tournament | null>(null);
  const [managingPhases, setManagingPhases] = useState<Tournament | null>(null);

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const totalPrizePool = tournaments.reduce((sum, t) => sum + (t.prizePool || 0), 0);
  const totalTeams = tournaments.reduce((sum, t) => sum + (t.currentTeams || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'finished': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getFormatIcon = (format: string) => {
    return format === 'league' ? Trophy : Users;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Torneos</h1>
          <p className="text-gray-400">Administra todos los torneos de Virtual Zone</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Crear Torneo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Torneos Activos"
          value={activeTournaments}
          icon={Trophy}
          gradient="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Premio Total"
          value={`€${totalPrizePool.toLocaleString()}`}
          icon={Trophy}
          gradient="from-yellow-500 to-orange-600"
        />
        <StatsCard
          title="Equipos Participantes"
          value={totalTeams}
          icon={Users}
          gradient="from-blue-500 to-purple-600"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchFilter
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar torneos..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input min-w-[150px]"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="upcoming">Próximos</option>
          <option value="finished">Finalizados</option>
        </select>
      </div>

      {filteredTournaments.map((tournament) => {
        const FormatIcon = getFormatIcon(tournament.type);

        return (
          <div key={tournament.id} className="bg-gray-900/50 rounded-lg p-6 border border-gray-700/30 hover:border-primary/30 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <FormatIcon size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{tournament.name}</h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(tournament.status)}`}>
                      {tournament.status === 'active' ? 'Activo' : 
                        tournament.status === 'upcoming' ? 'Próximo' : 'Finalizado'}
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                      <MapPin size={14} className="mr-1" />
                      {tournament.location || 'Sin ubicación'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setEditingTournament(tournament)}
                  className="btn-outline text-sm flex items-center"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => setManagingParticipants(tournament)}
                  className="btn-outline text-sm flex items-center"
                  title="Gestionar participantes"
                >
                  <Users size={16} />
                </button>
                <button
                  onClick={() => setManagingMatches(tournament)}
                  className="btn-outline text-sm flex items-center"
                  title="Gestionar partidos"
                >
                  <Calendar size={16} />
                </button>
                <button
                  onClick={() => setManagingPhases(tournament)}
                  className="btn-outline text-sm flex items-center"
                  title="Gestionar fases"
                >
                  <Layers size={16} />
                </button>
                <button
                  onClick={() => setDeletingTournament(tournament)}
                  className="btn-outline text-sm flex items-center"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 capitalize">
                Formato: {tournament.type === 'league' ? 'Liga' : 'Eliminación'}
              </span>
              <button
                onClick={() => setViewingTournament(tournament)}
                className="btn-outline text-sm flex items-center space-x-2"
              >
                <Eye size={16} />
                <span>Ver Detalles</span>
              </button>
            </div>
          </div>
        );
      })}

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12">
          <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron torneos</h3>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {showNewModal && (
        <NewTournamentModal
          onClose={() => setShowNewModal(false)}
          onSave={(data) => {
            const newTournament: Tournament = {
              id: Date.now().toString(),
              currentTeams: 0,
              ...data
            } as Tournament;
            addTournament(newTournament);
            setShowNewModal(false);
          }}
        />
      )}

      {editingTournament && (
        <NewTournamentModal
          onClose={() => setEditingTournament(null)}
          onSave={(data) => {
            updateTournaments(tournaments.map(t =>
              t.id === editingTournament.id ? { ...t, ...data } : t
            ));
            setEditingTournament(null);
          }}
        />
      )}

      {deletingTournament && (
        <ConfirmDeleteModal
          onClose={() => setDeletingTournament(null)}
          onConfirm={() => {
            if (deletingTournament.id) {
              removeTournament(deletingTournament.id);
            }
            setDeletingTournament(null);
          }}
          message={`¿Estás seguro de que quieres eliminar "${deletingTournament.name}"? Esta acción no se puede deshacer.`}
        />
      )}

      {viewingTournament && (
        <TournamentDetailsModal
          tournament={viewingTournament}
          onClose={() => setViewingTournament(null)}
        />
      )}

      {managingParticipants && (
        <ManageParticipantsModal
          tournament={managingParticipants}
          onClose={() => setManagingParticipants(null)}
        />
      )}

      {managingMatches && (
        <ManageMatchesModal
          tournament={managingMatches}
          onClose={() => setManagingMatches(null)}
        />
      )}

      {managingPhases && (
        <ManagePhasesModal
          tournament={managingPhases}
          onClose={() => setManagingPhases(null)}
        />
      )}
    </div>
  );
};

export default TournamentsAdminPanel;
 