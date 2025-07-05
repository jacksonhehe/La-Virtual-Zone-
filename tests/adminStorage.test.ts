import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadAdminData, saveAdminData, AdminData } from '../src/adminPanel/utils/adminStorage';

const selectMock = vi.fn();
const deleteMock = vi.fn(() => ({ in: vi.fn() }));
const upsertMock = vi.fn();
vi.mock('../src/supabaseClient', () => ({
  supabase: {
    from: (table: string) => ({
      select: selectMock.mockImplementation(() => ({ data: [] })),
      delete: deleteMock,
      upsert: upsertMock
    }),
    auth: { getSession: vi.fn(() => ({ data: { session: null } })) }
  }
}));

const defaults: AdminData = {
  users: [],
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

beforeEach(() => {
  selectMock.mockImplementation(() => ({ data: [] }));
});

describe('adminStorage', () => {
  it('returns defaults when tables are empty', async () => {
    const data = await loadAdminData(defaults);
    expect(data).toEqual(defaults);
  });

  it('loads data from supabase when available', async () => {
    selectMock.mockImplementationOnce(() => ({ data: [{ id: '1' }] }));
    const data = await loadAdminData(defaults);
    expect(data.users).toEqual([{ id: '1' }]);
  });

  it('saveAdminData does not throw', async () => {
    await expect(saveAdminData(defaults)).resolves.not.toThrow();
  });
});
