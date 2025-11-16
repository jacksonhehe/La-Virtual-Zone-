import { useEffect, useState } from 'react';
import { Clipboard, Edit, Plus, Trash } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/format';
import { usePagination } from '../../hooks/usePagination';
import NewTournamentModal from '../../components/admin/NewTournamentModal';
import EditTournamentModal from '../../components/admin/EditTournamentModal';
import TournamentDetailModal from '../../components/admin/TournamentDetailModal';
import NewMatchModal from '../../components/admin/NewMatchModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import {
  createTournament,
  updateTournament as saveTournament,
  finishTournament,
  deleteTournament as removeTournament,
  addMatch,
  generateRoundRobin,
  listTournaments,
} from '../../utils/tournamentService';

const AdminTournaments = () => {
  const { clubs: storeClubs, tournaments: storeTournaments } = useDataStore();

  const [showNewTournament, setShowNewTournament] = useState(false);
  const [searchParams] = useSearchParams();
  const [editingTournament, setEditingTournament] = useState<any | null>(null);
  const [detailTournament, setDetailTournament] = useState<any | null>(null);
  const [newMatchTournament, setNewMatchTournament] = useState<any | null>(null);
  const [deleteTournamentTarget, setDeleteTournamentTarget] = useState<any | null>(null);

  const handleCreateTournament = async (data: any) => {
    try {
      await createTournament(data);
      setShowNewTournament(false);
    } catch (error) {
      console.error('Error creating tournament:', error);
      // Don't close modal on error so user can try again
      alert('Error al crear el torneo. Por favor, intenta de nuevo.');
    }
  };
  const handleSaveTournament = async (t: any) => {
    try {
      await saveTournament(t);
      setEditingTournament(null);
    } catch (error) {
      console.error('Error saving tournament:', error);
    }
  };
  const handleDeleteTournament = async (id: string) => {
    try {
      await removeTournament(id);
      setDeleteTournamentTarget(null);
    } catch (error) {
      console.error('Error deleting tournament:', error);
    }
  };
  const handleAddMatch = async (tid: string, data: any) => {
    try {
      await addMatch(tid, data);
      setNewMatchTournament(null);
    } catch (error) {
      console.error('Error adding match:', error);
    }
  };
  const handleGenerateFixture = async (tid: string) => {
    try {
      // Buscar el torneo para mostrar su nombre en los mensajes
      const tournament = storeTournaments.find(t => t.id === tid);
      const tournamentName = tournament?.name || 'el torneo';
      
      // Calcular número de partidos según el número de rondas configurado
      const calculateMatches = (teamsCount: number, rounds: number) => {
        // Partidos por vuelta: n * (n-1) / 2
        const matchesPerLeg = (teamsCount * (teamsCount - 1)) / 2;
        // Total de partidos: partidos por vuelta * número de vueltas
        return matchesPerLeg * rounds;
      };
      
      // Confirmar antes de generar (si ya hay partidos, se eliminarán)
      const rounds = tournament?.rounds || 1;
      const expectedMatches = tournament && tournament.teams 
        ? calculateMatches(tournament.teams.length, rounds)
        : 0;
      const roundsDescription = rounds === 1 ? 'solo ida' : rounds === 2 ? 'ida y vuelta' : `${rounds} vueltas`;
      
      const confirmMessage = tournament && tournament.teams 
        ? `¿Generar fixture round-robin para "${tournamentName}"?\n\n• Equipos: ${tournament.teams.length}\n• Vueltas: ${rounds} (${roundsDescription})\n• Partidos totales: ${expectedMatches}\n\nSi ya existen partidos para este torneo, serán eliminados y reemplazados.`
        : `¿Generar fixture round-robin para "${tournamentName}"?`;
      
      if (!window.confirm(confirmMessage)) {
        return;
      }
      
      // Mostrar mensaje de carga
      const loadingMessage = `Generando fixture para "${tournamentName}"...`;
      console.log(loadingMessage);
      
      const matchesCount = await generateRoundRobin(tid);
      
      // Recargar torneos desde el servicio para asegurar que la UI se actualice
      const refreshedTournaments = await listTournaments();
      const { updateTournaments } = useDataStore.getState();
      updateTournaments(refreshedTournaments);
      
      alert(`✅ Fixture generado exitosamente para "${tournamentName}".\n\nSe crearon ${matchesCount} partidos.`);
    } catch (error) {
      console.error('Error generating fixture:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al generar el fixture';
      alert(`❌ Error al generar el fixture:\n\n${errorMessage}`);
    }
  };
  const handleFinishTournament = async (tid: string) => {
    try {
      await finishTournament(tid);
    } catch (error) {
      console.error('Error finishing tournament:', error);
    }
  };

  const sorted = (storeTournaments || [])
    .slice()
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de Torneos</h2>
        <button className="btn-primary flex items-center" onClick={() => setShowNewTournament(true)}>
          <Plus size={16} className="mr-2" />
          Nuevo torneo
        </button>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Torneo</th>
                <th className="px-4 py-3 text-center">Tipo</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Fechas</th>
                <th className="px-4 py-3 text-center">Equipos</th>
                <th className="px-4 py-3 text-center">Rondas</th>
              </tr>
            </thead>
            <tbody>
              {storeTournaments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                    No hay torneos.
                  </td>
                </tr>
              )}
              {storeTournaments
                .slice()
                .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                .map((t) => (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">
                      <button className="flex items-center gap-2 hover:underline" onClick={() => setDetailTournament(t)}>
                        <img src={t.logo} alt={t.name} className="w-6 h-6" />
                        <span className="font-medium">{t.name}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">{t.type}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-300">{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {formatDate(t.startDate)} - {formatDate(t.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center">{t.teams.length}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span>{t.rounds}</span>
                        <button
                          className="p-1 text-gray-400 hover:text-primary"
                          onClick={() => setEditingTournament(t)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-green-400"
                          onClick={() => setNewMatchTournament(t)}
                          title="Añadir partido"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-blue-400"
                          onClick={() => handleGenerateFixture(t.id)}
                          title="Generar fixture"
                        >
                          <Clipboard size={16} />
                        </button>
                        <button
                          className="p-1 text-gray-400 hover:text-red-500"
                          onClick={() => setDeleteTournamentTarget(t)}
                          title="Eliminar torneo"
                        >
                          <Trash size={16} />
                        </button>
                        {t.status !== 'finished' && (
                          <button
                            className="hidden p-1 text-gray-400 hover:text-yellow-400"
                            onClick={() => handleFinishTournament(t.id)}
                            title="Finalizar/Archivar"
                          >
                            <Clipboard size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewTournament && (
        <NewTournamentModal
          onClose={() => setShowNewTournament(false)}
          onCreate={handleCreateTournament}
          clubs={storeClubs.map((c: any) => ({ id: c.id, name: c.name }))}
        />
      )}
      {editingTournament && (
        <EditTournamentModal
          tournament={editingTournament}
          clubs={storeClubs.map((c: any) => ({ id: c.id, name: c.name }))}
          onClose={() => setEditingTournament(null)}
          onSave={handleSaveTournament}
        />
      )}
      {detailTournament && (
        <TournamentDetailModal tournament={detailTournament} onClose={() => setDetailTournament(null)} />
      )}
      {newMatchTournament && (
        <NewMatchModal
          onClose={() => setNewMatchTournament(null)}
          teams={newMatchTournament.teams}
          onCreate={(data) => handleAddMatch(newMatchTournament.id, data)}
        />
      )}
      {deleteTournamentTarget && (
        <ConfirmDeleteModal
          user={{ id: deleteTournamentTarget.id, username: deleteTournamentTarget.name }}
          onCancel={() => setDeleteTournamentTarget(null)}
          onConfirm={handleDeleteTournament}
          label="torneo"
        />
      )}
    </div>
  );
};

export default AdminTournaments;
