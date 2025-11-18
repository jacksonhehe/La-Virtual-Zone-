//  User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'dt' | 'admin';
  roles?: Array<'user' | 'dt' | 'admin'>;
  avatar: string;
  clubId?: string;
  club?: string; // Nombre del club para compatibilidad con datos legacy
  joinDate: string;
  status: 'active' | 'suspended' | 'banned' | 'deleted';
  // Profile customization fields
  bio?: string;
  location?: string;
  website?: string;
  favoriteTeam?: string;
  favoritePosition?: string;
  // Opcionales para control de suspensión/ban
  suspendedUntil?: string; // ISO date si está suspendido temporalmente
  suspendedReason?: string; // Motivo de suspensión
  banReason?: string; // Motivo de ban permanente
  // Opcionales para eliminación de cuenta
  deletedAt?: string; // ISO date si la cuenta fue eliminada
  deletedReason?: string; // Motivo de eliminación
  notifications: boolean;
  lastLogin: string;
  followers: number;
  following: number;
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
  clubId: string;
  overall: number;
  potential: number;
  transferListed: boolean;
  transferValue: number;
  image: string;
  attributes: PlayerAttributes;
  skills: PlayerSkills;
  playingStyles: PlayingStyles;
  contract: PlayerContract;
  form: number;
  goals: number;
  assists: number;
  appearances: number;
  matches: number; // Partidos jugados (para compatibilidad con datos existentes)
  dorsal: number; // Número de dorsal del jugador
  injuryResistance: number; // Resistencia a lesiones
  height?: number; // Altura en centímetros
  weight?: number; // Peso en kilogramos
}

export interface PlayerAttributes {
  // Atributos generales (26 + 3 subatributos)
  offensiveAwareness: number;    // Actitud ofensiva
  ballControl: number;           // Control de balón
  dribbling: number;             // Drible
  tightPossession: number;       // Posesión del balón
  lowPass: number;               // Pase al ras
  loftedPass: number;            // Pase bombeado
  finishing: number;             // Finalización
  heading: number;               // Cabeceador
  setPieceTaking: number;        // Balón parado
  curl: number;                  // Efecto
  speed: number;                 // Velocidad
  acceleration: number;          // Aceleración
  kickingPower: number;          // Potencia de tiro
  jumping: number;               // Salto
  physicalContact: number;       // Contacto físico
  balance: number;               // Equilibrio
  stamina: number;               // Resistencia
  defensiveAwareness: number;    // Actitud defensiva
  ballWinning: number;           // Recuperación de balón
  aggression: number;            // Agresividad

  // Atributos de portero
  goalkeeping: number;           // Atajar (PT)
  catching: number;              // Despejar (PT)
  reflexes: number;              // Reflejos (PT)
  coverage: number;              // Cobertura (PT)
  gkHandling: number;            // Actitud de portero (PT)

  // Subatributos especiales (1-4)
  weakFootUsage: number;         // Uso de pie malo
  weakFootAccuracy: number;      // Precisión de pie malo
  form: number;                  // Estabilidad

  // Legacy attributes (para compatibilidad)
  pace: number;
  shooting: number;
  passing: number;
  defending: number;
  physical: number;
}

export interface PlayerContract {
  expires: string;
  salary: number;
}

// Habilidades de jugador (Player Skills) - 39 en total
export interface PlayerSkills {
  scissorKick: boolean;          // Tijera
  doubleTouch: boolean;          // Doble toque
  flipFlap: boolean;             // Gambeta
  marseilleTurn: boolean;        // Marsellesa
  rainbow: boolean;              // Sombrerito
  chopTurn: boolean;             // Cortada
  cutBehindAndTurn: boolean;     // Amago por detrás y giro
  scotchMove: boolean;           // Rebote interior
  stepOnSkillControl: boolean;   // Pisar el balón
  heading: boolean;              // Cabeceador
  longRangeDrive: boolean;       // Cañonero
  chipShotControl: boolean;      // Sombrero
  longRanger: boolean;           // Tiro de larga distancia
  knuckleShot: boolean;          // Tiro con empeine
  dippingShot: boolean;          // Disparo descendente
  risingShot: boolean;           // Disparo ascendente
  acrobaticFinishing: boolean;   // Finalización acrobática
  heelTrick: boolean;            // Taconazo
  firstTimeShot: boolean;        // Remate primer toque
  oneTouchPass: boolean;         // Pase al primer toque
  throughPassing: boolean;       // Pase en profundidad
  weightedPass: boolean;         // Pase a profundidad
  pinpointCrossing: boolean;     // Pase cruzado
  outsideCurler: boolean;        // Centro con rosca
  rabona: boolean;               // Rabona
  noLookPass: boolean;           // Pase sin mirar
  lowLoftedPass: boolean;        // Pase bombeado bajo
  giantKill: boolean;            // Patadón en corto
  longThrow: boolean;            // Patadón en largo
  longThrow2: boolean;           // Saque largo de banda
  gkLongThrow: boolean;          // Saque de meta largo
  penaltySpecialist: boolean;    // Especialista en penales
  gkPenaltySaver: boolean;       // Parapenales
  fightingSpirit: boolean;       // Malicia
  manMarking: boolean;           // Marcar hombre
  trackBack: boolean;            // Delantero atrasado
  interception: boolean;         // Interceptor
  acrobaticClear: boolean;       // Despeje acrobático
  captaincy: boolean;            // Capitanía
  superSub: boolean;             // Súper refuerzo
  comPlayingStyles: boolean;     // Espíritu de lucha
}

// Estilos de juego (Playing Styles) - 22 en total
export interface PlayingStyles {
  goalPoacher: boolean;          // Cazagoles
  dummyRunner: boolean;          // Señuelo
  foxInTheBox: boolean;          // Hombre de área
  targetMan: boolean;            // Referente
  classicNo10: boolean;          // Creador de jugadas
  prolificWinger: boolean;       // Extremo prolífico
  roamingFlank: boolean;         // Extremo móvil
  crossSpecialist: boolean;      // Especialista en centros
  holePlayer: boolean;           // Jugador de huecos
  boxToBox: boolean;             // Omnipresente
  theDestroyer: boolean;         // El destructor
  orchestrator: boolean;         // Organizador
  anchor: boolean;               // Medio escudo
  offensiveFullback: boolean;    // Lateral ofensivo
  fullbackFinisher: boolean;     // Lateral finalizador
  defensiveFullback: boolean;    // Lateral defensivo
  buildUp: boolean;              // Creación
  extraFrontman: boolean;        // Atacante extra
  offensiveGoalkeeper: boolean;  // Portero ofensivo
  defensiveGoalkeeper: boolean;  // Portero defensivo
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
  status: 'pending' | 'accepted' | 'rejected' | 'counter-offer';
  userId: string;
  counterAmount?: number; // Amount proposed in counter-offer
  counterDate?: string; // Date of counter-offer
  // History of actions on this offer
  history?: OfferEvent[];
}

export interface OfferEvent {
  id: string;
  date: string;
  actor: 'buyer' | 'seller' | 'system';
  action: 'offer' | 'accept' | 'reject' | 'counter' | 'counter-accept' | 'counter-reject';
  details?: Record<string, any>;
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

// Blog posts
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  category: string;
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

// Comment types
export interface Comment {
  id: string;
  postId: string;
  author: string;
  authorAvatar: string;
  content: string;
  date: string;
  likes: number;
  replies?: Comment[];
  likedBy?: string[];
}
