import { test, expect } from 'vitest';
import {
  getMiniTable,
  calcStreak,
  getTopPerformer,
  goalsDiff,
  possessionDiff,
  yellowDiff,
} from '../src/utils/helpers.ts';

import type { Standing, Match, Player, Tournament } from '../src/types';

const leagueStandings: Standing[] = [
  {
    clubId: 'club1',
    clubName: 'Club 1',
    played: 2,
    won: 1,
    drawn: 1,
    lost: 0,
    goalsFor: 3,
    goalsAgainst: 1,
    points: 4,
    form: [],
    possession: 55,
    cards: 2
  },
  {
    clubId: 'club2',
    clubName: 'Club 2',
    played: 2,
    won: 1,
    drawn: 0,
    lost: 1,
    goalsFor: 2,
    goalsAgainst: 2,
    points: 3,
    form: [],
    possession: 50,
    cards: 1
  },
  {
    clubId: 'club3',
    clubName: 'Club 3',
    played: 2,
    won: 0,
    drawn: 1,
    lost: 1,
    goalsFor: 1,
    goalsAgainst: 3,
    points: 1,
    form: [],
    possession: 45,
    cards: 0
  },
  {
    clubId: 'club4',
    clubName: 'Club 4',
    played: 2,
    won: 0,
    drawn: 0,
    lost: 2,
    goalsFor: 0,
    goalsAgainst: 4,
    points: 0,
    form: [],
    possession: 40,
    cards: 0
  },
  {
    clubId: 'club5',
    clubName: 'Club 5',
    played: 2,
    won: 2,
    drawn: 0,
    lost: 0,
    goalsFor: 4,
    goalsAgainst: 0,
    points: 6,
    form: [],
    possession: 60,
    cards: 3
  }
];

const tournaments: Tournament[] = [
  {
    id: 'tournament1',
    name: 'Test',
    slug: 'test',
    status: 'upcoming',
    currentRound: 1,
    totalRounds: 1,
    matches: [
      {
        id: 'm1',
        tournamentId: 'tournament1',
        round: 1,
        date: '2021-01-01',
        homeTeam: 'Club 1',
        awayTeam: 'Club 2',
        homeScore: 2,
        awayScore: 1,
        status: 'finished'
      },
      {
        id: 'm2',
        tournamentId: 'tournament1',
        round: 2,
        date: '2021-01-02',
        homeTeam: 'Club 1',
        awayTeam: 'Club 3',
        homeScore: 1,
        awayScore: 1,
        status: 'finished'
      }
    ]
  }
];

const players: Player[] = [
  {
    id: 'p1',
    name: 'Player 1',
    age: 25,
    position: 'ST',
    nationality: 'ES',
    dorsal: 9,
    clubId: 'club1',
    overall: 80,
    potential: 80,
    transferListed: false,
    matches: 0,
    transferValue: 0,
    value: 0,
    image: '',
    attributes: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0
    },
    contract: { expires: '', salary: 0 },
    form: 0,
    goals: 5,
    assists: 1,
    appearances: 0
  },
  {
    id: 'p2',
    name: 'Player 2',
    age: 24,
    position: 'MF',
    nationality: 'ES',
    dorsal: 8,
    clubId: 'club1',
    overall: 78,
    potential: 80,
    transferListed: false,
    matches: 0,
    transferValue: 0,
    value: 0,
    image: '',
    attributes: {
      pace: 0,
      shooting: 0,
      passing: 0,
      dribbling: 0,
      defending: 0,
      physical: 0
    },
    contract: { expires: '', salary: 0 },
    form: 0,
    goals: 1,
    assists: 5,
    appearances: 0
  }
];

const fixtures = tournaments[0].matches;

test('getMiniTable returns 5 rows', () => {
  const mini = getMiniTable('club1', leagueStandings);
  expect(mini).toHaveLength(5);
});

test('calcStreak returns at most 5 entries', () => {
  const streak = calcStreak('club1', fixtures, leagueStandings);
  expect(streak.length).toBeLessThanOrEqual(5);
});

test('getTopPerformer returns a performer', () => {
  const performer = getTopPerformer('club1', players);
  expect(performer).not.toBeNull();
});

test('goalsDiff returns numeric diff', () => {
  expect(typeof goalsDiff('club1', leagueStandings).diff).toBe('number');
});

test('possessionDiff returns numeric diff', () => {
  expect(typeof possessionDiff('club1', leagueStandings).diff).toBe('number');
});

test('yellowDiff returns numeric diff', () => {
  expect(typeof yellowDiff('club1', leagueStandings).diff).toBe('number');
});
