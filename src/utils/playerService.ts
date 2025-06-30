import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';

export const getPlayers = (): Player[] => {
  if (typeof localStorage === 'undefined') return [];
  const json = localStorage.getItem(VZ_PLAYERS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Player[];
    } catch {
      // ignore parse errors
    }
  }
  return [];
};

export const savePlayers = (data: Player[]): void => {
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
};
