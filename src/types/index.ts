export * from './shared';
import { Player } from './shared';

// Tournament types
export interface Tournament {
  id: string;
  name: string;
  slug?: string;
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
  participants?: string[];
  maxTeams?: number;
  prizePool?: number;
  currentTeams?: number;
  location?: string;

  /* NUEVOS CAMPOS AVANZADOS */
  /** Categorías o divisiones del torneo (ej: Sub-18, Libre, Femenino) */
  categories?: string[];
  /** Fases múltiples que componen el torneo (grupos, eliminatoria, finales, etc.) */
  phases?: Phase[];
  /** Patrocinadores asociados al torneo */
  sponsors?: Sponsor[];
  /** Adjuntos (documentos, reglamentos, imágenes) */
  attachments?: Attachment[];
  /** URL personalizada pública (sin protocolo) */
  customUrl?: string;

  /** Tabla de posiciones calculada */
  standings?: Standing[];
  /** Ranking de goleadores */
  topScorersList?: TopScorer[];
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
  category: 'club' | 'user' | 'achievement' | 'background' | 'frame' | 'badge' | 'emoji' | 'theme' | 'booster';
  price: number;
  image: string;
  minLevel: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  assetURL?: string; // link al recurso a aplicar (imagen, css, etc.)
  /** true si aún puede comprarse (stock >0 y activo) */
  inStock: boolean;
  /** Stock numérico limitado; null = ilimitado */
  stock?: number | null;
  /** Etiquetas visuales, ej: Nuevo, Limitado */
  tags?: string[];
  /** Destacado en portada */
  featured?: boolean;
  /** Fecha de lanzamiento y expiración opcionales (ISO) */
  launchAt?: string;
  expireAt?: string;
  /** Control interno para ocultar sin borrar */
  active?: boolean;
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
  status?: 'approved' | 'pending' | 'hidden';
  userId?: string;
  likes?: number;
  flags?: number;
  replies?: Comment[];
  updatedAt?: string;
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

// ------------------ Tipos auxiliares ------------------

export interface Phase {
  id: string;
  name: string;
  /** Tipo de fase, por ejemplo group, knockout, final */
  type: 'group' | 'knockout' | 'round_robin' | 'final';
  /** Número de rondas o jornadas en la fase */
  rounds: number;
  /** Partidos pertenecientes a esta fase */
  matches?: Match[];
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  website?: string;
}

export interface Attachment {
  id: string;
  title: string;
  url: string;
  uploadedAt?: string;
}
