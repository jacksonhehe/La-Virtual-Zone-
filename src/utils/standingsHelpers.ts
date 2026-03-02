import type { Club, Standing, Match, Tournament } from '../types';

const BASE_MATCHES = 22;

const buildFormTrend = (winRatio: number) => {
  return Array.from({ length: 5 }, (_, index) => {
    const snapshot = winRatio - index * 0.05;
    if (snapshot > 0.6) return 'W';
    if (snapshot > 0.4) return 'D';
    return 'L';
  });
};

export const createFallbackStandings = (clubs: Club[]): Standing[] => {
  if (!clubs.length) return [];

  return [...clubs]
    .sort((a, b) => (b.reputation || 0) - (a.reputation || 0))
    .slice(0, 20)
    .map((club, index) => {
      const reputation = club.reputation || 60;
      const winRatio = Math.max(0.3, Math.min(0.85, reputation / 100));
      const wins = Math.max(0, Math.min(BASE_MATCHES, Math.round(BASE_MATCHES * winRatio)));
      const draws = Math.max(
        0,
        Math.min(BASE_MATCHES - wins, Math.round((1 - winRatio) * 4))
      );
      const losses = Math.max(0, BASE_MATCHES - wins - draws);
      const goalsFor = Math.max(10, wins * 2 + 8 - index);
      const goalsAgainst = Math.max(5, Math.round(goalsFor * (1 - winRatio) * 0.6) + Math.round(losses * 0.5));
      const points = wins * 3 + draws;

      return {
        clubId: club.id,
        clubName: club.name,
        played: BASE_MATCHES,
        won: wins,
        drawn: draws,
        lost: losses,
        goalsFor,
        goalsAgainst,
        points,
        form: buildFormTrend(winRatio)
      };
    });
};

/**
 * Genera standings desde los partidos finalizados de un torneo
 * @param tournamentId ID del torneo
 * @param matches Array de todos los partidos
 * @param clubs Array de todos los clubes
 * @returns Array de standings calculados
 */
export const generateStandingsFromMatches = (
  tournamentId: string,
  matches: Match[],
  clubs: Club[],
  tournaments?: Tournament[]
): Standing[] => {
  // Filtrar partidos finalizados con resultados válidos
  // Si tournamentId es 'all-tournaments', incluir todos los partidos
  // Si no, filtrar por el tournamentId específico
  const tournamentMatches = matches.filter(
    m => m.status === 'finished' &&
    m.homeScore != null &&
    m.awayScore != null &&
    (tournamentId === 'all-tournaments' || m.tournamentId === tournamentId)
  );

  // Obtener equipos únicos de los partidos (o del torneo si está disponible)
  const teamsSet = new Set<string>();
  
  // Si tenemos el torneo, usar sus equipos
  if (tournaments) {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament && tournament.teams) {
      tournament.teams.forEach(team => teamsSet.add(team));
    }
  }
  
  // También agregar equipos de los partidos (por si acaso)
  tournamentMatches.forEach(m => {
    teamsSet.add(m.homeTeam);
    teamsSet.add(m.awayTeam);
  });
  
  // Inicializar standings
  const standings: Record<string, Standing> = {};
  teamsSet.forEach(teamName => {
    const club = clubs.find(c => c.name === teamName);
    standings[teamName] = {
      clubId: club?.id || '',
      clubName: teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: []
    };
  });

  // Procesar partidos finalizados
  tournamentMatches.forEach(match => {
    const homeTeam = standings[match.homeTeam];
    const awayTeam = standings[match.awayTeam];
    
    if (homeTeam && awayTeam && match.homeScore != null && match.awayScore != null) {
      // Actualizar partidos jugados
      homeTeam.played++;
      awayTeam.played++;
      
      // Actualizar goles
      homeTeam.goalsFor += match.homeScore;
      homeTeam.goalsAgainst += match.awayScore;
      awayTeam.goalsFor += match.awayScore;
      awayTeam.goalsAgainst += match.homeScore;
      
      // Actualizar resultados
      if (match.homeScore > match.awayScore) {
        // Victoria local
        homeTeam.won++;
        homeTeam.points += 3;
        awayTeam.lost++;
        homeTeam.form.push('W');
        awayTeam.form.push('L');
      } else if (match.homeScore < match.awayScore) {
        // Victoria visitante
        awayTeam.won++;
        awayTeam.points += 3;
        homeTeam.lost++;
        homeTeam.form.push('L');
        awayTeam.form.push('W');
      } else {
        // Empate
        homeTeam.drawn++;
        homeTeam.points++;
        awayTeam.drawn++;
        awayTeam.points++;
        homeTeam.form.push('D');
        awayTeam.form.push('D');
      }
      
      // Mantener solo últimos 5 resultados
      homeTeam.form = homeTeam.form.slice(-5);
      awayTeam.form = awayTeam.form.slice(-5);
    }
  });

  // Convertir a array y ordenar
  const standingsArray = Object.values(standings);
  
  standingsArray.sort((a, b) => {
    // Ordenar por puntos
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    
    // Ordenar por diferencia de goles
    const aGD = a.goalsFor - a.goalsAgainst;
    const bGD = b.goalsFor - b.goalsAgainst;
    if (aGD !== bGD) {
      return bGD - aGD;
    }
    
    // Ordenar por goles a favor
    if (a.goalsFor !== b.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }
    
    // Ordenar alfabéticamente como último recurso
    return a.clubName.localeCompare(b.clubName);
  });

  return standingsArray;
};

/**
 * Recalcula y actualiza los standings en el store
 * Esta función debe llamarse después de actualizar partidos
 */
export const recalculateAndUpdateStandings = async (tournamentId?: string): Promise<void> => {
  try {
    // Importar dinámicamente para evitar dependencias circulares
    const { useDataStore } = await import('../store/dataStore');
    const { listMatches } = await import('./matchService');

    const store = useDataStore.getState();
    const matches = await listMatches();

    console.log('🔍 Recalculando standings...');
    console.log('📊 Partidos encontrados:', matches.length);
    console.log('🏆 Partidos finalizados:', matches.filter(m => m.status === 'finished').length);
    console.log('🏟️ Clubs disponibles:', store.clubs.length);

    // Debug: mostrar detalles de los partidos
    console.log('📋 Detalles de partidos:');
    matches.forEach((m, i) => {
      console.log(`  ${i + 1}. ${m.homeTeam} vs ${m.awayTeam}`);
      console.log(`     Torneo: ${m.tournamentId}`);
      console.log(`     Estado: ${m.status}`);
      console.log(`     Resultado: ${m.homeScore != null ? m.homeScore : 'null'} - ${m.awayScore != null ? m.awayScore : 'null'}`);
    });

    // Si se especifica un tournamentId, filtrar por ese torneo
    // Si no, calcular standings de TODOS los partidos finalizados (de todos los torneos)
    const matchesToProcess = tournamentId
      ? matches.filter(m => m.tournamentId === tournamentId)
      : matches;

    console.log(`🎯 Procesando ${matchesToProcess.length} partidos${tournamentId ? ` del torneo ${tournamentId}` : ' de todos los torneos'}`);

    // Generar standings desde los partidos
    const newStandings = generateStandingsFromMatches(
      tournamentId || 'all-tournaments', // Usar un ID especial para indicar que son de todos los torneos
      matchesToProcess,
      store.clubs,
      store.tournaments
    );

    console.log('📈 Standings calculados:', newStandings.length, 'equipos');
    newStandings.forEach(s => {
      console.log(`  ${s.clubName}: ${s.points} pts, ${s.won}V ${s.drawn}E ${s.lost}D`);
    });

    // Actualizar el store
    store.updateStandings(newStandings);

    console.log('✅ Standings recalculados y guardados');
  } catch (error) {
    console.error('❌ Error recalculando standings:', error);
  }
};
