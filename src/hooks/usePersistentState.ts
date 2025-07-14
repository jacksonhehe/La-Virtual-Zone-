import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue)

  useEffect(() => {
    let isMounted = true
    supabase
      .from('persistent_state')
      .select('value')
      .eq('key', key)
      .single()
      .then(({ data, error }) => {
        if (!error && data && isMounted) {
          setState(data.value as T)
        } else if (typeof localStorage !== 'undefined') {
          const stored = localStorage.getItem(key)
          if (stored && isMounted) setState(JSON.parse(stored) as T)
        }
      })
    return () => {
      isMounted = false
    }
  }, [key])

  useEffect(() => {
    supabase
      .from('persistent_state')
      .upsert({ key, value: state })
      .catch(() => {})
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch {
        // ignore write errors
      }
    }
  }, [key, state])

  return [state, setState]
}

export default usePersistentState
