import  { create } from 'zustand';
import { User } from '../types';
import {
  login as authLogin,
  register as authRegister,
  logout as authLogout,
  getCurrentUser as authGetCurrentUser,
  updateUser as authUpdateUser,
  changePassword as authChangePassword,
  downloadUserData,
  resetPassword as authResetPassword,
  getSupabaseCurrentUser,
  normalizeSupabaseProfile,
  getAccountStatusError,
  AccountBlockStatus
} from '../utils/authService';
import { config } from '../lib/config';
import { supabase, getSupabaseClient } from '../lib/supabase';

const resolveAuthErrorMessage = (error: unknown, fallback = 'Error al procesar la autenticacion'): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return fallback;
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProcessingAuth: boolean;
  authError: string | null;
  accountBlock: { status: AccountBlockStatus; message: string } | null;
  login: (username: string, password: string) => Promise<User>;
  register: (email: string, username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<User>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (role: 'user' | 'dt' | 'admin') => boolean;
  downloadUserData: () => void;
  deleteAccount: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearAuthError: () => void;
  clearAccountBlock: () => void;
}

const accountBlockFromStatus = (info: ReturnType<typeof getAccountStatusError>) => {
  if (!info) return null;
  return {
    status: info.status,
    message: info.message
  };
};

export const useAuthStore = create<AuthState>((set, get) => {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isProcessingAuth: false,
    authError: null,
    accountBlock: null,
    clearAuthError: () => set({ authError: null }),
    clearAccountBlock: () => set({ accountBlock: null }),

    hasRole: (role) => {
      try {
        const state = get();
        if (!state.user) return false;
        const primary = state.user.role === role;
        const multi = Array.isArray(state.user.roles) && state.user.roles.includes(role);
        return primary || multi;
      } catch {
        return false;
      }
    },

    login: async (username, password) => {
      try {
        console.log('🔐 AuthStore: Attempting login');
        set({ isLoading: true, authError: null, accountBlock: null });

        const user = await authLogin(username, password);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          authError: null,
          accountBlock: null
        });

        console.log('✅ AuthStore: Login successful for:', user.username);
        return user;
      } catch (error) {
        console.error("❌ AuthStore: Login failed:", error);
        const isStatusBlock =
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          (error as any).code === 'ACCOUNT_STATUS_BLOCK';

        const message = resolveAuthErrorMessage(error, 'Error al iniciar sesion');

        set({
          isLoading: false,
          authError: message,
          accountBlock: isStatusBlock
            ? {
                status: (error as any).status || 'inactive',
                message
              }
            : null
        });

        if (error instanceof Error) {
          throw error;
        }
        throw new Error(message);
      }
    },

    register: async (email, username, password) => {
      try {
        console.log('📝 AuthStore: Attempting registration');
        set({ isLoading: true });

        const user = await authRegister(email, username, password);

        set({
          user,
          isAuthenticated: true,
          isLoading: false
        });

        console.log('✅ AuthStore: Registration successful for:', user.username);
        return user;
      } catch (error) {
        console.error("❌ AuthStore: Registration failed:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    resetPassword: async (email) => {
      try {
        console.log('🔐 AuthStore: Attempting password reset');
        set({ isLoading: true });

        await authResetPassword(email);

        console.log('✅ AuthStore: Password reset email sent successfully');
        set({ isLoading: false });
      } catch (error) {
        console.error("❌ AuthStore: Password reset failed:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      try {
        console.log('🚪 AuthStore: Attempting logout');
        set({ isLoading: true });

        await authLogout();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });

        console.log('✅ AuthStore: Logout successful');
      } catch (error) {
        console.error("❌ AuthStore: Logout failed:", error);
        set({ isLoading: false });
        throw error;
      }
    },

    updateUser: async (userData) => {
      let currentUser = get().user;
      if (!currentUser) {
        try {
          const stored = localStorage.getItem('virtual_zone_current_user');
          if (stored) {
            const parsed = JSON.parse(stored) as User;
            currentUser = parsed;
            set({
              user: parsed,
              isAuthenticated: true
            });
          }
        } catch (error) {
          console.warn('⚠️ AuthStore: No stored session available while updating user');
        }
      }
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      try {
        console.log('📝 AuthStore: Updating user profile');
        set({ isLoading: true });

        const updatedUser = await authUpdateUser(userData);

        set({
          user: updatedUser,
          isLoading: false
        });

        console.log('✅ AuthStore: User profile updated');
        return updatedUser;
      } catch (error) {
        console.error('❌ AuthStore: Failed to update user:', error);
        set({ isLoading: false });
        throw error;
      }
    },
    downloadUserData: () => {
      const state = get();
      if (state.user) {
        downloadUserData(state.user);
      }
    },

    deleteAccount: async () => {
      const currentUser = get().user;
      if (currentUser) {
        try {
          // Mark user as deleted instead of removing completely
          await authUpdateUser({
            status: 'deleted',
            deleted_at: new Date().toISOString()
          });
          // Logout the user
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        } catch (error) {
          console.error('Error deleting account:', error);
          throw error;
        }
      }
    },

    changePassword: async (currentPassword, newPassword) => {
      const currentUser = get().user;
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }

      try {
        set({ isLoading: true });
        await authChangePassword(currentPassword, newPassword);
        set({ isLoading: false });
      } catch (error) {
        console.error('Error changing password:', error);
        set({ isLoading: false });
        throw error;
      }
    },

    initializeAuth: async () => {
      try {
        console.log('🔄 AuthStore: Initializing authentication');

        const enforceAccountStatus = async (
          candidate: User | null,
          options: { signOut?: boolean } = {}
        ): Promise<boolean> => {
          const statusInfo = getAccountStatusError(candidate);
          if (!statusInfo) {
            return false;
          }

          if (options.signOut) {
            try {
              await supabase.auth.signOut();
            } catch (signOutError) {
              console.warn('⚠️ AuthStore: Failed to sign out after blocked status', signOutError);
            }
          }

          localStorage.removeItem('virtual_zone_current_user');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            authError: statusInfo.message,
            accountBlock: accountBlockFromStatus(statusInfo)
          });
          return true;
        };

        if (config.useSupabase) {
          try {
            const supabaseClient = getSupabaseClient();

            // Set up Supabase auth listener
            const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
              async (event, session) => {
                console.log('🔄 AuthStore: Auth state changed:', event, !!session);

                // Prevent multiple simultaneous auth processing
                const state = get();
                if (state.isProcessingAuth) {
                  console.log('🔄 AuthStore: Auth processing already in progress, skipping...');
                  return;
                }

                set({ isProcessingAuth: true });

                try {
                  if (session?.user) {
                  console.log('🔄 AuthStore: User authenticated, getting profile...');
                  try {
                // Get user profile from Supabase with timeout
                const profilePromise = getSupabaseCurrentUser();
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
                );

                    let user = await Promise.race([profilePromise, timeoutPromise]).catch(error => {
                      console.warn('⚠️ AuthStore: Profile fetch timeout, checking localStorage');
                      return null;
                    });

                    console.log('🔄 AuthStore: Profile result:', user ? 'found' : 'not found');

                    // If no user from Supabase, try localStorage
                    if (!user) {
                      const stored = localStorage.getItem('virtual_zone_current_user');
                      if (stored) {
                        try {
                          const rawLocalUser = JSON.parse(stored);
                          const localUser = normalizeSupabaseProfile(rawLocalUser);
                          console.log('🔄 AuthStore: Using localStorage fallback for auth change:', localUser.username);
                          user = localUser;
                        } catch (e) {
                          console.warn('⚠️ AuthStore: Could not parse localStorage user for auth change');
                        }
                      }
                    }

                    if (user) {
                      if (await enforceAccountStatus(user, { signOut: true })) {
                        return;
                      }

                      set({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                        accountBlock: null
                      });
                      console.log('✅ AuthStore: User session restored:', user.username, 'Role:', user.role, 'Club:', user.clubId);
                  } else {
                    // Check if we already have a valid user in state before creating basic user
                    const currentState = get();
                    if (currentState.user && currentState.user.id === session.user.id) {
                      console.log('🔄 AuthStore: Keeping existing user during auth state change:', currentState.user.username);
                      set({
                        isAuthenticated: true,
                        isLoading: false
                      });
                    } else {
                      console.warn('⚠️ AuthStore: Using basic user (all fallbacks failed)');
                      // Create a basic user object with admin privileges if it's the admin user
                      const isAdminUser = session.user.email === 'admin@lavirtualzone.com';
                      const basicUser = {
                        id: session.user.id,
                        username: session.user.email?.split('@')[0] || 'user',
                        email: session.user.email || '',
                        role: isAdminUser ? 'admin' : 'user',
                        roles: isAdminUser ? ['admin', 'dt'] : ['user'], // Admin también tiene rol DT
                        status: 'active'
                      };

                      set({
                        user: basicUser,
                        isAuthenticated: true,
                        isLoading: false
                      });
                      console.log(`✅ AuthStore: Basic ${isAdminUser ? 'admin' : 'user'} created:`, basicUser.username);
                    }
                  }
                  } catch (error) {
                    console.error('❌ AuthStore: Error restoring session:', error);
                          // Create fallback user with admin privileges if it's the admin
                          const isAdminUser = session.user.email === 'admin@lavirtualzone.com';
                          const fallbackUser = {
                            id: session.user.id,
                            username: session.user.email?.split('@')[0] || 'user',
                            email: session.user.email || '',
                            role: isAdminUser ? 'admin' : 'user',
                            roles: isAdminUser ? ['admin', 'dt'] : ['user'], // Admin también tiene rol DT
                            status: 'active'
                          };

                    set({
                      user: fallbackUser,
                      isAuthenticated: true,
                      isLoading: false
                    });
                    console.log(`✅ AuthStore: Fallback ${isAdminUser ? 'admin' : 'user'} created:`, fallbackUser.username);
                  }
                  } else {
                    set({
                      user: null,
                      isAuthenticated: false,
                      isLoading: false
                    });
                    console.log('✅ AuthStore: User logged out');
                  }
                } finally {
                  set({ isProcessingAuth: false });
                }
              }
            );

            // Check initial session
            const { data: { session } } = await supabaseClient.auth.getSession();
            if (session?.user) {
              console.log('🔄 AuthStore: Initial session found, loading profile...');
              try {
                // Get user profile with timeout
                const profilePromise = getSupabaseCurrentUser();
                const timeoutPromise = new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Initial profile fetch timeout')), 8000)
                );

                let user = await Promise.race([profilePromise, timeoutPromise]).catch(error => {
                  console.warn('⚠️ AuthStore: Initial profile fetch timeout, trying localStorage fallback');
                  return null;
                });

                console.log('🔄 AuthStore: Initial profile result:', user ? 'found' : 'not found');

                // If Supabase failed, try to load from localStorage as fallback
                if (!user) {
                  const stored = localStorage.getItem('virtual_zone_current_user');
                  if (stored) {
                    try {
                      const rawLocalUser = JSON.parse(stored);
                      const localUser = normalizeSupabaseProfile(rawLocalUser);
                      console.log('🔄 AuthStore: Using localStorage fallback for user:', localUser.username);
                      user = localUser;
                    } catch (e) {
                      console.warn('⚠️ AuthStore: Could not parse localStorage user');
                    }
                  }
                }

                // If still no user (very rare case), check if we have stored user data
                if (!user) {
                  const storedUser = localStorage.getItem('virtual_zone_current_user');
                  if (storedUser) {
                    try {
                      const rawParsedUser = JSON.parse(storedUser);
                      const parsedUser = normalizeSupabaseProfile(rawParsedUser);
                      console.log('🔄 AuthStore: Emergency localStorage load for user:', parsedUser.username);
                      user = parsedUser;
                    } catch (e) {
                      console.warn('⚠️ AuthStore: Emergency localStorage load failed');
                    }
                  }
                }

                if (user) {
                  if (await enforceAccountStatus(user, { signOut: true })) {
                    return;
                  }

                  set({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    accountBlock: null
                  });
                  console.log('✅ AuthStore: Initial user loaded:', user.username, 'Role:', user.role, 'Club:', user.clubId);
                } else {
                        // Create basic user for initial session with admin privileges if it's admin
                        const isAdminUser = session.user.email === 'admin@lavirtualzone.com';
                        const basicUser = {
                          id: session.user.id,
                          username: session.user.email?.split('@')[0] || 'user',
                          email: session.user.email || '',
                          role: isAdminUser ? 'admin' : 'user',
                          roles: isAdminUser ? ['admin', 'dt'] : ['user'], // Admin también tiene rol DT
                          status: 'active'
                        };

                  set({
                    user: basicUser,
                    isAuthenticated: true,
                    isLoading: false
                  });
                  console.log(`✅ AuthStore: Initial basic ${isAdminUser ? 'admin' : 'user'} created:`, basicUser.username);
                }
              } catch (error) {
                console.error('❌ AuthStore: Error loading initial profile:', error);
                      // Create fallback for initial session with admin privileges if it's admin
                      const isAdminUser = session.user.email === 'admin@lavirtualzone.com';
                      const fallbackUser = {
                        id: session.user.id,
                        username: session.user.email?.split('@')[0] || 'user',
                        email: session.user.email || '',
                        role: isAdminUser ? 'admin' : 'user',
                        roles: isAdminUser ? ['admin', 'dt'] : ['user'], // Admin también tiene rol DT
                        status: 'active'
                      };

                set({
                  user: fallbackUser,
                  isAuthenticated: true,
                  isLoading: false
                });
                console.log(`✅ AuthStore: Initial fallback ${isAdminUser ? 'admin' : 'user'} created:`, fallbackUser.username);
              }
            } else {
              console.log('🔄 AuthStore: No initial session found');
              set({ isLoading: false });
            }
          } catch (error) {
            console.error('❌ AuthStore: Failed to initialize Supabase auth:', error);
            // Fallback to legacy mode
            console.log('🔄 AuthStore: Falling back to legacy authentication');
            const user = authGetCurrentUser();
            if (await enforceAccountStatus(user, { signOut: true })) {
              return;
            }
            set({
              user,
              isAuthenticated: !!user,
              isLoading: false,
              accountBlock: null
            });
          }
        } else {
          // Fallback to legacy localStorage
          console.log('🔄 AuthStore: Using legacy localStorage auth');
          const user = authGetCurrentUser();
          if (await enforceAccountStatus(user)) {
            return;
          }
          set({
            user,
            isAuthenticated: !!user,
            isLoading: false,
            accountBlock: null
          });
        }
      } catch (error) {
        console.error('❌ AuthStore: Error initializing auth:', error);
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    }
  };
});
 
