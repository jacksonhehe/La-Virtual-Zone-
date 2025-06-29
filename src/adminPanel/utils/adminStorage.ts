import {
  VZ_USERS_KEY,
  VZ_CLUBS_KEY,
  VZ_PLAYERS_KEY,
  VZ_FIXTURES_KEY
} from '../../utils/storageKeys';

export interface AdminData {
  users: import('../types').User[];
  clubs: import('../types').Club[];
  players: import('../types').Player[];
  matches: import('../types').Fixture[];
  tournaments: import('../types').Tournament[];
  matches: import('../types').Fixture[];
  newsItems: import('../types').NewsItem[];
  transfers: import('../types').Transfer[];
  standings: import('../types').Standing[];
  activities: import('../types').ActivityLog[];
  comments: import('../types').Comment[];
}

const PREFIX = 'vz_';

// Keys previously used by older admin panel versions
const OLD_KEYS = {
  users: `${PREFIX}users_admin`,
  clubs: `${PREFIX}clubs_admin`,
  players: `${PREFIX}players_admin`,
  tournaments: `${PREFIX}tournaments_admin`,
  matches: `${PREFIX}matches_admin`,
  newsItems: `${PREFIX}news_admin`,
  transfers: `${PREFIX}transfers_admin`,
  standings: `${PREFIX}standings_admin`,
  activities: `${PREFIX}activities_admin`,
  comments: `${PREFIX}comments_admin`,
  matches: `${PREFIX}fixtures_admin`
} as const;

// Updated keys aligned with the main application
const keys = {
  users: VZ_USERS_KEY,
  clubs: VZ_CLUBS_KEY,
  players: VZ_PLAYERS_KEY,
  matches: VZ_FIXTURES_KEY,
  tournaments: OLD_KEYS.tournaments,
  matches: OLD_KEYS.matches,
  newsItems: OLD_KEYS.newsItems,
  transfers: OLD_KEYS.transfers,
  standings: OLD_KEYS.standings,
  activities: OLD_KEYS.activities,
  comments: OLD_KEYS.comments
} as const;

const migrateOldKeys = () => {
  Object.entries(OLD_KEYS).forEach(([prop, oldKey]) => {
    const newKey = (keys as any)[prop];
    if (oldKey !== newKey) {
      const oldVal = localStorage.getItem(oldKey);
      if (oldVal && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, oldVal);
      }
      if (oldVal) {
        localStorage.removeItem(oldKey);
      }
    }
  });
};

export const loadAdminData = (defaults: AdminData): AdminData => {
  if (typeof localStorage === 'undefined') {
    return defaults;
  }
  const data: AdminData = { ...defaults };
  migrateOldKeys();
  Object.entries(keys).forEach(([prop, key]) => {
    const json = localStorage.getItem(key);
    if (json) {
      try {
        (data as any)[prop] = JSON.parse(json);
      } catch {
        // ignore parse errors and keep defaults
      }
    }
  });
  return data;
};

export const saveAdminData = (data: AdminData): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }
  Object.entries(keys).forEach(([prop, key]) => {
    const value = (data as any)[prop];
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore write errors
    }
  });
};
