import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Match } from '../types';

export default function useFixtures() {
  const [fixtures, setFixtures] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('fixtures').select('*').order('id');
    if (!error && data) {
      setFixtures(data as Match[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFixtures();
    const channel = supabase
      .channel('public:fixtures')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fixtures' },
        () => fetchFixtures()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchFixtures]);

  return { fixtures, loading, refresh: fetchFixtures };
}
