import {
  VZ_USERS_KEY,
  VZ_CLUBS_KEY,
  VZ_PLAYERS_KEY,
  VZ_FIXTURES_KEY,
  VZ_TOURNAMENTS_KEY,
  VZ_NEWS_KEY,
  VZ_TRANSFERS_KEY,
  VZ_STANDINGS_KEY,
  VZ_ACTIVITIES_KEY,
  VZ_COMMENTS_KEY,
  VZ_OFFERS_KEY,
  VZ_FAQS_KEY,
  VZ_POSTS_KEY,
  VZ_MARKET_STATUS_KEY,
  VZ_MEDIA_ITEMS_KEY,
  VZ_STORE_ITEMS_KEY,
  VZ_POSITIONS_KEY,
  VZ_DT_RANKINGS_KEY,
  VZ_TASKS_KEY,
  VZ_EVENTS_KEY,
  VZ_OBJECTIVES_KEY,
  VZ_MARKET_KEY
} from '../../utils/storageKeys';

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

// Eliminar OLD_KEYS y migraciones
// Usar solo las claves importadas de storageKeys
const keys = {
  users: VZ_USERS_KEY,
  clubs: VZ_CLUBS_KEY,
  players: VZ_PLAYERS_KEY,
  matches: VZ_FIXTURES_KEY,
  tournaments: VZ_TOURNAMENTS_KEY,
  newsItems: VZ_NEWS_KEY,
  transfers: VZ_TRANSFERS_KEY,
  standings: VZ_STANDINGS_KEY,
  activities: VZ_ACTIVITIES_KEY,
  comments: VZ_COMMENTS_KEY,
  offers: VZ_OFFERS_KEY,
  faqs: VZ_FAQS_KEY,
  posts: VZ_POSTS_KEY,
  marketStatus: VZ_MARKET_STATUS_KEY,
  mediaItems: VZ_MEDIA_ITEMS_KEY,
  storeItems: VZ_STORE_ITEMS_KEY,
  positions: VZ_POSITIONS_KEY,
  dtRankings: VZ_DT_RANKINGS_KEY,
  tasks: VZ_TASKS_KEY,
  events: VZ_EVENTS_KEY,
  objectives: VZ_OBJECTIVES_KEY,
  market: VZ_MARKET_KEY
};

export const loadAdminData = (defaults: AdminData): AdminData => {
  if (typeof localStorage === 'undefined') {
    return defaults;
  }
  const data: AdminData = { ...defaults };
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
