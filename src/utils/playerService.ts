import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';
import { players as defaultPlayers } from '../data/mockData';

export const getPlayers = (): Player[] => {
  const json = localStorage.getItem(VZ_PLAYERS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Player[];
    } catch {
      // ignore
    }
  }
  return defaultPlayers as Player[];
};

export const savePlayers = (data: Player[]): void => {
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
};
