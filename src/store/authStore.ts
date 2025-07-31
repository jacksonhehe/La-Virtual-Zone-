import { create } from 'zustand';
import { User } from '../types/shared';
import { useActivityLogStore } from './activityLogStore';
import {
  login as authLogin,
  register as authRegister,
  getCurrentUser,
  logout as authLogout,
  updateUser as persistUser
} from '../utils/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  register: (email: string, username: string, password: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  addXP: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check for stored auth information
  const initialUser = getCurrentUser();
  
  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    
    login: (username, password) => {
      try {
        const user = authLogin(username, password);
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
    
    register: (email, username, password) => {
      try {
        const user = authRegister(email, username, password);
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
    
    logout: () => {
      const current = getCurrentUser();
      authLogout();
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
        const updatedUser: User = { ...state.user, ...userData } as User;
        persistUser(updatedUser);
        return { user: updatedUser };
      });
    },
    
    addXP: (amount) => {
      set((state) => {
        if (!state.user) return state;
        
        const updatedUser = {
          ...state.user,
          xp: (state.user.xp || 0) + amount
        } as User;
        
        return { user: updatedUser };
      });
    }
  };
});
 