import { create } from 'zustand';
import { User } from '../types';
import {
  login as authLogin,
  register as authRegister,
  getCurrentUser,
  logout as authLogout
} from '../utils/authService';
import { useActivityLogStore } from './activityLogStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  register: (email: string, username: string, password: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  addXP: (amount: number) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Check for stored auth information
  const initialUser = getCurrentUser();
  const addLog = useActivityLogStore.getState().addLog;
  
  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    
    login: (username, password) => {
      try {
        const user = authLogin(username, password);
        set({ user, isAuthenticated: true });
        addLog({
          action: 'login',
          userId: user.id,
          date: new Date().toISOString(),
          details: `User ${user.username} logged in`
        });
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
        addLog({
          action: 'register',
          userId: user.id,
          date: new Date().toISOString(),
          details: `Registered ${user.username}`
        });
        return user;
      } catch (error) {
        console.error('Register failed:', error);
        throw error;
      }
    },
    
    logout: () => {
      const current = get().user || getCurrentUser();
      if (current) {
        addLog({
          action: 'logout',
          userId: current.id,
          date: new Date().toISOString(),
          details: `User ${current.username} logged out`
        });
      }
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

        addLog({
          action: 'update_user',
          userId: updatedUser.id,
          date: new Date().toISOString(),
          details: 'Updated user profile'
        });
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

        addLog({
          action: 'add_xp',
          userId: updatedUser.id,
          date: new Date().toISOString(),
          details: `Added ${amount} XP`
        });
        return { user: updatedUser };
      });
    }
  };
});
 