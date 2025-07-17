import { getUsers } from './authService';
import { User } from '../types/shared';

export interface UserQuery {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedUsers {
  users: User[];
  total: number;
}

export const fetchUsers = async (
  query: UserQuery
): Promise<PagedUsers> => {
  const { search = '', page = 1, pageSize = 10 } = query;
  const term = search.toLowerCase();
  const all = getUsers();
  const filtered = all.filter(
    u =>
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
  );
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  await new Promise(res => setTimeout(res, 300));
  return { users: data, total };
};

export const getUserByUsername = (username: string): User | null => {
  const all = getUsers();
  return (
    all.find(u => u.username.toLowerCase() === username.toLowerCase()) || null
  );
};
