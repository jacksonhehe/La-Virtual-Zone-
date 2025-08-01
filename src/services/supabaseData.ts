import { supabase } from '../lib/supabase'
import { Tables } from '../lib/supabase'

export type Club = Tables<'clubs'>
export type Player = Tables<'players'>
export type Match = Tables<'matches'>
export type Transfer = Tables<'transfers'>
export type News = Tables<'news'>

export class SupabaseDataService {
  // ===== CLUBES =====
  static async getClubs(): Promise<Club[]> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching clubs:', error)
      return []
    }

    return data || []
  }

  static async getClub(id: number): Promise<Club | null> {
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching club:', error)
      return null
    }

    return data
  }

  static async createClub(clubData: Omit<Club, 'id' | 'created_at' | 'updated_at'>): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .insert(clubData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async updateClub(id: number, updates: Partial<Club>): Promise<Club> {
    const { data, error } = await supabase
      .from('clubs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async deleteClub(id: number): Promise<void> {
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  // ===== JUGADORES =====
  static async getPlayers(): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching players:', error)
      return []
    }

    return data || []
  }

  static async getPlayersByClub(clubId: number): Promise<Player[]> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('club_id', clubId)
      .order('name')

    if (error) {
      console.error('Error fetching players by club:', error)
      return []
    }

    return data || []
  }

  static async getPlayer(id: number): Promise<Player | null> {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching player:', error)
      return null
    }

    return data
  }

  static async createPlayer(playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .insert(playerData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async updatePlayer(id: number, updates: Partial<Player>): Promise<Player> {
    const { data, error } = await supabase
      .from('players')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async deletePlayer(id: number): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  }

  // ===== PARTIDOS =====
  static async getMatches(): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_club:clubs!home_club_id(name, logo),
        away_club:clubs!away_club_id(name, logo)
      `)
      .order('played_at', { ascending: false })

    if (error) {
      console.error('Error fetching matches:', error)
      return []
    }

    return data || []
  }

  static async getMatchesByClub(clubId: number): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        home_club:clubs!home_club_id(name, logo),
        away_club:clubs!away_club_id(name, logo)
      `)
      .or(`home_club_id.eq.${clubId},away_club_id.eq.${clubId}`)
      .order('played_at', { ascending: false })

    if (error) {
      console.error('Error fetching matches by club:', error)
      return []
    }

    return data || []
  }

  static async createMatch(matchData: Omit<Match, 'id' | 'created_at' | 'updated_at'>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert(matchData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async updateMatch(id: number, updates: Partial<Match>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // ===== TRANSFERENCIAS =====
  static async getTransfers(): Promise<Transfer[]> {
    const { data, error } = await supabase
      .from('transfers')
      .select(`
        *,
        player:players(name, image),
        from_club:clubs!from_club_id(name, logo),
        to_club:clubs!to_club_id(name, logo)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transfers:', error)
      return []
    }

    return data || []
  }

  static async createTransfer(transferData: Omit<Transfer, 'id' | 'created_at' | 'updated_at'>): Promise<Transfer> {
    const { data, error } = await supabase
      .from('transfers')
      .insert(transferData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // ===== NOTICIAS =====
  static async getNews(): Promise<News[]> {
    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        author:users(username)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching news:', error)
      return []
    }

    return data || []
  }

  static async createNews(newsData: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
    const { data, error } = await supabase
      .from('news')
      .insert(newsData)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  // ===== SUBIDA DE ARCHIVOS =====
  static async uploadFile(file: File, bucket: string, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(error.message)
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return urlData.publicUrl
  }

  static async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(error.message)
    }
  }
} 