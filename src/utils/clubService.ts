import seed from '../data/seed.json';
import { Club } from '../types';
import { VZ_CLUBS_KEY } from './storageKeys';

export const getClubs = (): Club[] => {
  const json = localStorage.getItem(VZ_CLUBS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Club[];
    } catch {
      // ignore parse errors and fall back to seed
    }
  }
  return seed.clubs as Club[];
};

export const saveClubs = (clubs: Club[]): void => {
  localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(clubs));
};
