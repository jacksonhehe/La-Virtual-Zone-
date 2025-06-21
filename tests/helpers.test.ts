import {
  getMiniTable,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  possessionDiff,
  yellowDiff
} from '../src/utils/helpers.js';
import { leagueStandings, tournaments } from '../src/data/mockData.js';
import * as assert from 'node:assert/strict';

const mini = getMiniTable('club1', leagueStandings);
assert.strictEqual(mini.length, 5);

const fixtures = tournaments.find(t => t.id === 'tournament1')?.matches ?? [];
assert.ok(calcStreak('club1', fixtures).length <= 5);

assert.ok(getTopPerformer('club1') !== null);
assert.strictEqual(typeof goalsDiff('club1').diff, 'number');
assert.strictEqual(typeof possessionDiff('club1').diff, 'number');
assert.strictEqual(typeof yellowDiff('club1').diff, 'number');
