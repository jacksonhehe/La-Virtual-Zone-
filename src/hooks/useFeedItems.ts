import { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';
import type { FeedItem } from '../types';
// TODO: fixtures.json eliminado en migración. Sustituir por servicio Supabase si se requiere.
// import fixtures from '../data/fixtures.json';
import { buildFeed, CalendarEvent } from '../modules/feed/adapters';

const useFeedItems = (): FeedItem[] => {
  const { newsItems, transfers, tournaments, clubs, events } = useDataStore();
  const calendar = fixtures as CalendarEvent[];

  return useMemo(
    () =>
      buildFeed({
        news: newsItems,
        transfers,
        tournaments,
        clubs,
        events: [...calendar, ...events]
      }),
    [newsItems, transfers, tournaments, clubs, events]
  );
};

export default useFeedItems;
