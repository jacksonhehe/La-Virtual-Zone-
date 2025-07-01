import { beforeEach, describe, expect, it } from 'vitest';
import {
  useGlobalStore,
  getPlayersRegisteredToday,
  getMatchesScheduledTomorrow,
  getAvgGoalsLast7Days
} from '../store/globalStore';

describe('global store selectors', () => {
  beforeEach(() => {
    // Reset store state for each test
    useGlobalStore.setState({
      users: [],
      clubs: [],
      players: [],
      matches: [],
      tournaments: [],
      newsItems: [],
      transfers: [],
      standings: [],
      activities: [],
      comments: [],
      loading: false
    });
  });

  it('getPlayersRegisteredToday returns today users with role user', () => {
    const today = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    useGlobalStore.setState(state => ({
      users: [
        { id: '1', username: 'a', email: 'a', role: 'user', status: 'active', createdAt: today },
        { id: '2', username: 'b', email: 'b', role: 'user', status: 'active', createdAt: yesterday },
        { id: '3', username: 'c', email: 'c', role: 'dt', status: 'active', createdAt: today }
      ]
    }));

    const result = getPlayersRegisteredToday();
    expect(result.length).toBe(1);
    expect(result[0].id).toBe('1');
  });

  it('getMatchesScheduledTomorrow returns matches in the next day', () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12).toISOString();
    const twoDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 12).toISOString();

    useGlobalStore.setState(state => ({
      matches: [
        { id: '1', tournamentId: 't1', round: 1, date: tomorrow, homeTeam: 'A', awayTeam: 'B', status: 'scheduled' },
        { id: '2', tournamentId: 't1', round: 1, date: twoDays, homeTeam: 'C', awayTeam: 'D', status: 'scheduled' },
        { id: '3', tournamentId: 't1', round: 1, date: tomorrow, homeTeam: 'E', awayTeam: 'F', status: 'scheduled' }
      ]
    }));

    const result = getMatchesScheduledTomorrow();
    expect(result.map(m => m.id)).toEqual(['1', '3']);
  });

  it('getAvgGoalsLast7Days calculates average goals', () => {
    const now = Date.now();
    const within = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

    useGlobalStore.setState(state => ({
      matches: [
        { id: '1', tournamentId: 't', round: 1, date: within(1), homeTeam: 'A', awayTeam: 'B', homeScore: 2, awayScore: 1, status: 'finished' },
        { id: '2', tournamentId: 't', round: 1, date: within(3), homeTeam: 'C', awayTeam: 'D', homeScore: 0, awayScore: 0, status: 'finished' },
        { id: '3', tournamentId: 't', round: 1, date: within(6), homeTeam: 'E', awayTeam: 'F', homeScore: 3, awayScore: 2, status: 'finished' },
        { id: '4', tournamentId: 't', round: 1, date: within(10), homeTeam: 'G', awayTeam: 'H', homeScore: 5, awayScore: 1, status: 'finished' }
      ]
    }));

    const avg = getAvgGoalsLast7Days();
    expect(avg).toBeCloseTo(8 / 3, 5);
  });
});

