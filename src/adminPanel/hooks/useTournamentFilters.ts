import { useGlobalStore } from '../store/globalStore';
import type { Tournament } from '../types';

export const useUpcomingTournaments = (): Tournament[] =>
  useGlobalStore(state => state.tournaments.filter(t => t.status === 'upcoming'));

export const useActiveTournaments = (): Tournament[] =>
  useGlobalStore(state => state.tournaments.filter(t => t.status === 'active'));

export const useFinishedTournaments = (): Tournament[] =>
  useGlobalStore(state => state.tournaments.filter(t => t.status === 'completed'));
