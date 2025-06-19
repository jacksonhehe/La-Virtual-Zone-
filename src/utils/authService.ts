import  { User } from '../types';

// Simulated backend - using localStorage for persistence
const USERS_KEY = 'virtual_zone_users';
const CURRENT_USER_KEY = 'virtual_zone_current_user';

// Mock test users
const TEST_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@virtualzone.com',
    role: 'admin',
    level: 10,
    xp: 1000,
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
    role: 'user',
    level: 1,
    xp: 0,
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
    role: 'dt',
    level: 5,
    xp: 500,
    club: 'Neón FC',
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
 