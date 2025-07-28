// src/adminPanel/store/globalStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { seedData, type Transfer, type TransferStatus, type Club, type Player, type User } from '../seed/seedData'

export type Activity = {
  id: string
  type: 'transfer:created' | 'transfer:approved' | 'transfer:rejected'
  refId?: string
  message: string
  at: string // ISO
  meta?: Record<string, any>
}

type StoreState = {
  users: User[]
  clubs: Club[]
  players: Player[]
  transfers: Transfer[]
  activities: Activity[]

  refreshAll?: () => void
  refreshTransfers?: () => void
  approveTransfer?: (id: string) => void
  rejectTransfer?: (id: string, reason?: string) => void
  addMockTransfers?: (n?: number) => void
}

const ensureArr = <T,>(v: T[] | undefined | null): T[] => Array.isArray(v) ? v : []

function pushActivity(activities: Activity[], a: Activity, max = 100) {
  const out = [a, ...activities]
  if (out.length > max) out.length = max
  return out
}

export const useGlobalStore = create<StoreState>()(persist(
  (set, get) => ({
    users: seedData.users,
    clubs: seedData.clubs,
    players: seedData.players,
    transfers: seedData.transfers,
    activities: [],

    refreshAll: () => {
      const raw = localStorage.getItem('mock-db')
      if (raw) {
        try {
          const data = JSON.parse(raw)
          set({
            users: ensureArr<User>(data.users) ?? seedData.users,
            clubs: ensureArr<Club>(data.clubs) ?? seedData.clubs,
            players: ensureArr<Player>(data.players) ?? seedData.players,
            transfers: ensureArr<Transfer>(data.transfers) ?? seedData.transfers,
            activities: ensureArr<Activity>(data.activities) ?? [],
          })
        } catch {}
      }
    },

    refreshTransfers: () => {
      const raw = localStorage.getItem('mock-db')
      if (raw) {
        try {
          const data = JSON.parse(raw)
          set({ transfers: ensureArr<Transfer>(data.transfers) ?? seedData.transfers })
        } catch {}
      }
    },

    approveTransfer: (id: string) => {
      const state = get()
      const list = ensureArr(state.transfers).map(t => {
        if (String(t.id) === String(id)) {
          return { ...t, status: 'approved' as TransferStatus, reason: undefined }
        }
        return t
      })
      const act: Activity = {
        id: 'A'+Date.now(),
        type: 'transfer:approved',
        refId: id,
        message: `Transferencia ${id} aprobada`,
        at: new Date().toISOString()
      }
      const activities = pushActivity(ensureArr(state.activities), act)
      set({ transfers: list, activities })
      localStorage.setItem('mock-db', JSON.stringify({ 
        users: state.users, clubs: state.clubs, players: state.players,
        transfers: list, activities
      }))
    },

    rejectTransfer: (id: string, reason?: string) => {
      const state = get()
      const list = ensureArr(state.transfers).map(t => {
        if (String(t.id) === String(id)) {
          return { ...t, status: 'rejected' as TransferStatus, reason: reason || 'Sin motivo' }
        }
        return t
      })
      const act: Activity = {
        id: 'A'+Date.now(),
        type: 'transfer:rejected',
        refId: id,
        message: `Transferencia ${id} rechazada`,
        at: new Date().toISOString(),
        meta: { reason }
      }
      const activities = pushActivity(ensureArr(state.activities), act)
      set({ transfers: list, activities })
      localStorage.setItem('mock-db', JSON.stringify({ 
        users: state.users, clubs: state.clubs, players: state.players,
        transfers: list, activities
      }))
    },

    addMockTransfers: (n = 5) => {
      const state = get()
      const list = ensureArr(state.transfers).slice()
      for (let i = 0; i < n; i++) {
        const p = state.players[Math.floor(Math.random()*state.players.length)]
        const from = state.clubs[Math.floor(Math.random()*state.clubs.length)]
        let to = state.clubs[Math.floor(Math.random()*state.clubs.length)]
        if (to.id === from.id) {
          to = state.clubs[(state.clubs.indexOf(to)+1) % state.clubs.length]
        }
        const amount = Math.floor(100_000 + Math.random()*2_000_000)
        const id = 'T' + (Date.now() + i)
        const createdAt = new Date().toISOString()
        list.unshift({
          id, playerId: p.id, playerName: p.name,
          fromClubId: from.id, fromClubName: from.name,
          toClubId: to.id, toClubName: to.name,
          amount, status: 'pending', createdAt, date: createdAt
        } as Transfer)
        const act: Activity = {
          id: 'A'+(Date.now()+i),
          type: 'transfer:created',
          refId: id,
          message: `Nueva oferta ${id} (${p.name})`,
          at: createdAt
        }
        const activities = pushActivity(ensureArr(get().activities), act)
        set({ activities })
      }
      set({ transfers: list })
      localStorage.setItem('mock-db', JSON.stringify({ 
        users: state.users, clubs: state.clubs, players: state.players,
        transfers: list, activities: get().activities
      }))
    },

  }),
  { name: 'global-store' }
))
