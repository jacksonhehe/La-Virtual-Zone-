import { supabase } from '../lib/supabase';
import type { News, NewsInsert, NewsUpdate, NewsWithAuthor, SupabaseResponse, SupabaseListResponse } from '../types/supabase';

export async function fetchNews(): Promise<SupabaseListResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .order('created_at', { ascending: false });
}

export async function getNewsById(id: number): Promise<SupabaseResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .eq('id', id)
    .single();
}

export async function getNewsByAuthor(authorId: string): Promise<SupabaseListResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .eq('author_id', authorId)
    .order('created_at', { ascending: false });
}

export async function getRecentNews(limit: number = 5): Promise<SupabaseListResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function createNews(news: NewsInsert): Promise<SupabaseResponse<News>> {
  return supabase
    .from('news')
    .insert([news])
    .select()
    .single();
}

export async function updateNews(id: number, updates: Partial<News>): Promise<SupabaseResponse<News>> {
  return supabase
    .from('news')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function deleteNews(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('news')
    .delete()
    .eq('id', id);
}

export async function searchNews(query: string): Promise<SupabaseListResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false });
}

export async function getNewsByDateRange(startDate: string, endDate: string): Promise<SupabaseListResponse<NewsWithAuthor>> {
  return supabase
    .from('news')
    .select(`
      *,
      author:author_id(username,avatar_url)
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .order('created_at', { ascending: false });
}
