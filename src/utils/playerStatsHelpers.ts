import { Match, Player } from '../types';
import { listMatches } from './matchService';

const normalize = (value?: string): string =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const STATUS_TO_COUNT = new Set<Match['status']>(['live', 'finished']);

type RecalculatePlayerGoalsResult = {
  processedMatches: number;
  playersUpdated: number;
  goalsAssigned: number;
  assistsAssigned: number;
};

const resolvePlayerId = (
  playerId: string | undefined,
  playerName: string | undefined,
  clubId: string | undefined,
  players: Player[],
  playersById: Map<string, Player>,
  playerIdsByNormalizedName: Map<string, string[]>,
  clubIdsByNormalizedName: Map<string, string>,
): string | null => {
  if (playerId && playersById.has(playerId)) {
    return playerId;
  }

  const normalizedName = normalize(playerName);
  if (!normalizedName) return null;

  const candidateIds = playerIdsByNormalizedName.get(normalizedName) || [];
  if (candidateIds.length === 0) return null;
  if (candidateIds.length === 1) return candidateIds[0];

  const scorerClubRaw = normalize(clubId);
  const scorerClubId = clubIdsByNormalizedName.get(scorerClubRaw) || clubId;
  const withSameClub = candidateIds.find((playerId) => {
    const player = playersById.get(playerId);
    return !!player && normalize(player.clubId) === normalize(scorerClubId);
  });

  if (withSameClub) return withSameClub;

  const playerByNameAndClubName = players.find(
    (player) =>
      normalize(player.name) === normalizedName &&
      normalize(player.clubId) === scorerClubRaw
  );
  if (playerByNameAndClubName) return playerByNameAndClubName.id;

  return candidateIds[0];
};

export const recalculateAndUpdatePlayerGoals = async (): Promise<RecalculatePlayerGoalsResult> => {
  const { useDataStore } = await import('../store/dataStore');
  const store = useDataStore.getState() as any;
  const players: Player[] = Array.isArray(store.players) ? store.players : [];
  const clubs = Array.isArray(store.clubs) ? store.clubs : [];

  const matches = await listMatches();
  const relevantMatches = matches.filter((match) => STATUS_TO_COUNT.has(match.status));

  const playersById = new Map(players.map((player) => [player.id, player]));
  const playerIdsByNormalizedName = new Map<string, string[]>();
  players.forEach((player) => {
    const key = normalize(player.name);
    if (!key) return;
    const existing = playerIdsByNormalizedName.get(key) || [];
    existing.push(player.id);
    playerIdsByNormalizedName.set(key, existing);
  });

  const clubIdsByNormalizedName = new Map<string, string>();
  clubs.forEach((club: any) => {
    const clubIdKey = normalize(club?.id);
    const clubNameKey = normalize(club?.name);
    if (clubIdKey) clubIdsByNormalizedName.set(clubIdKey, String(club.id));
    if (clubNameKey) clubIdsByNormalizedName.set(clubNameKey, String(club.id));
  });

  const goalCountByPlayerId = new Map<string, number>();
  const assistCountByPlayerId = new Map<string, number>();

  relevantMatches.forEach((match) => {
    (match.scorers || []).forEach((scorer) => {
      if (!scorer?.playerName || scorer.ownGoal) return;

      const playerId = resolvePlayerId(
        scorer.playerId,
        scorer.playerName,
        scorer.clubId,
        players,
        playersById,
        playerIdsByNormalizedName,
        clubIdsByNormalizedName
      );
      if (!playerId) return;

      goalCountByPlayerId.set(playerId, (goalCountByPlayerId.get(playerId) || 0) + 1);

      const assistPlayerId = resolvePlayerId(
        scorer.assistPlayerId,
        scorer.assistPlayerName,
        scorer.clubId,
        players,
        playersById,
        playerIdsByNormalizedName,
        clubIdsByNormalizedName
      );
      if (!assistPlayerId) return;
      assistCountByPlayerId.set(assistPlayerId, (assistCountByPlayerId.get(assistPlayerId) || 0) + 1);
    });
  });

  let playersUpdated = 0;
  const updatedPlayers = players.map((player) => {
    const nextGoals = goalCountByPlayerId.get(player.id) || 0;
    const nextAssists = assistCountByPlayerId.get(player.id) || 0;
    if ((player.goals || 0) === nextGoals && (player.assists || 0) === nextAssists) return player;
    playersUpdated += 1;
    return { ...player, goals: nextGoals, assists: nextAssists };
  });

  if (playersUpdated > 0) {
    await store.updatePlayers(updatedPlayers);
  }

  const goalsAssigned = Array.from(goalCountByPlayerId.values()).reduce((sum, n) => sum + n, 0);
  const assistsAssigned = Array.from(assistCountByPlayerId.values()).reduce((sum, n) => sum + n, 0);
  return {
    processedMatches: relevantMatches.length,
    playersUpdated,
    goalsAssigned,
    assistsAssigned,
  };
};
