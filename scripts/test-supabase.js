#!/usr/bin/env node

/**
 * Script de prueba para verificar la conexión con Supabase
 * Ejecutar con: node scripts/test-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Cargar variables de entorno desde .env.local
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

let supabaseUrl = process.env.VITE_SUPABASE_URL
let supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

// Intentar leer .env.local si las variables no están en process.env
if (!supabaseUrl || !supabaseKey) {
  try {
    const envContent = readFileSync(envPath, 'utf8')
    const envLines = envContent.split('\n')

    for (const line of envLines) {
      const [key, value] = line.split('=')
      if (key === 'VITE_SUPABASE_URL') {
        supabaseUrl = value?.replace(/['"]/g, '')
      } else if (key === 'VITE_SUPABASE_ANON_KEY') {
        supabaseKey = value?.replace(/['"]/g, '')
      }
    }
  } catch (error) {
    console.log('⚠️ No se pudo leer .env.local, usando variables de entorno del sistema')
  }
}

console.log('🧪 Testing Supabase connection...\n')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables')
  console.error('Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing basic connection...')

    // Test basic connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Connection failed:', error.message)
      return false
    }

    console.log('✅ Basic connection successful')
    console.log(`📊 Found ${data} profiles in database`)

    return true
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    return false
  }
}

async function testTables() {
  const tables = ['profiles', 'clubs', 'players', 'tournaments', 'matches']

  console.log('\n🔍 Testing database tables...')

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error(`❌ Table '${table}' not accessible:`, error.message)
      } else {
        console.log(`✅ Table '${table}' is accessible`)
      }
    } catch (error) {
      console.error(`❌ Error testing table '${table}':`, error.message)
    }
  }
}

async function main() {
  console.log('🚀 La Virtual Zone - Supabase Connection Test')
  console.log('=' * 50)

  const connected = await testConnection()

  if (connected) {
    await testTables()
  }

  console.log('\n' + '=' * 50)
  if (connected) {
    console.log('🎉 Supabase connection test completed successfully!')
    console.log('You can now proceed with the migration.')
  } else {
    console.log('❌ Supabase connection test failed.')
    console.log('Please check your configuration and try again.')
  }
}

main().catch(console.error)
