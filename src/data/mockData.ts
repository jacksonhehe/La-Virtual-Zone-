import {
  Tournament,
  Match,
  Transfer,
  TransferOffer,
  NewsItem,
  MediaItem,
  Post,
  Standing,
  FAQ,
  StoreItem,
  DtClub,
  DtFixture,
  DtMarket,
  DtObjectives,
  DtTask,
  DtEvent
} from '../types';
import { Club, Player } from '../types/shared';
import { slugify } from '../utils/slugify';

// Mock Clubs Data
export const clubs: Club[] = [
  {
    id: 'club1',
    slug: slugify('Rayo Digital FC'),
    name: 'Rayo Digital FC',
    logo: 'https://ui-avatars.com/api/?name=RD&background=ef4444&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Estadio Cyber Arena',
    budget: 25000000,
    manager: 'coach',
    playStyle: 'Posesión',
    primaryColor: '#ef4444',
    secondaryColor: '#000000',
    description: 'Club fundador de la Liga Master, conocido por su juego de posesión y formación de talento joven.',
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
    fanBase: 10000,
    morale: 75
  },
  {
    id: 'club2',
    slug: slugify('Atlético Pixelado'),
    name: 'Atlético Pixelado',
    logo: 'https://ui-avatars.com/api/?name=AP&background=3b82f6&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Pixel Arena',
    budget: 22000000,
    manager: 'jackso',
    playStyle: 'Contraataque',
    primaryColor: '#3b82f6',
    secondaryColor: '#ffffff',
    description: 'Club histórico con un estilo de juego agresivo y rápido, especializado en contraataques letales.',
    titles: [
      {
        id: 'title3',
        name: 'Supercopa Digital',
        year: 2024,
        type: 'supercup'
      }
    ],
    reputation: 80,
    fanBase: 8500,
    morale: 70
  },
  {
    id: 'club3',
    slug: slugify('Defensores del Lag'),
    name: 'Defensores del Lag',
    logo: 'https://ui-avatars.com/api/?name=DL&background=a855f7&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Estadio Buffer',
    budget: 18000000,
    manager: 'DT Defensor',
    playStyle: 'Defensivo',
    primaryColor: '#a855f7',
    secondaryColor: '#111111',
    description: 'Conocido por su sólida defensa y juego táctico. Difícil de vencer en casa.',
    titles: [],
    reputation: 75,
    fanBase: 7200,
    morale: 65
  },
  {
    id: 'club4',
    slug: slugify('Neón FC'),
    name: 'Neón FC',
    logo: 'https://ui-avatars.com/api/?name=NFC&background=ec4899&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Estadio Luminoso',
    budget: 23000000,
    manager: 'DT Neon',
    playStyle: 'Ofensivo',
    primaryColor: '#ec4899',
    secondaryColor: '#00b3ff',
    description: 'Club con estilo de juego espectacular y ofensivo. Conocido por sus fichajes estrella.',
    titles: [
      {
        id: 'title4',
        name: 'Liga Master',
        year: 2024,
        type: 'league'
      }
    ],
    reputation: 83,
    fanBase: 9500,
    morale: 80
  },
  {
    id: 'club5',
    slug: slugify('Haxball United'),
    name: 'Haxball United',
    logo: 'https://ui-avatars.com/api/?name=HU&background=f97316&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Hax Stadium',
    budget: 20000000,
    manager: 'DT Hax',
    playStyle: 'Equilibrado',
    primaryColor: '#f97316',
    secondaryColor: '#334155',
    description: 'Club que combina tradición y modernidad. Juego equilibrado y sólido en todas las líneas.',
    titles: [],
    reputation: 77,
    fanBase: 8000,
    morale: 68
  },
  {
    id: 'club6',
    slug: slugify('Glitchers 404'),
    name: 'Glitchers 404',
    logo: 'https://ui-avatars.com/api/?name=404&background=84cc16&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Error Arena',
    budget: 17000000,
    manager: 'DT Glitch',
    playStyle: 'Presión alta',
    primaryColor: '#84cc16',
    secondaryColor: '#1e293b',
    description: 'Club imprevisible conocido por su intensa presión y recuperación rápida del balón.',
    titles: [
      {
        id: 'title5',
        name: 'Copa PES',
        year: 2023,
        type: 'cup'
      }
    ],
    reputation: 76,
    fanBase: 7500,
    morale: 72
  },
  {
    id: 'club7',
    slug: slugify('Cyber Warriors'),
    name: 'Cyber Warriors',
    logo: 'https://ui-avatars.com/api/?name=CW&background=06b6d4&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Cyber Fortress',
    budget: 19000000,
    manager: 'DT Cyber',
    playStyle: 'Tiki-Taka',
    primaryColor: '#06b6d4',
    secondaryColor: '#475569',
    description: 'Club con filosofía de toque y posesión extrema. Especialistas en dominar el centro del campo.',
    titles: [],
    reputation: 78,
    fanBase: 7800,
    morale: 77
  },
  {
    id: 'club8',
    slug: slugify('Binary Strikers'),
    name: 'Binary Strikers',
    logo: 'https://ui-avatars.com/api/?name=BS&background=7c3aed&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Binary Park',
    budget: 21000000,
    manager: 'DT Binary',
    playStyle: 'Vertical',
    primaryColor: '#7c3aed',
    secondaryColor: '#334155',
    description: 'Equipo de juego vertical y directo. Especializado en transiciones rápidas y ataques por banda.',
    titles: [],
    reputation: 79,
    fanBase: 8200,
    morale: 74
  },
  {
    id: 'club9',
    slug: slugify('Connection FC'),
    name: 'Connection FC',
    logo: 'https://ui-avatars.com/api/?name=CFC&background=eab308&color=fff&size=128&bold=true',
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
    fanBase: 7000,
    morale: 60
  },
  {
    id: 'club10',
    slug: slugify('Pixel Galaxy'),
    name: 'Pixel Galaxy',
    logo: 'https://ui-avatars.com/api/?name=PG&background=14b8a6&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Galactic Arena',
    budget: 24000000,
    manager: 'DT Galaxy',
    playStyle: 'Total',
    primaryColor: '#14b8a6',
    secondaryColor: '#1e1e2e',
    description: 'Club ambicioso con un estilo de fútbol total. Excelente cantera y desarrollo de jugadores.',
    titles: [
      {
        id: 'title6',
        name: 'Supercopa Digital',
        year: 2023,
        type: 'supercup'
      }
    ],
    reputation: 82,
    fanBase: 9000,
    morale: 85
  },
  {
    id: 'club11',
    slug: slugify('Real Madrid'),
    name: 'Real Madrid',
    logo: 'https://ui-avatars.com/api/?name=RM&background=ffffff&color=000000&size=128&bold=true',
    foundedYear: 1902,
    stadium: 'Santiago Bernabéu',
    budget: 60000000,
    manager: 'Ancelotti',
    playStyle: 'Posesión',
    primaryColor: '#ffffff',
    secondaryColor: '#00529f',
    description: 'Uno de los clubes más laureados del mundo, conocido por su estilo ofensivo y mentalidad ganadora.',
    titles: [
      {
        id: 'title7',
        name: 'Liga',
        year: 2024,
        type: 'league'
      },
      {
        id: 'title8',
        name: 'Champions',
        year: 2024,
        type: 'cup'
      }
    ],
    reputation: 95,
    fanBase: 20000,
    morale: 90
  },
  {
    id: 'club12',
    slug: slugify('Quantum Rangers'),
    name: 'Quantum Rangers',
    logo: 'https://ui-avatars.com/api/?name=QR&background=ff5722&color=fff&size=128&bold=true',
    foundedYear: 2023,
    stadium: 'Quantum Dome',
    budget: 21000000,
    manager: 'DT Quantum',
    playStyle: 'Presión',
    primaryColor: '#ff5722',
    secondaryColor: '#212121',
    description: 'Club experimental con énfasis en la analítica y alta presión.',
    titles: [],
    reputation: 80,
    fanBase: 7500,
    morale: 70
  }
];

// Function to generate players for each club
function generatePlayers(): Player[] {
  const positions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST'];
  const nationalities = ['España', 'Argentina', 'Brasil', 'Francia', 'Inglaterra', 'Portugal', 'Italia', 'Alemania', 'Holanda', 'Colombia', 'México', 'Uruguay'];
  const players: Player[] = [];
  
  clubs.forEach(club => {
    // Generate 20 players per club
    for (let i = 1; i <= 20; i++) {
      const position = positions[Math.floor(Math.random() * positions.length)];
      const nationality = nationalities[Math.floor(Math.random() * nationalities.length)];
      const overall = 70 + Math.floor(Math.random() * 20);
      const transferListed = Math.random() < 0.25; // 25% chance of being listed
      const transferValue = (overall * 100000) + Math.floor(Math.random() * 1000000);
      
      const firstName = ['Alex', 'Carlos', 'Diego', 'Javier', 'Lucas', 'Marcos', 'Pablo', 'Sergio', 'Toni', 'Victor', 'Raúl', 'Fernando'][Math.floor(Math.random() * 12)];
      const lastName = ['García', 'Rodríguez', 'Hernández', 'López', 'Martínez', 'González', 'Pérez', 'Sánchez', 'Fernández', 'Silva', 'Torres', 'Moreno'][Math.floor(Math.random() * 12)];
      
      players.push({
        id: `player${players.length + 1}`,
        name: `${firstName} ${lastName}`,
        age: 18 + Math.floor(Math.random() * 17),
        position,
        nationality,
        dorsal: i,
        club: club.name,
        marketValue: transferValue,
        clubId: club.id,
        overall,
        potential: overall + Math.floor(Math.random() * 10),
        transferListed,
        matches: 10 + Math.floor(Math.random() * 10),
        transferValue,
        value: transferValue,
        image: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=1e293b&color=fff&size=128`,
        attributes: {
          pace: 60 + Math.floor(Math.random() * 30),
          shooting: 60 + Math.floor(Math.random() * 30),
          passing: 60 + Math.floor(Math.random() * 30),
          dribbling: 60 + Math.floor(Math.random() * 30),
          defending: 60 + Math.floor(Math.random() * 30),
          physical: 60 + Math.floor(Math.random() * 30)
        },
        contract: {
          expires: `202${5 + Math.floor(Math.random() * 3)}-05-30`,
          salary: (overall * 1000) + Math.floor(Math.random() * 10000)
        },
        form: 1 + Math.floor(Math.random() * 5),
        goals: Math.floor(Math.random() * 10),
        assists: Math.floor(Math.random() * 8),
        appearances: 10 + Math.floor(Math.random() * 10)
      });
    }
  });
  
  return players;
}

// Generate players
export const players = generatePlayers();

// Add legendary player Cristiano Ronaldo to the generated list
players.push({
  id: `player${players.length + 1}`,
  name: 'Cristiano Ronaldo',
  age: 39,
  position: 'ST',
  nationality: 'Portugal',
  dorsal: 7,
  clubId: 'club11',
  club: 'Real Madrid',
  overall: 90,
  potential: 90,
  transferListed: false,
  matches: 0,
  transferValue: 45000000,
  value: 45000000,
  marketValue: 45000000,
  image: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg',
  attributes: {
    pace: 89,
    shooting: 93,
    passing: 82,
    dribbling: 88,
    defending: 35,
    physical: 80
  },
  contract: {
    expires: '2025-06-30',
    salary: 2000000
  },
  form: 5,
  goals: 0,
  assists: 0,
  appearances: 0
});

// Function to generate matches for a tournament
function generateMatches(teams: string[], tournamentId: string, preseason: boolean = false): Match[] {
  const matches: Match[] = [];
  const rounds = preseason ? 1 : 2; // Single round for preseason, double for regular season
  const pastMatches = 6; // Number of past matches (with results)
  
  // Calculate date for first match
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (pastMatches * 7)); // Start X weeks ago
  
  let matchId = 1;
  
  for (let round = 1; round <= rounds; round++) {
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Home and away matches
        const homeTeam = round === 1 ? teams[i] : teams[j];
        const awayTeam = round === 1 ? teams[j] : teams[i];
        
        // Calculate match date (1 week between rounds)
        const matchDate = new Date(startDate);
        matchDate.setDate(startDate.getDate() + (matchId - 1) * 7);
        
        // Determine if match is in the past
        const isPastMatch = matchId <= pastMatches;
        
        // Create the match
        const match: Match = {
          id: `match${matchId}`,
          tournamentId,
          round: Math.ceil(matchId / (teams.length * (teams.length - 1) / 2)),
          date: matchDate.toISOString(),
          homeTeam,
          awayTeam,
          status: isPastMatch ? 'finished' : 'scheduled'
        };
        
        // Add scores for past matches
        if (isPastMatch) {
          match.homeScore = Math.floor(Math.random() * 5);
          match.awayScore = Math.floor(Math.random() * 5);
          
          // Generate scorers if there are goals
          match.scorers = [];
          
          // Home team scorers
          if (match.homeScore > 0) {
            const homeClub = clubs.find(c => c.name === homeTeam);
            if (homeClub) {
              const clubPlayers = players.filter(p => p.clubId === homeClub.id && ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
              for (let g = 0; g < match.homeScore; g++) {
                const scorer = clubPlayers[Math.floor(Math.random() * clubPlayers.length)];
                if (scorer) {
                  match.scorers.push({
                    playerId: scorer.id,
                    playerName: scorer.name,
                    clubId: homeClub.id,
                    minute: 1 + Math.floor(Math.random() * 90)
                  });
                }
              }
            }
          }
          
          // Away team scorers
          if (match.awayScore > 0) {
            const awayClub = clubs.find(c => c.name === awayTeam);
            if (awayClub) {
              const clubPlayers = players.filter(p => p.clubId === awayClub.id && ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
              for (let g = 0; g < match.awayScore; g++) {
                const scorer = clubPlayers[Math.floor(Math.random() * clubPlayers.length)];
                if (scorer) {
                  match.scorers.push({
                    playerId: scorer.id,
                    playerName: scorer.name,
                    clubId: awayClub.id,
                    minute: 1 + Math.floor(Math.random() * 90)
                  });
                }
              }
            }
          }
          
          // Sort scorers by minute
          match.scorers.sort((a, b) => a.minute - b.minute);
        }
        
        matches.push(match);
        matchId++;
      }
    }
  }
  
  return matches;
}

// Tournament data
export const tournaments: Tournament[] = [
  {
    id: 'tournament1',
    name: 'Liga Master 2025',
    type: 'league',
    logo: 'https://ui-avatars.com/api/?name=LM&background=7f39fb&color=fff&size=128&bold=true',
    startDate: '2025-01-15',
    endDate: '2025-05-30',
    status: 'active',
    teams: clubs.map(club => club.name),
    rounds: 18,
    matches: [],
    results: [],
    description: 'La competición principal de La Virtual Zone. Liga regular con enfrentamientos ida y vuelta entre los 10 equipos participantes.'
  },
  {
    id: 'tournament2',
    name: 'Copa PES 2025',
    type: 'cup',
    logo: 'https://ui-avatars.com/api/?name=CP&background=f97316&color=fff&size=128&bold=true',
    startDate: '2025-02-10',
    endDate: '2025-04-20',
    status: 'upcoming',
    teams: clubs.map(club => club.name),
    rounds: 4,
    matches: [],
    results: [],
    description: 'Torneo eliminatorio con emparejamientos por sorteo. El ganador obtiene plaza para la Supercopa Digital.'
  },
  {
    id: 'tournament3',
    name: 'Supercopa Digital 2025',
    type: 'cup',
    logo: 'https://ui-avatars.com/api/?name=SD&background=ec4899&color=fff&size=128&bold=true',
    startDate: '2025-06-15',
    endDate: '2025-06-15',
    status: 'upcoming',
    teams: ['Rayo Digital FC', 'Neón FC'],
    rounds: 1,
    matches: [],
    results: [],
    description: 'Partido único entre el campeón de Liga y el campeón de Copa. El evento más prestigioso de la temporada.'
  },
  {
    id: 'tournament4',
    name: 'Torneo Pretemporada 2025',
    type: 'friendly',
    logo: 'https://ui-avatars.com/api/?name=TP&background=a855f7&color=fff&size=128&bold=true',
    startDate: '2024-12-01',
    endDate: '2024-12-20',
    status: 'finished',
    teams: clubs.slice(0, 8).map(club => club.name),
    rounds: 3,
    matches: [],
    results: [],
    winner: 'Rayo Digital FC',
    topScorer: {
      id: 'topscorer1',
      playerId: 'player1',
      playerName: 'Carlos García',
      clubId: 'club1',
      clubName: 'Rayo Digital FC',
      goals: 7
    },
    description: 'Torneo amistoso previo al inicio de la temporada oficial. Sirve como preparación para los equipos.'
  }
];

// Generate matches for each tournament
tournaments.forEach(tournament => {
  tournament.matches = generateMatches(
    tournament.teams,
    tournament.id,
    tournament.type === 'friendly'
  );
});

// Generate past transfers
export const transfers: Transfer[] = [
  {
    id: 'transfer1',
    playerId: 'player21',
    playerName: 'Diego López',
    fromClub: 'Atlético Pixelado',
    toClub: 'Rayo Digital FC',
    fee: 8500000,
    date: '2024-12-15'
  },
  {
    id: 'transfer2',
    playerId: 'player42',
    playerName: 'Marcos Rodríguez',
    fromClub: 'Neón FC',
    toClub: 'Glitchers 404',
    fee: 12000000,
    date: '2024-12-18'
  },
  {
    id: 'transfer3',
    playerId: 'player63',
    playerName: 'Pablo Hernández',
    fromClub: 'Defensores del Lag',
    toClub: 'Cyber Warriors',
    fee: 5800000,
    date: '2024-12-20'
  },
  {
    id: 'transfer4',
    playerId: 'player84',
    playerName: 'Sergio Martínez',
    fromClub: 'Binary Strikers',
    toClub: 'Haxball United',
    fee: 9200000,
    date: '2024-12-23'
  },
  {
    id: 'transfer5',
    playerId: 'player105',
    playerName: 'Toni González',
    fromClub: 'Connection FC',
    toClub: 'Pixel Galaxy',
    fee: 7600000,
    date: '2024-12-26'
  }
];

// Pending transfer offers
export const offers: TransferOffer[] = [
  {
    id: 'offer1',
    playerId: 'player5',
    playerName: 'Alex Torres',
    fromClub: 'Rayo Digital FC',
    toClub: 'Atlético Pixelado',
    amount: 9800000,
    date: '2025-01-05',
    status: 'pending',
    userId: '2'
  },
  {
    id: 'offer2',
    playerId: 'player26',
    playerName: 'Victor Pérez',
    fromClub: 'Atlético Pixelado',
    toClub: 'Neón FC',
    amount: 11500000,
    date: '2025-01-06',
    status: 'accepted',
    userId: '2'
  },
  {
    id: 'offer3',
    playerId: 'player47',
    playerName: 'Lucas Sánchez',
    fromClub: 'Neón FC',
    toClub: 'Defensores del Lag',
    amount: 7800000,
    date: '2025-01-07',
    status: 'rejected',
    userId: '2'
  },
  {
    id: 'offer4',
    playerId: 'player52',
    playerName: 'Martín Pérez',
    fromClub: 'Defensores del Lag',
    toClub: 'Real Madrid',
    amount: 45000000,
    date: '2025-01-08',
    status: 'pending',
    userId: '3'
  },
  {
    id: 'offer5',
    playerId: 'player10',
    playerName: 'Miguel Delgado',
    fromClub: 'Rayo Digital FC',
    toClub: 'Glitchers 404',
    amount: 5000000,
    date: '2025-01-09',
    status: 'pending',
    userId: 'user2'
  },
  {
    id: 'offer6',
    playerId: 'player63',
    playerName: 'Pablo Hernández',
    fromClub: 'Defensores del Lag',
    toClub: 'Glitchers 404',
    amount: 6200000,
    date: '2025-01-10',
    status: 'pending',
    userId: '8'
  }
];

// Market status
export const marketStatus = true;

// Generate standings based on past matches
export function generateStandings(tournamentId: string): Standing[] {
  const tournament = tournaments.find(t => t.id === tournamentId);
  if (!tournament) return [];
  
  // Initialize standings
  const standings: Record<string, Standing> = {};
  
  tournament.teams.forEach(team => {
    const clubId = clubs.find(c => c.name === team)?.id || '';
    
    standings[team] = {
      clubId,
      clubName: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: [],
      possession: 50,
      cards: 0
    };
  });
  
  // Process finished matches
  tournament.matches
    .filter(match => match.status === 'finished' && match.homeScore !== undefined && match.awayScore !== undefined)
    .forEach(match => {
      const homeTeam = standings[match.homeTeam];
      const awayTeam = standings[match.awayTeam];
      
      if (homeTeam && awayTeam) {
        // Update matches played
        homeTeam.played++;
        awayTeam.played++;
        
        // Update goals
        homeTeam.goalsFor += match.homeScore!;
        homeTeam.goalsAgainst += match.awayScore!;
        awayTeam.goalsFor += match.awayScore!;
        awayTeam.goalsAgainst += match.homeScore!;
        
        // Update results
        if (match.homeScore! > match.awayScore!) {
          // Home win
          homeTeam.won++;
          homeTeam.points += 3;
          awayTeam.lost++;
          homeTeam.form.push('W');
          awayTeam.form.push('L');
        } else if (match.homeScore! < match.awayScore!) {
          // Away win
          awayTeam.won++;
          awayTeam.points += 3;
          homeTeam.lost++;
          homeTeam.form.push('L');
          awayTeam.form.push('W');
        } else {
          // Draw
          homeTeam.drawn++;
          homeTeam.points++;
          awayTeam.drawn++;
          awayTeam.points++;
          homeTeam.form.push('D');
          awayTeam.form.push('D');
        }
        
        // Keep only last 5 form results
        homeTeam.form = homeTeam.form.slice(-5);
        awayTeam.form = awayTeam.form.slice(-5);
      }
    });
  
  // Convert to array and sort
  const standingsArray = Object.values(standings);
  
  standingsArray.sort((a, b) => {
    // Sort by points
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    
    // Sort by goal difference
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (aGD !== bGD) {
      return bGD - aGD;
    }
    
    // Sort by goals scored
    if (a.goalsFor !== b.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    
    // Sort alphabetically as last resort
    return a.clubName.localeCompare(b.clubName);
  });

  // Add synthetic stats
  standingsArray.forEach(team => {
    team.possession = 45 + Math.floor(Math.random() * 11);
    team.cards = 5 + Math.floor(Math.random() * 20);
  });

  return standingsArray;
}

// Get standings for the main league
export const leagueStandings = generateStandings('tournament1');

// News items
export const newsItems: NewsItem[] = [
  {
    id: 'news1',
    title: 'Comienza la Liga Master 2025',
    content: 'La temporada 2025 de La Virtual Zone ha arrancado oficialmente. 10 clubes compiten por el título en una liga que promete emociones hasta la última jornada.',
    type: 'announcement',
    category: 'Anuncios',
    imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    publishDate: '2025-01-15',
    date: '2025-01-15',
    author: 'Admin',
    featured: true
  },
  {
    id: 'news2',
    title: 'El mercado de fichajes está abierto',
    content: 'Desde hoy los clubes pueden realizar ofertas por jugadores de otros equipos. El mercado permanecerá abierto hasta el 15 de febrero.',
    type: 'announcement',
    category: 'Anuncios',
    imageUrl: 'https://images.unsplash.com/photo-1494178270175-e96de2971df9?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw0fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    publishDate: '2025-01-16',
    date: '2025-01-16',
    author: 'Admin',
    featured: false
  },
  {
    id: 'news3',
    title: 'Diego López ficha por Rayo Digital FC',
    content: 'El delantero ha firmado un contrato de 3 temporadas tras el pago de 8.5 millones. "Estoy emocionado por este nuevo reto", declaró el jugador.',
    type: 'transfer',
    category: 'Fichajes',
    publishDate: '2025-01-05',
    date: '2025-01-05',
    author: 'Admin',
    clubId: 'club1',
    playerId: 'player21',
    featured: false
  },
  {
    id: 'news4',
    title: 'Rayo Digital vence en el derbi',
    content: 'Los rojiblancos se impusieron 3-1 a Atlético Pixelado en un partido vibrante. Diego López, nuevo fichaje, marcó dos goles.',
    type: 'result',
    category: 'Resultados',
    publishDate: '2025-01-20',
    date: '2025-01-20',
    author: 'Admin',
    clubId: 'club1',
    tournamentId: 'tournament1',
    featured: false
  },
  {
    id: 'news5',
    title: 'Rumor: Neón FC tras una estrella de Binary Strikers',
    content: 'Según fuentes cercanas al club, los neonistas estarían dispuestos a pagar hasta 15 millones por un centrocampista de los Strikers.',
    type: 'rumor',
    category: 'Rumores',
    publishDate: '2025-01-22',
    date: '2025-01-22',
    author: 'Admin',
    clubId: 'club4',
    featured: false
  },
  {
    id: 'news6',
    title: 'DT de Glitchers 404: "Vamos a por el título"',
    content: '"Este año tenemos un equipo para luchar arriba. No renunciamos a nada y vamos partido a partido", declaró el técnico tras la victoria 2-0 ante Connection FC.',
    type: 'statement',
    category: 'Declaraciones',
    publishDate: '2025-01-23',
    date: '2025-01-23',
    author: 'Admin',
    clubId: 'club6',
    featured: false
  }
];

// Blog posts
export const posts: Post[] = [
  {
    id: 'post1',
    slug: 'liga-master-2025-arranca',
    title: 'La Liga Master 2025 arranca con emoción',
    excerpt: 'El nuevo campeonato de La Virtual Zone ya está en marcha con diez clubes dispuestos a todo por el título.',
    image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-4.0.3',
    category: 'Noticias',
    author: 'Admin',
    date: '2025-01-15',
    content: '<p>La temporada se perfila como una de las más igualadas desde la fundación de la liga. Cada club ha reforzado su plantilla y se esperan partidos vibrantes.</p>'
  },
  {
    id: 'post2',
    slug: 'analisis-rayo-digital-fc',
    title: 'Análisis táctico de Rayo Digital FC',
    excerpt: 'Desgranamos las claves del juego de posesión que caracteriza al vigente campeón.',
    image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?ixlib=rb-4.0.3',
    category: 'Análisis',
    author: 'Editor',
    date: '2025-01-18',
    content: '<p>El equipo dirigido por coach apuesta por la circulación rápida y la presión tras pérdida. Sus nuevas incorporaciones encajan a la perfección en este sistema.</p>'
  },
  {
    id: 'post3',
    slug: 'rumores-mercado-fichajes',
    title: 'Rumores de fichajes para la temporada',
    excerpt: 'Los clubes se mueven en el mercado y ya suenan nombres importantes para reforzar las plantillas.',
    image: 'https://images.unsplash.com/photo-1521412644187-c49fa049e84d?ixlib=rb-4.0.3',
    category: 'Fichajes',
    author: 'Admin',
    date: '2025-01-20',
    content: '<p>Varias estrellas podrían cambiar de aires antes de que cierre el mercado. Repasamos las operaciones más destacadas que se rumorean en los despachos.</p>'
  },
  {
    id: 'post4',
    slug: 'crece-la-comunidad-virtual',
    title: 'La comunidad de La Virtual Zone sigue creciendo',
    excerpt: 'Cada semana se suman nuevos usuarios que comparten su pasión por el fútbol virtual.',
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3',
    category: 'Comunidad',
    author: 'Editor',
    date: '2025-01-22',
    content: '<p>Foros, torneos y eventos especiales fomentan la participación de los managers. ¡Únete tú también!</p>'
  },
  {
    id: 'post5',
    slug: 'humor-en-la-virtual-zone',
    title: 'Los mejores memes de la jornada',
    excerpt: 'Recopilamos las imágenes más divertidas que dejó la última fecha del campeonato.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?ixlib=rb-4.0.3',
    category: 'Humor',
    author: 'Admin',
    date: '2025-01-24',
    content: '<p>Porque también hay espacio para las risas, compartimos los memes que más triunfaron en redes.</p>'
  }
];

// Gallery media items
export const mediaItems: MediaItem[] = [
  {
    id: 'media1',
    title: 'Gol espectacular de Diego López',
    type: 'clip',
    url: 'https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2025-01-20',
    uploader: 'Admin',
    category: 'Goles',
    likes: 45,
    views: 320,
    tags: ['gol', 'chilena', 'rayo digital'],
    clubId: 'club1',
    playerId: 'player21'
  },
  {
    id: 'media2',
    title: 'Trofeo Liga Master 2024',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1512242712282-774a8bc0d9d3?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512242712282-774a8bc0d9d3?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2024-12-15',
    uploader: 'Admin',
    category: 'Trofeos',
    likes: 38,
    views: 280,
    tags: ['trofeo', 'liga master', 'premio'],
    tournamentId: 'tournament1'
  },
  {
    id: 'media3',
    title: 'Final Copa PES 2024',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1544194215-541c2d3561a4?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544194215-541c2d3561a4?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw1fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2024-11-20',
    uploader: 'Admin',
    category: 'Partidos',
    likes: 52,
    views: 430,
    tags: ['final', 'copa', 'partido completo'],
    tournamentId: 'tournament2'
  },
  {
    id: 'media4',
    title: 'Parada espectacular del portero de Cyber Warriors',
    type: 'clip',
    url: 'https://images.unsplash.com/photo-1554290712-e640351074bd?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554290712-e640351074bd?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwzfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2025-01-18',
    uploader: 'DT Cyber',
    category: 'Paradas',
    likes: 41,
    views: 310,
    tags: ['parada', 'portero', 'cyber warriors'],
    clubId: 'club7'
  },
  {
    id: 'media5',
    title: 'Celebración del título Neón FC',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&fm=webp&ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2024-12-05',
    uploader: 'DT Neon',
    category: 'Celebraciones',
    likes: 64,
    views: 520,
    tags: ['celebración', 'título', 'neón fc'],
    clubId: 'club4'
  },
  {
    id: 'media6',
    title: 'Presentación de la temporada 2025',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    thumbnailUrl: 'https://images.unsplash.com/photo-1556856425-366d6618905d?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0',
    uploadDate: '2025-01-10',
    uploader: 'Admin',
    category: 'Eventos',
    likes: 72,
    views: 650,
    tags: ['presentación', 'temporada', 'liga master'],
    tournamentId: 'tournament1'
  }
];

// FAQs
export const faqs: FAQ[] = [
  {
    id: 'faq1',
    question: '¿Cómo me registro en La Virtual Zone?',
    answer: 'Para registrarte, haz clic en el botón "Crear Cuenta" en la página principal. Completa el formulario con tu correo electrónico, nombre de usuario y contraseña. Una vez registrado, podrás acceder a todas las funciones básicas de la plataforma.',
    category: 'account'
  },
  {
    id: 'faq2',
    question: '¿Cómo puedo obtener un club en la Liga Master?',
    answer: 'Para obtener un club en la Liga Master, debes tener una cuenta con rol de DT. Desde tu panel de usuario, haz clic en "Solicitar club". Si hay plazas disponibles, se te asignará un club. Si no hay cupos, entrarás en lista de espera. Los administradores revisan las solicitudes periódicamente.',
    category: 'league'
  },
  {
    id: 'faq3',
    question: '¿Cómo funciona el mercado de fichajes?',
    answer: 'El mercado de fichajes es el sistema donde los DTs pueden comprar y vender jugadores. Para hacer una oferta, debes tener suficiente presupuesto, visitar la sección de mercado, seleccionar un jugador disponible y enviar tu oferta. El club propietario decidirá si acepta. Las transacciones son irreversibles una vez aceptadas.',
    category: 'market'
  },
  {
    id: 'faq4',
    question: '¿Cómo participar en un torneo?',
    answer: 'Para participar en un torneo abierto, visita la sección "Torneos" y busca aquellos con estado "Inscripciones abiertas". Haz clic en "Ver detalles" y luego en "Solicitar participación". Los torneos cerrados como la Liga Master requieren invitación o tener un club asignado previamente.',
    category: 'tournament'
  },
  {
    id: 'faq5',
    question: '¿Qué es el sistema de XP y niveles?',
    answer: 'El sistema de XP (experiencia) te permite subir de nivel a medida que participas en la plataforma. Ganas XP por ganar partidos, participar en torneos, comentar, votar y otras actividades. Cada nivel desbloquea nuevos contenidos en la tienda y aumenta tu reputación en la comunidad.',
    category: 'account'
  },
  {
    id: 'faq6',
    question: '¿Puedo cambiar el escudo o nombre de mi club?',
    answer: 'Los DTs pueden personalizar aspectos de su club desde el panel de usuario en la sección "Mi Club". Algunos cambios como el escudo pueden requerir monedas virtuales que se obtienen a través de logros o pueden comprarse en la tienda. Los cambios de nombre requieren aprobación administrativa.',
    category: 'league'
  },
  {
    id: 'faq7',
    question: '¿Qué ocurre si no puedo disputar un partido programado?',
    answer: 'Si no puedes disputar un partido, debes notificarlo con al menos 24 horas de antelación a través del sistema de mensajes o en el Discord oficial. En casos extraordinarios, el partido puede ser reprogramado. Las ausencias sin justificación pueden conllevar sanciones deportivas.',
    category: 'tournament'
  },
  {
    id: 'faq8',
    question: '¿Cómo puedo subir contenido a la galería?',
    answer: 'Para subir contenido a la galería, ve a la sección "Galería" y haz clic en "Subir contenido". Puedes compartir capturas, clips o videos relacionados con La Virtual Zone. Todo el contenido es moderado para asegurar que cumple con las normas de la comunidad.',
    category: 'other'
  },
  {
    id: 'faq9',
    question: '¿Cómo funcionan las tácticas de equipo?',
    answer: 'En la sección "Tácticas" de tu club, puedes definir la formación, alineación y estilo de juego. Estas configuraciones son visibles para otros usuarios y reflejan tu filosofía como DT. Las tácticas pueden modificarse entre partidos pero no durante los mismos.',
    category: 'league'
  },
  {
    id: 'faq10',
    question: '¿Qué ocurre al final de la temporada?',
    answer: 'Al finalizar la temporada, se celebra una ceremonia de premiación virtual donde se reconocen los logros individuales y colectivos. Los clubes mantienen su historial y plantilla (con algunos cambios por edad/rendimiento), y se preparan para la siguiente temporada con un nuevo draft y periodo de fichajes.',
    category: 'league'
  }
];

// Store items
export const storeItems: StoreItem[] = [
  {
    id: 'store1',
    name: 'Escudo Premium - Neón',
    description: 'Escudo con efectos de neón personalizables para tu club. Destacará en todas las vistas del torneo.',
    category: 'club',
    price: 1500,
    image: 'https://ui-avatars.com/api/?name=EP&background=00b3ff&color=fff&size=128&bold=true',
    minLevel: 5,
    inStock: true
  },
  {
    id: 'store2',
    name: 'Marco de Perfil - Campeón',
    description: 'Marco dorado para tu avatar que muestra tu estatus como campeón de un torneo oficial.',
    category: 'user',
    price: 2000,
    image: 'https://ui-avatars.com/api/?name=MP&background=eab308&color=fff&size=128&bold=true',
    minLevel: 8,
    inStock: true
  },
  {
    id: 'store3',
    name: 'Equipación Alternativa',
    description: 'Desbloquea una tercera equipación para tu club con colores personalizables.',
    category: 'club',
    price: 1200,
    image: 'https://ui-avatars.com/api/?name=EA&background=ec4899&color=fff&size=128&bold=true',
    minLevel: 3,
    inStock: true
  },
  {
    id: 'store4',
    name: 'Título - Leyenda',
    description: 'Añade el título "Leyenda" a tu perfil de usuario. Visible en comentarios, foros y rankings.',
    category: 'user',
    price: 3000,
    image: 'https://ui-avatars.com/api/?name=TL&background=84cc16&color=fff&size=128&bold=true',
    minLevel: 15,
    inStock: true
  },
  {
    id: 'store5',
    name: 'Estadio Personalizado',
    description: 'Personaliza el nombre y aspecto visual del estadio de tu club.',
    category: 'club',
    price: 2500,
    image: 'https://ui-avatars.com/api/?name=E&background=a855f7&color=fff&size=128&bold=true',
    minLevel: 10,
    inStock: true
  },
  {
    id: 'store6',
    name: 'Logro - Primer Fichaje',
    description: 'Reconocimiento por completar tu primer fichaje en el mercado de transferencias.',
    category: 'achievement',
    price: 500,
    image: 'https://ui-avatars.com/api/?name=PF&background=ef4444&color=fff&size=128&bold=true',
    minLevel: 1,
    inStock: true
  }
];

// --- Datos para el tablero del DT ---
export const dtFixtures: DtFixture[] = tournaments[0].matches
  .filter(m => m.homeTeam === clubs[0].name || m.awayTeam === clubs[0].name)
  .slice(0, 6)
  .map(m => ({ ...m, played: m.status === 'finished' }));

export const dtMarket: DtMarket = { open: true };

export const dtObjectives: DtObjectives = { position: 50, fairplay: 70 };

export const dtTasks: DtTask[] = [
  { id: 'task1', text: 'Actualizar tácticas', done: false },
  { id: 'task2', text: 'Revisar informe médico', done: false }
];

export const dtEvents: DtEvent[] = [
  { id: 'event1', message: 'Fin de mercado el 15 de febrero', date: '2025-02-15' },
  { id: 'event2', message: 'Reunión de liga', date: '2025-02-05' }
];

export const dtNews: NewsItem[] = newsItems.slice(0, 5);
export const dtPositions: Standing[] = leagueStandings;

export const dtRankings: DtRanking[] = [
  {
    id: 'r1',
    username: 'coach',
    clubName: clubs[0].name,
    clubLogo: clubs[0].logo,
    elo: 1500
  },
  {
    id: 'r2',
    username: 'DT Neon',
    clubName: clubs[3].name,
    clubLogo: clubs[3].logo,
    elo: 1480
  },
  {
    id: 'r3',
    username: 'jackso',
    clubName: clubs[1].name,
    clubLogo: clubs[1].logo,
    elo: 1450
  }
];
 
