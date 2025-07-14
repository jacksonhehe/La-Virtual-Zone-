import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'

interface AuthState {
  user: any | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ user: data.user })
  },
  register: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw error
    set({ user: data.user })
  },
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
