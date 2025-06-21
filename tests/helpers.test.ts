import {
  getMiniTable,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  possessionDiff,
  yellowDiff
} from '../src/utils/helpers.js';
import { leagueStandings, tournaments } from '../src/data/mockData.js';

const mini = getMiniTable('club1', leagueStandings);
console.log('mini', mini.length === 5);

const fixtures = tournaments.find(t => t.id === 'tournament1')?.matches ?? [];
console.log('streak', calcStreak('club1', fixtures).length <= 5);

console.log('performer', getTopPerformer('club1') !== null);
console.log('goals', typeof goalsDiff('club1').diff === 'number');
console.log('possession', typeof possessionDiff('club1').diff === 'number');
console.log('cards', typeof yellowDiff('club1').diff === 'number');
