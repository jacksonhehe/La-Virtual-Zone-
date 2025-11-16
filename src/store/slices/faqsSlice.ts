import type { StateCreator } from 'zustand';
import { faqs } from '../../data/faqs';
import type { FAQ } from '../../types';

export interface FaqsSlice {
  faqs: FAQ[];
  updateFaqs: (items: FAQ[]) => void;
}

export const createFaqsSlice: StateCreator<FaqsSlice, [], [], FaqsSlice> = (set) => ({
  faqs,
  updateFaqs: (items) => set({ faqs: items }),
});
