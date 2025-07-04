import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament } from '../types';

export default function useTorneos() {
  const [torneos, setTorneos] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchTorneos = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('torneos').select('*').order('id');
    if (!error && data) {
      setTorneos(data as Tournament[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTorneos();
    const channel = supabase
      .channel('public:torneos')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'torneos' },
        () => fetchTorneos()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTorneos]);

  return { torneos, loading, refresh: fetchTorneos };
}
