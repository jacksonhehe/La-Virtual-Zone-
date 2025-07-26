import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface Wallet {
  userId: string;
  balance: number; // Z-Coins
}

export type TransactionType = 'ingreso' | 'gasto' | 'ajuste';

export interface Transaction {
  id: string;
  userId: string;
  amount: number; // positive = ingreso, negative = gasto
  type: TransactionType;
  reason: string;
  date: string; // ISO
}

export interface Rule {
  id: string;
  name: string;
  trigger: string; // e.g. 'victoria_torneo'
  operation: 'sumar' | 'restar';
  amount: number;
  active: boolean;
}

interface EconomyState {
  wallets: Wallet[];
  transactions: Transaction[];
  rules: Rule[];
  getBalance: (userId: string) => number;
  adjustBalance: (userId: string, amount: number, reason: string) => boolean;
  recordTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => void;
  addRule: (rule: Omit<Rule, 'id'>) => void;
  updateRule: (id: string, data: Partial<Rule>) => void;
  deleteRule: (id: string) => void;
}

export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      wallets: [],
      transactions: [],
      rules: [],

      getBalance: (userId) => {
        const wallet = get().wallets.find((w) => w.userId === userId);
        return wallet ? wallet.balance : 0;
      },

      adjustBalance: (userId, amount, reason) => {
        const current = get();
        let wallets = [...current.wallets];
        const idx = wallets.findIndex((w) => w.userId === userId);
        if (idx === -1) wallets.push({ userId, balance: 0 });
        wallets = wallets.map((w) =>
          w.userId === userId ? { ...w, balance: w.balance + amount } : w
        );
        const newBalance = wallets.find((w) => w.userId === userId)!.balance;
        if (newBalance < 0) {
          return false; // block negative balances
        }
        const tx: Transaction = {
          id: uuidv4(),
          userId,
          amount,
          type: amount >= 0 ? 'ingreso' : 'gasto',
          reason,
          date: new Date().toISOString(),
        };
        set({ wallets, transactions: [...current.transactions, tx] });
        return true;
      },

      recordTransaction: (txData) => {
        const tx: Transaction = {
          id: uuidv4(),
          ...txData,
          date: new Date().toISOString(),
        };
        set((state) => ({ transactions: [...state.transactions, tx] }));
      },

      addRule: (rule) => {
        const r: Rule = { id: uuidv4(), ...rule };
        set((state) => ({ rules: [...state.rules, r] }));
      },
      updateRule: (id, data) => {
        set((state) => ({
          rules: state.rules.map((r) => (r.id === id ? { ...r, ...data } : r)),
        }));
      },
      deleteRule: (id) => {
        set((state) => ({ rules: state.rules.filter((r) => r.id !== id) }));
      },
    }),
    {
      name: 'economy-store',
    }
  )
); 