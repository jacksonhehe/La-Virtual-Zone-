import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type TxType = 'income' | 'expense' | 'adjust';

export interface EconomyTx {
  id: string;
  userId: string;
  type: TxType;
  amount: number; // positivo siempre
  category: string;
  reason: string;
  date: string; // ISO
  relatedId?: string; // compra, ajuste, etc.
}

export interface AutoRule {
  id: string;
  name: string;
  trigger: string; // ej: 'match_won'
  delta: number; // positivo ingreso, negativo gasto
  active: boolean;
}

interface EconomySlice {
  wallets: Record<string, number>;
  transactions: EconomyTx[];
  rules: AutoRule[];
  // helpers
  getBalance: (userId: string) => number;
  addIncome: (userId: string, amount: number, category: string, reason: string, relatedId?: string) => void;
  addExpense: (userId: string, amount: number, category: string, reason: string, relatedId?: string) => boolean;
  adjustBalance: (userId: string, delta: number, reason: string) => boolean;
  addRule: (rule: Omit<AutoRule, 'id'>) => void;
  updateRule: (id: string, data: Partial<AutoRule>) => void;
  applyRule: (trigger: string, payload: { userId: string }) => void;
}

export const useEconomySlice = create<EconomySlice>()(
  persist(
    (set, get) => ({
      wallets: {},
      transactions: [],
      rules: [],
      getBalance: (userId) => get().wallets[userId] || 0,
      addIncome: (userId, amount, category, reason, relatedId) => {
        const tx: EconomyTx = {
          id: uuidv4(),
          userId,
          type: 'income',
          amount,
          category,
          reason,
          date: new Date().toISOString(),
          relatedId,
        };
        set((state) => ({
          transactions: [...state.transactions, tx],
          wallets: { ...state.wallets, [userId]: (state.wallets[userId] || 0) + amount },
        }));
      },
      addExpense: (userId, amount, category, reason, relatedId) => {
        const current = get().wallets[userId] || 0;
        if (current < amount) return false;
        const tx: EconomyTx = {
          id: uuidv4(),
          userId,
          type: 'expense',
          amount,
          category,
          reason,
          date: new Date().toISOString(),
          relatedId,
        };
        set((state) => ({
          transactions: [...state.transactions, tx],
          wallets: { ...state.wallets, [userId]: current - amount },
        }));
        return true;
      },
      adjustBalance: (userId, delta, reason) => {
        const current = get().wallets[userId] || 0;
        if (current + delta < 0) return false;
        const tx: EconomyTx = {
          id: uuidv4(),
          userId,
          type: 'adjust',
          amount: Math.abs(delta),
          category: 'manual',
          reason,
          date: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [...state.transactions, tx],
          wallets: { ...state.wallets, [userId]: current + delta },
        }));
        return true;
      },
      addRule: (rule) => {
        const newRule: AutoRule = { id: uuidv4(), ...rule };
        set((state) => ({ rules: [...state.rules, newRule] }));
      },
      updateRule: (id, data) => {
        set((state) => ({ rules: state.rules.map(r=> r.id===id? { ...r, ...data}: r) }));
      },
      applyRule: (trigger, payload) => {
        const activeRules = get().rules.filter(r=>r.active && r.trigger===trigger && r.delta!==0);
        activeRules.forEach(r=>{
          if(r.delta>0){
            get().addIncome(payload.userId, r.delta, 'rule', r.name);
          } else {
            get().addExpense(payload.userId, Math.abs(r.delta), 'rule', r.name);
          }
        });
      },
    }),
    { name: 'vz_economy' }
  )
); 