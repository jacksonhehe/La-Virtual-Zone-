import { supabase } from '../lib/supabaseClient'
import { Club } from '../types/shared'
import { VZ_CLUBS_KEY } from './storageKeys'

export const fetchClubs = async () => {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data
}

// Compatibility helpers used by older store modules
export const getClubs = (): Club[] => {
  const json = typeof localStorage === 'undefined' ? null : localStorage.getItem(VZ_CLUBS_KEY)
  if (json) {
    try {
      return JSON.parse(json) as Club[]
    } catch {
      // ignore parse errors
    }
  }
  // Fetch asynchronously to keep local storage up to date
  fetchClubs()
    .then(data => {
      if (data && typeof localStorage !== 'undefined') {
        localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(data))
      }
    })
    .catch(() => {})
  return [] as Club[]
}

export const saveClubs = (clubs: Club[]): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(VZ_CLUBS_KEY, JSON.stringify(clubs))
  }
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
