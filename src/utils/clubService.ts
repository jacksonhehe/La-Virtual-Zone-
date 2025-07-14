import { Club } from '../types/shared';
import { VZ_CLUBS_KEY } from './storageKeys';
import { supabase } from '../lib/supabaseClient';

export const getClubs = (): Club[] => {
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
  supabase.from('clubs').select('*').then(({ data, error }) => {
    if (!error && data) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(data));
      }
    }
  });
  return [] as Club[];
};

export const saveClubs = (clubs: Club[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(clubs));
};
