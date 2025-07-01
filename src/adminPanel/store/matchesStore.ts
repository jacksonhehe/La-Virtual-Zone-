import { create } from 'zustand';
import { useGlobalStore } from './globalStore';
import { Fixture } from '../types';

interface MatchesStore {
  confirmMatch: (id: string) => void;
  rejectMatch: (id: string, reason: string) => void;
}

export const useMatchesStore = create<MatchesStore>(() => ({
  confirmMatch: id => {
    const { matches, updateMatch } = useGlobalStore.getState();
    const match = matches.find(m => m.id === id);
    if (!match) return;
    updateMatch({ ...match, status: 'finished' });
  },
  rejectMatch: (id, _reason) => {
    const { matches, updateMatch } = useGlobalStore.getState();
    const match = matches.find(m => m.id === id);
    if (!match) return;
    updateMatch({
      ...match,
      status: 'scheduled',
      homeScore: undefined,
      awayScore: undefined,
    });
  }
}));
