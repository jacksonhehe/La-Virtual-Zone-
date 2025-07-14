import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_SERVICE_KEY || ''
)

async function run() {
  const file = fs.readFileSync('scripts/seedData.json', 'utf-8')
  const data = JSON.parse(file)

  if (data.clubs) {
    for (const club of data.clubs) {
      await supabase.from('clubs').insert(club)
    }
  }

  if (data.players) {
    for (const player of data.players) {
      await supabase.from('players').insert(player)
    }
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
