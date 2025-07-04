import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Player } from '../types/shared';

export default function useJugadores() {
  const [jugadores, setJugadores] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchJugadores = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jugadores').select('*').order('id');
    if (!error && data) {
      setJugadores(data as Player[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJugadores();
    const channel = supabase
      .channel('public:jugadores')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jugadores' },
        () => fetchJugadores()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJugadores]);

  return { jugadores, loading, refresh: fetchJugadores };
}
