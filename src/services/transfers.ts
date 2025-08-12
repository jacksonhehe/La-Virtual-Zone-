import { supabase } from '../lib/supabase';
import type { Transfer, TransferInsert, TransferUpdate, TransferWithDetails, SupabaseResponse, SupabaseListResponse } from '../types/supabase';

export async function fetchTransfers(): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .order('created_at', { ascending: false });
}

export async function getTransferById(id: number): Promise<SupabaseResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .eq('id', id)
    .single();
}

export async function getTransfersByClub(clubId: number): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .or(`from_club_id.eq.${clubId},to_club_id.eq.${clubId}`)
    .order('created_at', { ascending: false });
}

export async function getTransfersByPlayer(playerId: number): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .eq('player_id', playerId)
    .order('created_at', { ascending: false });
}

export async function createTransfer(transfer: TransferInsert): Promise<SupabaseResponse<Transfer>> {
  return supabase
    .from('transfers')
    .insert([transfer])
    .select()
    .single();
}

export async function updateTransfer(id: number, updates: Partial<Transfer>): Promise<SupabaseResponse<Transfer>> {
  return supabase
    .from('transfers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
}

export async function setTransferStatus(id: number, status: 'pending' | 'completed' | 'cancelled'): Promise<SupabaseResponse<Transfer>> {
  return supabase
    .from('transfers')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
}

export async function deleteTransfer(id: number): Promise<SupabaseResponse<null>> {
  return supabase
    .from('transfers')
    .delete()
    .eq('id', id);
}

export async function getPendingTransfers(): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
}

export async function getCompletedTransfers(): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false });
}

export async function getTransfersByAmountRange(minAmount: number, maxAmount: number): Promise<SupabaseListResponse<TransferWithDetails>> {
  return supabase
    .from('transfers')
    .select(`
      *,
      player:player_id(id,name,position,overall),
      from:from_club_id(id,name),
      to:to_club_id(id,name)
    `)
    .gte('amount', minAmount)
    .lte('amount', maxAmount)
    .order('amount', { ascending: false });
}
