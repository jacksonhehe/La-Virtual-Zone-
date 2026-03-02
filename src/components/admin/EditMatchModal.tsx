import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { Match, Scorer, Card, MatchStats } from '../../types';
import { useDataStore } from '../../store/dataStore';
import { extractYouTubeVideoId, getYouTubeWatchUrl } from '../../utils/youtube';
import { CUP_STAGE_OPTIONS, isCupTournament } from '../../utils/matchStages';

interface EditMatchModalProps {
  match: Match & { tournamentName?: string; tournamentType?: string };
  onClose: () => void;
  onSave: (data: Partial<Match>) => void | Promise<void>;
  teams: string[];
}

type EditableScorer = {
  rowId: string;
  playerId: string;
  playerName: string;
  clubId: string;
  minute: string;
  assistPlayerName?: string;
  ownGoal?: boolean;
};

type EditableCard = {
  rowId: string;
  playerId: string;
  playerName: string;
  clubId: string;
  minute: string;
  type: 'yellow' | 'red';
};

type StatKey = keyof MatchStats;
type EditableStats = Record<StatKey, { home: string; away: string }>;
type MatchQualifiedTeam = 'home' | 'away';

const STAT_FIELDS: Array<{ key: StatKey; label: string }> = [
  { key: 'possession', label: 'Posesion (%)' },
  { key: 'shotsTotal', label: 'Tiros Total' },
  { key: 'shotsOnTarget', label: 'Al Arco' },
  { key: 'passes', label: 'Pases' },
  { key: 'tackles', label: 'Entradas' },
  { key: 'corners', label: 'Corners' },
  { key: 'fouls', label: 'Faltas' },
];

const emptyStats = (): EditableStats => ({
  possession: { home: '', away: '' },
  shotsTotal: { home: '', away: '' },
  shotsOnTarget: { home: '', away: '' },
  passes: { home: '', away: '' },
  tackles: { home: '', away: '' },
  corners: { home: '', away: '' },
  fouls: { home: '', away: '' },
});

const EditMatchModal = ({ match, onClose, onSave, teams }: EditMatchModalProps) => {
  const { players, clubs } = useDataStore();
  const [date, setDate] = useState<string>('');
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [homeScore, setHomeScore] = useState<string>('');
  const [awayScore, setAwayScore] = useState<string>('');
  const [status, setStatus] = useState<'scheduled' | 'live' | 'finished'>('scheduled');
  const [round, setRound] = useState<number>(1);
  const [scorers, setScorers] = useState<EditableScorer[]>([]);
  const [cards, setCards] = useState<EditableCard[]>([]);
  const [youtubeInput, setYoutubeInput] = useState<string>('');
  const [playerOfTheMatch, setPlayerOfTheMatch] = useState<string>('');
  const [stats, setStats] = useState<EditableStats>(emptyStats);
  const [isPenalties, setIsPenalties] = useState(false);
  const [qualifiedTeam, setQualifiedTeam] = useState<MatchQualifiedTeam | ''>('');
  const [penaltyHomeScore, setPenaltyHomeScore] = useState<string>('');
  const [penaltyAwayScore, setPenaltyAwayScore] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCupMode = isCupTournament(match.tournamentType, match.tournamentName);
  const allowUndecidedTeams = isCupMode && round >= 2;
  const resultPreview = useMemo(() => {
    const homeBase = homeScore === '' ? '-' : homeScore;
    const awayBase = awayScore === '' ? '-' : awayScore;
    const homePens = penaltyHomeScore === '' ? '?' : penaltyHomeScore;
    const awayPens = penaltyAwayScore === '' ? '?' : penaltyAwayScore;

    if (status === 'finished' && isPenalties) {
      return `${homeBase} (${homePens}) - (${awayPens}) ${awayBase}`;
    }

    return `${homeBase} - ${awayBase}`;
  }, [awayScore, homeScore, isPenalties, penaltyAwayScore, penaltyHomeScore, status]);

  const teamOptions = useMemo(() => {
    const set = new Set<string>(teams);
    if (homeTeam) set.add(homeTeam);
    if (awayTeam) set.add(awayTeam);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [teams, homeTeam, awayTeam]);

  const clubIdByName = useMemo(() => {
    const map = new Map<string, string>();
    clubs.forEach((c) => map.set(c.name, c.id));
    return map;
  }, [clubs]);

  const playersByTeam = useMemo(() => {
    const grouped: Record<string, typeof players> = {};
    clubs.forEach((club) => {
      grouped[club.name] = players.filter((p) => p.clubId === club.id);
    });
    return grouped;
  }, [players, clubs]);

  const getPlayersForTeam = (teamName: string) => playersByTeam[teamName] || [];

  useEffect(() => {
    // Formatear fecha para input datetime-local
    const matchDate = new Date(match.date);
    const localDate = new Date(matchDate.getTime() - matchDate.getTimezoneOffset() * 60000);
    setDate(localDate.toISOString().slice(0, 16));
    setHomeTeam(match.homeTeam);
    setAwayTeam(match.awayTeam);
    setHomeScore(match.homeScore != null ? match.homeScore.toString() : '');
    setAwayScore(match.awayScore != null ? match.awayScore.toString() : '');
    setStatus(match.status || 'scheduled');
    setRound(Math.max(1, match.round || 1));
    setYoutubeInput(match.youtubeVideoId ? getYouTubeWatchUrl(match.youtubeVideoId) : '');
    setPlayerOfTheMatch(match.playerOfTheMatch || '');
    setIsPenalties(match.decidedBy === 'penalties');
    setQualifiedTeam(match.qualifiedTeam || '');
    setPenaltyHomeScore(match.penaltyHomeScore != null ? String(match.penaltyHomeScore) : '');
    setPenaltyAwayScore(match.penaltyAwayScore != null ? String(match.penaltyAwayScore) : '');
    setStats({
      possession: {
        home: match.matchStats?.possession?.home?.toString() || '',
        away: match.matchStats?.possession?.away?.toString() || '',
      },
      shotsTotal: {
        home: match.matchStats?.shotsTotal?.home?.toString() || '',
        away: match.matchStats?.shotsTotal?.away?.toString() || '',
      },
      shotsOnTarget: {
        home: match.matchStats?.shotsOnTarget?.home?.toString() || '',
        away: match.matchStats?.shotsOnTarget?.away?.toString() || '',
      },
      passes: {
        home: match.matchStats?.passes?.home?.toString() || '',
        away: match.matchStats?.passes?.away?.toString() || '',
      },
      tackles: {
        home: match.matchStats?.tackles?.home?.toString() || '',
        away: match.matchStats?.tackles?.away?.toString() || '',
      },
      corners: {
        home: match.matchStats?.corners?.home?.toString() || '',
        away: match.matchStats?.corners?.away?.toString() || '',
      },
      fouls: {
        home: match.matchStats?.fouls?.home?.toString() || '',
        away: match.matchStats?.fouls?.away?.toString() || '',
      },
    });
    setScorers(
      (match.scorers || []).map((scorer, index) => ({
        rowId: `scorer-row-${index}-${scorer.playerId || scorer.playerName || 'saved'}`,
        playerId: scorer.playerId || `scorer-${index}`,
        playerName: scorer.playerName || '',
        clubId: scorer.clubId || match.homeTeam,
        minute: scorer.minute != null ? scorer.minute.toString() : '',
        assistPlayerName: scorer.assistPlayerName || '',
        ownGoal: scorer.ownGoal || false,
      }))
    );
    setCards(
      (match.cards || []).map((card, index) => ({
        rowId: `card-row-${index}-${card.playerId || card.playerName || 'saved'}`,
        playerId: card.playerId || `card-${index}`,
        playerName: card.playerName || '',
        clubId: card.clubId || match.homeTeam,
        minute: card.minute != null ? card.minute.toString() : '',
        type: card.type || 'yellow',
      }))
    );
  }, [match]);

  const handleAddScorer = () => {
    const defaultClub = homeTeam || teams[0] || '';
    setScorers((prev) => [
      ...prev,
      {
        rowId: `scorer-row-new-${Date.now()}`,
        playerId: `temp-${Date.now()}`,
        playerName: '',
        clubId: defaultClub,
        minute: '',
        assistPlayerName: '',
        ownGoal: false,
      },
    ]);
  };

  const handleScorerChange = (
    index: number,
    field: 'playerName' | 'clubId' | 'minute' | 'assistPlayerName',
    value: string
  ) => {
    setScorers((prev) =>
      prev.map((scorer, i) =>
        i === index
          ? {
            ...scorer,
            [field]: value,
            ...(field === 'clubId' ? { playerId: '', playerName: '' } : {}),
          }
          : scorer
      )
    );
  };

  const handleScorerOwnGoal = (index: number, value: boolean) => {
    setScorers((prev) =>
      prev.map((scorer, i) => (i === index ? { ...scorer, ownGoal: value } : scorer))
    );
  };

  const handleRemoveScorer = (index: number) => {
    setScorers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScorerPlayerSelect = (index: number, playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    setScorers((prev) =>
      prev.map((scorer, i) =>
        i === index
          ? {
              ...scorer,
              playerId: player.id,
              playerName: player.name,
              clubId: scorer.clubId || clubs.find((c) => c.id === player.clubId)?.name || scorer.clubId,
            }
          : scorer
      )
    );
  };

  const handleAddCard = () => {
    const defaultClub = homeTeam || teams[0] || '';
    setCards((prev) => [
      ...prev,
      {
        rowId: `card-row-new-${Date.now()}`,
        playerId: `card-${Date.now()}`,
        playerName: '',
        clubId: defaultClub,
        minute: '',
        type: 'yellow',
      },
    ]);
  };

  const handleCardChange = (
    index: number,
    field: 'playerName' | 'clubId' | 'minute' | 'type',
    value: string
  ) => {
    setCards((prev) =>
      prev.map((card, i) =>
        i === index
          ? {
              ...card,
              [field]: value,
              ...(field === 'clubId' ? { playerId: '', playerName: '' } : {}),
            }
          : card
      )
    );
  };

  const handleRemoveCard = (index: number) => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCardPlayerSelect = (index: number, playerId: string) => {
    const player = players.find((p) => p.id === playerId);
    if (!player) return;
    setCards((prev) =>
      prev.map((card, i) =>
        i === index
          ? {
              ...card,
              playerId: player.id,
              playerName: player.name,
              clubId: card.clubId || clubs.find((c) => c.id === player.clubId)?.name || card.clubId,
            }
          : card
      )
    );
  };

  const handleAutoFillScoresFromScorers = () => {
    let homeGoals = 0;
    let awayGoals = 0;
    scorers.forEach((s) => {
      if (!s.playerName.trim()) return;
      const isHome = s.clubId === homeTeam;
      const isAway = s.clubId === awayTeam;
      if (isHome && s.ownGoal) {
        awayGoals += 1;
      } else if (isAway && s.ownGoal) {
        homeGoals += 1;
      } else if (isHome) {
        homeGoals += 1;
      } else if (isAway) {
        awayGoals += 1;
      }
    });
    setHomeScore(homeGoals.toString());
    setAwayScore(awayGoals.toString());
  };

  const handleStatChange = (key: StatKey, side: 'home' | 'away', value: string) => {
    const sanitized = value.replace(/[^\d]/g, '');
    setStats((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [side]: sanitized,
      },
    }));
  };

  const toNonNegative = (value: string) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);

    if (!date || (!allowUndecidedTeams && (!homeTeam || !awayTeam))) {
      setError('Completa fecha y equipos');
      return;
    }

    if (homeTeam && awayTeam && homeTeam === awayTeam) {
      setError('Los equipos deben ser distintos');
      return;
    }

    if (status === 'finished' && (homeScore === '' || awayScore === '')) {
      setError('Los partidos finalizados deben tener resultado');
      return;
    }

    const parsedHomeScore = homeScore !== '' ? parseInt(homeScore, 10) : undefined;
    const parsedAwayScore = awayScore !== '' ? parseInt(awayScore, 10) : undefined;
    const isTie = status === 'finished' && parsedHomeScore != null && parsedAwayScore != null && parsedHomeScore === parsedAwayScore;

    if (status === 'finished' && isPenalties && !isTie) {
      setError('Si se define por penales, el marcador debe quedar empatado.');
      return;
    }

    if (status === 'finished' && isPenalties && !qualifiedTeam) {
      setError('Selecciona el clasificado por penales (local o visitante).');
      return;
    }

    if (status === 'finished' && isPenalties && (penaltyHomeScore === '' || penaltyAwayScore === '')) {
      setError('Completa el resultado de la tanda de penales.');
      return;
    }

    const parsedPenaltyHomeScore = penaltyHomeScore !== '' ? parseInt(penaltyHomeScore, 10) : undefined;
    const parsedPenaltyAwayScore = penaltyAwayScore !== '' ? parseInt(penaltyAwayScore, 10) : undefined;

    if (status === 'finished' && isPenalties && parsedPenaltyHomeScore === parsedPenaltyAwayScore) {
      setError('La tanda de penales no puede terminar empatada.');
      return;
    }

    if (
      status === 'finished' &&
      isPenalties &&
      parsedPenaltyHomeScore != null &&
      parsedPenaltyAwayScore != null &&
      qualifiedTeam
    ) {
      const winnerByPens = parsedPenaltyHomeScore > parsedPenaltyAwayScore ? 'home' : 'away';
      if (winnerByPens !== qualifiedTeam) {
        setError('El clasificado no coincide con el resultado de los penales.');
        return;
      }
    }

    if (status === 'finished' && isCupMode && isTie && !isPenalties) {
      setError('Si termina empatado en copa, marca que se definio por penales.');
      return;
    }

    if (status === 'finished' && isCupMode && isTie && !qualifiedTeam) {
      setError('En partidos de copa empatados por penales debes indicar quien clasifico.');
      return;
    }

    if ((status === 'live' || status === 'finished') && scorers.some((s) => s.playerName.trim() && s.minute === '')) {
      setError('Completa minuto y goleador para cada gol registrado');
      return;
    }

    if ((status === 'live' || status === 'finished') && cards.some((c) => c.playerName.trim() && c.minute === '')) {
      setError('Completa minuto y jugador para cada tarjeta registrada');
      return;
    }

    const updateData: Partial<Match> = {
      date: new Date(date).toISOString(),
      homeTeam,
      awayTeam,
      status,
      round,
    };

    if (youtubeInput.trim()) {
      const youtubeVideoId = extractYouTubeVideoId(youtubeInput);
      if (!youtubeVideoId) {
        setError('El enlace de YouTube no es valido. Pega una URL o ID correcto.');
        return;
      }
      updateData.youtubeVideoId = youtubeVideoId;
    } else {
      updateData.youtubeVideoId = undefined;
    }

    updateData.playerOfTheMatch = playerOfTheMatch.trim() || undefined;
    updateData.decidedBy = status === 'finished' && isPenalties ? 'penalties' : undefined;
    updateData.qualifiedTeam = status === 'finished' && isPenalties ? (qualifiedTeam || undefined) : undefined;
    updateData.penaltyHomeScore = status === 'finished' && isPenalties ? parsedPenaltyHomeScore : undefined;
    updateData.penaltyAwayScore = status === 'finished' && isPenalties ? parsedPenaltyAwayScore : undefined;

    if (status === 'finished' || status === 'live') {
      updateData.matchStats = {
        possession: { home: toNonNegative(stats.possession.home), away: toNonNegative(stats.possession.away) },
        shotsTotal: { home: toNonNegative(stats.shotsTotal.home), away: toNonNegative(stats.shotsTotal.away) },
        shotsOnTarget: { home: toNonNegative(stats.shotsOnTarget.home), away: toNonNegative(stats.shotsOnTarget.away) },
        passes: { home: toNonNegative(stats.passes.home), away: toNonNegative(stats.passes.away) },
        tackles: { home: toNonNegative(stats.tackles.home), away: toNonNegative(stats.tackles.away) },
        corners: { home: toNonNegative(stats.corners.home), away: toNonNegative(stats.corners.away) },
        fouls: { home: toNonNegative(stats.fouls.home), away: toNonNegative(stats.fouls.away) },
      };

      updateData.homeScore = homeScore !== '' ? parseInt(homeScore, 10) : undefined;
      updateData.awayScore = awayScore !== '' ? parseInt(awayScore, 10) : undefined;
      const cleanedScorers: Scorer[] = scorers
        .filter((s) => s.playerName.trim())
        .map((s, idx) => ({
          playerId: s.playerId || `goal-${match.id}-${idx}`,
          playerName: s.playerName.trim(),
          clubId: s.clubId,
          minute: Math.max(0, parseInt(s.minute, 10) || 0),
          assistPlayerName: s.assistPlayerName?.trim() || undefined,
          ownGoal: s.ownGoal || false,
        }));
      updateData.scorers = cleanedScorers;

      const cleanedCards: Card[] = cards
        .filter((c) => c.playerName.trim())
        .map((c, idx) => ({
          playerId: c.playerId || `card-${match.id}-${idx}`,
          playerName: c.playerName.trim(),
          clubId: c.clubId,
          minute: Math.max(0, parseInt(c.minute, 10) || 0),
          type: c.type === 'red' ? 'red' : 'yellow',
        }));
      updateData.cards = cleanedCards;
    } else {
      updateData.homeScore = undefined;
      updateData.awayScore = undefined;
      updateData.scorers = [];
      updateData.cards = [];
      updateData.matchStats = undefined;
      updateData.decidedBy = undefined;
      updateData.qualifiedTeam = undefined;
      updateData.penaltyHomeScore = undefined;
      updateData.penaltyAwayScore = undefined;
    }

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSave(updateData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="absolute inset-0" onClick={() => (!isSubmitting ? onClose() : null)}></div>
      <div className="relative bg-dark-light rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-700 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-gray-900">
          <div>
            <h3 className="text-xl font-bold text-white">Editar partido</h3>
            {match.tournamentName && <p className="text-sm text-gray-400">Torneo: {match.tournamentName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-800"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha y hora</label>
            <input
              type="datetime-local"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Equipo local</label>
            <select
              className="input w-full"
              value={homeTeam}
              onChange={(e) => setHomeTeam(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">{allowUndecidedTeams ? 'Por definir' : 'Selecciona equipo local'}</option>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Equipo visitante</label>
            <select
              className="input w-full"
              value={awayTeam}
              onChange={(e) => setAwayTeam(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="">{allowUndecidedTeams ? 'Por definir' : 'Selecciona equipo visitante'}</option>
              {teamOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">{isCupMode ? 'Fase' : 'Jornada'}</label>
            {isCupMode ? (
              <select
                className="input w-full"
                value={round}
                onChange={(e) => setRound(parseInt(e.target.value, 10) || 1)}
                disabled={isSubmitting}
              >
                {CUP_STAGE_OPTIONS.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="number"
                className="input w-full"
                value={round}
                onChange={(e) => setRound(parseInt(e.target.value, 10) || 1)}
                min="1"
                required
                disabled={isSubmitting}
              />
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select
              className="input w-full"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'scheduled' | 'live' | 'finished')}
              required
              disabled={isSubmitting}
            >
              <option value="scheduled">Programado</option>
              <option value="live">En vivo</option>
              <option value="finished">Finalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Video de YouTube (opcional)</label>
            <input
              type="text"
              className="input w-full"
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... o ID del video"
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">Se mostrara en Fixture y Resultados para este partido.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Jugador del Partido (opcional)</label>
            <input
              type="text"
              className="input w-full"
              value={playerOfTheMatch}
              onChange={(e) => setPlayerOfTheMatch(e.target.value)}
              placeholder="Ej: Moussa Marega"
              disabled={isSubmitting}
            />
          </div>

          {(status === 'live' || status === 'finished') && (
            <div className="rounded-lg border border-gray-700 p-4 bg-gray-900/70">
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-white">Estadisticas del partido</h4>
                <p className="text-xs text-gray-500">Carga: Posesion, Tiros Total, Al Arco, Pases, Entradas, Corners y Faltas.</p>
              </div>
              <div className="space-y-2">
                {STAT_FIELDS.map((field) => (
                  <div key={field.key} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="number"
                      min="0"
                      className="input col-span-4 sm:col-span-3"
                      placeholder="Local"
                      value={stats[field.key].home}
                      onChange={(e) => handleStatChange(field.key, 'home', e.target.value)}
                    />
                    <div className="col-span-4 sm:col-span-6 text-center text-xs sm:text-sm text-gray-300 font-medium">
                      {field.label}
                    </div>
                    <input
                      type="number"
                      min="0"
                      className="input col-span-4 sm:col-span-3"
                      placeholder="Visit."
                      value={stats[field.key].away}
                      onChange={(e) => handleStatChange(field.key, 'away', e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(status === 'live' || status === 'finished') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Goles local</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    min="0"
                    required={status === 'finished'}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Goles visitante</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    min="0"
                    required={status === 'finished'}
                  />
                </div>
              </div>

              {status === 'finished' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Se definio por penales?</label>
                      <select
                        className="input w-full"
                        value={isPenalties ? 'penalties' : ''}
                        onChange={(e) => setIsPenalties(e.target.value === 'penalties')}
                      >
                        <option value="">No</option>
                        <option value="penalties">Si</option>
                      </select>
                    </div>
                  </div>

                  {isPenalties && (
                    <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-4 space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-white">Tanda de penales</h4>
                        <p className="text-xs text-gray-500">Ejemplo: si termina 2-2 y la tanda es 5-3, se mostrara 2 (5) - (3) 2.</p>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Clasificado por penales</label>
                        <select
                          className="input w-full"
                          value={qualifiedTeam}
                          onChange={(e) => setQualifiedTeam(e.target.value as MatchQualifiedTeam | '')}
                        >
                          <option value="">Selecciona</option>
                          <option value="home">{homeTeam || 'Local'}</option>
                          <option value="away">{awayTeam || 'Visitante'}</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Penales local</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={penaltyHomeScore}
                            onChange={(e) => setPenaltyHomeScore(e.target.value)}
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-400 mb-1">Penales visitante</label>
                          <input
                            type="number"
                            className="input w-full"
                            value={penaltyAwayScore}
                            onChange={(e) => setPenaltyAwayScore(e.target.value)}
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-md border border-gray-700 bg-gray-900/60 p-3 text-sm text-gray-300">
                    <span className="text-gray-400">Resultado mostrado: </span>
                    <span className="font-semibold text-white">{resultPreview}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-gray-400">Detalle de goles</label>
                  <div className="flex gap-2">
                    <button type="button" className="btn-outline text-sm px-3 py-1" onClick={handleAutoFillScoresFromScorers}>
                      Calcular marcador
                    </button>
                    <button type="button" className="btn-outline text-sm px-3 py-1" onClick={handleAddScorer}>
                      Agregar gol
                    </button>
                  </div>
                </div>

                {scorers.length === 0 && (
                  <p className="text-sm text-gray-500">Agrega cada gol con su minuto, goleador y asistencia.</p>
                )}

                {scorers.map((scorer, index) => (
                  <div key={scorer.rowId} className="p-3 bg-gray-900 rounded-lg space-y-3 border border-gray-700">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Minuto</label>
                        <input
                          type="number"
                          className="input w-full"
                          min="0"
                          placeholder="0"
                          value={scorer.minute}
                          onChange={(e) => handleScorerChange(index, 'minute', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Equipo</label>
                        {/* Keep the scorer team even if it does not match the current teams to avoid losing data */}
                        <select
                          className="input w-full"
                          value={scorer.clubId}
                          onChange={(e) => handleScorerChange(index, 'clubId', e.target.value)}
                        >
                          {Array.from(new Set([homeTeam, awayTeam, scorer.clubId].filter(Boolean))).map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Goleador</label>
                        <select
                          className="input w-full"
                          value={scorer.playerId}
                          onChange={(e) => handleScorerPlayerSelect(index, e.target.value)}
                        >
                          <option value="">Selecciona jugador</option>
                          {getPlayersForTeam(scorer.clubId).map((player) => (
                            <option key={player.id} value={player.id}>
                              {player.name}
                            </option>
                          ))}
                          {scorer.playerId && !getPlayersForTeam(scorer.clubId).some((p) => p.id === scorer.playerId) && (
                            <option value={scorer.playerId}>{scorer.playerName || 'Jugador personalizado'}</option>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Asistencia (opcional)</label>
                        <select
                          className="input w-full"
                          value={scorer.assistPlayerName || ''}
                          onChange={(e) => handleScorerChange(index, 'assistPlayerName', e.target.value)}
                        >
                          <option value="">Sin asistencia</option>
                          {getPlayersForTeam(scorer.clubId).map((player) => (
                            <option key={player.id} value={player.name}>
                              {player.name}
                            </option>
                          ))}
                          {scorer.assistPlayerName &&
                            !getPlayersForTeam(scorer.clubId).some((p) => p.name === scorer.assistPlayerName) && (
                              <option value={scorer.assistPlayerName}>{scorer.assistPlayerName}</option>
                            )}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id={`ownGoal-${index}`}
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!scorer.ownGoal}
                        onChange={(e) => handleScorerOwnGoal(index, e.target.checked)}
                      />
                      <label htmlFor={`ownGoal-${index}`} className="text-xs text-gray-300 select-none">
                        Autogol
                      </label>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveScorer(index)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm text-gray-400">Tarjetas</label>
                  <button type="button" className="btn-outline text-sm px-3 py-1" onClick={handleAddCard}>
                    Agregar tarjeta
                  </button>
                </div>

                {cards.length === 0 && (
                  <p className="text-sm text-gray-500">Agrega tarjetas amarillas o rojas con minuto y jugador.</p>
                )}

                {cards.map((card, index) => (
                  <div key={card.rowId} className="p-3 bg-gray-900 rounded-lg space-y-3 border border-gray-700">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Minuto</label>
                        <input
                          type="number"
                          className="input w-full"
                          min="0"
                          placeholder="0"
                          value={card.minute}
                          onChange={(e) => handleCardChange(index, 'minute', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Equipo</label>
                        <select
                          className="input w-full"
                          value={card.clubId}
                          onChange={(e) => handleCardChange(index, 'clubId', e.target.value)}
                        >
                          {Array.from(new Set([homeTeam, awayTeam, card.clubId].filter(Boolean))).map((team) => (
                            <option key={team} value={team}>
                              {team}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Tipo</label>
                        <select
                          className="input w-full"
                          value={card.type}
                          onChange={(e) => handleCardChange(index, 'type', e.target.value as 'yellow' | 'red')}
                        >
                          <option value="yellow">Amarilla</option>
                          <option value="red">Roja</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Jugador</label>
                      <select
                        className="input w-full"
                        value={card.playerId}
                        onChange={(e) => handleCardPlayerSelect(index, e.target.value)}
                      >
                        <option value="">Selecciona jugador</option>
                        {getPlayersForTeam(card.clubId).map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                        {card.playerId && !getPlayersForTeam(card.clubId).some((p) => p.id === card.playerId) && (
                          <option value={card.playerId}>{card.playerName || 'Jugador personalizado'}</option>
                        )}
                      </select>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-red-400 hover:text-red-300"
                        onClick={() => handleRemoveCard(index)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
};

export default EditMatchModal;
