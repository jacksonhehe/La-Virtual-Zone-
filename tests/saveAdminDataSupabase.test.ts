import { describe, it, expect, vi } from 'vitest';
import { saveAdminData, AdminData } from '../src/adminPanel/utils/adminStorage';

const selectMock = vi.fn(() => ({ data: [{ id: '1' }, { id: '2' }] }));
const deleteInMock = vi.fn();
const upsertMock = vi.fn();
var fromMock: any;

vi.mock('../src/supabaseClient', () => {
  fromMock = vi.fn(() => ({
    select: selectMock,
    delete: vi.fn(() => ({ in: deleteInMock })),
    upsert: upsertMock
  }));
  return {
    supabase: { from: fromMock, auth: { getSession: vi.fn(() => ({ data: { session: null } })) } }
  };
});

describe('saveAdminData', () => {
  it('deletes only missing ids and upserts new rows', async () => {
    const data: AdminData = {
      tournaments: [
        {
          id: '1',
          name: 'T1',
          status: 'upcoming',
          currentRound: 0,
          totalRounds: 1
        } as any
      ]
    } as any;

    await saveAdminData(data);

    expect(fromMock).toHaveBeenCalledWith('admin_tournaments');
    expect(deleteInMock).toHaveBeenCalledWith('id', ['2']);
    expect(upsertMock).toHaveBeenCalledWith(data.tournaments);
  });
});
