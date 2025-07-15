import { describe, it, expect, vi } from 'vitest'
import { getState, setState } from '../src/adminPanel/utils/adminStorage'
import { supabase } from '../src/lib/supabaseClient'

const valueStore: Record<string, any> = {}
let currentKey = ''
const query = {
  select: vi.fn(() => query),
  eq: vi.fn((field: string, val: string) => {
    if (field === 'key') currentKey = val
    return query
  }),
  single: vi.fn(async () => ({ data: { value: valueStore[currentKey] }, error: null })),
  upsert: vi.fn(async ({ key, value }: any) => {
    valueStore[key] = value
    return { error: null }
  }),
}

vi.spyOn(supabase, 'from').mockReturnValue(query as any)

describe('adminStorage supabase', () => {
  it('stores and retrieves state', async () => {
    await setState('k', { test: 1 }, 'u1')
    const val = await getState('k', 'u1')
    expect(val).toEqual({ test: 1 })
  })
})
