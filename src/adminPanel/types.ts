export  interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'dt' | 'user';
  status: 'active' | 'inactive';
  createdAt: string;
  clubId?: string;
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  logo: string;
  foundedYear: number;
  stadium: string;
  budget: number;
  manager: string;
  managerId?: string;
  playStyle: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  titles: Title[];
  reputation: number;
  fanBase: number;
  morale: number;
  createdAt?: string;
}

export interface Title {
  id: string;
  name: string;
  year: number;
  type: 'league' | 'cup' | 'supercup' | 'other';
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  nationality: string;
  dorsal: number;
  clubId: string;
  overall: number;
  potential: number;
  transferListed: boolean;
  matches: number;
  transferValue: number;
  value: number;
  image: string;
  attributes: PlayerAttributes;
  contract: PlayerContract;
  form: number;
  goals: number;
  assists: number;
  appearances: number;
  price?: number;
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerContract {
  expires: string;
  salary: number;
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
 