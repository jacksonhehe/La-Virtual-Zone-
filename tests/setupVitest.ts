import 'cross-fetch/polyfill'
import { vi } from 'vitest'

vi.mock('@/lib/supabaseClient', () => {
  const query: any = {
    select: vi.fn(() => query),
    insert: vi.fn(() => query),
    update: vi.fn(() => query),
    upsert: vi.fn(() => query),
    delete: vi.fn(() => query),
    order: vi.fn(() => query),
    eq: vi.fn(() => query),
    single: vi.fn(async () => ({ data: null, error: null })),
    then: vi.fn(cb => Promise.resolve(cb({ data: [], error: null }))),
  }
  const from = vi.fn(() => query)
  return { supabase: { from, auth: { getUser: vi.fn(async () => ({ data: { user: null } })) } } }
})
