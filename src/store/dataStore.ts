import { create } from 'zustand';
import { getUsers } from '../utils/authService';
import { 
  clubs,
  players,
  tournaments,
  transfers,
  offers,
  marketStatus,
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

const USERS_KEY = 'virtual_zone_users';
const CURRENT_USER_KEY = 'virtual_zone_current_user';

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
  
  updateClubs: (newClubs: Club[]) => void;
  updatePlayers: (newPlayers: Player[]) => void;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  addTransfer: (transfer: Transfer) => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  addClub: (club: Club) => void;
  updateClub: (club: Club) => void;
  deleteClub: (clubId: string) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
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
  users: getUsers(),
  
  updateClubs: (newClubs) => set({ clubs: newClubs }),
  
  updatePlayers: (newPlayers) => set({ players: newPlayers }),
  
  updateTournaments: (newTournaments) => set({ tournaments: newTournaments }),
  
  updateTransfers: (newTransfers) => set({ transfers: newTransfers }),
  
  updateOffers: (newOffers) => set({ offers: newOffers }),
  
  updateMarketStatus: (status) => set({ marketStatus: status }),
  
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
  })),

  updateUser: (user) => set((state) => {
    const users = state.users.map(u => (u.id === user.id ? user : u));
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const currentJson = localStorage.getItem(CURRENT_USER_KEY);
    if (currentJson) {
      const current = JSON.parse(currentJson) as User;
      if (current.id === user.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    }

    return { users };
  }),

  deleteUser: (userId) => set((state) => {
    const users = state.users.filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const currentJson = localStorage.getItem(CURRENT_USER_KEY);
    if (currentJson) {
      const current = JSON.parse(currentJson) as User;
      if (current.id === userId) {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    }

    return { users };
  }),

  updateClub: (club) => set((state) => ({
    clubs: state.clubs.map(c => (c.id === club.id ? club : c))
  })),

  deleteClub: (clubId) => set((state) => ({
    clubs: state.clubs.filter(c => c.id !== clubId)
  })),

  updatePlayer: (player) => set((state) => ({
    players: state.players.map(p => (p.id === player.id ? player : p))
  })),

  deletePlayer: (playerId) => set((state) => ({
    players: state.players.filter(p => p.id !== playerId)
  }))
}));
 