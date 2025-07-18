const { tournaments } = require('../data/mockData');
const { saveTournaments } = require('../utils/sharedStorage');

saveTournaments(tournaments);

console.log('Torneos mock migrados a localStorage:', tournaments.length); 