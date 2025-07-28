// Paste this inside your Zustand global store where actions are defined.
// It assumes you already have state: { transfers: any[] } and actions: refreshTransfers, approveTransfer, rejectTransfer.
// This snippet adds/overrides to use the backend API.

import { apiListTransfers, apiImportTransfers, apiApproveTransfer, apiRejectTransfer, type Transfer } from '../api/transfers';

// Add this to your store's actions:
refreshTransfers: async () => {
  const items = await apiListTransfers();
  set({ transfers: items });
},

approveTransfer: async (id: string) => {
  await apiApproveTransfer(id);
  // optimistic local update
  set(state => ({
    transfers: (state.transfers || []).map((t: any) => String(t.id) === String(id) ? { ...t, status: 'approved' } : t)
  }));
},

rejectTransfer: async (id: string, reason?: string) => {
  await apiRejectTransfer(id, reason || '');
  set(state => ({
    transfers: (state.transfers || []).map((t: any) => String(t.id) === String(id) ? { ...t, status: 'rejected', rejectReason: reason || '' } : t)
  }));
},

// NEW: importTransfers
importTransfers: async (rows: Transfer[]) => {
  if (!Array.isArray(rows) || rows.length === 0) return { inserted: 0, updated: 0, total: (get().transfers || []).length };
  const res = await apiImportTransfers(rows);
  // reload list to reflect merges
  const items = await apiListTransfers();
  set({ transfers: items });
  return res; // {inserted, updated, total}
},