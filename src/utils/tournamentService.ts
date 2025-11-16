import { Tournament, Match } from '../types';
import { useDataStore } from '../store/dataStore';
import { tournaments as seedTournaments } from '../data/mockData';
import { dbService } from './indexedDBService';
import { createMatch, deleteMatchesByTournament, getMatchesByTournament } from './matchService';

const TOURNAMENTS_STORE = 'tournaments';

// Flag para evitar múltiples sincronizaciones simultáneas
let isSyncing = false;
let lastSyncTime = 0;
const SYNC_COOLDOWN = 5000; // 5 segundos entre sincronizaciones

const getTournaments = async (): Promise<Tournament[]> => {
  try {
    const tournaments = await dbService.getAll<Tournament>(TOURNAMENTS_STORE);
    console.log(`🏆 getTournaments: Encontrados ${tournaments.length} torneos en IndexedDB`);

    if (tournaments.length === 0) {
      console.log('📝 La BD está vacía, inicializando con datos seed...');
      await dbService.putMany(TOURNAMENTS_STORE, seedTournaments);
      console.log(`✅ Inicializados ${seedTournaments.length} torneos desde datos seed`);
      return seedTournaments;
    }

    return tournaments;
  } catch (error) {
    console.error('❌ Error crítico getting tournaments from IndexedDB:', error);
    // Fallback to seed data
    console.error('🚨 Usando datos seed como último recurso');
    return seedTournaments;
  }
};

const saveTournaments = async (tournaments: Tournament[]): Promise<void> => {
  try {
    await dbService.putMany(TOURNAMENTS_STORE, tournaments);
    console.log(`💾 Saved ${tournaments.length} tournaments to IndexedDB`);
  } catch (error) {
    console.error('❌ Error saving tournaments to IndexedDB:', error);
    throw error;
  }
};

export const listTournaments = async (): Promise<Tournament[]> => {
  // Sync from Supabase first if enabled
  await syncTournamentsFromSupabase();

  return await getTournaments();
};

// Manual sync function for console access
export const forceSyncTournamentsFromSupabase = async (): Promise<void> => {
  console.log('🔄 Forzando sincronización de torneos desde Supabase...');
  await syncTournamentsFromSupabase();
  console.log('✅ Sincronización completada');
};

// Sync tournaments from Supabase to IndexedDB if enabled
const syncTournamentsFromSupabase = async (): Promise<void> => {
  // Evitar múltiples sincronizaciones simultáneas
  if (isSyncing) {
    console.log('TournamentService: Sync already in progress, skipping...');
    return;
  }

  // Cooldown: no sincronizar si se hizo hace menos de 5 segundos
  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN) {
    console.log('TournamentService: Sync cooldown active, skipping...');
    return;
  }

  isSyncing = true;
  lastSyncTime = now;

  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('TournamentService: Supabase sync disabled, skipping download...');
      isSyncing = false;
      return;
    }

    // Import Supabase client
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    console.log('TournamentService: Downloading tournaments from Supabase...');

    const { data: supabaseTournaments, error } = await supabase
      .from('tournaments')
      .select('*');

    if (error) {
      console.error('TournamentService: Error downloading tournaments from Supabase:', error);
      return;
    }

    if (!supabaseTournaments || supabaseTournaments.length === 0) {
      console.log('TournamentService: No tournaments found in Supabase');
      return;
    }

    console.log(`TournamentService: Found ${supabaseTournaments.length} tournaments in Supabase`);

    // Map Supabase format to local Tournament format (snake_case -> camelCase)
    const localTournaments: Tournament[] = supabaseTournaments.map((st: any) => ({
      id: st.id,
      name: st.name,
      type: st.type,
      logo: st.logo,
      startDate: st.start_date, // snake_case -> camelCase
      endDate: st.end_date, // snake_case -> camelCase
      status: st.status,
      teams: st.teams || [],
      rounds: st.rounds || 1,
      matches: st.matches || [],
      winner: st.winner || undefined,
      topScorer: st.top_scorer || undefined, // snake_case -> camelCase
      description: st.description || ''
    }));

    // Get current local tournaments
    const currentLocalTournaments = await getTournaments();

    // Merge: Supabase tournaments take precedence for existing ones, add new ones
    const mergedTournaments = [...currentLocalTournaments];

    localTournaments.forEach(supabaseTournament => {
      const existingIndex = mergedTournaments.findIndex(t => t.id === supabaseTournament.id);
      if (existingIndex !== -1) {
        // Update existing tournament with Supabase data
        mergedTournaments[existingIndex] = supabaseTournament;
        console.log(`TournamentService: Updated tournament ${supabaseTournament.name} from Supabase`);
      } else {
        // Add new tournament from Supabase
        mergedTournaments.push(supabaseTournament);
        console.log(`TournamentService: Added new tournament ${supabaseTournament.name} from Supabase`);
      }
    });

    // Save merged tournaments to IndexedDB
    await saveTournaments(mergedTournaments);

    // Update store state
    const { updateTournaments } = useDataStore.getState();
    updateTournaments(mergedTournaments);

    console.log(`TournamentService: Successfully synced ${localTournaments.length} tournaments from Supabase`);

  } catch (error) {
    console.error('TournamentService: Failed to sync tournaments from Supabase:', error);
  } finally {
    isSyncing = false;
  }
};

// Auto-sync tournament to Supabase if enabled
const syncTournamentToSupabase = async (tournament: Tournament): Promise<void> => {
  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('TournamentService: Supabase sync disabled, skipping...');
      return;
    }

    // Import Supabase client
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    // Map tournament to Supabase format (using correct column names)
    const supabaseTournament = {
      id: tournament.id,
      name: tournament.name,
      type: tournament.type,
      logo: tournament.logo,
      start_date: tournament.startDate, // camelCase -> snake_case
      end_date: tournament.endDate, // camelCase -> snake_case
      status: tournament.status || 'upcoming',
      teams: tournament.teams || [],
      rounds: tournament.rounds || 1,
      matches: tournament.matches || [],
      description: tournament.description || '',
      winner: tournament.winner || null,
      top_scorer: tournament.topScorer || null, // camelCase -> snake_case
      updated_at: new Date().toISOString()
    };

    console.log('TournamentService: Syncing tournament to Supabase:', tournament.id);

    const { error } = await supabase
      .from('tournaments')
      .upsert(supabaseTournament, { onConflict: 'id' });

    if (error) {
      console.error('TournamentService: Error syncing tournament to Supabase:', error);
    } else {
      console.log('TournamentService: Tournament synced to Supabase successfully:', tournament.id);
    }
  } catch (error) {
    console.error('TournamentService: Failed to sync tournament to Supabase:', error);
  }
};

export const createTournament = async (data: {
  name: string;
  type: Tournament['type'];
  startDate: string;
  endDate: string;
  logo?: string;
  rounds: number;
  teams: string[];
  description?: string;
  status?: Tournament['status'];
}): Promise<Tournament> => {
  const tournaments = await getTournaments();
  const id = `t-${Date.now()}`;
  const tournament: Tournament = {
    id,
    name: data.name.trim(),
    type: data.type,
    logo: data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=111827&color=fff&size=128&bold=true`,
    startDate: new Date(data.startDate).toISOString(),
    endDate: new Date(data.endDate).toISOString(),
    status: data.status || 'upcoming',
    teams: data.teams,
    rounds: data.rounds,
    matches: [],
    description: data.description || ''
  };

  const updatedTournaments = [tournament, ...tournaments];
  await saveTournaments(updatedTournaments);

  // Update store state
  const { updateTournaments: updateStoreTournaments } = useDataStore.getState();
  updateStoreTournaments(updatedTournaments);

  // Auto-sync to Supabase if enabled
  await syncTournamentToSupabase(tournament);

  return tournament;
};

export const updateTournament = async (t: Tournament): Promise<Tournament> => {
  const tournaments = await getTournaments();
  const updated = tournaments.map((x) => (x.id === t.id ? t : x));
  await saveTournaments(updated);

  // Update store state
  const { updateTournaments } = useDataStore.getState();
  updateTournaments(updated);

  // Auto-sync to Supabase if enabled
  await syncTournamentToSupabase(t);

  return t;
};

export const finishTournament = async (id: string): Promise<void> => {
  const tournaments = await getTournaments();
  const updated = tournaments.map((t) => (t.id === id ? { ...t, status: 'finished' } : t));
  await saveTournaments(updated);

  // Update store state
  const { updateTournaments } = useDataStore.getState();
  updateTournaments(updated);

  // Auto-sync to Supabase if enabled
  const finishedTournament = updated.find(t => t.id === id);
  if (finishedTournament) {
    await syncTournamentToSupabase(finishedTournament);
  }
};

export const deleteTournament = async (id: string): Promise<void> => {
  const tournaments = await getTournaments();
  const remaining = tournaments.filter((t) => t.id !== id);
  await saveTournaments(remaining);

  // Update store state
  const { updateTournaments } = useDataStore.getState();
  updateTournaments(remaining);

  // Auto-sync deletion to Supabase if enabled
  try {
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('TournamentService: Supabase sync disabled, skipping deletion...');
      return;
    }

    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    console.log('TournamentService: Deleting tournament from Supabase:', id);

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('TournamentService: Error deleting tournament from Supabase:', error);
    } else {
      console.log('TournamentService: Tournament deleted from Supabase successfully:', id);
    }
  } catch (error) {
    console.error('TournamentService: Failed to delete tournament from Supabase:', error);
  }
};

export const addMatch = async (tournamentId: string, data: { date: string; homeTeam: string; awayTeam: string; round?: number }): Promise<Match> => {
  const tournaments = await getTournaments();
  const tournament = tournaments.find(t => t.id === tournamentId);
  
  if (!tournament) {
    throw new Error(`Tournament with id ${tournamentId} not found`);
  }

  // Crear partido en la tabla independiente
  const match = await createMatch({
    tournamentId,
    round: data.round || 0,
    date: data.date,
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    status: 'scheduled'
  });

  // No actualizar el array matches del torneo (los partidos ahora están en tabla independiente)
  // Solo sincronizar el torneo si es necesario

  return match;
};

export const generateRoundRobin = async (tournamentId: string): Promise<number> => {
  console.log(`TournamentService: Generando fixture round-robin para torneo ${tournamentId}...`);
  
  const tournaments = await getTournaments();
  const t = tournaments.find((x) => x.id === tournamentId);
  
  if (!t) {
    throw new Error(`Tournament with id ${tournamentId} not found`);
  }

  // Validar que el torneo tenga al menos 2 equipos
  if (!t.teams || t.teams.length < 2) {
    throw new Error(`El torneo debe tener al menos 2 equipos para generar un fixture. Actualmente tiene ${t.teams?.length || 0} equipos.`);
  }

  console.log(`TournamentService: Torneo "${t.name}" tiene ${t.teams.length} equipos`);

  // Eliminar partidos existentes del torneo (tanto del array como de la tabla)
  const deletedCount = await deleteMatchesByTournament(tournamentId);
  if (deletedCount > 0) {
    console.log(`TournamentService: Eliminados ${deletedCount} partidos existentes del torneo`);
  }

  // Obtener número de rondas del torneo (default: 1 si no está definido)
  const tournamentRounds = t.rounds || 1;
  console.log(`TournamentService: Torneo configurado con ${tournamentRounds} vuelta(s) (${tournamentRounds === 1 ? 'solo ida' : tournamentRounds === 2 ? 'ida y vuelta' : `${tournamentRounds} vueltas`})`);

  const teams = [...t.teams];
  const even = teams.length % 2 === 0;
  if (!even) teams.push('BYE');
  const n = teams.length;
  const roundsPerLeg = n - 1; // Rondas por vuelta (leg)
  const totalRounds = roundsPerLeg * tournamentRounds; // Total de rondas considerando múltiples vueltas
  const half = n / 2;
  
  const start = new Date(t.startDate);
  const genMatches: Match[] = [];
  let matchCounter = 0; // Contador para asegurar IDs únicos
  
  // Generar timestamp base único para este fixture
  const baseTimestamp = Date.now();
  
  // Calcular días entre partidos (distribuir los partidos en el rango de fechas)
  const startTime = start.getTime();
  const endTime = new Date(t.endDate).getTime();
  const totalDays = Math.max(1, Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24)));
  const daysBetweenMatches = Math.max(1, Math.floor(totalDays / Math.max(1, totalRounds)));
  
  // Generar primera vuelta (base para todas las vueltas)
  const firstLegMatches: { homeTeam: string; awayTeam: string; roundInLeg: number }[] = [];
  
  let home = teams.slice(0, half);
  let away = teams.slice(half).reverse();
  
  // Generar estructura de partidos de la primera vuelta
  for (let r = 0; r < roundsPerLeg; r++) {
    for (let i = 0; i < half; i++) {
      const a = home[i];
      const b = away[i];
      if (a === 'BYE' || b === 'BYE') continue;
      
      // Alternar local/visitante en cada ronda
      const homeTeam = r % 2 === 0 ? a : b;
      const awayTeam = r % 2 === 0 ? b : a;
      
      firstLegMatches.push({
        homeTeam,
        awayTeam,
        roundInLeg: r + 1
      });
    }
    
    // Rotar arrays para la siguiente ronda
    const fixed = home[0];
    const moveFromHome = home.pop()!;
    const moveFromAway = away.shift()!;
    home = [fixed, moveFromAway, ...home.slice(1)];
    away = [...away, moveFromHome];
  }
  
  // Agrupar partidos por ronda (una sola vez, antes del bucle de vueltas)
  const matchesByRound: { [round: number]: typeof firstLegMatches } = {};
  firstLegMatches.forEach(match => {
    if (!matchesByRound[match.roundInLeg]) {
      matchesByRound[match.roundInLeg] = [];
    }
    matchesByRound[match.roundInLeg].push(match);
  });
  
  // Generar todas las vueltas basadas en la primera vuelta
  let currentRound = 1;
  let currentDay = 0;
  
  for (let leg = 0; leg < tournamentRounds; leg++) {
    console.log(`TournamentService: Generando vuelta ${leg + 1} de ${tournamentRounds}...`);
    
    // Generar partidos para cada ronda de esta vuelta (en orden)
    const sortedRounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);
    
    for (const roundNum of sortedRounds) {
      // Todos los partidos de esta ronda tienen la misma fecha
      const date = new Date(startTime + (currentDay * 24 * 60 * 60 * 1000));
      
      // Generar todos los partidos de esta ronda
      for (const baseMatch of matchesByRound[roundNum]) {
        // Determinar local y visitante según la vuelta
        // Vueltas impares (1, 3, 5...): mantener orden original
        // Vueltas pares (2, 4, 6...): invertir (ida y vuelta)
        const homeTeam = leg % 2 === 0 ? baseMatch.homeTeam : baseMatch.awayTeam;
        const awayTeam = leg % 2 === 0 ? baseMatch.awayTeam : baseMatch.homeTeam;
        
        // Generar ID único
        const matchId = `match-${baseTimestamp}-${matchCounter}-${Math.random().toString(36).substr(2, 9)}`;
        matchCounter++;
      
      const match: Match = {
          id: matchId,
        tournamentId: t.id,
          round: currentRound,
        date: date.toISOString(),
          homeTeam: homeTeam,
          awayTeam: awayTeam,
        status: 'scheduled' as const,
      };
      
      genMatches.push(match);
      
      // Crear partido en la tabla independiente
      await createMatch({
        tournamentId: match.tournamentId,
        round: match.round,
        date: match.date,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        status: match.status
      });
    }
      
      // Incrementar día y ronda para la siguiente ronda
      currentDay += daysBetweenMatches;
      currentRound++;
    }
  }

  console.log(`TournamentService: Generados ${genMatches.length} partidos para el fixture`);

  // Actualizar torneo (mantener array vacío o solo para compatibilidad)
  const updated = tournaments.map((x) => (x.id === t.id ? { ...x, matches: [] } : x));
  await saveTournaments(updated);

  // Update store state
  const { updateTournaments } = useDataStore.getState();
  updateTournaments(updated);

  // Auto-sync to Supabase if enabled
  const updatedTournament = updated.find(t => t.id === tournamentId);
  if (updatedTournament) {
    await syncTournamentToSupabase(updatedTournament);
  }

  console.log(`TournamentService: ✅ Fixture generado exitosamente. ${genMatches.length} partidos creados.`);
  return genMatches.length;
};

export const updateMatch = async (tournamentId: string, matchId: string, data: Partial<Match>): Promise<Match> => {
  // Actualizar partido en la tabla independiente
  const { updateMatch: updateMatchInTable } = await import('./matchService');
  const updatedMatch = await updateMatchInTable(matchId, data);
  
  // Verificar que el partido pertenece al torneo
  if (updatedMatch.tournamentId !== tournamentId) {
    throw new Error(`Match ${matchId} does not belong to tournament ${tournamentId}`);
  }
  
  return updatedMatch;
};

export const deleteMatch = async (tournamentId: string, matchId: string): Promise<void> => {
  // Verificar que el partido pertenece al torneo
  const { getMatchById } = await import('./matchService');
  const match = await getMatchById(matchId);
  
  if (!match) {
    throw new Error(`Match with id ${matchId} not found`);
  }
  
  if (match.tournamentId !== tournamentId) {
    throw new Error(`Match ${matchId} does not belong to tournament ${tournamentId}`);
  }
  
  // Eliminar partido de la tabla independiente
  const { deleteMatch: deleteMatchFromTable } = await import('./matchService');
  await deleteMatchFromTable(matchId);
};

export const deleteAllMatches = async (): Promise<number> => {
  // Eliminar todos los partidos de la tabla independiente
  const { deleteAllMatches: deleteAllMatchesFromService } = await import('./matchService');
  return await deleteAllMatchesFromService();
};

export const migrateAllMatchesToSupabase = async (): Promise<{ tournaments: number; matches: number; errors: string[] }> => {
  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      throw new Error('Supabase no está habilitado. Habilita Supabase en la configuración primero.');
    }

    console.log('🔄 Iniciando migración de todos los partidos a Supabase...');

    const tournaments = await getTournaments();
    let totalMatches = 0;
    const errors: string[] = [];

    // Sincronizar cada torneo (que incluye sus partidos)
    for (const tournament of tournaments) {
      try {
        const matchCount = (tournament.matches || []).length;
        totalMatches += matchCount;

        console.log(`📤 Sincronizando torneo "${tournament.name}" con ${matchCount} partidos...`);
        await syncTournamentToSupabase(tournament);
        console.log(`✅ Torneo "${tournament.name}" sincronizado exitosamente`);
      } catch (error) {
        const errorMsg = `Error sincronizando torneo "${tournament.name}": ${error instanceof Error ? error.message : 'Error desconocido'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    const result = {
      tournaments: tournaments.length,
      matches: totalMatches,
      errors
    };

    if (errors.length === 0) {
      console.log(`✅ Migración completada: ${tournaments.length} torneos y ${totalMatches} partidos migrados exitosamente a Supabase`);
    } else {
      console.warn(`⚠️ Migración completada con errores: ${tournaments.length} torneos, ${totalMatches} partidos, ${errors.length} errores`);
    }

    return result;
  } catch (error) {
    console.error('❌ Error en la migración de partidos a Supabase:', error);
    throw error;
  }
};
