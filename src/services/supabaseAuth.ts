import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  username: string
  role: 'ADMIN' | 'CLUB' | 'USER'
  xp?: number
  clubId?: string
}

export class SupabaseAuthService {
  // Obtener sesión actual
  static async getCurrentSession(): Promise<Session | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.error('Error getting session:', error)
      return null
    }
    return session
  }

  // Obtener usuario actual
  static async getCurrentUser(): Promise<AuthUser | null> {
    const session = await this.getCurrentSession()
    if (!session?.user) return null

    // Obtener datos adicionales del usuario desde la tabla users
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()

    if (error || !userData) {
      console.error('Error fetching user data:', error)
      return null
    }

    return {
      id: userData.id.toString(),
      email: userData.email,
      username: userData.username,
      role: userData.role,
      xp: 0, // Por defecto
      clubId: undefined // Por defecto
    }
  }

  // Registro con Supabase Auth
  static async register(email: string, username: string, password: string): Promise<AuthUser> {
    // Primero crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Error creating user')
    }

    // Luego crear el registro en la tabla users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        username,
        role: 'USER'
      })
      .select()
      .single()

    if (userError) {
      // Si falla la creación en la tabla users, eliminar el usuario de auth
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw new Error(userError.message)
    }

    return {
      id: userData.id.toString(),
      email: userData.email,
      username: userData.username,
      role: userData.role,
      xp: 0,
      clubId: undefined
    }
  }

  // Login con Supabase Auth
  static async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Login failed')
    }

    // Obtener datos adicionales del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (userError || !userData) {
      throw new Error('Error fetching user data')
    }

    return {
      id: userData.id.toString(),
      email: userData.email,
      username: userData.username,
      role: userData.role,
      xp: 0,
      clubId: undefined
    }
  }

  // Logout
  static async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  // Actualizar usuario
  static async updateUser(userId: string, updates: Partial<AuthUser>): Promise<AuthUser> {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        role: updates.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return {
      id: data.id.toString(),
      email: data.email,
      username: data.username,
      role: data.role,
      xp: updates.xp || 0,
      clubId: updates.clubId
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }

  // Escuchar cambios en la autenticación
  static onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else if (event === 'SIGNED_OUT') {
        callback(null)
      }
    })
  }
} 