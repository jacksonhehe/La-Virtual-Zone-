import { describe, it, expect, vi } from 'vitest';
import { loadAdminData, AdminData } from '../src/adminPanel/utils/adminStorage';

vi.mock('../src/supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ data: [] }))
      })),
      auth: { getSession: vi.fn(() => ({ data: { session: null } })) }
    }
  };
});

describe('loadAdminData', () => {
  it('keeps default data when tables are empty', async () => {
    const defaults: AdminData = {
      users: [{ id: '1', username: 'admin' } as any],
      clubs: [],
      players: [],
      matches: [],
      tournaments: [],
      newsItems: [],
      transfers: [],
      standings: [],
      activities: [],
      comments: []
    };

    const data = await loadAdminData(defaults);
    expect(data.users).toEqual(defaults.users);
  });
});
