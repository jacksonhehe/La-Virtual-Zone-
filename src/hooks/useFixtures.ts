import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Match } from '../types';
import { getFixtures } from '../utils/dataService';

export default function useFixtures() {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    const { data } = await getFixtures();
    setFixtures(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFixtures();
    const channel = supabase
      .channel('public:fixtures')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'fixtures' },
        () => fetchFixtures()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'fixtures' },
        () => fetchFixtures()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'fixtures' },
        () => fetchFixtures()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFixtures]);

  return { fixtures, loading, refresh: fetchFixtures };
}
