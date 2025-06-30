import { Club } from '../types/shared';
import { VZ_CLUBS_KEY } from './storageKeys';

export const getClubs = (): Club[] => {
  if (typeof localStorage === 'undefined') return [];
  const json = localStorage.getItem(VZ_CLUBS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Club[];
    } catch {
      // ignore parse errors
    }
  }
  return [];
};

export const saveClubs = (clubs: Club[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(clubs));
};
