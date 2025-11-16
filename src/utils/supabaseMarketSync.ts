import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';
import type { TransferOffer, Transfer } from '../types';

const isSupabaseEnabled = (): boolean => {
  return config.useSupabase && !!config.supabase.url && !!config.supabase.anonKey;
};

const safeSupabase = () => {
  if (!isSupabaseEnabled()) return null;
  try {
    return getSupabaseClient();
  } catch (error) {
    console.warn('supabaseMarketSync: Supabase not configured:', error);
    return null;
  }
};

export const upsertOfferToSupabase = async (offer: TransferOffer): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  const isUuid = (value: string | undefined | null) => {
    if (!value) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  };

  const normalized = {
    id: offer.id,
    player_id: offer.playerId,
    player_name: offer.playerName,
    from_club: offer.fromClub,
    to_club: offer.toClub,
    amount: offer.amount,
    status: offer.status,
    user_id: isUuid(offer.userId) ? offer.userId : null,
    date: offer.date ?? new Date().toISOString(),
    // 'history' column no longer exists in Supabase, keep it local-only
    counter_amount: offer.counterAmount ?? null,
    counter_message: offer.counterMessage ?? null
  };

  const { error } = await supabase
    .from('offers')
    .upsert(normalized, { onConflict: 'id' });

  if (error) {
    console.error('supabaseMarketSync: Error upserting offer:', error);
  }
};

export const updateOfferStatusInSupabase = async (offerId: string, changes: Partial<TransferOffer>): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  const payload: any = {};
  if (changes.status) payload.status = changes.status;
  if (changes.counterAmount !== undefined) payload.counter_amount = changes.counterAmount;
  if (changes.counterMessage !== undefined) payload.counter_message = changes.counterMessage;

  if (Object.keys(payload).length === 0) return;

  const { error } = await supabase
    .from('offers')
    .update(payload)
    .eq('id', offerId);

  if (error) {
    console.error('supabaseMarketSync: Error updating offer status:', error);
  }
};

export const upsertTransferToSupabase = async (transfer: Transfer): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  await supabase
    .from('transfers')
    .upsert({
      id: transfer.id,
      player_id: transfer.playerId,
      player_name: transfer.playerName,
      from_club: transfer.fromClub,
      to_club: transfer.toClub,
      fee: transfer.fee,
      date: transfer.date ?? new Date().toISOString()
    }, { onConflict: 'id' });
};

export const fetchSupabaseOffers = async (): Promise<TransferOffer[]> => {
  const supabase = safeSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('offers')
    .select('*');
  if (error) {
    console.error('supabaseMarketSync: Error fetching offers:', error);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    fromClub: row.from_club,
    toClub: row.to_club,
    amount: Number(row.amount) || 0,
    status: row.status,
    date: row.date,
    userId: row.user_id,
    history: row.history || [],
    counterAmount: row.counter_amount,
    counterMessage: row.counter_message
  }));
};

export const fetchSupabaseTransfers = async (): Promise<Transfer[]> => {
  const supabase = safeSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('transfers')
    .select('*');
  if (error) {
    console.error('supabaseMarketSync: Error fetching transfers:', error);
    return [];
  }
  return (data || []).map((row: any) => ({
    id: row.id,
    playerId: row.player_id,
    playerName: row.player_name,
    fromClub: row.from_club,
    toClub: row.to_club,
    fee: Number(row.fee) || 0,
    date: row.date
  }));
};

const MARKET_STATUS_TABLE = 'market_status';
const MARKET_STATUS_ID = 'global_status';

export const fetchSupabaseMarketStatus = async (): Promise<boolean | null> => {
  const supabase = safeSupabase();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(MARKET_STATUS_TABLE)
      .select('is_open')
      .eq('id', MARKET_STATUS_ID)
      .maybeSingle();

    if (error) throw error;
    if (!data || typeof data.is_open !== 'boolean') return null;
    return data.is_open;
  } catch (error) {
    console.error('supabaseMarketSync: Error fetching market status:', error);
    return null;
  }
};

export const upsertMarketStatusToSupabase = async (status: boolean): Promise<void> => {
  const supabase = safeSupabase();
  if (!supabase) return;

  try {
    await supabase
      .from(MARKET_STATUS_TABLE)
      .upsert({
        id: MARKET_STATUS_ID,
        is_open: status,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
  } catch (error) {
    console.error('supabaseMarketSync: Error updating market status:', error);
  }
};
