import {
  User as SharedUser,
  Club,
  Title,
  Player,
  PlayerAttributes,
  PlayerContract,
} from '../types/shared';
export type { Club, Title, Player, PlayerAttributes, PlayerContract } from '../types/shared';
// Importa los tipos necesarios para torneos
import type { Match, TopScorer } from '../types/index';

export interface User extends SharedUser {
  role: 'admin' | 'dt' | 'user';
  status: 'active' | 'suspended' | 'banned' | 'inactive';
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'league' | 'cup' | 'friendly';
  logo: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'finished';
  teams: string[];
  rounds: number;
  matches: Match[];
  results?: Match[];
  winner?: string;
  topScorer?: TopScorer;
  description: string;
  // Campos opcionales para compatibilidad UI
  format?: string;
  location?: string;
  prizePool?: number;
  currentTeams?: number;
  maxTeams?: number;

  /* NUEVOS CAMPOS AVANZADOS */
  categories?: string[];
  phases?: Phase[];
  sponsors?: Sponsor[];
  attachments?: Attachment[];
  customUrl?: string;

  standings?: import('../types').Standing[];
  topScorersList?: import('../types').TopScorer[];
}

// Reexportar tipos auxiliares desde shared index
import type { Phase, Sponsor, Attachment } from '../types';

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  author: string;
  publishedAt: string;
  status: 'published' | 'draft';
  image?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
  views?: number;
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
  postId: string;
  author: string;
  content: string;
  date: string;
  reported: boolean;
  hidden: boolean;
  status: 'approved' | 'pending' | 'hidden';
  userId?: string;
  likes?: number;
  replies?: Comment[];
  flags?: number;
  updatedAt?: string;
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
 