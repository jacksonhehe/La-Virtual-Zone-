import { test, expect } from 'vitest';
import { getMiniTable, calcStreak, getTopPerformer, goalsDiff, possessionDiff, yellowDiff } from '../src/utils/helpers.ts';
import { leagueStandings, tournaments } from '../src/data/mockData.ts';

const fixtures = tournaments.find(t => t.id === 'tournament1')?.matches ?? [];

test('getMiniTable returns 5 rows', () => {
  const mini = getMiniTable('club1', leagueStandings);
  expect(mini).toHaveLength(5);
});

test('calcStreak returns at most 5 entries', () => {
  const streak = calcStreak('club1', fixtures);
  expect(streak.length).toBeLessThanOrEqual(5);
});

test('getTopPerformer returns a performer', () => {
  const performer = getTopPerformer('club1');
  expect(performer).not.toBeNull();
});

test('goalsDiff returns numeric diff', () => {
  expect(typeof goalsDiff('club1').diff).toBe('number');
});

test('possessionDiff returns numeric diff', () => {
  expect(typeof possessionDiff('club1').diff).toBe('number');
});

test('yellowDiff returns numeric diff', () => {
  expect(typeof yellowDiff('club1').diff).toBe('number');
});
