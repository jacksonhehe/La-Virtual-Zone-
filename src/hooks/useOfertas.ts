import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { TransferOffer } from '../types';
import { getOffers } from '../utils/dataService';

export default function useOfertas() {
  const [ofertas, setOfertas] = useState<TransferOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOfertas = useCallback(async () => {
    setLoading(true);
    const { data } = await getOffers();
    setOfertas(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOfertas();
    const channel = supabase
      .channel('public:ofertas')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ofertas' },
        () => fetchOfertas()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'ofertas' },
        () => fetchOfertas()
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ofertas' },
        () => fetchOfertas()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOfertas]);

  return { ofertas, loading, refresh: fetchOfertas };
}
