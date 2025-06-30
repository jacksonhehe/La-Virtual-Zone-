import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';
import { players as defaultPlayers } from '../data/mockData';
import { supabase } from './supabaseClient';

export const getPlayers = async (): Promise<Player[]> => {
  try {
    const { data } = await supabase.from('players').select('*');
    if (data) return data as Player[];
  } catch {
    // ignore fetch errors
  }
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

export const savePlayers = async (data: Player[]): Promise<void> => {
  try {
    await supabase.from('players').upsert(data);
  } catch {
    localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
  }
};
