// import seed from '../data/seed.json'; // Eliminado por migración a Supabase
import { Club } from '../types/shared';
import { VZ_CLUBS_KEY } from './storageKeys';

export const getClubs = (): Club[] => {
  // Migrado a Supabase. Mantener stub para compatibilidad.
  return [];
};

export const saveClubs = (_clubs: Club[]): void => {
  // Migrado a Supabase. Sin persistencia local.
};
