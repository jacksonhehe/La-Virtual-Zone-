import { create } from 'zustand';
import { User } from '../types';
import {
  login as authLogin,
  register as authRegister,
  getCurrentUser,
  logout as authLogout
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
        return user;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    
    register: (email, username, password) => {
      try {
        const user = authRegister(email, username, password);
        set({ user, isAuthenticated: true });
        return user;
      } catch (error) {
        console.error('Register failed:', error);
        throw error;
      }
    },
    
    logout: () => {
      authLogout();
      set({ user: null, isAuthenticated: false });
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
 