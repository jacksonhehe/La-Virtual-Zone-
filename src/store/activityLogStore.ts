import { create } from 'zustand';
import { ActivityLogEntry } from '../types';

interface ActivityLogState {
  logs: ActivityLogEntry[];
  addLog: (entry: Omit<ActivityLogEntry, 'id'>) => void;
  clear: () => void;
}

export const useActivityLogStore = create<ActivityLogState>((set) => ({
  logs: [],
  addLog: (entry) =>
    set((state) => ({
      logs: [
        { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
        ...state.logs,
      ],
    })),
  clear: () => set({ logs: [] }),
}));
