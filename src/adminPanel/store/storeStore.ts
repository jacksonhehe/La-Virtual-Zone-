import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Rarity = 'comun' | 'raro' | 'epico' | 'legendario';
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: Rarity;
  price: number; // Z-Coins
  tags: string[]; // "Nuevo", "Limitado", etc.
  image: string; // URL or base64
  featured?: boolean;
  launchAt?: string; // ISO date
  expireAt?: string; // ISO date
  stock?: number | null; // null = unlimited
  createdAt: string;
  updatedAt: string;
  active: boolean;
}

export interface Purchase {
  id: string;
  productId: string;
  userId: string;
  date: string;
  status: 'entregado' | 'revertido';
  revertReason?: string;
}

interface StoreState {
  products: Product[];
  purchases: Purchase[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  markFeatured: (id: string, featured: boolean) => void;
  addPurchase: (productId: string, userId: string) => void;
  revertPurchase: (id: string, reason: string) => void;
  addStoreItem: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'active'>) => void;
  updateStoreItem: (id: string, data: Partial<Product>) => void;
  removeStoreItem: (id: string) => void;
  purchaseProduct: (productId: string, userId: string) => boolean;
}

export const useStoreStore = create<StoreState>()(
  persist(
    (set, get) => ({
      products: [],
      purchases: [],
      addProduct: (data) => {
        const now = new Date().toISOString();
        const product: Product = {
          id: uuidv4(),
          ...data,
          createdAt: now,
          updatedAt: now,
          active: true,
        };
        set({ products: [...get().products, product] });
      },
      addStoreItem(data) { get().addProduct(data); },
      updateProduct: (id, data) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          ),
        });
      },
      updateStoreItem(id, data){ get().updateProduct(id,data); },
      deleteProduct: (id) => set({ products: get().products.filter((p) => p.id !== id) }),
      removeStoreItem(id){ get().deleteProduct(id); },
      markFeatured: (id, featured) => {
        set({
          products: get().products.map((p) =>
            p.id === id ? { ...p, featured } : p
          ),
        });
      },
      addPurchase: (productId, userId) => {
        const purchase: Purchase = {
          id: uuidv4(),
          productId,
          userId,
          date: new Date().toISOString(),
          status: 'entregado',
        };
        set({ purchases: [...get().purchases, purchase] });
      },
      purchaseProduct(productId, userId){
        const product = get().products.find(p=>p.id===productId && p.active);
        if(!product) return false;
        // check stock
        if(product.stock!==null && product.stock!==undefined && product.stock<=0) return false;
        // decrement stock if limited
        if(product.stock!==null && product.stock!==undefined){
          get().updateProduct(productId,{stock: (product.stock as number)-1});
        }
        get().addPurchase(productId,userId);
        return true;
      },
      revertPurchase: (id, reason) => {
        set({
          purchases: get().purchases.map((p) =>
            p.id === id ? { ...p, status: 'revertido', revertReason: reason } : p
          ),
        });
      },
    }),
    {
      name: 'admin-store',
    }
  )
); 