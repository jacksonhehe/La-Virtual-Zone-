import { createClient } from '@supabase/supabase-js'
import { config } from './config'

// Crear cliente solo si Supabase está habilitado y configurado
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (!config.useSupabase) {
    throw new Error('Supabase is not enabled. Check config.useSupabase')
  }

  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new Error('Missing Supabase environment variables. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey)
  }

  return supabaseClient
}

let supabaseAdminClient: ReturnType<typeof createClient> | null = null

export const getSupabaseAdminClient = () => {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new Error('Supabase service role key is required to perform admin operations.')
  }

  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(config.supabase.url, config.supabase.serviceRoleKey)
  }

  return supabaseAdminClient
}

// Exportar cliente como null por defecto (se inicializa solo cuando se necesita)
export const supabase = null

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          email: string
          role: 'user' | 'dt' | 'admin'
          avatar: string
          club_id?: string
          status: 'active' | 'suspended' | 'banned' | 'deleted'
          created_at: string
          updated_at: string
          bio?: string
          location?: string
          website?: string
          favorite_team?: string
          favorite_position?: string
          suspended_until?: string
          suspended_reason?: string
          ban_reason?: string
          deleted_at?: string
          deleted_reason?: string
          notifications: boolean
          last_login: string
          followers: number
          following: number
        }
        Insert: {
          id: string
          username: string
          email: string
          role?: 'user' | 'dt' | 'admin'
          avatar?: string
          club_id?: string
          status?: 'active' | 'suspended' | 'banned' | 'deleted'
          created_at?: string
          updated_at?: string
          bio?: string
          location?: string
          website?: string
          favorite_team?: string
          favorite_position?: string
          suspended_until?: string
          suspended_reason?: string
          ban_reason?: string
          deleted_at?: string
          deleted_reason?: string
          notifications?: boolean
          last_login?: string
          followers?: number
          following?: number
        }
        Update: {
          id?: string
          username?: string
          email?: string
          role?: 'user' | 'dt' | 'admin'
          avatar?: string
          club_id?: string
          status?: 'active' | 'suspended' | 'banned' | 'deleted'
          created_at?: string
          updated_at?: string
          bio?: string
          location?: string
          website?: string
          favorite_team?: string
          favorite_position?: string
          suspended_until?: string
          suspended_reason?: string
          ban_reason?: string
          deleted_at?: string
          deleted_reason?: string
          notifications?: boolean
          last_login?: string
          followers?: number
          following?: number
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          logo: string
          foundedYear: number
          stadium: string
          budget: number
          manager: string
          playStyle: string
          primaryColor: string
          secondaryColor: string
          description: string
          reputation: number
          fanBase: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          logo?: string
          foundedYear?: number
          stadium?: string
          budget?: number
          manager?: string
          playStyle?: string
          primaryColor?: string
          secondaryColor?: string
          description?: string
          reputation?: number
          fanBase?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo?: string
          foundedYear?: number
          stadium?: string
          budget?: number
          manager?: string
          playStyle?: string
          primaryColor?: string
          secondaryColor?: string
          description?: string
          reputation?: number
          fanBase?: number
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          name: string
          age: number
          position: string
          nationality: string
          club_id: string
          overall: number
          potential: number
          transfer_listed: boolean
          transfer_value: number
          image: string
          attributes: any // JSON object
          skills: any // JSON object
          playing_styles: any // JSON object
          contract: any // JSON object
          form: number
          goals: number
          assists: number
          appearances: number
          matches: number
          dorsal: number
          injury_resistance: number
          height?: number
          weight?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          age: number
          position: string
          nationality: string
          club_id: string
          overall: number
          potential: number
          transfer_listed?: boolean
          transfer_value: number
          image?: string
          attributes?: any
          skills?: any
          playing_styles?: any
          contract?: any
          form?: number
          goals?: number
          assists?: number
          appearances?: number
          matches?: number
          dorsal?: number
          injury_resistance?: number
          height?: number
          weight?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          position?: string
          nationality?: string
          club_id?: string
          overall?: number
          potential?: number
          transfer_listed?: boolean
          transfer_value?: number
          image?: string
          attributes?: any
          skills?: any
          playing_styles?: any
          contract?: any
          form?: number
          goals?: number
          assists?: number
          appearances?: number
          matches?: number
          dorsal?: number
          injury_resistance?: number
          height?: number
          weight?: number
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          type: 'league' | 'cup' | 'friendly'
          logo: string
          start_date: string
          end_date: string
          status: 'upcoming' | 'active' | 'finished'
          teams: string[]
          rounds: number
          matches: any[]
          winner?: string
          top_scorer?: any
          description: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          type: 'league' | 'cup' | 'friendly'
          logo?: string
          start_date: string
          end_date: string
          status?: 'upcoming' | 'active' | 'finished'
          teams?: string[]
          rounds?: number
          matches?: any[]
          winner?: string
          top_scorer?: any
          description?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'league' | 'cup' | 'friendly'
          logo?: string
          start_date?: string
          end_date?: string
          status?: 'upcoming' | 'active' | 'finished'
          teams?: string[]
          rounds?: number
          matches?: any[]
          winner?: string
          top_scorer?: any
          description?: string
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          tournament_id: string
          round: number
          date: string
          home_team: string
          away_team: string
          home_score?: number
          away_score?: number
          status: 'scheduled' | 'live' | 'finished'
          scorers?: any[]
          highlights?: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          round?: number
          date: string
          home_team: string
          away_team: string
          home_score?: number
          away_score?: number
          status?: 'scheduled' | 'live' | 'finished'
          scorers?: any[]
          highlights?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          round?: number
          date?: string
          home_team?: string
          away_team?: string
          home_score?: number
          away_score?: number
          status?: 'scheduled' | 'live' | 'finished'
          scorers?: any[]
          highlights?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      transfers: {
        Row: {
          id: string
          player_id: string
          player_name: string
          from_club: string
          to_club: string
          fee: number
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          player_id: string
          player_name: string
          from_club: string
          to_club: string
          fee: number
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          player_name?: string
          from_club?: string
          to_club?: string
          fee?: number
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      transfer_offers: {
        Row: {
          id: string
          player_id: string
          player_name: string
          from_club: string
          to_club: string
          amount: number
          date: string
          status: 'pending' | 'accepted' | 'rejected' | 'counter-offer'
          user_id: string
          counter_amount?: number
          counter_date?: string
          history?: any[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          player_id: string
          player_name: string
          from_club: string
          to_club: string
          amount: number
          date: string
          status?: 'pending' | 'accepted' | 'rejected' | 'counter-offer'
          user_id: string
          counter_amount?: number
          counter_date?: string
          history?: any[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          player_name?: string
          from_club?: string
          to_club?: string
          amount?: number
          date?: string
          status?: 'pending' | 'accepted' | 'rejected' | 'counter-offer'
          user_id?: string
          counter_amount?: number
          counter_date?: string
          history?: any[]
          created_at?: string
          updated_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          type: 'transfer' | 'rumor' | 'result' | 'announcement' | 'statement'
          image?: string
          date: string
          author: string
          club_id?: string
          player_id?: string
          tournament_id?: string
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          content: string
          type: 'transfer' | 'rumor' | 'result' | 'announcement' | 'statement'
          image?: string
          date: string
          author: string
          club_id?: string
          player_id?: string
          tournament_id?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          type?: 'transfer' | 'rumor' | 'result' | 'announcement' | 'statement'
          image?: string
          date?: string
          author?: string
          club_id?: string
          player_id?: string
          tournament_id?: string
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      standings: {
        Row: {
          id: string
          tournament_id: string
          club_id: string
          club_name: string
          played: number
          won: number
          drawn: number
          lost: number
          goals_for: number
          goals_against: number
          points: number
          form: string[]
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tournament_id: string
          club_id: string
          club_name: string
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          points?: number
          form?: string[]
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          club_id?: string
          club_name?: string
          played?: number
          won?: number
          drawn?: number
          lost?: number
          goals_for?: number
          goals_against?: number
          points?: number
          form?: string[]
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: 'account' | 'tournament' | 'league' | 'market' | 'other'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          question: string
          answer: string
          category?: 'account' | 'tournament' | 'league' | 'market' | 'other'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: 'account' | 'tournament' | 'league' | 'market' | 'other'
          created_at?: string
          updated_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          image?: string
          date: string
          author: string
          category: string
          tags: string[]
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          slug: string
          excerpt: string
          content: string
          image?: string
          date?: string
          author?: string
          category?: string
          tags?: string[]
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          image?: string
          date?: string
          author?: string
          category?: string
          tags?: string[]
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      media: {
        Row: {
          id: string
          title: string
          description?: string
          type: 'image' | 'video' | 'clip'
          url: string
          thumbnail_url?: string
          category: string
          uploader: string
          upload_date: string
          likes: number
          views: number
          file_size?: number
          mime_type?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          title: string
          description?: string
          type: 'image' | 'video' | 'clip'
          url: string
          thumbnail_url?: string
          category?: string
          uploader?: string
          upload_date?: string
          likes?: number
          views?: number
          file_size?: number
          mime_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          type?: 'image' | 'video' | 'clip'
          url?: string
          thumbnail_url?: string
          category?: string
          uploader?: string
          upload_date?: string
          likes?: number
          views?: number
          file_size?: number
          mime_type?: string
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
