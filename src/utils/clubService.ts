import { supabase } from '../lib/supabaseClient'
import { Club } from '../types/shared'

export const fetchClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

export const createClub = async (payload: { name: string; owner_id: string }) => {
  const { data, error } = await supabase
    .from('clubs')
    .insert(payload)
    .single()
  if (error) throw error
  return data
}

export const updateClub = async (id: string, payload: Partial<{ name: string; owner_id: string }>) => {
  const { data, error } = await supabase
    .from('clubs')
    .update(payload)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const deleteClub = async (id: string) => {
  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) throw error
}

export const fetchClubById = async (id: string) => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Club
}
