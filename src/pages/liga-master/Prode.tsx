import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Coins,
  Sparkles,
  Target,
  Trophy,
  Wallet,
  X,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/format';
import { listMatches } from '../../utils/matchService';
import type { Match } from '../../types';
import { getCupStageLabel, isCupTournament } from '../../utils/matchStages';
import {
  createProdeBet,
  deleteProdeBet,
  listProdeBetsByUser,
  settleProdeBet,
  type ProdeBet,
  type ProdeMarket,
type ProdeSelection,
} from '../../utils/prodeService';

type MarketSectionKey = 'match_result' | 'goals_35' | 'first_goal';

const RULES_ACK_KEY = 'virtual_zone_prode_rules_ack_v1';
const MIN_STAKE = 1_000_000;
const MAX_PAYOUT = 25_000_000;
const HIGH_ROLLER_THRESHOLD = 15_000_000;
const HIGH_ROLLER_BONUS = 0.05;

const ODDS_BY_SELECTION: Record<ProdeSelection, number> = {
  home_win: 2.1,
  draw: 3.2,
  away_win: 2.5,
  over_35: 1.9,
  under_35: 1.9,
  first_home: 2.1,
  first_away: 2.4,
  first_none: 8.5,
};

const MARKET_BY_SELECTION: Record<ProdeSelection, ProdeMarket> = {
  home_win: 'match_result',
  draw: 'match_result',
  away_win: 'match_result',
  over_35: 'goals_35',
  under_35: 'goals_35',
  first_home: 'first_goal',
  first_away: 'first_goal',
  first_none: 'first_goal',
};

const LABEL_BY_SELECTION: Record<ProdeSelection, string> = {
  home_win: 'Gana Local',
  draw: 'Empate',
  away_win: 'Gana Visitante',
  over_35: 'Goles +3.5',
  under_35: 'Goles -3.5',
  first_home: 'Primer gol Local',
  first_away: 'Primer gol Visita',
  first_none: 'Primer gol Ninguno',
};

const MARKET_SECTIONS: Array<{
  key: MarketSectionKey;
  label: string;
  accent: string;
  options: ProdeSelection[];
  gridClass: string;
  optionLabel: (opt: ProdeSelection) => string;
}> = [
  {
    key: 'match_result',
    label: 'Resultado Final',
    accent: 'before:bg-primary',
    options: ['home_win', 'draw', 'away_win'],
    gridClass: 'grid-cols-1 sm:grid-cols-3',
    optionLabel: (opt) => (opt === 'home_win' ? 'Local' : opt === 'draw' ? 'Empate' : 'Visita'),
  },
  {
    key: 'goals_35',
    label: 'Goles (Más/Menos)',
    accent: 'before:bg-fuchsia-400',
    options: ['over_35', 'under_35'],
    gridClass: 'grid-cols-2',
    optionLabel: (opt) => (opt === 'over_35' ? '+3.5' : '-3.5'),
  },
  {
    key: 'first_goal',
    label: 'Primer Gol',
    accent: 'before:bg-cyan-400',
    options: ['first_home', 'first_away', 'first_none'],
    gridClass: 'grid-cols-1 sm:grid-cols-3',
    optionLabel: (opt) => (opt === 'first_home' ? '1° Gol Local' : opt === 'first_away' ? '1° Gol Visita' : 'Ninguno'),
  },
];

const normalize = (value: string | undefined) => String(value || '').trim().toLowerCase();
const isPlaceholderTeam = (teamRef: string | undefined) => {
  const value = normalize(teamRef);
  if (!value) return true;
  return value === 'por definir' || value.startsWith('ganador de') || value.startsWith('perdedor de');
};

const selectionWins = (match: Match, selection: ProdeSelection): boolean => {
  if (match.homeScore == null || match.awayScore == null) return false;

  if (selection === 'home_win') return match.homeScore > match.awayScore;
  if (selection === 'draw') return match.homeScore === match.awayScore;
  if (selection === 'away_win') return match.awayScore > match.homeScore;

  if (selection === 'over_35') return match.homeScore + match.awayScore >= 4;
  if (selection === 'under_35') return match.homeScore + match.awayScore <= 3;

  const scorers = (match.scorers || []).slice().sort((a, b) => (a.minute || 0) - (b.minute || 0));
  const firstScorer = scorers.find((s) => Boolean(s.playerName));
  if (!firstScorer) return selection === 'first_none';

  const firstClub = normalize(firstScorer.clubId);
  const home = normalize(match.homeTeam);
  const away = normalize(match.awayTeam);

  if (selection === 'first_home') return firstClub === home;
  if (selection === 'first_away') return firstClub === away;
  return false;
};

const canSettleSelection = (match: Match, selection: ProdeSelection): boolean => {
  if (match.homeScore == null || match.awayScore == null) return false;

  // Result and total-goals markets only need final score.
  if (selection === 'home_win' || selection === 'draw' || selection === 'away_win' || selection === 'over_35' || selection === 'under_35') {
    return true;
  }

  // "First goal: none" can be settled with a confirmed 0-0.
  if (selection === 'first_none') {
    return match.homeScore === 0 && match.awayScore === 0;
  }

  // "First goal: home/away" requires scorer timeline when goals exist.
  const scorers = (match.scorers || []).filter((s) => Boolean(s.playerName));
  return scorers.length > 0;
};

const Prode = () => {
  const { user, hasRole } = useAuthStore();
  const { clubs, tournaments, updateClub } = useDataStore();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bets, setBets] = useState<ProdeBet[]>([]);
  const [isLoadingBets, setIsLoadingBets] = useState(true);
  const [selectedPick, setSelectedPick] = useState<Record<string, ProdeSelection>>({});
  const [selectedStake, setSelectedStake] = useState<Record<string, string>>({});
  const [pendingMatchId, setPendingMatchId] = useState<string | null>(null);
  const [expandedMarkets, setExpandedMarkets] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRules, setShowRules] = useState<boolean>(() => localStorage.getItem(RULES_ACK_KEY) !== '1');
  const settlementRunning = useRef(false);

  const isDT = hasRole('dt');
  const userClub = user?.clubId ? clubs.find((club) => club.id === user.clubId) : null;

  const getTeamDisplayName = (teamRef: string) => {
    const teamNorm = normalize(teamRef);
    const found = clubs.find((club) => normalize(club.id) === teamNorm || normalize(club.name) === teamNorm);
    return found?.name || teamRef;
  };

  const getTeamMeta = (teamRef: string) => {
    const teamNorm = normalize(teamRef);
    const found = clubs.find((club) => normalize(club.id) === teamNorm || normalize(club.name) === teamNorm);
    return {
      name: found?.name || teamRef,
      logo: found?.logo || '/default-club.svg',
    };
  };

  const getMatchRoundLabel = (match: Match) => {
    const tournament = tournaments.find((t) => t.id === match.tournamentId);
    if (isCupTournament(tournament?.type, tournament?.name)) {
      return getCupStageLabel(match.round);
    }
    return `Jornada ${match.round}`;
  };

  const getMatchTournamentName = (match: Match) => {
    const tournament = tournaments.find((t) => t.id === match.tournamentId);
    return tournament?.name || 'Competicion';
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await listMatches();
        if (mounted) setMatches(data);
      } catch (loadError) {
        console.error('Error loading matches for PRODE:', loadError);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadBets = async () => {
      setIsLoadingBets(true);
      try {
        if (!user?.id) {
          if (active) setBets([]);
          return;
        }
        const loaded = await listProdeBetsByUser(user.id);
        if (active) setBets(loaded);
      } catch (loadError) {
        console.error('Error loading PRODE bets:', loadError);
        if (active) setBets([]);
      } finally {
        if (active) setIsLoadingBets(false);
      }
    };

    loadBets();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const userBets = useMemo(() => {
    if (!user?.id) return [];
    return bets.filter((bet) => bet.userId === user.id);
  }, [bets, user?.id]);

  const pendingBets = useMemo(() => userBets.filter((bet) => bet.status === 'pending'), [userBets]);

  const upcomingMatches = useMemo(() => {
    const now = Date.now();
    return matches
      .filter((match) => {
        if (match.status === 'live') return true;
        if (match.status !== 'scheduled' && match.status !== 'upcoming') return false;
        const timestamp = new Date(match.date).getTime();
        return Number.isFinite(timestamp) && timestamp > now;
      })
      .filter((match) => !isPlaceholderTeam(match.homeTeam) && !isPlaceholderTeam(match.awayTeam))
      .sort((a, b) => {
        const aLive = a.status === 'live' ? 1 : 0;
        const bLive = b.status === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 20);
  }, [matches]);

  const recentSettledBets = useMemo(() => {
    return userBets
      .filter((bet) => bet.status !== 'pending')
      .sort((a, b) => new Date(b.settledAt || b.createdAt).getTime() - new Date(a.settledAt || a.createdAt).getTime())
      .slice(0, 8);
  }, [userBets]);

  const totalPendingStake = pendingBets.reduce((sum, bet) => sum + bet.stake, 0);
  const totalWon = userBets.filter((bet) => bet.status === 'won').reduce((sum, bet) => sum + (bet.payout || 0), 0);

  useEffect(() => {
    if (!user?.id || !userClub || settlementRunning.current) return;

    const finished = new Map(matches.filter((m) => m.status === 'finished').map((m) => [m.id, m]));
    const toSettle = userBets.filter((bet) => {
      if (bet.status !== 'pending') return false;
      const endedMatch = finished.get(bet.matchId);
      if (!endedMatch) return false;
      return canSettleSelection(endedMatch, bet.selection);
    });
    if (toSettle.length === 0) return;

    settlementRunning.current = true;

    const settle = async () => {
      let payoutToCredit = 0;
      const nextBets = [...bets];

      for (let i = 0; i < nextBets.length; i += 1) {
        const bet = nextBets[i];
        if (bet.userId !== user.id || bet.status !== 'pending') continue;

        const endedMatch = finished.get(bet.matchId);
        if (!endedMatch) continue;
        if (!canSettleSelection(endedMatch, bet.selection)) continue;

        const won = selectionWins(endedMatch, bet.selection);
        const basePayout = won ? Math.round(bet.stake * bet.odds) : 0;
        const bonus = won && bet.stake > HIGH_ROLLER_THRESHOLD ? Math.round(basePayout * HIGH_ROLLER_BONUS) : 0;
        const payout = Math.min(basePayout + bonus, MAX_PAYOUT);

        const settled = await settleProdeBet(bet.id, won ? 'won' : 'lost', payout);
        if (!settled) continue;

        nextBets[i] = settled;
        if (payout > 0) payoutToCredit += payout;
      }

      setBets(nextBets);

      if (payoutToCredit > 0) {
        try {
          await updateClub({ ...userClub, budget: userClub.budget + payoutToCredit });
          setSuccess(`Se liquidaron apuestas. Cobraste ${formatCurrency(payoutToCredit)}.`);
        } catch (settleError) {
          console.error('Error crediting PRODE payout:', settleError);
          setError('Se liquidaron apuestas, pero no se pudo acreditar el premio. Reintenta.');
        }
      }

      settlementRunning.current = false;
    };

    settle();
  }, [bets, matches, updateClub, user?.id, userBets, userClub]);

  const acknowledgeRules = () => {
    localStorage.setItem(RULES_ACK_KEY, '1');
    setShowRules(false);
  };

  const openRules = () => {
    setShowRules(true);
  };

  const getMarketToken = (matchId: string, key: MarketSectionKey) => `${matchId}:${key}`;

  const isMarketExpanded = (matchId: string, key: MarketSectionKey) => {
    const token = getMarketToken(matchId, key);
    if (!(token in expandedMarkets)) return true;
    return Boolean(expandedMarkets[token]);
  };

  const toggleMarketSection = (matchId: string, key: MarketSectionKey) => {
    const token = getMarketToken(matchId, key);
    setExpandedMarkets((prev) => {
      const current = token in prev ? Boolean(prev[token]) : true;
      return { ...prev, [token]: !current };
    });
  };

  const placeBet = async (match: Match) => {
    if (!user || !userClub) {
      setError('Debes iniciar sesion como DT con club asignado.');
      return;
    }

    const selection = selectedPick[match.id];
    const stakeValue = Number(selectedStake[match.id] || 0);

    setError(null);
    setSuccess(null);

    if (!selection) {
      setError('Selecciona un mercado para apostar.');
      return;
    }

    if (!Number.isFinite(stakeValue) || stakeValue < MIN_STAKE) {
      setError(`La apuesta mínima es ${formatCurrency(MIN_STAKE)}.`);
      return;
    }

    if (stakeValue > userClub.budget) {
      setError('Presupuesto insuficiente para esa apuesta.');
      return;
    }

    const hasPendingBet = userBets.some((bet) => bet.matchId === match.id && bet.status === 'pending');
    if (hasPendingBet) {
      setError('Ya tienes una apuesta pendiente para este partido.');
      return;
    }

    setPendingMatchId(match.id);
    const betId = `prode-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const odds = ODDS_BY_SELECTION[selection];
    const market = MARKET_BY_SELECTION[selection];
    const stakeRounded = Math.round(stakeValue);

    // Update optimista ANTES de la llamada para evitar el flash
    const optimisticBet: ProdeBet = {
      id: betId,
      userId: user.id,
      clubId: userClub.id,
      matchId: match.id,
      tournamentId: match.tournamentId,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      matchDate: match.date,
      market,
      selection,
      odds,
      stake: stakeRounded,
      status: 'pending',
      payout: undefined,
      createdAt: new Date().toISOString(),
    };
    setBets((prev) => [...prev, optimisticBet]);

    let createdBet: ProdeBet | null = null;
    try {
      createdBet = await createProdeBet({
        id: betId,
        userId: user.id,
        clubId: userClub.id,
        matchId: match.id,
        tournamentId: match.tournamentId,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        matchDate: match.date,
        market,
        selection,
        odds,
        stake: stakeRounded,
      });
      // Reemplazar la apuesta optimista con la real (por si hay diferencias de timestamp, etc.)
      setBets((prev) => prev.map((bet) => (bet.id === betId ? createdBet : bet)).filter(Boolean) as ProdeBet[]);
    } catch (createError) {
      console.error('Error creating PRODE bet:', createError);
      // Eliminar la apuesta optimista si falla
      setBets((prev) => prev.filter((bet) => bet.id !== betId));
      setError('No se pudo registrar la apuesta. Intenta nuevamente.');
      setPendingMatchId(null);
      return;
    }

    if (!createdBet) {
      // Eliminar la apuesta optimista si no se creó
      setBets((prev) => prev.filter((bet) => bet.id !== betId));
      setError('No se pudo registrar la apuesta. Intenta nuevamente.');
      setPendingMatchId(null);
      return;
    }

    try {
      await updateClub({ ...userClub, budget: userClub.budget - createdBet.stake });
      setSuccess(`Apuesta registrada: ${LABEL_BY_SELECTION[selection]} por ${formatCurrency(createdBet.stake)}.`);
      setSelectedStake((prev) => ({ ...prev, [match.id]: '' }));
    } catch (updateError) {
      console.error('Error discounting budget after PRODE bet:', updateError);
      await deleteProdeBet(createdBet.id);
      setBets((prev) => prev.filter((item) => item.id !== createdBet.id));
      setError('No se pudo descontar presupuesto. La apuesta fue revertida.');
    } finally {
      setPendingMatchId(null);
    }
  };

  if (!isDT || !userClub) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100">
          <h1 className="text-xl font-bold mb-2">PRODE no disponible</h1>
          <p className="text-sm text-red-200/90">Esta seccion solo esta habilitada para cuentas DT con club asignado.</p>
          <Link to="/liga-master" className="inline-flex mt-4 text-sm font-semibold text-primary hover:underline">
            Volver a Liga Master
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark relative">
      {showRules && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-3xl rounded-xl border border-gray-700 bg-gray-900 text-gray-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-gray-900/90">
              <h3 className="font-bold text-xl text-white flex items-center gap-2">
                <BookOpen size={18} className="text-primary" /> REGLAMENTO OFICIAL
              </h3>
              <button onClick={acknowledgeRules} className="text-gray-400 hover:text-white" aria-label="Cerrar reglamento">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div>
                <p className="text-base font-semibold text-gray-100 mb-2">Mecánica de Juego</p>
                <ul className="text-sm space-y-1 text-gray-300 list-disc pl-5">
                  <li>Sistema de apuesta simple por partido. Cada partido se confirma por separado.</li>
                  <li>Si fallas el pronóstico de un partido, esa apuesta se pierde.</li>
                  <li>Solo una Selección por partido.</li>
                </ul>
              </div>

              <div>
                <p className="text-base font-semibold text-gray-100 mb-2">Explicación de Mercados</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-3 text-sm">
                    <p className="font-semibold text-primary-light">Resultado (1X2)</p>
                    <p className="text-gray-300 mt-1">1: Gana local.</p>
                    <p className="text-gray-300">X: Empate.</p>
                    <p className="text-gray-300">2: Gana visitante.</p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-3 text-sm">
                    <p className="font-semibold text-primary-light">Goles (+/- 3.5)</p>
                    <p className="text-gray-300 mt-1">+3.5: 4 o más goles totales.</p>
                    <p className="text-gray-300">-3.5: 3 o menos goles totales.</p>
                  </div>
                  <div className="rounded-lg border border-gray-700 bg-gray-800/60 p-3 text-sm">
                    <p className="font-semibold text-primary-light">Primer Gol</p>
                    <p className="text-gray-300 mt-1">¿Qué equipo anotará primero? (Local, Visita o Ninguno si 0-0).</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-base font-semibold text-gray-100 mb-2">Pagos y límites</p>
                <div className="rounded-lg border border-gray-700 overflow-hidden text-sm">
                  <div className="flex justify-between px-3 py-2 bg-gray-800/70 border-b border-gray-700">
                    <span className="text-gray-300">Apuesta Minima</span>
                    <span className="font-semibold text-white">{formatCurrency(MIN_STAKE)}</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-gray-800/40 border-b border-gray-700">
                    <span className="text-gray-300">Tope Maximo</span>
                    <span className="font-semibold text-primary-light">{formatCurrency(MAX_PAYOUT)} (pago máximo)</span>
                  </div>
                  <div className="flex justify-between px-3 py-2 bg-gray-800/40">
                    <span className="text-gray-300">Bono High-Roller</span>
                    <span className="font-semibold text-primary-light">+5% extra si apuestas &gt; {formatCurrency(HIGH_ROLLER_THRESHOLD)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-900/90">
              <button onClick={acknowledgeRules} className="w-full py-3 rounded-lg bg-primary hover:bg-primary-light text-white font-semibold transition-colors">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <PageHeader
        title="PRODE DT"
        subtitle="¡Poné a prueba tu lectura del partido! Elegí ganador, goles o primer gol. Si acertás, cobrás; tope por apuesta: 25.000.000 €."
        image="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1600&q=80"
      />

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openRules}
            className="inline-flex items-center gap-2 rounded-lg border border-primary/50 bg-gray-900/70 px-4 py-2 text-sm font-semibold text-primary-light hover:bg-gray-800 transition-colors"
          >
            <BookOpen size={16} />
            Ver reglamento
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-700/80 bg-gray-800/70 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Presupuesto actual</p>
            <p className="text-xl font-bold text-white flex items-center gap-2">
              <Wallet size={18} className="text-primary-light" />
              {formatCurrency(userClub.budget)}
            </p>
          </div>
          <div className="rounded-xl border border-gray-700/80 bg-gray-800/70 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">En juego</p>
            <p className="text-xl font-bold text-amber-200">{formatCurrency(totalPendingStake)}</p>
            <p className="text-xs text-gray-500 mt-1">{pendingBets.length} apuestas pendientes</p>
          </div>
          <div className="rounded-xl border border-gray-700/80 bg-gray-800/70 p-4 shadow-sm">
            <p className="text-xs text-gray-400 mb-1">Cobrado historico</p>
            <p className="text-xl font-bold text-emerald-300">{formatCurrency(totalWon)}</p>
            <p className="text-xs text-gray-500 mt-1">Incluye retorno y bonus high-roller</p>
          </div>
        </div>

        {(error || success) && (
          <div className={`rounded-xl border p-4 text-sm ${error ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
            {error || success}
          </div>
        )}

        <div className="rounded-2xl border border-gray-700/80 bg-gray-800/65 p-5 md:p-6 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                Partidos para apostar
              </h2>
              <p className="text-xs text-gray-400 mt-1">Selecciona un mercado por partido y confirma tu apuesta.</p>
            </div>
            <span className="text-xs text-gray-200 rounded-lg border border-gray-600 bg-gray-800/70 px-3 py-1.5">
              Min {formatCurrency(MIN_STAKE)} | Pago max {formatCurrency(MAX_PAYOUT)}
            </span>
          </div>

          {(isLoading || isLoadingBets) && <p className="text-sm text-gray-400">Cargando partidos y apuestas...</p>}
          {!isLoading && !isLoadingBets && upcomingMatches.length === 0 && (
            <p className="text-sm text-gray-400">No hay partidos disponibles para apostar en este momento.</p>
          )}

          <div className="space-y-3">
            {!isLoading && !isLoadingBets && upcomingMatches.map((match) => {
              const alreadyPending = pendingMatchId === match.id || pendingBets.some((bet) => bet.matchId === match.id);
              const existingBet = pendingBets.find((bet) => bet.matchId === match.id) || (pendingMatchId === match.id ? bets.find((bet) => bet.matchId === match.id && bet.status === 'pending') : null);
              const homeTeam = getTeamMeta(match.homeTeam);
              const awayTeam = getTeamMeta(match.awayTeam);
              const pick = selectedPick[match.id];
              const typedStake = Number(selectedStake[match.id] || 0);
              const selectedOdds = pick ? ODDS_BY_SELECTION[pick] : null;
              const basePayout = selectedOdds && typedStake > 0 ? Math.round(typedStake * selectedOdds) : 0;
              const bonus = typedStake > HIGH_ROLLER_THRESHOLD ? Math.round(basePayout * HIGH_ROLLER_BONUS) : 0;
              const estimatedPayout = basePayout + bonus;
              const canSubmit = Boolean(pick) && Number.isFinite(typedStake) && typedStake >= MIN_STAKE && typedStake <= userClub.budget;

              let submitHint = '';
              if (!pick) submitHint = 'Elige una opcion de mercado para continuar.';
              else if (!typedStake) submitHint = 'Ingresa un monto para habilitar la apuesta.';
              else if (typedStake < MIN_STAKE) submitHint = `Monto minimo: ${formatCurrency(MIN_STAKE)}.`;
              else if (typedStake > userClub.budget) submitHint = 'No tienes presupuesto suficiente para este monto.';
              else if (estimatedPayout >= MAX_PAYOUT) submitHint = `Pago tope aplicado: ${formatCurrency(MAX_PAYOUT)}.`;
              else submitHint = 'Listo para confirmar tu apuesta.';

              return (
                <div key={match.id} className="rounded-xl border border-gray-700/80 bg-gray-800/55 p-4 space-y-3 hover:border-gray-500 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={homeTeam.logo}
                            alt={homeTeam.name}
                            className="w-9 h-9 rounded-md object-cover border border-gray-600"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-club.svg';
                            }}
                          />
                          <span className="text-lg font-semibold text-white truncate">{homeTeam.name}</span>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">vs</span>
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={awayTeam.logo}
                            alt={awayTeam.name}
                            className="w-9 h-9 rounded-md object-cover border border-gray-600"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/default-club.svg';
                            }}
                          />
                          <span className="text-lg font-semibold text-white truncate">{awayTeam.name}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 flex flex-wrap items-center gap-2">
                        <Calendar size={12} className="text-primary" />
                        <span>{formatDate(match.date)} - {getMatchRoundLabel(match)}</span>
                        <span className="text-gray-600">•</span>
                        <span className="px-2 py-0.5 rounded-md border border-gray-600 bg-gray-800/75 text-gray-200">
                          {getMatchTournamentName(match)}
                        </span>
                      </div>
                    </div>
                    <span className={`w-fit text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${match.status === 'live' ? 'border-red-500/40 bg-red-500/15 text-red-200' : 'border-primary/40 bg-primary/15 text-primary-light'}`}>
                      {match.status === 'live' ? 'En vivo' : 'Programado'}
                    </span>
                  </div>

                  {alreadyPending ? (
                    <div className="inline-flex w-fit text-xs rounded-md px-3 py-2 border border-amber-500/30 bg-amber-500/10 text-amber-200">
                      Pendiente: {existingBet ? LABEL_BY_SELECTION[existingBet.selection] : 'Selección'} ({formatCurrency(existingBet?.stake || 0)})
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2.5">
                        {MARKET_SECTIONS.map((section) => {
                          const sectionExpanded = isMarketExpanded(match.id, section.key);
                          return (
                            <section key={section.key} className="rounded-lg border border-gray-600/80 bg-gray-800/65 overflow-hidden">
                              <button
                                type="button"
                                onClick={() => toggleMarketSection(match.id, section.key)}
                                className={`relative w-full flex items-center justify-between px-3 py-2.5 text-left bg-gray-800/70 hover:bg-gray-700/70 transition-colors before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 ${section.accent}`}
                              >
                                <span className="text-sm font-semibold text-gray-100">{section.label}</span>
                                {sectionExpanded ? <ChevronUp size={14} className="text-primary-light" /> : <ChevronDown size={14} className="text-primary-light" />}
                              </button>

                              {sectionExpanded && (
                                <div className={`grid ${section.gridClass} gap-2 p-2.5`}>
                                  {section.options.map((opt) => (
                                    <button
                                      key={opt}
                                      type="button"
                                      onClick={() => setSelectedPick((prev) => ({ ...prev, [match.id]: opt }))}
                                      className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition-all ${
                                        pick === opt
                                          ? 'border-amber-400/70 bg-gradient-to-b from-amber-300 to-amber-500 text-gray-950 shadow-[0_6px_16px_rgba(251,191,36,0.25)]'
                                          : 'border-gray-600 bg-gray-800/85 text-gray-200 hover:border-gray-400'
                                      }`}
                                    >
                                      <span className="flex items-center justify-between gap-2">
                                        <span className="uppercase tracking-wide text-[11px] opacity-90">{section.optionLabel(opt)}</span>
                                        <span className="inline-flex items-center gap-1 text-xs">
                                          {pick === opt && <CheckCircle2 size={12} className="text-gray-900" />}
                                          x{ODDS_BY_SELECTION[opt]}
                                        </span>
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </section>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr] gap-3 rounded-xl border border-gray-700/80 bg-gray-800/45 p-3.5">
                        <div className="space-y-2">
                          <label className="text-[11px] text-gray-400 uppercase tracking-wide">Monto</label>
                          <div className="flex items-center rounded-xl border border-primary/40 bg-primary/10 px-3 py-0.5">
                            <span className="text-primary-light text-base font-bold pr-2">$</span>
                            <input
                              type="number"
                              min={MIN_STAKE}
                              className="w-full bg-transparent border-none outline-none text-white text-lg font-semibold py-1.5 placeholder:text-gray-400"
                              placeholder="Ej: 5.000.000"
                              value={selectedStake[match.id] || ''}
                              onChange={(e) => setSelectedStake((prev) => ({ ...prev, [match.id]: e.target.value }))}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {[1_000_000, 5_000_000, 15_000_000].map((quickAmount) => (
                              <button
                                key={quickAmount}
                                type="button"
                                onClick={() => setSelectedStake((prev) => ({ ...prev, [match.id]: quickAmount.toString() }))}
                                className="text-[11px] px-2 py-1 rounded-md border border-gray-600 bg-gray-800/85 text-gray-200 hover:border-gray-400 hover:text-white transition-colors"
                              >
                                {formatCurrency(quickAmount)}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 lg:pt-6">
                          <div className="rounded-lg border border-gray-500/80 bg-gray-700/55 px-3 py-2 text-xs">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-300">
                              <span>
                                Selección: <span className="font-semibold text-white">{pick ? LABEL_BY_SELECTION[pick] : 'Sin elegir'}</span>
                              </span>
                              <span className="hidden sm:inline text-gray-500">|</span>
                              <span>
                                Apuesta: <span className="font-semibold text-white">{formatCurrency(typedStake || 0)}</span>
                              </span>
                              {selectedOdds ? (
                                <>
                                  <span className="hidden sm:inline text-gray-500">|</span>
                                  <span>
                                    Cuota: <span className="font-semibold text-primary-light">x{selectedOdds.toFixed(1)}</span>
                                  </span>
                                  <span className="hidden sm:inline text-gray-500">|</span>
                                  <span>
                                    Cobro: <span className="font-semibold text-emerald-300">{formatCurrency(estimatedPayout)}</span>
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>

                          {typedStake > HIGH_ROLLER_THRESHOLD && (
                            <p className="text-emerald-300 text-xs flex items-center gap-1">
                              <Coins size={12} /> Bono high-roller +5% aplicado.
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:pt-0.5">
                            <p className={`text-[11px] ${canSubmit ? 'text-emerald-300' : 'text-gray-500'}`}>
                              {submitHint}
                            </p>
                            <button
                              type="button"
                              className={`px-5 py-2.5 rounded-lg whitespace-nowrap text-sm font-semibold transition-colors ${canSubmit ? 'btn-primary shadow-[0_0_14px_rgba(99,102,241,0.3)]' : 'border border-gray-600 bg-gray-800/70 text-gray-500 cursor-not-allowed'}`}
                              onClick={() => placeBet(match)}
                              disabled={pendingMatchId === match.id || !canSubmit}
                            >
                              {pendingMatchId === match.id ? 'Procesando...' : 'Confirmar apuesta'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-700/80 bg-gray-800/65 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-yellow-400" />
            <h2 className="text-lg font-bold text-white">Historial reciente</h2>
          </div>

          {recentSettledBets.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no tienes apuestas liquidadas.</p>
          ) : (
            <div className="space-y-2">
              {recentSettledBets.map((bet) => (
                <div key={bet.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-gray-700/80 bg-gray-800/55 p-3">
                  <div>
                    <p className="text-sm text-white">{getTeamDisplayName(bet.homeTeam)} vs {getTeamDisplayName(bet.awayTeam)}</p>
                    <p className="text-xs text-gray-400">Apuesta: {LABEL_BY_SELECTION[bet.selection]} - Monto {formatCurrency(bet.stake)}</p>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${bet.status === 'won' ? 'text-emerald-200 border-emerald-500/30 bg-emerald-500/15' : 'text-red-200 border-red-500/30 bg-red-500/15'}`}>
                    {bet.status === 'won' ? `Ganada +${formatCurrency(bet.payout || 0)}` : `Pérdida -${formatCurrency(bet.stake)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100 flex items-start gap-2">
          <AlertTriangle size={14} className="mt-0.5 text-amber-300" />
          Se aplica una Selección por partido. Apuesta mínima {formatCurrency(MIN_STAKE)}, pago máximo {formatCurrency(MAX_PAYOUT)} por apuesta y bono +5% si superas {formatCurrency(HIGH_ROLLER_THRESHOLD)}.
        </div>
      </div>
    </div>
  );
};

export default Prode;

