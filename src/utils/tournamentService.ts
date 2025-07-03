import { Tournament } from '../types';
import { tournaments as defaultTournaments } from '../data/mockData';

const VZ_TOURNAMENTS_KEY = 'vz_tournaments';

export const getTournaments = (): Tournament[] => {
  if (typeof localStorage === 'undefined') {
    return defaultTournaments as Tournament[];
  }
  const json = localStorage.getItem(VZ_TOURNAMENTS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Tournament[];
    } catch {
      // ignore parse errors
    }
  }
  localStorage.setItem(VZ_TOURNAMENTS_KEY, JSON.stringify(defaultTournaments));
  return defaultTournaments as Tournament[];
};

export const saveTournaments = (data: Tournament[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_TOURNAMENTS_KEY, JSON.stringify(data));
};

export { VZ_TOURNAMENTS_KEY };
