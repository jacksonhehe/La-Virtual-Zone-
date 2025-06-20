import { create } from 'zustand';
import { useActivityLogStore } from './activityLogStore';
import { useAuthStore } from './authStore';
import {
  getUsers,
  updateUser as persistUser,
  deleteUser as persistDeleteUser
} from '../utils/authService';
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
  storeItems,
  posts,
  dtClub,
  dtFixtures,
  dtMarket,
  dtObjectives,
  dtTasks,
  dtEvents,
  dtNews,
  dtPositions
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
  StoreItem,
  Post,
  DtClub,
  DtFixture,
  DtMarket,
  DtObjectives,
  DtTask,
  DtEvent
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
  posts: Post[];
  marketStatus: boolean;
  // DT dashboard fields
  club: DtClub;
  fixtures: DtFixture[];
  market: DtMarket;
  objectives: DtObjectives;
  tasks: DtTask[];
  events: DtEvent[];
  news: NewsItem[];
  positions: Standing[];
  
  updateClubs: (newClubs: Club[]) => void;
  updatePlayers: (newPlayers: Player[]) => void;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  addTransfer: (transfer: Transfer) => void;
  removeTransfer: (id: string) => void;
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
  posts,
  marketStatus,
  club: dtClub,
  fixtures: dtFixtures,
  market: dtMarket,
  objectives: dtObjectives,
  tasks: dtTasks,
  events: dtEvents,
  news: dtNews,
  positions: dtPositions,
  users: getUsers(),
  
  updateClubs: (newClubs) => set({ clubs: newClubs }),
  
  updatePlayers: (newPlayers) => set({ players: newPlayers }),
  
  updateTournaments: (newTournaments) => set({ tournaments: newTournaments }),
  
  updateTransfers: (newTransfers) => set({ transfers: newTransfers }),
  
  updateOffers: (newOffers) => set({ offers: newOffers }),
  
  updateMarketStatus: (status) =>
    set(() => {
      const current = useAuthStore.getState().user?.id || 'system';
      useActivityLogStore
        .getState()
        .addLog(
          'market_status_change',
          current,
          status ? 'Mercado abierto' : 'Mercado cerrado'
        );
      return { marketStatus: status };
    }),
  
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

  removeTransfer: (id) =>
    set((state) => ({
      transfers: state.transfers.filter(t => t.id !== id)
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

  updateUserEntry: (user) =>
    set((state) => {
      const prev = state.users.find(u => u.id === user.id);
      persistUser(user);
      const current = useAuthStore.getState().user?.id || 'system';
      if (prev && prev.role !== user.role) {
        useActivityLogStore
          .getState()
          .addLog(
            'role_change',
            current,
            `Rol de ${prev.username} cambiado a ${user.role}`
          );
      }
      if (prev && prev.status !== user.status) {
        useActivityLogStore
          .getState()
          .addLog(
            'status_change',
            current,
            `Estado de ${prev.username} cambiado a ${user.status}`
          );
      }
      return {
        users: state.users.map(u => (u.id === user.id ? user : u))
      };
    }),

  removeUser: (id) =>
    set((state) => {
      persistDeleteUser(id);
      return {
        users: state.users.filter(u => u.id !== id)
      };
    }),

  updateClubEntry: (club) => set((state) => ({
    clubs: state.clubs.map(c => (c.id === club.id ? club : c))
  })),

  removeClub: (id) => set((state) => ({
    clubs: state.clubs.filter(c => c.id !== id)
  })),

  updatePlayerEntry: (player) => set((state) => ({
    players: state.players.map(p => (p.id === player.id ? player : p))
  })),

  removePlayer: (id) => set((state) => ({
    players: state.players.filter(p => p.id !== id)
  })),

  addTournament: (tournament) =>
    set((state) => {
      const current = useAuthStore.getState().user?.id || 'system';
      useActivityLogStore
        .getState()
        .addLog('tournament_create', current, `Torneo ${tournament.name}`);
      return { tournaments: [...state.tournaments, tournament] };
    }),

  addNewsItem: (item) => set((state) => ({
    newsItems: [item, ...state.newsItems]
  })),

  removeNewsItem: (id) => set((state) => ({
    newsItems: state.newsItems.filter(n => n.id !== id)
  })),

  updateStandings: (newStandings) => set({ standings: newStandings })
}));
 
