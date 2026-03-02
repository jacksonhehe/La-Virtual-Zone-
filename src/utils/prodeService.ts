import { config } from '../lib/config';
import { getSupabaseClient } from '../lib/supabase';

export type ProdeMarket = 'match_result' | 'goals_35' | 'first_goal';
export type ProdeSelection =
  | 'home_win'
  | 'draw'
  | 'away_win'
  | 'over_35'
  | 'under_35'
  | 'first_home'
  | 'first_away'
  | 'first_none';
export type ProdeBetStatus = 'pending' | 'won' | 'lost';

export interface ProdeBet {
  id: string;
  userId: string;
  clubId: string;
  matchId: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  market: ProdeMarket;
  selection: ProdeSelection;
  odds: number;
  stake: number;
  status: ProdeBetStatus;
  payout?: number;
  createdAt: string;
  settledAt?: string;
}

interface CreateProdeBetInput {
  id: string;
  userId: string;
  clubId: string;
  matchId: string;
  tournamentId: string;
  homeTeam: string;
  awayTeam: string;
  matchDate: string;
  market: ProdeMarket;
  selection: ProdeSelection;
  odds: number;
  stake: number;
}

const LOCAL_KEY = 'virtual_zone_prode_bets_v1';

const readLocal = (): ProdeBet[] => {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProdeBet[]) : [];
  } catch {
    return [];
  }
};

const writeLocal = (bets: ProdeBet[]) => {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bets));
};

const rowToBet = (row: any): ProdeBet => ({
  id: row.id,
  userId: row.user_id,
  clubId: row.club_id,
  matchId: row.match_id,
  tournamentId: row.tournament_id,
  homeTeam: row.home_team,
  awayTeam: row.away_team,
  matchDate: row.match_date,
  market: row.market || 'match_result',
  selection: row.selection || row.outcome || 'home_win',
  odds: row.odds,
  stake: row.stake,
  status: row.status,
  payout: row.payout ?? undefined,
  createdAt: row.created_at,
  settledAt: row.settled_at ?? undefined,
});

const betToInsertRow = (input: CreateProdeBetInput) => ({
  id: input.id,
  user_id: input.userId,
  club_id: input.clubId,
  match_id: input.matchId,
  tournament_id: input.tournamentId,
  home_team: input.homeTeam,
  away_team: input.awayTeam,
  match_date: input.matchDate,
  market: input.market,
  selection: input.selection,
  outcome: input.selection,
  odds: input.odds,
  stake: input.stake,
  status: 'pending',
  payout: null,
  created_at: new Date().toISOString(),
  settled_at: null,
});

export const listProdeBetsByUser = async (userId: string): Promise<ProdeBet[]> => {
  if (!userId) return [];

  if (!config.useSupabase) {
    return readLocal().filter((bet) => bet.userId === userId);
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('prode_bets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('ProdeService: error loading bets from Supabase, fallback local', error);
      return readLocal().filter((bet) => bet.userId === userId);
    }

    return (data || []).map(rowToBet);
  } catch (error) {
    console.error('ProdeService: failed loading bets from Supabase, fallback local', error);
    return readLocal().filter((bet) => bet.userId === userId);
  }
};

export const createProdeBet = async (input: CreateProdeBetInput): Promise<ProdeBet> => {
  const localBet: ProdeBet = {
    ...input,
    status: 'pending',
    payout: undefined,
    createdAt: new Date().toISOString(),
  };

  if (!config.useSupabase) {
    const all = readLocal();
    writeLocal([...all, localBet]);
    return localBet;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('prode_bets')
    .insert(betToInsertRow(input))
    .select('*')
    .single();

  if (error || !data) {
    console.error('ProdeService: error creating bet in Supabase', error);
    throw new Error(error?.message || 'No se pudo registrar la apuesta en Supabase');
  }

  return rowToBet(data);
};

export const deleteProdeBet = async (betId: string): Promise<void> => {
  const local = readLocal();
  writeLocal(local.filter((bet) => bet.id !== betId));

  if (!config.useSupabase) return;

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from('prode_bets').delete().eq('id', betId);
    if (error) {
      console.error('ProdeService: error deleting bet in Supabase', error);
    }
  } catch (error) {
    console.error('ProdeService: failed deleting bet in Supabase', error);
  }
};

export const settleProdeBet = async (
  betId: string,
  status: 'won' | 'lost',
  payout: number
): Promise<ProdeBet | null> => {
  const settledAt = new Date().toISOString();
  const local = readLocal();
  const target = local.find((bet) => bet.id === betId);
  if (target) {
    const nextLocal = local.map((bet) =>
      bet.id === betId && bet.status === 'pending' ? { ...bet, status, payout, settledAt } : bet
    );
    writeLocal(nextLocal);
  }

  if (!config.useSupabase) {
    const updated = readLocal().find((bet) => bet.id === betId);
    return updated || null;
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('prode_bets')
      .update({
        status,
        payout,
        settled_at: settledAt,
      })
      .eq('id', betId)
      .eq('status', 'pending')
      .select('*')
      .single();

    if (error || !data) {
      if (error) {
        console.error('ProdeService: error settling bet in Supabase', error);
      }
      return null;
    }

    return rowToBet(data);
  } catch (error) {
    console.error('ProdeService: failed settling bet in Supabase', error);
    return null;
  }
};
