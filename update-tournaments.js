// Simple script to update tournament data
const tournaments = [
  {
    id: 'tournament1',
    name: 'Liga Master 2025',
    type: 'league',
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    startDate: '2025-01-15',
    endDate: '2025-05-30',
    status: 'active',
    teams: ['Rayo Digital FC', 'Atlético Pixelado', 'Neón FC', 'Cyber United', 'Digital Dragons'],
    rounds: 18,
    matches: [],
    results: [],
    description: 'La competición principal de La Virtual Zone. Liga regular con enfrentamientos ida y vuelta entre los 10 equipos participantes.'
  },
  {
    id: 'tournament2',
    name: 'Copa PES 2025',
    type: 'cup',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=300&fit=crop&crop=center',
    startDate: '2025-02-10',
    endDate: '2025-04-20',
    status: 'upcoming',
    teams: ['Rayo Digital FC', 'Atlético Pixelado', 'Neón FC', 'Cyber United'],
    rounds: 4,
    matches: [],
    results: [],
    description: 'Torneo eliminatorio con emparejamientos por sorteo. El ganador obtiene plaza para la Supercopa Digital.'
  },
  {
    id: 'tournament3',
    name: 'Supercopa Digital 2025',
    type: 'cup',
    logo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=400&h=300&fit=crop&crop=center',
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
    logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center',
    startDate: '2024-12-01',
    endDate: '2024-12-20',
    status: 'finished',
    teams: ['Rayo Digital FC', 'Atlético Pixelado', 'Neón FC', 'Cyber United'],
    rounds: 3,
    matches: [],
    results: [],
    winner: 'Rayo Digital FC',
    description: 'Torneo amistoso previo al inicio de la temporada oficial. Sirve como preparación para los equipos.'
  }
];

// Save to localStorage
localStorage.setItem('vz_tournaments', JSON.stringify(tournaments));
console.log('Tournaments updated with real logos!'); 