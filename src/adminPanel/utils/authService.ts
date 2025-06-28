import  { User } from '../types';

export const addUser = (email: string, username: string, role: 'user' | 'dt' | 'admin'): User => {
  return {
    id: `${Date.now()}`,
    username,
    email,
    role,
    status: 'active'
  };
};
 