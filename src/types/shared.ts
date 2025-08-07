export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'dt' | 'admin';
  avatar?: string;
  bio?: string;
  level?: number;
  xp?: number;
  club?: string;
  clubId?: string;
  joinDate?: string;
  createdAt?: string;
  status: 'active' | 'suspended' | 'banned' | 'inactive';
  notifications?: boolean;
  lastLogin?: string;
  followers?: number;
  following?: number;
  password?: string;
}

export interface Title {
  id: string;
  name: string;
  year: number;
  type: 'league' | 'cup' | 'supercup' | 'other';
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

export interface PlayerDetailedStats {
  offensive: number;
  ballControl: number;
  dribbling: number;
  lowPass: number;
  loftedPass: number;
  finishing: number;
  placeKicking: number;
  volleys: number;
  curl: number;
  speed: number;
  acceleration: number;
  kickingPower: number;
  stamina: number;
  jumping: number;
  physicalContact: number;
  balance: number;
  defensive: number;
  ballWinning: number;
  aggression: number;
  // Estadísticas de portero
  goalkeeperReach: number;
  goalkeeperReflexes: number;
  goalkeeperClearing: number;
  goalkeeperThrowing: number;
  goalkeeperHandling: number;
}

export interface Player {
  id: string;
  nombre_jugador: string;
  apellido_jugador: string;
  edad: number;
  altura: number;
  peso: number;
  pierna: 'left' | 'right';
  estilo_juego: string;
  posicion: string;
  valoracion: number;
  precio_compra_libre: number;
  actitud_ofensiva: number;
  control_balon: number;
  drible: number;
  posesion_balon: number;
  pase_raso: number;
  pase_bombeado: number;
  finalizacion: number;
  cabeceador: number;
  balon_parado: number;
  efecto: number;
  velocidad: number;
  aceleracion: number;
  potencia_tiro: number;
  salto: number;
  contacto_fisico: number;
  equilibrio: number;
  resistencia: number;
  actitud_defensiva: number;
  recuperacion_balon: number;
  agresividad: number;
  actitud_portero: number;
  atajar_pt: number;
  despejar_pt: number;
  reflejos_pt: number;
  cobertura_pt: number;
  uso_pie_malo: number;
  precision_pie_malo: number;
  estabilidad: number;
  resistencia_lesiones: number;
  foto_jugador: string;
  is_free: boolean;
  nacionalidad: string;
  id_equipo: string;
  
  // Campos legacy para compatibilidad
  name?: string;
  age?: number;
  position?: string;
  nationality?: string;
  dorsal?: number;
  club?: string;
  clubId?: string;
  overall?: number;
  potential?: number;
  transferListed?: boolean;
  matches?: number;
  transferValue?: number;
  value?: number;
  image?: string;
  attributes?: PlayerAttributes;
  contract?: PlayerContract;
  form?: number;
  goals?: number;
  assists?: number;
  appearances?: number;
  marketValue?: number;
  price?: number;
  height?: number;
  weight?: number;
  dominantFoot?: 'left' | 'right';
  secondaryPositions?: string[];
  specialSkills?: string[];
  playingStyle?: string;
  celebrations?: string[];
  consistency?: number;
  injuryResistance?: number;
  morale?: number;
  detailedStats?: PlayerDetailedStats;
}
