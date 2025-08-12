import { supabase } from '../lib/supabase';
import type { Player, PlayerInsert, PlayerUpdate, PlayerFlat, SupabaseResponse, SupabaseListResponse } from '../types/supabase';
import type { PlayerStats } from '../types/player-stats';

export async function fetchPlayers(): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .order('overall', { ascending: false });
}

export async function fetchPlayersByClub(clubId: number): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .eq('club_id', clubId)
    .order('overall', { ascending: false });
}

export async function getPlayerById(id: number): Promise<SupabaseResponse<Player>> {
  return supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single();
}

export async function getPlayerWithStats(id: number): Promise<SupabaseResponse<Player>> {
  return supabase
    .from('players')
    .select('*, stats')
    .eq('id', id)
    .single();
}

export async function createPlayer(player: PlayerInsert): Promise<SupabaseResponse<Player>> {
  return supabase
    .from('players')
    .insert([player])
    .select()
    .single();
}

export async function updatePlayer(id: number, updates: Partial<Player>): Promise<SupabaseResponse<Player>> {
  return supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function updatePlayerStats(id: number, stats: Partial<PlayerStats>): Promise<SupabaseResponse<Player>> {
  // Usar RPC para merge de stats si existe, sino usar update normal
  try {
    const { data, error } = await supabase.rpc('merge_player_stats', { 
      p_player_id: id, 
      p_patch: stats 
    });
    
    if (error) {
      // Si falla el RPC, usar update normal
      return supabase
        .from('players')
        .update({ stats })
        .eq('id', id)
        .select()
        .single();
    }
    
    return { data, error: null };
  } catch {
    // Fallback a update normal
    return supabase
      .from('players')
      .update({ stats })
      .eq('id', id)
      .select()
      .single();
  }
}

export async function deletePlayer(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('players')
    .delete()
    .eq('id', id);
}

export async function searchPlayers(query: string): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .or(`name.ilike.%${query}%,nationality.ilike.%${query}%`)
    .order('overall', { ascending: false });
}

export async function getPlayersByPosition(position: string): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .eq('position', position)
    .order('overall', { ascending: false });
}

export async function getPlayersByAgeRange(minAge: number, maxAge: number): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .gte('age', minAge)
    .lte('age', maxAge)
    .order('overall', { ascending: false });
}

export async function getPlayersByOverallRange(minOverall: number, maxOverall: number): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .gte('overall', minOverall)
    .lte('overall', maxOverall)
    .order('overall', { ascending: false });
}

export async function getFreeAgents(): Promise<SupabaseListResponse<PlayerFlat>> {
  return supabase
    .from('players_flat')
    .select('*')
    .is('club_id', null)
    .order('overall', { ascending: false });
}

export async function transferPlayer(playerId: number, newClubId: number | null): Promise<SupabaseResponse<Player>> {
  return supabase
    .from('players')
    .update({ club_id: newClubId })
    .eq('id', playerId)
    .select()
    .single();
}
