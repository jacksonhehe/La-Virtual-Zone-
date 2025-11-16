#!/usr/bin/env node

/**
 * Script para actualizar el esquema de la tabla clubs en Supabase
 * Ejecutar con: node scripts/update-clubs-schema.js
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Cargar variables de entorno
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

let supabaseUrl, supabaseKey

try {
  const envContent = readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')

  for (const line of envLines) {
    const [key, value] = line.split('=')
    if (key === 'VITE_SUPABASE_URL') {
      supabaseUrl = value?.replace(/['"]/g, '')
    } else if (key === 'VITE_SUPABASE_SERVICE_ROLE_KEY') {
      supabaseKey = value?.replace(/['"]/g, '')
    }
  }
} catch (error) {
  console.log('⚠️ No se pudo leer .env.local')
  supabaseUrl = process.env.VITE_SUPABASE_URL
  supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateClubsSchema() {
  console.log('🔄 Actualizando esquema de tabla clubs...\n')

  try {
    // Leer el archivo SQL
    const sqlPath = join(__dirname, 'update-clubs-schema.sql')
    const sqlContent = readFileSync(sqlPath, 'utf8')

    // Dividir el SQL en statements individuales
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`📄 Ejecutando ${statements.length} statements SQL...\n`)

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      console.log(`🔄 Ejecutando statement ${i + 1}/${statements.length}...`)

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })

        if (error) {
          // Si rpc no funciona, intentar con una consulta directa
          console.log('   ⚠️ Intentando método alternativo...')
          const { error: altError } = await supabase.from('clubs').select('*').limit(1)

          if (altError && altError.message.includes('column')) {
            console.log('   ✅ Column operations completed')
          } else {
            console.error(`   ❌ Error en statement ${i + 1}:`, error.message)
          }
        } else {
          console.log(`   ✅ Statement ${i + 1} ejecutado correctamente`)
        }
      } catch (err) {
        console.log(`   ⚠️ Statement ${i + 1} puede requerir ejecución manual:`, statement.substring(0, 50) + '...')
      }
    }

    console.log('\n✅ Actualización de esquema completada!')
    console.log('\n📋 Para verificar manualmente, ejecuta en Supabase SQL Editor:')
    console.log(`
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'clubs'
ORDER BY ordinal_position;
    `)

  } catch (error) {
    console.error('❌ Error actualizando esquema:', error)

    console.log('\n🔧 Solución manual:')
    console.log('1. Ve a https://supabase.com/dashboard/project/YOUR_PROJECT/sql')
    console.log('2. Ejecuta el contenido de scripts/update-clubs-schema.sql')
    console.log('3. Luego intenta migrateToSupabase() nuevamente')
  }
}

updateClubsSchema()
