import  { create } from 'zustand';
import { User, Club, Player, Tournament, NewsItem, Transfer, Standing, ActivityLog, Comment } from '../types';

interface GlobalStore {
  users: User[];
  clubs: Club[];
  players: Player[];
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

export  const useGlobalStore = create<GlobalStore>((set) => ({
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
      createdAt: '2023-06-15T00:00:00.000Z'
    }
  ],
  clubs: [
    {
      id: '1',
      name: 'Barcelona FC',
      manager: 'Xavi Hernández',
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
  tournaments: [],
  newsItems: [
    {
      id: '1',
      title: 'Inicio de la nueva temporada',
      content: 'La Liga Virtual arranca con grandes expectativas para todos los equipos participantes.',
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
  ],
  loading: false, 

  setLoading: (loading) => set({ loading }),

  addUser: (user) => set((state) => ({ 
    users: [...state.users, user],
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'User Created',
      details: `Created user: ${user.username}`,
      date: new Date().toISOString()
    }]
  })),

  updateUser: (user) => set((state) => ({ 
    users: state.users.map(u => u.id === user.id ? user : u),
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'User Updated',
      details: `Updated user: ${user.username}`,
      date: new Date().toISOString()
    }]
  })),

  removeUser: (id) => set((state) => ({ 
    users: state.users.filter(u => u.id !== id),
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'User Deleted',
      details: `Deleted user with ID: ${id}`,
      date: new Date().toISOString()
    }]
  })),

  addClub: (club) => set((state) => ({ 
    clubs: [...state.clubs, club],
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'Club Created',
      details: `Created club: ${club.name}`,
      date: new Date().toISOString()
    }]
  })),

  updateClub: (club) => set((state) => ({ 
    clubs: state.clubs.map(c => c.id === club.id ? club : c)
  })),

  removeClub: (id) => set((state) => ({ 
    clubs: state.clubs.filter(c => c.id !== id)
  })),

  addPlayer: (player) => set((state) => ({ 
    players: [...state.players, player]
  })),

  updatePlayer: (player) => set((state) => ({ 
    players: state.players.map(p => p.id === player.id ? player : p)
  })),

  removePlayer: (id) => set((state) => ({ 
    players: state.players.filter(p => p.id !== id)
  })),

  approveTransfer: (id) => set((state) => ({ 
    transfers: state.transfers.map(t => 
      t.id === id ? { ...t, status: 'approved' as const } : t
    ),
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'Transfer Approved',
      details: `Approved transfer with ID: ${id}`,
      date: new Date().toISOString()
    }]
  })),

  rejectTransfer: (id, reason) => set((state) => ({ 
    transfers: state.transfers.map(t => 
      t.id === id ? { ...t, status: 'rejected' as const } : t
    ),
    activities: [...state.activities, {
      id: Date.now().toString(),
      userId: 'admin',
      action: 'Transfer Rejected',
      details: `Rejected transfer: ${reason}`,
      date: new Date().toISOString()
    }]
  })),

  addNewsItem: (item) => set((state) => ({ 
    newsItems: [...state.newsItems, item]
  })),

  updateNewsItem: (item) => set((state) => ({ 
    newsItems: state.newsItems.map(n => n.id === item.id ? item : n)
  })),

  removeNewsItem: (id) => set((state) => ({ 
    newsItems: state.newsItems.filter(n => n.id !== id)
  })),

  approveComment: (id) => set((state) => ({ 
    comments: state.comments.map(c => 
      c.id === id ? { ...c, status: 'approved' as const } : c
    )
  })),

  hideComment: (id) => set((state) => ({ 
    comments: state.comments.map(c => 
      c.id === id ? { ...c, status: 'hidden' as const } : c
    )
  })),

  deleteComment: (id) => set((state) => ({ 
    comments: state.comments.filter(c => c.id !== id)
  })),

  addActivity: (activity) => set((state) => ({ 
    activities: [...state.activities, activity]
  }))
}));
 