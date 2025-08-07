// Cliente de Supabase para scripts de validación
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Cargar variables de entorno
dotenv.config()

// Obtener variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zufqbiwbxcnwmrchtiom.supabase.co'
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1ZnFiaXdieGNud21yY2h0aW9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NzI2NzgsImV4cCI6MjA2OTU0ODY3OH0.CE3Dh3l6XTtS73Akes25wP4wI0n-v9Mlgb4X4ijhaRA'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🔧 Cliente de Supabase creado para validación')
console.log(`📡 URL: ${supabaseUrl}`)
console.log(`🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`)
