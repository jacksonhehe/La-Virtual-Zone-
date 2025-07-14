import { TransferOffer } from '../types';
import { supabase } from '../lib/supabaseClient';

export const getOffers = (): TransferOffer[] => {
  supabase.from('transfers').select('*').then(({ data, error }) => {
    if (error) console.error(error);
    else if (typeof localStorage !== 'undefined') {
      localStorage.setItem('vz_offers', JSON.stringify(data));
    }
  });
  const json = typeof localStorage === 'undefined' ? null : localStorage.getItem('vz_offers');
  return json ? JSON.parse(json) as TransferOffer[] : [];
};

export const saveOffers = (data: TransferOffer[]): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('vz_offers', JSON.stringify(data));
  }
  supabase.from('transfers').upsert(data).catch(console.error);
};
