import  { create } from 'zustand';
import { createBaseSlice, type BaseSlice } from './slices/baseSlice';
import { createMarketSlice, type MarketSlice } from './slices/marketSlice';
import { createMediaSlice, type MediaSlice } from './slices/mediaSlice';
import { createStandingsSlice, type StandingsSlice } from './slices/standingsSlice';
import { createFaqsSlice, type FaqsSlice } from './slices/faqsSlice';
// Tienda eliminada: slice de tienda removido
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
    }
  } catch (error) {
    console.error('Error initializing data store:', error);
  }
})();
