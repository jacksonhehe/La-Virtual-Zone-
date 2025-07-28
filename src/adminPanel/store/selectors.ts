// src/adminPanel/store/selectors.ts
import type { Transfer } from '../seed/seedData'

export const ensureArr = <T,>(v: T[] | undefined | null): T[] => Array.isArray(v) ? v : []

export const countByStatus = (transfers?: Transfer[]) => {
  const t = ensureArr(transfers)
  let pending = 0, approved = 0, rejected = 0
  for (const x of t) {
    if (x.status === 'pending') pending++
    else if (x.status === 'approved') approved++
    else if (x.status === 'rejected') rejected++
  }
  return { pending, approved, rejected }
}

export const sumValue = (transfers?: Transfer[]) => {
  const t = ensureArr(transfers)
  return t.reduce((s, x) => s + (x.amount ?? x.fee ?? 0), 0)
}

export const avgValue = (transfers?: Transfer[]) => {
  const t = ensureArr(transfers)
  const total = sumValue(t)
  return t.length ? total / t.length : 0
}

export const maxValue = (transfers?: Transfer[]) => {
  const t = ensureArr(transfers)
  return t.reduce((m, x) => Math.max(m, (x.amount ?? x.fee ?? 0)), 0)
}

export const topClubFromTransfers = (transfers?: Transfer[]) => {
  const t = ensureArr(transfers)
  const cnt: Record<string, number> = {}
  for (const x of t) {
    const a = String(x.fromClubName || x.fromClubId || '')
    const b = String(x.toClubName || x.toClubId || '')
    if (a) cnt[a] = (cnt[a] || 0) + 1
    if (b) cnt[b] = (cnt[b] || 0) + 1
  }
  let best = '', bestC = 0
  for (const [k, v] of Object.entries(cnt)) {
    if (v > bestC) { best = k; bestC = v }
  }
  return best ? `${best} (${bestC})` : '—'
}

export const recentByDate = (transfers?: Transfer[], take = 7) => {
  const t = ensureArr(transfers)
  return t.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, take)
}
