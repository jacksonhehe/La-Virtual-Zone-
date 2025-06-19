import { create } from 'zustand';

export interface Activity {
  id: string;
  message: string;
  date: string;
}

interface ActivityState {
  activities: Activity[];
  addActivity: (message: string) => void;
}

export const useActivityStore = create<ActivityState>(set => ({
  activities: [],
  addActivity: (message) =>
    set(state => ({
      activities: [
        { id: `act${Date.now()}`, message, date: new Date().toISOString() },
        ...state.activities
      ]
    }))
}));

