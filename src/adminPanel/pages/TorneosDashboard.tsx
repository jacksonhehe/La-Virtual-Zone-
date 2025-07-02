import { Clock, Play, Award, Trophy, MoreHorizontal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
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
import { isToday, isTomorrow, average } from '../utils/fechas';

const TorneosDashboard = () => {
  const navigate = useNavigate();
  const {
    duplicateLastTournament,
    generateTournamentsReport,
  } = useGlobalStore();
  const canModify = useCan(['super', 'gestor']);

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

  const hoyInscritos = players.filter(p => p.createdAt && isToday(p.createdAt)).length;
  const partidosManana = matches.filter(m => m.date && isTomorrow(m.date)).length;
  const matchesLast7Days = matches.filter(m => {
    if (!m.date) return false;
    const d = new Date(m.date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  });
  const mediaGolesValue = average(
    matchesLast7Days.map(m => (m.homeScore ?? 0) + (m.awayScore ?? 0))
  );
  const mediaGoles = Number.isNaN(mediaGolesValue)
    ? '0.0'
    : mediaGolesValue.toFixed(1);
  const showKpis =
    hoyInscritos > 0 || partidosManana > 0 || (!Number.isNaN(mediaGolesValue) && mediaGolesValue > 0);

  return (
    <div className="p-8 space-y-8">
      <div className="relative">
        <h1 className="text-4xl font-bold gradient-text">Torneos</h1>
        {showKpis && (
          <div className="flex items-center gap-2 mt-2">
            <span className="kpi-chip">{hoyInscritos} inscritos hoy</span>
            <span className="kpi-chip">{partidosManana} partidos mañana</span>
            <span className="kpi-chip">{mediaGoles} goles/partido (7 días)</span>
          </div>
        )}
        {canModify && (
          <Link
            to="/admin/torneos/nuevo"
            className="btn-primary w-full mt-2 sm:w-auto sm:mt-0 lg:absolute lg:top-0 lg:right-0"
          >
            + Nuevo torneo
          </Link>
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
              {canModify && (
                <DropdownMenuItem onSelect={handleDuplicate}>
                  Duplicar último torneo
                </DropdownMenuItem>
              )}
              {canModify && (
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

