// src/adminPanel/api/transfers.ts
export type Transfer = {
  id: string;
  playerId?: string;
  playerName?: string;
  fromClubId?: string;
  fromClubName?: string;
  toClubId?: string;
  toClubName?: string;
  amount?: number;
  fee?: number;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  date?: string;
  // other fields are allowed
  [k: string]: any;
};

const BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:4000';

export async function apiListTransfers(): Promise<Transfer[]> {
  const res = await fetch(`${BASE}/api/transfers`);
  if (!res.ok) throw new Error('Failed to fetch transfers');
  const data = await res.json();
  return Array.isArray(data?.items) ? data.items : [];
}

export async function apiImportTransfers(items: Transfer[]): Promise<{inserted:number; updated:number; total:number}> {
  const res = await fetch(`${BASE}/api/transfers/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items })
  });
  if (!res.ok) throw new Error('Failed to import transfers');
  return res.json();
}

export async function apiApproveTransfer(id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/transfers/${encodeURIComponent(id)}/approve`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to approve');
}

export async function apiRejectTransfer(id: string, reason: string): Promise<void> {
  const res = await fetch(`${BASE}/api/transfers/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to reject');
}