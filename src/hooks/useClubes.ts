import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Club } from '../types/shared';
import { getClubs } from '../utils/dataService';

export default function useClubes() {
  const [clubes, setClubes] = useState<Club[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchClubes = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getClubs();
    setClubes(data);
    setError(error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClubes();
    const channel = supabase
      .channel('public:clubes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'clubes' },
        () => fetchClubes()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'clubes' },
        () => fetchClubes()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'clubes' },
        () => fetchClubes()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClubes]);

  return { clubes, loading, error, refresh: fetchClubes };
}
