import  { User } from '../types';
import { supabase, getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase';
import { config } from '../lib/config';

// Legacy localStorage keys (for backward compatibility)
const USERS_KEY = 'virtual_zone_users';
const CURRENT_USER_KEY = 'virtual_zone_current_user';

const ALLOWED_ROLES: Array<User['role']> = ['user', 'dt', 'admin'];

const sanitizeRolesInput = (value: unknown): Array<User['role']> | undefined => {
  if (Array.isArray(value)) {
    const parsed = value
      .map(v => typeof v === 'string' ? v.toLowerCase() : '')
      .filter(v => ALLOWED_ROLES.includes(v as User['role']))
      .filter((role, index, self) => self.indexOf(role) === index) as Array<User['role']>;
    return parsed.length ? parsed : undefined;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (ALLOWED_ROLES.includes(normalized as User['role'])) {
      return [normalized as User['role']];
    }
  }
  return undefined;
};

const resolvePrimaryRole = (roles?: Array<User['role']>, fallback: User['role'] = 'user'): User['role'] => {
  if (roles?.includes('admin')) return 'admin';
  if (roles?.includes('dt')) return 'dt';
  if (roles?.includes('user')) return 'user';
  return fallback;
};

export type AccountBlockStatus = 'suspended' | 'banned' | 'inactive';

const formatDateEs = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const getAccountStatusError = (
  user: Partial<User> | null | undefined
): { message: string; status: AccountBlockStatus } | null => {
  if (!user) return null;
  const status = user.status;
  if (!status || status === 'active') return null;

  if (status === 'suspended') {
    const untilStr = formatDateEs(user.suspendedUntil);
    const base = 'Esta cuenta está suspendida';
    const withUntil = untilStr ? `${base} hasta el ${untilStr}` : base;
    const message = user.suspendedReason ? `${withUntil}. Motivo: ${user.suspendedReason}` : withUntil;
    return { message, status: 'suspended' };
  }

  if (status === 'banned') {
    const base = 'Esta cuenta ha sido baneada';
    const message = user.banReason ? `${base}. Motivo: ${user.banReason}` : base;
    return { message, status: 'banned' };
  }

  return { message: 'Esta cuenta no está activa', status: 'inactive' };
};

const createAccountStatusError = (info: { message: string; status: AccountBlockStatus }) => {
  const error = new Error(info.message) as Error & {
    code: 'ACCOUNT_STATUS_BLOCK';
    status: AccountBlockStatus;
  };
  (error as any).code = 'ACCOUNT_STATUS_BLOCK';
  (error as any).status = info.status;
  return error;
};

export const normalizeSupabaseProfile = (profile: any): User => {
  if (!profile) {
    throw new Error('Perfil inválido');
  }

  // Verificación especial para el admin
  const isAdminEmail = profile.email === 'admin@lavirtualzone.com';

  const rawRole = typeof profile.role === 'string' ? profile.role.toLowerCase() : undefined;
  const metadataRoles = sanitizeRolesInput(profile.roles);

  let roles: Array<User['role']> | undefined;
  if (isAdminEmail) {
    roles = ['admin', 'dt'];
  } else if (metadataRoles && metadataRoles.length) {
    roles = metadataRoles;
  } else if (rawRole && ALLOWED_ROLES.includes(rawRole as User['role'])) {
    roles = [rawRole as User['role']];
  } else {
    roles = ['user'];
  }

  roles = Array.from(new Set(roles));

  const role: User['role'] = isAdminEmail
    ? 'admin'
    : resolvePrimaryRole(roles, 'user');

  const allowedStatuses: Array<User['status']> = ['active', 'suspended', 'banned', 'deleted'];
  const rawStatus = profile.status;
  const status: User['status'] = allowedStatuses.includes(rawStatus) ? rawStatus : 'active';

  const username: string = typeof profile.username === 'string' && profile.username.trim().length > 0
    ? profile.username
    : (typeof profile.email === 'string' && profile.email.includes('@')
        ? profile.email.split('@')[0]
        : 'usuario');

  const avatar = typeof profile.avatar === 'string' && profile.avatar.trim().length > 0
    ? profile.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111827&color=fff&size=128&bold=true`;

  const ensureNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const ensureString = (value: unknown, fallback = ''): string => {
    return typeof value === 'string' ? value : fallback;
  };

  const notifications = typeof profile.notifications === 'boolean'
    ? profile.notifications
    : profile.notifications === null || profile.notifications === undefined
      ? true
      : Boolean(profile.notifications);
  const resolvedRoles = roles && roles.length ? roles : ['user'];

  const normalizeOptionalString = (primary: unknown, secondary?: unknown, fallback?: string) => {
    if (typeof primary === 'string') return primary;
    if (typeof secondary === 'string') return secondary;
    return fallback;
  };

  const normalized: User = {
    id: profile.id,
    username,
    email: ensureString(profile.email),
    role,
    roles: resolvedRoles,
    avatar,
    clubId: normalizeOptionalString(profile.clubId, profile.club_id) || undefined,
    club: normalizeOptionalString(profile.club, profile.club_name) || undefined,
    joinDate: normalizeOptionalString(profile.joinDate, profile.join_date, profile.created_at) || new Date().toISOString(),
    status,
    bio: normalizeOptionalString(profile.bio, profile.about) || undefined,
    location: normalizeOptionalString(profile.location) || undefined,
    website: normalizeOptionalString(profile.website) || undefined,
    favoriteTeam: normalizeOptionalString(profile.favoriteTeam, profile.favorite_team) || undefined,
    favoritePosition: normalizeOptionalString(profile.favoritePosition, profile.favorite_position) || undefined,
    suspendedUntil: normalizeOptionalString(profile.suspendedUntil, profile.suspended_until) || undefined,
    suspendedReason: normalizeOptionalString(profile.suspendedReason, profile.suspended_reason) || undefined,
    banReason: normalizeOptionalString(profile.banReason, profile.ban_reason) || undefined,
    deletedAt: normalizeOptionalString(profile.deletedAt, profile.deleted_at) || undefined,
    deletedReason: normalizeOptionalString(profile.deletedReason, profile.deleted_reason) || undefined,
    notifications,
    lastLogin: normalizeOptionalString(profile.lastLogin, profile.last_login) || '',
    followers: ensureNumber(profile.followers),
    following: ensureNumber(profile.following)
  };

  return normalized;
};

// ========================================
// SUPABASE AUTH FUNCTIONS
// ========================================

/**
 * Login using Supabase Auth
 */
const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
    return (error as any).message;
  }
  return 'Error desconocido';
};

const translateSupabaseAuthError = (rawMessage: string): string => {
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('invalid login credentials')) {
    return 'Credenciales incorrectas. Revisa tu correo y contraseña.';
  }

  if (normalized.includes('email not confirmed')) {
    return 'Debes confirmar tu correo electrónico antes de iniciar sesión.';
  }

  if (normalized.includes('network') || normalized.includes('fetch')) {
    return 'No pudimos conectar con el servidor de autenticación. Inténtalo nuevamente.';
  }

  if (normalized.includes('too many requests') || normalized.includes('rate limit')) {
    return 'Demasiados intentos. Espera un momento antes de volver a intentarlo.';
  }

  return rawMessage;
};
export const supabaseLogin = async (email: string, password: string): Promise<User> => {
  try {
    console.log('🔐 Attempting Supabase login for:', email);

    const { data, error } = await getSupabaseClient().auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Supabase login error:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user data returned');
    }

    console.log('✅ Supabase login successful, fetching profile...');

    // Get user profile from profiles table
    const { data: profile, error: profileError } = await getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError.message);
      throw new Error('Failed to load user profile');
    }

    console.log('✅ Profile loaded successfully:', profile.username);

    const metadataRoles = sanitizeRolesInput(data.session?.user.user_metadata?.roles);
    const profileWithRoles = metadataRoles ? { ...profile, roles: metadataRoles } : profile;

    const normalizedProfile = normalizeSupabaseProfile(profileWithRoles);

    const statusError = getAccountStatusError(normalizedProfile);
    if (statusError) {
      throw createAccountStatusError(statusError);
    }

    // Store in localStorage for backward compatibility
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedProfile));

    return normalizedProfile;
  } catch (error) {
    console.error('❌ Supabase login failed:', error);
    const rawMessage = extractErrorMessage(error);
    const friendlyMessage = translateSupabaseAuthError(rawMessage);

    if (friendlyMessage === rawMessage && error instanceof Error) {
      throw error;
    }

    throw new Error(friendlyMessage);
  }
};

/**
 * Register using Supabase Auth
 */
export const supabaseRegister = async (email: string, username: string, password: string): Promise<User> => {
  try {
    console.log('📝 Attempting Supabase registration for:', email, username);

    const { data, error } = await getSupabaseClient().auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    });

    if (error) {
      console.error('❌ Supabase registration error:', error.message);
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Registration failed - no user data returned');
    }

    console.log('✅ Supabase registration successful, profile should be created by trigger');

    // The profile will be created by the database trigger
    // Wait a moment and fetch the profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: profile, error: profileError } = await getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('❌ Error fetching created profile:', profileError.message);
      throw new Error('Profile creation failed');
    }

    console.log('✅ Profile created and loaded successfully:', profile.username);

    const normalizedProfile = normalizeSupabaseProfile(profile);

    // Store in localStorage for backward compatibility
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedProfile));

    return normalizedProfile;
  } catch (error) {
    console.error('❌ Supabase registration failed:', error);
    throw error;
  }
};

/**
 * Logout from Supabase
 */
export const supabaseLogout = async (): Promise<void> => {
  try {
    console.log('🚪 Attempting Supabase logout');

    const { error } = await getSupabaseClient().auth.signOut();

    if (error) {
      console.error('❌ Supabase logout error:', error.message);
      throw new Error(error.message);
    }

    // Clear localStorage
    localStorage.removeItem(CURRENT_USER_KEY);

    console.log('✅ Supabase logout successful');
  } catch (error) {
    console.error('❌ Supabase logout failed:', error);
    throw error;
  }
};

/**
 * Get current user from Supabase session
 */
export const getSupabaseCurrentUser = async (): Promise<User | null> => {
  try {
    const client = getSupabaseClient();

    // Add reasonable timeout to session call (8 seconds)
    const sessionPromise = client.auth.getSession();
    const sessionTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Session query timeout')), 8000)
    );

    const { data: { session }, error } = await Promise.race([
      sessionPromise,
      sessionTimeout
    ]).catch(err => {
      // Silent handling for common network timeouts - let fallback handle it
      console.warn('⚠️ getSupabaseCurrentUser: Session timeout, using fallback');
      return { data: { session: null }, error: { message: err.message } };
    });

    if (error && error.message !== 'Session query timeout') {
      console.error('❌ getSupabaseCurrentUser: Error getting session:', error.message);
      return null;
    }

    if (!session?.user) {
      return null; // No session, let auth store handle fallback
    }

    // Add reasonable timeout to prevent hanging (6 seconds)
    const profilePromise = getSupabaseClient()
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Profile query timeout')), 6000)
    );

    const { data: profile, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]).catch(error => {
      // Silent handling for network timeouts - let auth store handle fallback
      console.warn('⚠️ getSupabaseCurrentUser: Profile query timeout, using fallback');
      return { data: null, error: { message: error.message } };
    });

    if (profileError && profileError.message !== 'Profile query timeout') {
      console.error('❌ getSupabaseCurrentUser: Error fetching profile:', profileError.message);
      return null;
    }

    if (!profile) {
      return null; // No profile found, let auth store handle fallback
    }

    const metadataRoles = sanitizeRolesInput(session.user.user_metadata?.roles);
    const profileWithRoles = metadataRoles ? { ...profile, roles: metadataRoles } : profile;

    const normalizedProfile = normalizeSupabaseProfile(profileWithRoles);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedProfile));
    return normalizedProfile;
  } catch (error) {
    console.error('❌ getSupabaseCurrentUser: Unexpected error:', error);
    return null;
  }
};

/**
 * Reset password using Supabase Auth
 */
export const supabaseResetPassword = async (email: string): Promise<void> => {
  try {
    console.log('🔐 Attempting password reset for:', email);

    const { error } = await getSupabaseClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      console.error('❌ Supabase password reset error:', error.message);
      throw new Error(error.message);
    }

    console.log('✅ Supabase password reset email sent successfully');
  } catch (error) {
    console.error('❌ Supabase password reset failed:', error);
    throw error;
  }
};

/**
 * Update user profile in Supabase
 */
export const updateSupabaseUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    console.log('📝 Updating Supabase user profile:', userId);
    console.log('🔐 Using admin client:', Boolean(config.supabase.serviceRoleKey));

    // Only update fields that exist in Supabase profiles table (simple types only)
    const allowedFields = [
      'username', 'email', 'role', 'roles', 'avatar', 'clubId', 'club_id', 'club', 'status',
      'bio', 'location', 'website', 'favoriteTeam', 'favoritePosition',
      'suspendedUntil', 'suspendedReason', 'banReason', 'deletedAt',
      'deletedReason', 'notifications', 'lastLogin', 'followers'
      // Excluded: 'following' (complex object), and other complex fields
    ];

    // Filter updates to only include allowed fields and exclude complex objects/arrays
    const filteredUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) {
        continue;
      }
      if (allowedFields.includes(key)) {
        if (value === null) {
          const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
          filteredUpdates[snakeKey] = null;
          continue;
        }
        // Skip complex objects and arrays that can't be stored as simple types
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          console.log(`⚠️ Skipping complex object field: ${key}`);
          continue;
        }
        if (Array.isArray(value)) {
          // Handle roles array - convert to primary role for Supabase
          if (key === 'roles' && Array.isArray(value)) {
            // Convert roles array to primary role
            const primaryRole = value.includes('admin') ? 'admin' :
                               value.includes('dt') ? 'dt' : 'user';
            console.log(`🔄 Converting roles array to primary role: ${value} → ${primaryRole}`);
            filteredUpdates.role = primaryRole;
            continue;
          } else {
            console.log(`⚠️ Skipping array field: ${key}`);
            continue;
          }
        }

        // Convert camelCase to snake_case for Supabase
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        console.log(`🔄 Converting field: ${key} → ${snakeKey} = ${value}`);
        filteredUpdates[snakeKey] = value;
      } else {
        console.log(`⚠️ Skipping not allowed field: ${key}`);
      }
    }

    if (Object.keys(filteredUpdates).length > 0) {
      filteredUpdates.updated_at = new Date().toISOString();
    }

    console.log('📝 Filtered updates for Supabase:', filteredUpdates);

    // Get current user data to preserve roles if needed
    const currentUser = getCurrentUser();
    console.log('👤 Current user before update:', currentUser);

    const supabaseClient = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();

    // Sync auth metadata (email / username / roles) when we have service role
    if (config.supabase.serviceRoleKey) {
      const adminClient = getSupabaseAdminClient();
      const authPayload: any = {};
      if (typeof updates.email === 'string' && updates.email.trim().length > 0) {
        authPayload.email = updates.email.trim();
      }
      const metadata: Record<string, any> = {};
      if (typeof updates.username === 'string' && updates.username.trim().length > 0) {
        metadata.username = updates.username.trim();
      }
      if (Array.isArray(updates.roles) && updates.roles.length > 0) {
        metadata.roles = updates.roles;
      }

      const sanitizedRoles = sanitizeRolesInput(metadata.roles);
      if (sanitizedRoles) {
        metadata.roles = sanitizedRoles;
      } else {
        delete metadata.roles;
      }

      if (Object.keys(metadata).length > 0) {
        authPayload.user_metadata = metadata;
      }

      if (Object.keys(authPayload).length > 0) {
        const { error: authError } = await adminClient.auth.admin.updateUserById(userId, authPayload);
        if (authError) {
          console.error('❌ Error updating auth metadata:', authError.message);
          throw new Error(authError.message);
        }
      }
    }

    if (Object.keys(filteredUpdates).length > 0) {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update(filteredUpdates)
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Error updating profile:', updateError.message);
        throw new Error(updateError.message);
      }
    } else {
      console.log('ℹ️ No hay campos para actualizar en profiles, solo se sincronizó auth metadata.');
    }

    const { data: updatedRow, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Error fetching profile after update:', fetchError.message);
      throw new Error(fetchError.message);
    }

    if (!updatedRow) {
      throw new Error('No se encontró el perfil actualizado después de la actualización');
    }

    console.log('✅ Profile updated successfully');

    const normalizedProfile = normalizeSupabaseProfile(updatedRow);
    console.log('🔄 Normalized profile:', normalizedProfile);
    console.log('🔍 Normalized roles:', normalizedProfile.roles);
    console.log('🔍 Normalized role:', normalizedProfile.role);

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(normalizedProfile));
    return normalizedProfile;
  } catch (error) {
    console.error('❌ Failed to update Supabase user:', error);
    throw error;
  }
};

// ========================================
// HYBRID AUTH FUNCTIONS (Auto-select based on config)
// ========================================

/**
 * Smart login - uses Supabase if enabled, falls back to localStorage
 */
export const login = async (usernameOrEmail: string, password: string): Promise<User> => {
  if (config.useSupabase) {
    console.log('🔄 Using Supabase authentication');
    // For Supabase, usernameOrEmail should be email
    return await supabaseLogin(usernameOrEmail, password);
  } else {
    console.log('🔄 Using legacy localStorage authentication');
    return loginLegacy(usernameOrEmail, password);
  }
};

/**
 * Smart register - uses Supabase if enabled, falls back to localStorage
 */
export const register = async (email: string, username: string, password: string): Promise<User> => {
  if (config.useSupabase) {
    console.log('🔄 Using Supabase registration');
    return await supabaseRegister(email, username, password);
  } else {
    console.log('🔄 Using legacy localStorage registration');
    return registerLegacy(email, username, password);
  }
};

/**
 * Smart logout
 */
export const logout = async (): Promise<void> => {
  if (config.useSupabase) {
    console.log('🔄 Using Supabase logout');
    await supabaseLogout();
  } else {
    console.log('🔄 Using legacy localStorage logout');
    logoutLegacy();
  }
};

/**
 * Smart current user getter
 */
export const getCurrentUser = (): User | null => {
  if (config.useSupabase) {
    // For Supabase, we need to check the session asynchronously
    // This will be handled by the auth store
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      const parsed = JSON.parse(stored);
      return normalizeSupabaseProfile(parsed);
    } catch (error) {
      console.warn('⚠️ Error normalizando usuario almacenado, usando datos crudos:', error);
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
  } else {
    return getCurrentUserLegacy();
  }
};

/**
 * Smart password reset
 */
export const resetPassword = async (email: string): Promise<void> => {
  if (config.useSupabase) {
    console.log('🔄 Using Supabase password reset');
    return await supabaseResetPassword(email);
  } else {
    console.log('🔄 Password reset not available in legacy mode');
    throw new Error('La recuperación de contraseña no está disponible en el modo legacy');
  }
};

/**
 * Smart user update
 */
export const updateUser = async (userData: Partial<User>): Promise<User> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  let updatedUser: User;

  if (config.useSupabase) {
    updatedUser = await updateSupabaseUser(currentUser.id, userData);
  } else {
    updatedUser = updateUserLegacy(userData);
  }

  // If we're updating the current user's profile, also update the auth store and localStorage
  // Import authStore dynamically to avoid circular dependencies
  try {
    const { useAuthStore } = await import('../store/authStore');
    const authState = useAuthStore.getState();

    if (authState.user && authState.user.id === currentUser.id) {
      console.log('🔄 Actualizando authStore con el perfil actualizado del usuario');

      // Normalize the updated user data (convert snake_case back to camelCase)
      const normalizedUser = {
        ...updatedUser,
        clubId: updatedUser.club_id || updatedUser.clubId
      };

      // Preserve roles from current user if they exist and weren't explicitly updated
      const finalUserData = {
        ...authState.user, // Start with current user data
        ...normalizedUser, // Override with updated data
        // Preserve roles - prioritize: normalized roles > current user roles > fallback based on role
        roles: normalizedUser.roles ||
               authState.user.roles ||
               (normalizedUser.role === 'admin' ? ['admin', 'dt'] :
                normalizedUser.role === 'dt' ? ['dt'] :
                authState.user.role === 'admin' ? ['admin', 'dt'] :
                authState.user.role === 'dt' ? ['dt'] : ['user'])
      };

      console.log('🔄 Final user data for authStore:', finalUserData);
      console.log('🔍 Final roles:', finalUserData.roles);

      useAuthStore.setState({
        user: finalUserData
      });

      // Also save to localStorage as backup
      localStorage.setItem('virtual_zone_current_user', JSON.stringify(finalUserData));
      console.log('💾 Perfil guardado en localStorage como backup');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo actualizar authStore:', error);
  }

  return updatedUser;
};

// ========================================
// LEGACY FUNCTIONS (internal use only)
// ========================================

// Mock test users (exported for testing)
export const TEST_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@virtualzone.com',
    password: 'admin123', // Contraseña para testing
    role: 'admin',
    roles: ['admin', 'dt'],
    // DT admin disponible - sin club asignado inicialmente
    // club: 'Rayo Digital FC',
    // clubId: 'club1',
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=9f65fd&color=fff&size=128&bold=true',
    createdAt: new Date().toISOString(),
    status: 'active',
    achievements: ['founder'],
    following: {
      users: [],
      clubs: [],
      players: []
    }
  },
  {
    id: '2',
    username: 'usuario',
    email: 'usuario@test.com',
    password: 'usuario123', // Contraseña para testing
    role: 'user',
    roles: ['user'],
    createdAt: new Date().toISOString(),
    status: 'active',
    achievements: [],
    following: {
      users: [],
      clubs: [],
      players: []
    }
  },
  {
    id: '2',
    username: 'usuario_dt',
    email: 'user2@test.com',
    password: 'dt123', // Contraseña para testing
    role: 'dt',
    roles: ['dt'],
    // DT disponible - sin club asignado inicialmente
    // club: 'Atlético Pixelado',
    // clubId: 'club2',
    avatar: 'https://ui-avatars.com/api/?name=User2&background=3b82f6&color=fff&size=128&bold=true',
    createdAt: new Date().toISOString(),
    status: 'active',
    achievements: [],
    following: {
      users: [],
      clubs: [],
      players: []
    }
  },
  {
    id: '3',
    username: 'entrenador',
    email: 'dt@test.com',
    password: 'dt456', // Contraseña para testing
    role: 'dt',
    roles: ['dt'],
    // DT disponible - sin club asignado inicialmente
    // club: 'Neón FC',
    // clubId: 'club4',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    createdAt: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: {
      users: [],
      clubs: ['Rayo Digital FC'],
      players: []
    }
  }
];

// Get users from localStorage or initialize with test users
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) {
    localStorage.setItem(USERS_KEY, JSON.stringify(TEST_USERS));
    return TEST_USERS as unknown as User[];
  }

  const users: User[] = JSON.parse(usersJson);

  // Asegurar que el usuario con username "admin" tenga rol de admin
  let modified = false;
  const adminIdx = users.findIndex(u => u.username && u.username.toLowerCase() === 'admin');
  if (adminIdx >= 0) {
    const u = users[adminIdx] as any;
    // Establecer rol primario como 'admin'
    if (u.role !== 'admin') {
      u.role = 'admin';
      modified = true;
    }
    // Asegurar lista de roles y que incluya 'admin'
    if (!Array.isArray(u.roles)) {
      u.roles = ['admin'];
      modified = true;
    } else if (!u.roles.includes('admin')) {
      u.roles = [...u.roles, 'admin'];
      modified = true;
    }
    // Mantener la cuenta activa
    if (u.status && u.status !== 'active') {
      u.status = 'active';
      modified = true;
    }
    users[adminIdx] = u as User;
  }

  // Seguridad: garantizar que exista al menos un admin
  const hasAdmin = users.some(u => u.role === 'admin' || (Array.isArray((u as any).roles) && (u as any).roles.includes('admin')));
  if (!hasAdmin) {
    const now = new Date().toISOString();
    const adminUser: User = {
      id: `admin-${Date.now()}`,
      username: 'admin',
      email: 'admin@virtualzone.com',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin&background=9f65fd&color=fff&size=128&bold=true',
      joinDate: now,
      status: 'active',
      notifications: true,
      lastLogin: '',
      followers: 0,
      following: 0,
    };
    users.push(adminUser);
    modified = true;
  }

  if (modified) {
    saveUsers(users);
    // Si el usuario actual es 'admin', sincronizar sus cambios
    try {
      const current = getCurrentUserLegacy();
      if (current && current.username && current.username.toLowerCase() === 'admin' && adminIdx >= 0) {
        saveCurrentUserLegacy(users[adminIdx]);
      }
    } catch { /* ignore */ }
  }

  return users;
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get current logged in user (legacy)
const getCurrentUserLegacy = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Save current user to localStorage (legacy)
const saveCurrentUserLegacy = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Login function (legacy)
const loginLegacy = (username: string, password: string): User => {
  // Get users, falling back to test users if none exist
  const users = getUsers();

  // Find user by username (case insensitive)
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Validate password for test users (in a real app, this would be hashed and compared properly)
  if (user.password && password !== user.password) {
    throw new Error('Contraseña incorrecta');
  }

  const statusError = getAccountStatusError(user);
  if (statusError) {
    throw createAccountStatusError(statusError);
  }
  
  // Update last login time
  user.lastLogin = new Date().toISOString();
  saveUsers(users.map(u => u.id === user.id ? user : u));
  
  // Save the current user
  saveCurrentUserLegacy(user);
  
  return user;
};

// Logout function (legacy)
const logoutLegacy = (): void => {
  saveCurrentUserLegacy(null);
};

// Update user function (legacy)
const updateUserLegacy = (user: User): User => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  saveUsers(updatedUsers);
  
  // If updating the current user, update local storage
  const currentUser = getCurrentUserLegacy();
  if (currentUser && currentUser.id === user.id) {
    saveCurrentUserLegacy(user);
  }
  
  return user;
};

// List all users (exported helper for UI)
export const listUsers = (): User[] => {
  return getUsers();
};

type CreateUserPayload = {
  username: string;
  email: string;
  role: User['role'];
  roles?: Array<'user'|'dt'|'admin'>;
  password?: string;
  clubId?: string;
  status?: User['status'];
};

const createUserLegacy = (data: CreateUserPayload): User => {
  const users = getUsers();
  const id = Date.now().toString();
  const username = data.username.trim();
  const email = data.email.trim();
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=111827&color=fff&size=128&bold=true`;
  const newUser: User = {
    id,
    username,
    email,
    role: data.role,
    roles: data.roles && data.roles.length ? data.roles : undefined,
    avatar,
    clubId: data.clubId,
    joinDate: new Date().toISOString(),
    status: data.status || 'active',
    notifications: true,
    lastLogin: '',
    followers: 0,
    following: 0,
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const createSupabaseUser = async (data: CreateUserPayload): Promise<User> => {
  if (!data.password) {
    throw new Error('Se requiere una contraseña para crear usuarios en Supabase');
  }

  const client = getSupabaseAdminClient();
  const { data: newUser, error: createError } = await client.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: {
      username: data.username,
      roles: data.roles
    }
  });

  if (createError) {
    console.error('❌ Error creating Supabase user:', createError);
    throw createError;
  }

  if (!newUser) {
    throw new Error('No se pudo crear el usuario en Supabase');
  }

  const profilePayload: any = {
    id: newUser.id,
    username: data.username,
    email: data.email,
    role: data.role,
    status: data.status || 'active',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.username)}&background=111827&color=fff&size=128&bold=true`,
    notifications: true,
    last_login: new Date().toISOString(),
    followers: 0,
    following: 0
  };
  if (data.clubId) {
    profilePayload.club_id = data.clubId;
  }

  const { error: upsertError } = await client
    .from('profiles')
    .upsert(profilePayload, { onConflict: 'id' });

  if (upsertError) {
    console.error('❌ Error upserting Supabase profile:', upsertError);
    throw upsertError;
  }

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('*')
    .eq('id', newUser.id)
    .single();

  if (profileError) {
    console.error('❌ Error fetching Supabase profile after creation:', profileError);
    throw profileError;
  }

  return normalizeSupabaseProfile(profile);
};

export const createUser = async (data: CreateUserPayload): Promise<User> => {
  if (config.useSupabase) {
    return createSupabaseUser(data);
  }

  return createUserLegacy(data);
};

const deleteUserLegacy = (userId: string): void => {
  const users = getUsers();
  const remaining = users.filter(u => u.id !== userId);
  saveUsers(remaining);
  const current = getCurrentUserLegacy();
  if (current && current.id === userId) {
    // If deleting the logged user, logout
    saveCurrentUserLegacy(null);
  }
};

export const deleteSupabaseUser = async (userId: string): Promise<void> => {
  const client = getSupabaseAdminClient();

  const { error: profileDeleteError } = await client
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileDeleteError) {
    console.error('❌ Error deleting Supabase profile:', profileDeleteError);
    throw profileDeleteError;
  }

  const { error: authDeleteError } = await client.auth.admin.deleteUser(userId);
  if (authDeleteError) {
    console.error('❌ Error deleting Supabase auth user:', authDeleteError);
    throw authDeleteError;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (config.useSupabase) {
    await deleteSupabaseUser(userId);
    return;
  }

  deleteUserLegacy(userId);
};

const fetchSupabaseUsers = async (): Promise<User[]> => {
  const supabaseClient = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*');

  if (error) {
    console.error('❌ Error fetching profiles:', error.message);
    throw new Error(error.message);
  }

  let rolesMap: Record<string, Array<User['role']>> = {};
  if (config.supabase.serviceRoleKey) {
    const adminClient = getSupabaseAdminClient();
    const perPage = 1000;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const { data: authData, error: authError } = await adminClient.auth.admin.listUsers({ page, perPage });
      if (authError) {
        console.error('❌ Error fetching auth users:', authError.message);
        throw new Error(authError.message);
      }

      const usersPage = authData?.users || [];
      usersPage.forEach(authUser => {
        const sanitized = sanitizeRolesInput(authUser.user_metadata?.roles);
        if (sanitized) {
          rolesMap[authUser.id] = sanitized;
        }
      });

      hasMore = usersPage.length === perPage;
      page++;
    }
  }

  return (data || []).map(profile => {
    const profileWithRoles = { ...profile } as any;
    if (rolesMap[profile.id]) {
      profileWithRoles.roles = rolesMap[profile.id];
    }
    return normalizeSupabaseProfile(profileWithRoles);
  });
};

export const fetchUsers = async (): Promise<User[]> => {
  if (config.useSupabase) {
    return await fetchSupabaseUsers();
  }
  return Promise.resolve(getUsers());
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Download user data as JSON
export const downloadUserData = (user: User): void => {
  try {
    // Get all user data including related information
    const users = getUsers();
    const userData = users.find(u => u.id === user.id);

    if (!userData) {
      throw new Error('Usuario no encontrado');
    }

    // Create comprehensive data export
    const exportData = {
      user: userData,
      exportDate: new Date().toISOString(),
      exportReason: 'Descarga de datos personales desde La Virtual Zone',
      version: '1.0.0'
    };

    // Convert to JSON with pretty formatting
    const jsonData = JSON.stringify(exportData, null, 2);

    // Create and download file
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `virtual-zone-data-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading user data:', error);
    throw new Error('Error al descargar los datos');
  }
};

// Delete user account
const deleteUserAccountLegacy = (userId: string, password?: string): void => {
  try {
    const users = getUsers();
    const currentUser = getCurrentUserLegacy();

    // Find the user to delete
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const userToDelete = users[userIndex];

    // For demo purposes, we'll just mark as deleted instead of actually deleting
    // In a real app, you'd verify password and handle proper deletion
    const updatedUser = {
      ...userToDelete,
      status: 'deleted' as const,
      deletedAt: new Date().toISOString(),
      deletedReason: 'Usuario eliminó su cuenta'
    };

    // Update the user in the users array
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    saveUsers(updatedUsers);

    // If deleting current user, logout
    if (currentUser && currentUser.id === userId) {
      logout();
    }

  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};

// Change user password
const changePasswordLegacy = (userId: string, currentPassword: string, newPassword: string): void => {
  try {
    const users = getUsers();
    const currentUser = getCurrentUserLegacy();

    // Find the user
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const userToUpdate = users[userIndex];

    // For demo purposes, we'll simulate password verification
    // In a real app, you'd hash and verify the current password
    if (!currentPassword || currentPassword.trim() === '') {
      throw new Error('Debes ingresar tu contraseña actual');
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    if (currentPassword === newPassword) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    // For demo purposes, we'll just update the user
    // In a real app, you'd hash the new password and store it securely
    const updatedUser = {
      ...userToUpdate,
      // In a real implementation, you'd store a hashed password
      // For demo, we'll just update the user
      updatedAt: new Date().toISOString()
    };

    // Update the user in the users array
    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    saveUsers(updatedUsers);

    // If updating current user, update local storage
    if (currentUser && currentUser.id === userId) {
      saveCurrentUserLegacy(updatedUser);
    }

  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  if (config.useSupabase) {
    const client = getSupabaseClient();

    const {
      data: { session },
      error: sessionError
    } = await client.auth.getSession();

    if (sessionError) {
      console.error('Error fetching session for password change:', sessionError);
      throw new Error('No se pudo verificar la sesión actual');
    }

    const email = session?.user?.email;
    if (!email) {
      throw new Error('No se pudo obtener el correo del usuario actual');
    }

    const { error: verifyError } = await client.auth.signInWithPassword({
      email,
      password: currentPassword
    });

    if (verifyError) {
      console.error('Supabase password verification failed:', verifyError);
      throw new Error('La contraseña actual es incorrecta');
    }

    const { error: updateError } = await client.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      console.error('Supabase password update failed:', updateError);
      throw new Error(updateError.message || 'No se pudo actualizar la contraseña');
    }

    return;
  }

  const currentUser = getCurrentUserLegacy();
  if (!currentUser) {
    throw new Error('No hay usuario autenticado');
  }

  changePasswordLegacy(currentUser.id, currentPassword, newPassword);
};
 
