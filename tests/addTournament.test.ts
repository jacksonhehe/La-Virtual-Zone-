import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/lib/supabaseClient', () => {
  const store: any[] = []
  const query = {
    insert: vi.fn((payload: any) => {
      store.push(payload)
      return { single: () => Promise.resolve({ data: payload, error: null }) }
    }),
  }
  return {
    supabase: {
      from: vi.fn(() => query),
    },
  }
})

beforeEach(() => {
  vi.resetModules()
})

describe('useGlobalStore addTournament', () => {
  it('updates state and persists through adminStorage', async () => {
    const { useGlobalStore } = await import('../src/adminPanel/store/globalStore');

    const tournament = {
      id: 't1',
      name: 'Test Tournament',
      status: 'upcoming' as const,
      currentRound: 0,
      totalRounds: 2,
    };

    useGlobalStore.getState().addTournament(tournament);

    expect(useGlobalStore.getState().tournaments).toContainEqual(tournament);

    vi.resetModules();
    const { useGlobalStore: reloaded } = await import('../src/adminPanel/store/globalStore');
    expect(reloaded.getState().tournaments).toContainEqual(tournament);
  });
});
