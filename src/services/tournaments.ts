import { supabase } from '../lib/supabase';
import type { Tournament, TournamentInsert, TournamentUpdate, SupabaseResponse, SupabaseListResponse } from '../types/supabase';

export async function fetchTournaments(): Promise<SupabaseListResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });
}

export async function getTournamentById(id: number): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();
}

export async function getActiveTournaments(): Promise<SupabaseListResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });
}

export async function getFinishedTournaments(): Promise<SupabaseListResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'FINISHED')
    .order('created_at', { ascending: false });
}

export async function createTournament(tournament: TournamentInsert): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .insert([tournament])
    .select()
    .single();
}

export async function updateTournament(id: number, updates: Partial<Tournament>): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteTournament(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('tournaments')
    .delete()
    .eq('id', id);
}

export async function activateTournament(id: number): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .update({ status: 'ACTIVE' })
    .eq('id', id)
    .select()
    .single();
}

export async function finishTournament(id: number): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .update({ status: 'FINISHED' })
    .eq('id', id)
    .select()
    .single();
}

export async function archiveTournament(id: number): Promise<SupabaseResponse<Tournament>> {
  return supabase
    .from('tournaments')
    .update({ status: 'ARCHIVED' })
    .eq('id', id)
    .select()
    .single();
}
