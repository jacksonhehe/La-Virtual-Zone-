import seed from '../data/seed.json';
import { Club } from '../types/shared';
import { VZ_CLUBS_KEY } from './storageKeys';
import { supabase } from './supabaseClient';

export const getClubs = async (): Promise<Club[]> => {
  try {
    const { data } = await supabase.from('clubs').select('*');
    if (data) return data as Club[];
  } catch {
    // ignore fetch errors
  }
  const json =
    typeof localStorage === 'undefined'
      ? null
      : localStorage.getItem(VZ_CLUBS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as Club[];
    } catch {
      // ignore parse errors and fall back to seed
    }
  }
  return seed.clubs as Club[];
};

export const saveClubs = async (clubs: Club[]): Promise<void> => {
  try {
    await supabase.from('clubs').upsert(clubs);
  } catch {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(clubs));
    }
  }
};
