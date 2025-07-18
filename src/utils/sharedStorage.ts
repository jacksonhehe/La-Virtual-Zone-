import {
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
  VZ_MARKET_KEY,
  VZ_CLUB_KEY,
  VZ_FIXTURES_KEY
} from './storageKeys';

// Utilidad genérica para get/set
function getItem<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;
  const json = localStorage.getItem(key);
  if (json) {
    try {
      return JSON.parse(json) as T;
    } catch {}
  }
  return fallback;
}
function setItem<T>(key: string, value: T) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const getTournaments = () => getItem(VZ_TOURNAMENTS_KEY, []);
export const saveTournaments = (data: any) => setItem(VZ_TOURNAMENTS_KEY, data);

export const getNews = () => getItem(VZ_NEWS_KEY, []);
export const saveNews = (data: any) => setItem(VZ_NEWS_KEY, data);

export const getTransfers = () => getItem(VZ_TRANSFERS_KEY, []);
export const saveTransfers = (data: any) => setItem(VZ_TRANSFERS_KEY, data);

export const getStandings = () => getItem(VZ_STANDINGS_KEY, []);
export const saveStandings = (data: any) => setItem(VZ_STANDINGS_KEY, data);

export const getActivities = () => getItem(VZ_ACTIVITIES_KEY, []);
export const saveActivities = (data: any) => setItem(VZ_ACTIVITIES_KEY, data);

export const getComments = () => getItem(VZ_COMMENTS_KEY, []);
export const saveComments = (data: any) => setItem(VZ_COMMENTS_KEY, data);

export const getOffers = () => getItem(VZ_OFFERS_KEY, []);
export const saveOffers = (data: any) => setItem(VZ_OFFERS_KEY, data);

export const getFaqs = () => getItem(VZ_FAQS_KEY, []);
export const saveFaqs = (data: any) => setItem(VZ_FAQS_KEY, data);

export const getPosts = () => getItem(VZ_POSTS_KEY, []);
export const savePosts = (data: any) => setItem(VZ_POSTS_KEY, data);

export const getMarketStatus = () => getItem(VZ_MARKET_STATUS_KEY, false);
export const saveMarketStatus = (data: any) => setItem(VZ_MARKET_STATUS_KEY, data);

export const getMediaItems = () => getItem(VZ_MEDIA_ITEMS_KEY, []);
export const saveMediaItems = (data: any) => setItem(VZ_MEDIA_ITEMS_KEY, data);

export const getStoreItems = () => getItem(VZ_STORE_ITEMS_KEY, []);
export const saveStoreItems = (data: any) => setItem(VZ_STORE_ITEMS_KEY, data);

export const getPositions = () => getItem(VZ_POSITIONS_KEY, []);
export const savePositions = (data: any) => setItem(VZ_POSITIONS_KEY, data);

export const getDtRankings = () => getItem(VZ_DT_RANKINGS_KEY, []);
export const saveDtRankings = (data: any) => setItem(VZ_DT_RANKINGS_KEY, data);

export const getTasks = () => getItem(VZ_TASKS_KEY, []);
export const saveTasks = (data: any) => setItem(VZ_TASKS_KEY, data);

export const getEvents = () => getItem(VZ_EVENTS_KEY, []);
export const saveEvents = (data: any) => setItem(VZ_EVENTS_KEY, data);

export const getObjectives = () => getItem(VZ_OBJECTIVES_KEY, []);
export const saveObjectives = (data: any) => setItem(VZ_OBJECTIVES_KEY, data);

export const getMarket = () => getItem(VZ_MARKET_KEY, {});
export const saveMarket = (data: any) => setItem(VZ_MARKET_KEY, data);

export const getClub = () => getItem(VZ_CLUB_KEY, {});
export const saveClub = (data: any) => setItem(VZ_CLUB_KEY, data);

export const getFixtures = () => getItem(VZ_FIXTURES_KEY, []);
export const saveFixtures = (data: any) => setItem(VZ_FIXTURES_KEY, data); 