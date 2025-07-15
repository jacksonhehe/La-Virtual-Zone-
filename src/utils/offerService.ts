import { supabase } from '@/lib/supabaseClient'
import { TransferOffer } from '../types'

export const fetchOffers = async () => {
  const { data, error } = await supabase.from('transfers').select('*').order('created_at')
  if (error) throw error
  return data as TransferOffer[]
}

export const createOffer = async (payload: Omit<TransferOffer, 'id' | 'created_at'>) => {
  const { data, error } = await supabase.from('transfers').insert(payload).single()
  if (error) throw error
  return data as TransferOffer
}

export const updateOffer = async (id: string, fields: Record<string, any>) => {
  const { data, error } = await supabase.from('transfers').update(fields).eq('id', id).single()
  if (error) throw error
  return data as TransferOffer
}

export const deleteOffer = async (id: string) => {
  const { error } = await supabase.from('transfers').delete().eq('id', id)
  if (error) throw error
}
