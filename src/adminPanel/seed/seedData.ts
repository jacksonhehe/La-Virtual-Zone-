// src/adminPanel/seed/seedData.ts
export type User = { id: string; name: string }
export type Club = { id: string; name: string }
export type Player = { id: string; name: string }
export type TransferStatus = 'pending' | 'approved' | 'rejected'
export type Transfer = {
  id: string
  playerId: string
  playerName?: string
  fromClubId?: string
  fromClubName?: string
  toClubId?: string
  toClubName?: string
  amount?: number
  fee?: number
  status: TransferStatus
  createdAt: string
  date?: string
  reason?: string
}

const clubs: Club[] = [
  { id: 'C1', name: 'Tiburones FC' },
  { id: 'C2', name: 'Leones United' },
  { id: 'C3', name: 'Águilas DF' },
  { id: 'C4', name: 'Toros del Sur' },
  { id: 'C5', name: 'Norte Real' },
]

const players: Player[] = [
  { id: 'P1', name: 'Juan Pérez' },
  { id: 'P2', name: 'Carlos Díaz' },
  { id: 'P3', name: 'Luis Romero' },
  { id: 'P4', name: 'Matías Gómez' },
  { id: 'P5', name: 'Diego Castro' },
  { id: 'P6', name: 'Santiago Vega' },
  { id: 'P7', name: 'Marcos López' },
  { id: 'P8', name: 'Jorge Méndez' },
  { id: 'P9', name: 'Leo Márquez' },
  { id: 'P10', name: 'Iván Ortiz' },
]

const users: User[] = [
  { id: 'U1', name: 'Admin' },
  { id: 'U2', name: 'Editor' },
  { id: 'U3', name: 'Moderador' },
]

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]
const now = () => new Date().toISOString()

function genTransfers(n = 24): Transfer[] {
  const out: Transfer[] = []
  for (let i = 0; i < n; i++) {
    const player = pick(players)
    let from = pick(clubs)
    let to = pick(clubs)
    // evitar mismo club
    if (to.id === from.id) {
      to = clubs[(clubs.indexOf(to)+1) % clubs.length]
    }
    const amount = Math.floor(50_000 + Math.random() * 1_500_000)
    const created = new Date(Date.now() - Math.floor(Math.random() * 1000*60*60*24*20))
    const statuses: TransferStatus[] = ['pending','approved','rejected']
    const status = pick(statuses)
    out.push({
      id: 'T'+(1000+i),
      playerId: player.id,
      playerName: player.name,
      fromClubId: from.id,
      fromClubName: from.name,
      toClubId: to.id,
      toClubName: to.name,
      amount,
      status,
      createdAt: created.toISOString(),
      date: created.toISOString(),
      reason: status === 'rejected' ? 'Oferta insuficiente' : undefined,
    })
  }
  // Orden descendente por fecha
  out.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return out
}

export const seedData = {
  users,
  clubs,
  players,
  transfers: genTransfers(),
}
