import { useEffect, useMemo, useState } from 'react';
import  { Link } from 'react-router-dom';
import {
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Briefcase,
  Award,
  BarChart4,
  ChevronRight,
  Home,
  MapPin,
  Crown,
  Shield,
  Activity,
  Play,
  Sparkles
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatsCard from '../../components/common/StatsCard';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatCurrency } from '../../utils/format';
import { listMatches } from '../../utils/matchService';
import { getCupStageLabel, isCupTournament } from '../../utils/matchStages';
import type { Match } from '../../types';
import {
  formatName,
  applyFilters,
  sortDts,
  getDtsStats,
  type Dt,
  type DtFilters
} from '../../utils/dtsUtils';
import { getZonesData, calculateZoneStandings, getZoneName } from '../../data/zonesData';
import { createFallbackStandings } from '../../utils/standingsHelpers';

const DTDashboardSkeleton = () => (
  <div className="space-y-8">
    <div
      className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl animate-fade-up"
      style={{ animationDelay: '40ms' }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
          <div className="flex items-center gap-4 flex-1 animate-pulse">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-700/40 border border-gray-600/30" />
            <div className="space-y-3 flex-1">
              <div className="h-4 w-44 rounded-full bg-gray-700/45" />
              <div className="h-8 w-64 max-w-full rounded-lg bg-gray-700/50" />
              <div className="h-4 w-52 rounded-full bg-gray-700/45" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-28 rounded-full bg-gray-700/45" />
                <div className="h-6 w-24 rounded-full bg-gray-700/45" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
            {[...Array(4)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3 space-y-2 animate-pulse"
                style={{ animationDelay: `${120 + idx * 80}ms` }}
              >
                <div className="h-3 w-16 rounded-full bg-gray-700/45" />
                <div className="h-6 w-12 rounded-lg bg-gray-700/50" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div
      className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 backdrop-blur-sm animate-fade-up"
      style={{ animationDelay: '140ms' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-5 w-48 rounded-full bg-gray-700/45" />
        <div className="h-4 w-24 rounded-full bg-gray-700/45" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="h-16 rounded-xl border border-gray-700/40 bg-gray-800/30 animate-pulse"
              style={{ animationDelay: `${200 + idx * 70}ms` }}
            />
          ))}
        </div>
        <div className="rounded-xl border border-gray-700/40 bg-gray-800/30 p-4 space-y-3 animate-pulse" style={{ animationDelay: '280ms' }}>
          <div className="h-4 w-32 rounded-full bg-gray-700/45" />
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="h-8 rounded-lg bg-gray-700/35" />
          ))}
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '240ms' }}>
      {[...Array(6)].map((_, idx) => (
        <div
          key={idx}
          className="h-36 rounded-2xl border border-gray-700/40 bg-gray-800/35 animate-pulse"
          style={{ animationDelay: `${280 + idx * 70}ms` }}
        />
      ))}
    </div>
  </div>
);

const LigaMaster = () => {
  const { clubs, tournaments, players, standings, marketStatus, offers, isDataLoaded } = useDataStore();
  const { user, hasRole } = useAuthStore();
  const [allMatches, setAllMatches] = useState<Match[]>([]);


  // Check if user is DT
  const isDT = hasRole('dt');
  const ligaMasterTournamentId = useMemo(() => {
    const normalize = (value: string) => String(value || '').trim().toLowerCase();
    const byName = tournaments.find((t) => normalize(t.name).includes('liga master'));
    if (byName) return byName.id;

    const byId = tournaments.find((t) => t.id === 'tournament1');
    if (byId) return byId.id;

    const byLeagueType = tournaments.find((t) => t.type === 'league');
    return byLeagueType?.id || null;
  }, [tournaments]);

  useEffect(() => {
    let mounted = true;

    const loadMatches = async () => {
      try {
        const matches = await listMatches();
        if (mounted) {
          setAllMatches(matches);
        }
      } catch (error) {
        console.error('Error loading matches for LigaMaster dashboard:', error);
      }
    };

    loadMatches();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const refreshStandings = async () => {
      if (!ligaMasterTournamentId) return;
      try {
        const { recalculateAndUpdateStandings } = await import('../../utils/standingsHelpers');
        if (!cancelled) {
          await recalculateAndUpdateStandings(ligaMasterTournamentId);
        }
      } catch (error) {
        console.error('LigaMaster: Error recalculating standings on mount:', error);
      }
    };

    refreshStandings();

    return () => {
      cancelled = true;
    };
  }, [ligaMasterTournamentId]);

  // Get active tournament (Liga Master)
  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  const ligaMasterMatches = allMatches.length > 0
    ? allMatches.filter((m) => m.tournamentId === 'tournament1')
    : (ligaMaster?.matches || []);
  const scheduledStatuses = new Set(['scheduled', 'upcoming']);
  const isScheduledInFuture = (match: Match) => {
    if (!scheduledStatuses.has(String(match.status))) return false;

    const parsedDate = new Date(match.date);
    if (Number.isNaN(parsedDate.getTime())) return false;

    // Si la fecha no trae hora (YYYY-MM-DD), la comparamos por día para incluir "hoy".
    const hasExplicitTime = typeof match.date === 'string' && match.date.includes('T');
    if (!hasExplicitTime) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return parsedDate.getTime() >= todayStart.getTime();
    }

    return parsedDate.getTime() >= Date.now();
  };
  const isLiveMatch = (match: Match) => String(match.status) === 'live';
  const getMatchTimestamp = (match: Match) => {
    const timestamp = new Date(match.date).getTime();
    return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
  };

  const normalizeTeamRef = (value: string | undefined) => String(value || '').trim().toLowerCase();
  const hasDefinedTeams = (match: Match) => {
    const invalidValues = new Set(['', 'por definir', 'a definir', 'tbd', 'to be defined']);
    const isBracketPlaceholder = (teamRef: string) =>
      teamRef.startsWith('ganador ') ||
      teamRef.startsWith('perdedor ') ||
      teamRef.startsWith('winner ') ||
      teamRef.startsWith('loser ');

    const home = normalizeTeamRef(match.homeTeam);
    const away = normalizeTeamRef(match.awayTeam);
    return !invalidValues.has(home) && !invalidValues.has(away) && !isBracketPlaceholder(home) && !isBracketPlaceholder(away);
  };

  const isUserClubMatch = (match: Match, club: typeof userClub) => {
    if (!club) return false;

    const home = normalizeTeamRef(match.homeTeam);
    const away = normalizeTeamRef(match.awayTeam);
    const clubId = normalizeTeamRef(club.id);
    const clubName = normalizeTeamRef(club.name);

    return home === clubId || home === clubName || away === clubId || away === clubName;
  };

  const isHomeForClub = (match: Match, club: typeof userClub) => {
    if (!club) return false;
    const home = normalizeTeamRef(match.homeTeam);
    return home === normalizeTeamRef(club.id) || home === normalizeTeamRef(club.name);
  };

  const getTeamDisplayName = (teamRef: string) => {
    const normalized = normalizeTeamRef(teamRef);
    const club = clubs.find(
      (c) => normalizeTeamRef(c.id) === normalized || normalizeTeamRef(c.name) === normalized
    );
    return club?.name || teamRef;
  };

  const getMatchRoundLabel = (match: Match) => {
    const tournament = tournaments.find((t) => t.id === match.tournamentId);
    if (isCupTournament(tournament?.type, tournament?.name)) {
      return getCupStageLabel(match.round);
    }
    return `Jornada ${match.round}`;
  };
  
  // Check if user is DT and has a club assigned (via clubId)
  const userClub = hasRole('dt') && user?.clubId
    ? clubs.find(c => c.id === user.clubId)
    : null;

  const currentStandings = useMemo(() => {
    return standings.length > 0 ? standings : createFallbackStandings(clubs);
  }, [standings, clubs]);

  const zonesData = useMemo(() => getZonesData(clubs, currentStandings), [clubs, currentStandings]);

  const userZoneKey = useMemo(() => {
    if (!userClub) return '';

    const normalize = (value: string) => String(value || '').trim().toLowerCase();

    return Object.keys(zonesData).find((zoneKey) =>
      (zonesData[zoneKey] || []).some((team) =>
        normalize(team.id) === normalize(userClub.id) ||
        normalize(team.nombre) === normalize(userClub.name)
      )
    ) || '';
  }, [userClub, zonesData]);

  const userZoneStandings = useMemo(() => {
    if (!userZoneKey) return [];
    return calculateZoneStandings(zonesData[userZoneKey] || []);
  }, [zonesData, userZoneKey]);
  
  // Get user's team position in standings
  const userTeamStanding = userClub
    ? currentStandings.find(s => s.clubId === userClub.id)
    : null;

  // Get captain (first player with captain property or highest rated player)
  const captain = userClub 
    ? players.filter(p => p.clubId === userClub.id).sort((a, b) => b.overall - a.overall)[0]
    : null;
  
  const liveClubMatches = userClub
    ? allMatches
        .filter((m) => isLiveMatch(m) && hasDefinedTeams(m) && isUserClubMatch(m, userClub))
        .sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b))
    : [];

  const scheduledClubMatches = userClub
    ? allMatches
        .filter((m) => isScheduledInFuture(m) && hasDefinedTeams(m) && isUserClubMatch(m, userClub))
        .sort((a, b) => getMatchTimestamp(a) - getMatchTimestamp(b))
    : [];

  // Prioridad: partido en vivo; si no, próximo programado.
  const nextMatch = liveClubMatches[0] || scheduledClubMatches[0] || null;

  // Mock formation
  const currentFormation = "4-3-3 Ofensivo";

  // Get squad size
  const squadSize = userClub ? players.filter(p => p.clubId === userClub.id).length : 0;

  const shouldWaitForDTData = isDT && !!user?.clubId && !isDataLoaded;

  if (shouldWaitForDTData) {
    return (
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-4 px-1">
            <p className="text-sm text-gray-300">Cargando dashboard del DT...</p>
            <p className="text-xs text-gray-500 mt-1">Preparando club, fixtures y resumen de rendimiento.</p>
          </div>
          <DTDashboardSkeleton />
        </div>
      </div>
    );
  }

  // If user is DT, show personalized dashboard
  if (isDT && userClub) {
    // Calculate additional stats
    const teamPlayers = players.filter(p => p.clubId === userClub.id);
    const avgRating = teamPlayers.length > 0
      ? Math.round(teamPlayers.reduce((sum, p) => sum + p.overall, 0) / teamPlayers.length)
      : 0;

    const wins = userTeamStanding?.won || 0;
    const draws = userTeamStanding?.drawn || 0;
    const losses = userTeamStanding?.lost || 0;
    const totalMatches = wins + draws + losses;
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    const points = userTeamStanding?.points || 0;
    const goalDifference = (userTeamStanding?.goalsFor || 0) - (userTeamStanding?.goalsAgainst || 0);

    // "Fixture cercano" solo muestra cruces próximos (no en vivo).
    const upcomingMatches = scheduledClubMatches.slice(0, 4);

    const tablePreview = userZoneStandings.slice(0, 5);
    const topPlayers = teamPlayers
      .slice()
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 5);
    const pendingIncomingOffers = offers.filter(
      (offer) => offer.status === 'pending' && offer.fromClub === userClub.name
    ).length;
    const pendingOutgoingOffers = offers.filter(
      (offer) => offer.status === 'pending' && offer.toClub === userClub.name
    ).length;
    const totalActiveOffers = pendingIncomingOffers + pendingOutgoingOffers;

    return (
      <div className="min-h-screen bg-dark">
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gray-800/30 border border-gray-700/50 p-3 flex items-center justify-center">
                    <img
                      src={userClub.logo}
                      alt={userClub.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide">
                      <span className="px-3 py-1 bg-gray-800/30 border border-gray-700/50 rounded-full text-gray-300">Temporada 2025</span>
                      <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/30 rounded-full">Liga Master</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{userClub.name}</h1>
                    <p className="text-gray-300 flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      DT: <span className="font-semibold text-white">{user.username}</span>
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span className="px-3 py-1 rounded-full bg-gray-800/30 border border-gray-700/50">Formacion: {currentFormation}</span>
                      <span className="px-3 py-1 rounded-full bg-gray-800/30 border border-gray-700/50">{wins}V {draws}E {losses}D</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Posicion</p>
                    <p className="text-xl font-semibold text-white">
                      #{userTeamStanding ? userTeamStanding.position || currentStandings.findIndex(s => s.clubId === userClub.id) + 1 : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Puntos</p>
                    <p className="text-xl font-semibold text-white">{points}</p>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Media</p>
                    <p className="text-xl font-semibold text-white">{avgRating}</p>
                  </div>
                  <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Presupuesto</p>
                    <p className="text-sm font-semibold text-white truncate">{formatCurrency(userClub.budget)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.12),transparent_42%),radial-gradient(circle_at_15%_100%,rgba(148,163,184,0.08),transparent_48%)]" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3 text-gray-200">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <BarChart4 size={17} className="text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Mercado de fichajes</p>
                  <p className="text-xs text-gray-400">Movimientos y oportunidades del dia</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full border ${marketStatus ? 'bg-green-500/10 border-green-500/40 text-green-300' : 'bg-red-500/10 border-red-500/40 text-red-300'}`}>
                {marketStatus ? 'Abierto' : 'Cerrado'}
              </span>
            </div>

            <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-gray-700/60 bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400">Ofertas activas</p>
                <p className="text-white font-semibold text-sm">{totalActiveOffers}</p>
              </div>
              <div className="rounded-lg border border-gray-700/60 bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400">Por responder</p>
                <p className="text-white font-semibold text-sm">{pendingIncomingOffers}</p>
              </div>
              <div className="rounded-lg border border-gray-700/60 bg-gray-900/40 px-3 py-2">
                <p className="text-gray-400">Enviadas</p>
                <p className="text-white font-semibold text-sm">{pendingOutgoingOffers}</p>
              </div>
            </div>

            <p className="relative text-sm text-gray-300">
              {marketStatus
                ? 'Explora precios oficiales y responde ofertas antes de la proxima jornada.'
                : 'El mercado esta cerrado temporalmente. Puedes revisar tablas y preparar objetivos.'}
            </p>

            <div className="relative flex flex-wrap gap-2">
              <Link
                to="/liga-master/mercado"
                className={`inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${marketStatus ? 'bg-primary hover:bg-primary-light' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                Ir al mercado
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/liga-master/tablas-mercado"
                className="inline-flex items-center gap-2 text-gray-200 text-sm font-semibold border border-gray-700/60 bg-gray-900/40 px-4 py-2 rounded-lg hover:border-primary/40 hover:text-white transition-colors"
              >
                Tablas oficiales
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm hover:bg-gray-800 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <TrendingUp size={18} className="text-green-400" />
                  <span className="text-sm font-semibold">Tasa de victoria (Liga Master)</span>
                </div>
                <span className="text-lg font-bold text-white">{winRate}%</span>
              </div>
              <p className="text-sm text-gray-400">{wins}V - {draws}E - {losses}D en liga</p>
              <div className="w-full h-2 bg-gray-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${winRate}%` }}></div>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm hover:bg-gray-800 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Activity size={18} className={goalDifference >= 0 ? 'text-blue-400' : 'text-red-400'} />
                  <span className="text-sm font-semibold">Diferencia de goles (Liga Master)</span>
                </div>
                <span className={`text-lg font-bold ${goalDifference >= 0 ? 'text-white' : 'text-red-300'}`}>
                  {goalDifference >= 0 ? '+' : ''}{goalDifference}
                </span>
              </div>
              <p className="text-sm text-gray-400">{userTeamStanding?.goalsFor || 0} GF / {userTeamStanding?.goalsAgainst || 0} GC en liga</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="px-2 py-1 rounded bg-gray-800/30 border border-gray-700/50">{wins} victorias</span>
                <span className="px-2 py-1 rounded bg-gray-800/30 border border-gray-700/50">{draws} empates</span>
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm hover:bg-gray-800 transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Sparkles size={18} className="text-yellow-400" />
                  <span className="text-sm font-semibold">Calidad del equipo</span>
                </div>
                <span className="text-lg font-bold text-white">{avgRating}</span>
              </div>
              <p className="text-sm text-gray-400">{squadSize} jugadores</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 rounded bg-gray-800/30 border border-gray-700/50">Capitan: {captain?.name || 'N/D'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300">
                  <Briefcase size={18} className="text-primary" />
                  <span className="text-sm font-semibold">Finanzas del club</span>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-gray-800/30 border border-gray-700/50 text-gray-300">Control</span>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Presupuesto</span>
                  <span className="font-semibold text-white">{formatCurrency(userClub.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plantilla</span>
                  <span className="font-semibold text-white">{squadSize} jugadores</span>
                </div>
              </div>
              <Link
                to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/finanzas?from=dt-dashboard`}
                className="inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
              >
                Ir a Mis Finanzas
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 md:p-6 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 uppercase tracking-wide">
                  {nextMatch?.status === 'live' ? 'Partido en vivo' : 'Proximo partido'}
                </span>
                {nextMatch && (
                  <div className="flex items-center gap-2">
                    {nextMatch.status === 'live' && (
                      <span className="text-xs px-3 py-1 border border-red-500/40 rounded-full text-red-300 bg-red-500/15 animate-pulse">En vivo</span>
                    )}
                    <span className="text-xs px-3 py-1 border border-gray-700/50 rounded-full text-gray-300">{getMatchRoundLabel(nextMatch)}</span>
                  </div>
                )}
              </div>
              {nextMatch ? (
                <>
                  <h3 className="text-2xl font-bold text-white">
                    vs {isHomeForClub(nextMatch, userClub) ? getTeamDisplayName(nextMatch.awayTeam) : getTeamDisplayName(nextMatch.homeTeam)}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} className="text-primary" />
                      {formatDate(nextMatch.date)}
                    </span>
                    <span className="flex items-center gap-2">
                      {isHomeForClub(nextMatch, userClub) ? <Home size={16} className="text-primary" /> : <MapPin size={16} className="text-blue-400" />}
                      {isHomeForClub(nextMatch, userClub) ? 'Local' : 'Visitante'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 px-4 py-3">
                  <p className="text-sm font-semibold text-white">No hay proximo partido confirmado.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Todavia no hay partidos proximos para tu club.
                  </p>
                </div>
              )}
              <Link
                to="/liga-master/fixture"
                className="inline-flex items-center gap-2 text-primary font-semibold border border-primary/30 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                <Play size={16} />
                Ver fixture completo
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 lg:col-span-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Fixture cercano</p>
                <Link to="/liga-master/fixture" className="text-xs text-primary hover:underline">Ver todo</Link>
              </div>
              <div className="space-y-3">
                {upcomingMatches.length === 0 && (
                  <div className="rounded-lg border border-gray-700/50 bg-gray-800/30 px-4 py-3">
                    <p className="text-sm font-semibold text-white">No hay partidos programados proximamente.</p>
                    <p className="text-xs text-gray-400 mt-1">Solo se muestran cruces del equipo del DT.</p>
                  </div>
                )}
                {upcomingMatches.map(match => (
                  <div key={`${match.homeTeam}-${match.awayTeam}-${match.date}`} className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400">{getMatchRoundLabel(match)}</span>
                      <p className="text-sm font-semibold text-white">{getTeamDisplayName(match.homeTeam)} vs {getTeamDisplayName(match.awayTeam)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-primary" />
                        {formatDate(match.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{userZoneKey ? `Tabla ${getZoneName(userZoneKey)}` : 'Tabla Liga Master'}</p>
                <Link to={userZoneKey ? `/liga-master/zonas?zona=${userZoneKey}` : '/liga-master/zonas'} className="text-xs text-primary hover:underline">Ver tabla</Link>
              </div>
              <div className="space-y-2">
                {tablePreview.length === 0 && (
                  <p className="text-sm text-gray-400">No se encontro la tabla de tu liga.</p>
                )}
                {tablePreview.map((row, idx) => (
                  <div key={`${row.id}-${row.nombre}-${idx}`} className="flex items-center justify-between bg-gray-800/30 border border-gray-700/50 rounded-lg px-3 py-2 text-sm text-gray-200 hover:border-primary/40 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 w-6">{row.position || idx + 1}</span>
                      <span>{row.nombre}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{row.pj || 0} PJ</span>
                      <span>{row.pts || 0} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 space-y-3 lg:col-span-2 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Plantilla destacada</p>
                <Link to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/plantilla`} className="text-xs text-primary hover:underline">Ver plantilla</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {topPlayers.map(player => (
                  <div
                    key={`${player.id}-${player.name}`}
                    className="flex items-center justify-between bg-gray-800/30 border border-gray-700/50 rounded-lg px-3 py-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={player.image || '/default.png'}
                        alt={player.name}
                        className="w-10 h-10 rounded-full object-cover border border-gray-700/50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/default.png';
                        }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-white">{player.name}</p>
                        <p className="text-xs text-gray-400">
                          {player.position || 'Jugador'} - {player.overall} OVR
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{player.overall}</span>
                  </div>
                ))}
                {topPlayers.length === 0 && (
                  <p className="text-sm text-gray-400">No hay jugadores cargados.</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/plantilla`}
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                    <Users size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Plantilla</p>
                    <p className="text-xs text-gray-400">Gestion y tacticas</p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">{squadSize} jugadores</span>
              </div>
              {captain && (
                <div className="flex items-center gap-3 bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 group-hover:border-primary/40 transition-colors">
                  <img
                    src={captain.image || '/default.png'}
                    alt={captain.name}
                    className="w-10 h-10 rounded-full object-cover border border-gray-700/50"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default.png';
                    }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">Capitan</p>
                    <p className="text-xs text-gray-400">
                      {captain.name} - {captain.overall} OVR
                    </p>
                  </div>
                </div>
              )}
            </Link>

            <Link
              to="/liga-master/tablas-mercado"
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center">
                    <BarChart4 size={18} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Tablas de mercado</p>
                    <p className="text-xs text-gray-400">Valores oficiales</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">Referencias actualizadas para compras y ventas.</p>
            </Link>

            <Link
              to="/liga-master/comunidad-dt"
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-400/40 flex items-center justify-center">
                    <Users size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Comunidad DT</p>
                    <p className="text-xs text-gray-400">Anuncios y soporte</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">Canales de coordinacion y avisos para DTs.</p>
            </Link>

            <Link
              to={`/liga-master/club/${userClub.name.toLowerCase().replace(/\s+/g, '-')}/palmares`}
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-400/40 flex items-center justify-center">
                    <Trophy size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Palmares</p>
                    <p className="text-xs text-gray-400">Historia del club</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">
                {userClub.titles && userClub.titles.length > 0
                  ? `${userClub.titles.length} ${userClub.titles.length === 1 ? 'titulo' : 'titulos'} del club`
                  : 'Sin titulos registrados'}
              </p>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/liga-master/zonas"
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center">
                    <Shield size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Zonas</p>
                    <p className="text-xs text-gray-400">4 ligas de competencia</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">Consulta las 4 ligas de competencia de la Liga Master.</p>
            </Link>

            <Link
              to="/liga-master/copa-lvz"
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-400/40 flex items-center justify-center">
                    <Trophy size={18} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Copa LVZ</p>
                    <p className="text-xs text-gray-400">Fases y cruces</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">Consulta el avance de copa y los proximos cruces de tu club.</p>
            </Link>

            <Link
              to="/liga-master/prode"
              className="group bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:bg-gray-800 hover:border-primary/40 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-400/40 flex items-center justify-center">
                    <Award size={18} className="text-amber-300" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">PRODE</p>
                    <p className="text-xs text-gray-400">Apuestas por jornada</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-500 group-hover:text-primary" />
              </div>
              <p className="text-sm text-gray-400">Apuesta parte de tu presupuesto y suma premios por aciertos.</p>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isLoggedIn = Boolean(user);
  const validClubs = clubs.filter((club) => {
    const normalizedId = normalizeTeamRef(club.id);
    const normalizedName = normalizeTeamRef(club.name);
    return normalizedId !== 'libre' && normalizedId !== 'free' && normalizedName !== 'libre' && normalizedName !== 'free';
  });
  const validClubsCount = validClubs.length;
  const averageBudget = validClubsCount > 0
    ? formatCurrency(validClubs.reduce((sum, club) => sum + club.budget, 0) / validClubsCount)
    : formatCurrency(0);



  // Default view for non-DT users
  return (
    <div>
      <PageHeader 
        title="Liga Master 2025" 
        subtitle="La competiciÃ³n principal de La Virtual Zone. Liga regular con enfrentamientos ida y vuelta entre los 10 equipos participantes."
        image="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      <div className="container mx-auto px-4 py-8">

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total de Clubes" 
            value={validClubsCount}
            icon={<Users size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Estado del Mercado" 
            value={marketStatus ? "Abierto" : "Cerrado"}
            icon={<TrendingUp size={24} className={marketStatus ? "text-green-400" : "text-red-400"} />}
          />
          <StatsCard 
            title="Presupuesto Medio" 
            value={averageBudget}
            icon={<Briefcase size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Partidos Disputados" 
            value={ligaMasterMatches.filter(m => m.status === "finished").length}
            icon={<Calendar size={24} className="text-primary" />}
            trend="up"
            trendValue="+3 Ãºltima semana"
          />
        </div>

        {!isLoggedIn && (
          <div className="space-y-6 mb-8">
            <section className="rounded-2xl border border-gray-700/50 bg-gray-800/50 p-6 md:p-8">
              <div className="max-w-3xl">
                <p className="text-xs uppercase tracking-wide text-primary mb-2">Liga oficial</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Compite como Director Tecnico</h2>
                <p className="text-sm md:text-base text-gray-300 mb-5">
                  Gestiona tu club, arma tu plantilla y compite en una liga con calendario semanal,
                  mercado de fichajes y tabla en vivo.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/registro"
                    className="bg-primary hover:bg-primary-light text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Crear cuenta DT
                  </Link>
                  <Link
                    to="/liga-master/reglamento"
                    className="border border-gray-600 text-gray-200 hover:bg-gray-700/40 px-5 py-2.5 rounded-lg font-semibold transition-colors"
                  >
                    Ver como funciona
                  </Link>
                  <Link
                    to="/login"
                    className="text-primary hover:text-primary-light px-2 py-2.5 font-semibold"
                  >
                    Iniciar sesion
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <article className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <Users size={20} className="text-primary mb-2" />
                <h3 className="font-bold text-white mb-1">Gestion de club</h3>
                <p className="text-sm text-gray-400">Plantilla, formacion y decisiones tacticas para cada jornada.</p>
              </article>
              <article className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <TrendingUp size={20} className="text-green-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Mercado activo</h3>
                <p className="text-sm text-gray-400">Compra y vende jugadores para mejorar el nivel de tu equipo.</p>
              </article>
              <article className="bg-gray-800/50 rounded-xl p-5 border border-gray-700">
                <BarChart4 size={20} className="text-blue-400 mb-2" />
                <h3 className="font-bold text-white mb-1">Tabla y stats</h3>
                <p className="text-sm text-gray-400">Seguimiento de resultados, rendimiento y posicion en tiempo real.</p>
              </article>
            </section>
          </div>
        )}

        {/* Quick access - solo para usuarios logeados */}
        {isLoggedIn && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              to="/liga-master/mercado"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <TrendingUp size={24} className="text-green-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Mercado de Fichajes</h3>
              <p className="text-gray-400 text-sm mb-4">
                Compra y vende jugadores para mejorar tu equipo.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ir al mercado</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/liga-master/fixture"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Calendar size={24} className="text-blue-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Fixture y Resultados</h3>
              <p className="text-gray-400 text-sm mb-4">
                Consulta el calendario de partidos y resultados.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ver fixture</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>

            <Link
              to="/liga-master/rankings"
              className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 hover:bg-gray-800 transition-colors"
            >
              <Trophy size={24} className="text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Rankings</h3>
              <p className="text-gray-400 text-sm mb-4">
                Clasificaciones y estadÃ­sticas de clubes y jugadores.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                <span>Ver rankings</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </Link>
          </div>
        )}
        
      </div>
    </div>
  );
}; 

export default LigaMaster;
 






