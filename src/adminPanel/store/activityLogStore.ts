import  { create } from 'zustand';
import { ActivityLog } from '../types';

interface ActivityLogStore {
  logs: ActivityLog[];
  addLog: (log: ActivityLog) => void;
}

export const useActivityLogStore = create<ActivityLogStore>((set) => ({
  logs: [],
  addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
}));
 