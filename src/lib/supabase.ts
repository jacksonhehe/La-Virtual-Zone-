import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas de Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: number
          email: string
          username: string
          role: 'ADMIN' | 'CLUB' | 'USER'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          email: string
          username: string
          role?: 'ADMIN' | 'CLUB' | 'USER'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          email?: string
          username?: string
          role?: 'ADMIN' | 'CLUB' | 'USER'
          created_at?: string
          updated_at?: string
        }
      }
      clubs: {
        Row: {
          id: number
          name: string
          slug: string
          logo: string | null
          founded_year: number
          stadium: string
          manager_id: number | null
          budget: number
          play_style: string | null
          primary_color: string
          secondary_color: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          logo?: string | null
          founded_year: number
          stadium: string
          manager_id?: number | null
          budget: number
          play_style?: string | null
          primary_color: string
          secondary_color: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          logo?: string | null
          founded_year?: number
          stadium?: string
          manager_id?: number | null
          budget?: number
          play_style?: string | null
          primary_color?: string
          secondary_color?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: number
          name: string
          age: number
          nationality: string
          dorsal: number
          position: 'POR' | 'DEF' | 'MED' | 'DEL'
          club_id: number | null
          overall: number
          potential: number
          price: number
          image: string | null
          contract_expires: string | null
          salary: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          age: number
          nationality: string
          dorsal: number
          position: 'POR' | 'DEF' | 'MED' | 'DEL'
          club_id?: number | null
          overall: number
          potential: number
          price: number
          image?: string | null
          contract_expires?: string | null
          salary: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          age?: number
          nationality?: string
          dorsal?: number
          position?: 'POR' | 'DEF' | 'MED' | 'DEL'
          club_id?: number | null
          overall?: number
          potential?: number
          price?: number
          image?: string | null
          contract_expires?: string | null
          salary?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: number
          home_club_id: number
          away_club_id: number
          home_score: number | null
          away_score: number | null
          status: 'scheduled' | 'live' | 'finished'
          played_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          home_club_id: number
          away_club_id: number
          home_score?: number | null
          away_score?: number | null
          status?: 'scheduled' | 'live' | 'finished'
          played_at: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          home_club_id?: number
          away_club_id?: number
          home_score?: number | null
          away_score?: number | null
          status?: 'scheduled' | 'live' | 'finished'
          played_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      transfers: {
        Row: {
          id: number
          player_id: number
          from_club_id: number
          to_club_id: number
          amount: number
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          player_id: number
          from_club_id: number
          to_club_id: number
          amount: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          player_id?: number
          from_club_id?: number
          to_club_id?: number
          amount?: number
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: number
          title: string
          content: string
          image: string | null
          author_id: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content: string
          image?: string | null
          author_id: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          image?: string | null
          author_id?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T] 