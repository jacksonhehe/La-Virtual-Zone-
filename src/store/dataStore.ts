import  { create } from 'zustand';
import { createBaseSlice, type BaseSlice } from './slices/baseSlice';
import { createMarketSlice, type MarketSlice } from './slices/marketSlice';
import { createMediaSlice, type MediaSlice } from './slices/mediaSlice';
import { createStandingsSlice, type StandingsSlice } from './slices/standingsSlice';
import { createFaqsSlice, type FaqsSlice } from './slices/faqsSlice';
type DataState = BaseSlice & MarketSlice & MediaSlice & StandingsSlice & FaqsSlice;

export const useDataStore = create<DataState>()((...a) => ({
  ...createBaseSlice(...a),
  ...createMarketSlice(...a),
  ...createMediaSlice(...a),
  ...createStandingsSlice(...a),
  ...createFaqsSlice(...a),
}));

// Initialize data immediately after store creation (no setTimeout)
(async () => {
  try {
    const store = useDataStore.getState();
    await store.initializeDataFromService();
    await store.initializeMediaItems(); // Initialize media items after other data
    console.log('Data store initialized successfully');

    // Make store available globally for debugging functions
    if (typeof window !== 'undefined') {
      (window as any).dataStore = store;

      // Agregar función de debug para recalcular standings manualmente
      (window as any).recalculateStandings = async () => {
        const { recalculateAndUpdateStandings } = await import('../utils/standingsHelpers');
        await recalculateAndUpdateStandings('tournament1');
        console.log('Standings recalculated manually');
      };
    }
  } catch (error) {
    console.error('Error initializing data store:', error);
  }
})();
