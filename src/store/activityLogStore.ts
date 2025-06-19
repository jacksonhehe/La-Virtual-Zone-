import { create } from 'zustand';

export interface ActivityLogEntry {
  id: string;
  action: string;
  date: string;
  details?: string;
}

interface ActivityLogState {
  logs: ActivityLogEntry[];
  addLog: (action: string, details?: string) => void;
  clearLogs: () => void;
}

export const useActivityLogStore = create<ActivityLogState>((set) => ({
  logs: [],
  addLog: (action, details) =>
    set((state) => ({
      logs: [
        { id: `${Date.now()}`, action, date: new Date().toISOString(), details },
        ...state.logs
      ]
    })),
  clearLogs: () => set({ logs: [] })
}));
