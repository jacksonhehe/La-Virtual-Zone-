import  { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronUp, Award, Target, ExternalLink, PlayCircle, Star } from 'lucide-react';
import { SoccerBall } from '@phosphor-icons/react';
import PageHeader from '../../components/common/PageHeader';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/format';
import { listMatches } from '../../utils/matchService';
import type { Match } from '../../types';
import { getYouTubeEmbedUrl, getYouTubeThumbnailUrl, getYouTubeWatchUrl } from '../../utils/youtube';
import { getCupStageLabel, isCupTournament } from '../../utils/matchStages';
import MatchScore from '../../components/common/MatchScore';

const normalizeTeamRef = (value: string | undefined) => String(value || '').trim().toLowerCase();
const isPlaceholderTeam = (teamRef: string | undefined) => {
  const value = normalizeTeamRef(teamRef);
  if (!value) return true;
  return (
    value === 'por definir' ||
    value.startsWith('ganador de') ||
    value.startsWith('perdedor de') ||
    value.startsWith('ganador ') ||
    value.startsWith('perdedor ') ||
    value.startsWith('winner ') ||
    value.startsWith('loser ')
  );
};

const Fixtures = () => {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const [expandedMatches, setExpandedMatches] = useState<Record<string, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [allMatches, setAllMatches] = useState<(Match & { tournamentName?: string; tournamentLogo?: string; tournamentType?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { tournaments, clubs } = useDataStore();
  
  // Load matches from independent table
  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const matches = await listMatches();
        
        // Enrich matches with tournament info
        const enrichedMatches = matches.map(match => {
          const tournament = tournaments.find(t => t.id === match.tournamentId);
          return {
            ...match,
            tournamentName: tournament?.name,
            tournamentLogo: tournament?.logo,
            tournamentType: tournament?.type
          };
        })
          .filter((match) => !isPlaceholderTeam(match.homeTeam) && !isPlaceholderTeam(match.awayTeam))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setAllMatches(enrichedMatches);
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, [tournaments]);
  
  // Get unique tournaments
  const tournamentList = tournaments.map(t => ({ id: t.id, name: t.name, logo: t.logo }));
  const selectedTournamentInfo = selectedTournament === 'all'
    ? null
    : tournaments.find((t) => t.id === selectedTournament);
  const selectedTournamentIsCup = isCupTournament(selectedTournamentInfo?.type, selectedTournamentInfo?.name);

  // Build round/fase selector from the currently selected competition only.
  const matchesForRoundSelector = selectedTournament === 'all'
    ? allMatches
    : allMatches.filter((m) => m.tournamentId === selectedTournament);
  const rounds = Array.from(
    new Set(matchesForRoundSelector.map((match) => match.round))
  ).sort((a, b) => a - b);
  
  // Set first round as default if none selected and we have matches
  useEffect(() => {
    if (selectedRound === null && rounds.length > 0) {
      setSelectedRound(rounds[0]);
      return;
    }
    if (selectedRound !== null && !rounds.includes(selectedRound)) {
      setSelectedRound(rounds.length > 0 ? rounds[0] : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rounds, selectedRound]);
  
  // Show loading state
  if (loading) {
    return (
      <div>
        <PageHeader 
          title="Fixture y Resultados" 
          subtitle="Calendario de partidos y resultados de la Liga Master."
          image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
        />
        <div className="container mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <p className="text-gray-400">Cargando partidos...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Filter matches by tournament and round
  let filteredMatches = allMatches;
  
  if (selectedTournament !== 'all') {
    filteredMatches = filteredMatches.filter(m => m.tournamentId === selectedTournament);
  }
  
  if (selectedRound !== null) {
    filteredMatches = filteredMatches.filter(match => match.round === selectedRound);
  }

  const totalMatchesForStats = selectedTournament === 'all' ? allMatches.length : matchesForRoundSelector.length;
  
  // Toggle match details
  const toggleMatchDetails = (matchId: string) => {
    setExpandedMatches(prev => ({
      ...prev,
      [matchId]: !prev[matchId]
    }));
  };
  
  // Get club by id or name
  const getClub = (idOrName: string) => {
    return clubs.find(c => c.id === idOrName) || clubs.find(c => c.name === idOrName);
  };

  // Handle image error
  const handleImageError = (clubId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [clubId]: true
    }));
  };

  // Get logo source with fallback
  const getLogoSrc = (club: any) => {
    if (imageErrors[club?.id]) {
      return '/default-club.svg';
    }
    return club?.logo || '/default-club.svg';
  };
  
  return (
    <div>
      <PageHeader 
        title="Fixture y Resultados" 
        subtitle="Calendario de partidos y resultados de la Liga Master."
        image="https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Tournament info and filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold mb-2">Fixture y Resultados</h2>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="text-gray-400">
                  <span className="text-white font-medium">{tournaments.length}</span> torneos
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-medium">{rounds.length}</span> jornadas/fases
                </div>
                <div className="text-gray-400">
                  <span className="text-white font-medium">{totalMatchesForStats}</span> partidos totales
                </div>
              </div>
            </div>
            
            {/* Tournament filter */}
            <div className="flex-shrink-0">
              <label className="block text-sm text-gray-400 mb-2">Filtrar por torneo</label>
              <select
                value={selectedTournament}
                onChange={(e) => {
                  setSelectedTournament(e.target.value);
                  setSelectedRound(null); // Reset round when tournament changes
                }}
                className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="all">Todos los torneos</option>
                {tournamentList.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Round selector */}
        {rounds.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedTournamentInfo
                  ? selectedTournamentIsCup
                    ? 'Filtrar por fase'
                    : 'Filtrar por jornada'
                  : 'Filtrar por jornada/fase'}
              </h3>
              <button
                onClick={() => setSelectedRound(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedRound === null
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                }`}
              >
                {selectedTournamentInfo
                  ? selectedTournamentIsCup
                    ? 'Todas las fases'
                    : 'Todas las jornadas'
                  : 'Todas'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <div className="flex space-x-3 min-w-max pb-2">
                {rounds.map(round => (
                  <button
                    key={round}
                    onClick={() => setSelectedRound(round)}
                    className={`px-5 py-3 rounded-lg whitespace-nowrap font-medium transition-all duration-200 transform hover:scale-105 ${
                      selectedRound === round
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-gray-800/60 text-gray-300 hover:bg-gray-700/80 hover:text-white border border-gray-700/50'
                    }`}
                  >
                    {selectedTournamentInfo
                      ? selectedTournamentIsCup
                        ? getCupStageLabel(round)
                        : `Jornada ${round}`
                      : `Ronda ${round}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Matches */}
        <div className="space-y-6">
          {filteredMatches.map(match => {
            const homeClub = getClub(match.homeTeam);
            const awayClub = getClub(match.awayTeam);
            const isExpanded = expandedMatches[match.id] || false;

            return (
              <div key={match.id} className="card card-hover overflow-hidden shadow-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
                <div className="p-5 border-b border-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="text-sm text-gray-300 font-medium">
                        {formatDate(match.date)} • {isCupTournament(match.tournamentType, match.tournamentName)
                          ? getCupStageLabel(match.round)
                          : `Jornada ${match.round}`}
                      </div>
                      {match.tournamentName && (
                        <div className="flex items-center gap-2">
                          <img src={match.tournamentLogo} alt={match.tournamentName} className="w-4 h-4 rounded" />
                          <span className="text-xs text-gray-400">{match.tournamentName}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm">
                      {match.status === 'scheduled' && (
                        <span className="badge bg-blue-500/25 text-blue-300 border border-blue-500/30 px-3 py-1">Programado</span>
                      )}
                      {match.status === 'live' && (
                        <span className="badge bg-red-500/20 text-red-300 border border-red-500/40 px-3 py-1 animate-pulse">En vivo</span>
                      )}
                      {match.status === 'finished' && (
                        <span className="badge bg-gray-500/25 text-gray-300 border border-gray-500/30 px-3 py-1">Finalizado</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center w-2/5 sm:w-1/3 group">
                      <div className="relative mb-3">
                        <img
                          src={getLogoSrc(homeClub)}
                          alt={homeClub?.name}
                          onError={() => handleImageError(homeClub?.id)}
                          className="w-14 h-14 sm:w-18 sm:h-18 object-contain rounded-lg bg-white/5 p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span className="font-semibold text-center text-white leading-tight">{homeClub?.name}</span>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      {match.status === 'finished' ? (
                        <div className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                          <MatchScore match={match} />
                        </div>
                      ) : (
                        <div className="text-2xl sm:text-3xl font-bold mb-2 text-gray-400">VS</div>
                      )}

                      <button
                        onClick={() => toggleMatchDetails(match.id)}
                        className="text-primary hover:text-primary-light text-sm flex items-center transition-colors duration-200 hover:scale-105"
                      >
                        {isExpanded ? (
                          <>
                            <span>Menos detalles</span>
                            <ChevronUp size={16} className="ml-1" />
                          </>
                        ) : (
                          <>
                            <span>Más detalles</span>
                            <ChevronDown size={16} className="ml-1" />
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col items-center w-2/5 sm:w-1/3 group">
                      <div className="relative mb-3">
                        <img
                          src={getLogoSrc(awayClub)}
                          alt={awayClub?.name}
                          onError={() => handleImageError(awayClub?.id)}
                          className="w-14 h-14 sm:w-18 sm:h-18 object-contain rounded-lg bg-white/5 p-2 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                        />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <span className="font-semibold text-center text-white leading-tight">{awayClub?.name}</span>
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="px-6 pb-6 pt-0 animate-in slide-in-from-top-2 duration-300">
                    <div className="border-t border-gradient-to-r from-transparent via-gray-700/50 to-transparent my-6" />

                    {match.youtubeVideoId && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3 gap-2">
                          <h3 className="font-bold text-lg text-white">Video del partido</h3>
                          <a
                            href={getYouTubeWatchUrl(match.youtubeVideoId)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-red-300 hover:text-red-200 transition-colors"
                          >
                            Ver en YouTube
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div className="rounded-xl overflow-hidden border border-gray-700 bg-black">
                          <div className="relative pt-[56.25%]">
                            <iframe
                              className="absolute inset-0 w-full h-full"
                              src={getYouTubeEmbedUrl(match.youtubeVideoId)}
                              title={`Video ${match.homeTeam} vs ${match.awayTeam}`}
                              loading="lazy"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            />
                          </div>
                        </div>
                        <a
                          href={getYouTubeWatchUrl(match.youtubeVideoId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                        >
                          <img
                            src={getYouTubeThumbnailUrl(match.youtubeVideoId)}
                            alt="Miniatura del video"
                            className="w-16 h-9 rounded object-cover border border-gray-700"
                            loading="lazy"
                          />
                          <PlayCircle size={16} />
                          Abrir video en YouTube
                        </a>
                      </div>
                    )}

                    {match.playerOfTheMatch && (
                      <div className="mb-6 rounded-xl border border-yellow-400/40 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 px-4 py-3">
                        <div className="flex items-center justify-center gap-2 text-center">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs sm:text-sm uppercase tracking-wider font-bold text-yellow-300">
                            Jugador del Partido
                          </span>
                          <span className="text-white font-semibold text-sm sm:text-lg">
                            {match.playerOfTheMatch}
                          </span>
                        </div>
                      </div>
                    )}

                    {match.status === 'finished' ? (() => {
                      const events: Array<{
                        minute: number;
                        type: 'goal' | 'yellow' | 'red';
                        playerName: string;
                        assist?: string;
                        clubId?: string;
                        ownGoal?: boolean;
                      }> = [];

                        (match.scorers || []).forEach((s) => {
                          events.push({
                            minute: s.minute ?? 0,
                            type: 'goal',
                            playerName: s.playerName,
                            assist: s.assistPlayerName,
                            clubId: s.clubId,
                            ownGoal: s.ownGoal || false,
                          });
                        });

                      (match.cards || []).forEach((c) => {
                        events.push({
                          minute: c.minute ?? 0,
                          type: c.type === 'red' ? 'red' : 'yellow',
                          playerName: c.playerName,
                          clubId: c.clubId,
                        });
                      });

                      events.sort((a, b) => (a.minute ?? 0) - (b.minute ?? 0));

                      const isHomeEvent = (event: { clubId?: string; ownGoal?: boolean; type: 'goal' | 'yellow' | 'red' }) => {
                        const club = event.clubId ? getClub(event.clubId) : null;
                        let scoringClubId: string | undefined = event.clubId;
                        if (event.type === 'goal' && event.ownGoal) {
                          const scoredHome =
                            event.clubId === homeClub?.id || event.clubId === match.homeTeam || club?.name === match.homeTeam;
                          scoringClubId = scoredHome ? (awayClub?.id || match.awayTeam) : (homeClub?.id || match.homeTeam);
                        }
                        const scoringClub = scoringClubId ? getClub(scoringClubId) : null;
                        const scoringClubName = scoringClub?.name || scoringClubId;
                        return scoringClubId === homeClub?.id || scoringClubName === match.homeTeam;
                      };

                      const statsSource = match.matchStats || {};
                      const statPair = (key: 'possession' | 'shotsTotal' | 'shotsOnTarget' | 'passes' | 'tackles' | 'corners' | 'fouls') => {
                        const pair = (statsSource as any)?.[key];
                        return {
                          home: Number.isFinite(pair?.home) ? pair.home : 0,
                          away: Number.isFinite(pair?.away) ? pair.away : 0,
                        };
                      };

                      const possession = statPair('possession');
                      const shotsTotal = statPair('shotsTotal');
                      const shotsOnTarget = statPair('shotsOnTarget');
                      const passes = statPair('passes');
                      const tackles = statPair('tackles');
                      const corners = statPair('corners');
                      const fouls = statPair('fouls');

                      const statsRows = [
                        { label: 'Posesion', home: possession.home, away: possession.away, isPercentage: true },
                        { label: 'Tiros Total', home: shotsTotal.home, away: shotsTotal.away, isPercentage: false },
                        { label: 'Al Arco', home: shotsOnTarget.home, away: shotsOnTarget.away, isPercentage: false },
                        { label: 'Pases', home: passes.home, away: passes.away, isPercentage: false },
                        { label: 'Entradas', home: tackles.home, away: tackles.away, isPercentage: false },
                        { label: 'Corners', home: corners.home, away: corners.away, isPercentage: false },
                        { label: 'Faltas', home: fouls.home, away: fouls.away, isPercentage: false },
                      ];

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <section className="rounded-xl border border-gray-700 bg-gray-900/35 p-4 sm:p-5">
                            <h3 className="font-bold mb-4 text-lg text-white text-center">Estadísticas</h3>
                            <div className="space-y-3">
                              {statsRows.map((row) => {
                                const total = row.home + row.away;
                                const homePct = total > 0 ? (row.home / total) * 100 : 50;
                                const awayPct = total > 0 ? (row.away / total) * 100 : 50;

                                return (
                                  <div key={row.label} className="rounded-lg bg-gray-800/35 border border-gray-700/60 p-3">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                      <span className="font-bold text-white">{row.home}{row.isPercentage ? '%' : ''}</span>
                                      <span className="text-gray-300 uppercase tracking-wide text-xs">{row.label}</span>
                                      <span className="font-bold text-white">{row.away}{row.isPercentage ? '%' : ''}</span>
                                    </div>
                                    <div className="flex h-2 overflow-hidden rounded-full bg-gray-700">
                                      <div className="bg-primary/90" style={{ width: `${homePct}%` }} />
                                      <div className="bg-yellow-300/90" style={{ width: `${awayPct}%` }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </section>

                          <section className="rounded-xl border border-gray-700 bg-gray-900/35 p-4 sm:p-5">
                            <h3 className="font-bold mb-4 text-lg text-white text-center">Incidencias</h3>
                            {events.length === 0 ? (
                              <div className="text-center py-8 text-gray-400 bg-gray-800/20 rounded-lg">
                                <div className="mb-3">
                                  <Target size={48} className="text-primary mx-auto" />
                                </div>
                                No hay incidencias registradas para este partido.
                              </div>
                            ) : (
                              <ul className="space-y-3">
                                {events.map((event, index) => {
                                  const isHome = isHomeEvent(event);
                                  const isAway = !isHome;
                                  const playerLabel = `${event.playerName}${event.ownGoal ? ' (AG)' : ''}`;

                                  const icon =
                                    event.type === 'goal' ? (
                                      <SoccerBall size={20} weight="fill" className="text-primary" />
                                    ) : event.type === 'red' ? (
                                      <span className="inline-flex w-4 h-5 rounded-sm bg-red-500 rotate-12 shadow-sm shadow-red-500/40" />
                                    ) : (
                                      <span className="inline-flex w-4 h-5 rounded-sm bg-yellow-300 rotate-12 shadow-sm shadow-yellow-300/40" />
                                    );

                                  return (
                                    <li key={index} className="grid grid-cols-5 items-center gap-3 p-3 rounded-lg bg-gray-800/30">
                                      <div className={`col-span-2 text-sm ${isHome ? 'text-white' : 'text-gray-500'}`}>
                                        {isHome ? (
                                          <>
                                            <span className="font-medium">{playerLabel}</span>
                                            {event.assist && !event.ownGoal && (
                                              <span className="block text-xs text-gray-400">Asistencia: {event.assist}</span>
                                            )}
                                          </>
                                        ) : null}
                                      </div>

                                      <div className="col-span-1 flex flex-col items-center justify-center text-center">
                                        <span className="text-sm font-bold text-primary">{event.minute}'</span>
                                        {icon}
                                      </div>

                                      <div className={`col-span-2 text-sm text-right ${isAway ? 'text-white' : 'text-gray-500'}`}>
                                        {isAway ? (
                                          <>
                                            <span className="font-medium">{playerLabel}</span>
                                            {event.assist && !event.ownGoal && (
                                              <span className="block text-xs text-gray-400">Asistencia: {event.assist}</span>
                                            )}
                                          </>
                                        ) : null}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </section>
                        </div>
                      );
                    })() : match.status === 'live' ? (
                      <div className="text-center py-8 text-gray-300 bg-gray-800/20 border border-gray-700 rounded-lg">
                        <div className="mb-3">
                          <Target size={48} className="text-primary mx-auto" />
                        </div>
                        El partido está en vivo. Las incidencias y estadísticas se actualizarán al finalizar.
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 bg-gray-800/20 rounded-lg">
                        <div className="mb-3">
                          <Target size={48} className="text-primary mx-auto" />
                        </div>
                        El partido aún no se ha disputado.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {filteredMatches.length === 0 && (
            <div className="card p-8 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
              <div className="mb-4">
                <Award size={60} className="text-primary mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Sin partidos disponibles</h3>
              <p className="text-gray-400">
                {selectedRound !== null 
                  ? selectedTournamentInfo
                    ? selectedTournamentIsCup
                      ? `No hay partidos disponibles para la fase ${getCupStageLabel(selectedRound)}.`
                      : `No hay partidos disponibles para la jornada ${selectedRound}.`
                    : `No hay partidos disponibles para la ronda ${selectedRound}.`
                  : selectedTournament !== 'all'
                  ? 'No hay partidos disponibles para este torneo.'
                  : 'No hay partidos programados.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Fixtures;
 




