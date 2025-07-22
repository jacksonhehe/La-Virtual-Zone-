import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoreItem } from '../types';

interface ActiveAssets {
  background?: string; // id del item aplicado
  frame?: string;
  badge?: string;
  emoji?: string;
  theme?: string;
}

interface ShopState {
  coins: number;
  ownedItemIds: string[];
  cartIds: string[];
  activeAssets: ActiveAssets;
  purchaseItem: (item: StoreItem, userLevel?: number) => { success: boolean; message: string };
  addToCart: (item: StoreItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  checkout: (items: StoreItem[], userLevel?: number) => { success: boolean; message: string };
  applyItem: (item: StoreItem) => void;
  addCoins: (amount: number) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      coins: 5000, // saldo inicial para pruebas
      ownedItemIds: [],
      cartIds: [],
      activeAssets: {},

      purchaseItem: (item, userLevel = 1) => {
        const state = get();
        if (state.ownedItemIds.includes(item.id)) {
          return { success: false, message: 'Ya posees este artículo' };
        }
        if (userLevel < item.minLevel) {
          return { success: false, message: `Necesitas nivel ${item.minLevel}` };
        }
        if (state.coins < item.price) {
          return { success: false, message: 'Z-Coins insuficientes' };
        }
        set({
          coins: state.coins - item.price,
          ownedItemIds: [...state.ownedItemIds, item.id]
        });
        return { success: true, message: 'Compra realizada' };
      },

      addToCart: (item) => {
        set((state) => {
          if (state.cartIds.includes(item.id) || state.ownedItemIds.includes(item.id)) return state;
          return { cartIds: [...state.cartIds, item.id] };
        });
      },

      removeFromCart: (itemId) => set((state) => ({ cartIds: state.cartIds.filter(id => id !== itemId) })),

      clearCart: () => set({ cartIds: [] }),

      checkout: (items, userLevel = 1) => {
        const state = get();
        const total = items.reduce((sum, i) => sum + i.price, 0);
        if (total > state.coins) return { success: false, message: 'Z-Coins insuficientes' };
        // nivel check
        const insufficient = items.find(i => userLevel < i.minLevel);
        if (insufficient) return { success: false, message: `Necesitas nivel ${insufficient.minLevel} para ${insufficient.name}` };
        set({
          coins: state.coins - total,
          ownedItemIds: [...state.ownedItemIds, ...items.map(i => i.id)],
          cartIds: []
        });
        return { success: true, message: 'Compra realizada' };
      },

      applyItem: (item) => {
        const typeMap: Record<string, keyof ActiveAssets> = {
          background: 'background',
          frame: 'frame',
          badge: 'badge',
          emoji: 'emoji',
          theme: 'theme',
          club: 'badge', // fallback para categorías antiguas
          user: 'frame',
          achievement: 'badge'
        };
        const key = typeMap[item.category] || 'badge';
        set((state) => ({ activeAssets: { ...state.activeAssets, [key]: item.id } }));
      },

      addCoins: (amount) => set((state) => ({ coins: state.coins + amount }))
    }),
    {
      name: 'vz_shop_store'
    }
  )
); 