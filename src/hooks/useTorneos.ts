import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament } from '../types';
import { getTournaments } from '../utils/dataService';

export default function useTorneos() {
  const [torneos, setTorneos] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTorneos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getTournaments();
    setTorneos(data);
    setError(error ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTorneos();
    const channel = supabase
      .channel('public:torneos')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'torneos' },
        () => fetchTorneos()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'torneos' },
        () => fetchTorneos()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'torneos' },
        () => fetchTorneos()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTorneos]);

  return { torneos, loading, error, refresh: fetchTorneos };
}
