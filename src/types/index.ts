//  User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'dt' | 'admin';
  avatar: string;
  level?: number;
  xp: number;
  club?: string;
  clubId?: string;
  joinDate?: string;
  status: 'active' | 'suspended' | 'banned';
  notifications: boolean;
  lastLogin: string;
  followers: number;
  following: number;
  password?: string;
}

// Club types
export interface Club {
  id: string;
  name: string;
  logo: string;
  foundedYear: number;
  stadium: string;
  budget: number;
  manager: string;
  playStyle: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  titles: Title[];
  reputation: number;
  fanBase: number;
}

export interface Title {
  id: string;
  name: string;
  year: number;
  type: 'league' | 'cup' | 'supercup' | 'other';
}

// Player types
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

// Tournament types
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
  winner?: string;
  topScorer?: TopScorer;
  description: string;
}

export interface TopScorer {
  id: string;
  playerId: string;
  playerName: string;
  clubId: string;
  clubName: string;
  goals: number;
}

// Match types
export interface Match {
  id: string;
  tournamentId: string;
  round: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: 'scheduled' | 'live' | 'finished';
  scorers?: Scorer[];
  highlights?: string[];
}

export interface Scorer {
  playerId: string;
  playerName: string;
  clubId: string;
  minute: number;
}

// Transfer types
export interface Transfer {
  id: string;
  playerId: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  fee: number;
  date: string;
}

export interface TransferOffer {
  id: string;
  playerId: string;
  playerName: string;
  fromClub: string;
  toClub: string;
  amount: number;
  date: string;
  status: 'pending' | 'accepted' | 'rejected';
  userId: string;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'transfer' | 'rumor' | 'result' | 'announcement' | 'statement';
  image?: string;
  date: string;
  author: string;
  clubId?: string;
  playerId?: string;
  tournamentId?: string;
  featured: boolean;
}

// Blog post type
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  content: string;
}

// Media types
export interface MediaItem {
  id: string;
  title: string;
  type: 'image' | 'video' | 'clip';
  url: string;
  thumbnailUrl: string;
  uploadDate: string;
  uploader: string;
  category: string;
  likes: number;
  views: number;
  tags: string[];
  clubId?: string;
  playerId?: string;
  tournamentId?: string;
}

// FAQ types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'account' | 'tournament' | 'league' | 'market' | 'other';
}

// Store item types
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: 'club' | 'user' | 'achievement';
  price: number;
  image: string;
  minLevel: number;
  inStock: boolean;
}

// League standings type
export interface Standing {
  clubId: string;
  clubName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  form: string[];
}
 
// Activity log types
export interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  date: string;
  details: string;
}
