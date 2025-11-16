
import 'fake-indexeddb/auto'

/**
 * Script de migracion: IndexedDB -> Supabase
 * Ejecutar con: npx tsx scripts/migrate-to-supabase.ts
 */

import { createClient } from '@supabase/supabase-js'
import { dbService } from '../src/utils/indexedDBService'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '..', '.env.local')

let supabaseUrl: string | undefined
let supabaseKey: string | undefined

try {
  const envContent = readFileSync(envPath, 'utf8')
  const envLines = envContent.split('\n')

  for (const rawLine of envLines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const [key, value] = line.split('=')
    if (key === 'VITE_SUPABASE_URL') {
      supabaseUrl = value?.replace(/['"]/g, '').trim()
    } else if (key === 'VITE_SUPABASE_SERVICE_ROLE_KEY') {
      supabaseKey = value?.replace(/['"]/g, '').trim()
    }
  }
} catch (error) {
  console.log('[info] No se pudo leer .env.local, usando variables de entorno del sistema')
  supabaseUrl = process.env.VITE_SUPABASE_URL
  supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
}

if (!supabaseUrl || !supabaseKey) {
  console.error('[error] Missing Supabase environment variables')
  console.error('Asegurate de definir VITE_SUPABASE_URL y VITE_SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const FREE_AGENT_MARKERS = new Set([
  'libre',
  'libres',
  'free',
  'free agent',
  'free agents',
  'agente libre',
  'agentes libres'
])

const nowISO = () => new Date().toISOString()

const normalizeClubId = (clubId?: string | null) => {
  if (!clubId) return null
  const trimmed = clubId.trim()
  if (!trimmed) return null
  return FREE_AGENT_MARKERS.has(trimmed.toLowerCase()) ? null : trimmed
}

const mapClubRecordForSupabase = (club: any) => {
  const { titles, ...rest } = club
  return {
    ...rest,
    created_at: rest.created_at ?? nowISO(),
    updated_at: nowISO()
  }
}

const mapPlayerRecordForSupabase = (player: any) => {
  const transferValue = player.transferValue ?? player.marketValue ?? 0

  return {
    id: player.id,
    name: player.name,
    age: player.age ?? 25,
    position: player.position,
    nationality: player.nationality ?? 'Argentina',
    club_id: normalizeClubId(player.clubId),
    overall: player.overall ?? 50,
    potential: player.potential ?? player.overall ?? 50,
    transfer_listed: player.transferListed ?? false,
    transfer_value: transferValue,
    image: player.image ?? '',
    attributes: player.attributes ?? {},
    skills: player.skills ?? {},
    playing_styles: player.playingStyles ?? {},
    contract: player.contract ?? { expires: nowISO(), salary: 0 },
    form: player.form ?? 3,
    goals: player.goals ?? 0,
    assists: player.assists ?? 0,
    appearances: player.appearances ?? 0,
    matches: player.matches ?? 0,
    dorsal: player.dorsal ?? 1,
    injury_resistance: player.injuryResistance ?? 50,
    height: player.height ?? null,
    weight: player.weight ?? null,
    created_at: player.created_at ?? nowISO(),
    updated_at: nowISO()
  }
}

async function migrateTable(tableName: string, data: any[], mapper?: (record: any) => any) {
  if (!data || data.length === 0) {
    console.log(`[skip] No hay datos para '${tableName}'`)
    return
  }

  console.log(`[sync] Migrando ${data.length} registros a '${tableName}'...`)

  try {
    const batchSize = 100
    let migrated = 0

    for (let i = 0; i < data.length; i += batchSize) {
      const slice = data.slice(i, i + batchSize)
      const batch = mapper ? slice.map(mapper) : slice
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, { onConflict: 'id' })

      if (error) {
        console.error(`[error] Fallo el lote ${i / batchSize + 1} para '${tableName}':`, error.message)
        throw error
      }

      migrated += batch.length
      console.log(`[sync] ${migrated}/${data.length} registros migrados a '${tableName}'`)
    }

    console.log(`[ok] Migracion completada para '${tableName}'`)
  } catch (error) {
    console.error(`[error] No se pudo migrar '${tableName}':`, error)
    throw error
  }
}

async function migrateData() {
  console.log('[init] Iniciando migracion desde IndexedDB hacia Supabase...')

  try {
    console.log('[step] Migrando clubs...')
    const clubs = await dbService.getAll('clubs')
    await migrateTable('clubs', clubs, mapClubRecordForSupabase)

    console.log('[step] Migrando players...')
    const players = await dbService.getAll('players')
    await migrateTable('players', players, mapPlayerRecordForSupabase)

    console.log('[step] Migrando tournaments...')
    const tournaments = await dbService.getAll('tournaments')
    await migrateTable('tournaments', tournaments)

    console.log('[step] Migrando matches (si existen)...')
    try {
      const matches = await dbService.getAll('matches')
      if (matches && matches.length > 0) {
        await migrateTable('matches', matches)
      } else {
        console.log('[skip] No se encontraron matches para migrar')
      }
    } catch (error) {
      console.log('[skip] Tabla de matches no encontrada, se omite')
    }

    console.log('[step] Migrando transfers (si existen)...')
    try {
      const transfers = await dbService.getAll('transfers')
      if (transfers && transfers.length > 0) {
        await migrateTable('transfers', transfers)
      } else {
        console.log('[skip] No se encontraron transfers para migrar')
      }
    } catch (error) {
      console.log('[skip] Tabla de transfers no encontrada, se omite')
    }

    console.log('[done] Migracion completada correctamente')
    console.log('Ahora puedes probar con VITE_USE_SUPABASE=true')
  } catch (error) {
    console.error('[fatal] La migracion fallo:', error)
    console.log('Revisa credenciales, tablas existentes y politicas RLS antes de reintentar')
    process.exit(1)
  }
}

async function verifyMigration() {
  console.log('\n[verify] Verificando conteo de tablas en Supabase...')

  try {
    const [clubsResult, playersResult, tournamentsResult] = await Promise.all([
      supabase.from('clubs').select('count', { count: 'exact', head: true }),
      supabase.from('players').select('count', { count: 'exact', head: true }),
      supabase.from('tournaments').select('count', { count: 'exact', head: true })
    ])

    console.log(`[verify] Clubs: ${clubsResult.count ?? 0}`)
    console.log(`[verify] Players: ${playersResult.count ?? 0}`)
    console.log(`[verify] Tournaments: ${tournamentsResult.count ?? 0}`)
  } catch (error) {
    console.error('[error] No se pudo verificar la migracion:', error)
  }
}

migrateData()
  .then(() => verifyMigration())
  .then(() => {
    console.log('\n[next] Pasos sugeridos:')
    console.log('1. Probar la app con VITE_USE_SUPABASE=true')
    console.log('2. Validar que las funciones principales sigan funcionando')
    console.log('3. Activar politicas RLS definitivas en produccion')
    console.log('4. Configurar backups automaticos en Supabase')
  })
  .catch((error) => {
    console.error('[fatal] El script de migracion termino con errores:', error)
    process.exit(1)
  })
