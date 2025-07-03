export const VZ_OFFERS_KEY = 'vz_offers';

import { TransferOffer } from '../types';
import { offers as defaultOffers } from '../data/mockData';

export const getOffers = (): TransferOffer[] => {
  if (typeof localStorage === 'undefined') return defaultOffers as TransferOffer[];
  const json = localStorage.getItem(VZ_OFFERS_KEY);
  if (json) {
    try {
      return JSON.parse(json) as TransferOffer[];
    } catch {
      // ignore and fallback to defaults
    }
  }
  return defaultOffers as TransferOffer[];
};

export const saveOffers = (data: TransferOffer[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_OFFERS_KEY, JSON.stringify(data));
};
