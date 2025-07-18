import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  Fixture,
  NewsItem,
  Transfer,
  Standing,
  ActivityLog,
  Comment,
} from '../types';
import { Tournament } from '../../types';
import { User, Club, Player } from '../../types/shared';
import {
  loadAdminData,
  saveAdminData,
  AdminData
} from '../utils/adminStorage';
import { getClubs, saveClubs } from '../../utils/clubService';
import { getPlayers, savePlayers } from '../../utils/playerService';
import { getUsers, saveUsers } from '../../utils/authService';
import { useDataStore } from '../../store/dataStore';
import {
  getTournaments, saveTournaments,
  getNews, saveNews,
  getTransfers, saveTransfers,
  getStandings, saveStandings,
  getActivities, saveActivities,
  getComments, saveComments,
  getOffers, saveOffers,
  getFaqs, saveFaqs,
  getPosts, savePosts,
  getMarketStatus, saveMarketStatus,
  getMediaItems, saveMediaItems,
  getStoreItems, saveStoreItems,
  getPositions, savePositions,
  getDtRankings, saveDtRankings,
  getTasks, saveTasks,
  getEvents, saveEvents,
  getObjectives, saveObjectives,
  getMarket, saveMarket,
  getClub, saveClub,
  getFixtures, saveFixtures
} from '../../utils/sharedStorage';
import { VZ_COMMENTS_KEY } from '../../utils/storageKeys';

const loadComments = (): Comment[] => {
  const json = localStorage.getItem(VZ_COMMENTS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveCommentsToStorage = (comments: Comment[]) => {
  localStorage.setItem(VZ_COMMENTS_KEY, JSON.stringify(comments));
};

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
  offers: any[];
  faqs: any[];
  posts: any[];
  marketStatus: any;
  mediaItems: any[];
  storeItems: any[];
  positions: any[];
  dtRankings: any[];
  tasks: any[];
  events: any[];
  objectives: any[];
  market: any;
  club: any;
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
  addTournament: (tournament: Tournament) => void;
  updateTournaments: (tournaments: Tournament[]) => void;
  removeTournament: (id: string) => void;
  
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
  addComment: (comment: Comment) => void;
  reportComment: (id: string) => void;
  
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
      postId: 'post1',
      author: 'user123',
      content: '¡Excelente partido! Muy emocionante hasta el final.',
      date: '2023-12-10T00:00:00.000Z',
      reported: false,
      hidden: false,
      status: 'pending',
      userId: 'user123',
      likes: 5,
      flags: 0
    },
    {
      id: '2',
      postId: 'post2',
      author: 'user456',
      content: 'El árbitro estuvo muy mal, claramente favoreció al equipo local.',
      date: '2023-12-09T00:00:00.000Z',
      reported: true,
      hidden: false,
      status: 'pending',
      userId: 'user456',
      likes: 2,
      flags: 3
    }
  ]
};

export const useGlobalStore = create<GlobalStore>()(
  subscribeWithSelector<GlobalStore>((set, get) => {
  const initial = {
    users: getUsers(),
    clubs: getClubs(),
    players: getPlayers(),
    matches: getFixtures(),
    tournaments: getTournaments(),
    newsItems: getNews(),
    transfers: getTransfers(),
    standings: getStandings(),
    activities: getActivities(),
    comments: loadComments(),
    offers: getOffers(),
    faqs: getFaqs(),
    posts: getPosts(),
    marketStatus: getMarketStatus(),
    mediaItems: getMediaItems(),
    storeItems: getStoreItems(),
    positions: getPositions(),
    dtRankings: getDtRankings(),
    tasks: getTasks(),
    events: getEvents(),
    objectives: getObjectives(),
    market: getMarket(),
    club: getClub()
  };

  const persist = () => {
    saveUsers(get().users);
    saveClubs(get().clubs);
    savePlayers(get().players);
    saveFixtures(get().matches);
    saveTournaments(get().tournaments);
    saveNews(get().newsItems);
    saveTransfers(get().transfers);
    saveStandings(get().standings);
    saveActivities(get().activities);
    saveCommentsToStorage(get().comments);
    saveOffers(get().offers);
    saveFaqs(get().faqs);
    savePosts(get().posts);
    saveMarketStatus(get().marketStatus);
    saveMediaItems(get().mediaItems);
    saveStoreItems(get().storeItems);
    savePositions(get().positions);
    saveDtRankings(get().dtRankings);
    saveTasks(get().tasks);
    saveEvents(get().events);
    saveObjectives(get().objectives);
    saveMarket(get().market);
    saveClub(get().club);
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
        saveClubs(updatedClubs);
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
        saveClubs(updatedClubs);
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
        saveClubs(updatedClubs);
        return { users: updatedUsers, clubs: updatedClubs };
      });
      persist();
    },

    addPlayer: player => {
      set(state => {
        const updated = [...state.players, player];
        savePlayers(updated);
        return { players: updated };
      });
      persist();
    },

    updatePlayer: player => {
      set(state => {
        const updated = state.players.map(p => (p.id === player.id ? player : p));
        savePlayers(updated);
        return { players: updated };
      });
      persist();
    },

    removePlayer: id => {
      set(state => {
        const updated = state.players.filter(p => p.id !== id);
        savePlayers(updated);
        return { players: updated };
      });
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
      set(state => {
        // Agregar noticia
        const updatedNews = [...state.newsItems, item];
        saveNews(updatedNews);
        // Convertir a post
        const post = {
          id: item.id,
          title: item.title,
          excerpt: item.content?.slice(0, 120) || '',
          content: item.content,
          image: '',
          category: 'Noticias',
          author: item.author,
          date: item.publishedAt,
          slug: item.title ? item.title.toLowerCase().replace(/\s+/g, '-') : item.id
        };
        const updatedPosts = [...state.posts, post];
        savePosts(updatedPosts);
        return { newsItems: updatedNews, posts: updatedPosts };
      });
      persist();
    },

    updateNewsItem: item => {
      set(state => {
        // Actualizar noticia
        const updatedNews = state.newsItems.map(n => (n.id === item.id ? item : n));
        // Actualizar post relacionado
        const updatedPosts = state.posts.map(p =>
          p.id === item.id
            ? {
                ...p,
                title: item.title,
                excerpt: item.content?.slice(0, 120) || '',
                content: item.content,
                image: item.image || '',
                category: item.category || 'Noticias',
                author: item.author,
                date: item.publishedAt,
                slug: item.title ? item.title.toLowerCase().replace(/\s+/g, '-') : item.id
              }
            : p
        );
        saveNews(updatedNews);
        savePosts(updatedPosts);
        return { newsItems: updatedNews, posts: updatedPosts };
      });
      persist();
    },

    removeNewsItem: id => {
      set(state => {
        const updatedNews = state.newsItems.filter(n => n.id !== id);
        const updatedPosts = state.posts.filter(p => p.id !== id);
        saveNews(updatedNews);
        savePosts(updatedPosts);
        return { newsItems: updatedNews, posts: updatedPosts };
      });
      persist();
    },

    approveComment: id => {
      set(state => {
        const updated = state.comments.map(c => 
          c.id === id 
            ? { 
                ...c, 
                status: 'approved' as const,
                reported: false,
                hidden: false,
                updatedAt: new Date().toISOString()
              } 
            : c
        );
        saveCommentsToStorage(updated);
        return { comments: updated };
      });
      persist();
    },

    hideComment: id => {
      set(state => {
        const updated = state.comments.map(c => 
          c.id === id 
            ? { 
                ...c, 
                status: 'hidden' as const,
                hidden: true,
                updatedAt: new Date().toISOString()
              } 
            : c
        );
        saveCommentsToStorage(updated);
        return { comments: updated };
      });
      persist();
    },

    deleteComment: id => {
      set(state => {
        const updated = state.comments.filter(c => c.id !== id);
        saveCommentsToStorage(updated);
        return { comments: updated };
      });
      persist();
    },

    addComment: comment => {
      set(state => {
        const newComment = {
          ...comment,
          status: 'pending' as const,
          reported: false,
          hidden: false,
          likes: 0,
          flags: 0,
          userId: comment.userId || comment.author
        };
        const updated = [newComment, ...state.comments];
        saveCommentsToStorage(updated);
        return { comments: updated };
      });
      persist();
    },

    reportComment: id => {
      set(state => {
        const updated = state.comments.map(c =>
          c.id === id ? { ...c, reported: true, flags: (c.flags || 0) + 1 } : c
        );
        saveCommentsToStorage(updated);
        return { comments: updated };
      });
      persist();
    },

    addActivity: activity => {
      set(state => ({ activities: [...state.activities, activity] }));
      persist();
    },

    // Torneos
    addTournament: tournament => {
      set(state => {
        const updated = [...state.tournaments, tournament];
        saveTournaments(updated);
        return { tournaments: updated };
      });
      persist();
    },
    updateTournaments: tournaments => {
      set(() => ({ tournaments }));
      saveTournaments(tournaments);
      persist();
    },
    removeTournament: id => {
      set(state => {
        const updated = state.tournaments.filter(t => t.id !== id);
        saveTournaments(updated);
        return { tournaments: updated };
      });
      persist();
    }
  };
}));

export const subscribe = useGlobalStore.subscribe;
