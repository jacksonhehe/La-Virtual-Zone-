import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { Trophy, Calendar, Users, ChevronLeft, FileText, Image, ArrowRight, CheckCircle, AlertCircle, Loader, Star } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/format';
import { getMatchesByTournament } from '../../utils/matchService';
import { generateStandingsFromMatches } from '../../utils/standingsHelpers';
import { fetchUsers, listUsers } from '../../utils/authService';
import type { Match } from '../../types';
import { getCupStageLabel, isCupTournament } from '../../utils/matchStages';
import { hasPenaltyResult } from '../../utils/matchScore';
import MatchScore from '../../components/common/MatchScore';

const TournamentDetail = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const { tournaments, clubs } = useDataStore();
  const { isAuthenticated, user, hasRole } = useAuthStore();

  // Estado para manejar solicitudes de participación
  const [requestStatus, setRequestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [requestMessage, setRequestMessage] = useState<string>('');
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [dtUsersByClub, setDtUsersByClub] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadTournamentMatches = async () => {
      if (!tournamentId) {
        setTournamentMatches([]);
        return;
      }

      setMatchesLoading(true);
      try {
        const matches = await getMatchesByTournament(tournamentId);
        const ordered = matches
          .slice()
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setTournamentMatches(ordered);
      } catch (error) {
        console.error('Error loading tournament matches:', error);
        setTournamentMatches([]);
      } finally {
        setMatchesLoading(false);
      }
    };

    void loadTournamentMatches();
  }, [tournamentId]);
  
  // Find tournament by id
  const tournament = tournaments.find(t => t.id === tournamentId);
  const tournamentClubs = tournament ? clubs.filter(c => tournament.teams.includes(c.name)) : [];
  const tournamentIsCup = isCupTournament(tournament?.type, tournament?.name);

  // Función para solicitar participación
  const handleRequestParticipation = async () => {
    if (!isAuthenticated) {
      setRequestStatus('error');
      setRequestMessage('Debes iniciar sesión para solicitar participación.');
      return;
    }

    // Permitir tanto DT como usuarios normales, pero con diferente lógica
    const isDT = hasRole('dt');

    if (isDT && !user?.clubId) {
      setRequestStatus('error');
      setRequestMessage('Como Director Técnico, debes tener un club asignado para participar en torneos.');
      return;
    }

    // Para usuarios normales, verificar si ya tienen una solicitud pendiente
    if (!isDT) {
      // Aquí se podría verificar si el usuario ya tiene una solicitud pendiente
      // Por ahora, solo permitir una solicitud por usuario
    }

    // Verificar si el torneo está abierto a inscripciones
    if (!tournament || tournament.status !== 'upcoming') {
      setRequestStatus('error');
      setRequestMessage('Las inscripciones para este torneo ya están cerradas.');
      return;
    }

    try {
      setRequestStatus('loading');
      setRequestMessage('Enviando solicitud...');

      // Simular envío de solicitud (aquí iría la lógica real con API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (isDT) {
        setRequestStatus('success');
        setRequestMessage('¡Solicitud enviada exitosamente! Tu club será registrado una vez aprobada la solicitud.');
      } else {
        setRequestStatus('success');
        setRequestMessage('¡Solicitud enviada exitosamente! Serás notificado cuando se forme un equipo.');
      }

    } catch (error) {
      setRequestStatus('error');
      setRequestMessage('Error al enviar la solicitud. Inténtalo de nuevo.');
    }
  };

  const visibleTournamentMatches = useMemo(() => {
    const now = Date.now();
    return tournamentMatches
      .filter((match) => {
        if (match.status === 'live') return true;
        if (match.status !== 'scheduled' && match.status !== 'upcoming') return false;
        const timestamp = new Date(match.date).getTime();
        return Number.isFinite(timestamp) && timestamp >= now;
      })
      .sort((a, b) => {
        const aLive = a.status === 'live' ? 1 : 0;
        const bLive = b.status === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 3);
  }, [tournamentMatches]);
  
  const topScorers = useMemo(() => {
    const scorerMap = new Map<string, { id: string; name: string; club: string; goals: number }>();
    const normalize = (value: string) => String(value || '').trim().toLowerCase();

    tournamentMatches.forEach((match) => {
      (match.scorers || []).forEach((scorer) => {
        if (!scorer.playerName || scorer.ownGoal) return;

        const key = scorer.playerId || `${normalize(scorer.playerName)}-${normalize(scorer.clubId)}`;
        const club =
          clubs.find((c) => normalize(c.id) === normalize(scorer.clubId) || normalize(c.name) === normalize(scorer.clubId))?.name ||
          scorer.clubId;

        const existing = scorerMap.get(key);
        if (existing) {
          existing.goals += 1;
          return;
        }

        scorerMap.set(key, {
          id: key,
          name: scorer.playerName,
          club,
          goals: 1
        });
      });
    });

    return Array.from(scorerMap.values()).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return a.name.localeCompare(b.name);
    });
  }, [tournamentMatches, clubs]);

  const tournamentStandings = useMemo(() => {
    if (!tournament) return [];
    return generateStandingsFromMatches(tournament.id, tournamentMatches, clubs, tournaments);
  }, [tournament, tournamentMatches, clubs, tournaments]);

  useEffect(() => {
    let cancelled = false;
    const normalizeKey = (value?: string) => String(value || '').trim().toLowerCase();

    const loadDtByClub = async () => {
      const preferred = new Map<string, string>();
      const adminFallback = new Map<string, string>();

      const setCandidate = (keys: string[], username: string, isAdmin: boolean) => {
        keys.forEach((rawKey) => {
          const key = normalizeKey(rawKey);
          if (!key) return;

          if (!isAdmin && !preferred.has(key)) {
            preferred.set(key, username);
            return;
          }

          if (isAdmin && !adminFallback.has(key)) {
            adminFallback.set(key, username);
          }
        });
      };

      try {
        const users = await fetchUsers();
        users.forEach((u) => {
          const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role];
          const isDT = roles.includes('dt');
          if (!isDT) return;

          const isAdmin = roles.includes('admin') || u.role === 'admin';
          const keys: string[] = [];
          if (u.clubId) keys.push(u.clubId);
          if (u.club) keys.push(u.club);

          const clubFromId = clubs.find((c) => normalizeKey(c.id) === normalizeKey(u.clubId));
          if (clubFromId?.name) keys.push(clubFromId.name);

          setCandidate(keys, u.username, isAdmin);
        });
      } catch (error) {
        console.warn('TournamentDetail: no se pudo cargar usuarios desde Supabase, usando fallback local:', error);
        try {
          const users = listUsers();
          users.forEach((u) => {
            const roles = Array.isArray(u.roles) && u.roles.length > 0 ? u.roles : [u.role];
            const isDT = roles.includes('dt');
            if (!isDT) return;

            const isAdmin = roles.includes('admin') || u.role === 'admin';
            const keys: string[] = [];
            if (u.clubId) keys.push(u.clubId);
            if (u.club) keys.push(u.club);

            const clubFromId = clubs.find((c) => normalizeKey(c.id) === normalizeKey(u.clubId));
            if (clubFromId?.name) keys.push(clubFromId.name);

            setCandidate(keys, u.username, isAdmin);
          });
        } catch (fallbackError) {
          console.warn('TournamentDetail: tampoco se pudieron cargar usuarios legacy:', fallbackError);
        }
      }

      const currentRoles = Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles : user?.role ? [user.role] : [];
      const currentIsDT = currentRoles.includes('dt');
      if (currentIsDT && user?.username) {
        const currentKeys: string[] = [];
        if (user.clubId) currentKeys.push(user.clubId);
        if (user.club) currentKeys.push(user.club);
        const clubFromId = clubs.find((c) => normalizeKey(c.id) === normalizeKey(user.clubId));
        if (clubFromId?.name) currentKeys.push(clubFromId.name);

        currentKeys.forEach((rawKey) => {
          const key = normalizeKey(rawKey);
          if (!key) return;
          preferred.set(key, user.username);
          adminFallback.delete(key);
        });
      }

      adminFallback.forEach((username, key) => {
        if (!preferred.has(key)) {
          preferred.set(key, username);
        }
      });

      if (!cancelled) {
        setDtUsersByClub(preferred);
      }
    };

    void loadDtByClub();
    return () => {
      cancelled = true;
    };
  }, [clubs, user]);

  const getManagerDisplayName = (club: { id: string; name: string; manager: string }) => {
    const normalizeKey = (value?: string) => String(value || '').trim().toLowerCase();
    const resolvedDT = dtUsersByClub.get(normalizeKey(club.id)) || dtUsersByClub.get(normalizeKey(club.name));
    if (resolvedDT) return resolvedDT;

    const rawManager = String(club.manager || '').trim();
    const normalized = rawManager.toLowerCase();
    const invalidManager =
      !rawManager ||
      normalized === '-' ||
      normalized === 'n/a' ||
      normalized === 'sin dt' ||
      normalized === 'sin dt asignado';

    return invalidManager ? 'Sin DT asignado' : rawManager;
  };

  const cupBracketRounds = useMemo(() => {
    if (!tournamentIsCup) return [];

    const grouped = new Map<number, Match[]>();
    tournamentMatches.forEach((match) => {
      const round = Math.max(1, match.round || 1);
      const bucket = grouped.get(round) || [];
      bucket.push(match);
      grouped.set(round, bucket);
    });

    return Array.from(grouped.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([round, matches]) => ({
        round,
        label: getCupStageLabel(round),
        matches: matches.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }));
  }, [tournamentIsCup, tournamentMatches]);

  const getCupPlaceholderTeam = (round: number, matchIndex: number, side: 'home' | 'away') => {
    const previousRoundByRound: Record<number, number | null> = {
      1: null,
      2: 1,
      3: 2,
      4: 3,
      5: 4,
      6: 5,
      7: 5,
    };

    const previousRound = previousRoundByRound[round] ?? null;
    if (previousRound == null) return 'Por definir';

    const sourceKind = round === 6 ? 'Perdedor' : 'Ganador';
    const sourceLabel = getCupStageLabel(previousRound);
    const sourceNumber = matchIndex * 2 + (side === 'home' ? 1 : 2);
    return `${sourceKind} ${sourceLabel} #${sourceNumber}`;
  };

  const isCupReferenceTeam = (value?: string | null) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (!normalized) return true;

    if (normalized === 'por definir' || normalized === 'to be defined') return true;

    return /^(ganador|perdedor|winner|loser)\b/.test(normalized);
  };

  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Torneo no encontrado</h2>
        <p className="text-gray-400 mb-8">El torneo que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/torneos" className="btn-primary">
          Volver a Torneos
        </Link>
      </div>
    );
  }
  
  return (
    <div>
      <PageHeader 
        title={tournament.name} 
        subtitle={`${tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'} - ${tournament.status === 'active' ? 'En curso' : tournament.status === 'upcoming' ? 'Próximamente' : 'Finalizado'}`}
        image={tournament.logo}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to="/torneos"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Torneos</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-dark-light border border-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="flex flex-wrap border-b border-gray-800">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  General
                </button>
                <button
                  onClick={() => setActiveTab('participants')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'participants' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Participantes
                </button>
                <button
                  onClick={() => setActiveTab('fixture')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'fixture' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Fixture
                </button>
                <button
                  onClick={() => setActiveTab('scorers')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'scorers' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Goleadores
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'gallery' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Galería
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <div className="bg-dark p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Formato</p>
                          <p className="font-medium">{tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Fechas</p>
                          <p className="font-medium">
                            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Participantes</p>
                          <p className="font-medium">{tournament.teams.length} equipos</p>
                        </div>
                      </div>
                    </div>

                    
                    <h3 className="text-xl font-bold mb-4">Sobre el torneo</h3>
                    <p className="text-gray-300 mb-6">
                      {tournament.name} es {tournament.type === 'league' ? 'una liga' : tournament.type === 'cup' ? 'un torneo de copa' : 'un playoff'} organizado por La Virtual Zone para la temporada 2025.
                      {tournament.status === 'active' && ' Actualmente se encuentra en fase de grupos con partidos disputándose cada semana.'}
                      {tournament.status === 'upcoming' && ' Las inscripciones están abiertas y se cerrarán próximamente. ¡Regístrate para participar!'}
                      {tournament.status === 'finished' && ` El torneo ha finalizado y el campeón fue ${tournament.winner}.`}
                    </p>
                    
                    <h3 className="text-xl font-bold mb-4">Reglas básicas</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Formato de competición</p>
                          <p className="text-sm text-gray-400">
                            {tournament.type === 'league' 
                              ? 'Liga todos contra todos a doble vuelta.' 
                              : tournament.type === 'cup' 
                                ? 'Sistema de eliminación directa a partido único.' 
                                : 'Fase de grupos seguida de eliminatorias.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Participación</p>
                          <p className="text-sm text-gray-400">
                            Abierto a todos los clubes registrados en La Virtual Zone.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Duración</p>
                          <p className="text-sm text-gray-400">
                            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {tournament.status === 'upcoming' && (
                      <div className="bg-primary/10 border border-primary rounded-lg p-6 mt-8">
                        <h3 className="text-xl font-bold mb-2">Inscripciones abiertas</h3>
                        <p className="text-gray-300 mb-4">
                          ¡Las inscripciones para este torneo están abiertas! {isAuthenticated
                            ? 'Regístrate antes del ' + formatDate(tournament.startDate) + ' para participar.'
                            : 'Inicia sesión para poder participar.'
                          }
                        </p>

                        {/* Feedback de solicitud */}
                        {requestMessage && (
                          <div className={`p-4 rounded-lg mb-4 flex items-center gap-3 ${
                            requestStatus === 'success'
                              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                              : requestStatus === 'error'
                              ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                              : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                          }`}>
                            {requestStatus === 'success' && <CheckCircle size={20} />}
                            {requestStatus === 'error' && <AlertCircle size={20} />}
                            {requestStatus === 'loading' && <Loader size={20} className="animate-spin" />}
                            <span className="text-sm">{requestMessage}</span>
                          </div>
                        )}

                        <button
                          onClick={handleRequestParticipation}
                          disabled={requestStatus === 'loading' || requestStatus === 'success'}
                          className={`btn-primary ${
                            requestStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {requestStatus === 'loading' ? (
                            <>
                              <Loader size={16} className="mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : requestStatus === 'success' ? (
                            <>
                              <CheckCircle size={16} className="mr-2" />
                              Solicitud enviada
                            </>
                          ) : (
                            'Solicitar participación'
                          )}
                        </button>
                      </div>
                    )}
                    
                    {tournament.status === 'finished' && tournament.winner && (
                      <div className="bg-dark-lighter rounded-lg p-6 mt-8">
                        <h3 className="text-xl font-bold mb-4 text-center">Campeón del torneo</h3>
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                            <img
                              src={`https://ui-avatars.com/api/?name=${tournament.winner.split(' ').map(word => word[0]).join('')}&background=c026d3&color=fff&size=128&bold=true`}
                              alt={tournament.winner}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold">{tournament.winner}</h4>
                            <p className="text-gray-400">Campeón {tournament.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'participants' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Participantes ({tournament.teams.length})</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tournamentClubs.map(club => (
                        <Link
                          key={club.id}
                          to={`/liga-master/club/${club.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className="bg-dark-lighter rounded-lg p-4 flex items-center hover:bg-dark transition-colors"
                        >
                          <div className="w-12 h-12 rounded overflow-hidden mr-3">
                            <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-medium">{club.name}</p>
                            <p className="text-xs text-gray-400">DT: {getManagerDisplayName(club)}</p>
                          </div>
                        </Link>
                      ))}

                      {tournament.status === 'upcoming' && tournament.teams.length < 8 && (
                        <div className="bg-dark rounded-lg p-4 flex items-center justify-center border border-dashed border-gray-700">
                          <div className="text-center">
                            <p className="font-medium mb-2">
                              {isAuthenticated ? 'Inscripciones abiertas' : 'Inicia sesión para participar'}
                            </p>

                            {/* Feedback de solicitud para la pestaña participantes */}
                            {requestMessage && (
                              <div className={`p-3 rounded-lg mb-3 flex items-center gap-2 ${
                                requestStatus === 'success'
                                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                  : requestStatus === 'error'
                                  ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                  : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                              }`}>
                                {requestStatus === 'success' && <CheckCircle size={16} />}
                                {requestStatus === 'error' && <AlertCircle size={16} />}
                                {requestStatus === 'loading' && <Loader size={16} className="animate-spin" />}
                                <span className="text-xs">{requestMessage}</span>
                              </div>
                            )}

                            <button
                              onClick={handleRequestParticipation}
                              disabled={requestStatus === 'loading' || requestStatus === 'success'}
                              className={`text-primary hover:text-primary-light text-sm font-medium transition-colors ${
                                requestStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                            >
                              {requestStatus === 'loading' ? (
                                <>
                                  <Loader size={14} className="mr-1 animate-spin inline" />
                                  Enviando...
                                </>
                              ) : requestStatus === 'success' ? (
                                <>
                                  <CheckCircle size={14} className="mr-1 inline" />
                                  Solicitud enviada
                                </>
                              ) : (
                                'Solicitar participación'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'fixture' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Fixture del torneo</h3>
                    
                    {tournament.type === 'cup' ? (
                      <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-4">Cuadro Final</h4>
                        {matchesLoading ? (
                          <p className="text-center text-gray-400 py-8">Cargando cuadro...</p>
                        ) : cupBracketRounds.length === 0 ? (
                          <div className="h-60 flex items-center justify-center">
                            <p className="text-gray-400">
                              {tournament.status === 'upcoming'
                                ? 'El cuadro se definirá al cerrarse las inscripciones'
                                : 'Aún no hay cruces cargados para este torneo.'}
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <div className="min-w-max grid grid-flow-col auto-cols-[260px] gap-4 pb-2">
                              {cupBracketRounds.map((stage) => (
                                <div key={stage.round} className="space-y-3">
                                  <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                                    <p className="text-sm font-semibold text-primary-light">{stage.label}</p>
                                    <p className="text-[11px] text-gray-400">{stage.matches.length} partidos</p>
                                  </div>

                                  {stage.matches.map((match, matchIndex) => {
                                    const homeTeamRaw = match.homeTeam?.trim() || '';
                                    const awayTeamRaw = match.awayTeam?.trim() || '';
                                    const homeTeamLabel = homeTeamRaw || getCupPlaceholderTeam(stage.round, matchIndex, 'home');
                                    const awayTeamLabel = awayTeamRaw || getCupPlaceholderTeam(stage.round, matchIndex, 'away');
                                    const homeIsPlaceholder = isCupReferenceTeam(homeTeamLabel);
                                    const awayIsPlaceholder = isCupReferenceTeam(awayTeamLabel);

                                    return (
                                    <div key={match.id} className="rounded-lg border border-gray-800 bg-dark p-3 space-y-2">
                                      <p className="text-[11px] text-gray-400">{formatDate(match.date)}</p>
                                      <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-sm">
                                          <span className={`font-medium ${homeIsPlaceholder ? 'text-gray-400 italic' : ''}`}>{homeTeamLabel}</span>
                                          <span className="font-semibold">
                                            {match.status === 'finished'
                                              ? hasPenaltyResult(match)
                                                ? `${match.homeScore ?? 0} (${match.penaltyHomeScore})`
                                                : (match.homeScore ?? 0)
                                              : '-'}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                          <span className={`font-medium ${awayIsPlaceholder ? 'text-gray-400 italic' : ''}`}>{awayTeamLabel}</span>
                                          <span className="font-semibold">
                                            {match.status === 'finished'
                                              ? hasPenaltyResult(match)
                                                ? `(${match.penaltyAwayScore}) ${match.awayScore ?? 0}`
                                                : (match.awayScore ?? 0)
                                              : '-'}
                                          </span>
                                        </div>
                                      </div>
                                      <div className="pt-1">
                                        {match.status === 'finished' ? (
                                          <span className="text-[11px] px-2 py-1 rounded-full bg-green-500/15 text-green-400 border border-green-500/30">
                                            Finalizado
                                          </span>
                                        ) : match.status === 'live' ? (
                                          <span className="text-[11px] px-2 py-1 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                            En vivo
                                          </span>
                                        ) : (
                                          <span className="text-[11px] px-2 py-1 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30">
                                            Programado
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                          <h4 className="font-medium mb-4">Próximos partidos</h4>
                          
                          {tournament.status !== 'upcoming' ? (
                            matchesLoading ? (
                              <p className="text-center text-gray-400 py-4">Cargando partidos...</p>
                            ) : visibleTournamentMatches.length === 0 ? (
                              <p className="text-center text-gray-400 py-4">No hay partidos registrados para este torneo.</p>
                            ) : (
                            <div className="space-y-3">
                              {visibleTournamentMatches.map(match => (
                                <div key={match.id} className="bg-dark rounded-lg p-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="text-center mr-3">
                                      <p className="text-xs text-gray-400">
                                        {tournamentIsCup ? getCupStageLabel(match.round) : `Jornada ${match.round}`}
                                      </p>
                                      <p className="text-sm">{formatDate(match.date)}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <span className={`font-medium mr-2 ${isCupReferenceTeam(match.homeTeam) ? 'text-gray-400 italic' : ''}`}>{match.homeTeam}</span>
                                      <span className="text-gray-400 mx-2">vs</span>
                                      <span className={`font-medium ml-2 ${isCupReferenceTeam(match.awayTeam) ? 'text-gray-400 italic' : ''}`}>{match.awayTeam}</span>
                                    </div>
                                  </div>
                                  
                                  {match.status === 'finished' ? (
                                    <span className="font-bold"><MatchScore match={match} /></span>
                                  ) : match.status === 'live' ? (
                                    <span className="text-xs bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-1 rounded-full animate-pulse">
                                      En vivo
                                    </span>
                                  ) : (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                                      Próximamente
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            )
                          ) : (
                            <p className="text-center text-gray-400 py-4">
                              El calendario se publicará al cerrarse las inscripciones
                            </p>
                          )}
                        </div>
                        
                        {tournament.status !== 'upcoming' && (
                          <div className="bg-dark-lighter rounded-lg p-4">
                            <h4 className="font-medium mb-4">Tabla de posiciones</h4>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-xs uppercase text-gray-400 border-b border-gray-800">
                                    <th className="px-3 py-2 text-left">Pos</th>
                                    <th className="px-3 py-2 text-left">Club</th>
                                    <th className="px-3 py-2 text-center">PJ</th>
                                    <th className="px-3 py-2 text-center">G</th>
                                    <th className="px-3 py-2 text-center">E</th>
                                    <th className="px-3 py-2 text-center">P</th>
                                    <th className="px-3 py-2 text-center">GF</th>
                                    <th className="px-3 py-2 text-center">GC</th>
                                    <th className="px-3 py-2 text-center">Pts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tournamentStandings.slice(0, 10).map((standing, index) => {
                                    const club =
                                      clubs.find((c) => c.id === standing.clubId) ||
                                      clubs.find((c) => c.name === standing.clubName);
                                    const clubLinkName = (club?.name || standing.clubName).toLowerCase().replace(/\s+/g, '-');
                                    const clubLogo = club?.logo || '/default-club.svg';

                                    return (
                                      <tr key={`${standing.clubId || standing.clubName}-${index}`} className="border-b border-gray-800 text-sm">
                                        <td className="px-3 py-2">{index + 1}</td>
                                        <td className="px-3 py-2">
                                          <Link
                                            to={`/liga-master/club/${clubLinkName}`}
                                            className="flex items-center hover:text-primary"
                                          >
                                            <div className="w-6 h-6 mr-2">
                                              <img src={clubLogo} alt={standing.clubName} className="w-full h-full rounded" />
                                            </div>
                                            <span>{standing.clubName}</span>
                                          </Link>
                                        </td>
                                        <td className="px-3 py-2 text-center">{standing.played}</td>
                                        <td className="px-3 py-2 text-center">{standing.won}</td>
                                        <td className="px-3 py-2 text-center">{standing.drawn}</td>
                                        <td className="px-3 py-2 text-center">{standing.lost}</td>
                                        <td className="px-3 py-2 text-center">{standing.goalsFor}</td>
                                        <td className="px-3 py-2 text-center">{standing.goalsAgainst}</td>
                                        <td className="px-3 py-2 text-center font-bold">{standing.points}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'scorers' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Tabla de goleadores</h3>

                    {tournament.status !== 'upcoming' ? (
                      <div className="bg-dark-lighter rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-dark text-xs uppercase text-gray-400 border-b border-gray-800">
                              <th className="px-4 py-3 text-left">Pos</th>
                              <th className="px-4 py-3 text-left">Jugador</th>
                              <th className="px-4 py-3 text-left">Club</th>
                              <th className="px-4 py-3 text-center">Goles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topScorers.length === 0 && (
                              <tr>
                                <td colSpan={4} className="px-4 py-6 text-center text-gray-400">
                                  Aún no hay goles registrados para este torneo.
                                </td>
                              </tr>
                            )}
                            {topScorers.map((scorer, index) => (
                              <tr key={scorer.id} className="border-b border-gray-800 hover:bg-dark">
                                <td className="px-4 py-3 text-sm">
                                  <span className={`
                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                                    ${index === 1 ? 'bg-gray-500/20 text-gray-300' : ''}
                                    ${index === 2 ? 'bg-amber-700/20 text-amber-700' : ''}
                                    ${index > 2 ? 'bg-dark text-white' : ''}
                                  `}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{scorer.name}</td>
                                <td className="px-4 py-3">
                                  <Link
                                    to={`/liga-master/club/${scorer.club.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="hover:text-primary"
                                  >
                                    {scorer.club}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-center font-bold">{scorer.goals}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        El torneo aún no ha comenzado. La tabla de goleadores se actualizará una vez que inicie la competencia.
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Galería</h3>
                    
                    {tournament.status !== 'upcoming' ? (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <button className="btn-outline flex items-center">
                            <Image size={16} className="mr-2" />
                            <span>Subir contenido</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        El torneo aún no ha comenzado. Se añadirán imágenes y clips una vez que inicie la competencia.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-dark-light border border-gray-800 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Trophy size={18} className="text-primary mr-2" />
                Información del torneo
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <p className="flex items-center">
                    <span className={`
                      inline-block w-2 h-2 rounded-full mr-2
                      ${tournament.status === 'active' ? 'bg-neon-green' : ''}
                      ${tournament.status === 'upcoming' ? 'bg-neon-blue' : ''}
                      ${tournament.status === 'finished' ? 'bg-gray-500' : ''}
                    `}></span>
                    <span>
                  {tournament.status === 'active' ? 'En curso' : tournament.status === 'upcoming' ? 'Próximamente' : 'Finalizado'}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Formato</p>
                  <p>{tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Fechas</p>
                  <p>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Equipos</p>
                  <p>{tournament.teams.length} participantes</p>
                </div>

                {tournament.status === 'finished' && tournament.winner && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Campeón</p>
                    <p className="font-bold">{tournament.winner}</p>
                  </div>
                )}
              </div>
            </div>
            
            {tournament.status === 'upcoming' && (
              <div className="bg-primary/10 border border-primary rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-3">¡Inscríbete ahora!</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Las inscripciones para este torneo están abiertas {isAuthenticated
                    ? 'hasta el ' + formatDate(tournament.startDate)
                    : '- inicia sesión para participar'
                  }.
                </p>

                {/* Feedback de solicitud */}
                {requestMessage && (
                  <div className={`p-3 rounded-lg mb-3 flex items-center gap-2 ${
                    requestStatus === 'success'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : requestStatus === 'error'
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                  }`}>
                    {requestStatus === 'success' && <CheckCircle size={16} />}
                    {requestStatus === 'error' && <AlertCircle size={16} />}
                    {requestStatus === 'loading' && <Loader size={16} className="animate-spin" />}
                    <span className="text-xs">{requestMessage}</span>
                  </div>
                )}

                <button
                  onClick={handleRequestParticipation}
                  disabled={requestStatus === 'loading' || requestStatus === 'success'}
                  className={`btn-primary w-full ${
                    requestStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {requestStatus === 'loading' ? (
                    <>
                      <Loader size={16} className="mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : requestStatus === 'success' ? (
                    <>
                      <CheckCircle size={16} className="mr-2" />
                      Solicitud enviada
                    </>
                  ) : (
                    'Solicitar participación'
                  )}
                </button>
              </div>
            )}
            
            <div className="bg-dark-light border border-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-4">Equipos participantes</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tournamentClubs.map(club => (
                  <Link 
                    key={club.id}
                    to={`/liga-master/club/${club.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="flex items-center p-2 rounded hover:bg-dark-lighter"
                  >
                    <div className="w-8 h-8 rounded overflow-hidden mr-2">
                      <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                    </div>
                    <span>{club.name}</span>
                  </Link>
                ))}
              </div>
              
              <button 
                onClick={() => setActiveTab('participants')}
                className="text-primary hover:text-primary-light text-sm flex items-center mt-4"
              >
                <span>Ver todos los participantes</span>
                <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            
            {tournament.status !== 'upcoming' && (
              <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                <h3 className="font-bold mb-4">Top goleadores</h3>
                
                <div className="space-y-3">
                  {topScorers.length === 0 && (
                    <p className="text-sm text-gray-400">Sin goles registrados todavia.</p>
                  )}
                  {topScorers.slice(0, 3).map((scorer, index) => (
                    <div key={scorer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center mr-2
                          ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                          ${index === 1 ? 'bg-gray-500/20 text-gray-300' : ''}
                          ${index === 2 ? 'bg-amber-700/20 text-amber-700' : ''}
                        `}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{scorer.name}</p>
                          <p className="text-xs text-gray-400">{scorer.club}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-500 mr-1" />
                        <span className="font-bold">{scorer.goals}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setActiveTab('scorers')}
                  className="text-primary hover:text-primary-light text-sm flex items-center mt-4"
                >
                  <span>Ver tabla completa</span>
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
 



