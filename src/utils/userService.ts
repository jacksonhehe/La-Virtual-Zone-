import { supabase } from '../lib/supabaseClient'
import { User } from '../types/shared'

export interface UserQuery {
  search?: string
  page?: number
  pageSize?: number
}

export interface PagedUsers {
  users: User[]
  total: number
}

export const fetchUsers = async (query: UserQuery): Promise<PagedUsers> => {
  const { search = '', page = 1, pageSize = 10 } = query
  const from = (page - 1) * pageSize
  let req = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .range(from, from + pageSize - 1)
  if (search) req = req.ilike('username', `%${search}%`)
  const { data, error, count } = await req
  if (error) throw error
  return { users: data ?? [], total: count ?? 0 }
}

export const getUserByUsername = async (username: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()
  if (error) return null
  return data
}
