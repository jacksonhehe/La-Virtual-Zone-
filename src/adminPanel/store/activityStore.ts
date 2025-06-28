import  { create } from 'zustand';

interface ActivityStore {
  activities: string[];
  addActivity: (activity: string) => void;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  addActivity: (activity) => set((state) => ({ 
    activities: [...state.activities, activity] 
  })),
}));
 