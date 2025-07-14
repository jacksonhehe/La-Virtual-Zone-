import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';
import { supabase } from '../lib/supabaseClient';

export const getPlayers = (): Player[] => {
  const json = localStorage.getItem(VZ_PLAYERS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Player[];
    } catch {
      // ignore
    }
  }
  supabase.from('players').select('*').then(({ data, error }) => {
    if (!error && data) {
      localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
    }
  });
  return [] as Player[];
};

export const savePlayers = (data: Player[]): void => {
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
};
