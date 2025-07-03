export const VZ_OFFERS_KEY = 'vz_offers';

import { TransferOffer } from '../types';
import { offers as defaultOffers } from '../data/mockData';

export const getOffers = (): TransferOffer[] => {
  if (typeof localStorage === 'undefined') {
    return defaultOffers as TransferOffer[];
  }

  const json = localStorage.getItem(VZ_OFFERS_KEY);
  if (!json) {
    return defaultOffers as TransferOffer[];
  }

  try {
    const stored = JSON.parse(json) as TransferOffer[];

    // Merge with new default offers that may not exist in storage
    const merged = [...stored];
    for (const offer of defaultOffers) {
      if (!merged.find(o => o.id === offer.id)) {
        merged.push(offer);
      }
    }

    return merged;
  } catch {
    // ignore and fallback to defaults
    return defaultOffers as TransferOffer[];
  }
};

export const saveOffers = (data: TransferOffer[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_OFFERS_KEY, JSON.stringify(data));
};
