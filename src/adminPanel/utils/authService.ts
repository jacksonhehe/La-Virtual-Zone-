import  { User } from '../types/shared';

export const addUser = (email: string, username: string, role: 'user' | 'dt' | 'admin'): User => {
  return {
    id: `${Date.now()}`,
    username,
    email,
    role,
    status: 'active'
  };
};
 