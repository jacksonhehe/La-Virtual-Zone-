import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type TransactionType = 'credit' | 'debit';
export type TransactionSource =
  | 'store'
  | 'adjustment'
  | 'reward'
  | 'penalty'
  | 'rule'
  | string;

export interface EconomyTx {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number; // always positive
  source: TransactionSource;
  reason: string;
  createdAt: string; // ISO
  refId?: string;
}

export interface AutoRule {
  id: string;
  name: string;
  trigger: string;
  operation: 'add' | 'subtract';
  amount: number;
  active: boolean;
}

interface EconomySlice {
  wallets: Record<string, number>;
  transactions: EconomyTx[];
  rules: AutoRule[];
  getBalance: (userId: string) => number;
  createTransaction: (tx: Omit<EconomyTx, 'id' | 'createdAt'>) => boolean;
  adjustBalance: (userId: string, amount: number, reason: string, refId?: string) => boolean;
  applyRules: (trigger: string, ctx: { userId: string }) => void;
  addRule: (rule: Omit<AutoRule, 'id'>) => void;
  updateRule: (id: string, data: Partial<AutoRule>) => void;
  // legacy helpers
  addIncome: (userId: string, amount: number, source: string, reason: string, refId?: string) => void;
  addExpense: (userId: string, amount: number, source: string, reason: string, refId?: string) => boolean;
}

export const useEconomySlice = create<EconomySlice>()(
  persist(
    (set, get) => ({
      wallets: {},
      transactions: [],
      rules: [],
      getBalance: (userId) => get().wallets[userId] || 0,
      createTransaction: ({ userId, amount, type, source, reason, refId }) => {
        const current = get().wallets[userId] || 0;
        if (type === 'debit' && current < amount) return false;
        const tx: EconomyTx = {
          id: uuidv4(),
          userId,
          amount,
          type,
          source,
          reason,
          refId,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [...state.transactions, tx],
          wallets: {
            ...state.wallets,
            [userId]: type === 'credit' ? current + amount : current - amount,
          },
        }));
        return true;
      },
      adjustBalance: (userId, amount, reason, refId) => {
        const type = amount >= 0 ? 'credit' : 'debit';
        return get().createTransaction({
          userId,
          amount: Math.abs(amount),
          type,
          source: 'adjustment',
          reason,
          refId,
        });
      },
      addIncome: (userId, amount, source, reason, refId) => {
        get().createTransaction({
          userId,
          amount,
          type: 'credit',
          source,
          reason,
          refId,
        });
      },
      addExpense: (userId, amount, source, reason, refId) =>
        get().createTransaction({
          userId,
          amount,
          type: 'debit',
          source,
          reason,
          refId,
        }),
      addRule: (rule) => {
        const newRule: AutoRule = { id: uuidv4(), ...rule };
        set((state) => ({ rules: [...state.rules, newRule] }));
      },
      updateRule: (id, data) => {
        set((state) => ({ rules: state.rules.map(r=> r.id===id? { ...r, ...data}: r) }));
      },
      applyRules: (trigger, ctx) => {
        const activeRules = get().rules.filter(r => r.active && r.trigger === trigger);
        activeRules.forEach(r => {
          const amount = Math.abs(r.amount);
          const type = r.operation === 'add' ? 'credit' : 'debit';
          get().createTransaction({
            userId: ctx.userId,
            amount,
            type,
            source: 'rule',
            reason: r.name,
          });
        });
      },
    }),
    { name: 'vz_economy' }
  )
); 
