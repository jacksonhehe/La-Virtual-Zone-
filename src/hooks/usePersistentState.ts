import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

function usePersistentState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    let cancelled = false
    const lsKey = `lzui_${key}`
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem(lsKey)
      if (cached) setState(JSON.parse(cached) as T)
    }
    supabase.auth.getUser().then(({ data: { user } }) => {
      supabase
        .from('ui_state')
        .select('value')
        .eq('key', key)
        .eq('user_id', user?.id ?? '')
        .single()
        .then(({ data }) => {
          if (!cancelled && data?.value !== undefined) setState(data.value as T)
        })
    })
    return () => {
      cancelled = true
    }
  }, [key])

  const persist = async (newValue: T) => {
    setState(newValue)
    const { data: { user } } = await supabase.auth.getUser()
    supabase.from('ui_state').upsert({ key, value: newValue, user_id: user?.id })
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`lzui_${key}`, JSON.stringify(newValue))
    }
  }

  return [state, persist]
}

export default usePersistentState
