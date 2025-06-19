import { create } from 'zustand';
import { getUsers, updateUser as persistUser } from '../utils/authService';
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
import { useActivityLogStore } from './activityLogStore';
import { useAuthStore } from './authStore';

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
  addClub: (club: Club) => void;
  addPlayer: (player: Player) => void;
  updateUserEntry: (user: User) => void;
  removeUser: (id: string) => void;
  updateClubEntry: (club: Club) => void;
  removeClub: (id: string) => void;
  updatePlayerEntry: (player: Player) => void;
  removePlayer: (id: string) => void;
  addTournament: (tournament: Tournament) => void;
  addNewsItem: (item: NewsItem) => void;
  removeNewsItem: (id: string) => void;
  updateStandings: (newStandings: Standing[]) => void;
}

export const useDataStore = create<DataState>((set) => {
  const addLog = useActivityLogStore.getState().addLog;
  const currentUserId = () => useAuthStore.getState().user?.id || 'system';
  return {
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
  
  updateMarketStatus: (status) => {
    set({ marketStatus: status });
    addLog({
      action: 'update_market',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Market set to ${status}`
    });
  },
  
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

  addUser: (user) => {
    set((state) => ({
      users: [...state.users, user]
    }));
    addLog({
      action: 'add_user',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Created user ${user.username}`
    });
  },

  addClub: (club) => {
    set((state) => ({
      clubs: [...state.clubs, club]
    }));
    addLog({
      action: 'add_club',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Created club ${club.name}`
    });
  },

  addPlayer: (player) => {
    set((state) => ({
      players: [...state.players, player]
    }));
    addLog({
      action: 'add_player',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Created player ${player.name}`
    });
  },

  updateUserEntry: (user) => {
    set((state) => {
      persistUser(user);
      return {
        users: state.users.map(u => (u.id === user.id ? user : u))
      };
    });
    addLog({
      action: 'update_user',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Updated user ${user.username}`
    });
  },

  removeUser: (id) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== id)
    }));
    addLog({
      action: 'delete_user',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Removed user ${id}`
    });
  },

  updateClubEntry: (club) => {
    set((state) => ({
      clubs: state.clubs.map(c => (c.id === club.id ? club : c))
    }));
    addLog({
      action: 'update_club',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Updated club ${club.name}`
    });
  },

  removeClub: (id) => {
    set((state) => ({
      clubs: state.clubs.filter(c => c.id !== id)
    }));
    addLog({
      action: 'delete_club',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Removed club ${id}`
    });
  },

  updatePlayerEntry: (player) => {
    set((state) => ({
      players: state.players.map(p => (p.id === player.id ? player : p))
    }));
    addLog({
      action: 'update_player',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Updated player ${player.name}`
    });
  },

  removePlayer: (id) => {
    set((state) => ({
      players: state.players.filter(p => p.id !== id)
    }));
    addLog({
      action: 'delete_player',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Removed player ${id}`
    });
  },

  addTournament: (tournament) => {
    set((state) => ({
      tournaments: [...state.tournaments, tournament]
    }));
    addLog({
      action: 'add_tournament',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Created tournament ${tournament.name}`
    });
  },

  addNewsItem: (item) => {
    set((state) => ({
      newsItems: [item, ...state.newsItems]
    }));
    addLog({
      action: 'add_news',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Added news ${item.title}`
    });
  },

  removeNewsItem: (id) => {
    set((state) => ({
      newsItems: state.newsItems.filter(n => n.id !== id)
    }));
    addLog({
      action: 'delete_news',
      userId: currentUserId(),
      date: new Date().toISOString(),
      details: `Removed news ${id}`
    });
  },

  updateStandings: (newStandings) => set({ standings: newStandings })
  };
});
 