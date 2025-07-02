import { Clock, Play, Award, Trophy, MoreHorizontal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useMemo } from 'react';
import StatsCard from '../components/admin/StatsCard';
import Card from '../../components/common/Card';
import DropdownMenu, {
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '../../components/common/DropdownMenu';
import CreateTournamentWizard from '../wizards/CreateTournament';
import { Tournament } from '../types';
import useCan from '../../hooks/useCan';
import { useGlobalStore } from '../store/globalStore';
import {
  useUpcomingTournaments,
  useActiveTournaments,
  useFinishedTournaments,
} from '../hooks/useTournamentFilters';
import {
  differenceInCalendarDays,
  isToday,
  isTomorrow,
} from 'date-fns';
import { average as avg } from '../utils/fechas';

const TorneosDashboard = () => {
  const navigate = useNavigate();
  const {
    duplicateLastTournament,
    generateTournamentsReport,
  } = useGlobalStore();
  const hasPermission = useCan(['super', 'gestor']);

  const [duplicateData, setDuplicateData] = useState<Partial<Tournament> | null>(
    null
  );

  const handleDuplicate = () => {
    const copy = duplicateLastTournament();
    if (copy) {
      const { id, ...rest } = copy;
      setDuplicateData(rest);
    }
  };

  const tournaments = useGlobalStore(state => state.tournaments);
  const players = useGlobalStore(state => state.players);
  const matches = useGlobalStore(state => state.matches);
  const upcoming = useUpcomingTournaments();
  const active = useActiveTournaments();
  const finished = useFinishedTournaments();

  const { hoyInscritos, partidosManana, mediaGoles } = useMemo(() => {
    const hoyInscritos = players.filter(p => isToday(new Date(p.createdAt))).length;
    const partidosManana = matches.filter(m => isTomorrow(new Date(m.date))).length;
    const ultimos7 = matches.filter(
      m => differenceInCalendarDays(new Date(), new Date(m.date)) < 7
    );
    const mediaGoles =
      avg(ultimos7.map(m => (m.homeScore ?? 0) + (m.awayScore ?? 0))) || 0;
    return { hoyInscritos, partidosManana, mediaGoles };
  }, [players, matches]);

  const showKpis = hoyInscritos > 0 || partidosManana > 0 || mediaGoles > 0;

  return (
    <div className="p-8 space-y-8">
      <header className="relative mb-6 flex items-center">
        <h1 className="text-4xl font-bold gradient-text">Torneos</h1>
        {hasPermission && (
          <Link
            to="/admin/torneos/nuevo"
            className="btn-primary absolute right-6 top-4 lg:static lg:ml-auto lg:mt-0 mt-4"
          >
            + Nuevo torneo
          </Link>
        )}
      </header>
      <div className="relative">
        {showKpis && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="kpi-chip font-medium text-slate-300">
              {hoyInscritos} inscritos hoy
            </span>
            <span className="kpi-chip font-medium text-slate-300">
              {partidosManana} partidos mañana
            </span>
            <span className="kpi-chip font-medium text-slate-300">
              {mediaGoles.toFixed(1)} goles/partido (últimos 7 días)
            </span>
          </div>
        )}
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

      {tournaments.length === 0 && (
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            onClick={() => navigate('/admin/torneos/list?status=upcoming')}
            className="group relative cursor-pointer"
          >
            <StatsCard
              title="Próximos"
              value={upcoming.length}
              icon={Clock}
              gradient="bg-gradient-to-r from-gray-600 to-gray-800"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuItem
                onSelect={() => navigate('/admin/torneos/list?status=upcoming')}
              >
                Ver lista completa
              </DropdownMenuItem>
            </DropdownMenu>
          </Card>
          <Card
            onClick={() => navigate('/admin/torneos/list?status=active')}
            className="group relative cursor-pointer"
          >
            <StatsCard
              title="En Juego"
              value={active.length}
              icon={Play}
              gradient="bg-gradient-to-r from-emerald-600 to-green-600"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuItem
                onSelect={() => navigate('/admin/torneos/list?status=active')}
              >
                Ver lista completa
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => navigate('/admin/resultados-pendientes')}
              >
                Ir a resultados pendientes
              </DropdownMenuItem>
            </DropdownMenu>
          </Card>
          <Card
            onClick={() => navigate('/admin/torneos/list?status=completed')}
            className="group relative cursor-pointer"
          >
            <StatsCard
              title="Cerrados"
              value={finished.length}
              icon={Award}
              gradient="bg-gradient-to-r from-blue-600 to-purple-600"
            />
            <DropdownMenu>
              <DropdownMenuTrigger
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
                onClick={e => e.stopPropagation()}
                aria-label="Más opciones"
              >
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>
              <DropdownMenuItem
                onSelect={() => navigate('/admin/torneos/list?status=completed')}
              >
                Ver lista completa
              </DropdownMenuItem>
              {hasPermission && (
                <DropdownMenuItem onSelect={handleDuplicate}>
                  Duplicar último torneo
                </DropdownMenuItem>
              )}
              {hasPermission && (
                <DropdownMenuItem onSelect={generateTournamentsReport}>
                  Generar reporte PDF
                </DropdownMenuItem>
              )}
            </DropdownMenu>
          </Card>
        </div>
        {duplicateData && (
          <CreateTournamentWizard
            initialData={duplicateData}
            onClose={() => setDuplicateData(null)}
          />
        )}
    </div>
  );
};

export default TorneosDashboard;

