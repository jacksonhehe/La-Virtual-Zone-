import {
  User as SharedUser,
  Club,
  Title,
  Player,
  PlayerAttributes,
  PlayerContract,
} from '../types/shared';

export { Club, Title, Player, PlayerAttributes, PlayerContract } from '../types/shared';

export interface User extends SharedUser {
  role: 'admin' | 'dt' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'active' | 'completed' | 'upcoming';
  currentRound: number;
  totalRounds: number;
}

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft';
}

export interface Transfer {
  id: string;
  playerId: string;
  fromClubId: string;
  toClubId: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}


export interface Standing {
  id: string;
  clubId: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  date: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  status: 'approved' | 'pending' | 'hidden';
  createdAt: string;
}

export interface Fixture {
  id: string;
  tournamentId: string;
  round: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
}
 