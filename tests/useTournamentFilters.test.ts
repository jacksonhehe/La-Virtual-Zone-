import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
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
    const { result } = renderHook(() => useUpcomingTournaments());
    expect(result.current).toHaveLength(2);
    expect(result.current.every(t => t.status === 'upcoming')).toBe(true);
  });

  it('returns only active tournaments', () => {
    const { result } = renderHook(() => useActiveTournaments());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].status).toBe('active');
  });

  it('returns only finished tournaments', () => {
    const { result } = renderHook(() => useFinishedTournaments());
    expect(result.current).toHaveLength(1);
    expect(result.current[0].status).toBe('completed');
  });
});
