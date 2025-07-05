import { describe, it, expect, beforeEach, vi } from 'vitest';

const selectMock = vi.fn(() => ({ data: [] }));
const deleteMock = vi.fn(() => ({ in: vi.fn() }));
const upsertMock = vi.fn();
let fromMock: any;

vi.mock('../src/supabaseClient', () => {
  fromMock = vi.fn(() => ({ select: selectMock, delete: deleteMock, upsert: upsertMock }));
  return { supabase: { from: fromMock, auth: { getSession: vi.fn(() => ({ data: { session: null } })) } } };
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe('useGlobalStore addTournament', () => {
  it('updates state and persists through saveAdminData', async () => {
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

    await new Promise(setImmediate);
    expect(upsertMock).toHaveBeenCalled();
  });
});
