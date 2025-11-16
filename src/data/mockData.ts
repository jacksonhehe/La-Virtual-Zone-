import  {
  Club,
  Player,
  PlayerSkills,
  PlayingStyles,
  Tournament,
  Match,
  Transfer,
  TransferOffer,
  NewsItem,
  MediaItem,
  Standing,
  FAQ,
  StoreItem
} from '../types';
import { calculateSalaryByRating } from '../utils/marketRules';

// Importar datos reales de jugadores desde JSON
import playersData from '../../Transferencias_Listado_Completo_Sin_NA.json';

// Mapeo de posiciones del JSON a posiciones de la aplicaciÃ³n
const positionMapping: { [key: string]: string } = {
  'Pt': 'PT',
  'PT': 'PT',
  'Dec': 'DEC',
  'DEC': 'DEC',
  'Mcd': 'MCD',
  'MCD': 'MCD',
  'Mc': 'MC',
  'MC': 'MC',
  'Dc': 'CD',
  'DC': 'CD',
  'Cd': 'CD',
  'CD': 'CD',
  'Sd': 'SD',
  'SD': 'SD',
  'LD': 'LD',
  'Ld': 'LD',
  'LI': 'LI',
  'Li': 'LI',
  'Mo': 'MO',
  'MO': 'MO',
  'Exd': 'EXD',
  'EXD': 'EXD',
  'Exi': 'EXI',
  'EXI': 'EXI',
  'Mdd': 'MDD',
  'MDD': 'MDD',
  'Mdi': 'MDI',
  'MDI': 'MDI'
};

// Funciï¿½n para convertir precios del formato '44M' a nï¿½meros
function parsePrice(priceStr: string): number {
  if (priceStr === '-' || priceStr === '') return 0;

  const match = priceStr.match(/^(\d+)([MK]?)$/);
  if (!match) return 0;

  const [, value, unit] = match;
  const numValue = parseInt(value);

  switch (unit) {
    case 'M': return numValue * 1000000;
    case 'K': return numValue * 1000;
    default: return numValue;
  }
}

// URL de datos PNG para la imagen por defecto del jugador (simplificada)
const defaultPlayerImage = '/default.png';

// Interface para los datos del JSON
interface JsonPlayer {
  id: number;
  nombre_jugador: string;
  apellido_jugador: string;
  edad: number;
  altura: string;
  peso: string;
  pierna: string;
  estilo_juego: string;
  posicion: string;
  valoracion: number;
  precio_compra_libre: string;
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
  foto_jugador: number;
  is_free: string;
  nacionalidad: string;
  id_equipo: string;
}

// Funciï¿½n para convertir un jugador del JSON al formato Player
function convertJsonPlayerToPlayer(jsonPlayer: JsonPlayer, clubId: string, dorsal: number, uniqueId: number): Player {
  const mappedPosition = positionMapping[jsonPlayer.posicion] || 'MC'; // Default a MC si no se encuentra el mapeo

  // Calcular atributos legacy basados en los atributos reales
  const legacyAttributes = {
    pace: Math.round((jsonPlayer.velocidad + jsonPlayer.aceleracion) / 2),
    shooting: Math.round((jsonPlayer.finalizacion + jsonPlayer.potencia_tiro + jsonPlayer.efecto) / 3),
    passing: Math.round((jsonPlayer.pase_raso + jsonPlayer.pase_bombeado + jsonPlayer.efecto) / 3),
    dribbling: Math.round((jsonPlayer.drible + jsonPlayer.control_balon + jsonPlayer.posesion_balon) / 3),
    defending: Math.round((jsonPlayer.actitud_defensiva + jsonPlayer.recuperacion_balon + jsonPlayer.contacto_fisico) / 3),
    physical: Math.round((jsonPlayer.resistencia + jsonPlayer.contacto_fisico + jsonPlayer.equilibrio) / 3)
  };

  // Calcular estadï¿½sticas basadas en posiciï¿½n y valoraciï¿½n
  const isForward = ['CD', 'EXI', 'EXD', 'MO', 'SD'].includes(mappedPosition);
  const isMidfielder = ['MC', 'MCD', 'MDI', 'MDD'].includes(mappedPosition);
  const isDefender = ['DEC', 'LI', 'LD'].includes(mappedPosition);
  const isGoalkeeper = mappedPosition === 'PT';

  const baseGoals = isForward ? Math.floor(jsonPlayer.valoracion / 5) :
                   isMidfielder ? Math.floor(jsonPlayer.valoracion / 8) :
                   isDefender ? Math.floor(jsonPlayer.valoracion / 12) :
                   0;

  const baseAssists = isMidfielder ? Math.floor(jsonPlayer.valoracion / 6) :
                     isForward ? Math.floor(jsonPlayer.valoracion / 8) :
                     Math.floor(jsonPlayer.valoracion / 10);

  return {
    id: `player-${uniqueId}`,
    name: `${jsonPlayer.nombre_jugador} ${jsonPlayer.apellido_jugador}`,
    age: jsonPlayer.edad,
    position: mappedPosition,
    nationality: jsonPlayer.nacionalidad,
    clubId,
    overall: jsonPlayer.valoracion,
    potential: Math.min(101, jsonPlayer.valoracion + Math.floor(Math.random() * 6)), // Potencial ligeramente superior
    transferListed: jsonPlayer.is_free === 'Free' || jsonPlayer.precio_compra_libre === '-',
    transferValue: parsePrice(jsonPlayer.precio_compra_libre),
    image: defaultPlayerImage,
    dorsal,
    matches: Math.floor(Math.random() * 30) + 5,
    goals: isGoalkeeper ? 0 : baseGoals + Math.floor(Math.random() * 10),
    assists: baseAssists + Math.floor(Math.random() * 8),
    appearances: Math.floor(Math.random() * 25) + 10,
    form: Math.floor(Math.random() * 5) + 1,
    injuryResistance: jsonPlayer.resistencia_lesiones,
    attributes: {
      // Atributos generales
      offensiveAwareness: jsonPlayer.actitud_ofensiva,
      ballControl: jsonPlayer.control_balon,
      dribbling: jsonPlayer.drible,
      tightPossession: jsonPlayer.posesion_balon,
      lowPass: jsonPlayer.pase_raso,
      loftedPass: jsonPlayer.pase_bombeado,
      finishing: jsonPlayer.finalizacion,
      heading: jsonPlayer.cabeceador,
      setPieceTaking: jsonPlayer.balon_parado,
      curl: jsonPlayer.efecto,
      speed: jsonPlayer.velocidad,
      acceleration: jsonPlayer.aceleracion,
      kickingPower: jsonPlayer.potencia_tiro,
      jumping: jsonPlayer.salto,
      physicalContact: jsonPlayer.contacto_fisico,
      balance: jsonPlayer.equilibrio,
      stamina: jsonPlayer.resistencia,
      defensiveAwareness: jsonPlayer.actitud_defensiva,
      ballWinning: jsonPlayer.recuperacion_balon,
      aggression: jsonPlayer.agresividad,

      // Atributos de portero
      goalkeeping: jsonPlayer.actitud_portero,
      catching: jsonPlayer.atajar_pt,
      reflexes: jsonPlayer.reflejos_pt,
      coverage: jsonPlayer.cobertura_pt,
      gkHandling: 70,

      // Subatributos especiales
      weakFootUsage: jsonPlayer.uso_pie_malo,
      weakFootAccuracy: jsonPlayer.precision_pie_malo,
      form: jsonPlayer.estabilidad,

      // Legacy attributes
      pace: legacyAttributes.pace,
      shooting: legacyAttributes.shooting,
      passing: legacyAttributes.passing,
      defending: legacyAttributes.defending,
      physical: legacyAttributes.physical
    },
    skills: {
      // Habilidades tï¿½cnicas (algunas basadas en valoraciï¿½n y posiciï¿½n)
      scissorKick: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      doubleTouch: Math.random() > 0.7 && jsonPlayer.valoracion > 70,
      flipFlap: Math.random() > 0.85 && jsonPlayer.valoracion > 75,
      marseilleTurn: Math.random() > 0.8 && jsonPlayer.valoracion > 70,
      rainbow: Math.random() > 0.9 && jsonPlayer.valoracion > 75,
      chopTurn: Math.random() > 0.75 && jsonPlayer.valoracion > 70,
      cutBehindAndTurn: Math.random() > 0.8 && jsonPlayer.valoracion > 70,
      scotchMove: Math.random() > 0.85 && jsonPlayer.valoracion > 75,
      stepOnSkillControl: Math.random() > 0.7 && jsonPlayer.valoracion > 70,
      heading: Math.random() > 0.6 && (mappedPosition === 'CD' || mappedPosition === 'DEC'),
      longRangeDrive: Math.random() > 0.7 && jsonPlayer.valoracion > 75,
      chipShotControl: Math.random() > 0.8 && jsonPlayer.valoracion > 70,
      longRanger: Math.random() > 0.75 && jsonPlayer.valoracion > 75,
      knuckleShot: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      dippingShot: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      risingShot: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      acrobaticFinishing: Math.random() > 0.9 && jsonPlayer.valoracion > 80,
      heelTrick: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      firstTimeShot: Math.random() > 0.7 && jsonPlayer.valoracion > 70,
      oneTouchPass: Math.random() > 0.6 && jsonPlayer.valoracion > 70,
      throughPassing: Math.random() > 0.7 && (mappedPosition === 'MC' || mappedPosition === 'MO' || mappedPosition === 'CD'),
      weightedPass: Math.random() > 0.75 && jsonPlayer.valoracion > 75,
      pinpointCrossing: Math.random() > 0.7 && (mappedPosition === 'MDI' || mappedPosition === 'MDD' || mappedPosition === 'EXD' || mappedPosition === 'EXI'),
      outsideCurler: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      rabona: Math.random() > 0.9 && jsonPlayer.valoracion > 80,
      noLookPass: Math.random() > 0.85 && jsonPlayer.valoracion > 75,
      lowLoftedPass: Math.random() > 0.7 && jsonPlayer.valoracion > 70,
      giantKill: Math.random() > 0.8 && jsonPlayer.valoracion > 75,
      longThrow: Math.random() > 0.7 && (mappedPosition === 'LI' || mappedPosition === 'LD'),
      longThrow2: Math.random() > 0.8 && (mappedPosition === 'LI' || mappedPosition === 'LD'),
      gkLongThrow: mappedPosition === 'PT' && Math.random() > 0.6,
      penaltySpecialist: Math.random() > 0.7 && jsonPlayer.valoracion > 75,
      gkPenaltySaver: mappedPosition === 'PT' && Math.random() > 0.7,
      fightingSpirit: Math.random() > 0.6,
      manMarking: Math.random() > 0.7 && (mappedPosition === 'DEC' || mappedPosition === 'MCD'),
      trackBack: Math.random() > 0.6 && (mappedPosition === 'CD' || mappedPosition === 'EXI' || mappedPosition === 'EXD'),
      interception: Math.random() > 0.7 && (mappedPosition === 'MCD' || mappedPosition === 'MC'),
      acrobaticClear: mappedPosition === 'PT' && Math.random() > 0.7,
      captaincy: Math.random() > 0.8 && jsonPlayer.valoracion > 80,
      superSub: Math.random() > 0.75,
      comPlayingStyles: Math.random() > 0.6
    },
    playingStyles: {
      // Estilos de juego segï¿½n posiciï¿½n y atributos
      goalPoacher: mappedPosition === 'CD' && Math.random() > 0.7,
      dummyRunner: Math.random() > 0.8,
      foxInTheBox: mappedPosition === 'CD' && Math.random() > 0.7,
      targetMan: (mappedPosition === 'CD' || mappedPosition === 'DEC') && Math.random() > 0.6,
      classicNo10: mappedPosition === 'MO' && Math.random() > 0.7,
      prolificWinger: (mappedPosition === 'EXD' || mappedPosition === 'EXI') && Math.random() > 0.7,
      roamingFlank: (mappedPosition === 'MDI' || mappedPosition === 'MDD') && Math.random() > 0.6,
      crossSpecialist: (mappedPosition === 'MDI' || mappedPosition === 'MDD' || mappedPosition === 'EXD' || mappedPosition === 'EXI') && Math.random() > 0.7,
      holePlayer: mappedPosition === 'MO' && Math.random() > 0.7,
      boxToBox: mappedPosition === 'MC' && Math.random() > 0.7,
      theDestroyer: mappedPosition === 'MCD' && Math.random() > 0.7,
      orchestrator: mappedPosition === 'MC' && Math.random() > 0.8,
      anchor: mappedPosition === 'MCD' && Math.random() > 0.7,
      offensiveFullback: mappedPosition === 'LD' && Math.random() > 0.7,
      fullbackFinisher: mappedPosition === 'LI' && Math.random() > 0.8,
      defensiveFullback: (mappedPosition === 'LI' || mappedPosition === 'LD') && Math.random() > 0.7,
      buildUp: Math.random() > 0.6,
      extraFrontman: mappedPosition === 'CD' && Math.random() > 0.7,
      offensiveGoalkeeper: mappedPosition === 'PT' && Math.random() > 0.6,
      defensiveGoalkeeper: mappedPosition === 'PT' && Math.random() > 0.7
    },
    contract: {
      expires: `202${5 + Math.floor(Math.random() * 3)}-05-30`,
      salary: calculateSalaryByRating(jsonPlayer.valoracion)
    }
  };
}

// Mock Clubs Data
// FunciÃ³n para generar slug de nombre de club
function generateClubSlug(name: string): string {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Lista completa y definitiva de clubes reorganizados segÃºn el mapeo actual
export const clubs: Club[] = [
  // club1 → Alianza Atletico Sullana
  {
    id: 'club1',
    name: 'Alianza Atletico Sullana',
    logo: '/Logos_Clubes/Liga B/alianzasullana.png',
    foundedYear: 2023,
    stadium: 'Estadio Cyber Arena',
    budget: 25000000,
    manager: 'coach',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#ef4444',
    secondaryColor: '#000000',
    description: 'Club fundador de la Liga Master, conocido por su juego de posesiï¿½n y formaciï¿½n de talento joven.',
    titles: [
      {
        id: 'title1',
        name: 'Liga Master',
        year: 2023,
        type: 'league'
      },
      {
        id: 'title2',
        name: 'Copa PES',
        year: 2024,
        type: 'cup'
      }
    ],
    reputation: 85,
    fanBase: 10000
  },

  // club2 → Alianza Lima
  {
    id: 'club2',
    name: 'Alianza Lima',
    logo: '/Logos_Clubes/Liga A/alianzalima.png',
    foundedYear: 2023,
    stadium: 'Quasar Dome',
    budget: 17500000,
    manager: 'DT Quantum Q',
    playStyle: 'Vertical',
    primaryColor: '#8b008b',
    secondaryColor: '#7c2d12',
    description: 'Equipo cï¿½smico y directo. Especialistas en ataques verticales.',
    titles: [],
    reputation: 81,
    fanBase: 8500
  },

  // club3 → Atlanta
  {
    id: 'club3',
    name: 'Atlanta',
    logo: '/Logos_Clubes/Liga D/atlantafc.png',
    foundedYear: 2023,
    stadium: 'Platinum Arena',
    budget: 28000000,
    manager: 'DT Platinum',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#e5e7eb',
    secondaryColor: '#9ca3af',
    description: 'Club premium con grandes aspiraciones. Especialistas en juego de posesiï¿½n.',
    titles: [],
    reputation: 88,
    fanBase: 12000
  },

  // club4 → Avengers
  {
    id: 'club4',
    name: 'Avengers',
    logo: '/Logos_Clubes/Liga B/avengersfc.png',
    foundedYear: 2023,
    stadium: 'Azure Bay',
    budget: 1500000,
    manager: 'DT Azure',
    playStyle: 'Ofensivo',
    primaryColor: '#0284c7',
    secondaryColor: '#0369a1',
    description: 'Club fluido y creativo. Especialistas en ataques por bandas.',
    titles: [],
    reputation: 56,
    fanBase: 1700
  },

  // club5 → Barcelona SC
  {
    id: 'club5',
    name: 'Barcelona SC',
    logo: '/Logos_Clubes/Liga B/barcelonasc.png',
    foundedYear: 2023,
    stadium: 'Starlight Stadium',
    budget: 3500000,
    manager: 'DT Sapphire',
    playStyle: 'Contraataque',
    primaryColor: '#2563eb',
    secondaryColor: '#1d4ed8',
    description: 'Club brillante y efectivo. Especialistas en contraataques estelares.',
    titles: [],
    reputation: 58,
    fanBase: 2300
  },

  // club6 â†’ La Tobyneta
  {
    id: 'club6',
    name: 'Beast FC',
    logo: '/Logos_Clubes/Liga D/beastfc.png',
    foundedYear: 2023,
    stadium: 'Lion\'s Den',
    budget: 7500000,
    manager: 'DT Golden',
    playStyle: 'Equilibrado',
    primaryColor: '#fbbf24',
    secondaryColor: '#d97706',
    description: 'Club noble y tradicional. Fï¿½tbol equilibrado con ï¿½nfasis en la cantera.',
    titles: [],
    reputation: 62,
    fanBase: 3500
  },

  // club7 â†’ Kod FC
  {
    id: 'club7',
    name: 'Club Atletico Ituzaingó',
    logo: '/Logos_Clubes/Liga D/clubatleticoituzaingo.png',
    foundedYear: 2023,
    stadium: 'Crystal Dome',
    budget: 11500000,
    manager: 'DT Crystal',
    playStyle: 'Contraataque',
    primaryColor: '#e11d48',
    secondaryColor: '#881337',
    description: 'Club elegante y efectivo. Especialistas en contraataques bien elaborados.',
    titles: [],
    reputation: 66,
    fanBase: 4700
  },

  // club8 â†’ Granate
  {
    id: 'club8',
    name: 'Club Atletico Libertadores',
    logo: '/Logos_Clubes/Liga A/clubatleticolibertadores.png',
    foundedYear: 2023,
    stadium: 'Titan Stadium',
    budget: 13500000,
    manager: 'DT Thunder',
    playStyle: 'Tiki-Taka',
    primaryColor: '#7c2d12',
    secondaryColor: '#451a03',
    description: 'Club con tradiciï¿½n de buen fï¿½tbol. Especialistas en el toque y la posesiï¿½n.',
    titles: [],
    reputation: 68,
    fanBase: 5300
  },

  // club9 â†’ Club Atletico Libertadores
  {
    id: 'club9',
    name: 'Comando Sur',
    logo: '/Logos_Clubes/Liga D/comandosur.png',
    foundedYear: 2023,
    stadium: 'Binary Park',
    budget: 21000000,
    manager: 'DT Binary',
    playStyle: 'Vertical',
    primaryColor: '#7c3aed',
    secondaryColor: '#334155',
    description: 'Equipo de juego vertical y directo. Especializado en transiciones rï¿½pidas y ataques por banda.',
    titles: [],
    reputation: 79,
    fanBase: 8200
  },

  // club10 â†’ Mar del Callao
  {
    id: 'club10',
    name: 'Deportes Provincial Osorno',
    logo: '/Logos_Clubes/Liga C/deportesprovincialosorno.png',
    foundedYear: 2023,
    stadium: 'Obsidian Fortress',
    budget: 1000000,
    manager: 'DT Obsidian',
    playStyle: 'Defensivo',
    primaryColor: '#0c0a09',
    secondaryColor: '#292524',
    description: 'Equipo sï¿½lido como la roca. Especialistas en la defensa impenetrable.',
    titles: [],
    reputation: 55,
    fanBase: 1400
  },

  // club11 → CADU
  {
    id: 'club11',
    name: 'CADU',
    logo: '/Logos_Clubes/Liga A/cadu.png',
    foundedYear: 2023,
    stadium: 'Quantum Stadium',
    budget: 18500000,
    manager: 'DT Quantum',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#8b5cf6',
    secondaryColor: '#312e81',
    description: 'Club innovador que combina ciencia y fï¿½tbol. Especialistas en juego de posesiï¿½n y pases precisos.',
    titles: [],
    reputation: 73,
    fanBase: 6800
  },

  // club12 → El Santo Tucumano
  {
    id: 'club12',
    name: 'El Santo Tucumano',
    logo: '/Logos_Clubes/Liga D/santo tucumano.png',
    foundedYear: 2023,
    stadium: 'Thunder Dome',
    budget: 19500000,
    manager: 'DT Storm',
    playStyle: 'Contraataque',
    primaryColor: '#64748b',
    secondaryColor: '#1f2937',
    description: 'Equipo aguerrido que se crece en las adversidades. Especialistas en transiciones rï¿½pidas.',
    titles: [],
    reputation: 74,
    fanBase: 7100
  },

  // club13 â†’ Alianza Atletico Sullana
  {
    id: 'club13',
    name: 'Elijo Creer',
    logo: '/Logos_Clubes/Liga B/elijocreer.png',
    foundedYear: 2023,
    stadium: 'Estadio Cyber Arena',
    budget: 25000000,
    manager: 'coach',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#ef4444',
    secondaryColor: '#000000',
    description: 'Club fundador de la Liga Master, conocido por su juego de posesiï¿½n y formaciï¿½n de talento joven.',
    titles: [
      {
        id: 'title1',
        name: 'Liga Master',
        year: 2023,
        type: 'league'
      },
      {
        id: 'title2',
        name: 'Copa PES',
        year: 2024,
        type: 'cup'
      }
    ],
    reputation: 85,
    fanBase: 10000
  },

  // club14 → Estudiantes de La Plata
  {
    id: 'club14',
    name: 'Estudiantes de La Plata',
    logo: '/Logos_Clubes/Liga C/estudiantesdelaplata.png',
    foundedYear: 2023,
    stadium: 'Frozen Stadium',
    budget: 16500000,
    manager: 'DT Ice',
    playStyle: 'Defensivo',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e40af',
    description: 'Equipo sï¿½lido y organizado. Especialistas en mantener la porterï¿½a a cero.',
    titles: [],
    reputation: 71,
    fanBase: 6200
  },

  // club15 â†’ Sahur FC
  {
    id: 'club15',
    name: 'Furia Verde',
    logo: '/Logos_Clubes/Liga C/furiaverde.png',
    foundedYear: 2023,
    stadium: 'Quantum Field',
    budget: 19500000,
    manager: 'DT Quantum',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#8b5cf6',
    secondaryColor: '#6366f1',
    description: 'Club que representa la fï¿½sica cuï¿½ntica del fï¿½tbol. Impredecibles y con un estilo ï¿½nico.',
    titles: [],
    reputation: 78,
    fanBase: 7600
  },

  // club16 â†’ God Sport
  {
    id: 'club16',
    name: 'God Sport',
    logo: '/Logos_Clubes/Liga C/godsport.png',
    foundedYear: 2023,
    stadium: 'Shadow Colosseum',
    budget: 14500000,
    manager: 'DT Shadow',
    playStyle: 'Presiï¿½n alta',
    primaryColor: '#374151',
    secondaryColor: '#111827',
    description: 'Equipo misterioso y efectivo. Especialistas en presionar y recuperar rï¿½pido.',
    titles: [],
    reputation: 69,
    fanBase: 5600
  },

  // club17 â†’ Nacional
  {
    id: 'club17',
    name: 'Granate',
    logo: '/Logos_Clubes/Liga A/granate.png',
    foundedYear: 2023,
    stadium: 'Bear Cave',
    budget: 26500000,
    manager: 'DT Titanium',
    playStyle: 'Contraataque',
    primaryColor: '#6b7280',
    secondaryColor: '#4b5563',
    description: 'Equipo fuerte y resistente. Especialistas en contraataques potentes.',
    titles: [],
    reputation: 87,
    fanBase: 11500
  },

  // club18 â†’ La Boca del Sapo
  {
    id: 'club18',
    name: 'Jackson FC',
    logo: '/Logos_Clubes/Liga D/jacksonfc.png',
    foundedYear: 2023,
    stadium: 'Frog Pond',
    budget: 2000000,
    manager: 'DT Frog',
    playStyle: 'Ofensivo',
    primaryColor: '#22c55e',
    secondaryColor: '#16a34a',
    description: 'Equipo imprevisible y tï¿½ctico. Saltan al ataque cuando menos lo esperas.',
    titles: [],
    reputation: 58,
    fanBase: 2200
  },

  // club19 â†’ Los Guerreros del Rosario
  {
    id: 'club19',
    name: 'Kod FC',
    logo: '/Logos_Clubes/Liga A/kodfc.png',
    foundedYear: 2023,
    stadium: 'Devil\'s Lair',
    budget: 4500000,
    manager: 'DT Ruby',
    playStyle: 'Vertical',
    primaryColor: '#b91c1c',
    secondaryColor: '#991b1b',
    description: 'Equipo apasionado y agresivo. Especialistas en juego directo y vertical.',
    titles: [],
    reputation: 59,
    fanBase: 2600
  },

  // club20 â†’ La Cumbre FC
  {
    id: 'club20',
    name: 'La Barraca',
    logo: '/Logos_Clubes/Liga C/labarraca.png',
    foundedYear: 2023,
    stadium: 'Shark Tank',
    budget: 8500000,
    manager: 'DT Silver',
    playStyle: 'Defensivo',
    primaryColor: '#0ea5e9',
    secondaryColor: '#0284c7',
    description: 'Equipo depredador y efectivo. Especialistas en defender y contraatacar.',
    titles: [],
    reputation: 63,
    fanBase: 3800
  },

  // club21 â†’ La Barraca
  {
    id: 'club21',
    name: 'La Cuarta',
    logo: '/Logos_Clubes/Liga C/lacuarta.png',
    foundedYear: 2023,
    stadium: 'Eagle Nest',
    budget: 10500000,
    manager: 'DT Iron',
    playStyle: 'Total',
    primaryColor: '#059669',
    secondaryColor: '#064e3b',
    description: 'Equipo fuerte y determinado. Fï¿½tbol total con ï¿½nfasis en lo colectivo.',
    titles: [],
    reputation: 65,
    fanBase: 4400
  },

  // club22 â†’ La Cuarta
  {
    id: 'club22',
    name: 'La Cumbre FC',
    logo: '/Logos_Clubes/Liga B/lacumbre.png',
    foundedYear: 2023,
    stadium: 'Phoenix Stadium',
    budget: 9500000,
    manager: 'DT Phoenix',
    playStyle: 'Ofensivo',
    primaryColor: '#ea580c',
    secondaryColor: '#9a3412',
    description: 'Club que renace de sus cenizas. Especialistas en remontadas ï¿½picas.',
    titles: [],
    reputation: 64,
    fanBase: 4100
  },

  // club23 â†’ San Martin de Tolosa
  {
    id: 'club23',
    name: 'La Tobyneta',
    logo: '/Logos_Clubes/Liga A/latobyneta.png',
    foundedYear: 2023,
    stadium: 'Cloud Arena',
    budget: 17500000,
    manager: 'DT Cloud',
    playStyle: 'Vertical',
    primaryColor: '#06d6a0',
    secondaryColor: '#10b981',
    description: 'Equipo ligero y rï¿½pido como la nube. Especializados en ataques relï¿½mpago y transiciones.',
    titles: [],
    reputation: 76,
    fanBase: 7200
  },

  // club24 → Liga de Quito
  {
    id: 'club24',
    name: 'Liga de Quito',
    logo: '/Logos_Clubes/Liga D/ligadequito.png',
    foundedYear: 2023,
    stadium: 'Raven\'s Nest',
    budget: 6500000,
    manager: 'DT Midnight',
    playStyle: 'Presiï¿½n alta',
    primaryColor: '#1f2937',
    secondaryColor: '#0f172a',
    description: 'Equipo misterioso y nocturno. Especialistas en presionar en campo rival.',
    titles: [],
    reputation: 61,
    fanBase: 3200
  },

  // club25 â†’ Deportes Provincial Osorno
  {
    id: 'club25',
    name: 'Liverpool',
    logo: '/Logos_Clubes/Liga C/liverpool.png',
    foundedYear: 2023,
    stadium: 'Galactic Arena',
    budget: 24000000,
    manager: 'DT Galaxy',
    playStyle: 'Total',
    primaryColor: '#14b8a6',
    secondaryColor: '#1e1e2e',
    description: 'Club ambicioso con un estilo de fï¿½tbol total. Excelente cantera y desarrollo de jugadores.',
    titles: [
      {
        id: 'title6',
        name: 'Supercopa Digital',
        year: 2023,
        type: 'supercup'
      }
    ],
    reputation: 82,
    fanBase: 9000
  },

  // club26 â†’ La Cumbre
  {
    id: 'club26',
    name: 'Los Guerreros del Rosario',
    logo: '/Logos_Clubes/Liga B/losguerrerosderosario.png',
    foundedYear: 2023,
    stadium: 'Mountain Peak',
    budget: 8000000,
    manager: 'DT Summit',
    playStyle: 'Equilibrado',
    primaryColor: '#64748b',
    secondaryColor: '#475569',
    description: 'Equipo que domina las alturas. Especialistas en juego equilibrado y control del medio campo.',
    titles: [],
    reputation: 62,
    fanBase: 3600
  },

  // club27 â†’ Peritas FC
  {
    id: 'club27',
    name: 'Los Terribles FC',
    logo: '/Logos_Clubes/Liga A/losterriblesfc.png',
    foundedYear: 2023,
    stadium: 'Carbon Arena',
    budget: 23500000,
    manager: 'DT Carbon',
    playStyle: 'Defensivo',
    primaryColor: '#262626',
    secondaryColor: '#525252',
    description: 'Equipo sï¿½lido y resistente. Especialistas en defensa organizada.',
    titles: [],
    reputation: 85,
    fanBase: 10500
  },

  // club28 → Los Villeros del Saca
  {
    id: 'club28',
    name: 'Los Villeros del Saca',
    logo: '/Logos_Clubes/Liga C/losvillerosdesaca.png',
    foundedYear: 2023,
    stadium: 'Aurora Stadium',
    budget: 22500000,
    manager: 'DT Aurora',
    playStyle: 'Ofensivo',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    description: 'Club legendario con tradiciï¿½n ganadora. Especialistas en juego ofensivo y creativo.',
    titles: [
      {
        id: 'title11',
        name: 'Copa Aurora',
        year: 2024,
        type: 'cup'
      }
    ],
    reputation: 86,
    fanBase: 11000
  },

  // club29 â†’ Los Villeros del Saca
  {
    id: 'club29',
    name: 'Lunatics FC',
    logo: '/Logos_Clubes/Liga A/lunaticsfc.png',
    foundedYear: 2023,
    stadium: 'Viper\'s Pit',
    budget: 2500000,
    manager: 'DT Crimson',
    playStyle: 'Total',
    primaryColor: '#dc2626',
    secondaryColor: '#b91c1c',
    description: 'Equipo venenoso y letal. Fï¿½tbol total con ï¿½nfasis en lo colectivo.',
    titles: [],
    reputation: 57,
    fanBase: 2000
  },

  // club30 → CD Señor del Mar Callao
  {
    id: 'club30',
    name: 'CD Señor del Mar Callao',
    logo: '/Logos_Clubes/Liga A/cdsenordelmar.png',
    foundedYear: 2023,
    stadium: 'Emerald Castle',
    budget: 5500000,
    manager: 'DT Emerald',
    playStyle: 'Tiki-Taka',
    primaryColor: '#16a34a',
    secondaryColor: '#15803d',
    description: 'Club elegante y preciso. Especialistas en el toque y la posesiï¿½n.',
    titles: [],
    reputation: 60,
    fanBase: 2900
  },

  // club31 â†’ Universitario de Peru
  {
    id: 'club31',
    name: 'Melgar',
    logo: '/Logos_Clubes/Liga A/melgar.png',
    foundedYear: 2023,
    stadium: 'Phoenix Nest',
    budget: 20500000,
    manager: 'DT Phoenix',
    playStyle: 'Presiï¿½n alta',
    primaryColor: '#be123c',
    secondaryColor: '#dc2626',
    description: 'Club que renace de las cenizas. Especialistas en presiï¿½n alta y recuperaciï¿½n rï¿½pida.',
    titles: [
      {
        id: 'title10',
        name: 'Copa Phoenix',
        year: 2024,
        type: 'cup'
      }
    ],
    reputation: 82,
    fanBase: 8700
  },

  // club32 â†’ La Barraca
  {
    id: 'club32',
    name: 'Nacional',
    logo: '/Logos_Clubes/Liga B/nacional.png',
    foundedYear: 2023,
    stadium: 'Fortress Wall',
    budget: 11000000,
    manager: 'DT Stone',
    playStyle: 'Defensivo',
    primaryColor: '#78716c',
    secondaryColor: '#57534e',
    description: 'Defensa impenetrable como una muralla. Especialistas en mantener el cero en su arco.',
    titles: [],
    reputation: 66,
    fanBase: 4600
  },

  // club33 → Peñarol
  {
    id: 'club33',
    name: 'Peñarol',
    logo: '/Logos_Clubes/Liga C/penarol.png',
    foundedYear: 2023,
    stadium: 'Divine Temple',
    budget: 15000000,
    manager: 'DT Divine',
    playStyle: 'Equilibrado',
    primaryColor: '#fbbf24',
    secondaryColor: '#f59e0b',
    description: 'Club con poderes divinos. Equilibrio perfecto entre ataque y defensa.',
    titles: [],
    reputation: 70,
    fanBase: 5800
  },

  // club34 â†’ Quilmes
  {
    id: 'club34',
    name: 'Peritas FC',
    logo: '/Logos_Clubes/Liga C/peritasfc.png',
    foundedYear: 2023,
    stadium: 'Plasma Stadium',
    budget: 19000000,
    manager: 'DT Plasma',
    playStyle: 'Tiki-Taka',
    primaryColor: '#ff4500',
    secondaryColor: '#ea580c',
    description: 'Club ardiente y tï¿½cnico. Especialistas en el toque y la posesiï¿½n.',
    titles: [],
    reputation: 82,
    fanBase: 9000
  },

  // club35 â†’ River Plate
  {
    id: 'club35',
    name: 'Pibe de Oro',
    logo: '/Logos_Clubes/Liga D/pibedeoro.png',
    foundedYear: 2023,
    stadium: 'Cyber Nest',
    budget: 16000000,
    manager: 'DT Cyber C',
    playStyle: 'Contraataque',
    primaryColor: '#00ff00',
    secondaryColor: '#16a34a',
    description: 'Club cibernï¿½tico y letal. Especialistas en contraataques rï¿½pidos.',
    titles: [],
    reputation: 80,
    fanBase: 8000
  },

  // club36 â†’ La Cuarta
  {
    id: 'club36',
    name: 'La Boca del Sapo',
    logo: '/Logos_Clubes/Liga B/labocadelsapo.png',
    foundedYear: 2023,
    stadium: 'Fourth Dimension',
    budget: 10000000,
    manager: 'DT Quantum',
    playStyle: 'Ofensivo',
    primaryColor: '#8b5cf6',
    secondaryColor: '#7c3aed',
    description: 'Equipo multidimensional. Juegan en otra dimensiï¿½n del fï¿½tbol.',
    titles: [],
    reputation: 65,
    fanBase: 4300
  },

  // club37 â†’ Atlanta
  {
    id: 'club37',
    name: 'Quilmes',
    logo: '/Logos_Clubes/Liga D/quilmes.png',
    foundedYear: 2023,
    stadium: 'Estadio Buffer',
    budget: 18000000,
    manager: 'DT Defensor',
    playStyle: 'Defensivo',
    primaryColor: '#a855f7',
    secondaryColor: '#111111',
    description: 'Conocido por su sï¿½lida defensa y juego tï¿½ctico. Difï¿½cil de vencer en casa.',
    titles: [],
    reputation: 75,
    fanBase: 7200
  },

  // club38 â†’ Sporting Cristal
  {
    id: 'club38',
    name: 'Real Madrid',
    logo: '/Logos_Clubes/Liga A/realmadrid.png',
    foundedYear: 2023,
    stadium: 'Matrix Colosseum',
    budget: 21500000,
    manager: 'DT Matrix',
    playStyle: 'Total',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    description: 'Club que domina la realidad del fï¿½tbol. Especialistas en controlar todos los aspectos del juego.',
    titles: [
      {
        id: 'title8',
        name: 'Supercopa Matrix',
        year: 2024,
        type: 'supercup'
      }
    ],
    reputation: 84,
    fanBase: 9200
  },

  // club39 â†’ Riverpool
  {
    id: 'club39',
    name: 'River Plate',
    logo: '/Logos_Clubes/Liga C/riverplate.png',
    foundedYear: 2023,
    stadium: 'Digital Lair',
    budget: 14500000,
    manager: 'DT Digital',
    playStyle: 'Total',
    primaryColor: '#ff6600',
    secondaryColor: '#ea580c',
    description: 'Club digital y completo. Especialistas en fï¿½tbol total moderno.',
    titles: [],
    reputation: 79,
    fanBase: 7500
  },

  // club40 â†’ Comando Sur
  {
    id: 'club40',
    name: 'Riverpool',
    logo: '/Logos_Clubes/Liga B/riverpool.png',
    foundedYear: 2023,
    stadium: 'Server Stadium',
    budget: 16000000,
    manager: 'DT Connect',
    playStyle: 'Contraataque',
    primaryColor: '#eab308',
    secondaryColor: '#0f172a',
    description: 'Club que espera al rival y aprovecha los espacios. Especialista en contragolpes letales.',
    titles: [],
    reputation: 74,
    fanBase: 7000
  },

  // club41 â†’ Pibe de Oro
  {
    id: 'club41',
    name: 'Sahur FC',
    logo: '/Logos_Clubes/Liga B/tuntunsahur.png',
    foundedYear: 2023,
    stadium: 'Neon Aquarium',
    budget: 22000000,
    manager: 'DT Neon Shark',
    playStyle: 'Equilibrado',
    primaryColor: '#00ffff',
    secondaryColor: '#0891b2',
    description: 'Club colorido y equilibrado. Especialistas en juego versï¿½til.',
    titles: [],
    reputation: 84,
    fanBase: 10000
  },

  // club42 â†’ Liga de Quito
  {
    id: 'club42',
    name: 'San Francisco',
    logo: '/Logos_Clubes/Liga D/sanfrancisco.png',
    foundedYear: 2023,
    stadium: 'Eagle\'s Peak',
    budget: 7000000,
    manager: 'DT Andean',
    playStyle: 'Vertical',
    primaryColor: '#374151',
    secondaryColor: '#1f2937',
    description: 'Club de las alturas andinas. Juega con la intensidad de la montaï¿½a.',
    titles: [],
    reputation: 62,
    fanBase: 3400
  },

  // club43 → Jackson FC
  {
    id: 'club43',
    name: 'San Martin de Tolosa',
    logo: '/Logos_Clubes/Liga B/sanmartindetolosa.png',
    foundedYear: 2023,
    stadium: 'Lightning Arena',
    budget: 12500000,
    manager: 'DT Lightning',
    playStyle: 'Vertical',
    primaryColor: '#facc15',
    secondaryColor: '#a16207',
    description: 'Equipo r�pido y electrizante. Especialistas en ataques por bandas.',
    titles: [],
    reputation: 67,
    fanBase: 5000
  },

  // club44 â†’ El Santo Tucumano
  {
    id: 'club44',
    name: 'Señor de los Milagros',
    logo: '/Logos_Clubes/Liga C/srdelosmilagros.png',
    foundedYear: 2023,
    stadium: 'Sacred Mountain',
    budget: 20000000,
    manager: 'DT Sacred',
    playStyle: 'Contraataque',
    primaryColor: '#92400e',
    secondaryColor: '#78350f',
    description: 'Club sagrado de las montaï¿½as. Fuerza espiritual en cada jugada.',
    titles: [],
    reputation: 75,
    fanBase: 7200
  },

  // club45 â†’ Sporting Cristal
  {
    id: 'club45',
    name: 'Sporting Cristal',
    logo: '/Logos_Clubes/Liga D/sportingcristal.png',
    foundedYear: 2023,
    stadium: 'Crystal Palace',
    budget: 21000000,
    manager: 'DT Crystal',
    playStyle: 'Posesiï¿½n',
    primaryColor: '#06b6d4',
    secondaryColor: '#0891b2',
    description: 'Club transparente y preciso. Cristalino en su estilo de juego.',
    titles: [],
    reputation: 83,
    fanBase: 9100
  },

  // club46 â†’ Club Atletico Ituzaingo
  {
    id: 'club46',
    name: 'U de Chile',
    logo: '/Logos_Clubes/Liga B/universidaddechile.png',
    foundedYear: 2023,
    stadium: 'Cyber Fortress',
    budget: 19000000,
    manager: 'DT Cyber',
    playStyle: 'Tiki-Taka',
    primaryColor: '#06b6d4',
    secondaryColor: '#475569',
    description: 'Club con filosofï¿½a de toque y posesiï¿½n extrema. Especialistas en dominar el centro del campo.',
    titles: [],
    reputation: 78,
    fanBase: 7800
  },

  // club47 â†’ Beast FC
  {
    id: 'club47',
    name: 'Union Milagro',
    logo: '/Logos_Clubes/Liga D/unionmilagrofc.png',
    foundedYear: 2023,
    stadium: 'Error Arena',
    budget: 17000000,
    manager: 'DT Glitch',
    playStyle: 'Presiï¿½n alta',
    primaryColor: '#84cc16',
    secondaryColor: '#1e293b',
    description: 'Club imprevisible conocido por su intensa presiï¿½n y recuperaciï¿½n rï¿½pida del balï¿½n.',
    titles: [
      {
        id: 'title5',
        name: 'Copa PES',
        year: 2023,
        type: 'cup'
      }
    ],
    reputation: 76,
    fanBase: 7500
  },

  // club48 â†’ Universitario
  {
    id: 'club48',
    name: 'Universitario de Peru',
    logo: '/Logos_Clubes/Liga A/universitariodeperu.png',
    foundedYear: 2023,
    stadium: 'Academic Temple',
    budget: 20000000,
    manager: 'DT Academic',
    playStyle: 'Equilibrado',
    primaryColor: '#7c2d12',
    secondaryColor: '#a16207',
    description: 'Club universitario con sabidurï¿½a tï¿½ctica. Equilibrio acadï¿½mico en el campo.',
    titles: [],
    reputation: 81,
    fanBase: 8600
  }
];

// Corrección de datos específicos tras la definición
// Asegurar nombre y logo para club28 según requerimiento
try {
  const idx28 = clubs.findIndex(c => c.id === 'club28');
  if (idx28 >= 0) {
    clubs[idx28].name = 'Los Villeros del Saca';
    clubs[idx28].logo = '/Logos_Clubes/Liga C/losvillerosdesaca.png';
  }
} catch {}

// Exportaciones necesarias para el resto del código
export const players: Player[] = [
  // Los datos de jugadores se generarían dinámicamente
  // Por ahora vacío - los jugadores se generan en playerService.ts
];

export const tournaments: any[] = [
  // Los datos de torneos se definirían aquí
  // Por ahora vacío
];

export const leagueStandings: any[] = [
  // Clasificaciones de liga
];

export const marketStatus: any = {
  // Estado del mercado
};

// Tienda eliminada: export storeItems removido

export const faqs: any[] = [
  // Preguntas frecuentes
];

export const newsItems: any[] = [
  // Noticias
];

export const mediaItems: any[] = [
  // Elementos multimedia
];

export const posts: any[] = [
  // Publicaciones
];

export const offers: any[] = [
  // Ofertas
];

export const transfers: any[] = [
  // Transferencias
];
