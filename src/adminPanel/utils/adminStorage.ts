import { supabase } from '@/lib/supabaseClient'

export const getState = async (key: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data, error } = await supabase
    .from('admin_state')
    .select('value')
    .eq('key', key)
    .eq('user_id', user.id)
    .single()
  if (error) return null
  return data?.value ?? null
}

export const setState = async (key: string, value: unknown) => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('admin_state')
    .upsert({ key, value, user_id: user.id }, { onConflict: 'key' })
  if (error) throw error
}
