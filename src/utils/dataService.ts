import { supabase } from '../supabaseClient';
import type { Club, Player } from '../types/shared';
import type { Tournament, Match, TransferOffer } from '../types';
import { clubs as mockClubs, players as mockPlayers, tournaments as mockTournaments, offers as mockOffers } from '../data/mockData';

export const getClubs = async (): Promise<{ data: Club[]; error?: Error }> => {
  const { data, error } = await supabase.from('clubes').select('*').order('id');
  if (error || !data) {
    return { data: mockClubs, error: error ?? new Error('Failed to fetch clubs') };
  }
  return { data: data as Club[] };
};

export const getPlayers = async (): Promise<{ data: Player[]; error?: Error }> => {
  const { data, error } = await supabase.from('jugadores').select('*').order('id');
  if (error || !data) {
    return { data: mockPlayers, error: error ?? new Error('Failed to fetch players') };
  }
  return { data: data as Player[] };
};

export const getTournaments = async (): Promise<{ data: Tournament[]; error?: Error }> => {
  const { data, error } = await supabase.from('torneos').select('*').order('id');
  if (error || !data) {
    return { data: mockTournaments, error: error ?? new Error('Failed to fetch tournaments') };
  }
  return { data: data as Tournament[] };
};

export const getFixtures = async (): Promise<{ data: Match[]; error?: Error }> => {
  const { data, error } = await supabase.from('fixtures').select('*').order('id');
  if (error || !data) {
    const fallback = mockTournaments.flatMap(t => t.matches);
    return { data: fallback, error: error ?? new Error('Failed to fetch fixtures') };
  }
  return { data: data as Match[] };
};

export const getOffers = async (): Promise<{ data: TransferOffer[]; error?: Error }> => {
  const { data, error } = await supabase.from('ofertas').select('*').order('id');
  if (error || !data) {
    return { data: mockOffers, error: error ?? new Error('Failed to fetch offers') };
  }
  return { data: data as TransferOffer[] };
};
