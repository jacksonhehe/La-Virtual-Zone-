import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_KEY || ''

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false }
})

async function run() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be provided')
  }

  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'demo@lvrzone.dev',
    password: 'Demo1234!',
    email_confirm: true,
    user_metadata: { role: 'ADMIN' }
  })
  if (userError) throw userError

  const userId = userData.user?.id
  if (!userId) throw new Error('No demo user id')

  const { data: clubsData, error: clubsError } = await supabase
    .from('clubs')
    .insert([
      { name: 'Demo Club 1', slug: 'demo-club-1', owner_id: userId },
      { name: 'Demo Club 2', slug: 'demo-club-2', owner_id: userId },
      { name: 'Demo Club 3', slug: 'demo-club-3', owner_id: userId }
    ])
    .select()
  if (clubsError) throw clubsError

  const players = [
    { name: 'Player 1A', club_id: clubsData[0].id, position: 'GK', rating: 70 },
    { name: 'Player 1B', club_id: clubsData[0].id, position: 'DF', rating: 68 },
    { name: 'Player 2A', club_id: clubsData[1].id, position: 'MF', rating: 72 },
    { name: 'Player 2B', club_id: clubsData[1].id, position: 'FW', rating: 75 },
    { name: 'Player 3A', club_id: clubsData[2].id, position: 'MF', rating: 69 },
    { name: 'Player 3B', club_id: clubsData[2].id, position: 'FW', rating: 74 }
  ]

  const { error: playersError } = await supabase.from('players').insert(players)
  if (playersError) throw playersError

  console.log('Seed terminado')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
