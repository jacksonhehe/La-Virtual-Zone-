export const VZ_OFFERS_KEY = 'vz_offers';

import { TransferOffer } from '../types';
import { offers as defaultOffers } from '../data/mockData';

/**
 * Load transfer offers from localStorage.
 *
 * Default offers act as the source of truth: any stored offer with the
 * same `id` is updated with default data, while new default offers are
 * appended. The resulting list is persisted back to localStorage.
 */
export const getOffers = (): TransferOffer[] => {
  if (typeof localStorage === 'undefined') {
    return defaultOffers as TransferOffer[];
  }

  const json = localStorage.getItem(VZ_OFFERS_KEY);
  if (!json) {
    saveOffers(defaultOffers as TransferOffer[]);
    return defaultOffers as TransferOffer[];
  }

  try {
    const stored = JSON.parse(json) as TransferOffer[];

    // Default offers take precedence. Existing entries with the same id
    // are updated to ensure new fields are not lost and new offers are added.
    const merged = [...stored];
    for (const offer of defaultOffers) {
      const index = merged.findIndex(o => o.id === offer.id);
      if (index !== -1) {
        merged[index] = { ...merged[index], ...offer };
      } else {
        merged.push(offer);
      }
    }

    saveOffers(merged);
    return merged;
  } catch {
    // ignore errors and fallback to defaults
    saveOffers(defaultOffers as TransferOffer[]);
    return defaultOffers as TransferOffer[];
  }
};

export const saveOffers = (data: TransferOffer[]): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(VZ_OFFERS_KEY, JSON.stringify(data));
};
