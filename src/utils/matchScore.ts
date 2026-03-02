import type { Match } from '../types';

const asNumber = (value: unknown): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return value;
};

export const hasPenaltyResult = (match: Match): boolean => {
  if (match.decidedBy !== 'penalties') return false;
  const home = asNumber(match.penaltyHomeScore);
  const away = asNumber(match.penaltyAwayScore);
  return home != null && away != null;
};

export const formatMatchScore = (match: Match): string => {
  const home = match.homeScore ?? 0;
  const away = match.awayScore ?? 0;

  if (!hasPenaltyResult(match)) {
    return `${home} - ${away}`;
  }

  return `${home} (${match.penaltyHomeScore}) - (${match.penaltyAwayScore}) ${away}`;
};

export const formatMatchScoreForClub = (match: Match, isHome: boolean): string => {
  if (!hasPenaltyResult(match)) {
    return isHome
      ? `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`
      : `${match.awayScore ?? 0} - ${match.homeScore ?? 0}`;
  }

  return isHome
    ? `${match.homeScore ?? 0} (${match.penaltyHomeScore}) - (${match.penaltyAwayScore}) ${match.awayScore ?? 0}`
    : `${match.awayScore ?? 0} (${match.penaltyAwayScore}) - (${match.penaltyHomeScore}) ${match.homeScore ?? 0}`;
};
