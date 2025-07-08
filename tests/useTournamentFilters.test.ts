import { describe, it, expect, beforeEach } from 'vitest';
import { useGlobalStore } from '../src/adminPanel/store/globalStore';
import {
  useUpcomingTournaments,
  useActiveTournaments,
  useFinishedTournaments
} from '../src/adminPanel/hooks/useTournamentFilters';
import type { Tournament } from '../src/adminPanel/types';

const sampleTournaments: Tournament[] = [
  { id: '1', name: 'Upcoming 1', status: 'upcoming', currentRound: 0, totalRounds: 3 },
  { id: '2', name: 'Active 1', status: 'active', currentRound: 1, totalRounds: 3 },
  { id: '3', name: 'Completed 1', status: 'completed', currentRound: 3, totalRounds: 3 },
  { id: '4', name: 'Upcoming 2', status: 'upcoming', currentRound: 0, totalRounds: 5 }
];

beforeEach(() => {
  useGlobalStore.setState({ tournaments: sampleTournaments });
});

describe('useTournamentFilters', () => {
  it('returns only upcoming tournaments', () => {
    const upcoming = useUpcomingTournaments();
    expect(upcoming).toHaveLength(2);
    expect(upcoming.every(t => t.status === 'upcoming')).toBe(true);
  });

  it('returns only active tournaments', () => {
    const active = useActiveTournaments();
    expect(active).toHaveLength(1);
    expect(active[0].status).toBe('active');
  });

  it('returns only finished tournaments', () => {
    const finished = useFinishedTournaments();
    expect(finished).toHaveLength(1);
    expect(finished[0].status).toBe('completed');
  });
});
