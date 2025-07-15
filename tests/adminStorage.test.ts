import { describe, it, expect } from 'vitest'
import { getState, setState } from '../src/adminPanel/utils/adminStorage'

describe('adminStorage supabase', () => {
  it('calls supabase without errors', async () => {
    await setState('k', { test: 1 }, 'u1')
    const val = await getState('k', 'u1')
    expect(val).toBeNull()
  })
})
