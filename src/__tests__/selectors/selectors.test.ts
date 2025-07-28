// src/__tests__/selectors/selectors.test.ts
import { describe, it, expect } from 'vitest'
import { countByStatus, sumValue, avgValue, maxValue, topClubFromTransfers, recentByDate } from '../../adminPanel/store/selectors'

const tx = [
  { id:'1', status:'pending', amount: 100, createdAt: '2024-01-03T00:00:00Z', fromClubName:'A', toClubName:'B' },
  { id:'2', status:'approved', amount: 200, createdAt: '2024-01-02T00:00:00Z', fromClubName:'A', toClubName:'C' },
  { id:'3', status:'rejected', amount: 50, createdAt: '2024-01-04T00:00:00Z', fromClubName:'B', toClubName:'C' },
] as any

describe('selectors', () => {
  it('countByStatus', () => {
    expect(countByStatus(tx)).toEqual({ pending:1, approved:1, rejected:1 })
    expect(countByStatus(undefined)).toEqual({ pending:0, approved:0, rejected:0 })
  })

  it('sum/avg/max', () => {
    expect(sumValue(tx)).toBe(350)
    expect(Math.round(avgValue(tx))).toBe(Math.round(350/3))
    expect(maxValue(tx)).toBe(200)
  })

  it('topClubFromTransfers', () => {
    expect(topClubFromTransfers(tx)).toContain('(2)')
  })

  it('recentByDate ordered', () => {
    const ids = recentByDate(tx, 3).map(x => x.id)
    expect(ids).toEqual(['3','1','2'])
  })
})
