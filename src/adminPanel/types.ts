export  interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'dt' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  manager: string;
  budget: number;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  position: string;
  clubId: string;
  overall: number;
  price: number;
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
 