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
  offers,
  marketStatus,
  leagueStandings,
  newsItems,
  mediaItems,
  faqs,
  storeItems,
  posts,
  dtClub,
  dtMarket,
  dtObjectives,
  dtTasks,
  dtEvents,
  dtNews,
  dtPositions
} from '../data/mockData';
import { useQuery, useMutation } from '@tanstack/react-query';
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
  DtEvent,
  DtRanking,
  ChatMsg
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
  dtRankings: DtRanking[];
  chat: ChatMsg[];

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
  toggleTask: (id: string) => void;
  updateFixtures: (newFixtures: DtFixture[]) => void;
  updateDtRankings: (r: DtRanking[]) => void;
  setChat: (c: ChatMsg[]) => void;
  addChatMessage: (msg: ChatMsg) => void;
}

export const useDataStore = create<DataState>((set) => ({
  clubs: [],
  players: [],
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
  fixtures: [],
  market: dtMarket,
  objectives: dtObjectives,
  tasks: dtTasks,
  events: dtEvents,
  news: dtNews,
  positions: dtPositions,
  dtRankings: [],
  chat: [],
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

  updateStandings: (newStandings) => set({ standings: newStandings }),

  updateFixtures: (newFixtures) => set({ fixtures: newFixtures }),

  updateDtRankings: (r) => set({ dtRankings: r }),

  setChat: (c) => set({ chat: c }),

  addChatMessage: (msg) =>
    set((state) => ({ chat: [...state.chat, msg] })),

  toggleTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      )
    }))
}));

// ---- React Query hooks ----
const fetchWithCache = async <T>(key: string, url: string): Promise<T[]> => {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('fetch failed');
    const data = (await res.json()) as T[];
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  } catch {
    const cached = localStorage.getItem(key);
    return cached ? (JSON.parse(cached) as T[]) : [];
  }
};

export const useClubsQuery = () => {
  const setClubs = useDataStore((s) => s.updateClubs);
  return useQuery(['clubs'], () => fetchWithCache<Club>('clubs', '/clubs'), {
    onSuccess: setClubs
  });
};

export const usePlayersQuery = () => {
  const setPlayers = useDataStore((s) => s.updatePlayers);
  return useQuery(['players'], () => fetchWithCache<Player>('players', '/players'), {
    onSuccess: setPlayers
  });
};

export const useFixturesQuery = () => {
  const setFixtures = useDataStore((s) => s.updateFixtures);
  return useQuery(
    ['fixtures'],
    () => fetchWithCache<DtFixture>('fixtures', '/fixtures'),
    { onSuccess: setFixtures }
  );
};

export const useRankingsQuery = () => {
  const setRankings = useDataStore((s) => s.updateDtRankings);
  return useQuery(
    ["rankings"],
    () => fetchWithCache<DtRanking>("rankings", "/rankings"),
    { onSuccess: setRankings }
  );
};

export const useChatQuery = () => {
  const setChat = useDataStore((s) => s.setChat);
  return useQuery(['chat'], () => fetchWithCache<ChatMsg>('chat', '/chat'), {
    onSuccess: setChat,
  });
};

export const useSendChatMutation = () => {
  const addMsg = useDataStore((s) => s.addChatMessage);
  return useMutation({
    mutationFn: async (payload: Omit<ChatMsg, 'id' | 'ts'>) => {
      try {
        const res = await fetch('/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('post failed');
        const msg = (await res.json()) as ChatMsg;
        const cached = localStorage.getItem('chat');
        const hist = cached ? (JSON.parse(cached) as ChatMsg[]) : [];
        localStorage.setItem('chat', JSON.stringify([...hist, msg]));
        return msg;
      } catch {
        const msg: ChatMsg = {
          id: crypto.randomUUID(),
          ...payload,
          ts: Date.now(),
        };
        const cached = localStorage.getItem('chat');
        const hist = cached ? (JSON.parse(cached) as ChatMsg[]) : [];
        localStorage.setItem('chat', JSON.stringify([...hist, msg]));
        return msg;
      }
    },
    onSuccess: addMsg,
  });
};
