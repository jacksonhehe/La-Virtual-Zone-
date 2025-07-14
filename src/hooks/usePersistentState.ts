import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const lsKey = `lzui_${key}`
      if (typeof localStorage !== 'undefined') {
        const cached = localStorage.getItem(lsKey)
        if (cached && mounted) setState(JSON.parse(cached) as T)
      }
      if (!user) return
      const { data } = await supabase
        .from('ui_state')
        .select('value')
        .eq('key', key)
        .eq('user_id', user.id)
        .single()
      if (data && mounted) setState(data.value as T)
    }
    load()
    return () => {
      mounted = false
    }
  }, [key])

  useEffect(() => {
    const save = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await supabase
        .from('ui_state')
        .upsert({ key, value: state, user_id: user.id }, { onConflict: 'key' })
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`lzui_${key}`, JSON.stringify(state))
      }
    }
    save()
  }, [key, state])

  return [state, setState]
}

export default usePersistentState
