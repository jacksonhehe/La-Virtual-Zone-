export * from './shared';

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
  results?: Match[];
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
  responseDate?: string;
}

// News types
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'transfer' | 'rumor' | 'result' | 'announcement' | 'statement';
  /** Optional category label used in some views */
  category?: string;
  imageUrl?: string;
  /** Publication date (alias 'date' used in some components) */
  publishDate: string;
  date?: string;
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
  possession: number;
  cards: number;
}
 
// Activity log types
export interface ActivityLogEntry {
  id: string;
  action: string;
  userId: string;
  date: string;
  details: string;
}

// Comment types
export interface Comment {
  id: string;
  postId: string;
  author: string;
  content: string;
  date: string;
  reported: boolean;
  hidden: boolean;
}

// --- DT dashboard specific types ---
export interface DtClub {
  id: string;
  name: string;
  slug: string;
  logo: string;
  formation: string;
  budget: number;
  players: Player[];
}

export interface DtFixture extends Match {
  played: boolean;
}

export interface DtMarket {
  open: boolean;
}

export interface DtObjectives {
  position: number | null;
  fairplay: number | null;
}

export interface DtTask {
  id: string;
  text: string;
  done?: boolean;
}

export interface DtEvent {
  id: string;
  message: string;
  date: string;
}

export interface DtRanking {
  id: string;
  username: string;
  clubName: string;
  clubLogo: string;
  elo: number;
}
