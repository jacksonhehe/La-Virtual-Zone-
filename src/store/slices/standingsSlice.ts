import type { StateCreator } from 'zustand';
import { standings } from '../../data/standings';
import type { Standing } from '../../types';

export interface StandingsSlice {
  standings: Standing[];
  updateStandings: (items: Standing[]) => void;
}

export const createStandingsSlice: StateCreator<StandingsSlice, [], [], StandingsSlice> = (set) => ({
  standings,
  updateStandings: (items) => set({ standings: items }),
});
