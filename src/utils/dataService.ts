import { supabase } from '../supabaseClient';
import type { Club, Player } from '../types/shared';
import type { Tournament, Match, TransferOffer } from '../types';

export const getClubs = async (): Promise<Club[]> => {
  const { data, error } = await supabase.from('clubes').select('*').order('id');
  if (error || !data) return [];
  return data as Club[];
};

export const getPlayers = async (): Promise<Player[]> => {
  const { data, error } = await supabase.from('jugadores').select('*').order('id');
  if (error || !data) return [];
  return data as Player[];
};

export const getTournaments = async (): Promise<Tournament[]> => {
  const { data, error } = await supabase.from('torneos').select('*').order('id');
  if (error || !data) return [];
  return data as Tournament[];
};

export const getFixtures = async (): Promise<Match[]> => {
  const { data, error } = await supabase.from('fixtures').select('*').order('id');
  if (error || !data) return [];
  return data as Match[];
};

export const getOffers = async (): Promise<TransferOffer[]> => {
  const { data, error } = await supabase.from('ofertas').select('*').order('id');
  if (error || !data) return [];
  return data as TransferOffer[];
};
