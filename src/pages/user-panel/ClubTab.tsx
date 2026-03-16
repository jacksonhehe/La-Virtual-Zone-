import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Calendar, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Club, Match, Player, Standing } from '../../types';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/format';
import { listMatches } from '../../utils/matchService';
import { panelItemClass, panelSurfaceClass } from './helpers';

interface ClubTabProps {
  userClub: Club | null;
  players: Player[];
  standings: Standing[];
}

const normalizeRef = (value: string | undefined) => String(value || '').trim().toLowerCase();

const getMatchTimestamp = (match: Match) => {
  const timestamp = new Date(match.date).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
};

const isFutureOrToday = (match: Match) => {
  const parsedDate = new Date(match.date);
  if (Number.isNaN(parsedDate.getTime())) return false;

  const hasExplicitTime = typeof match.date === 'string' && match.date.includes('T');
  if (!hasExplicitTime) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    return parsedDate.getTime() >= todayStart.getTime();
  }

  return parsedDate.getTime() >= Date.now();
};

const isClubTeamRef = (teamRef: string | undefined, clubToMatch: Club) => {
  const normalized = normalizeRef(teamRef);
  return normalized === normalizeRef(clubToMatch.id) || normalized === normalizeRef(clubToMatch.name);
};

const findClubByTeamRef = (teamRef: string | undefined, clubs: Club[]) => {
  const normalized = normalizeRef(teamRef);
  return clubs.find((club) => normalizeRef(club.id) === normalized || normalizeRef(club.name) === normalized);
};

const ClubTab = ({ userClub, players, standings }: ClubTabProps) => {
  const { clubs, tournaments } = useDataStore();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const tournamentMatches = useMemo(() => tournaments.flatMap((tournament) => tournament.matches || []), [tournaments]);
  const matchesSource = allMatches.length > 0 ? allMatches : tournamentMatches;
  const nextMatch = useMemo(() => {
    if (!userClub) return null;

    const upcomingMatches = matchesSource
      .filter((match) => {
        const isClubMatch = isClubTeamRef(match.homeTeam, userClub) || isClubTeamRef(match.awayTeam, userClub);
        const isUpcoming = String(match.status) === 'live' || (match.status === 'scheduled' && isFutureOrToday(match));
        return isClubMatch && isUpcoming;
      })
      .sort((a, b) => {
        const aLive = String(a.status) === 'live' ? 1 : 0;
        const bLive = String(b.status) === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return getMatchTimestamp(a) - getMatchTimestamp(b);
      });

    return upcomingMatches[0] || null;
  }, [matchesSource, userClub]);

  useEffect(() => {
    let mounted = true;

    const loadMatches = async () => {
      try {
        const matches = await listMatches();
        if (mounted) setAllMatches(matches);
      } catch (error) {
        console.error('Error loading matches for ClubTab:', error);
      }
    };

    loadMatches();

    return () => {
      mounted = false;
    };
  }, []);

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

  const opponentClub = nextMatch
    ? findClubByTeamRef(isClubTeamRef(nextMatch.homeTeam, userClub) ? nextMatch.awayTeam : nextMatch.homeTeam, clubs)
    : null;
  const opponentName = opponentClub?.name || (nextMatch ? (isClubTeamRef(nextMatch.homeTeam, userClub) ? nextMatch.awayTeam : nextMatch.homeTeam) : '');
  const nextMatchStatus = nextMatch?.status === 'live' ? 'En juego' : 'Proximo partido';

  const status = squadSize === 0 ? 'Sin plantilla' : 'Activo';
  const statusTone =
    status === 'Activo'
      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
      : 'bg-red-500/15 text-red-300 border-red-500/40';

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
              <p className="text-gray-300 text-sm">Fundado en {userClub.foundedYear || 'Anio desconocido'}</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Users size={20} className="text-green-400" />
            <div className="text-right">
              <div className="text-xl font-bold text-green-300">{squadSize}</div>
              <div className="text-xs text-gray-400 uppercase">Jugadores</div>
            </div>
          </div>
        </div>

        <div className={panelItemClass}>
          <div className="flex items-center justify-between gap-4">
            <Calendar size={20} className="text-cyan-300 shrink-0" />
            <div className="text-right min-w-0">
              <div className="text-sm font-semibold text-cyan-200 truncate">{nextMatch ? `vs ${opponentName}` : 'Sin partido'}</div>
              <div className="text-xs text-gray-400 uppercase">{nextMatchStatus}</div>
              {nextMatch && (
                <div className="text-xs text-gray-300 mt-1">{formatDate(nextMatch.date)}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {nextMatch && (
        <div className={`${panelSurfaceClass} p-6`}>
          <div className="rounded-lg border border-cyan-500/25 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-cyan-200">{nextMatchStatus}: {userClub.name} vs {opponentName}</p>
              <p className="text-xs text-gray-300 mt-1">{formatDate(nextMatch.date)}</p>
            </div>
            <Link to="/liga-master/fixture" className="text-sm text-cyan-200 hover:text-cyan-100 inline-flex items-center gap-1.5 font-medium">
              Ver fixture
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {squadSize < 18 && (
        <div className={`${panelSurfaceClass} p-6`}>
          <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-300">Plantilla corta: {squadSize} jugadores</p>
              <p className="text-xs text-gray-300 mt-1">Conviene reforzar el equipo para tener mas rotacion.</p>
            </div>
            <Link to="/liga-master/mercado" className="text-sm text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5 font-medium">
              Ir al mercado
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubTab;
