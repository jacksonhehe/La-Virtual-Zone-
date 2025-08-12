import { supabase } from '../lib/supabase';
import type { Standing, SupabaseListResponse } from '../types/supabase';

export async function getStandingsByTournament(tournamentId: number): Promise<SupabaseListResponse<Standing>> {
  return supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('pts', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false });
}

export async function getClubStanding(tournamentId: number, clubId: number): Promise<SupabaseListResponse<Standing>> {
  return supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .eq('club_id', clubId)
    .single();
}

export async function getTopTeams(tournamentId: number, limit: number = 10): Promise<SupabaseListResponse<Standing>> {
  return supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('pts', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false })
    .limit(limit);
}

export async function getBottomTeams(tournamentId: number, limit: number = 10): Promise<SupabaseListResponse<Standing>> {
  return supabase
    .from('standings')
    .select('*')
    .eq('tournament_id', tournamentId)
    .order('pts', { ascending: true })
    .order('gd', { ascending: true })
    .order('gf', { ascending: true })
    .limit(limit);
}

export async function getStandingsWithStats(tournamentId: number): Promise<SupabaseListResponse<Standing>> {
  return supabase
    .from('standings')
    .select(`
      *,
      club:club_id(id,name,slug,logo)
    `)
    .eq('tournament_id', tournamentId)
    .order('pts', { ascending: false })
    .order('gd', { ascending: false })
    .order('gf', { ascending: false });
}
