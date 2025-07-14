import { supabase } from '../lib/supabaseClient'
import { Player } from '../types/shared'
import { VZ_PLAYERS_KEY } from './storageKeys'

export const fetchPlayers = async () => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

export const getPlayers = (): Player[] => {
  const json = typeof localStorage === 'undefined' ? null : localStorage.getItem(VZ_PLAYERS_KEY)
  if (json) {
    try {
      return JSON.parse(json) as Player[]
    } catch {
      // ignore
    }
  }
  fetchPlayers()
    .then(data => {
      if (data && typeof localStorage !== 'undefined') {
        localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data))
      }
    })
    .catch(() => {})
  return [] as Player[]
}

export const savePlayers = (data: Player[]): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data))
  }
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
