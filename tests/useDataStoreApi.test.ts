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
  (global as any).localStorage = createMockStorage();
});

describe('useDataStore API', () => {
  it('loads data from API on init', async () => {
    const clubs = [{ id: '1', name: 'Test FC' }];
    const players = [{ id: 'p1', name: 'Player 1' }];
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(clubs) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(players) });

    const { useDataStore } = await import('../src/store/dataStore');
    await Promise.resolve();
    expect(useDataStore.getState().clubs).toEqual(clubs);
    expect(useDataStore.getState().players).toEqual(players);
  });
});
