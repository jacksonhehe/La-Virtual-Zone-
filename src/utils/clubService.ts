import { Club } from '../types/shared';

const API_BASE = typeof window === 'undefined' ? 'http://localhost:3000' : '';

export const getClubs = async (): Promise<Club[]> => {
  const res = await fetch(`${API_BASE}/clubs`);
  if (!res.ok) throw new Error('Failed to load clubs');
  return res.json();
};

export const createClub = async (club: { name: string }): Promise<Club> => {
  const res = await fetch(`${API_BASE}/clubs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(club),
  });
  if (!res.ok) throw new Error('Failed to create club');
  return res.json();
};

export const updateClub = async (
  id: number,
  club: Partial<Club>,
): Promise<Club> => {
  const res = await fetch(`${API_BASE}/clubs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(club),
  });
  if (!res.ok) throw new Error('Failed to update club');
  return res.json();
};
