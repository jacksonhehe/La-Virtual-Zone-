import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { StoreItem } from '../types';
import { storeItems as seedItems } from '../data/mockData';
import { useEconomySlice } from './economySlice';

export interface PurchaseTx {
  id: string;
  productId: string;
  userId: string;
  date: string; // ISO
  status: 'success' | 'refunded';
}

interface StoreSlice {
  products: StoreItem[];
  purchases: PurchaseTx[];
  /* CRUD */
  addStoreItem: (data: Omit<StoreItem, 'id' | 'inStock'> & { stock?: number | null; launchAt?: string; expireAt?: string; featured?: boolean; tags?: string[] }) => void;
  updateStoreItem: (id: string, data: Partial<StoreItem>) => void;
  removeStoreItem: (id: string) => void;
  addPurchase: (productId: string, userId: string) => void;
  purchaseProduct: (productId: string, userId: string) => { success: boolean; message: string };
  refundPurchase: (purchaseId: string) => void;
  /* Selectors */
  activeItems: () => StoreItem[];
  soldOutItems: () => StoreItem[];
  expiringSoonItems: () => StoreItem[];
  featuredItems: () => StoreItem[];
  /** Interno: revisa expiraciones / stock */
  refreshStatuses: () => void;
}

const isActive = (p: StoreItem) => {
  const now = Date.now();
  const launchOk = !p.launchAt || new Date(p.launchAt).getTime() <= now;
  const notExpired = !p.expireAt || new Date(p.expireAt).getTime() > now;
  const stockOk = p.inStock;
  return p.active !== false && launchOk && notExpired && stockOk;
};

export const useStoreSlice = create<StoreSlice>()(
  persist(
    (set, get) => ({
      /* semilla inicial */
      products: seedItems.map((i) => ({ ...i, active: true })),
      purchases: [],
      refreshStatuses: () => {
        set({
          products: get().products.map((p) => {
            let inStock = p.inStock;
            if (p.stock !== undefined && p.stock !== null) {
              inStock = p.stock > 0;
            }
            const active = isActive({ ...p, inStock });
            return { ...p, active, inStock };
          })
        });
      },
      addStoreItem: (data) => {
        const product: StoreItem = {
          id: uuidv4(),
          inStock: data.stock === undefined || data.stock === null ? true : (data.stock as number) > 0,
          active: true,
          ...data,
          minLevel: data.minLevel ?? 1,
        } as StoreItem;
        set({ products: [...get().products, product] });
      },
      updateStoreItem: (id, data) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...data } : p
          )
        });
      },
      removeStoreItem: (id) => set({ products: get().products.filter((p) => p.id !== id) }),
      addPurchase: (productId, userId) => {
        const tx: PurchaseTx = {
          id: uuidv4(),
          productId,
          userId,
          date: new Date().toISOString(),
          status: 'success'
        };
        set({ purchases: [...get().purchases, tx] });
        // reduce stock si existe
        set({
          products: get().products.map((p) => {
            if (p.id !== productId) return p;
            if (p.stock !== undefined && p.stock !== null) {
              const newStock = p.stock - 1;
              return { ...p, stock: newStock, inStock: newStock > 0 };
            }
            return p;
          })
        });
        get().refreshStatuses();
      },
      purchaseProduct: (productId, userId) => {
        const product = get().products.find(p => p.id === productId);
        if (!product) return { success: false, message: 'Producto no encontrado' };
        const price = product.price;
        const ok = useEconomySlice.getState().createTransaction({
          userId,
          amount: price,
          type: 'debit',
          source: 'store',
          reason: `Compra ${product.name}`,
          refId: productId,
        });
        if (!ok) return { success: false, message: 'Saldo insuficiente' };
        get().addPurchase(productId, userId);
        return { success: true, message: 'Compra realizada' };
      },
      refundPurchase: (purchaseId) => {
        const purchase = get().purchases.find(p => p.id === purchaseId && p.status === 'success');
        if (!purchase) return;
        const product = get().products.find(p => p.id === purchase.productId);
        if (product?.stock !== undefined && product.stock !== null) {
          const newStock = (product.stock || 0) + 1;
          set({
            products: get().products.map(p => p.id === product.id ? { ...p, stock: newStock, inStock: true } : p)
          });
        }
        set({
          purchases: get().purchases.map(p => p.id === purchaseId ? { ...p, status: 'refunded' } : p),
        });
        useEconomySlice.getState().createTransaction({
          userId: purchase.userId,
          amount: product?.price || 0,
          type: 'credit',
          source: 'store',
          reason: 'Reverso compra',
          refId: purchaseId,
        });
        get().refreshStatuses();
      },
      /* Memoized selectors usando closures */
      activeItems: () => get().products.filter((p) => isActive(p)),
      soldOutItems: () => get().products.filter((p) => !p.inStock),
      expiringSoonItems: () => {
        const now = Date.now();
        const week = 1000 * 60 * 60 * 24 * 7;
        return get()
          .products
          .filter((p) => p.expireAt && new Date(p.expireAt).getTime() - now < week && isActive(p));
      },
      featuredItems: () => get().products.filter((p) => p.featured && isActive(p)),
    }),
    { name: 'vz_store_slice' }
  )
);

// efecto inicial para refrescar estados una vez cargado
useStoreSlice.getState().refreshStatuses();
