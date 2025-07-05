import { User } from '../types/shared';
import {
  VZ_USERS_KEY,
  VZ_CURRENT_USER_KEY,
  VZ_RESET_TOKENS_KEY
} from './storageKeys';
import { supabase } from '../supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

const mapAuthUser = (authUser: SupabaseUser): User => ({
  id: authUser.id,
  username: (authUser.user_metadata as any)?.username || '',
  email: authUser.email || '',
  role: (authUser.user_metadata as any)?.role || 'user',
  status: 'active'
});

// Simulated backend - using localStorage for persistence

// Simple base64 "hash" for demo purposes
export const hashPassword = (pwd: string): string => {
  if (typeof btoa !== 'undefined') {
    return btoa(pwd);
  }
  return Buffer.from(pwd).toString('base64');
};

// Mock test users
const TEST_PASSWORD = hashPassword('password');

const TEST_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@virtualzone.com',
    role: 'admin',
    level: 10,
    xp: 1000,
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=9f65fd&color=fff&size=128&bold=true',
    bio: 'Fundador y administrador de La Virtual Zone.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['founder'],
    following: {
      users: [],
      clubs: [],
      players: []
    },
    password: TEST_PASSWORD
  },
  {
    id: '2',
    username: 'usuario',
    email: 'usuario@test.com',
    role: 'user',
    level: 1,
    xp: 0,
    bio: 'Jugador casual que disfruta los torneos online.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: [],
    following: {
      users: [],
      clubs: [],
      players: []
    },
    password: TEST_PASSWORD
  },
  {
    id: '3',
    username: 'entrenador',
    email: 'dt@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Neón FC',
    clubId: 'club4',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Apasionado entrenador de Neón FC.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: {
      users: [],
      clubs: ['Rayo Digital FC'],
      players: []
    },
    password: TEST_PASSWORD
  },
  {
    id: '4',
    username: 'jacksonhehe11',
    email: 'jacksonhehe11@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Real Madrid',
    clubId: 'club11',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'DT madridista con experiencia en torneos virtuales.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: {
      users: [],
      clubs: ['Rayo Digital FC'],
      players: []
    },
    password: TEST_PASSWORD
  },
  {
    id: '5',
    username: 'dtdefensor',
    email: 'dtdefensor@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Defensores del Lag',
    clubId: 'club3',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Especialista en defensas sólidas y tácticas cerradas.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '6',
    username: 'dtneon',
    email: 'dtneon@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Neón FC',
    clubId: 'club4',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Fanático del juego ofensivo con tácticas de presión alta.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '7',
    username: 'dthax',
    email: 'dthax@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Haxball United',
    clubId: 'club5',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Jugador experimentado en Haxball ahora en PES.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '8',
    username: 'dtglitch',
    email: 'dtglitch@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Glitchers 404',
    clubId: 'club6',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Amante de la tecnología y los glitches.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '9',
    username: 'dtcyber',
    email: 'dtcyber@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Cyber Warriors',
    clubId: 'club7',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Estratega con enfoque en ciencia ficción y ciberespacio.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '10',
    username: 'dtbinary',
    email: 'dtbinary@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Binary Strikers',
    clubId: 'club8',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Analítico y preciso, amante de los datos y binarios.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '11',
    username: 'dtconnect',
    email: 'dtconnect@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Connection FC',
    clubId: 'club9',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Entusiasta de la conectividad y las comunidades online.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '12',
    username: 'dtgalaxy',
    email: 'dtgalaxy@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Pixel Galaxy',
    clubId: 'club10',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Explorador del universo virtual y fan de la ciencia ficción.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '13',
    username: 'dtmadrid',
    email: 'dtmadrid@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Real Madrid',
    clubId: 'club11',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Hincha merengue con amplia trayectoria en ligas virtuales.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  },
  {
    id: '14',
    username: 'dtquantum',
    email: 'dtquantum@test.com',
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Quantum Rangers',
    clubId: 'club12',
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    bio: 'Siempre buscando la próxima frontera táctica.',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: { users: [], clubs: ['Rayo Digital FC'], players: [] },
    password: TEST_PASSWORD
  }
];

// Get users from localStorage or initialize with test users
export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(VZ_USERS_KEY);
  if (!usersJson) {
    localStorage.setItem(VZ_USERS_KEY, JSON.stringify(TEST_USERS));
    return TEST_USERS;
  }

  return JSON.parse(usersJson);
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(VZ_USERS_KEY, JSON.stringify(users));
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
  return mapAuthUser(data.user);
};

// Add new user (admin)
export const addUser = (
  email: string,
  username: string,
  role: 'user' | 'dt' | 'admin',
  clubId?: string,
  password = 'password'
): User => {
  const users = getUsers();

  const usernameExists = users.some(
    u => u.username.toLowerCase() === username.toLowerCase()
  );
  if (usernameExists) {
    throw new Error('El nombre de usuario ya está en uso');
  }

  const emailExists = users.some(
    u => u.email.toLowerCase() === email.toLowerCase()
  );
  if (emailExists) {
    throw new Error('El correo electrónico ya está en uso');
  }

  const newUser: User = {
    id: `${Date.now()}`,
    username,
    email,
    role,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=111827&color=fff&size=128`,
    xp: 0,
    clubId,
    createdAt: new Date().toISOString(),
    status: 'active',
    notifications: true,
    lastLogin: new Date().toISOString(),
    followers: 0,
    following: 0,
    password: hashPassword(password)
  };

  users.push(newUser);
  saveUsers(users);

  return newUser;
};

// Login function
export const login = async (email: string, password: string): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    throw new Error(error?.message || 'Error al iniciar sesión');
  }
  return mapAuthUser(data.user);
};

// Logout function
export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
};

// Update user function
export const updateUser = async (updates: { email?: string; password?: string; data?: any }): Promise<User> => {
  const { data, error } = await supabase.auth.updateUser(updates);
  if (error || !data.user) {
    throw new Error(error?.message || 'Error al actualizar');
  }
  return mapAuthUser(data.user);
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};

// Delete a user by ID and update localStorage
export const deleteUser = async (id: string): Promise<void> => {
  const users = getUsers();
  const updatedUsers = users.filter(u => u.id !== id);
  saveUsers(updatedUsers);

  const currentUser = await getCurrentUser();
  if (currentUser && currentUser.id === id) {
    saveCurrentUser(null);
  }
};

// Password reset token handling
interface ResetToken {
  token: string;
  userId: string;
  expiresAt: number;
}

const getResetTokens = (): ResetToken[] => {
  const json = localStorage.getItem(VZ_RESET_TOKENS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveResetTokens = (tokens: ResetToken[]): void => {
  localStorage.setItem(VZ_RESET_TOKENS_KEY, JSON.stringify(tokens));
};

const generateToken = (): string => {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    return Array.from(arr)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback for environments without Web Crypto API
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += Math.floor(Math.random() * 16).toString(16);
  }
  return token;
};

const sendResetEmail = (email: string, token: string): void => {
  const apiKey = import.meta.env.VITE_SMTP_API_KEY;
  if (!apiKey) {
    console.log('SMTP service not configured');
    return;
  }
  console.log(`Reset link for ${email}: /reset/${token}`);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw new Error(error.message);
};

export const resetPassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
};
 