import { readFileSync } from 'fs';
const data = readFileSync('Transferencias_Listado_Completo_Sin_NA.json', 'utf8');
const players = JSON.parse(data);

// Verificar todos los clubs disponibles
const clubs = [...new Set(players.map(p => p.club_actual))].sort();
console.log('Clubs disponibles en JSON:', clubs.length);
console.log('Primeros 10 clubs:', clubs.slice(0, 10));

// Buscar clubs que contengan "Jackson"
const jacksonClubs = clubs.filter(c => c && c.toLowerCase().includes('jackson'));
console.log('Clubs con "jackson":', jacksonClubs);

// Verificar qué club tiene los 23 jugadores que esperamos
const clubCounts = {};
players.forEach(p => {
  const club = p.club_actual || 'SIN_CLUB';
  clubCounts[club] = (clubCounts[club] || 0) + 1;
});

console.log('\nJugadores por club (ordenado por cantidad):');
Object.entries(clubCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 20)
  .forEach(([club, count]) => {
    console.log(`${club}: ${count} jugadores`);
  });
