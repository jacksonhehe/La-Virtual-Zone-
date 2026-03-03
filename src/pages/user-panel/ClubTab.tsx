import {
  AlertTriangle,
  ArrowRight,
  BadgeAlert,
  CalendarClock,
  CheckCircle2,
  Coins,
  Shield,
  Trophy,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Club, Player, Standing } from '../../types';
import { panelItemClass, panelSurfaceClass } from './helpers';

interface ClubTabProps {
  userClub: Club | null;
  players: Player[];
  standings: Standing[];
}

const ClubTab = ({ userClub, players, standings }: ClubTabProps) => {
  if (!userClub) {
    return (
      <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/30">
        <div className="flex items-center mb-4 gap-3">
          <AlertTriangle size={24} className="text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-yellow-400">Club no encontrado</h2>
            <p className="text-gray-400 text-sm">No se pudo cargar la informacion de tu club.</p>
          </div>
        </div>
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-300 text-sm font-medium mb-2">Posibles causas:</p>
          <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
            <li>No estas asociado a ningun club</li>
            <li>Problema con los datos del club</li>
            <li>El club fue eliminado o renombrado</li>
          </ul>
          <p className="text-gray-400 text-sm mt-3">Contacta al staff si crees que es un error.</p>
        </div>
      </div>
    );
  }

  const clubSlug = encodeURIComponent(userClub.name.toLowerCase().replace(/\s+/g, '-'));
  const squadPlayers = players.filter((player) => player.clubId === userClub.id);
  const squadSize = squadPlayers.length;

  const standing = standings.find((entry) => entry.clubId === userClub.id);
  const standingPosition = (standing as any)?.position || (standing ? standings.indexOf(standing) + 1 : 'N/A');

  const budget = Number((userClub as any).budget || 0);
  const averageAge =
    squadSize > 0
      ? squadPlayers.reduce((sum, player) => sum + Number(player.age || 0), 0) / squadSize
      : 0;
  const squadValue = squadPlayers.reduce((sum, player) => sum + Number(player.transferValue || 0), 0);

  const now = Date.now();
  const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
  const expiringContracts = squadPlayers.filter((player) => {
    const contractExpiry = Date.parse(player.contract?.expires || '');
    return Number.isFinite(contractExpiry) && contractExpiry >= now && contractExpiry <= now + ninetyDaysInMs;
  });

  const hasCaptain = squadPlayers.some((player) => player.skills?.captaincy === true);

  const status =
    squadSize === 0
      ? 'Sin plantilla'
      : 'Activo';

  const statusTone =
    status === 'Activo'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
      : 'bg-red-500/15 text-red-300 border-red-500/40';

  const alerts = [
    squadSize < 18
      ? {
          id: 'squad-size',
          title: `Plantilla corta: ${squadSize} jugadores`,
          description: 'Te recomendamos al menos 18 para competir con rotacion.',
          to: '/liga-master/mercado',
          cta: 'Ir al mercado'
        }
      : null,
    expiringContracts.length > 0
      ? {
          id: 'contracts',
          title: `${expiringContracts.length} contrato${expiringContracts.length !== 1 ? 's' : ''} por vencer`,
          description: 'Revisa renovaciones para evitar salidas inesperadas.',
          to: `/liga-master/club/${clubSlug}/plantilla`,
          cta: 'Revisar plantilla'
        }
      : null,
    !hasCaptain
      ? {
          id: 'captain',
          title: 'No hay capitan definido',
          description: 'Asigna un lider para estabilizar el vestuario.',
          to: `/liga-master/club/${clubSlug}/plantilla`,
          cta: 'Definir capitan'
        }
      : null
  ].filter(Boolean) as Array<{ id: string; title: string; description: string; to: string; cta: string }>;

  return (
    <div className="space-y-6">
      <div className={`${panelSurfaceClass} p-6`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-5">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-20 h-20 rounded-xl border border-gray-600/90 bg-gray-900/60 p-2.5 flex items-center justify-center shrink-0">
              <img
                src={userClub.logo || '/default-club.svg'}
                alt={`Escudo de ${userClub.name}`}
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-club.svg';
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl font-bold text-white truncate">{userClub.name}</h1>
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusTone}`}>
                  {status}
                </span>
              </div>
              <p className="text-gray-300 text-sm">Liga Master - Fundado en {userClub.foundedYear || 'Anio desconocido'}</p>
              <p className="text-gray-400 text-xs mt-1">Gestion operativa de tu club y estado competitivo.</p>
            </div>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <Link to={`/liga-master/club/${clubSlug}`} className="btn-secondary text-sm w-full lg:w-auto">
              Ir al Club
            </Link>
            <Link to={`/liga-master/club/${clubSlug}/plantilla`} className="btn-outline text-sm w-full lg:w-auto">
              Ver Plantilla
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <Coins size={20} className="text-yellow-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-300">EUR {(budget / 1_000_000).toFixed(1)}M</div>
              <div className="text-xs text-gray-400 uppercase">Presupuesto</div>
            </div>
          </div>
        </div>

        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <Users size={20} className="text-green-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-300">{squadSize}</div>
              <div className="text-xs text-gray-400 uppercase">Jugadores</div>
            </div>
          </div>
        </div>

        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <Trophy size={20} className="text-secondary" />
            <div className="text-right">
              <div className="text-xl font-bold text-secondary">{squadSize > 0 ? averageAge.toFixed(1) : '-'}</div>
              <div className="text-xs text-gray-400 uppercase">Edad Promedio</div>
            </div>
          </div>
        </div>

        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <Shield size={20} className="text-primary" />
            <div className="text-right">
              <div className="text-xl font-bold text-primary">EUR {(squadValue / 1_000_000).toFixed(1)}M</div>
              <div className="text-xs text-gray-400 uppercase">Valor Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className={`${panelSurfaceClass} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <BadgeAlert size={18} className="text-amber-400" />
          <h2 className="text-lg font-bold text-white">Alertas accionables</h2>
        </div>

        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-semibold text-amber-300">{alert.title}</p>
                  <p className="text-xs text-gray-300 mt-1">{alert.description}</p>
                </div>
                <Link to={alert.to} className="text-sm text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5 font-medium">
                  {alert.cta}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 p-4 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-300 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-emerald-300">Sin alertas operativas</p>
              <p className="text-xs text-gray-300 mt-1">Tu club no presenta riesgos inmediatos de plantilla ni contratos.</p>
            </div>
          </div>
        )}
      </div>

      <div className={`${panelSurfaceClass} p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <CalendarClock size={18} className="text-cyan-300" />
          <h2 className="text-lg font-bold text-white">Acciones rapidas</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <Link to={`/liga-master/club/${clubSlug}/plantilla`} className="btn-outline text-sm justify-between">
            Plantilla
            <ArrowRight size={14} />
          </Link>
          <Link to="/liga-master/mercado" className="btn-outline text-sm justify-between">
            Mercado
            <ArrowRight size={14} />
          </Link>
          <Link to={`/liga-master/club/${clubSlug}/finanzas`} className="btn-outline text-sm justify-between">
            Finanzas
            <ArrowRight size={14} />
          </Link>
          <Link to="/liga-master/fixture" className="btn-outline text-sm justify-between">
            Calendario
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <Trophy size={20} className="text-secondary" />
            <div className="text-right">
              <div className="text-xl font-bold text-secondary">{standingPosition}</div>
              <div className="text-xs text-gray-400 uppercase">Posicion Actual</div>
            </div>
          </div>
        </div>

        <div className={panelItemClass}>
          <div className="flex items-center justify-between">
            <AlertTriangle size={20} className={expiringContracts.length > 0 ? 'text-amber-400' : 'text-emerald-400'} />
            <div className="text-right">
              <div className={`text-xl font-bold ${expiringContracts.length > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {expiringContracts.length}
              </div>
              <div className="text-xs text-gray-400 uppercase">Contratos por vencer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubTab;
