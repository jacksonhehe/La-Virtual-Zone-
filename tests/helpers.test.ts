import assert from 'node:assert/strict';
import {
  getMiniTable,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  possessionDiff,
  yellowDiff,
} from '../src/utils/helpers.ts';
import { leagueStandings, tournaments } from '../src/data/mockData.ts';

const fixtures = tournaments.find(t => t.id === 'tournament1')?.matches ?? [];

const mini = getMiniTable('club1', leagueStandings);
assert.strictEqual(mini.length, 5, 'mini table should have 5 entries');

assert.ok(calcStreak('club1', fixtures).length <= 5, 'streak should contain at most 5 matches');

assert.ok(getTopPerformer('club1') !== null, 'top performer should not be null');
assert.strictEqual(typeof goalsDiff('club1').diff, 'number', 'goals diff should be a number');
assert.strictEqual(typeof possessionDiff('club1').diff, 'number', 'possession diff should be a number');
assert.strictEqual(typeof yellowDiff('club1').diff, 'number', 'yellow diff should be a number');

console.log('All tests passed');
