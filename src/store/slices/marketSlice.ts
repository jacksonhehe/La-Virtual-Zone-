import type { StateCreator } from 'zustand';
import { transfers as seedTransfers } from '../../data/transfers';
import { offers as seedOffers } from '../../data/offers';
import { marketStatus } from '../../data/market';
import { config } from '../../lib/config';
import { Transfer, TransferOffer } from '../../types';
import {
  upsertOfferToSupabase,
  updateOfferStatusInSupabase,
  upsertTransferToSupabase,
  fetchSupabaseOffers,
  fetchSupabaseTransfers,
  fetchSupabaseMarketStatus,
  upsertMarketStatusToSupabase
} from '../../utils/supabaseMarketSync';

const MARKET_STATUS_KEY = 'virtual_zone_market_status';
const OFFERS_KEY = 'virtual_zone_offers';
const TRANSFERS_KEY = 'virtual_zone_transfers';

function loadMarketStatus(defaultValue: boolean): boolean {
  try {
    const raw = localStorage.getItem(MARKET_STATUS_KEY);
    if (raw === null) return defaultValue;
    return raw === 'true';
  } catch {
    return defaultValue;
  }
}

export interface MarketSlice {
  marketStatus: boolean;
  transfers: Transfer[];
  offers: TransferOffer[];

  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected' | 'counter-offer', changes?: Partial<TransferOffer> & { historyEntry?: any }) => void;
  addTransfer: (transfer: Transfer) => void;
  refreshOffers: () => Promise<void>;
  refreshTransfers: () => Promise<void>;
  refreshMarketStatus: () => Promise<void>;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
}

export const createMarketSlice: StateCreator<MarketSlice, [], [], MarketSlice> = (set, get) => {
  const slice: MarketSlice = {
    marketStatus: loadMarketStatus(marketStatus),
    transfers: loadFromStorage<Transfer[]>(TRANSFERS_KEY, seedTransfers),
    offers: loadFromStorage<TransferOffer[]>(OFFERS_KEY, seedOffers),

    updateTransfers: (newTransfers) => {
      saveToStorage(TRANSFERS_KEY, newTransfers);
      set({ transfers: newTransfers });
    },
    updateOffers: (newOffers) => {
      saveToStorage(OFFERS_KEY, newOffers);
      set({ offers: newOffers });
    },

    updateMarketStatus: (status) => {
      try {
        localStorage.setItem(MARKET_STATUS_KEY, String(status));
      } catch { /* ignore */ }
      set({ marketStatus: status });
      if (config.useSupabase) {
        void upsertMarketStatusToSupabase(status);
      }
    },

    addOffer: (offer) => set((state) => {
      const next = [...state.offers, offer];
      saveToStorage(OFFERS_KEY, next);
      if (config.useSupabase) {
        void upsertOfferToSupabase(offer);
      }
      return { offers: next };
    }),

    updateOfferStatus: (offerId, status, changes) => set((state) => {
      const updated = state.offers.map((o) => {
        if (o.id !== offerId) return o;
        const next: TransferOffer = {
          ...o,
          status,
          ...changes,
        } as TransferOffer;
        if (changes && (changes as any).historyEntry) {
          const entry = (changes as any).historyEntry;
          next.history = [...(next.history || []), entry];
        }
        if (config.useSupabase) {
          void updateOfferStatusInSupabase(offerId, next);
        }
        return next;
      });
      saveToStorage(OFFERS_KEY, updated);
      return { offers: updated };
    }),

    addTransfer: (transfer) => set((state) => {
      const next = [transfer, ...state.transfers];
      saveToStorage(TRANSFERS_KEY, next);
      if (config.useSupabase) {
        void upsertTransferToSupabase(transfer);
      }
      return { transfers: next };
    }),

    refreshOffers: async () => {
      try {
        if (config.useSupabase) {
          const supabaseOffers = await fetchSupabaseOffers();
          saveToStorage(OFFERS_KEY, supabaseOffers);
          set({ offers: supabaseOffers });
          return;
        }
      } catch (error) {
        console.error('marketSlice - Error fetching offers from Supabase:', error);
      }
      set({ offers: loadFromStorage<TransferOffer[]>(OFFERS_KEY, seedOffers) });
    },

    refreshTransfers: async () => {
      try {
        if (config.useSupabase) {
          const supabaseTransfers = await fetchSupabaseTransfers();
          saveToStorage(TRANSFERS_KEY, supabaseTransfers);
          set({ transfers: supabaseTransfers });
          return;
        }
      } catch (error) {
        console.error('marketSlice - Error fetching transfers from Supabase:', error);
      }
      set({ transfers: loadFromStorage<Transfer[]>(TRANSFERS_KEY, seedTransfers) });
    },

    refreshMarketStatus: async () => {
      try {
        if (config.useSupabase) {
          const remoteStatus = await fetchSupabaseMarketStatus();
          if (typeof remoteStatus === 'boolean') {
            localStorage.setItem(MARKET_STATUS_KEY, String(remoteStatus));
            set({ marketStatus: remoteStatus });
            return;
          }
        }
      } catch (error) {
        console.error('marketSlice - Error fetching market status from Supabase:', error);
      }
      set({ marketStatus: loadMarketStatus(get().marketStatus) });
    },
  };

  if (config.useSupabase) {
    void (async () => {
      await Promise.all([
        slice.refreshOffers(),
        slice.refreshTransfers(),
        slice.refreshMarketStatus(),
      ]);
    })();
  }

  return slice;
};
