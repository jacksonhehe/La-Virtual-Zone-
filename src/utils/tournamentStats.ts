import { Match, Standing, Scorer, TopScorer } from '../types';

export function computeStandings(matches: Match[]): Standing[] {
  const table: Record<string, Standing> = {};

  const ensureClub = (clubName: string) => {
    if (!table[clubName]) {
      table[clubName] = {
        clubId: clubName,
        clubName,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
        possession: 0,
        cards: 0,
      } as Standing;
    }
  };

  matches.forEach(match => {
    if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) return;

    ensureClub(match.homeTeam);
    ensureClub(match.awayTeam);

    const home = table[match.homeTeam];
    const away = table[match.awayTeam];

    home.played += 1;
    away.played += 1;

    home.goalsFor += match.homeScore;
    home.goalsAgainst += match.awayScore;

    away.goalsFor += match.awayScore;
    away.goalsAgainst += match.homeScore;

    if (match.homeScore > match.awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
      home.form.push('W');
      away.form.push('L');
    } else if (match.homeScore < match.awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
      home.form.push('L');
      away.form.push('W');
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      home.form.push('D');
      away.form.push('D');
    }
  });

  return Object.values(table).sort((a, b) => b.points - a.points || b.goalsFor - a.goalsFor);
}

export function computeTopScorers(matches: Match[]): TopScorer[] {
  const tally: Record<string, TopScorer> = {};

  matches.forEach(match => {
    (match.scorers || []).forEach((s: Scorer) => {
      if (!tally[s.playerId]) {
        tally[s.playerId] = {
          id: s.playerId,
          playerId: s.playerId,
          playerName: s.playerName,
          clubId: s.clubId,
          clubName: '',
          goals: 0,
        } as TopScorer;
      }
      tally[s.playerId].goals += 1;
    });
  });

  return Object.values(tally).sort((a, b) => b.goals - a.goals);
} 