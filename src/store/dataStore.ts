import { create } from 'zustand';
import {
  clubs as defaultClubs,
  players as defaultPlayers,
  tournaments as defaultTournaments,
  transfers as defaultTransfers,
  offers as defaultOffers,
  marketStatus as defaultMarketStatus,
  leagueStandings,
  newsItems as defaultNews,
  mediaItems as defaultMedia,
  faqs as defaultFaqs,
  storeItems as defaultStoreItems
} from '../data/mockData';
import {
  Club,
  Player,
  Tournament,
  Transfer,
  TransferOffer,
  Standing,
  NewsItem,
  MediaItem,
  FAQ,
  StoreItem
} from '../types';

const DATA_KEY = 'virtual_zone_data';

interface StoreData {
  clubs: Club[];
  players: Player[];
  tournaments: Tournament[];
  transfers: Transfer[];
  offers: TransferOffer[];
  standings: Standing[];
  newsItems: NewsItem[];
  mediaItems: MediaItem[];
  faqs: FAQ[];
  storeItems: StoreItem[];
  marketStatus: boolean;
}

interface DataState extends StoreData {
  updateClubs: (newClubs: Club[]) => void;
  updatePlayers: (newPlayers: Player[]) => void;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  addClub: (club: Club) => void;
  addPlayer: (player: Player) => void;
  addTournament: (tournament: Tournament) => void;
  addNewsItem: (item: NewsItem) => void;
  addMediaItem: (item: MediaItem) => void;
  addFAQ: (faq: FAQ) => void;
  addStoreItem: (item: StoreItem) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  addTransfer: (transfer: Transfer) => void;
}

function loadData(): Partial<StoreData> | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const json = localStorage.getItem(DATA_KEY);
    return json ? (JSON.parse(json) as StoreData) : null;
  } catch (err) {
    console.error('Failed to load data', err);
    return null;
  }
}

function saveData(state: StoreData): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save data', err);
  }
}

export const useDataStore = create<DataState>((set, get) => {
  const saved = loadData();
  const initial: StoreData = {
    clubs: saved?.clubs || defaultClubs,
    players: saved?.players || defaultPlayers,
    tournaments: saved?.tournaments || defaultTournaments,
    transfers: saved?.transfers || defaultTransfers,
    offers: saved?.offers || defaultOffers,
    standings: leagueStandings,
    newsItems: saved?.newsItems || defaultNews,
    mediaItems: saved?.mediaItems || defaultMedia,
    faqs: saved?.faqs || defaultFaqs,
    storeItems: saved?.storeItems || defaultStoreItems,
    marketStatus: saved?.marketStatus ?? defaultMarketStatus
  };

  const persist = (partial?: Partial<StoreData>) => {
    const current = { ...get(), ...partial } as DataState;
    const data: StoreData = {
      clubs: current.clubs,
      players: current.players,
      tournaments: current.tournaments,
      transfers: current.transfers,
      offers: current.offers,
      standings: current.standings,
      newsItems: current.newsItems,
      mediaItems: current.mediaItems,
      faqs: current.faqs,
      storeItems: current.storeItems,
      marketStatus: current.marketStatus
    };
    saveData(data);
  };

  return {
    ...initial,
    updateClubs: (newClubs) => set(() => {
      persist({ clubs: newClubs });
      return { clubs: newClubs };
    }),
    updatePlayers: (newPlayers) => set(() => {
      persist({ players: newPlayers });
      return { players: newPlayers };
    }),
    updateTournaments: (newTournaments) => set(() => {
      persist({ tournaments: newTournaments });
      return { tournaments: newTournaments };
    }),
    updateTransfers: (newTransfers) => set(() => {
      persist({ transfers: newTransfers });
      return { transfers: newTransfers };
    }),
    updateOffers: (newOffers) => set(() => {
      persist({ offers: newOffers });
      return { offers: newOffers };
    }),
    updateMarketStatus: (status) => set(() => {
      persist({ marketStatus: status });
      return { marketStatus: status };
    }),
    addClub: (club) => set((state) => {
      const clubs = [...state.clubs, club];
      persist({ clubs });
      return { clubs };
    }),
    addPlayer: (player) => set((state) => {
      const players = [...state.players, player];
      persist({ players });
      return { players };
    }),
    addTournament: (tournament) => set((state) => {
      const tournaments = [...state.tournaments, tournament];
      persist({ tournaments });
      return { tournaments };
    }),
    addNewsItem: (item) => set((state) => {
      const newsItems = [...state.newsItems, item];
      persist({ newsItems });
      return { newsItems };
    }),
    addMediaItem: (item) => set((state) => {
      const mediaItems = [...state.mediaItems, item];
      persist({ mediaItems });
      return { mediaItems };
    }),
    addFAQ: (faq) => set((state) => {
      const faqs = [...state.faqs, faq];
      persist({ faqs });
      return { faqs };
    }),
    addStoreItem: (item) => set((state) => {
      const storeItems = [...state.storeItems, item];
      persist({ storeItems });
      return { storeItems };
    }),
    addOffer: (offer) => set((state) => {
      const offers = [...state.offers, offer];
      persist({ offers });
      return { offers };
    }),
    updateOfferStatus: (offerId, status) => set((state) => {
      const offers = state.offers.map((offer) =>
        offer.id === offerId ? { ...offer, status } : offer
      );
      persist({ offers });
      return { offers };
    }),
    addTransfer: (transfer) => set((state) => {
      const transfers = [transfer, ...state.transfers];
      persist({ transfers });
      return { transfers };
    })
  };
});
