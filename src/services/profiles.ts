import { supabase } from '../lib/supabase';
import type { Profile, ProfileInsert, ProfileUpdate, SupabaseResponse } from '../types/supabase';

export async function getMyProfile(userId: string): Promise<SupabaseResponse<Profile>> {
  return supabase
    .from('profiles')
    .select('id, username, role, avatar_url, created_at, updated_at')
    .eq('id', userId)
    .single();
}

export async function getProfileById(userId: string): Promise<SupabaseResponse<Profile>> {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function getAllProfiles(): Promise<SupabaseResponse<Profile[]>> {
  return supabase
    .from('profiles')
    .select('*')
    .order('username', { ascending: true });
}

export async function createProfile(profile: ProfileInsert): Promise<SupabaseResponse<Profile>> {
  return supabase
    .from('profiles')
    .insert([profile])
    .select()
    .single();
}

export async function updateProfile(profile: ProfileUpdate): Promise<SupabaseResponse<Profile>> {
  const { id, ...updates } = profile;
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteProfile(userId: string): Promise<SupabaseResponse<null>> {
  return supabase
    .from('profiles')
    .delete()
    .eq('id', userId);
}

export async function updateProfileRole(userId: string, role: 'ADMIN' | 'CLUB' | 'USER'): Promise<SupabaseResponse<Profile>> {
  return supabase
    .from('profiles')
    .update({ role })
    .eq('id', userId)
    .select()
    .single();
}
