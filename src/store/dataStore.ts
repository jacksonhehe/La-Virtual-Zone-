import { create } from 'zustand';
import { getUsers } from '../utils/authService';
import { 
  clubs,
  players,
  tournaments,
  transfers,
  offers,
  marketStatus,
  currentSeason,
  currentJornada,
  leagueStandings,
  newsItems,
  mediaItems,
  faqs,
  storeItems
} from '../data/mockData';
import {
  Club,
  Player,
  User,
  Tournament,
  Transfer,
  TransferOffer,
  Standing,
  NewsItem,
  MediaItem,
  FAQ,
  StoreItem
} from '../types';

interface DataState {
  clubs: Club[];
  players: Player[];
  users: User[];
  tournaments: Tournament[];
  transfers: Transfer[];
  offers: TransferOffer[];
  standings: Standing[];
  newsItems: NewsItem[];
  mediaItems: MediaItem[];
  faqs: FAQ[];
  storeItems: StoreItem[];
  marketStatus: boolean;
  season: number;
  jornada: number;
  
  updateClubs: (newClubs: Club[]) => void;
  updatePlayers: (newPlayers: Player[]) => void;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  updateSeason: (season: number) => void;
  updateJornada: (jornada: number) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  addTransfer: (transfer: Transfer) => void;
  addUser: (user: User) => void;
  addClub: (club: Club) => void;
  addPlayer: (player: Player) => void;
}

export const useDataStore = create<DataState>((set) => ({
  clubs,
  players,
  tournaments,
  transfers,
  offers,
  standings: leagueStandings,
  newsItems,
  mediaItems,
  faqs,
  storeItems,
  marketStatus,
  season: currentSeason,
  jornada: currentJornada,
  users: getUsers(),
  
  updateClubs: (newClubs) => set({ clubs: newClubs }),
  
  updatePlayers: (newPlayers) => set({ players: newPlayers }),
  
  updateTournaments: (newTournaments) => set({ tournaments: newTournaments }),
  
  updateTransfers: (newTransfers) => set({ transfers: newTransfers }),
  
  updateOffers: (newOffers) => set({ offers: newOffers }),
  
  updateMarketStatus: (status) => set({ marketStatus: status }),
  updateSeason: (season) => set({ season }),
  updateJornada: (jornada) => set({ jornada }),
  
  addOffer: (offer) => set((state) => ({
    offers: [...state.offers, offer]
  })),
  
  updateOfferStatus: (offerId, status) => set((state) => ({
    offers: state.offers.map(offer =>
      offer.id === offerId ? { ...offer, status } : offer
    )
  })),

  addTransfer: (transfer) => set((state) => ({
    transfers: [transfer, ...state.transfers]
  })),

  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),

  addClub: (club) => set((state) => ({
    clubs: [...state.clubs, club]
  })),

  addPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  }))
}));
 