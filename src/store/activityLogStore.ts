import { create } from 'zustand';

export interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  date: string;
  details: string;
}

interface ActivityLogState {
  logs: ActivityLogEntry[];
  addLog: (action: string, userId: string, details: string) => void;
}

export const useActivityLogStore = create<ActivityLogState>(set => ({
  logs: [],
  addLog: (action, userId, details) =>
    set(state => ({
      logs: [
        {
          id: `${Date.now()}`,
          action,
          userId,
          date: new Date().toISOString(),
          details
        },
        ...state.logs
      ]
    }))
}));
