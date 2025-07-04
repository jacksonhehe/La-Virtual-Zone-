import { create } from 'zustand';
import { User } from '../types/shared';
import { useActivityLogStore } from './activityLogStore';
import {
  login as authLogin,
  register as authRegister,
  getCurrentUser,
  logout as authLogout
} from '../utils/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  addXP: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser: User | null = null;
  getCurrentUser().then((user) => {
    if (user) {
      set({ user, isAuthenticated: true });
    }
  });

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    
    login: async (email, password) => {
      try {
        const user = await authLogin(email, password);
        set({ user, isAuthenticated: true });
        useActivityLogStore
          .getState()
          .addLog('login', user.id, `${user.username} inició sesión`);
        return user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    
    register: async (email, username, password) => {
      try {
        const user = await authRegister(email, username, password);
        set({ user, isAuthenticated: true });
        useActivityLogStore
          .getState()
          .addLog('register', user.id, `${user.username} se registró`);
        return user;
      } catch (error) {
        console.error('Register failed:', error);
        throw error;
      }
    },
    
    logout: async () => {
      const current = await getCurrentUser();
      await authLogout();
      set({ user: null, isAuthenticated: false });
      if (current) {
        useActivityLogStore
          .getState()
          .addLog('logout', current.id, `${current.username} cerró sesión`);
      }
    },
    
    updateUser: (userData) => {
      set((state) => {
        if (!state.user) return state;
        
        const updatedUser = {
          ...state.user,
          ...userData
        };
        
        return { user: updatedUser };
      });
    },
    
    addXP: (amount) => {
      set((state) => {
        if (!state.user) return state;
        
        const updatedUser = {
          ...state.user,
          xp: state.user.xp + amount
        };
        
        return { user: updatedUser };
      });
    }
  };
});
 