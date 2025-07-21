import { create } from 'zustand';

interface SidebarState {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (v: boolean) => void;
}

const SIDEBAR_KEY = 'vz_admin_sidebar_collapsed';

const getInitial = () => {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SIDEBAR_KEY) === '1';
};

export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: getInitial(),
  toggle: () =>
    set((state) => {
      const next = !state.collapsed;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0');
      }
      return { collapsed: next };
    }),
  setCollapsed: (v) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0');
    }
    set({ collapsed: v });
  }
})); 