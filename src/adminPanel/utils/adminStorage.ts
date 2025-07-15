import { supabase } from '@/lib/supabaseClient'

export const getState = async (key: string, user_id: string) => {
  const { data, error } = await supabase
    .from('admin_state')
    .select('value')
    .eq('key', key)
    .eq('user_id', user_id)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data?.value ?? null
}

export const setState = async (key: string, value: any, user_id: string) => {
  const { error } = await supabase
    .from('admin_state')
    .upsert({ key, value, user_id }, { onConflict: 'key' })
  if (error) throw error
}
