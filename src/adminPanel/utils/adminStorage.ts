import { supabase } from '../../supabaseClient';

export interface AdminData {
  users: import('../types/shared').User[];
  clubs: import('../types/shared').Club[];
  players: import('../types/shared').Player[];
  matches: import('../types').Fixture[];
  tournaments: import('../types').Tournament[];
  newsItems: import('../types').NewsItem[];
  transfers: import('../types').Transfer[];
  standings: import('../types').Standing[];
  activities: import('../types').ActivityLog[];
  comments: import('../types').Comment[];
}

const TABLES = {
  users: 'admin_users',
  clubs: 'admin_clubs',
  players: 'admin_players',
  matches: 'admin_matches',
  tournaments: 'admin_tournaments',
  newsItems: 'admin_news',
  transfers: 'admin_transfers',
  standings: 'admin_standings',
  activities: 'admin_activities',
  comments: 'admin_comments'
} as const;

export const loadAdminData = async (
  defaults: AdminData
): Promise<AdminData> => {
  const data: AdminData = { ...defaults };
  await Promise.all(
    Object.entries(TABLES).map(async ([prop, table]) => {
      const { data: rows } = await supabase.from(table).select('*');
      if (rows && rows.length > 0) {
        (data as any)[prop] = rows;
      }
    })
  );
  return data;
};

export const saveAdminData = async (data: AdminData): Promise<void> => {
  await Promise.all(
    Object.entries(TABLES).map(async ([prop, table]) => {
      const rows = (data as any)[prop];
      if (!Array.isArray(rows)) return;
      await supabase.from(table).delete().neq('id', '');
      if (rows.length > 0) {
        await supabase.from(table).upsert(rows);
      }
    })
  );
};
