import  { create } from 'zustand';
import { Tournament, NewsItem, Transfer, Standing } from '../types';
import { User, Club, Player } from '../types/shared';

interface DataStore {
  users: User[];
  clubs: Club[];
  players: Player[];
  tournaments: Tournament[];
  newsItems: NewsItem[];
  transfers: Transfer[];
  standings: Standing[];
  marketStatus: boolean;

  addUser: (user: User) => void;
  updateUserEntry: (user: User) => void;
  removeUser: (id: string) => void;
  
  addClub: (club: Club) => void;
  updateClubEntry: (club: Club) => void;
  removeClub: (id: string) => void;
  
  addPlayer: (player: Player) => void;
  updatePlayerEntry: (player: Player) => void;
  removePlayer: (id: string) => void;
  
  addTournament: (tournament: Tournament) => void;
  updateTournaments: (tournaments: Tournament[]) => void;
  
  addNewsItem: (item: NewsItem) => void;
  removeNewsItem: (id: string) => void;
  
  removeTransfer: (id: string) => void;
  updateMarketStatus: (status: boolean) => void;
  
  updateStandings: (standings: Standing[]) => void;
}

export const useDataStore = create<DataStore>((set) => ({
  users: [],
  clubs: [],
  players: [],
  tournaments: [],
  newsItems: [],
  transfers: [],
  standings: [],
  marketStatus: false,

  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUserEntry: (user) => set((state) => ({ 
    users: state.users.map(u => u.id === user.id ? user : u) 
  })),
  removeUser: (id) => set((state) => ({ 
    users: state.users.filter(u => u.id !== id) 
  })),

  addClub: (club) => set((state) => ({ clubs: [...state.clubs, club] })),
  updateClubEntry: (club) => set((state) => ({ 
    clubs: state.clubs.map(c => c.id === club.id ? club : c) 
  })),
  removeClub: (id) => set((state) => ({ 
    clubs: state.clubs.filter(c => c.id !== id) 
  })),

  addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
  updatePlayerEntry: (player) => set((state) => ({ 
    players: state.players.map(p => p.id === player.id ? player : p) 
  })),
  removePlayer: (id) => set((state) => ({ 
    players: state.players.filter(p => p.id !== id) 
  })),

  addTournament: (tournament) => set((state) => ({ 
    tournaments: [...state.tournaments, tournament] 
  })),
  updateTournaments: (tournaments) => set({ tournaments }),

  addNewsItem: (item) => set((state) => ({ 
    newsItems: [...state.newsItems, item] 
  })),
  removeNewsItem: (id) => set((state) => ({ 
    newsItems: state.newsItems.filter(n => n.id !== id) 
  })),

  removeTransfer: (id) => set((state) => ({ 
    transfers: state.transfers.filter(t => t.id !== id) 
  })),
  updateMarketStatus: (status) => set({ marketStatus: status }),

  updateStandings: (standings) => set({ standings }),
}));
 