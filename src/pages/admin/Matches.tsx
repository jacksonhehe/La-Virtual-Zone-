import { useEffect, useMemo, useRef, useState } from 'react';
import { Edit, Plus, Trash, Calendar, Filter, Search, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { listTournaments, updateMatch, deleteMatch, deleteAllMatches } from '../../utils/tournamentService';
import { listMatches } from '../../utils/matchService';
import { Tournament, Match } from '../../types';
import NewMatchModal from '../../components/admin/NewMatchModal';
import EditMatchModal from '../../components/admin/EditMatchModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import { usePagination } from '../../hooks/usePagination';
import { getCupStageLabel, getCupStageShortLabel, getCupMatchPlaceholders, isCupTournament } from '../../utils/matchStages';
import MatchScore from '../../components/common/MatchScore';

type ToastType = 'success' | 'error' | 'info';

type MatchWithTournament = Match & {
  tournamentName: string;
  tournamentLogo: string;
  tournamentType?: Tournament['type'];
};

const isCupPlaceholderLabel = (value?: string) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized.startsWith('ganador ') || normalized.startsWith('perdedor ');
};

const Toast = ({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) => {
  const tones: Record<ToastType, string> = {
    success: 'border-emerald-400/70 bg-emerald-950/95 text-emerald-100',
    error: 'border-red-400/70 bg-red-950/95 text-red-100',
    info: 'border-cyan-400/70 bg-cyan-950/95 text-cyan-100'
  };
  const labels: Record<ToastType, string> = { success: 'Listo', error: 'Error', info: 'Info' };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm border rounded-lg px-4 py-3 shadow-2xl backdrop-blur-sm ${tones[type]}`}>
      <div className="text-xs uppercase tracking-wide mb-1 opacity-80">{labels[type]}</div>
      <div className="text-sm whitespace-pre-line">{message}</div>
      <button className="mt-2 text-xs text-gray-300 hover:text-white" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
};

const AdminMatches = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [allMatches, setAllMatches] = useState<MatchWithTournament[]>([]);
  const [showNewMatch, setShowNewMatch] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchWithTournament | null>(null);
  const [deleteMatchTarget, setDeleteMatchTarget] = useState<MatchWithTournament | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [perPage, setPerPage] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingMatch, setIsDeletingMatch] = useState(false);
  const [isDeletingAllMatches, setIsDeletingAllMatches] = useState(false);
  const [toast, setToast] = useState<null | { type: ToastType; text: string }>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const attachTournamentInfo = (loadedMatches: Match[], loadedTournaments: Tournament[]): MatchWithTournament[] => {
    const matchesWithTournamentInfo: MatchWithTournament[] = loadedMatches.map(match => {
      const tournament = loadedTournaments.find(t => t.id === match.tournamentId);
      return {
        ...match,
        tournamentName: tournament?.name || 'Torneo no encontrado',
        tournamentLogo: tournament?.logo || '',
        tournamentType: tournament?.type
      };
    });

    return matchesWithTournamentInfo.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const reloadMatchesData = async () => {
    const [loadedTournaments, loadedMatches] = await Promise.all([listTournaments(), listMatches()]);
    setTournaments(loadedTournaments);
    setAllMatches(attachTournamentInfo(loadedMatches, loadedTournaments));
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const [loadedTournaments, loadedMatches] = await Promise.all([listTournaments(), listMatches()]);
        if (!mounted) return;
        setTournaments(loadedTournaments);
        setAllMatches(attachTournamentInfo(loadedMatches, loadedTournaments));
      } catch (error) {
        console.error('Error loading matches:', error);
        if (mounted) {
          setToast({ type: 'error', text: 'No se pudieron cargar los partidos.' });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedTournamentIsCup = useMemo(
    () => (selectedTournament ? tournaments.find(t => t.id === selectedTournament)?.type === 'cup' : false),
    [selectedTournament, tournaments]
  );

  const filteredMatches = useMemo(() => {
    let filtered = [...allMatches];

    if (selectedTournament) {
      filtered = filtered.filter(m => m.tournamentId === selectedTournament);
    }

    if (selectedStatus) {
      filtered = filtered.filter(m => m.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        m =>
          m.homeTeam.toLowerCase().includes(query) ||
          m.awayTeam.toLowerCase().includes(query) ||
          m.tournamentName.toLowerCase().includes(query)
      );
    }

    if (selectedTournamentIsCup) {
      filtered = [...filtered].sort((a, b) => {
        const r = (a.round ?? 0) - (b.round ?? 0);
        if (r !== 0) return r;
        const slotA = a.bracketSlot ?? 0;
        const slotB = b.bracketSlot ?? 0;
        return slotA - slotB;
      });
    }

    return filtered;
  }, [allMatches, selectedTournament, selectedStatus, searchQuery, selectedTournamentIsCup, tournaments]);

  const pagination = usePagination({
    items: filteredMatches,
    perPage,
    initialPage: 1
  });

  /** Para partidos de copa sin bracketSlot (creados antes): inferir slot por orden dentro de la fase. */
  const cupSlotByMatchId = useMemo(() => {
    const map = new Map<string, number>();
    const byTournamentRound = new Map<string, MatchWithTournament[]>();
    for (const m of filteredMatches) {
      if (!isCupTournament(m.tournamentType, m.tournamentName)) continue;
      const key = `${m.tournamentId}-${m.round ?? 0}`;
      if (!byTournamentRound.has(key)) byTournamentRound.set(key, []);
      byTournamentRound.get(key)!.push(m);
    }
    byTournamentRound.forEach((matches) => {
      const sorted = [...matches].sort((a, b) => {
        const sa = a.bracketSlot ?? 999;
        const sb = b.bracketSlot ?? 999;
        if (sa !== sb) return sa - sb;
        return a.id.localeCompare(b.id);
      });
      sorted.forEach((m, idx) => {
        if (m.bracketSlot === undefined) map.set(m.id, idx);
      });
    });
    return map;
  }, [filteredMatches]);

  const getEffectiveCupSlot = (match: MatchWithTournament) =>
    match.bracketSlot ?? cupSlotByMatchId.get(match.id) ?? 0;

  const lastFilterKey = useRef(`${selectedTournament}-${selectedStatus}-${searchQuery}`);
  useEffect(() => {
    const currentFilterKey = `${selectedTournament}-${selectedStatus}-${searchQuery}`;
    if (lastFilterKey.current !== currentFilterKey) {
      pagination.set(1);
      lastFilterKey.current = currentFilterKey;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTournament, selectedStatus, searchQuery]);

  const handleCreateMatch = async (data: { date: string; homeTeam: string; awayTeam: string; tournamentId?: string; round?: number }) => {
    try {
      const tournamentId = data.tournamentId || selectedTournament || tournaments[0]?.id;
      if (!tournamentId) {
        setToast({ type: 'error', text: 'No hay torneos disponibles. Crea un torneo primero.' });
        return;
      }

      const tournament = tournaments.find(t => t.id === tournamentId);
      if (!tournament) {
        setToast({ type: 'error', text: 'Torneo no encontrado.' });
        return;
      }

      const { addMatch } = await import('../../utils/tournamentService');
      await addMatch(tournamentId, {
        date: data.date,
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        round: Math.max(1, data.round || 1)
      });
      await reloadMatchesData();
      setShowNewMatch(false);
      setToast({ type: 'success', text: 'Partido creado correctamente.' });
    } catch (error) {
      console.error('Error creating match:', error);
      setToast({ type: 'error', text: 'Error al crear el partido.' });
    }
  };

  const handleUpdateMatch = async (matchId: string, tournamentId: string, data: Partial<Match>) => {
    try {
      await updateMatch(tournamentId, matchId, data);

      const { recalculateAndUpdatePlayerGoals } = await import('../../utils/playerStatsHelpers');
      await recalculateAndUpdatePlayerGoals();

      if (data.status === 'finished' && data.homeScore !== undefined && data.awayScore !== undefined) {
        const { recalculateAndUpdateStandings } = await import('../../utils/standingsHelpers');
        await recalculateAndUpdateStandings(tournamentId);
      }

      await reloadMatchesData();
      setEditingMatch(null);
      setToast({ type: 'success', text: 'Partido actualizado.' });
    } catch (error) {
      console.error('Error updating match:', error);
      setToast({ type: 'error', text: 'Error al actualizar el partido.' });
    }
  };

  const handleDeleteMatch = async (matchId: string, tournamentId: string) => {
    if (isDeletingMatch) return;
    setIsDeletingMatch(true);
    try {
      await deleteMatch(tournamentId, matchId);
      const { recalculateAndUpdatePlayerGoals } = await import('../../utils/playerStatsHelpers');
      await recalculateAndUpdatePlayerGoals();
      await reloadMatchesData();
      setDeleteMatchTarget(null);
      setToast({ type: 'success', text: 'Partido eliminado.' });
    } catch (error) {
      console.error('Error deleting match:', error);
      setToast({ type: 'error', text: 'Error al eliminar el partido.' });
    } finally {
      setIsDeletingMatch(false);
    }
  };

  const handleDeleteAllMatches = async () => {
    if (isDeletingAllMatches) return;
    setIsDeletingAllMatches(true);
    try {
      const deletedCount = await deleteAllMatches();
      const { recalculateAndUpdatePlayerGoals } = await import('../../utils/playerStatsHelpers');
      await recalculateAndUpdatePlayerGoals();
      await reloadMatchesData();
      setShowDeleteAllConfirm(false);
      setToast({ type: 'success', text: `Se eliminaron ${deletedCount} partidos exitosamente.` });
    } catch (error) {
      console.error('Error deleting all matches:', error);
      setShowDeleteAllConfirm(false);
      setToast({ type: 'error', text: 'Error al eliminar todos los partidos.' });
      try {
        await reloadMatchesData();
      } catch (reloadError) {
        console.error('Error reloading matches after delete-all failure:', reloadError);
      }
    } finally {
      setIsDeletingAllMatches(false);
    }
  };

  const allTeams = useMemo(() => {
    const teamsSet = new Set<string>();
    tournaments.forEach(t => {
      t.teams?.forEach(team => teamsSet.add(team));
    });
    return Array.from(teamsSet).sort();
  }, [tournaments]);

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />}

      <AdminPageHeader
        title="Gestion de Partidos"
        subtitle="Administra todos los partidos de los torneos."
        actions={
          <>
          {allMatches.length > 0 && (
            <button
              className="btn-outline flex items-center text-red-400 border-red-400/30 hover:bg-red-400/10"
              onClick={() => setShowDeleteAllConfirm(true)}
            >
              <Trash size={16} className="mr-2" />
              Eliminar todos ({allMatches.length})
            </button>
          )}
          <button
            className="btn-primary flex items-center"
            onClick={() => {
              if (tournaments.length === 0) {
                setToast({ type: 'error', text: 'No hay torneos disponibles. Crea un torneo primero.' });
                return;
              }
              setShowNewMatch(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Nuevo partido
          </button>
          </>
        }
      />

      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por equipos o torneo..."
              className="input pl-10 w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select className="input w-full" value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}>
              <option value="">Todos los torneos</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select className="input w-full" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <p className="text-gray-400 text-sm mb-1">Total de partidos</p>
          <h3 className="text-2xl font-bold text-white">{filteredMatches.length}</h3>
          {filteredMatches.length !== allMatches.length && (
            <p className="text-xs text-gray-500 mt-1">de {allMatches.length} totales</p>
          )}
        </div>
        <div className="card p-4">
          <p className="text-gray-400 text-sm mb-1">Programados</p>
          <h3 className="text-2xl font-bold text-yellow-400">{filteredMatches.filter(m => m.status === 'scheduled').length}</h3>
        </div>
        <div className="card p-4">
          <p className="text-gray-400 text-sm mb-1">En vivo</p>
          <h3 className="text-2xl font-bold text-red-400">{filteredMatches.filter(m => m.status === 'live').length}</h3>
        </div>
        <div className="card p-4">
          <p className="text-gray-400 text-sm mb-1">Finalizados</p>
          <h3 className="text-2xl font-bold text-green-400">{filteredMatches.filter(m => m.status === 'finished').length}</h3>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Torneo</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Local</th>
                <th className="px-4 py-3 text-center">Resultado</th>
                <th className="px-4 py-3 text-left">Visitante</th>
                <th className="px-4 py-3 text-center">Jornada/Fase</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    Cargando partidos...
                  </td>
                </tr>
              ) : pagination.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                    {allMatches.length === 0
                      ? 'No hay partidos. Crea un torneo y añade partidos primero.'
                      : 'No se encontraron partidos con los filtros seleccionados.'}
                  </td>
                </tr>
              ) : (
                pagination.items.map(match => (
                  <tr key={match.id} className="border-b border-gray-800 hover:bg-dark-lighter transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={match.tournamentLogo || '/default.png'}
                          alt={match.tournamentName}
                          className="w-6 h-6 rounded object-cover"
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/default.png';
                          }}
                        />
                        <span className="font-medium text-sm">{match.tournamentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {match.homeTeam
                        ? isCupPlaceholderLabel(match.homeTeam)
                          ? <span className="text-gray-400 italic">{match.homeTeam}</span>
                          : match.homeTeam
                        : (() => {
                            const isCup = isCupTournament(match.tournamentType, match.tournamentName);
                            if (isCup) {
                              const slot = getEffectiveCupSlot(match);
                              const placeholders = getCupMatchPlaceholders(Math.max(1, match.round ?? 1), slot);
                              return placeholders ? <span className="text-gray-400 italic">{placeholders.home}</span> : 'Por definir';
                            }
                            return 'Por definir';
                          })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined ? (
                        <span className="text-lg font-bold">
                          <MatchScore match={match} />
                        </span>
                      ) : match.status === 'live' ? (
                        <span className="text-red-400 font-bold animate-pulse">LIVE</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {match.awayTeam
                        ? isCupPlaceholderLabel(match.awayTeam)
                          ? <span className="text-gray-400 italic">{match.awayTeam}</span>
                          : match.awayTeam
                        : (() => {
                            const isCup = isCupTournament(match.tournamentType, match.tournamentName);
                            if (isCup) {
                              const slot = getEffectiveCupSlot(match);
                              const placeholders = getCupMatchPlaceholders(Math.max(1, match.round ?? 1), slot);
                              return placeholders ? <span className="text-gray-400 italic">{placeholders.away}</span> : 'Por definir';
                            }
                            return 'Por definir';
                          })()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isCupTournament(match.tournamentType, match.tournamentName) ? (
                        <span className="px-2 py-1 bg-indigo-700/40 border border-indigo-500/30 rounded text-xs" title={getCupStageLabel(Math.max(1, match.round || 1))}>
                          {getCupStageShortLabel(Math.max(1, match.round ?? 1))} · P{getEffectiveCupSlot(match) + 1}
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-700 rounded text-xs">J{Math.max(1, match.round || 1)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        label={match.status === 'scheduled' ? 'Programado' : match.status === 'live' ? 'En vivo' : 'Finalizado'}
                        tone={match.status === 'scheduled' ? 'neutral' : match.status === 'live' ? 'danger' : 'success'}
                        withDot
                        pulseDot={match.status === 'live'}
                      />
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

      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>
              Mostrando {((pagination.page - 1) * perPage) + 1} - {Math.min(pagination.page * perPage, pagination.total)} de {pagination.total} partidos
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={perPage}
              onChange={e => {
                setPerPage(Number(e.target.value));
                pagination.set(1);
              }}
              className="px-3 py-2 bg-gray-700/60 border border-gray-600/60 rounded-lg text-white text-sm focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value={25}>25 por pagina</option>
              <option value={50}>50 por pagina</option>
              <option value={100}>100 por pagina</option>
            </select>

            <button
              onClick={pagination.prev}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-dark-light border border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-dark-lighter transition-colors flex items-center gap-2"
            >
              <ChevronLeft size={18} />
              <span className="hidden sm:inline">Anterior</span>
            </button>

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
          onSave={data => handleUpdateMatch(editingMatch.id, editingMatch.tournamentId, data)}
          teams={allTeams}
        />
      )}

      <ConfirmModal
        open={!!deleteMatchTarget}
        title="Eliminar partido"
        description={
          deleteMatchTarget
            ? `Estas seguro de que deseas eliminar el partido entre ${deleteMatchTarget.homeTeam} y ${deleteMatchTarget.awayTeam}? Esta accion no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
        loadingLabel="Eliminando..."
        isLoading={isDeletingMatch}
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={() => {
          if (!deleteMatchTarget) return;
          handleDeleteMatch(deleteMatchTarget.id, deleteMatchTarget.tournamentId);
        }}
        onCancel={() => setDeleteMatchTarget(null)}
      />

      <ConfirmModal
        open={showDeleteAllConfirm}
        title="Eliminar todos los partidos"
        description={`Estas seguro de que deseas eliminar TODOS los partidos (${allMatches.length} partidos)? Esta accion no se puede deshacer.`}
        confirmLabel="Eliminar todos"
        loadingLabel="Eliminando..."
        isLoading={isDeletingAllMatches}
        cancelLabel="Cancelar"
        tone="danger"
        onConfirm={handleDeleteAllMatches}
        onCancel={() => setShowDeleteAllConfirm(false)}
      />

      {tournaments.length === 0 && (
        <div className="mt-4 p-4 bg-gray-800 border border-yellow-500/40 rounded-lg text-yellow-200 text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5 text-yellow-400" />
          <span>No hay torneos cargados. Crea un torneo para poder registrar partidos.</span>
        </div>
      )}
    </div>
  );
};

export default AdminMatches;
