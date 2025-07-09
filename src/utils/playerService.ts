import { Player } from '../types/shared';

const API_BASE = typeof window === 'undefined' ? 'http://localhost:3000' : '';

export const getPlayers = async (): Promise<Player[]> => {
  const res = await fetch(`${API_BASE}/players`);
  if (!res.ok) throw new Error('Failed to load players');
  return res.json();
};

export const createPlayer = async (
  player: { name: string; clubId?: number },
): Promise<Player> => {
  const res = await fetch(`${API_BASE}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  if (!res.ok) throw new Error('Failed to create player');
  return res.json();
};

export const updatePlayer = async (
  id: number,
  player: Partial<Player>,
): Promise<Player> => {
  const res = await fetch(`${API_BASE}/players/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(player),
  });
  if (!res.ok) throw new Error('Failed to update player');
  return res.json();
};
