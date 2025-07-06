import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Player } from '../types/shared';
import { getPlayers } from '../utils/dataService';

export default function useJugadores() {
  const [jugadores, setJugadores] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchJugadores = useCallback(async () => {
    setLoading(true);
    const { data } = await getPlayers();
    setJugadores(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchJugadores();
    const channel = supabase
      .channel('public:jugadores')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jugadores' },
        () => fetchJugadores()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jugadores' },
        () => fetchJugadores()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'jugadores' },
        () => fetchJugadores()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchJugadores]);

  return { jugadores, loading, refresh: fetchJugadores };
}
