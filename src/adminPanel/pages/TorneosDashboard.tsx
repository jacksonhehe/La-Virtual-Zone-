import { Clock, Play, Award, Trophy, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/admin/StatsCard';
import DropdownMenu from '../components/admin/DropdownMenu';
import useCan from '../../hooks/useCan';
import { useGlobalStore } from '../store/globalStore';

const TorneosDashboard = () => {
  const navigate = useNavigate();
  const {
    duplicateLastTournament,
    generateTournamentsReport,
  } = useGlobalStore();
  const canModify = useCan(['super', 'gestor']);

  const tournaments = useGlobalStore(state => state.tournaments);
  const upcoming = useGlobalStore(state => state.getUpcoming());
  const active = useGlobalStore(state => state.getActive());
  const finished = useGlobalStore(state => state.getFinished());

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text">Torneos</h1>
        {tournaments.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            {upcoming.length > 0 && (
              <span className="bg-white/5 text-xs px-2 py-1 rounded-full">
                {upcoming.length} próximos
              </span>
            )}
            {active.length > 0 && (
              <span className="bg-white/5 text-xs px-2 py-1 rounded-full">
                {active.length} en juego
              </span>
            )}
            {finished.length > 0 && (
              <span className="bg-white/5 text-xs px-2 py-1 rounded-full">
                {finished.length} cerrados
              </span>
            )}
          </div>
        )}
        <p className="text-gray-400 mt-2">Resumen general de torneos</p>
      </div>

      {tournaments.length === 0 ? (
        <div className="flex flex-col items-center gap-4 text-center text-gray-400">
          <Trophy className="w-20 h-20 text-vz-primary/30" />
          <h2 className="text-2xl text-white">No hay torneos todavía</h2>
          <p>Organiza tu primera copa y comienza la diversión</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/torneos/nuevo')}
          >
            Crear nuevo torneo
          </button>
          <a href="/docs/torneos" className="text-sm underline">
            Guía rápida
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            className="group relative cursor-pointer"
            onClick={() => navigate('/admin/torneos/list?status=upcoming')}
          >
            <StatsCard
              title="Próximos"
              value={upcoming.length}
              icon={Clock}
              gradient="bg-gradient-to-r from-gray-600 to-gray-800"
            />
            <DropdownMenu
              items={[
                {
                  label: 'Ver lista completa',
                  onSelect: () => navigate('/admin/torneos/list?status=upcoming')
                }
              ]}
            >
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenu>
          </div>
          <div
            className="group relative cursor-pointer"
            onClick={() => navigate('/admin/torneos/list?status=active')}
          >
            <StatsCard
              title="En Juego"
              value={active.length}
              icon={Play}
              gradient="bg-gradient-to-r from-emerald-600 to-green-600"
            />
            <DropdownMenu
              items={[
                {
                  label: 'Ver lista completa',
                  onSelect: () => navigate('/admin/torneos/list?status=active')
                },
                {
                  label: 'Ir a resultados pendientes',
                  onSelect: () => navigate('/admin/resultados-pendientes')
                }
              ]}
            >
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenu>
          </div>
          <div
            className="group relative cursor-pointer"
            onClick={() => navigate('/admin/torneos/list?status=completed')}
          >
            <StatsCard
              title="Cerrados"
              value={finished.length}
              icon={Award}
              gradient="bg-gradient-to-r from-blue-600 to-purple-600"
            />
            <DropdownMenu
              items={[
                {
                  label: 'Ver lista completa',
                  onSelect: () => navigate('/admin/torneos/list?status=completed')
                },
                {
                  label: 'Duplicar último torneo',
                  onSelect: duplicateLastTournament,
                  hidden: !canModify
                },
                {
                  label: 'Generar reporte PDF',
                  onSelect: generateTournamentsReport,
                  hidden: !canModify
                }
              ]}
            >
              <button
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </button>
            </DropdownMenu>
          </div>
        </div>
      )}
    </div>
  );
};

export default TorneosDashboard;

