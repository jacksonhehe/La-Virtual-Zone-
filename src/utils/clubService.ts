import { supabase } from '@/lib/supabaseClient'

export const fetchClubs = async () => {
  const { data, error } = await supabase.from('clubs').select('*').order('created_at')
  if (error) throw error
  return data
}

export const createClub = async (payload: { name: string; owner_id: string }) => {
  const { data, error } = await supabase.from('clubs').insert(payload).single()
  if (error) throw error
  return data
}

export const updateClub = async (id: string, fields: Record<string, any>) => {
  const { data, error } = await supabase.from('clubs').update(fields).eq('id', id).single()
  if (error) throw error
  return data
}

export const deleteClub = async (id: string) => {
  const { error } = await supabase.from('clubs').delete().eq('id', id)
  if (error) throw error
}
