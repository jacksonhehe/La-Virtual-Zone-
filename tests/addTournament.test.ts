import { describe, it, expect, beforeEach, vi } from 'vitest';

const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  } as Storage;
};

beforeEach(() => {
  vi.resetModules();
  delete (global as any).localStorage;
});

describe('useGlobalStore addTournament', () => {
  it('updates state and persists through adminStorage', async () => {
    const mockStorage = createMockStorage();
    (global as any).localStorage = mockStorage;
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

    const stored = JSON.parse(mockStorage.getItem('vz_tournaments_admin') || '[]');
    expect(stored).toContainEqual(tournament);

    vi.resetModules();
    const { useGlobalStore: reloaded } = await import('../src/adminPanel/store/globalStore');
    expect(reloaded.getState().tournaments).toContainEqual(tournament);
  });
});
