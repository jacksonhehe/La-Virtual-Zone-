import seed from '../data/seed.json';
import { Player } from '../types';
import { VZ_PLAYERS_KEY } from './storageKeys';

export const getPlayers = (): Player[] => {
  const json = typeof localStorage === 'undefined' ? null : localStorage.getItem(VZ_PLAYERS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Player[];
    } catch {
      // ignore parse errors and fall back to seed
    }
  }
  return seed.players as Player[];
};

export const savePlayers = (players: Player[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(players));
};
