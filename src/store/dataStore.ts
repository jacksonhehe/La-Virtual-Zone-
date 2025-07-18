import { create } from 'zustand';
import { useActivityLogStore } from './activityLogStore';
import { useAuthStore } from './authStore';
import {
  getUsers,
  updateUser as persistUser,
  deleteUser as persistDeleteUser
} from '../utils/authService';
import {
  tournaments,
  transfers,
  marketStatus,
  leagueStandings,
  newsItems,
  mediaItems,
  faqs,
  storeItems,
  posts,
  dtMarket,
  dtObjectives,
  dtTasks,
  dtEvents,
  dtNews,
  dtPositions,
  dtRankings
} from '../data/mockData';
import { getClubs, saveClubs } from '../utils/clubService';
import { getPlayers, savePlayers } from '../utils/playerService';
import { getOffers, saveOffers } from '../utils/offerService';
import { getTournaments, getNews, getPosts, saveTournaments } from '../utils/sharedStorage';
import {
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
  DtEvent,
  DtRanking
} from '../types';
import { Club, Player, User } from '../types/shared';

const initialClubs = getClubs();
const initialPlayers = getPlayers();
const initialOffers = getOffers();
const initialUser = useAuthStore.getState().user;
const baseClub = initialClubs.find(c => c.id === initialUser?.clubId) || initialClubs[0];
const initialClub: DtClub = {
  id: baseClub.id,
  name: baseClub.name,
  slug: baseClub.slug,
  logo: baseClub.logo,
  formation: '4-3-3',
  budget: baseClub.budget,
  players: initialPlayers.filter(p => p.clubId === baseClub.id)
};
const initialFixtures = tournaments[0].matches
  .filter(m => m.homeTeam === initialClub.name || m.awayTeam === initialClub.name)
  .slice(0, 6)
  .map(m => ({ ...m, played: m.status === 'finished' }));

const initialTournaments = getTournaments();
const initialNews = getNews();
const initialPosts = getPosts();

const refreshClubPlayers = (players: Player[], clubId: string) =>
  players.filter(p => p.clubId === clubId);

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
  dtRankings: DtRanking[];
  
  updateClubs: (newClubs: Club[]) => void;
  updatePlayers: (newPlayers: Player[]) => void;
  updateTournaments: (newTournaments: Tournament[]) => void;
  updateTransfers: (newTransfers: Transfer[]) => void;
  updateOffers: (newOffers: TransferOffer[]) => void;
  updateMarketStatus: (status: boolean) => void;
  addOffer: (offer: TransferOffer) => void;
  updateOfferStatus: (offerId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  updateOfferAmount: (offerId: string, amount: number) => void;
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
  toggleTask: (id: string) => void;
  setClubFromUser: (user: User | null) => void;
}

export const useDataStore = create<DataState>((set) => ({
  clubs: initialClubs,
  players: initialPlayers,
  tournaments: initialTournaments,
  newsItems: initialNews,
  posts: initialPosts,
  transfers,
  offers: initialOffers,
  standings: leagueStandings,
  mediaItems,
  faqs,
  storeItems,
  marketStatus,
  club: initialClub,
  fixtures: initialFixtures,
  market: dtMarket,
  objectives: dtObjectives,
  tasks: dtTasks,
  events: dtEvents,
  news: dtNews,
  positions: dtPositions,
  dtRankings,
  users: getUsers(),
  
  updateClubs: (newClubs) =>
    set((state) => {
      saveClubs(newClubs);
      const current = useAuthStore.getState().user;
      let club = state.club;
      if (current?.clubId) {
        const updated = newClubs.find(c => c.id === current.clubId);
        if (updated) {
          club = { ...club, budget: updated.budget };
        }
      }
      return { clubs: newClubs, club };
    }),
  
  updatePlayers: (newPlayers) => {
    savePlayers(newPlayers);
    set(state => ({
      players: newPlayers,
      club: {
        ...state.club,
        players: refreshClubPlayers(newPlayers, state.club.id)
      }
    }));
  },
  
  updateTournaments: (newTournaments) => {
    saveTournaments(newTournaments);
    set({ tournaments: newTournaments });
  },
  
  updateTransfers: (newTransfers) => set({ transfers: newTransfers }),
  
  updateOffers: (newOffers) => {
    saveOffers(newOffers);
    set({ offers: newOffers });
  },
  
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
  
  addOffer: (offer) =>
    set((state) => {
      const updated = [...state.offers, offer];
      saveOffers(updated);
      return { offers: updated };
    }),
  
  updateOfferStatus: (offerId, status) =>
    set((state) => {
      const updated = state.offers.map((offer) =>
        offer.id === offerId
          ? { ...offer, status, responseDate: new Date().toISOString() }
          : offer
      );
      saveOffers(updated);
      return { offers: updated };
    }),

  updateOfferAmount: (offerId, amount) =>
    set((state) => {
      const updated = state.offers.map((offer) =>
        offer.id === offerId ? { ...offer, amount } : offer
      );
      saveOffers(updated);
      return { offers: updated };
    }),

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

  addClub: (club) =>
    set((state) => {
      const updated = [...state.clubs, club];
      saveClubs(updated);
      return { clubs: updated };
    }),

  addPlayer: (player) =>
    set((state) => {
      const players = [...state.players, player];
      savePlayers(players);
      return {
        players,
        club: {
          ...state.club,
          players: refreshClubPlayers(players, state.club.id)
        }
      };
    }),

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

  updateClubEntry: (club) =>
    set((state) => {
      const updated = state.clubs.map(c => (c.id === club.id ? club : c));
      saveClubs(updated);
      return { clubs: updated };
    }),

  removeClub: (id) =>
    set((state) => {
      const updated = state.clubs.filter(c => c.id !== id);
      saveClubs(updated);
      return { clubs: updated };
    }),

  updatePlayerEntry: (player) =>
    set((state) => {
      const players = state.players.map(p => (p.id === player.id ? player : p));
      savePlayers(players);
      return {
        players,
        club: {
          ...state.club,
          players: refreshClubPlayers(players, state.club.id)
        }
      };
    }),

  removePlayer: (id) =>
    set((state) => {
      const players = state.players.filter(p => p.id !== id);
      savePlayers(players);
      return {
        players,
        club: {
          ...state.club,
          players: refreshClubPlayers(players, state.club.id)
        }
      };
    }),

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

  setClubFromUser: (user) =>
    set((state) => {
      if (!user?.clubId) return state;
      const baseClub = state.clubs.find(c => c.id === user.clubId);
      if (!baseClub) return state;
      const club: DtClub = {
        id: baseClub.id,
        name: baseClub.name,
        slug: baseClub.slug,
        logo: baseClub.logo,
        formation: '4-3-3',
        budget: baseClub.budget,
        players: refreshClubPlayers(state.players, baseClub.id)
      };
      const fixtures = state.tournaments[0].matches
        .filter(
          m => m.homeTeam === baseClub.name || m.awayTeam === baseClub.name
        )
        .slice(0, 6)
        .map(m => ({ ...m, played: m.status === 'finished' }));
      return { club, fixtures };
    }),

  updateStandings: (newStandings) => set({ standings: newStandings }),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    }))
}));

// Update DT club when authenticated user changes
useAuthStore.subscribe(state => {
  useDataStore.getState().setClubFromUser(state.user);
});
 
