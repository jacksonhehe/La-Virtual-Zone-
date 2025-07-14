import { createContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext<{ user: any | null }>({ user: null })

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState(supabase.auth.getUser().data?.user ?? null)

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    )
    return () => sub.subscription.unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}
