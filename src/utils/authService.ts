import { User } from '../types/shared';
import { VZ_CURRENT_USER_KEY } from './storageKeys';
import { supabase } from '../supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

interface UserMetadata {
  username?: string;
  role?: 'user' | 'dt' | 'admin';
}

const mapAuthUser = (authUser: SupabaseUser): User => {
  const metadata = authUser.user_metadata as UserMetadata | null;
  return {
    id: authUser.id,
    username: metadata?.username || '',
    email: authUser.email || '',
    role: metadata?.role || 'user',
    status: 'active'
  };
};

export const hashPassword = (pwd: string): string => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(pwd, salt);
};

export const getUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw new Error(error.message);
  return (data || []) as User[];
};

// Get current logged in user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getSession();
  const authUser = data.session?.user;
  return authUser ? mapAuthUser(authUser) : null;
};

// Save current user to localStorage
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(VZ_CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(VZ_CURRENT_USER_KEY);
  }
};

// Register a new user and log them in
export const register = async (
  email: string,
  username: string,
  password: string
): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } }
  });
  if (error || !data.user) {
    throw new Error(error?.message || 'Error al registrar la cuenta');
  }

  await addUser(data.user.id, email, username, 'user', undefined, password);

  return mapAuthUser(data.user);
};

// Add new user (admin)
export const addUser = async (
  id: string,
  email: string,
  username: string,
  role: 'user' | 'dt' | 'admin',
  clubId?: string,
  password = 'password'
): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      id,
      email,
      username,
      role,
      clubId,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
        username
      )}&background=111827&color=fff&size=128`,
      xp: 0,
      createdAt: new Date().toISOString(),
      status: 'active',
      notifications: true,
      lastLogin: new Date().toISOString(),
      followers: 0,
      following: 0,
      password: hashPassword(password)
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Error al crear usuario');
  }
  return data as User;
};

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message || 'Error al iniciar sesión');
  }

  const base = await getUserById(data.user.id);
  const authUser = mapAuthUser(data.user);
  return base ? { ...base, ...authUser } : authUser;
};

// Logout function
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// Update user function
export const updateUser = async (updates: { email?: string; password?: string; data?: Record<string, unknown> }): Promise<User> => {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error || !data.user) {
    throw new Error(error?.message || 'Error al actualizar');
  }
  return mapAuthUser(data.user);
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }
  return (data as User) || null;
};

// Delete a user by ID and update localStorage
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

export const resetPassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
};
 