import { describe, it, expect } from 'vitest'

describe('useGlobalStore addTournament', () => {
  it.skip('updates state', async () => {
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
  });
});
