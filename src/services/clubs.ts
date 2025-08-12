import { supabase } from '../lib/supabase';
import type { Club, ClubInsert, ClubUpdate, SupabaseResponse, SupabaseListResponse } from '../types/supabase';

export async function fetchClubs(): Promise<SupabaseListResponse<Club>> {
  return supabase
    .from('clubs')
    .select('*')
    .order('name', { ascending: true });
}

export async function getClubById(id: number): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single();
}

export async function getClubBySlug(slug: string): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .select('*')
    .eq('slug', slug)
    .single();
}

export async function getClubByManager(managerId: string): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .select('*')
    .eq('manager_id', managerId)
    .single();
}

export async function createClub(club: ClubInsert): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .insert([club])
    .select()
    .single();
}

export async function updateClub(id: number, updates: Partial<Club>): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteClub(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('clubs')
    .delete()
    .eq('id', id);
}

export async function updateClubBudget(id: number, newBudget: number): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .update({ budget: newBudget })
    .eq('id', id)
    .select()
    .single();
}

export async function updateClubTactics(id: number, tactics: Record<string, any>): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .update({ tactics })
    .eq('id', id)
    .select()
    .single();
}

export async function assignManagerToClub(clubId: number, managerId: string): Promise<SupabaseResponse<Club>> {
  return supabase
    .from('clubs')
    .update({ manager_id: managerId })
    .eq('id', clubId)
    .select()
    .single();
}
