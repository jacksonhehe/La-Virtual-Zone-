import { useMemo } from 'react';
import { useGlobalStore } from '../store/globalStore';
import type { Tournament } from '../types';

export function useUpcomingTournaments(): Tournament[] {
  const tournaments = useGlobalStore(state => state.tournaments);
  return useMemo(
    () => tournaments.filter(t => t.status === 'upcoming'),
    [tournaments]
  );
}

export function useActiveTournaments(): Tournament[] {
  const tournaments = useGlobalStore(state => state.tournaments);
  return useMemo(
    () => tournaments.filter(t => t.status === 'active'),
    [tournaments]
  );
}

export function useFinishedTournaments(): Tournament[] {
  const tournaments = useGlobalStore(state => state.tournaments);
  return useMemo(
    () => tournaments.filter(t => t.status === 'completed'),
    [tournaments]
  );
}
