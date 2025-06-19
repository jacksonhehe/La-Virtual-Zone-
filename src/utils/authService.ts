import { User } from '../types';

// Simulated backend - using localStorage for persistence
const USERS_KEY = 'virtual_zone_users';
const CURRENT_USER_KEY = 'virtual_zone_current_user';

// Simple base64 "hash" for demo purposes
const hashPassword = (pwd: string): string => {
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
    avatar: 'https://ui-avatars.com/api/?name=Coach&background=00b3ff&color=fff&size=128&bold=true',
    joinDate: new Date().toISOString(),
    status: 'active',
    achievements: ['first_win', 'first_transfer'],
    following: {
      users: [],
      clubs: ['Rayo Digital FC'],
      players: []
    },
    password: TEST_PASSWORD
  }
];

// Get users from localStorage or initialize with test users
export const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  if (!usersJson) {
    localStorage.setItem(USERS_KEY, JSON.stringify(TEST_USERS));
    return TEST_USERS;
  }
  
  return JSON.parse(usersJson);
};

// Save users to localStorage
const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Get current logged in user
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Save current user to localStorage
export const saveCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// Register a new user and log them in
export const register = (
  email: string,
  username: string,
  password: string
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
    role: 'user',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      username
    )}&background=111827&color=fff&size=128`,
    xp: 0,
    joinDate: new Date().toISOString(),
    status: 'active',
    notifications: true,
    lastLogin: new Date().toISOString(),
    followers: 0,
    following: 0,
    password: hashPassword(password)
  };

  users.push(newUser);
  saveUsers(users);
  saveCurrentUser(newUser);

  return newUser;
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
export const login = (username: string, password: string): User => {
  // Get users, falling back to test users if none exist
  const users = getUsers();
  
  // Find user by username (case insensitive)
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (!user) {
    throw new Error('Usuario no encontrado');
  }
  
  if (user.status !== 'active') {
    throw new Error('Esta cuenta está suspendida o baneada');
  }

  if (user.password && user.password !== hashPassword(password)) {
    throw new Error('Contraseña incorrecta');
  }
  
  // Update last login time
  user.lastLogin = new Date().toISOString();
  saveUsers(users.map(u => u.id === user.id ? user : u));
  
  // Save the current user
  saveCurrentUser(user);
  
  return user;
};

// Logout function
export const logout = (): void => {
  saveCurrentUser(null);
};

// Update user function
export const updateUser = (user: User): User => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  saveUsers(updatedUsers);
  
  // If updating the current user, update local storage
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === user.id) {
    saveCurrentUser(user);
  }
  
  return user;
};

// Get user by ID
export const getUserById = (userId: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
};
 