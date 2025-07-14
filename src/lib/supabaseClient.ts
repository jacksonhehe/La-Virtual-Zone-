import { createClient } from '@supabase/supabase-js'
const url =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  'http://localhost'
const key =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  'public-anon-key'
export const supabase = createClient(url, key)
