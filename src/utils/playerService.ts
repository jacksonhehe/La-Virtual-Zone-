import { supabase } from '../lib/supabaseClient'
import { Player } from '../types/shared'

export const fetchPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

export const createPlayer = async (payload: { name: string; club_id: string; position: string; rating: number }) => {
  const { data, error } = await supabase
    .from('players')
    .insert(payload)
    .single()
  if (error) throw error
  return data
}

export const updatePlayer = async (id: string, payload: Partial<{ name: string; club_id: string; position: string; rating: number }>) => {
  const { data, error } = await supabase
    .from('players')
    .update(payload)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export const deletePlayer = async (id: string) => {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

export const fetchPlayerById = async (id: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as Player
}
