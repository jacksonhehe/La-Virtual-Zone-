import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore';
import { listMatches } from '../../utils/matchService';
import { formatDate } from '../../utils/format';
import { CUP_STAGE_OPTIONS, getCupStageLabel, isCupTournament } from '../../utils/matchStages';
import { hasPenaltyResult } from '../../utils/matchScore';
import MatchScore from '../../components/common/MatchScore';
import type { Match, Scorer } from '../../types';

type ViewMode = 'bracket' | 'stats';
type CupStatsTab = 'scorers' | 'assists' | 'booked' | 'sentOff' | 'bestPlayer';

type CupStatRow = {
  key: string;
  playerName: string;
  clubId?: string;
  value: number;
};

const CARD_STYLES = [
  'border-slate-700/60 from-slate-900/80 to-slate-900/50',
  'border-slate-700/60 from-slate-900/80 to-slate-800/45',
  'border-slate-700/60 from-slate-900/80 to-slate-900/55',
];

const VENUES = ['SEDE ARGENTINA', 'SEDE PERU', 'SEDE CHILE', 'SEDE ECUADOR', 'SEDE COLOMBIA'];

const STAGE_ALIAS: Record<number, string> = {
  1: 'FASE 1',
  2: '16AVOS',
  3: '8VOS',
  4: '4TOS',
  5: 'SEMIFINALES',
  6: 'TERCER PUESTO',
  7: 'FINAL',
};

const getStageChipLabel = (round: number) => STAGE_ALIAS[round] || getCupStageLabel(round).toUpperCase();
const PREVIOUS_ROUND_BY_ROUND: Record<number, number | null> = {
  1: null,
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 5,
};

const getRoundOrderLabel = (round: number) => {
  const label = getCupStageLabel(round);
  return label.replace('de final', '').trim();
};

type ResolvedMatchView = Match & {
  displayHomeTeam: string;
  displayAwayTeam: string;
};

const hashText = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const toStatNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getVenueChipClass = (venue: string) => {
  if (venue.includes('COLOMBIA') || venue.includes('ECUADOR')) {
    return 'text-yellow-200 bg-yellow-500/15 border-yellow-400/40';
  }
  if (venue.includes('ARGENTINA')) {
    return 'text-sky-200 bg-sky-500/15 border-sky-400/40';
  }
  if (venue.includes('CHILE') || venue.includes('PERU')) {
    return 'text-red-200 bg-red-500/15 border-red-400/40';
  }
  return 'text-slate-300 bg-slate-950/70 border-slate-700/50';
};

const getVenueGlowClass = (venue: string) => {
  if (venue.includes('COLOMBIA') || venue.includes('ECUADOR')) {
    return 'bg-[radial-gradient(circle_at_82%_18%,rgba(234,179,8,0.12),transparent_42%),radial-gradient(circle_at_12%_100%,rgba(234,179,8,0.08),transparent_48%)]';
  }
  if (venue.includes('ARGENTINA')) {
    return 'bg-[radial-gradient(circle_at_82%_18%,rgba(56,189,248,0.12),transparent_42%),radial-gradient(circle_at_12%_100%,rgba(14,165,233,0.08),transparent_48%)]';
  }
  if (venue.includes('CHILE') || venue.includes('PERU')) {
    return 'bg-[radial-gradient(circle_at_82%_18%,rgba(239,68,68,0.12),transparent_42%),radial-gradient(circle_at_12%_100%,rgba(220,38,38,0.08),transparent_48%)]';
  }
  return 'bg-[radial-gradient(circle_at_82%_18%,rgba(34,197,94,0.12),transparent_42%),radial-gradient(circle_at_12%_100%,rgba(59,130,246,0.08),transparent_48%)]';
};

const CopaLVZ = () => {
  const { tournaments, clubs, players } = useDataStore();
  const { user, hasRole } = useAuthStore();
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('bracket');
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [statsTab, setStatsTab] = useState<CupStatsTab>('scorers');

  const isDT = hasRole('dt');
  const userClub = isDT && user?.clubId ? clubs.find((club) => club.id === user.clubId) : null;

  useEffect(() => {
    let mounted = true;
    const loadMatches = async () => {
      setLoading(true);
      try {
        const matches = await listMatches();
        if (mounted) setAllMatches(matches);
      } catch (error) {
        console.error('Error loading matches for Copa LVZ:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadMatches();
    return () => {
      mounted = false;
    };
  }, []);

  const normalizeTeamRef = (value: string | undefined) => String(value || '').trim().toLowerCase();

  const getClubMeta = (teamRef: string) => {
    const normalized = normalizeTeamRef(teamRef);
    return clubs.find(
      (club) => normalizeTeamRef(club.id) === normalized || normalizeTeamRef(club.name) === normalized
    );
  };

  const getTeamName = (teamRef: string) => getClubMeta(teamRef)?.name || teamRef;
  const getTeamLogo = (teamRef: string) => getClubMeta(teamRef)?.logo || '/default-club.svg';

  const cupTournaments = useMemo(() => {
    return tournaments
      .filter((tournament) => isCupTournament(tournament.type, tournament.name))
      .sort((a, b) => {
        const weight = (status: string) => (status === 'active' ? 0 : status === 'upcoming' ? 1 : 2);
        return weight(a.status) - weight(b.status);
      });
  }, [tournaments]);

  const activeCup = cupTournaments[0] || null;

  const cupMatches = useMemo(() => {
    if (!activeCup) return [];
    return allMatches
      .filter((match) => match.tournamentId === activeCup.id)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [activeCup, allMatches]);

  const resolvedCupMatches = useMemo<ResolvedMatchView[]>(() => {
    const matchesByRound = new Map<number, Match[]>();
    cupMatches.forEach((match) => {
      if (!matchesByRound.has(match.round)) matchesByRound.set(match.round, []);
      matchesByRound.get(match.round)!.push(match);
    });

    const sortedRounds = Array.from(matchesByRound.keys()).sort((a, b) => a - b);
    const resolvedByMatchId = new Map<string, ResolvedMatchView>();
    const resolvedTeamsByMatchId = new Map<string, { home: string; away: string }>();

    const getQualifiedTeam = (sourceMatch: Match, sourceKind: 'winner' | 'loser') => {
      if (sourceMatch.status !== 'finished' || sourceMatch.homeScore == null || sourceMatch.awayScore == null) return '';

      const sourceResolvedTeams = resolvedTeamsByMatchId.get(sourceMatch.id);
      const sourceHome = sourceResolvedTeams?.home || sourceMatch.homeTeam;
      const sourceAway = sourceResolvedTeams?.away || sourceMatch.awayTeam;

      let winner: string | null = null;
      if (sourceMatch.homeScore > sourceMatch.awayScore) winner = sourceHome;
      if (sourceMatch.awayScore > sourceMatch.homeScore) winner = sourceAway;
      if (!winner && sourceMatch.decidedBy === 'penalties') {
        if (sourceMatch.qualifiedTeam === 'home') winner = sourceHome;
        if (sourceMatch.qualifiedTeam === 'away') winner = sourceAway;
        if (!winner && hasPenaltyResult(sourceMatch)) {
          if ((sourceMatch.penaltyHomeScore || 0) > (sourceMatch.penaltyAwayScore || 0)) winner = sourceHome;
          if ((sourceMatch.penaltyAwayScore || 0) > (sourceMatch.penaltyHomeScore || 0)) winner = sourceAway;
        }
      }
      if (!winner) return '';
      const loser = winner === sourceHome ? sourceAway : sourceHome;
      return sourceKind === 'winner' ? winner : loser;
    };

    sortedRounds.forEach((round) => {
      const roundMatches = [...(matchesByRound.get(round) || [])].sort((a, b) => {
        const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.id.localeCompare(b.id);
      });

      const sourceRound = PREVIOUS_ROUND_BY_ROUND[round];
      const sourceMatches = sourceRound
        ? [...(matchesByRound.get(sourceRound) || [])].sort((a, b) => {
            const dateDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return a.id.localeCompare(b.id);
          })
        : [];

      roundMatches.forEach((match, index) => {
        let displayHomeTeam = match.homeTeam?.trim() || '';
        let displayAwayTeam = match.awayTeam?.trim() || '';

        if (sourceRound && sourceMatches.length > 0) {
          const sourceKind: 'winner' | 'loser' = round === 6 ? 'loser' : 'winner';
          const sourcePrefix = sourceKind === 'winner' ? 'Ganador de' : 'Perdedor de';
          const sourceRoundLabel = getRoundOrderLabel(sourceRound);
          const sourceHomeIndex = index * 2;
          const sourceAwayIndex = sourceHomeIndex + 1;
          const sourceHomeMatch = sourceMatches[sourceHomeIndex];
          const sourceAwayMatch = sourceMatches[sourceAwayIndex];

          if (!displayHomeTeam && sourceHomeMatch) {
            displayHomeTeam =
              getQualifiedTeam(sourceHomeMatch, sourceKind) ||
              `${sourcePrefix} ${sourceRoundLabel} ${sourceHomeIndex + 1}`;
          }
          if (!displayAwayTeam && sourceAwayMatch) {
            displayAwayTeam =
              getQualifiedTeam(sourceAwayMatch, sourceKind) ||
              `${sourcePrefix} ${sourceRoundLabel} ${sourceAwayIndex + 1}`;
          }
        }

        const resolvedMatch: ResolvedMatchView = {
          ...match,
          displayHomeTeam: displayHomeTeam || 'Por definir',
          displayAwayTeam: displayAwayTeam || 'Por definir',
        };

        resolvedByMatchId.set(match.id, resolvedMatch);
        resolvedTeamsByMatchId.set(match.id, {
          home: resolvedMatch.displayHomeTeam,
          away: resolvedMatch.displayAwayTeam,
        });
      });
    });

    return cupMatches.map((match) => resolvedByMatchId.get(match.id) || {
      ...match,
      displayHomeTeam: match.homeTeam?.trim() || 'Por definir',
      displayAwayTeam: match.awayTeam?.trim() || 'Por definir',
    });
  }, [cupMatches]);

  const roundsPresent = useMemo(() => Array.from(new Set(resolvedCupMatches.map((m) => m.round))).sort((a, b) => a - b), [resolvedCupMatches]);

  useEffect(() => {
    if (roundsPresent.length === 0) {
      setSelectedRound(null);
      return;
    }
    if (selectedRound == null || !roundsPresent.includes(selectedRound)) {
      setSelectedRound(roundsPresent[0]);
    }
  }, [roundsPresent, selectedRound]);

  const stageOptions = CUP_STAGE_OPTIONS.filter((option) => roundsPresent.includes(option.value));

  const matchesBySelectedRound = useMemo(() => {
    if (selectedRound == null) return [];
    return resolvedCupMatches.filter((match) => match.round === selectedRound);
  }, [resolvedCupMatches, selectedRound]);

  const getWinner = (match: Match) => {
    if (match.status !== 'finished' || match.homeScore == null || match.awayScore == null) return null;
    if (match.homeScore > match.awayScore) return 'home';
    if (match.awayScore > match.homeScore) return 'away';
    if (match.decidedBy === 'penalties') {
      if (match.qualifiedTeam === 'home' || match.qualifiedTeam === 'away') return match.qualifiedTeam;
      if (hasPenaltyResult(match)) {
        if ((match.penaltyHomeScore || 0) > (match.penaltyAwayScore || 0)) return 'home';
        if ((match.penaltyAwayScore || 0) > (match.penaltyHomeScore || 0)) return 'away';
      }
    }
    return 'draw';
  };

  const getVenue = (match: Match) => VENUES[hashText(match.id) % VENUES.length];

  const getTeamScorers = (match: ResolvedMatchView, side: 'home' | 'away'): Scorer[] => {
    const teamRef = side === 'home' ? match.displayHomeTeam : match.displayAwayTeam;
    const teamNormalized = normalizeTeamRef(teamRef);
    return (match.scorers || [])
      .filter((scorer) => {
        const clubNormalized = normalizeTeamRef(scorer.clubId);
        const clubNameNormalized = normalizeTeamRef(getClubMeta(scorer.clubId || '')?.name);
        return clubNormalized === teamNormalized || clubNameNormalized === teamNormalized;
      })
      .sort((a, b) => (a.minute || 0) - (b.minute || 0))
      .slice(0, 3);
  };

  const isUserClubMatch = (match: ResolvedMatchView) => {
    if (!userClub) return false;
    const home = normalizeTeamRef(match.displayHomeTeam);
    const away = normalizeTeamRef(match.displayAwayTeam);
    const clubId = normalizeTeamRef(userClub.id);
    const clubName = normalizeTeamRef(userClub.name);
    return home === clubId || away === clubId || home === clubName || away === clubName;
  };

  const cupMatchesForClub = useMemo(() => (userClub ? resolvedCupMatches.filter((match) => isUserClubMatch(match)) : []), [resolvedCupMatches, userClub]);
  const finishedClubMatches = cupMatchesForClub.filter((match) => match.status === 'finished');

  const clubStats = finishedClubMatches.reduce(
    (acc, match) => {
      const isHome =
        normalizeTeamRef(match.displayHomeTeam) === normalizeTeamRef(userClub?.id) ||
        normalizeTeamRef(match.displayHomeTeam) === normalizeTeamRef(userClub?.name);
      const goalsFor = isHome ? match.homeScore || 0 : match.awayScore || 0;
      const goalsAgainst = isHome ? match.awayScore || 0 : match.homeScore || 0;

      acc.played += 1;
      acc.goalsFor += goalsFor;
      acc.goalsAgainst += goalsAgainst;
      if (goalsFor > goalsAgainst) acc.wins += 1;
      else if (goalsFor < goalsAgainst) acc.losses += 1;
      else acc.draws += 1;
      return acc;
    },
    { played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 }
  );

  const cupStatsRows = useMemo(() => {
    type PlayerAccumulator = {
      key: string;
      playerName: string;
      clubId?: string;
      goals: number;
      assists: number;
      yellow: number;
      red: number;
      mvp: number;
    };

    const byPlayer = new Map<string, PlayerAccumulator>();

    const ensurePlayer = (playerKey: string, playerName: string, clubId?: string) => {
      const key = `${playerKey}-${normalizeTeamRef(clubId)}`;
      if (!byPlayer.has(key)) {
        byPlayer.set(key, {
          key,
          playerName,
          clubId,
          goals: 0,
          assists: 0,
          yellow: 0,
          red: 0,
          mvp: 0,
        });
      }
      return byPlayer.get(key)!;
    };

    cupMatches.forEach((match) => {
      (match.scorers || []).forEach((scorer) => {
        const scorerKey = scorer.playerId || scorer.playerName;
        const scorerRow = ensurePlayer(scorerKey, scorer.playerName, scorer.clubId);
        if (!scorer.ownGoal) scorerRow.goals += 1;

        if (scorer.assistPlayerName || scorer.assistPlayerId) {
          const assistName = scorer.assistPlayerName || scorer.assistPlayerId || 'Asistencia';
          const assistKey = scorer.assistPlayerId || assistName;
          const assistRow = ensurePlayer(assistKey, assistName, scorer.clubId);
          assistRow.assists += 1;
        }
      });

      (match.cards || []).forEach((card) => {
        const cardKey = card.playerId || card.playerName;
        const cardRow = ensurePlayer(cardKey, card.playerName, card.clubId);
        if (card.type === 'yellow') cardRow.yellow += 1;
        if (card.type === 'red') cardRow.red += 1;
      });

      if (match.playerOfTheMatch) {
        const mvpName = match.playerOfTheMatch.trim();
        const found = Array.from(byPlayer.values()).find(
          (player) => normalizeTeamRef(player.playerName) === normalizeTeamRef(mvpName)
        );
        if (found) {
          found.mvp += 1;
        } else {
          ensurePlayer(`mvp-${mvpName}`, mvpName).mvp += 1;
        }
      }
    });

    const toRows = (extractor: (row: PlayerAccumulator) => number): CupStatRow[] =>
      Array.from(byPlayer.values())
        .map((row) => ({
          key: row.key,
          playerName: row.playerName,
          clubId: row.clubId,
          value: extractor(row),
        }))
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value || a.playerName.localeCompare(b.playerName));

    return {
      scorers: toRows((row) => row.goals),
      assists: toRows((row) => row.assists),
      booked: toRows((row) => row.yellow),
      sentOff: toRows((row) => row.red),
      bestPlayer: toRows((row) => row.goals * 4 + row.assists * 3 + row.mvp * 5 - row.yellow - row.red * 3),
    };
  }, [cupMatches]);

  const statsMeta: Record<CupStatsTab, { label: string; valueLabel: string; rows: CupStatRow[] }> = {
    scorers: {
      label: 'Goleadores',
      valueLabel: 'Goles',
      rows: cupStatsRows.scorers,
    },
    assists: {
      label: 'Asistencias',
      valueLabel: 'Asist.',
      rows: cupStatsRows.assists,
    },
    booked: {
      label: 'Amonestados',
      valueLabel: 'Amarillas',
      rows: cupStatsRows.booked,
    },
    sentOff: {
      label: 'Expulsados',
      valueLabel: 'Rojas',
      rows: cupStatsRows.sentOff,
    },
    bestPlayer: {
      label: 'Jugador Copa',
      valueLabel: 'Puntos',
      rows: cupStatsRows.bestPlayer,
    },
  };

  const fallbackBestPlayerRows = useMemo(() => {
    if (cupStatsRows.bestPlayer.length > 0 || !activeCup) return cupStatsRows.bestPlayer;

    const cupClubIds = new Set(
      activeCup.teams
        .map((teamRef) => {
          const normalized = normalizeTeamRef(teamRef);
          const club = clubs.find(
            (item) => normalizeTeamRef(item.id) === normalized || normalizeTeamRef(item.name) === normalized
          );
          return club?.id;
        })
        .filter((id): id is string => Boolean(id))
    );

    return players
      .filter((player) => cupClubIds.has(player.clubId))
      .sort((a, b) => {
        const scoreA = a.overall + a.goals * 3 + a.assists * 2;
        const scoreB = b.overall + b.goals * 3 + b.assists * 2;
        return scoreB - scoreA;
      })
      .slice(0, 5)
      .map((player) => ({
        key: `fallback-${player.id}`,
        playerName: player.name,
        clubId: player.clubId,
        value: Math.max(1, Math.round((player.overall + player.goals * 3 + player.assists * 2) / 10)),
      }));
  }, [cupStatsRows.bestPlayer, activeCup, players, clubs]);

  statsMeta.bestPlayer.rows = fallbackBestPlayerRows;

  const activeStats = statsMeta[statsTab];

  return (
    <div>
      <PageHeader
        title="Copa LVZ"
        subtitle="Cruces por fase y estadisticas del torneo de copa."
        image="https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxmb290YmFsbCUyMGN1cHxlbnwwfHx8fDE3NDcxNzM1MTR8MA&ixlib=rb-4.1.0"
      />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <Link to="/liga-master" className="inline-flex items-center text-primary hover:text-primary-light">
          <ChevronLeft size={16} className="mr-1" />
          Volver a Liga Master
        </Link>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-5 md:p-6 backdrop-blur-sm">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Copa LVZ</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <button
              onClick={() => setViewMode('bracket')}
              className={`px-5 py-2 rounded-lg text-sm font-bold border transition ${
                viewMode === 'bracket'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-slate-900/60 text-slate-200 border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              SIMULADOR & BRACKET
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`px-5 py-2 rounded-lg text-sm font-bold border transition ${
                viewMode === 'stats'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-slate-900/60 text-slate-200 border-slate-700 hover:bg-slate-800/70'
              }`}
            >
              <span className="inline-flex items-center gap-1">
                <Trophy size={14} />
                ESTADISTICAS COPA
              </span>
            </button>
          </div>

          {loading && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-8 text-center text-slate-300">Cargando datos de copa...</div>
          )}

          {!loading && !activeCup && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-8 text-center text-slate-300">No hay una copa activa configurada.</div>
          )}

          {!loading && activeCup && viewMode === 'bracket' && (
            <>
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {stageOptions.map((stage) => (
                  <button
                    key={stage.value}
                    onClick={() => setSelectedRound(stage.value)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition ${
                      selectedRound === stage.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-slate-900/60 text-slate-300 border-slate-700 hover:bg-slate-800/70'
                    }`}
                  >
                    {getStageChipLabel(stage.value)}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {matchesBySelectedRound.length === 0 && (
                  <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-8 text-center text-slate-300">No hay cruces cargados para esta fase.</div>
                )}

                {matchesBySelectedRound.map((match, index) => {
                  const winner = getWinner(match);
                  const style = CARD_STYLES[index % CARD_STYLES.length];
                  const venueLabel = getVenue(match);
                  const venueChipClass = getVenueChipClass(venueLabel);
                  const venueGlowClass = getVenueGlowClass(venueLabel);
                  const homeShots = toStatNumber(match.matchStats?.shotsTotal?.home);
                  const awayShots = toStatNumber(match.matchStats?.shotsTotal?.away);
                  const homeShotsOnTarget = toStatNumber(match.matchStats?.shotsOnTarget?.home);
                  const awayShotsOnTarget = toStatNumber(match.matchStats?.shotsOnTarget?.away);
                  const homePossessionRaw = toStatNumber(match.matchStats?.possession?.home);
                  const awayPossessionRaw = toStatNumber(match.matchStats?.possession?.away);
                  const homePasses = toStatNumber(match.matchStats?.passes?.home);
                  const awayPasses = toStatNumber(match.matchStats?.passes?.away);
                  const totalShots = homeShots + awayShots;
                  const totalPasses = homePasses + awayPasses;
                  const totalPossession = homePossessionRaw + awayPossessionRaw;
                  const hasManualPossession = totalPossession > 0;
                  const homePct =
                    hasManualPossession
                      ? Math.round((homePossessionRaw / totalPossession) * 100)
                      : totalPasses > 0
                      ? Math.round((homePasses / totalPasses) * 100)
                      : totalShots > 0
                        ? Math.round((homeShots / totalShots) * 100)
                        : 50;
                  const awayPct = 100 - homePct;
                  const homeScorers = getTeamScorers(match, 'home');
                  const awayScorers = getTeamScorers(match, 'away');

                  return (
                    <div key={match.id} className={`relative overflow-hidden rounded-xl border bg-gradient-to-r ${style} p-2.5 md:p-3 shadow-sm backdrop-blur-sm`}>
                      <div className={`pointer-events-none absolute inset-0 ${venueGlowClass}`} />
                      <div className="relative">
                      <div className="flex justify-end mb-2">
                        <span className={`text-[11px] font-semibold tracking-wide border px-2 py-0.5 rounded ${venueChipClass}`}>
                          {venueLabel}
                        </span>
                      </div>

                      <div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-3 items-center">
                          <div className={`flex items-center justify-end gap-2 min-w-0 h-11 md:h-12 ${winner === 'home' ? 'text-white font-semibold' : 'text-slate-200'}`}>
                            <span className="text-xl md:text-2xl leading-tight font-semibold break-words">{getTeamName(match.displayHomeTeam)}</span>
                            <img src={getTeamLogo(match.displayHomeTeam)} alt={getTeamName(match.displayHomeTeam)} className="w-9 h-9 md:w-10 md:h-10 object-contain shrink-0" />
                          </div>

                          <div className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-white leading-none">
                              {match.status === 'finished' ? <MatchScore match={match} /> : `${match.homeScore ?? '-'} - ${match.awayScore ?? '-'}`}
                            </p>
                          </div>

                          <div className={`flex items-center gap-2 min-w-0 h-11 md:h-12 ${winner === 'away' ? 'text-white font-semibold' : 'text-slate-200'}`}>
                            <img src={getTeamLogo(match.displayAwayTeam)} alt={getTeamName(match.displayAwayTeam)} className="w-9 h-9 md:w-10 md:h-10 object-contain shrink-0" />
                            <span className="text-xl md:text-2xl leading-tight font-semibold break-words">{getTeamName(match.displayAwayTeam)}</span>
                          </div>
                        </div>

                        <div className="text-center mt-1">
                          <p className="text-xs text-slate-300">{match.status === 'finished' ? 'FINALIZADO' : match.status === 'live' ? 'EN VIVO' : formatDate(match.date)}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-0.5">{getCupStageLabel(match.round)}</p>
                        </div>
                      </div>

                      {(homeScorers.length > 0 || awayScorers.length > 0) && (
                        <div className="mt-1 grid grid-cols-2 gap-3">
                          <div className="text-right space-y-0.5">
                            {homeScorers.map((scorer) => (
                              <p key={`${match.id}-h-${scorer.playerId}-${scorer.minute}`} className="text-xs text-slate-400">
                                Gol {scorer.minute || 0}' {scorer.playerName}
                              </p>
                            ))}
                          </div>
                          <div className="text-left space-y-0.5">
                            {awayScorers.map((scorer) => (
                              <p key={`${match.id}-a-${scorer.playerId}-${scorer.minute}`} className="text-xs text-slate-400">
                                Gol {scorer.minute || 0}' {scorer.playerName}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}

                      {match.status === 'finished' && (
                        <div className="mt-2 border-t border-slate-700/50 pt-1.5">
                          <div className="flex justify-between text-xs text-slate-300">
                            <span>{homeShots} ({homeShotsOnTarget}) Tiros</span>
                            <span>Tiros (al arco)</span>
                            <span>{awayShots} ({awayShotsOnTarget})</span>
                          </div>
                          <div className="flex justify-between text-xs text-slate-300 mt-0.5">
                            <span>{homePct}%</span>
                            <span>Posesion</span>
                            <span>{awayPct}%</span>
                          </div>
                          <div className="mt-1.5 h-1.5 rounded-full overflow-hidden bg-slate-900/80 flex">
                            <div className="bg-primary" style={{ width: `${homePct}%` }} />
                            <div className="bg-slate-400/80" style={{ width: `${awayPct}%` }} />
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!loading && activeCup && viewMode === 'stats' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-700/60 bg-slate-900/55 overflow-hidden">
                <div className="px-4 md:px-6 py-4 border-b border-slate-700/60 bg-slate-900/50">
                  <h3 className="text-center text-lg md:text-2xl font-bold tracking-wide text-white mb-4">ESTADISTICAS DE LA COPA</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {(Object.keys(statsMeta) as CupStatsTab[]).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setStatsTab(tab)}
                        className={`px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold border transition ${
                          statsTab === tab
                            ? 'bg-primary text-white border-primary'
                            : 'bg-slate-800/70 text-slate-200 border-slate-600 hover:bg-slate-700/70'
                        }`}
                      >
                        {statsMeta[tab].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-4 md:px-6 py-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-700/70 text-slate-300 uppercase text-xs tracking-wide">
                          <th className="text-left py-2 px-2 w-14">#</th>
                          <th className="text-left py-2 px-2">Jugador</th>
                          <th className="text-left py-2 px-2">Equipo</th>
                          <th className="text-right py-2 px-2 w-24">{activeStats.valueLabel}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeStats.rows.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center py-6 text-slate-400">
                              Aun no hay datos para esta estadistica.
                            </td>
                          </tr>
                        )}
                        {activeStats.rows.slice(0, 10).map((row, index) => {
                          const clubMeta = row.clubId ? getClubMeta(row.clubId) : null;
                          return (
                            <tr key={row.key} className="border-b border-slate-700/40">
                              <td className={`py-2.5 px-2 font-semibold ${index === 0 ? 'text-primary' : 'text-slate-200'}`}>{index + 1}</td>
                              <td className={`py-2.5 px-2 ${index < 3 ? 'text-white font-semibold' : 'text-slate-200'}`}>{row.playerName}</td>
                              <td className="py-2.5 px-2 text-slate-200">
                                {clubMeta ? (
                                  <span className="inline-flex items-center gap-2">
                                    <img src={clubMeta.logo} alt={clubMeta.name} className="w-4 h-4 object-contain" />
                                    {clubMeta.name}
                                  </span>
                                ) : (
                                  <span className="text-slate-500">-</span>
                                )}
                              </td>
                              <td className={`py-2.5 px-2 text-right font-bold ${index === 0 ? 'text-primary' : 'text-white'}`}>{row.value}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {isDT && userClub && clubStats.played > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <p className="text-base font-semibold text-white mb-3">Rendimiento de {userClub.name}</p>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">PJ</p><p className="text-xl font-bold text-white">{clubStats.played}</p></div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">V</p><p className="text-xl font-bold text-white">{clubStats.wins}</p></div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">E</p><p className="text-xl font-bold text-white">{clubStats.draws}</p></div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">D</p><p className="text-xl font-bold text-white">{clubStats.losses}</p></div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">GF</p><p className="text-xl font-bold text-white">{clubStats.goalsFor}</p></div>
                    <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3"><p className="text-xs text-slate-400">GC</p><p className="text-xl font-bold text-white">{clubStats.goalsAgainst}</p></div>
                  </div>
                </div>
              )}

            </div>
          )}

          {!loading && activeCup && stageOptions.length === 0 && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-6 text-center text-slate-300">
              Aun no hay fases detectadas en la copa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopaLVZ;
