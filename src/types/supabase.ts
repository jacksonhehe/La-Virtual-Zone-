import { PlayerStats } from './player-stats';

// Tipos base para todas las entidades
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

// Perfil de usuario
export interface Profile extends BaseEntity {
  id: string; // UUID del auth.users
  username: string;
  role: 'ADMIN' | 'CLUB' | 'USER';
  avatar_url?: string;
}

// Club
export interface Club extends BaseEntity {
  name: string;
  slug: string;
  logo?: string;
  founded_year: number;
  stadium: string;
  manager_id?: string; // UUID del profile
  budget: number;
  play_style?: string;
  primary_color: string;
  secondary_color: string;
  description?: string;
  tactics?: Record<string, any>; // JSONB para tácticas
}

// Jugador
export interface Player extends BaseEntity {
  name: string;
  age: number;
  nationality: string;
  dorsal: number;
  position: 'POR' | 'DEF' | 'MED' | 'DEL';
  club_id?: number;
  overall: number;
  potential: number;
  price: number;
  image?: string;
  contract_expires?: string;
  salary: number;
  stats?: PlayerStats; // JSONB para estadísticas detalladas
}

// Vista de jugadores con datos planos (para filtros y ordenamiento)
export interface PlayerFlat extends Player {
  club_name?: string;
  club_slug?: string;
  club_logo?: string;
}

// Partido
export interface Match extends BaseEntity {
  home_club_id: number;
  away_club_id: number;
  home_score?: number;
  away_score?: number;
  status: 'scheduled' | 'live' | 'finished';
  played_at: string;
  tournament_id?: number;
}

// Partido con datos de clubes
export interface MatchWithClubs extends Match {
  home_club: Pick<Club, 'id' | 'name' | 'slug' | 'logo'>;
  away_club: Pick<Club, 'id' | 'name' | 'slug' | 'logo'>;
}

// Transferencia
export interface Transfer extends BaseEntity {
  player_id: number;
  from_club_id?: number;
  to_club_id?: number;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}

// Transferencia con datos relacionados
export interface TransferWithDetails extends Transfer {
  player: Pick<Player, 'id' | 'name' | 'position' | 'overall'>;
  from_club?: Pick<Club, 'id' | 'name'>;
  to_club?: Pick<Club, 'id' | 'name'>;
}

// Torneo
export interface Tournament extends BaseEntity {
  name: string;
  season: string;
  type?: 'LEAGUE' | 'KNOCKOUT' | 'MIXED';
  status: 'ACTIVE' | 'FINISHED' | 'ARCHIVED';
}

// Noticia
export interface News extends BaseEntity {
  title: string;
  content: string;
  image?: string;
  author_id: string; // UUID del profile
}

// Noticia con datos del autor
export interface NewsWithAuthor extends News {
  author: Pick<Profile, 'username' | 'avatar_url'>;
}

// Posición en la tabla (standings)
export interface Standing {
  tournament_id: number;
  club_id: number;
  club_name: string;
  club_logo?: string;
  gp: number; // Games played
  w: number;  // Wins
  d: number;  // Draws
  l: number;  // Losses
  gf: number; // Goals for
  ga: number; // Goals against
  gd: number; // Goal difference
  pts: number; // Points
}

// Tipos para inserción (sin campos auto-generados)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type ClubInsert = Omit<Club, 'id' | 'created_at' | 'updated_at'>;
export type PlayerInsert = Omit<Player, 'id' | 'created_at' | 'updated_at'>;
export type MatchInsert = Omit<Match, 'id' | 'created_at' | 'updated_at'>;
export type TransferInsert = Omit<Transfer, 'id' | 'created_at' | 'updated_at'>;
export type TournamentInsert = Omit<Tournament, 'id' | 'created_at' | 'updated_at'>;
export type NewsInsert = Omit<News, 'id' | 'created_at' | 'updated_at'>;

// Tipos para actualización (todos los campos opcionales excepto id)
export type ProfileUpdate = Partial<Omit<Profile, 'id'>> & { id: string };
export type ClubUpdate = Partial<Omit<Club, 'id'>> & { id: number };
export type PlayerUpdate = Partial<Omit<Player, 'id'>> & { id: number };
export type MatchUpdate = Partial<Omit<Match, 'id'>> & { id: number };
export type TransferUpdate = Partial<Omit<Transfer, 'id'>> & { id: number };
export type TournamentUpdate = Partial<Omit<Tournament, 'id'>> & { id: number };
export type NewsUpdate = Partial<Omit<News, 'id'>> & { id: number };

// Respuestas de Supabase
export interface SupabaseResponse<T> {
  data: T | null;
  error: any;
}

export interface SupabaseListResponse<T> {
  data: T[] | null;
  error: any;
  count?: number;
}
