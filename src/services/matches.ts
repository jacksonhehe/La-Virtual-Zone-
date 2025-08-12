import { supabase } from '../lib/supabase';
import type { Match, MatchInsert, MatchUpdate, MatchWithClubs, SupabaseResponse, SupabaseListResponse } from '../types/supabase';

export async function fetchMatchesByTournament(tournamentId: number): Promise<SupabaseListResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .eq('tournament_id', tournamentId)
    .order('played_at', { ascending: true });
}

export async function getMatchById(id: number): Promise<SupabaseResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .eq('id', id)
    .single();
}

export async function getMatchesByClub(clubId: number): Promise<SupabaseListResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
    .order('played_at', { ascending: true });
}

export async function getUpcomingMatches(limit: number = 10): Promise<SupabaseListResponse<MatchWithClubs>> {
  const now = new Date().toISOString();
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .gte('played_at', now)
    .eq('status', 'scheduled')
    .order('played_at', { ascending: true })
    .limit(limit);
}

export async function getRecentMatches(limit: number = 10): Promise<SupabaseListResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .eq('status', 'finished')
    .order('played_at', { ascending: false })
    .limit(limit);
}

export async function createMatch(match: MatchInsert): Promise<SupabaseResponse<Match>> {
  return supabase
    .from('matches')
    .insert([match])
    .select()
    .single();
}

export async function updateMatch(id: number, updates: Partial<Match>): Promise<SupabaseResponse<Match>> {
  return supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteMatch(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('matches')
    .delete()
    .eq('id', id);
}

export async function setMatchScore(id: number, homeScore: number, awayScore: number): Promise<SupabaseResponse<Match>> {
  return supabase
    .from('matches')
    .update({ 
      home_score: homeScore, 
      away_score: awayScore, 
      status: 'finished' 
    })
    .eq('id', id)
    .select()
    .single();
}

export async function setMatchStatus(id: number, status: 'scheduled' | 'live' | 'finished'): Promise<SupabaseResponse<Match>> {
  return supabase
    .from('matches')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
}

export async function getMatchesByDateRange(startDate: string, endDate: string): Promise<SupabaseListResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .gte('played_at', startDate)
    .lte('played_at', endDate)
    .order('played_at', { ascending: true });
}

export async function getMatchesByStatus(status: 'scheduled' | 'live' | 'finished'): Promise<SupabaseListResponse<MatchWithClubs>> {
  return supabase
    .from('matches')
    .select(`
      *,
      home:home_club_id(id,name,slug,logo),
      away:away_club_id(id,name,slug,logo)
    `)
    .eq('status', status)
    .order('played_at', { ascending: true });
}
