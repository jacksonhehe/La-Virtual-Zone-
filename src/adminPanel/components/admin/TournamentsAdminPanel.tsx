import  React, { useState } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { Tournament } from '../../types';
import SearchFilter from './SearchFilter';
import StatsCard from './StatsCard';
import NewTournamentModal from './NewTournamentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import TournamentDetailsModal from './TournamentDetailsModal';

const TournamentsAdminPanel = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([
    {
      id: '1',
      name: 'Liga Master 2024',
      format: 'league',
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      maxTeams: 20,
      currentTeams: 18,
      prizePool: 500000,
      location: 'España'
    },
    {
      id: '2',
      name: 'Copa Elite',
      format: 'knockout',
      status: 'upcoming',
      startDate: '2024-07-01',
      endDate: '2024-07-31',
      maxTeams: 32,
      currentTeams: 24,
      prizePool: 250000,
      location: 'Internacional'
    }
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [deletingTournament, setDeletingTournament] = useState<Tournament | null>(null);
  const [viewingTournament, setViewingTournament] = useState<Tournament | null>(null);

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTournaments = tournaments.filter(t => t.status === 'active').length;
  const totalPrizePool = tournaments.reduce((sum, t) => sum + t.prizePool, 0);
  const totalTeams = tournaments.reduce((sum, t) => sum + t.currentTeams, 0);

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

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
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

        <div className="grid gap-4">
          {filteredTournaments.map((tournament) => {
            const FormatIcon = getFormatIcon(tournament.format);
            const progress = (tournament.currentTeams / tournament.maxTeams) * 100;

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
                          {tournament.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingTournament(tournament)}
                      className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => setDeletingTournament(tournament)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Calendar size={14} className="mr-2" />
                      Fecha Inicio
                    </div>
                    <div className="text-white font-medium">
                      {new Date(tournament.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Calendar size={14} className="mr-2" />
                      Fecha Fin
                    </div>
                    <div className="text-white font-medium">
                      {new Date(tournament.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Users size={14} className="mr-2" />
                      Equipos
                    </div>
                    <div className="text-white font-medium">
                      {tournament.currentTeams}/{tournament.maxTeams}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center text-gray-400 text-sm mb-1">
                      <Trophy size={14} className="mr-2" />
                      Premio
                    </div>
                    <div className="text-white font-medium">
                      €{tournament.prizePool.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progreso de Inscripción</span>
                    <span className="text-white">{Math.round(progress)}%</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400 capitalize">
                    Formato: {tournament.format === 'league' ? 'Liga' : 'Eliminación'}
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
        </div>

        {filteredTournaments.length === 0 && (
          <div className="text-center py-12">
            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">No se encontraron torneos</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>

      {showNewModal && (
        <NewTournamentModal
          onClose={() => setShowNewModal(false)}
          onSave={(data) => {
            const newTournament: Tournament = {
              id: Date.now().toString(),
              currentTeams: 0,
              ...data
            } as Tournament;
            setTournaments([...tournaments, newTournament]);
            setShowNewModal(false);
          }}
        />
      )}

      {editingTournament && (
        <NewTournamentModal
          tournament={editingTournament}
          onClose={() => setEditingTournament(null)}
          onSave={(data) => {
            setTournaments(tournaments.map(t => 
              t.id === editingTournament.id ? { ...t, ...data } : t
            ));
            setEditingTournament(null);
          }}
        />
      )}

      {deletingTournament && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setDeletingTournament(null)}
          onConfirm={() => {
            setTournaments(tournaments.filter(t => t.id !== deletingTournament.id));
            setDeletingTournament(null);
          }}
          title="Eliminar Torneo"
          message={`¿Estás seguro de que quieres eliminar "${deletingTournament.name}"? Esta acción no se puede deshacer.`}
        />
      )}

      {viewingTournament && (
        <TournamentDetailsModal
          tournament={viewingTournament}
          onClose={() => setViewingTournament(null)}
        />
      )}
    </div>
  );
};

export default TournamentsAdminPanel;
 