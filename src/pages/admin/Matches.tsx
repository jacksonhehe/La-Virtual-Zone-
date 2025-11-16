import { useEffect, useState, useMemo, useRef } from 'react';
import { Edit, Plus, Trash, Calendar, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { listTournaments, updateMatch, deleteMatch, deleteAllMatches } from '../../utils/tournamentService';
import { listMatches } from '../../utils/matchService';
import { Tournament, Match } from '../../types';
import NewMatchModal from '../../components/admin/NewMatchModal';
import EditMatchModal from '../../components/admin/EditMatchModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { usePagination } from '../../hooks/usePagination';

const AdminMatches = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [allMatches, setAllMatches] = useState<(Match & { tournamentName: string; tournamentLogo: string })[]>([]);
  const [filteredMatches, setFilteredMatches] = useState<(Match & { tournamentName: string; tournamentLogo: string })[]>([]);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState<(Match & { tournamentName: string; tournamentLogo: string }) | null>(null);
  const [deleteMatchTarget, setDeleteMatchTarget] = useState<(Match & { tournamentName: string; tournamentLogo: string }) | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [perPage, setPerPage] = useState(50);

  // Cargar torneos y partidos
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // Cargar torneos y partidos en paralelo
        const [loadedTournaments, loadedMatches] = await Promise.all([
          listTournaments(),
          listMatches() // Usar la tabla independiente de partidos (sincronización bidireccional)
        ]);
        
        if (!isMounted) return;
        
        setTournaments(loadedTournaments);

        // Combinar partidos con información de torneos
        const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
        loadedMatches.forEach(match => {
          const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
          if (tournament) {
            matchesWithTournamentInfo.push({
              ...match,
              tournamentName: tournament.name,
              tournamentLogo: tournament.logo
            });
          } else {
            // Si el torneo no se encuentra, aún mostrar el partido
            matchesWithTournamentInfo.push({
              ...match,
              tournamentName: 'Torneo no encontrado',
              tournamentLogo: ''
            });
          }
        });

        // Ordenar por fecha (más recientes primero)
        matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllMatches(matchesWithTournamentInfo);
        setFilteredMatches(matchesWithTournamentInfo);
      } catch (error) {
        console.error('Error cargando partidos:', error);
      }
    };

    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Solo ejecutar una vez al montar el componente

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...allMatches];

    // Filtro por torneo
    if (selectedTournament) {
      filtered = filtered.filter(m => m.tournamentId === selectedTournament);
    }

    // Filtro por estado
    if (selectedStatus) {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    // Filtro por búsqueda (equipos o torneo)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m =>
        m.homeTeam.toLowerCase().includes(query) ||
        m.awayTeam.toLowerCase().includes(query) ||
        m.tournamentName.toLowerCase().includes(query)
      );
    }

    setFilteredMatches(filtered);
  }, [allMatches, selectedTournament, selectedStatus, searchQuery]);

  // Paginación
  const pagination = usePagination({
    items: filteredMatches,
    perPage: perPage,
    initialPage: 1
  });

  // Resetear paginación cuando cambian los filtros
  const lastFilterKey = useRef(`${selectedTournament}-${selectedStatus}-${searchQuery}`);
  useEffect(() => {
    const currentFilterKey = `${selectedTournament}-${selectedStatus}-${searchQuery}`;
    if (lastFilterKey.current !== currentFilterKey) {
      pagination.set(1);
      lastFilterKey.current = currentFilterKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament, selectedStatus, searchQuery]);

  const handleCreateMatch = async (data: { date: string; homeTeam: string; awayTeam: string; tournamentId?: string }) => {
    try {
      // Necesitamos el tournamentId, lo obtendremos del parámetro, del seleccionado o del primer torneo disponible
      const tournamentId = data.tournamentId || selectedTournament || tournaments[0]?.id;
      if (!tournamentId) {
        alert('No hay torneos disponibles. Crea un torneo primero.');
        return;
      }

      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        alert('Torneo no encontrado');
        return;
      }

      // Usar la función addMatch del tournamentService
      const { addMatch } = await import('../../utils/tournamentService');
      await addMatch(tournamentId, { date: data.date, homeTeam: data.homeTeam, awayTeam: data.awayTeam });

      // Recargar datos usando la tabla independiente de partidos
      const [loadedTournaments, loadedMatches] = await Promise.all([
        listTournaments(),
        listMatches()
      ]);
      setTournaments(loadedTournaments);

      const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
      loadedMatches.forEach(match => {
        const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
        if (tournament) {
          matchesWithTournamentInfo.push({
            ...match,
            tournamentName: tournament.name,
            tournamentLogo: tournament.logo
          });
        }
      });

      matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllMatches(matchesWithTournamentInfo);
      setFilteredMatches(matchesWithTournamentInfo);
      setShowNewMatch(false);
    } catch (error) {
      console.error('Error creando partido:', error);
      alert('Error al crear el partido. Por favor, intenta de nuevo.');
    }
  };

  const handleUpdateMatch = async (matchId: string, tournamentId: string, data: Partial<Match>) => {
    try {
      await updateMatch(tournamentId, matchId, data);

      // Recargar datos usando la tabla independiente de partidos
      const [loadedTournaments, loadedMatches] = await Promise.all([
        listTournaments(),
        listMatches()
      ]);
      setTournaments(loadedTournaments);

      const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
      loadedMatches.forEach(match => {
        const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
        if (tournament) {
          matchesWithTournamentInfo.push({
            ...match,
            tournamentName: tournament.name,
            tournamentLogo: tournament.logo
          });
        }
      });

      matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllMatches(matchesWithTournamentInfo);
      setFilteredMatches(matchesWithTournamentInfo);
      setEditingMatch(null);
    } catch (error) {
      console.error('Error actualizando partido:', error);
      alert('Error al actualizar el partido. Por favor, intenta de nuevo.');
    }
  };

  const handleDeleteMatch = async (matchId: string, tournamentId: string) => {
    try {
      await deleteMatch(tournamentId, matchId);

      // Recargar datos usando la tabla independiente de partidos
      const [loadedTournaments, loadedMatches] = await Promise.all([
        listTournaments(),
        listMatches()
      ]);
      setTournaments(loadedTournaments);

      const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
      loadedMatches.forEach(match => {
        const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
        if (tournament) {
          matchesWithTournamentInfo.push({
            ...match,
            tournamentName: tournament.name,
            tournamentLogo: tournament.logo
          });
        }
      });

      matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllMatches(matchesWithTournamentInfo);
      setFilteredMatches(matchesWithTournamentInfo);
      setDeleteMatchTarget(null);
    } catch (error) {
      console.error('Error eliminando partido:', error);
      alert('Error al eliminar el partido. Por favor, intenta de nuevo.');
    }
  };

  // Obtener todos los equipos únicos de todos los torneos
  const allTeams = useMemo(() => {
    const teamsSet = new Set<string>();
    tournaments.forEach(t => {
      t.teams?.forEach(team => teamsSet.add(team));
    });
    return Array.from(teamsSet).sort();
  }, [tournaments]);

  const getStatusBadge = (status: string) => {
    const styles = {
      scheduled: 'bg-gray-700 text-gray-300',
      live: 'bg-red-600 text-white animate-pulse',
      finished: 'bg-green-700 text-white'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.scheduled}`}>
        {status === 'scheduled' ? 'Programado' : status === 'live' ? 'En vivo' : 'Finalizado'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Partidos</h2>
          <p className="text-gray-400 text-sm mt-1">Administra todos los partidos de los torneos</p>
        </div>
        <div className="flex gap-2">
          {allMatches.length > 0 && (
            <button
              className="btn-outline flex items-center text-red-400 border-red-400/30 hover:bg-red-400/10"
              onClick={(e) => {
                e.preventDefault();
                console.log('Botón eliminar todos clickeado, total de partidos:', allMatches.length);
                setShowDeleteAllConfirm(true);
              }}
            >
              <Trash size={16} className="mr-2" />
              Eliminar todos ({allMatches.length})
            </button>
          )}
          <button
            className="btn-primary flex items-center"
            onClick={() => {
              if (tournaments.length === 0) {
                alert('No hay torneos disponibles. Crea un torneo primero.');
                return;
              }
              setShowNewMatch(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Nuevo partido
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-dark-light rounded-lg border border-gray-800 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por equipos o torneo..."
              className="input pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="input w-full"
              value={selectedTournament}
              onChange={(e) => setSelectedTournament(e.target.value)}
            >
              <option value="">Todos los torneos</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="input w-full"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            {(selectedTournament || selectedStatus || searchQuery) && (
              <button
                className="btn-outline flex items-center"
                onClick={() => {
                  setSelectedTournament('');
                  setSelectedStatus('');
                  setSearchQuery('');
                }}
              >
                <Filter size={16} className="mr-2" />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm mb-1">Total de partidos</p>
          <h3 className="text-2xl font-bold text-white">{filteredMatches.length}</h3>
          {filteredMatches.length !== allMatches.length && (
            <p className="text-xs text-gray-500 mt-1">de {allMatches.length} totales</p>
          )}
        </div>
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm mb-1">Programados</p>
          <h3 className="text-2xl font-bold text-yellow-400">
            {filteredMatches.filter(m => m.status === 'scheduled').length}
          </h3>
        </div>
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm mb-1">En vivo</p>
          <h3 className="text-2xl font-bold text-red-400">
            {filteredMatches.filter(m => m.status === 'live').length}
          </h3>
        </div>
        <div className="bg-dark-light rounded-lg border border-gray-800 p-4">
          <p className="text-gray-400 text-sm mb-1">Finalizados</p>
          <h3 className="text-2xl font-bold text-green-400">
            {filteredMatches.filter(m => m.status === 'finished').length}
          </h3>
        </div>
      </div>

      {/* Tabla de partidos */}
      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Torneo</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Local</th>
                <th className="px-4 py-3 text-center">Resultado</th>
                <th className="px-4 py-3 text-left">Visitante</th>
                <th className="px-4 py-3 text-center">Ronda</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagination.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    {allMatches.length === 0
                      ? 'No hay partidos. Crea un torneo y añade partidos primero.'
                      : 'No se encontraron partidos con los filtros seleccionados.'}
                  </td>
                </tr>
              ) : (
                pagination.items.map((match) => (
                  <tr key={match.id} className="border-b border-gray-800 hover:bg-dark-lighter transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={match.tournamentLogo} alt={match.tournamentName} className="w-6 h-6 rounded" />
                        <span className="font-medium text-sm">{match.tournamentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{match.homeTeam}</td>
                    <td className="px-4 py-3 text-center">
                      {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                        <span className="text-lg font-bold">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      ) : match.status === 'live' ? (
                        <span className="text-red-400 font-bold animate-pulse">LIVE</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{match.awayTeam}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 bg-gray-700 rounded text-xs">R{match.round}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatusBadge(match.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-gray-400 hover:text-primary transition-colors"
                          onClick={() => setEditingMatch(match)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() => setDeleteMatchTarget(match)}
                          title="Eliminar"
                        >
                          <Trash size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              Mostrando {((pagination.page - 1) * perPage) + 1} - {Math.min(pagination.page * perPage, pagination.total)} de {pagination.total} partidos
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Selector de items por página */}
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                pagination.set(1);
              }}
              className="px-3 py-2 bg-gray-700/60 border border-gray-600/60 rounded-lg text-white text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={25}>25 por página</option>
              <option value={50}>50 por página</option>
              <option value={100}>100 por página</option>
            </select>

            {/* Botones de navegación */}
            <button
              onClick={pagination.prev}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-dark-light border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-lighter transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Números de página */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.set(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pagination.page === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-dark-light border border-gray-800 text-gray-300 hover:bg-dark-lighter'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={pagination.next}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-dark-light border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-lighter transition-colors flex items-center gap-2"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Modales */}
      {showNewMatch && (
        <NewMatchModal
          onClose={() => setShowNewMatch(false)}
          onCreate={handleCreateMatch}
          teams={allTeams}
          tournaments={tournaments}
          defaultTournamentId={selectedTournament || tournaments[0]?.id}
        />
      )}

      {editingMatch && (
        <EditMatchModal
          match={editingMatch}
          onClose={() => setEditingMatch(null)}
          onSave={(data) => handleUpdateMatch(editingMatch.id, editingMatch.tournamentId, data)}
          teams={allTeams}
        />
      )}

      {deleteMatchTarget && (
        <ConfirmModal
          open={!!deleteMatchTarget}
          title="Eliminar partido"
          description={`¿Estás seguro de que deseas eliminar el partido entre ${deleteMatchTarget.homeTeam} y ${deleteMatchTarget.awayTeam}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          tone="danger"
          onConfirm={() => handleDeleteMatch(deleteMatchTarget.id, deleteMatchTarget.tournamentId)}
          onCancel={() => setDeleteMatchTarget(null)}
        />
      )}

      <ConfirmModal
        open={showDeleteAllConfirm}
        title="Eliminar todos los partidos"
        description={`¿Estás seguro de que deseas eliminar TODOS los partidos (${allMatches.length} partidos)? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar todos"
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={async () => {
            try {
              console.log('Iniciando eliminación de todos los partidos...');
              const deletedCount = await deleteAllMatches();
              console.log(`Partidos eliminados: ${deletedCount}`);
              
              // Limpiar el estado local inmediatamente
              setAllMatches([]);
              setFilteredMatches([]);
              setShowDeleteAllConfirm(false);
              
              // Recargar datos después de un breve delay para asegurar que la eliminación se completó
              setTimeout(async () => {
                try {
              const [loadedTournaments, loadedMatches] = await Promise.all([
                listTournaments(),
                listMatches()
              ]);
              setTournaments(loadedTournaments);

              const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
              loadedMatches.forEach(match => {
                const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
                if (tournament) {
                  matchesWithTournamentInfo.push({
                    ...match,
                    tournamentName: tournament.name,
                    tournamentLogo: tournament.logo
                  });
                }
              });

              matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
              setAllMatches(matchesWithTournamentInfo);
              setFilteredMatches(matchesWithTournamentInfo);
                } catch (reloadError) {
                  console.error('Error recargando partidos después de eliminar:', reloadError);
                }
              }, 500);
              
              alert(`✅ Se eliminaron ${deletedCount} partidos exitosamente.`);
            } catch (error) {
              console.error('Error eliminando todos los partidos:', error);
              alert(`Error al eliminar los partidos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
              // Recargar datos incluso si hubo error para mostrar el estado actual
              try {
                const [loadedTournaments, loadedMatches] = await Promise.all([
                  listTournaments(),
                  listMatches()
                ]);
                setTournaments(loadedTournaments);
                const matchesWithTournamentInfo: (Match & { tournamentName: string; tournamentLogo: string })[] = [];
                loadedMatches.forEach(match => {
                  const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
                  if (tournament) {
                    matchesWithTournamentInfo.push({
                      ...match,
                      tournamentName: tournament.name,
                      tournamentLogo: tournament.logo
                    });
                  }
                });
                matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setAllMatches(matchesWithTournamentInfo);
                setFilteredMatches(matchesWithTournamentInfo);
              } catch (reloadError) {
                console.error('Error recargando partidos:', reloadError);
              }
            }
          }}
          onCancel={() => {
            console.log('Cancelando eliminación');
            setShowDeleteAllConfirm(false);
          }}
      />
    </div>
  );
};

export default AdminMatches;

