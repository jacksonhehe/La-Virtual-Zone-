import { supabase } from '../lib/supabaseClient'
import { TransferOffer } from '../types'
import { VZ_OFFERS_KEY } from './storageKeys'

export const fetchOffers = async () => {
  const { data, error } = await supabase
    .from('transfers')
    .select('*')
    .order('created_at')
  if (error) throw error
  return data as TransferOffer[]
}

export const getOffers = (): TransferOffer[] => {
  const json = typeof localStorage === 'undefined' ? null : localStorage.getItem(VZ_OFFERS_KEY)
  if (json) {
    try {
      return JSON.parse(json) as TransferOffer[]
    } catch {
      // ignore
    }
  }
  fetchOffers()
    .then(data => {
      if (data && typeof localStorage !== 'undefined') {
        localStorage.setItem(VZ_OFFERS_KEY, JSON.stringify(data))
      }
    })
    .catch(() => {})
  return [] as TransferOffer[]
}

export const saveOffers = (data: TransferOffer[]): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(VZ_OFFERS_KEY, JSON.stringify(data))
  }
}

export const createOffer = async (payload: Omit<TransferOffer, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('transfers')
    .insert(payload)
    .single()
  if (error) throw error
  return data as TransferOffer
}

export const updateOffer = async (id: string, payload: Partial<TransferOffer>) => {
  const { data, error } = await supabase
    .from('transfers')
    .update(payload)
    .eq('id', id)
    .single()
  if (error) throw error
  return data as TransferOffer
}

export const deleteOffer = async (id: string) => {
  const { error } = await supabase.from('transfers').delete().eq('id', id)
  if (error) throw error
}
