import { useEffect, useState, useMemo, useCallback } from 'react';
import { Clipboard, Edit, Plus, Trash, X, CheckCircle2, AlertTriangle, GitBranch } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';
import NewTournamentModal from '../../components/admin/NewTournamentModal';
import EditTournamentModal from '../../components/admin/EditTournamentModal';
import TournamentDetailModal from '../../components/admin/TournamentDetailModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import {
  createTournament,
  updateTournament as saveTournament,
  finishTournament,
  deleteTournament as removeTournament,
  generateCupBracket,
  listTournaments,
} from '../../utils/tournamentService';

type ToastType = 'success' | 'error';

const Toast = ({ type, message, onClose }: { type: ToastType; message: string; onClose: () => void }) => {
  const icon =
    type === 'success' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <AlertTriangle size={16} className="text-red-400" />;
  const bg =
    type === 'success'
      ? 'bg-emerald-950/95 border-emerald-400/70 text-emerald-100'
      : 'bg-red-950/95 border-red-400/70 text-red-100';
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm border rounded-lg px-4 py-3 shadow-2xl backdrop-blur-sm ${bg}`}>
      <div className="flex items-start gap-2">
        {icon}
        <div className="text-sm">{message}</div>
        <button className="ml-auto text-xs text-gray-300 hover:text-white" onClick={onClose}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

const AdminTournaments = () => {
  const { clubs: storeClubs, tournaments: storeTournaments, updateTournaments } = useDataStore();

  const normalizeTeamRef = (value: string | undefined) => String(value || '').trim().toLowerCase();
  const isPlaceholderTeam = (value: string | undefined) => {
    const normalized = normalizeTeamRef(value);
    return !normalized || normalized === 'libre' || normalized === 'free';
  };

  const [showNewTournament, setShowNewTournament] = useState(false);
  const [searchParams] = useSearchParams();
  const [editingTournament, setEditingTournament] = useState<any | null>(null);
  const [detailTournament, setDetailTournament] = useState<any | null>(null);
  const [deleteTournamentTarget, setDeleteTournamentTarget] = useState<any | null>(null);
  const [generateCupTarget, setGenerateCupTarget] = useState<any | null>(null);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const refreshTournaments = useCallback(async () => {
    try {
      const fresh = await listTournaments();
      updateTournaments(fresh);
    } catch (error) {
      console.error('Error refrescando torneos:', error);
      setToast({ type: 'error', message: 'No se pudo actualizar la lista de torneos.' });
    }
  }, [updateTournaments]);

  const handleCreateTournament = async (data: any) => {
    setBusyAction('create');
    try {
      await createTournament(data);
      await refreshTournaments();
      setShowNewTournament(false);
      setToast({ type: 'success', message: 'Torneo creado correctamente.' });
    } catch (error) {
      console.error('Error creating tournament:', error);
      setToast({ type: 'error', message: 'Error al crear el torneo. Intenta nuevamente.' });
    } finally {
      setBusyAction(null);
    }
  };
  const handleSaveTournament = async (t: any) => {
    setBusyAction('save');
    try {
      await saveTournament(t);
      await refreshTournaments();
      setEditingTournament(null);
      setToast({ type: 'success', message: 'Torneo actualizado.' });
    } catch (error) {
      console.error('Error saving tournament:', error);
      setToast({ type: 'error', message: 'No se pudo guardar el torneo.' });
    } finally {
      setBusyAction(null);
    }
  };
  const handleDeleteTournament = async (id: string) => {
    setBusyAction('delete');
    try {
      await removeTournament(id);
      await refreshTournaments();
      setDeleteTournamentTarget(null);
      setToast({ type: 'success', message: 'Torneo eliminado.' });
    } catch (error) {
      console.error('Error deleting tournament:', error);
      setToast({ type: 'error', message: 'No se pudo eliminar el torneo.' });
    } finally {
      setBusyAction(null);
    }
  };
  const handleFinishTournament = async (tid: string) => {
    setBusyAction('finish');
    try {
      await finishTournament(tid);
      await refreshTournaments();
      setToast({ type: 'success', message: 'Torneo finalizado.' });
    } catch (error) {
      console.error('Error finishing tournament:', error);
      setToast({ type: 'error', message: 'No se pudo finalizar el torneo.' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleGenerateCupBracket = async (tid: string) => {
    setBusyAction('generate-cup');
    try {
      const created = await generateCupBracket(tid);
      await refreshTournaments();
      setToast({ type: 'success', message: `Llaves generadas: ${created} partidos creados.` });
    } catch (error) {
      console.error('Error generating cup bracket:', error);
      const message = error instanceof Error ? error.message : 'No se pudieron generar las llaves.';
      setToast({ type: 'error', message });
    } finally {
      setBusyAction(null);
      setGenerateCupTarget(null);
    }
  };

  const sorted = useMemo(
    () =>
      (storeTournaments || [])
        .slice()
        .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [storeTournaments]
  );
  const validClubs = useMemo(
    () => (storeClubs || []).filter((club) => !isPlaceholderTeam(club?.id) && !isPlaceholderTeam(club?.name)),
    [storeClubs]
  );
  const getValidTeamsCount = (teams: string[] = []) => teams.filter((team) => !isPlaceholderTeam(team)).length;
  const getCupPhases = (teamsCount: number) => Math.max(1, Math.ceil(Math.log2(Math.max(2, teamsCount))));
  const [page, setPage] = useState(1);
  const { items: pageItems, totalPages, next, prev } = usePagination({ items: sorted, perPage: 10, initialPage: page });

  // Open create modal if requested via query
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setShowNewTournament(true);
    }
  }, [searchParams]);

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      <AdminPageHeader
        title="Gestion de Torneos"
        subtitle="Crea, edita y cierra torneos con control de llaves y jornadas."
        actions={
          <button className="btn-primary flex items-center" onClick={() => setShowNewTournament(true)} disabled={busyAction === 'create'}>
            <Plus size={16} className="mr-2" />
            Nuevo torneo
          </button>
        }
      />

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Torneo</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Fechas</th>
                <th className="px-4 py-3 text-center">Equipos</th>
                <th className="px-4 py-3 text-center">Jornadas/Fases</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {storeTournaments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-gray-400">
                    No hay torneos.
                  </td>
                </tr>
              )}
              {pageItems.map((t) => (
                  (() => {
                    const validTeamsCount = getValidTeamsCount(t.teams);
                    const phasesOrRounds =
                      t.type === 'cup' ? `F${getCupPhases(validTeamsCount)}` : `J${Math.max(1, t.rounds || 1)}`;
                    return (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-2 hover:underline" onClick={() => setDetailTournament(t)}>
                        <img src={t.logo} alt={t.name} className="w-6 h-6" />
                        <span className="font-medium">{t.name}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">{t.type}</td>
                    <td className="px-4 py-3 text-center">
                      <AdminStatusBadge
                        label={t.status === 'active' ? 'Activo' : t.status === 'finished' ? 'Finalizado' : 'Proximo'}
                        tone={t.status === 'active' ? 'success' : t.status === 'finished' ? 'neutral' : 'info'}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {formatDate(t.startDate)} - {formatDate(t.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center">{validTeamsCount}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      <span>{phasesOrRounds}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          className="p-1 text-gray-400 hover:text-primary"
                          onClick={() => setEditingTournament(t)}
                          title="Editar"
                          disabled={busyAction === 'save'}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-500"
                          onClick={() => setDeleteTournamentTarget(t)}
                          title="Eliminar torneo"
                          disabled={busyAction === 'delete'}
                        >
                          <Trash size={16} />
                        </button>
                        {t.status !== 'finished' && (
                          <button
                            className="p-1 text-gray-400 hover:text-yellow-400"
                            onClick={() => handleFinishTournament(t.id)}
                            title="Finalizar/Archivar"
                            disabled={busyAction === 'finish'}
                          >
                            <Clipboard size={16} />
                          </button>
                        )}
                        {t.type === 'cup' && (
                          <button
                            className="p-1 text-gray-400 hover:text-cyan-400"
                            onClick={() => setGenerateCupTarget(t)}
                            title="Generar Llaves Copa"
                            disabled={busyAction === 'generate-cup'}
                          >
                            <GitBranch size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                    );
                  })()
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400 mt-3">
        <button
          className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50"
          onClick={() => {
            prev();
            setPage(p => Math.max(1, p - 1));
          }}
          disabled={page <= 1}
        >
          Anterior
        </button>
        <span>
          Página {page} de {totalPages}
        </span>
        <button
          className="px-3 py-1 rounded bg-dark-lighter hover:bg-dark disabled:opacity-50"
          onClick={() => {
            next();
            setPage(p => Math.min(totalPages, p + 1));
          }}
          disabled={page >= totalPages}
        >
          Siguiente
        </button>
      </div>

      {showNewTournament && (
        <NewTournamentModal
          onClose={() => setShowNewTournament(false)}
          onCreate={handleCreateTournament}
          clubs={validClubs.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      )}
      {editingTournament && (
        <EditTournamentModal
          tournament={editingTournament}
          clubs={validClubs.map((c: any) => ({ id: c.id, name: c.name }))}
          onClose={() => setEditingTournament(null)}
          onSave={handleSaveTournament}
        />
      )}
      {detailTournament && (
        <TournamentDetailModal tournament={detailTournament} onClose={() => setDetailTournament(null)} />
      )}
      {deleteTournamentTarget && (
        <ConfirmDeleteModal
          user={{ id: deleteTournamentTarget.id, username: deleteTournamentTarget.name }}
          onCancel={() => setDeleteTournamentTarget(null)}
          onConfirm={handleDeleteTournament}
          label="torneo"
        />
      )}
      <ConfirmModal
        open={!!generateCupTarget}
        title="Generar llaves de copa"
        description={
          generateCupTarget
            ? `Se generaran todas las llaves de "${generateCupTarget.name}". Si ya existen partidos, primero debes eliminarlos.`
            : ''
        }
        confirmLabel="Generar llaves"
        loadingLabel="Generando..."
        isLoading={busyAction === 'generate-cup'}
        cancelLabel="Cancelar"
        tone="primary"
        onConfirm={() => {
          if (!generateCupTarget) return;
          handleGenerateCupBracket(generateCupTarget.id);
        }}
        onCancel={() => setGenerateCupTarget(null)}
      />
    </div>
  );
};

export default AdminTournaments;


