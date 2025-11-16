import { Match } from '../types';
import { dbService } from './indexedDBService';

const MATCHES_STORE = 'matches';

// Flag para evitar múltiples sincronizaciones simultáneas
let isSyncing = false;
let lastSyncTime = 0;
const SYNC_COOLDOWN = 5000; // 5 segundos entre sincronizaciones

/**
 * Obtener partidos desde IndexedDB
 */
const getMatches = async (): Promise<Match[]> => {
  try {
    const matches = await dbService.getAll<Match>(MATCHES_STORE);
    return matches || [];
  } catch (error) {
    // Si la tabla no existe, retornar array vacío (se creará en la próxima actualización de versión)
    if (error instanceof Error && error.name === 'NotFoundError') {
      console.log('ℹ️ Tabla "matches" no existe aún en IndexedDB, retornando array vacío');
      return [];
    }
    console.error('❌ Error getting matches from IndexedDB:', error);
    return [];
  }
};

/**
 * Guardar partidos en IndexedDB
 */
const saveMatches = async (matches: Match[]): Promise<void> => {
  try {
    await dbService.putMany(MATCHES_STORE, matches);
    console.log(`💾 Saved ${matches.length} matches to IndexedDB`);
  } catch (error) {
    console.error('❌ Error saving matches to IndexedDB:', error);
    throw error;
  }
};

/**
 * Sincronizar partidos desde Supabase a IndexedDB
 */
const syncMatchesFromSupabase = async (): Promise<void> => {
  // Evitar múltiples sincronizaciones simultáneas
  if (isSyncing) {
    console.log('MatchService: Sync already in progress, skipping...');
    return;
  }

  // Cooldown: no sincronizar si se hizo hace menos de 5 segundos
  const now = Date.now();
  if (now - lastSyncTime < SYNC_COOLDOWN) {
    console.log('MatchService: Sync cooldown active, skipping...');
    return;
  }

  isSyncing = true;
  lastSyncTime = now;

  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('MatchService: Supabase sync disabled, skipping download...');
      isSyncing = false;
      return;
    }

    // Import Supabase client
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    console.log('MatchService: Downloading matches from Supabase...');

    const { data: supabaseMatches, error } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('MatchService: Error downloading matches from Supabase:', error);
      return;
    }

    if (!supabaseMatches || supabaseMatches.length === 0) {
      console.log('MatchService: No matches found in Supabase');
      isSyncing = false;
      return;
    }

    console.log(`MatchService: Found ${supabaseMatches.length} matches in Supabase`);

    // Map Supabase format to local Match format (snake_case -> camelCase)
    const localMatches: Match[] = supabaseMatches.map((sm: any) => ({
      id: sm.id,
      tournamentId: sm.tournament_id,
      round: sm.round,
      date: sm.date,
      homeTeam: sm.home_team,
      awayTeam: sm.away_team,
      homeScore: sm.home_score,
      awayScore: sm.away_score,
      status: sm.status,
      scorers: sm.scorers || [],
      highlights: sm.highlights || []
    }));

    // Get current local matches
    const currentLocalMatches = await getMatches();

    // Merge: Supabase matches take precedence for existing ones, add new ones
    const mergedMatches = [...currentLocalMatches];

    localMatches.forEach(supabaseMatch => {
      const existingIndex = mergedMatches.findIndex(m => m.id === supabaseMatch.id);
      if (existingIndex !== -1) {
        // Update existing match with Supabase data
        mergedMatches[existingIndex] = supabaseMatch;
      } else {
        // Add new match from Supabase
        mergedMatches.push(supabaseMatch);
      }
    });

    // Save merged matches to IndexedDB
    await saveMatches(mergedMatches);

    console.log(`MatchService: Successfully synced ${mergedMatches.length} matches from Supabase`);

  } catch (error) {
    console.error('MatchService: Failed to sync matches from Supabase:', error);
  } finally {
    isSyncing = false;
  }
};

/**
 * Sincronizar un partido individual a Supabase
 */
const syncMatchToSupabase = async (match: Match): Promise<void> => {
  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('MatchService: Supabase sync disabled, skipping...');
      return;
    }

    // Import Supabase client
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    // Map match to Supabase format (camelCase -> snake_case)
    const supabaseMatch = {
      id: match.id,
      tournament_id: match.tournamentId,
      round: match.round,
      date: match.date,
      home_team: match.homeTeam,
      away_team: match.awayTeam,
      home_score: match.homeScore || null,
      away_score: match.awayScore || null,
      status: match.status || 'scheduled',
      scorers: match.scorers || [],
      highlights: match.highlights || [],
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('matches')
      .upsert(supabaseMatch, { onConflict: 'id' });

    if (error) {
      console.error('MatchService: Error syncing match to Supabase:', error);
    } else {
      console.log('MatchService: Match synced to Supabase successfully:', match.id);
    }
  } catch (error) {
    console.error('MatchService: Failed to sync match to Supabase:', error);
  }
};

/**
 * Listar todos los partidos
 */
export const listMatches = async (): Promise<Match[]> => {
  // Sync from Supabase first if enabled
  await syncMatchesFromSupabase();
  return await getMatches();
};

/**
 * Obtener partidos por torneo
 */
export const getMatchesByTournament = async (tournamentId: string): Promise<Match[]> => {
  const matches = await listMatches();
  return matches.filter(m => m.tournamentId === tournamentId);
};

/**
 * Obtener partidos por estado
 */
export const getMatchesByStatus = async (status: 'scheduled' | 'live' | 'finished'): Promise<Match[]> => {
  const matches = await listMatches();
  return matches.filter(m => m.status === status);
};

/**
 * Obtener partidos en vivo
 */
export const getLiveMatches = async (): Promise<Match[]> => {
  return await getMatchesByStatus('live');
};

/**
 * Obtener próximos partidos
 */
export const getUpcomingMatches = async (limit?: number): Promise<Match[]> => {
  const matches = await listMatches();
  const now = new Date();
  
  const upcoming = matches
    .filter(m => m.status === 'scheduled' && new Date(m.date) > now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return limit ? upcoming.slice(0, limit) : upcoming;
};

/**
 * Obtener partidos por equipo
 */
export const getMatchesByTeam = async (teamName: string): Promise<Match[]> => {
  const matches = await listMatches();
  return matches.filter(m => m.homeTeam === teamName || m.awayTeam === teamName);
};

/**
 * Obtener partidos por fecha
 */
export const getMatchesByDate = async (date: Date): Promise<Match[]> => {
  const matches = await listMatches();
  const dateStr = date.toISOString().split('T')[0];
  
  return matches.filter(m => {
    const matchDate = new Date(m.date).toISOString().split('T')[0];
    return matchDate === dateStr;
  });
};

/**
 * Obtener un partido por ID
 */
export const getMatchById = async (matchId: string): Promise<Match | null> => {
  const matches = await listMatches();
  return matches.find(m => m.id === matchId) || null;
};

/**
 * Crear un nuevo partido
 */
export const createMatch = async (data: {
  tournamentId: string;
  round: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  status?: 'scheduled' | 'live' | 'finished';
}): Promise<Match> => {
  const matches = await getMatches();
  const id = `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const match: Match = {
    id,
    tournamentId: data.tournamentId,
    round: data.round,
    date: new Date(data.date).toISOString(),
    homeTeam: data.homeTeam,
    awayTeam: data.awayTeam,
    status: data.status || 'scheduled'
  };

  const updatedMatches = [...matches, match];
  await saveMatches(updatedMatches);

  // Sync to Supabase if enabled
  await syncMatchToSupabase(match);

  return match;
};

/**
 * Actualizar un partido
 */
export const updateMatch = async (matchId: string, data: Partial<Match>): Promise<Match> => {
  const matches = await getMatches();
  const matchIndex = matches.findIndex(m => m.id === matchId);

  if (matchIndex === -1) {
    throw new Error(`Match with id ${matchId} not found`);
  }

  const updatedMatch: Match = {
    ...matches[matchIndex],
    ...data
  };

  matches[matchIndex] = updatedMatch;
  await saveMatches(matches);

  // Sync to Supabase if enabled
  await syncMatchToSupabase(updatedMatch);

  return updatedMatch;
};

/**
 * Eliminar un partido
 */
export const deleteMatch = async (matchId: string): Promise<void> => {
  const matches = await getMatches();
  const filteredMatches = matches.filter(m => m.id !== matchId);
  
  await saveMatches(filteredMatches);

  // Delete from Supabase if enabled
  try {
    const { config } = await import('../lib/config');
    if (config.useSupabase) {
      const { getSupabaseClient } = await import('../lib/supabase');
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from('matches')
        .delete()
        .eq('id', matchId);

      if (error) {
        console.error('MatchService: Error deleting match from Supabase:', error);
      }
    }
  } catch (error) {
    console.error('MatchService: Failed to delete match from Supabase:', error);
  }
};

/**
 * Eliminar todos los partidos de un torneo
 */
export const deleteMatchesByTournament = async (tournamentId: string): Promise<number> => {
  const matches = await getMatches();
  const filteredMatches = matches.filter(m => m.tournamentId !== tournamentId);
  const deletedCount = matches.length - filteredMatches.length;
  
  await saveMatches(filteredMatches);

  // Delete from Supabase if enabled
  if (deletedCount > 0) {
    try {
      const { config } = await import('../lib/config');
      if (config.useSupabase) {
        const { getSupabaseClient } = await import('../lib/supabase');
        const supabase = getSupabaseClient();
        
        const { error } = await supabase
          .from('matches')
          .delete()
          .eq('tournament_id', tournamentId);

        if (error) {
          console.error('MatchService: Error deleting matches from Supabase:', error);
        }
      }
    } catch (error) {
      console.error('MatchService: Failed to delete matches from Supabase:', error);
    }
  }

  return deletedCount;
};

/**
 * Eliminar todos los partidos
 */
export const deleteAllMatches = async (): Promise<number> => {
  console.log('MatchService: Iniciando eliminación de todos los partidos...');
  
  // Primero sincronizar desde Supabase para tener todos los partidos actualizados
  await syncMatchesFromSupabase();
  
  // Obtener todos los partidos (después de sincronizar)
  const matches = await getMatches();
  const totalMatches = matches.length;
  
  if (totalMatches === 0) {
    console.log('MatchService: No hay partidos para eliminar');
    return 0;
  }
  
  console.log(`MatchService: Eliminando ${totalMatches} partidos...`);
  
  // Eliminar todos de Supabase primero (si está habilitado)
  let supabaseDeleted = false;
  try {
    const { config } = await import('../lib/config');
    if (config.useSupabase) {
      const { getSupabaseClient } = await import('../lib/supabase');
      const supabase = getSupabaseClient();
      
      // Eliminar todos los partidos de Supabase en una sola operación
      // Usar .neq('id', '') para seleccionar todos (todos los IDs no están vacíos)
      const { error, count } = await supabase
        .from('matches')
        .delete({ count: 'exact' })
        .neq('id', ''); // Eliminar todos

      if (error) {
        console.error('MatchService: Error eliminando todos los partidos de Supabase:', error);
        // Intentar método alternativo: eliminar por IDs si tenemos los partidos
        if (matches.length > 0) {
          const matchIds = matches.map(m => m.id);
          console.log(`MatchService: Intentando eliminar ${matchIds.length} partidos por ID...`);
          const { error: batchError } = await supabase
            .from('matches')
            .delete()
            .in('id', matchIds);
          
          if (batchError) {
            console.error('MatchService: Error eliminando partidos por ID:', batchError);
            throw batchError;
          } else {
            console.log(`MatchService: Eliminados ${matchIds.length} partidos de Supabase por ID`);
            supabaseDeleted = true;
          }
        } else {
          throw error;
        }
      } else {
        const deletedCount = count ?? totalMatches;
        console.log(`MatchService: Eliminados ${deletedCount} partidos de Supabase`);
        supabaseDeleted = true;
      }
    } else {
      console.log('MatchService: Supabase deshabilitado, solo eliminando de IndexedDB');
    }
  } catch (error) {
    console.error('MatchService: Error al eliminar partidos de Supabase:', error);
    // Continuar eliminando de IndexedDB incluso si falla Supabase
    // para mantener consistencia local
  }
  
  // Limpiar IndexedDB
  try {
    await dbService.clear(MATCHES_STORE);
    console.log(`MatchService: Eliminados ${totalMatches} partidos de IndexedDB`);
  } catch (error) {
    console.error('MatchService: Error limpiando IndexedDB:', error);
    throw error; // Este error es crítico, lanzarlo
  }

  // Si Supabase está habilitado pero no se eliminó correctamente, advertir
  if (!supabaseDeleted) {
    const { config } = await import('../lib/config');
    if (config.useSupabase) {
      console.warn('MatchService: ⚠️ Los partidos se eliminaron de IndexedDB pero puede que no se hayan eliminado de Supabase. Los partidos podrían reaparecer después de sincronizar.');
    }
  }

  console.log(`MatchService: ✅ Eliminación completada. Total eliminado: ${totalMatches}`);
  return totalMatches;
};

/**
 * Forzar sincronización desde Supabase (para uso en consola)
 */
export const forceSyncMatchesFromSupabase = async (): Promise<void> => {
  console.log('🔄 Forzando sincronización de partidos desde Supabase...');
  isSyncing = false; // Reset sync flag
  lastSyncTime = 0; // Reset cooldown
  await syncMatchesFromSupabase();
  console.log('✅ Sincronización completada');
};


