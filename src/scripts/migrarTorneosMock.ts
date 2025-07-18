import { tournaments } from '../data/mockData';
import { saveTournaments } from '../utils/sharedStorage';

saveTournaments(tournaments);
 
console.log('Torneos mock migrados a localStorage:', tournaments.length); 