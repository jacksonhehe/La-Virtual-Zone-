import { describe, it, expect, beforeEach } from 'vitest';
import { loadAdminData, saveAdminData, AdminData } from '../src/adminPanel/utils/adminStorage';
import { VZ_USERS_KEY } from '../src/utils/storageKeys';

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

const createMockStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  } as Storage;
};

beforeEach(() => {
  delete (global as any).localStorage;
});

describe('adminStorage', () => {
  it('returns defaults when localStorage is undefined', () => {
    const data = loadAdminData(defaults);
    expect(data).toEqual(defaults);
  });

  it('loads data from localStorage when available', () => {
    const mock = createMockStorage();
    mock.setItem(VZ_USERS_KEY, JSON.stringify([{ id: '1' }]));
    (global as any).localStorage = mock;

    const data = loadAdminData(defaults);
    expect(data.users).toEqual([{ id: '1' }]);
  });

  it('saveAdminData does nothing when localStorage is undefined', () => {
    expect(() => saveAdminData(defaults)).not.toThrow();
  });
});
