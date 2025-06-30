import  { useState } from 'react';
import { Plus, Play, Pause, Award, Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tournament } from '../../types';
import { useGlobalStore } from '../../store/globalStore';
import NewTournamentModal from './NewTournamentModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import { generateId } from '../../../utils/id';

const TournamentsAdminPanel = () => {
  const { tournaments, updateTournamentStatus, addTournament, removeTournament } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState<Tournament | null>(null);
  const [deleteTournament, setDeleteTournament] = useState<Tournament | null>(null);

  const handleView = (t: Tournament) => setSelected(t);
  const handleStart = (id: string) => updateTournamentStatus(id, 'active');
  const handlePause = (id: string) => updateTournamentStatus(id, 'upcoming');
  const handleDelete = () => {
    if (!deleteTournament) return;
    removeTournament(deleteTournament.id);
    setDeleteTournament(null);
    toast.success('Torneo eliminado');
  };

  return (
       <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold gradient-text">Gestión de Torneos</h2>
          <p className="text-gray-400 mt-2">Organiza y supervisa las competiciones</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowNew(true)}
        >
          <Plus size={20} />
          <span>Nuevo Torneo</span>
        </button>
      </div> 

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.length > 0 ? (
          tournaments.map((tournament) => (
            <div key={tournament.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{tournament.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  tournament.status === 'active' 
                    ? 'bg-green-900/20 text-green-300'
                    : tournament.status === 'completed'
                    ? 'bg-blue-900/20 text-blue-300'
                    : 'bg-gray-700 text-gray-300'
                }`}>
                  {tournament.status === 'active' ? 'Activo' : 
                   tournament.status === 'completed' ? 'Completado' : 'Próximo'}
                </span>
              </div>
              
              <div className="space-y-2 text-sm text-gray-400">
                <p>Jornada: {tournament.currentRound} / {tournament.totalRounds}</p>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(tournament.currentRound / tournament.totalRounds) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  className="btn-primary flex-1 text-sm"
                  onClick={() => handleView(tournament)}
                >
                  <Award size={16} className="mr-1" />
                  Ver
                </button>
                {tournament.status === 'active' ? (
                  <button
                    className="btn-outline text-sm"
                    onClick={() => handlePause(tournament.id)}
                  >
                    <Pause size={16} />
                  </button>
                ) : (
                  <button
                    className="btn-outline text-sm"
                    onClick={() => handleStart(tournament.id)}
                  >
                    <Play size={16} />
                  </button>
                )}
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => setDeleteTournament(tournament)}
                  title="Eliminar"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full card text-center py-8">
            <p className="text-gray-400">No hay torneos creados</p>
          </div>
        )}
      </div>

      {/* Sample tournaments for demo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Liga Profesional</h3>
            <span className="px-2 py-1 rounded-full text-xs bg-green-900/20 text-green-300">
              Activo
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Jornada: 15 / 38</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '39%' }}></div>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button className="btn-primary flex-1 text-sm">
              <Award size={16} className="mr-1" />
              Ver Tabla
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Copa Nacional</h3>
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-900/20 text-yellow-300">
              Próximo
            </span>
          </div>
          <div className="space-y-2 text-sm text-gray-400">
            <p>Fase: Octavos de Final</p>
            <p>Fecha de inicio: 15/12/2023</p>
          </div>
          <div className="flex space-x-2 mt-4">
            <button className="btn-outline flex-1 text-sm">
              <Play size={16} className="mr-1" />
              Iniciar
            </button>
          </div>
        </div>
      </div>
      {showNew && (
        <NewTournamentModal
          onClose={() => setShowNew(false)}
          onSave={(data) => {
            addTournament({ id: generateId(), ...data });
            setShowNew(false);
          }}
        />
      )}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">{selected.name}</h3>
            <p className="text-gray-400 mb-2">
              Estado:{' '}
              {selected.status === 'active'
                ? 'Activo'
                : selected.status === 'completed'
                ? 'Completado'
                : 'Próximo'}
            </p>
            <p className="text-gray-400 mb-4">
              Jornada: {selected.currentRound} / {selected.totalRounds}
            </p>
            <div className="flex justify-end">
              <button className="btn-outline" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteTournament && (
        <ConfirmDeleteModal
          message={`¿Estás seguro de eliminar el torneo "${deleteTournament.name}"?`}
          onConfirm={handleDelete}
          onClose={() => setDeleteTournament(null)}
        />
      )}
    </div>
  );
};

export default TournamentsAdminPanel;
 