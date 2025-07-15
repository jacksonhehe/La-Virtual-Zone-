import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Tournament,
  Fixture,
  Match,
  NewsItem,
  Transfer,
  Standing,
  ActivityLog,
  Comment,
} from '../types';
import { User, Club, Player } from '../types/shared';
import { getState, setState } from '../utils/adminStorage';
import type { AdminData } from '../utils/adminStorage';
import { supabase } from '../../lib/supabaseClient';
import { useDataStore } from '../../store/dataStore';

interface GlobalStore {
  users: User[];
  clubs: Club[];
  players: Player[];
  matches: Fixture[];
  tournaments: Tournament[];
  newsItems: NewsItem[];
  transfers: Transfer[];
  standings: Standing[];
  activities: ActivityLog[];
  comments: Comment[];
  loading: boolean;
  
  setLoading: (loading: boolean) => void;
  
  // Users
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  removeUser: (id: string) => void;
  
  // Clubs
  addClub: (club: Club) => void;
  updateClub: (club: Club) => void;
  removeClub: (id: string) => void;
  
  // Players
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  removePlayer: (id: string) => void;

  // Matches
  addMatch: (match: Fixture) => void;
  updateMatch: (match: Fixture) => void;
  removeMatch: (id: string) => void;

  // Tournaments
  updateTournamentStatus: (id: string, status: Tournament['status']) => void;
  
  // Transfers
  approveTransfer: (id: string) => void;
  rejectTransfer: (id: string, reason: string) => void;
  
  // News
  addNewsItem: (item: NewsItem) => void;
  updateNewsItem: (item: NewsItem) => void;
  removeNewsItem: (id: string) => void;
  
  // Comments
  approveComment: (id: string) => void;
  hideComment: (id: string) => void;
  deleteComment: (id: string) => void;
  
  // Activities
  addActivity: (activity: ActivityLog) => void;
}

const defaultData: AdminData = {
  users: [
    {
      id: '1',
      username: 'admin',
      email: 'admin@virtualzone.com',
      role: 'admin',
      status: 'active',
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      username: 'manager1',
      email: 'manager@club1.com',
      role: 'dt',
      status: 'active',
      createdAt: '2023-06-15T00:00:00.000Z',
      clubId: '1'
    }
  ],
  clubs: [
    {
      id: '1',
      name: 'Barcelona FC',
      manager: 'Xavi Hernández',
      managerId: '2',
      budget: 50000000,
      createdAt: '2023-01-01T00:00:00.000Z'
    },
    {
      id: '2',
      name: 'Real Madrid',
      manager: 'Carlo Ancelotti',
      budget: 60000000,
      createdAt: '2023-01-01T00:00:00.000Z'
    }
  ],
  players: [
    {
      id: '1',
      name: 'Lionel Messi',
      position: 'DEL',
      clubId: '1',
      overall: 93,
      price: 25000000
    },
    {
      id: '2',
      name: 'Karim Benzema',
      position: 'DEL',
      clubId: '2',
      overall: 91,
      price: 20000000
    }
  ],
  matches: [
    {
      id: 'match1',
      tournamentId: 'tournament1',
      round: 15,
      date: '2023-12-15T20:00:00Z',
      homeTeam: 'Barcelona',
      awayTeam: 'Real Madrid',
      status: 'scheduled'
    },
    {
      id: 'match2',
      tournamentId: 'tournament1',
      round: 15,
      date: '2023-12-16T18:30:00Z',
      homeTeam: 'Liverpool',
      awayTeam: 'Manchester City',
      status: 'scheduled'
    },
    {
      id: 'match3',
      tournamentId: 'tournament1',
      round: 15,
      date: '2023-12-17T15:30:00Z',
      homeTeam: 'Bayern Munich',
      awayTeam: 'Dortmund',
      status: 'scheduled'
    },
    {
      id: 'match4',
      tournamentId: 'tournament1',
      round: 15,
      date: '2023-12-17T21:00:00Z',
      homeTeam: 'PSG',
      awayTeam: 'Marseille',
      status: 'scheduled'
    }
  ],
  tournaments: [],
  newsItems: [
    {
      id: '1',
      title: 'Inicio de la nueva temporada',
      content:
        'La Liga Virtual arranca con grandes expectativas para todos los equipos participantes.',
      author: 'Admin',
      publishedAt: '2023-12-01T00:00:00.000Z',
      status: 'published'
    }
  ],
  transfers: [
    {
      id: '1',
      playerId: '1',
      fromClubId: '2',
      toClubId: '1',
      amount: 15000000,
      status: 'pending',
      createdAt: '2023-12-10T00:00:00.000Z'
    }
  ],
  standings: [],
  activities: [
    {
      id: '1',
      userId: 'admin',
      action: 'System Started',
      details: 'Panel de administración iniciado',
      date: '2023-12-01T00:00:00.000Z'
    }
  ],
  comments: [
    {
      id: '1',
      userId: 'user123',
      content: '¡Excelente partido! Muy emocionante hasta el final.',
      status: 'pending',
      createdAt: '2023-12-10T00:00:00.000Z'
    },
    {
      id: '2',
      userId: 'user456',
      content: 'El árbitro estuvo muy mal, claramente favoreció al equipo local.',
      status: 'pending',
      createdAt: '2023-12-09T00:00:00.000Z'
    }
  ]
};

export const useGlobalStore = create<GlobalStore>()(
  subscribeWithSelector<GlobalStore>((set, get) => {
  const initial = defaultData;
  supabase.auth.getUser().then(({ data: { user } }) => {
    getState('admin_data', user?.id ?? '').then(data => {
      if (data) set(data as GlobalStore);
    });
  });

  const persist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setState('admin_data', {
      users: get().users,
      clubs: get().clubs,
      players: get().players,
      matches: get().matches,
      tournaments: get().tournaments,
      newsItems: get().newsItems,
      transfers: get().transfers,
      standings: get().standings,
      activities: get().activities,
      comments: get().comments,
    }, user.id).catch(() => {});
  };

  return {
    ...initial,
    loading: false,

    setLoading: loading => set({ loading }),

    addUser: user => {
      set(state => ({
        users: [...state.users, user],
        activities: [
          ...state.activities,
          {
            id: Date.now().toString(),
            userId: 'admin',
            action: 'User Created',
            details: `Created user: ${user.username}`,
            date: new Date().toISOString()
          }
        ]
      }));
      persist();
    },

    updateUser: user => {
      set(state => ({
        users: state.users.map(u => (u.id === user.id ? user : u)),
        activities: [
          ...state.activities,
          {
            id: Date.now().toString(),
            userId: 'admin',
            action: 'User Updated',
            details: `Updated user: ${user.username}`,
            date: new Date().toISOString()
          }
        ]
      }));
      persist();
    },

    removeUser: id => {
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        activities: [
          ...state.activities,
          {
            id: Date.now().toString(),
            userId: 'admin',
            action: 'User Deleted',
            details: `Deleted user with ID: ${id}`,
            date: new Date().toISOString()
          }
        ]
      }));
      persist();
    },

    addClub: club => {
      set(state => {
        const updatedUsers = state.users.map(u =>
          u.id === club.managerId ? { ...u, clubId: club.id } : u
        );
        const updatedClubs = [...state.clubs, club];
        return {
          users: updatedUsers,
          clubs: updatedClubs,
          activities: [
            ...state.activities,
            {
              id: Date.now().toString(),
              userId: 'admin',
              action: 'Club Created',
              details: `Created club: ${club.name}`,
              date: new Date().toISOString()
            }
          ]
        };
      });
      persist();
    },

    updateClub: club => {
      set(state => {
        const prev = state.clubs.find(c => c.id === club.id);
        let updatedUsers = state.users;
        if (prev?.managerId && prev.managerId !== club.managerId) {
          updatedUsers = updatedUsers.map(u =>
            u.id === prev.managerId ? { ...u, clubId: undefined } : u
          );
        }
        if (club.managerId) {
          updatedUsers = updatedUsers.map(u =>
            u.id === club.managerId ? { ...u, clubId: club.id } : u
          );
        }
        const updatedClubs = state.clubs.map(c => (c.id === club.id ? club : c));
        return {
          users: updatedUsers,
          clubs: updatedClubs
        };
      });
      persist();
    },

    removeClub: id => {
      set(state => {
        const club = state.clubs.find(c => c.id === id);
        const updatedUsers = club?.managerId
          ? state.users.map(u =>
              u.id === club.managerId ? { ...u, clubId: undefined } : u
            )
          : state.users;
        const updatedClubs = state.clubs.filter(c => c.id !== id);
        return { users: updatedUsers, clubs: updatedClubs };
      });
      persist();
    },

    addPlayer: player => {
      set(state => {
        const updated = [...state.players, player];
        return { players: updated };
      });
      useDataStore.getState().addPlayer(player);
      persist();
    },

    updatePlayer: player => {
      set(state => {
        const updated = state.players.map(p => (p.id === player.id ? player : p));
        return { players: updated };
      });
      useDataStore.getState().updatePlayerEntry(player);
      persist();
    },

    removePlayer: id => {
      set(state => {
        const updated = state.players.filter(p => p.id !== id);
        return { players: updated };
      });
      useDataStore.getState().removePlayer(id);
      persist();
    },

    addMatch: match => {
      set(state => ({ matches: [...state.matches, match] }));
      persist();
    },

    updateMatch: match => {
      set(state => ({ matches: state.matches.map(m => (m.id === match.id ? match : m)) }));
      persist();
    },

    removeMatch: id => {
      set(state => ({ matches: state.matches.filter(m => m.id !== id) }));
      persist();
    },

    updateTournamentStatus: (id, status) => {
      set(state => ({
        tournaments: state.tournaments.map(t =>
          t.id === id ? { ...t, status } : t
        )
      }));
      persist();
    },

    approveTransfer: id => {
      set(state => ({
        transfers: state.transfers.map(t => (t.id === id ? { ...t, status: 'approved' as const } : t)),
        activities: [
          ...state.activities,
          {
            id: Date.now().toString(),
            userId: 'admin',
            action: 'Transfer Approved',
            details: `Approved transfer with ID: ${id}`,
            date: new Date().toISOString()
          }
        ]
      }));
      persist();
    },

    rejectTransfer: (id, reason) => {
      set(state => ({
        transfers: state.transfers.map(t => (t.id === id ? { ...t, status: 'rejected' as const } : t)),
        activities: [
          ...state.activities,
          {
            id: Date.now().toString(),
            userId: 'admin',
            action: 'Transfer Rejected',
            details: `Rejected transfer: ${reason}`,
            date: new Date().toISOString()
          }
        ]
      }));
      persist();
    },

    addNewsItem: item => {
      set(state => ({ newsItems: [...state.newsItems, item] }));
      persist();
    },

    updateNewsItem: item => {
      set(state => ({ newsItems: state.newsItems.map(n => (n.id === item.id ? item : n)) }));
      persist();
    },

    removeNewsItem: id => {
      set(state => ({ newsItems: state.newsItems.filter(n => n.id !== id) }));
      persist();
    },

    approveComment: id => {
      set(state => ({
        comments: state.comments.map(c => (c.id === id ? { ...c, status: 'approved' as const } : c))
      }));
      persist();
    },

    hideComment: id => {
      set(state => ({
        comments: state.comments.map(c => (c.id === id ? { ...c, status: 'hidden' as const } : c))
      }));
      persist();
    },

    deleteComment: id => {
      set(state => ({ comments: state.comments.filter(c => c.id !== id) }));
      persist();
    },

    addActivity: activity => {
      set(state => ({ activities: [...state.activities, activity] }));
      persist();
    }
  };
}));

export const subscribe = useGlobalStore.subscribe;
