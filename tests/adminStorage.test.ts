import { describe, it, expect, vi } from 'vitest'
import { getState, setState } from '../src/adminPanel/utils/adminStorage'

vi.mock('../src/lib/supabaseClient', () => {
  const valueStore: Record<string, any> = {}
  let currentKey = ''
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn((field: string, val: string) => {
      if (field === 'key') currentKey = val
      return query
    }),
    single: vi.fn(async () => ({ data: { value: valueStore[currentKey] } })),
    upsert: vi.fn(async ({ key, value }) => {
      valueStore[key] = value
      return { error: null }
    }),
  }
  return {
    supabase: {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
      },
      from: vi.fn(() => query),
    },
  }
})

describe('adminStorage supabase', () => {
  it('stores and retrieves state', async () => {
    await setState('k', { test: 1 })
    const val = await getState('k')
    expect(val).toEqual({ test: 1 })
  })
})
