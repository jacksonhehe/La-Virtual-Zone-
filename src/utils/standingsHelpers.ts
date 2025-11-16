import type { Club, Standing } from '../types';

const BASE_MATCHES = 22;

const buildFormTrend = (winRatio: number) => {
  return Array.from({ length: 5 }, (_, index) => {
    const snapshot = winRatio - index * 0.05;
    if (snapshot > 0.6) return 'W';
    if (snapshot > 0.4) return 'D';
    return 'L';
  });
};

export const createFallbackStandings = (clubs: Club[]): Standing[] => {
  if (!clubs.length) return [];

  return [...clubs]
    .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
    .slice(0, 20)
    .map((club, index) => {
      const reputation = club.reputation || 60;
      const winRatio = Math.max(0.3, Math.min(0.85, reputation / 100));
      const wins = Math.max(0, Math.min(BASE_MATCHES, Math.round(BASE_MATCHES * winRatio)));
      const draws = Math.max(
        0,
        Math.min(BASE_MATCHES - wins, Math.round((1 - winRatio) * 4))
      );
      const losses = Math.max(0, BASE_MATCHES - wins - draws);
      const goalsFor = Math.max(10, wins * 2 + 8 - index);
      const goalsAgainst = Math.max(5, Math.round(goalsFor * (1 - winRatio) * 0.6) + Math.round(losses * 0.5));
      const points = wins * 3 + draws;

      return {
        clubId: club.id,
        clubName: club.name,
        played: BASE_MATCHES,
        won: wins,
        drawn: draws,
        lost: losses,
        goalsFor,
        goalsAgainst,
        points,
        form: buildFormTrend(winRatio)
      };
    });
};
