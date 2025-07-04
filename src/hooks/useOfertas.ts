import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { TransferOffer } from '../types';

export default function useOfertas() {
  const [ofertas, setOfertas] = useState<TransferOffer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchOfertas = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('ofertas').select('*').order('id');
    if (!error && data) {
      setOfertas(data as TransferOffer[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOfertas();
    const channel = supabase
      .channel('public:ofertas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ofertas' },
        () => fetchOfertas()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOfertas]);

  return { ofertas, loading, refresh: fetchOfertas };
}
