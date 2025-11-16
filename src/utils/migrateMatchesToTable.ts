/**
 * Script de migración: Migrar partidos desde tournaments.matches a tabla matches independiente
 * 
 * Este script:
 * 1. Lee todos los torneos
 * 2. Extrae los partidos del array matches de cada torneo
 * 3. Los migra a la tabla matches independiente
 * 4. Opcionalmente limpia el array matches de los torneos (manteniendo solo referencia)
 */

import { listTournaments, updateTournament } from './tournamentService';
import { createMatch, listMatches } from './matchService';
import { Tournament, Match } from '../types';

/**
 * Migrar partidos desde tournaments.matches a tabla matches
 */
export const migrateMatchesFromTournaments = async (options: {
  clearTournamentMatches?: boolean; // Si true, limpia el array matches de los torneos después de migrar
  dryRun?: boolean; // Si true, solo muestra qué se migraría sin hacer cambios
} = {}): Promise<{
  tournamentsProcessed: number;
  matchesMigrated: number;
  matchesSkipped: number;
  errors: string[];
}> => {
  const { clearTournamentMatches = false, dryRun = false } = options;
  
  console.log('🔄 Iniciando migración de partidos desde tournaments.matches a tabla matches...');
  if (dryRun) {
    console.log('🧪 MODO DRY RUN: No se realizarán cambios reales');
  }

  const result = {
    tournamentsProcessed: 0,
    matchesMigrated: 0,
    matchesSkipped: 0,
    errors: [] as string[]
  };

  try {
    // Obtener todos los torneos
    const tournaments = await listTournaments();
    console.log(`📋 Encontrados ${tournaments.length} torneos`);

    // Obtener partidos existentes para verificar duplicados
    const existingMatches = await listMatches();
    const existingMatchIds = new Set(existingMatches.map(m => m.id));
    console.log(`📋 Encontrados ${existingMatches.length} partidos existentes en tabla matches`);

    // Procesar cada torneo
    for (const tournament of tournaments) {
      result.tournamentsProcessed++;
      const tournamentMatches = tournament.matches || [];

      if (tournamentMatches.length === 0) {
        console.log(`⏭️  Torneo "${tournament.name}" no tiene partidos, saltando...`);
        continue;
      }

      console.log(`\n📊 Procesando torneo "${tournament.name}" (${tournamentMatches.length} partidos)...`);

      // Migrar cada partido
      for (const match of tournamentMatches) {
        try {
          // Verificar si el partido ya existe
          if (existingMatchIds.has(match.id)) {
            console.log(`  ⏭️  Partido ${match.id} ya existe, saltando...`);
            result.matchesSkipped++;
            continue;
          }

          if (!dryRun) {
            // Crear partido en la tabla independiente con todos los datos
            const { updateMatch } = await import('./matchService');
            
            const createdMatch = await createMatch({
              tournamentId: tournament.id,
              round: match.round,
              date: match.date,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              status: match.status
            });

            // Actualizar con datos adicionales si existen
            if (match.homeScore !== undefined || match.awayScore !== undefined || match.scorers || match.highlights) {
              await updateMatch(createdMatch.id, {
                homeScore: match.homeScore,
                awayScore: match.awayScore,
                scorers: match.scorers,
                highlights: match.highlights
              });
            }

            existingMatchIds.add(match.id);
          }

          result.matchesMigrated++;
          console.log(`  ✅ Partido ${match.id} migrado${dryRun ? ' (dry run)' : ''}`);
        } catch (error) {
          const errorMsg = `Error migrando partido ${match.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          console.error(`  ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }

      // Limpiar array matches del torneo si se solicita
      if (clearTournamentMatches && !dryRun) {
        try {
          const updatedTournament: Tournament = {
            ...tournament,
            matches: [] // Limpiar array, los partidos ahora están en tabla independiente
          };
          await updateTournament(updatedTournament);
          console.log(`  🧹 Array matches limpiado del torneo "${tournament.name}"`);
        } catch (error) {
          const errorMsg = `Error limpiando matches del torneo ${tournament.id}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
          console.error(`  ❌ ${errorMsg}`);
          result.errors.push(errorMsg);
        }
      }
    }

    console.log('\n✅ Migración completada');
    console.log(`📊 Resumen:`);
    console.log(`   • Torneos procesados: ${result.tournamentsProcessed}`);
    console.log(`   • Partidos migrados: ${result.matchesMigrated}`);
    console.log(`   • Partidos saltados: ${result.matchesSkipped}`);
    console.log(`   • Errores: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log('\n⚠️  Errores encontrados:');
      result.errors.forEach(error => console.log(`   • ${error}`));
    }

    return result;
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  }
};

/**
 * Función helper para usar desde consola del navegador
 */
if (typeof window !== 'undefined') {
  (window as any).migrateMatchesFromTournaments = migrateMatchesFromTournaments;
  console.log('💡 Función migrateMatchesFromTournaments disponible en consola:');
  console.log('   window.migrateMatchesFromTournaments({ dryRun: true }) // Probar primero');
  console.log('   window.migrateMatchesFromTournaments({ clearTournamentMatches: true }) // Migrar y limpiar');
}

