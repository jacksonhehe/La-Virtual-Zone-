import  { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializePlayerMarketData, forceCompleteMarketUpdate, checkCompleteMarketStatus } from './utils/marketRules';
import { clubs as seedClubs, players as seedPlayers } from './data/mockData';
import { saveClubs, listClubs } from './utils/clubService';
import { listPlayers, regeneratePlayers as regeneratePlayersFromService, savePlayers } from './utils/playerService';
import { listMatches } from './utils/matchService';
import { dbService } from './utils/indexedDBService';
import { TEST_USERS, listUsers } from './utils/authService';
// @ts-ignore - xlsx types are included
import * as XLSX from 'xlsx';
import { migrateFromLocalStorage, needsMigration, cleanupOldStorage } from './utils/indexedDBService';

// Auto-migrate from localStorage to IndexedDB on app start
(async () => {
  if (needsMigration()) {
    console.log('🔄 Detectados datos antiguos en localStorage, migrando a IndexedDB...');
    try {
      await migrateFromLocalStorage();
      cleanupOldStorage();
      try { localStorage.setItem('virtual_zone_migration_done', 'true'); } catch {}
      console.log('✅ Migración completada exitosamente');
    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      console.log('⚠️ Continuando con datos existentes...');
    }
  } else {
    console.log('✅ No se requiere migración de datos');
  }
})();

// Make market functions available globally for debugging
declare global {
  interface Window {
    updatePlayerMarketData: () => void;
    forceCompleteMarketUpdate: () => void;
    checkCompleteMarketStatus: () => void;
    refreshClubsFromSeed: () => void;
    refreshUsersFromSeed: () => void;
    forceUpdateClubs: () => void;
    forceUpdatePlayers: () => void;
    forceRegeneratePlayersFromSeed: () => void;
    checkClubsStatus: () => void;
    checkDataIntegrity: () => any;
    checkClubFinances: (clubName: string) => any;
    testRefreshClubsButton: () => any;
    testRefreshUsersButton: () => any;
    testSalaryValueAdjustments: () => void;
    resetAllData: () => void;
    testClubPersistence: () => Promise<void>;
    cleanLocalStorage: () => void;
    migrateToSupabase: () => Promise<void>;
    toggleSupabaseMode: () => Promise<void>;
    createAdminUser: () => Promise<void>;
    fixAdminRole: () => Promise<void>;
    recreateAdminUser: () => Promise<void>;
    diagnoseAdminSync: () => Promise<void>;
    checkPlayerSync: (playerIdOrName: string) => Promise<void>;
    testPlayerEditSync: (playerIdOrName: string) => Promise<void>;
    syncAllPlayersToSupabase: () => Promise<void>;
    syncAllTournamentsToSupabase: () => Promise<void>;
    initializePosts: () => Promise<void>;
    clearPosts: () => Promise<void>;
    syncPostsToSupabase: () => Promise<void>;
    checkSupabaseTableSchema: (tableName?: string) => Promise<void>;
    checkRLSPolicies: (tableName?: string) => Promise<void>;
    generateRLSPolicies: (tableName?: string) => void;
    diagnoseSupabase: () => Promise<void>;
    seedClubs: any[];
  }
}

// Data initialization is now handled by the dataStore automatically
// These setTimeout calls have been removed to prevent conflicts

// Initialize market data adjustments on app start (only once per session)
setTimeout(() => {
  // Check if we have existing players data (not seed data)
  const existingPlayers = localStorage.getItem('virtual_zone_players');
  const hasExistingData = existingPlayers && existingPlayers.length > 10000; // Seed data is much larger

  if (!localStorage.getItem('virtual_zone_salaries_updated') && !hasExistingData) {
    console.log('🚀 Iniciando La Virtual Zone - Ajustando datos de mercado (primera vez)...');
    initializePlayerMarketData();
  } else {
    console.log('✅ Datos de mercado ya inicializados o datos existentes preservados');
  }
}, 1000); // Small delay to ensure dataStore is ready

// Authentication initialization moved to App.tsx

// Initialize tournament sync after clubs are loaded
setTimeout(() => {
  console.log('🔄 Sincronizando torneos con clubes actuales...');
  // Import the store dynamically to avoid circular dependencies
  import('./store/dataStore').then(({ useDataStore }) => {
    const store = useDataStore.getState();
    store.initializeTournamentSync();
    console.log('✅ Torneos sincronizados con clubes actuales');
  });
}, 1500); // After auth initialization (1000ms) + clubs initialization (500ms) + buffer

// Make functions available globally after app loads
setTimeout(() => {
  window.updatePlayerMarketData = initializePlayerMarketData;
  window.forceCompleteMarketUpdate = forceCompleteMarketUpdate;
  window.checkCompleteMarketStatus = checkCompleteMarketStatus;

  // Club management functions
  window.refreshClubsFromSeed = async () => {
    console.log('🔄 Refrescando clubes desde datos seed...');
    console.log(`📊 Intentando guardar ${seedClubs.length} clubes...`);

    try {
      // Limpiar datos existentes primero
      localStorage.removeItem('virtual_zone_clubs');
      localStorage.removeItem('virtual_zone_clubs_updated');

      // Guardar todos los clubes
      await saveClubs(seedClubs as any);
      localStorage.setItem('virtual_zone_clubs_updated', 'true');

      // Verificar que se guardaron correctamente
      const savedClubs = await listClubs();
      console.log(`✅ Guardados ${savedClubs.length} clubes en IndexedDB`);

      if (savedClubs.length !== seedClubs.length) {
        console.error(`❌ ERROR: Se esperaban ${seedClubs.length} clubes pero se guardaron ${savedClubs.length}`);
        console.log('🔧 Intentando guardar nuevamente...');

        // Intentar guardar nuevamente si faltan clubes
        await saveClubs(seedClubs as any);
        const retryClubs = await listClubs();
        console.log(`🔄 Reintento: ${retryClubs.length} clubes guardados`);
      }

      // Force refresh the data store
      if (typeof window !== 'undefined' && (window as any).useDataStore) {
        const store = (window as any).useDataStore.getState();
        await store.refreshClubs();
        console.log('🔄 Store de datos refrescado');
      }

      console.log(`🎉 Proceso completado: ${savedClubs.length} clubes disponibles`);
    } catch (error) {
      console.error('❌ Error al refrescar clubes:', error);
    }
  };

  window.refreshUsersFromSeed = () => {
    console.log('🔄 Refrescando usuarios desde datos seed...');

    // Clear existing users
    localStorage.removeItem('virtual_zone_users');

    // Clean TEST_USERS to remove any club assignments for DTs
    const cleanTestUsers = TEST_USERS.map(user => ({
      ...user,
      // Remove club assignments for DTs to make them available
      clubId: undefined,
      club: undefined
    }));

    // Save cleaned test users
    localStorage.setItem('virtual_zone_users', JSON.stringify(cleanTestUsers));
    console.log(`✅ Refrescados ${cleanTestUsers.length} usuarios desde seed data`);
    console.log(`ℹ️ Todos los DTs ahora están disponibles (sin club asignado)`);
  };

  // Match counting function
  window.countMatches = async () => {
    try {
      console.log('🔍 Contando partidos...');
      const matches = await listMatches();
      
      console.log('\n📊 ESTADÍSTICAS DE PARTIDOS:');
      console.log('═══════════════════════════════════════');
      console.log(`Total de partidos: ${matches.length}`);
      console.log(`\nPor estado:`);
      console.log(`  • Programados: ${matches.filter(m => m.status === 'scheduled').length}`);
      console.log(`  • En vivo: ${matches.filter(m => m.status === 'live').length}`);
      console.log(`  • Finalizados: ${matches.filter(m => m.status === 'finished').length}`);
      
      // Contar por torneo
      const byTournament: Record<string, number> = {};
      matches.forEach(match => {
        const tournamentId = match.tournamentId || 'Sin torneo';
        if (!byTournament[tournamentId]) {
          byTournament[tournamentId] = 0;
        }
        byTournament[tournamentId]++;
      });

      if (Object.keys(byTournament).length > 0) {
        console.log(`\nPor torneo:`);
        Object.entries(byTournament).forEach(([tournamentId, count]) => {
          console.log(`  • ${tournamentId}: ${count} partidos`);
        });
      }

      // Mostrar algunos ejemplos
      if (matches.length > 0) {
        console.log(`\nPrimeros 5 partidos:`);
        matches.slice(0, 5).forEach((match, index) => {
          console.log(`  ${index + 1}. ${match.homeTeam} vs ${match.awayTeam} (${match.status})`);
        });
      }

      console.log('═══════════════════════════════════════\n');

      return {
        total: matches.length,
        scheduled: matches.filter(m => m.status === 'scheduled').length,
        live: matches.filter(m => m.status === 'live').length,
        finished: matches.filter(m => m.status === 'finished').length,
        byTournament
      };
    } catch (error) {
      console.error('❌ Error contando partidos:', error);
      return null;
    }
  };

  window.forceUpdateClubs = async () => {
    console.log('⚡ Forzando actualización completa de clubes...');

    try {
      // Clear localStorage
      localStorage.removeItem('virtual_zone_clubs');
      localStorage.removeItem('virtual_zone_clubs_updated');
      localStorage.removeItem('virtual_zone_initialized');

      // Clear any other potential keys related to clubs
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('club') || key.includes('player'))) {
          localStorage.removeItem(key);
        }
      }

      console.log(`📊 Guardando ${seedClubs.length} clubes...`);

      // Save clubs with verification
      await saveClubs(seedClubs as any);
      localStorage.setItem('virtual_zone_clubs_updated', 'true');

      // Verify the save was successful
      const verifiedClubs = await listClubs();
      console.log(`✅ Verificación: ${verifiedClubs.length} clubes guardados`);

      if (verifiedClubs.length !== seedClubs.length) {
        console.error(`❌ ERROR: Se esperaban ${seedClubs.length} pero se guardaron ${verifiedClubs.length}`);

        // Try one more time
        console.log('🔄 Intentando guardar nuevamente...');
        await saveClubs(seedClubs as any);
        const finalClubs = await listClubs();
        console.log(`🔄 Resultado final: ${finalClubs.length} clubes`);
      }

      // Force refresh data store
      if (typeof window !== 'undefined' && (window as any).useDataStore) {
        const store = (window as any).useDataStore.getState();
        await store.refreshClubs();
        console.log('🔄 Store refrescado');
      }

      console.log(`🎉 Actualización forzada completada: ${verifiedClubs.length} clubes disponibles`);
    } catch (error) {
      console.error('❌ Error en forceUpdateClubs:', error);
    }
  };

  // Exponer seedClubs globalmente para funciones de prueba
  (window as any).seedClubs = seedClubs;

  window.forceUpdatePlayers = () => {
    console.log('⚠️ ADVERTENCIA: Esta función regenerará TODOS los jugadores desde datos seed');
    console.log('Esto BORRARÁ todas las ediciones y cambios realizados por usuarios');
    console.log('¿Estás seguro? Si no quieres perder los cambios, usa forceRegeneratePlayersFromSeed() en su lugar');

    if (confirm('¿Estás seguro de que quieres regenerar TODOS los jugadores? Esto borrará todas las ediciones.')) {
      // Clear players localStorage
      localStorage.removeItem('virtual_zone_players');
      localStorage.removeItem('virtual_zone_players_updated');

      // Regenerate players from seed data
      savePlayers(seedPlayers);
      localStorage.setItem('virtual_zone_players_updated', 'true');

      console.log(`✅ Regenerados ${seedPlayers.length} jugadores desde datos seed (${seedClubs.length} clubes × 23 jugadores)`);
      console.log('💡 Recarga la página para ver los cambios');
    } else {
      console.log('❌ Operación cancelada');
    }
  };

  // New function to safely regenerate players from seed data
  window.forceRegeneratePlayersFromSeed = () => {
    console.log('⚡ Regenerando jugadores desde datos seed (preservando estructura)...');
    // Clear players localStorage
    localStorage.removeItem('virtual_zone_players');
    localStorage.removeItem('virtual_zone_players_updated');

    // Regenerate players using the service method
    regeneratePlayersFromService();
    localStorage.setItem('virtual_zone_players_updated', 'true');

    const updatedPlayers = listPlayers();
    console.log(`✅ Regenerados ${updatedPlayers.length} jugadores desde datos seed usando regeneratePlayersFromService()`);
    console.log('💡 Recarga la página para ver los cambios');
  };

  window.checkClubsStatus = async () => {
    const currentClubs = await listClubs();
    const currentPlayers = await listPlayers();
    const expectedPlayers = seedClubs.length * 23;

    console.log('📊 Estado actual de clubes:');
    console.log(`- Clubes en localStorage: ${currentClubs.length}`);
    console.log(`- Clubes en seed data: ${seedClubs.length}`);
    console.log(`- Estado clubes actualizado: ${localStorage.getItem('virtual_zone_clubs_updated') ? '✅' : '❌'}`);

    console.log('\n📊 Estado actual de jugadores:');
    console.log(`- Jugadores en localStorage: ${currentPlayers.length}`);
    console.log(`- Jugadores esperados: ${expectedPlayers}`);
    console.log(`- Estado jugadores actualizado: ${localStorage.getItem('virtual_zone_players_updated') ? '✅' : '❌'}`);

    console.log('\n🏆 Clubes actuales:');
    currentClubs.slice(0, 10).forEach((club, index) => {
      console.log(`  ${index + 1}. ${club.name} (${club.id})`);
    });

    if (currentClubs.length > 10) {
      console.log(`  ... y ${currentClubs.length - 10} clubes más`);
    }

    // Check if we have the new clubs (41-48)
    const newClubs = currentClubs.filter(club => club.id.startsWith('club4') && parseInt(club.id.replace('club', '')) >= 41);
    console.log(`\n🆕 Clubes nuevos (41-48): ${newClubs.length} encontrados`);
    if (newClubs.length > 0) {
      newClubs.forEach(club => console.log(`  ✅ ${club.name}`));
    }

    console.log(`\n🎯 Resumen: ${currentClubs.length === seedClubs.length && currentPlayers.length === expectedPlayers ? '✅ Todo correcto' : '❌ Problema detectado'}`);
  };

  window.testRefreshUsersButton = () => {
    console.log('🧪 Probando el botón "Refrescar" de la sección Usuarios...');

    // Guardar estado inicial
    const initialUsers = listUsers();
    console.log(`📊 Estado inicial: ${initialUsers.length} usuarios`);

    // Simular lo que hace el botón "Refrescar"
    console.log('\n1️⃣ Ejecutando refreshUsersFromSeed()...');
    try {
      (window as any).refreshUsersFromSeed();
      console.log('✅ refreshUsersFromSeed() ejecutado');
    } catch (error) {
      console.log('❌ Error ejecutando refreshUsersFromSeed():', error);
      return;
    }

    // Esperar un poco y verificar
    setTimeout(() => {
      console.log('\n2️⃣ Verificando estado después del refresh...');
      const afterRefresh = listUsers();
      console.log(`📊 Estado después: ${afterRefresh.length} usuarios`);

      // Verificar si cambió la cantidad
      const usersChanged = initialUsers.length !== afterRefresh.length;
      console.log(`🔄 Cantidad de usuarios cambió: ${usersChanged ? 'SÍ' : 'NO'}`);

      // Verificar si los datos son consistentes
      const expectedUsers = TEST_USERS.length;
      console.log(`🎯 Usuarios esperados en seed: ${expectedUsers}`);

      const dataConsistent = afterRefresh.length === expectedUsers;
      console.log(`✅ Datos consistentes: ${dataConsistent ? 'SÍ' : 'NO'}`);

      if (dataConsistent) {
        console.log('\n🎉 El botón "Refrescar" funciona correctamente!');
        console.log('Los usuarios han sido restaurados desde los datos seed.');
      } else {
        console.log('\n⚠️ Posible problema con el botón "Refrescar"');
        console.log('La cantidad de usuarios no coincide con los datos seed.');
      }

      // Mostrar algunos usuarios como ejemplo
      console.log('\n📋 Ejemplo de usuarios restaurados:');
      afterRefresh.slice(0, 3).forEach((user: any, i: number) => {
        console.log(`   ${i + 1}. ${user.username} (${user.email}) - Rol: ${user.role}`);
      });

      return {
        success: dataConsistent,
        initialCount: initialUsers.length,
        finalCount: afterRefresh.length,
        expectedCount: expectedUsers,
        users: afterRefresh
      };

    }, 1000); // Esperar 1 segundo para que se complete la operación
  };

  window.testRefreshClubsButton = async () => {
    console.log('🧪 Probando el botón "Refrescar" de la sección Clubes...');

    // Guardar estado inicial
    const initialClubs = await listClubs();
    console.log(`📊 Estado inicial: ${initialClubs.length} clubes`);

    // Simular lo que hace el botón "Refrescar"
    console.log('\n1️⃣ Ejecutando refreshClubsFromSeed()...');
    try {
      (window as any).refreshClubsFromSeed();
      console.log('✅ refreshClubsFromSeed() ejecutado');
    } catch (error) {
      console.log('❌ Error ejecutando refreshClubsFromSeed():', error);
      return;
    }

    // Esperar un poco y verificar
    setTimeout(async () => {
      console.log('\n2️⃣ Verificando estado después del refresh...');
      const afterRefresh = await listClubs();
      console.log(`📊 Estado después: ${afterRefresh.length} clubes`);

      // Verificar si cambió la cantidad
      const clubsChanged = initialClubs.length !== afterRefresh.length;
      console.log(`🔄 Cantidad de clubes cambió: ${clubsChanged ? 'SÍ' : 'NO'}`);

      // Verificar si los datos son consistentes
      const seedClubsLength = (window as any).seedClubs ? (window as any).seedClubs.length : 'desconocido';
      console.log(`🎯 Clubes esperados en seed: ${seedClubsLength}`);

      const dataConsistent = afterRefresh.length === parseInt(seedClubsLength as string);
      console.log(`✅ Datos consistentes: ${dataConsistent ? 'SÍ' : 'NO'}`);

      if (dataConsistent) {
        console.log('\n🎉 El botón "Refrescar" funciona correctamente!');
        console.log('Los clubes han sido restaurados desde los datos seed.');
      } else {
        console.log('\n⚠️ Posible problema con el botón "Refrescar"');
        console.log('La cantidad de clubes no coincide con los datos seed.');
      }

      // Mostrar algunos clubes como ejemplo
      console.log('\n📋 Ejemplo de clubes restaurados:');
      afterRefresh.slice(0, 3).forEach((club: any, i: number) => {
        console.log(`   ${i + 1}. ${club.name} (${club.id}) - Presupuesto: ${club.budget.toLocaleString()}€`);
      });

      return {
        success: dataConsistent,
        initialCount: initialClubs.length,
        finalCount: afterRefresh.length,
        expectedCount: parseInt(seedClubsLength as string),
        clubs: afterRefresh
      };

    }, 1500); // Esperar 1.5 segundos para que se complete la operación
  };

  window.checkClubBackupStatus = () => {
    console.log('🔍 Verificando estado de backups de clubes...');

    const backupData = localStorage.getItem('virtual_zone_clubs_backup');
    const updatedFlag = localStorage.getItem('virtual_zone_clubs_updated');

    console.log(`📊 Flag de actualización: ${updatedFlag ? '✅ Presente' : '❌ Ausente'}`);

    if (backupData) {
      try {
        const backupClubs = JSON.parse(backupData);
        console.log(`📦 Backup encontrado: ${backupClubs.length} clubes`);

        // Show some sample data
        if (backupClubs.length > 0) {
          console.log('📋 Muestra de backup:');
          backupClubs.slice(0, 3).forEach((club: any, i: number) => {
            console.log(`  ${i+1}. ${club.name} (${club.budget?.toLocaleString() || 'N/A'}€)`);
          });
        }

        // Compare with current data
        listClubs().then(currentClubs => {
          const differences = backupClubs.filter((backupClub: any) =>
            !currentClubs.some(currentClub => currentClub.id === backupClub.id)
          );

          if (differences.length > 0) {
            console.log(`⚠️ ${differences.length} clubes en backup no están en BD actual`);
          } else {
            console.log('✅ Backup sincronizado con BD actual');
          }
        });

      } catch (error) {
        console.error('❌ Error parseando backup:', error);
      }
    } else {
      console.log('📦 No hay backup disponible');
    }

    return {
      hasBackup: !!backupData,
      isUpdated: updatedFlag === 'true',
      backupSize: backupData ? backupData.length : 0
    };
  };

  window.checkClubChangesPersistence = () => {
    console.log('🔍 Verificando persistencia de cambios en clubes...');

    const clubs = listClubs();
    const store = (window as any).useDataStore?.getState();
    const storeClubs = store?.clubs || [];

    console.log(`📊 Total de clubes: ${clubs.length} (IndexedDB) vs ${storeClubs.length} (Store)`);

    // Verificar si hay diferencias entre IndexedDB y Store
    const differences = [];
    clubs.forEach((club, index) => {
      const storeClub = storeClubs.find((sc: any) => sc.id === club.id);
      if (storeClub) {
        const clubDiff = {
          id: club.id,
          name: club.name,
          differences: {}
        };

        // Comparar campos importantes
        ['name', 'logo', 'budget', 'playStyle', 'manager'].forEach(field => {
          if (club[field as keyof typeof club] !== storeClub[field as keyof typeof storeClub]) {
            (clubDiff.differences as any)[field] = {
              indexeddb: club[field as keyof typeof club],
              store: storeClub[field as keyof typeof storeClub]
            };
          }
        });

        if (Object.keys(clubDiff.differences).length > 0) {
          differences.push(clubDiff);
        }
      } else {
        differences.push({
          id: club.id,
          name: club.name,
          issue: 'Club existe en IndexedDB pero no en Store'
        });
      }
    });

    if (differences.length === 0) {
      console.log('✅ Todos los clubes están sincronizados correctamente entre IndexedDB y Store');
    } else {
      console.log('❌ Se encontraron diferencias:');
      differences.forEach(diff => console.log('  ', diff));
    }

    // Verificar cambios recientes (últimos 5 minutos)
    const recentChanges = clubs.filter(club => {
      // Esta es una verificación básica - en producción tendrías timestamps
      return club.name.includes('Editado') || club.budget > 100000000; // Valores altos indican cambios
    });

    console.log(`📝 Clubes con posibles cambios recientes: ${recentChanges.length}`);
    recentChanges.slice(0, 3).forEach(club => {
      console.log(`  • ${club.name}: Presupuesto ${club.budget.toLocaleString()}€`);
    });

    return {
      totalClubs: clubs.length,
      storeClubs: storeClubs.length,
      differences: differences.length,
      recentChanges: recentChanges.length,
      isSynchronized: differences.length === 0
    };
  };

  window.diagnoseClubsIssue = () => {
    console.log('🔍 Diagnóstico completo de clubes:');

    // Verificar datos en seed
    console.log(`📊 Datos seed: ${seedClubs.length} clubes`);

    // Verificar datos en IndexedDB
    listClubs().then(clubsFromDB => {
      console.log(`📊 Datos en IndexedDB: ${clubsFromDB.length} clubes`);

      // Verificar si faltan clubes
      const seedIds = seedClubs.map(c => c.id).sort();
      const dbIds = clubsFromDB.map(c => c.id).sort();
      const missingClubs = seedIds.filter(id => !dbIds.includes(id));
      const extraClubs = dbIds.filter(id => !seedIds.includes(id));

      console.log(`❌ Clubes faltantes: ${missingClubs.length}`, missingClubs);
      console.log(`➕ Clubes extra: ${extraClubs.length}`, extraClubs);

      // Verificar datos del store
      if (typeof window !== 'undefined' && (window as any).useDataStore) {
        const store = (window as any).useDataStore.getState();
        console.log(`📊 Datos en store: ${store.clubs?.length || 0} clubes`);
        console.log(`🔄 Store inicializado: ${store.isDataLoaded}`);
      }

      // Mostrar algunos clubes de ejemplo
      console.log('📋 Primeros 5 clubes en seed:');
      seedClubs.slice(0, 5).forEach((c, i) => console.log(`  ${i+1}. ${c.name} (${c.id})`));

      console.log('📋 Primeros 5 clubes en DB:');
      clubsFromDB.slice(0, 5).forEach((c, i) => console.log(`  ${i+1}. ${c.name} (${c.id})`));

      // Verificar si los datos están completos
      const hasAllClubs = clubsFromDB.length === seedClubs.length;
      const hasCorrectIds = missingClubs.length === 0;

      console.log(`\n✅ Todos los clubes presentes: ${hasAllClubs}`);
      console.log(`✅ IDs correctos: ${hasCorrectIds}`);

      if (!hasAllClubs || !hasCorrectIds) {
        console.log('\n🔧 SOLUCIÓN: Ejecutar window.forceUpdateClubs() para restaurar todos los clubes');
      }

      return {
        seedCount: seedClubs.length,
        dbCount: clubsFromDB.length,
        missingClubs,
        extraClubs,
        hasAllClubs,
        hasCorrectIds
      };
    }).catch(error => {
      console.error('❌ Error al acceder a IndexedDB:', error);
    });
  };

  window.checkClubFinances = (clubName: string) => {
    const players = listPlayers();
    const clubs = listClubs();
    const transfers = localStorage.getItem('virtual_zone_transfers');
    const transfersData: any[] = transfers ? JSON.parse(transfers) : [];

    // Find club by name (case insensitive, replace spaces with dashes)
    const club = clubs.find(c => c.name.toLowerCase().replace(/\s+/g, '-') === clubName?.toLowerCase().replace(/\s+/g, '-'));
    if (!club) {
      console.log(`❌ Club "${clubName}" no encontrado`);
      console.log('Clubes disponibles:', clubs.map(c => c.name).slice(0, 5));
      return;
    }

    console.log(`💰 Verificando finanzas de: ${club.name}`);
    console.log(`📊 Presupuesto base: ${club.budget.toLocaleString()}€`);

    // Get club players and transfers
    const clubPlayers = players.filter(p => p.clubId === club.id);
    const clubTransfers = transfersData.filter((t: any) => t.fromClub === club.name || t.toClub === club.name);

    console.log(`\n👥 Plantilla:`);
    console.log(`   • ${clubPlayers.length} jugadores`);
    console.log(`   • Media general: ${clubPlayers.length > 0 ? Math.round(clubPlayers.reduce((sum, p) => sum + p.overall, 0) / clubPlayers.length) : 0}`);

    // Calculate finances
    const squadMarketValue = clubPlayers.reduce((sum, p) => sum + ((p as any).transferValue || (p as any).value || 0), 0);
    const totalPlayerSalaries = clubPlayers.reduce((sum, p) => sum + ((p as any).contract?.salary || 0), 0);

    const income = clubTransfers
      .filter((t: any) => t.fromClub === club.name)
      .reduce((sum: number, t: any) => sum + (t.fee || t.value || 0), 0);

    const expenses = clubTransfers
      .filter((t: any) => t.toClub === club.name)
      .reduce((sum: number, t: any) => sum + (t.fee || t.value || 0), 0);

    const totalIncome = income;
    const totalExpenses = expenses + totalPlayerSalaries;
    const totalBalance = totalIncome - totalExpenses;
    const netWorth = club.budget + totalBalance;

    console.log(`   • Valor de mercado: ${squadMarketValue.toLocaleString()}€`);
    console.log(`   • Salarios totales: ${totalPlayerSalaries.toLocaleString()}€`);

    console.log(`\n💸 Balance financiero:`);
    console.log(`   • Ingresos por ventas: +${income.toLocaleString()}€`);
    console.log(`   • Gastos por compras: -${expenses.toLocaleString()}€`);
    console.log(`   • Gastos por salarios: -${totalPlayerSalaries.toLocaleString()}€`);
    console.log(`   • Balance neto: ${totalBalance >= 0 ? '+' : ''}${totalBalance.toLocaleString()}€`);
    console.log(`   • Valor neto total: ${netWorth.toLocaleString()}€`);

    console.log(`\n📋 Transferencias (${clubTransfers.length}):`);
    clubTransfers.slice(0, 5).forEach((transfer: any) => {
      const isIncoming = transfer.toClub === club.name;
      console.log(`   • ${transfer.playerName}: ${transfer.fromClub} → ${transfer.toClub} (${isIncoming ? '-' : '+'}${(transfer.fee || transfer.value || 0).toLocaleString()}€)`);
    });

    if (clubTransfers.length > 5) {
      console.log(`   ... y ${clubTransfers.length - 5} transferencias más`);
    }

    // Check for potential issues
    const issues: string[] = [];
    if (clubPlayers.length === 0) issues.push('No hay jugadores en la plantilla');
    if (totalPlayerSalaries === 0 && clubPlayers.length > 0) issues.push('Los jugadores no tienen salarios asignados');
    if (squadMarketValue === 0 && clubPlayers.length > 0) issues.push('Los jugadores no tienen valores de mercado');

    if (issues.length > 0) {
      console.log(`\n⚠️ Posibles problemas:`);
      issues.forEach(issue => console.log(`   • ${issue}`));
    } else {
      console.log(`\n✅ Datos de finanzas parecen correctos`);
    }

    return {
      club: club.name,
      players: clubPlayers.length,
      transfers: clubTransfers.length,
      budget: club.budget,
      squadValue: squadMarketValue,
      totalSalaries: totalPlayerSalaries,
      income,
      expenses,
      netBalance: totalBalance,
      netWorth,
      issues
    };
  };

  window.testSalaryValueAdjustments = () => {
    console.log('🧪 Probando funciones de ajuste de salarios y valores...');

    // Guardar estado inicial
    const initialData = (window as any).checkDataIntegrity();

    console.log('\n⚠️ ADVERTENCIA: Estos botones ahora ajustan TODOS los valores según tablas de mercado');
    console.log('Esto sobrescribirá cualquier edición manual que hayas hecho');

    if (confirm('¿Estás seguro de ejecutar la prueba? Esto cambiará TODOS los salarios y valores.')) {
      console.log('\n1️⃣ Probando ajuste de salarios...');
      // Importar la función dinámicamente para evitar problemas de importación
      import('./utils/marketRules').then(({ adjustAllPlayerSalaries }) => {
        const salaryResult = adjustAllPlayerSalaries();
        console.log(`Resultado: ${salaryResult.updated} jugadores ajustados`);

        console.log('\n2️⃣ Probando ajuste de valores de mercado...');
        import('./utils/marketRules').then(({ adjustAllPlayerMarketValues }) => {
          const valueResult = adjustAllPlayerMarketValues();
          console.log(`Resultado: ${valueResult.updated} jugadores ajustados`);

          console.log('\n3️⃣ Verificando estado final...');
          const finalData = (window as any).checkDataIntegrity();

          console.log('\n📊 Comparación antes/después:');
          console.log(`- Todos los salarios ajustados a valores de tabla de mercado`);
          console.log(`- Todos los valores de mercado ajustados a valores de tabla de mercado`);
          console.log(`- Imágenes personalizadas: ${initialData.playersWithImages} → ${finalData.playersWithImages} (deberían preservarse)`);

          const imagesPreserved = finalData.playersWithImages === initialData.playersWithImages;

          console.log(`\n${imagesPreserved ? '✅' : '❌'} Prueba ${imagesPreserved ? 'EXITOSA' : 'FALLIDA'}`);
          if (imagesPreserved) {
            console.log('Las imágenes se preservaron correctamente, pero salarios y valores fueron ajustados!');
          } else {
            console.log('ERROR: Las imágenes también se perdieron');
          }

          return {
            salaryAdjustments: salaryResult.updated,
            valueAdjustments: valueResult.updated,
            imagesPreserved,
            initial: initialData,
            final: finalData
          };
        });
      });
    } else {
      console.log('❌ Prueba cancelada por el usuario');
    }
  };

  window.checkDataIntegrity = () => {
    const players = listPlayers();
    const clubs = listClubs();
    const transfers = localStorage.getItem('virtual_zone_transfers');

    console.log('🔍 Verificando integridad de datos:');
    console.log(`- Jugadores en localStorage: ${players.length}`);
    console.log(`- Clubes en localStorage: ${clubs.length}`);
    console.log(`- Transfers en localStorage: ${transfers ? JSON.parse(transfers).length : 0}`);

    const editedPlayers = players.filter(p => (p.contract?.salary || 0) > 100000 || (p.transferValue || 0) > 500000);
    const playersWithImages = players.filter(p => p.image && p.image !== '/default.png');
    const lowSalaryPlayers = players.filter(p => (p.contract?.salary || 0) < 100000 && (p.contract?.salary || 0) > 0);
    const lowValuePlayers = players.filter(p => (p.transferValue || 0) < 500000 && (p.transferValue || 0) > 0);

    console.log(`- Jugadores con datos editados: ${editedPlayers.length}`);
    console.log(`- Jugadores con imágenes personalizadas: ${playersWithImages.length}`);
    console.log(`- Jugadores con salarios bajos (< 100k): ${lowSalaryPlayers.length}`);
    console.log(`- Jugadores con valores bajos (< 500k): ${lowValuePlayers.length}`);

    const salariesUpdated = localStorage.getItem('virtual_zone_salaries_updated');
    const marketValuesUpdated = localStorage.getItem('virtual_zone_market_values_updated');

    console.log(`- Salarios actualizados: ${salariesUpdated ? '✅' : '❌'}`);
    console.log(`- Valores de mercado actualizados: ${marketValuesUpdated ? '✅' : '❌'}`);

    if (editedPlayers.length > 0) {
      console.log('⚠️ Se detectaron datos editados manualmente');
      console.log('💡 Los botones "Ajustar Salarios/Valores" SOBRESCRIBIRÁN estos valores');
    }

    console.log('📊 Los botones "Ajustar Salarios/Valores" funcionarán en TODOS los casos:');
    console.log(`   • Afectarán a todos los ${players.length} jugadores`);
    console.log(`   • Ajustarán salarios y valores según tablas de mercado oficiales`);
    console.log(`   • PRESERVARÁN las imágenes personalizadas`);

    if (playersWithImages.length > 0) {
      console.log('🖼️ Jugadores con imágenes personalizadas:');
      playersWithImages.slice(0, 3).forEach(p => {
        console.log(`   • ${p.name}: ${p.image.startsWith('data:') ? 'Base64' : 'URL'} (${p.image.length} chars)`);
      });
    }

    return {
      players: players.length,
      clubs: clubs.length,
      transfers: transfers ? JSON.parse(transfers).length : 0,
      editedPlayers: editedPlayers.length,
      playersWithImages: playersWithImages.length,
      lowSalaryPlayers: lowSalaryPlayers.length,
      lowValuePlayers: lowValuePlayers.length,
      salariesUpdated: !!salariesUpdated,
      marketValuesUpdated: !!marketValuesUpdated
    };
  };

  // Export players data to Excel file
  window.exportPlayersData = () => {
    console.log('🔄 Exportando datos de jugadores a Excel...');
    try {
      const { useDataStore } = require('./store/dataStore');
      const players = useDataStore.getState().players;
      const clubs = useDataStore.getState().clubs;

      if (!players || players.length === 0) {
        console.error('❌ No hay jugadores para exportar');
        return;
      }

      // Use XLSX directly
      (async () => {
        try {
        // Función para truncar texto largo (límite de Excel: 32,767 caracteres)
        const truncateText = (text: string, maxLength: number = 1000) => {
          if (!text || text.length <= maxLength) return text;
          return text.substring(0, maxLength - 3) + '...';
        };

        // Función para extraer solo el nombre del archivo de imagen
        const getImageFilename = (imageUrl: string) => {
          if (!imageUrl) return '';
          try {
            const url = new URL(imageUrl);
            const pathname = url.pathname;
            const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
            return filename || truncateText(imageUrl, 100);
          } catch {
            // Si no es una URL válida, truncar normalmente
            return truncateText(imageUrl, 100);
          }
        };

        // Convert players data to Excel format
        const excelData = players.map(player => ({
          ID: player.id,
          Nombre: truncateText(player.name, 100),
          Edad: player.age,
          Posición: player.position,
          Media: player.overall,
          Valor: player.transferValue,
          Salario: player.contract?.salary || 0,
          Club: truncateText(clubs.find(c => c.id === player.clubId)?.name || 'Sin club', 50),
          Imagen: getImageFilename(player.image || ''), // Solo nombre del archivo
          Altura: player.height || '',
          Peso: player.weight || '',
          Nacionalidad: truncateText(player.nationality || '', 50),
          Dorsal: player.dorsal || '',
          Ataque: player.attributes?.shooting || '',
          Defensa: player.attributes?.defending || '',
          Velocidad: player.attributes?.pace || '',
          Técnica: player.attributes?.passing || '',
          Fuerza: player.attributes?.physical || '',
          Mental: player.attributes?.defending || '',
          Portería: player.attributes?.goalkeeping || '',
          Resistencia_Lesiones: player.injuryResistance || 2,
          Partidos: player.matches || 0,
          Transferible: player.transferListed ? 'Sí' : 'No'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        const colWidths = [
          { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 8 },
          { wch: 12 }, { wch: 12 }, { wch: 20 }, { wch: 30 }, { wch: 10 },
          { wch: 10 }, { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 },
          { wch: 10 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 },
          { wch: 18 }, { wch: 10 }, { wch: 12 }
        ];
        ws['!cols'] = colWidths;

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Jugadores');

        // Add metadata sheet
        const metadata = [
          { Propiedad: 'Versión', Valor: '1.0' },
          { Propiedad: 'Fecha Exportación', Valor: new Date().toISOString() },
          { Propiedad: 'Total Jugadores', Valor: players.length },
          { Propiedad: 'Aplicación', Valor: 'Virtual Zone' }
        ];
        const wsMeta = XLSX.utils.json_to_sheet(metadata);
        XLSX.utils.book_append_sheet(wb, wsMeta, 'Metadata');

        // Generate Excel file
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual-zone-players-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
        console.log(`✅ Exportados ${players.length} jugadores a Excel`);
        } catch (xlsxError) {
          console.error('❌ Error procesando XLSX:', xlsxError);
        }
      })().catch(error => {
        console.error('❌ Error en la función de exportación:', error);
      });
    } catch (error) {
      console.error('❌ Error exportando jugadores:', error);
    }
  };

  // Import players data from JSON or Excel
  window.importPlayersData = (data: any) => {
    console.log('🔄 Importando datos de jugadores...');
    try {
      // Check if it's Excel data (ArrayBuffer/Uint8Array) or JSON
      if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
        // Handle Excel import
        (async () => {
          try {
          const workbook = XLSX.read(data, { type: 'array' });

          // Check if workbook has the expected sheets
          const requiredSheets = ['Jugadores', 'Atributos', 'Habilidades', 'Estilos_Juego'];
          const missingSheets = requiredSheets.filter(sheet => !workbook.SheetNames.includes(sheet));

          if (missingSheets.length > 0) {
            throw new Error(`El archivo Excel no contiene las hojas requeridas: ${missingSheets.join(', ')}`);
          }

          // Read all required sheets
          const basicData = XLSX.utils.sheet_to_json(workbook.Sheets['Jugadores']);
          const attributesData = XLSX.utils.sheet_to_json(workbook.Sheets['Atributos']);
          const skillsData = XLSX.utils.sheet_to_json(workbook.Sheets['Habilidades']);
          const playingStylesData = XLSX.utils.sheet_to_json(workbook.Sheets['Estilos_Juego']);

          const { useDataStore } = require('./store/dataStore');
          const store = useDataStore.getState();
          const clubs = store.clubs;

          // Convert Excel data back to complete player objects
          const importedPlayers = basicData.map((basicRow: any, index: number) => {
            const playerId = basicRow.ID;
            if (!playerId) {
              console.warn(`Player at index ${index} has no ID, skipping`);
              return null;
            }

            // Find corresponding data in other sheets by ID
            const attributesRow = attributesData.find((row: any) => row.ID === playerId);
            const skillsRow = skillsData.find((row: any) => row.ID === playerId);
            const playingStylesRow = playingStylesData.find((row: any) => row.ID === playerId);

            // Find club by name; handle free agents ("Libre"/"Free")
            // Resolve club by ID or Name; handle free agents ("Libre"/"Free")
            const idClubRaw = (basicRow.ID_Club ?? basicRow.Club_ID ?? basicRow.ClubId ?? basicRow["ID Club"] ?? basicRow.Id_Club ?? basicRow.id_club ?? basicRow.IDCLUB ?? basicRow.IdClub ?? "").toString().trim();
            const rawClub = (basicRow.Club ?? "").toString().trim();
            const idClubLower = idClubRaw.toLowerCase(); const clubNameLower = rawClub.toLowerCase();
            const isLibre = idClubLower === "libre" || idClubLower === "free" || idClubRaw === "" || idClubRaw === "0" || clubNameLower === "libre" || clubNameLower === "free";
            const clubById = (!isLibre && idClubRaw) ? (clubs.find((c: any) => c.id === idClubRaw) as any) : undefined;
            const clubByName = (!isLibre && rawClub) ? (clubs.find((c: any) => c.name === rawClub) as any) : undefined;
            const club = clubById || clubByName;
            const player: any = {
              id: playerId,
              name: basicRow.Nombre || `Jugador ${index + 1}`,
              age: parseInt(basicRow.Edad) || 20,
              position: basicRow.Posición || 'DC',
              overall: parseInt(basicRow.Media) || 50,
              transferValue: parseInt(basicRow.Valor) || 0,
              clubId: isLibre ? 'libre' : (club?.id || undefined),
              image: basicRow.Imagen || undefined,
              height: basicRow.Altura ? parseInt(basicRow.Altura) : undefined,
              weight: basicRow.Peso ? parseInt(basicRow.Peso) : undefined,
              nationality: basicRow.Nacionalidad || 'Argentina',
              dorsal: basicRow.Dorsal ? parseInt(basicRow.Dorsal) : undefined,
              injuryResistance: parseInt(basicRow.Resistencia_Lesiones) || 2,
              matches: parseInt(basicRow.Partidos) || 0,
              transferListed: basicRow.Transferible === 'Sí',
              contract: {
                salary: parseInt(basicRow.Salario) || 0,
                expires: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString()
              },
              // Complete attributes from attributes sheet
              attributes: {
                // Atributos principales
                shooting: (attributesRow && (parseInt(attributesRow.Tiro) || parseInt(attributesRow.Ataque))) || 40,
                defending: (attributesRow && (parseInt(attributesRow.Defensa_Legacy) || parseInt(attributesRow.Defensa))) || 40,
                pace: (attributesRow && (parseInt(attributesRow.Ritmo) || parseInt(attributesRow.Velocidad))) || 40,
                passing: (attributesRow && (parseInt(attributesRow.Pase) || parseInt(attributesRow.Técnica))) || 40,
                physical: (attributesRow && (parseInt(attributesRow.Fisico) || parseInt(attributesRow.Fuerza))) || 40,
                goalkeeping: (attributesRow && (parseInt(attributesRow.Portero_Legacy) || parseInt(attributesRow.Portería))) || 40,

                // Atributos avanzados
                offensiveAwareness: (attributesRow && parseInt(attributesRow.Ataque_Ofensivo)) || 40,
                ballControl: (attributesRow && parseInt(attributesRow.Control_Balon)) || 40,
                dribbling: (attributesRow && parseInt(attributesRow.Dribbling)) || 40,
                tightPossession: (attributesRow && parseInt(attributesRow.Posesion_Balon)) || 40,
                lowPass: (attributesRow && parseInt(attributesRow.Pase_Ras)) || 40,
                loftedPass: (attributesRow && parseInt(attributesRow.Pase_Bomb)) || 40,
                finishing: (attributesRow && parseInt(attributesRow.Finalizacion)) || 40,
                heading: (attributesRow && parseInt(attributesRow.Cabeceador)) || 40,
                setPieceTaking: (attributesRow && parseInt(attributesRow.Balon_Parado)) || 40,
                curl: (attributesRow && parseInt(attributesRow.Efecto)) || 40,
                speed: (attributesRow && (parseInt(attributesRow.Ritmo) || parseInt(attributesRow.Velocidad))) || 40,
                acceleration: (attributesRow && parseInt(attributesRow.Aceleracion)) || 40,
                kickingPower: (attributesRow && parseInt(attributesRow.Potencia_Tiro)) || 40,
                jumping: (attributesRow && parseInt(attributesRow.Salto)) || 40,
                physicalContact: (attributesRow && parseInt(attributesRow.Contacto_Fisico)) || 40,
                balance: (attributesRow && parseInt(attributesRow.Equilibrio)) || 40,
                stamina: (attributesRow && parseInt(attributesRow.Resistencia)) || 40,
                defensiveAwareness: (attributesRow && parseInt(attributesRow.Actitud_Defensiva)) || 40,
                ballWinning: (attributesRow && parseInt(attributesRow.Recuperacion_Balon)) || 40,
                aggression: (attributesRow && parseInt(attributesRow.Agresividad)) || 40,

                // Atributos específicos de portero
                catching: (attributesRow && parseInt(attributesRow.Agarre)) || 40,
                reflexes: (attributesRow && parseInt(attributesRow.Reflejos)) || 40,
                coverage: (attributesRow && parseInt(attributesRow.Cobertura)) || 40,
                gkHandling: (attributesRow && parseInt(attributesRow.Actitud_Portero)) || 40
              },

              // Complete skills from skills sheet (always provide basic skills)
              skills: {
                scissorKick: (skillsRow && yesNoToBool(skillsRow.Tijera)) || false,
                doubleTouch: (skillsRow && yesNoToBool(skillsRow.Doble_Toque)) || false,
                flipFlap: (skillsRow && yesNoToBool(skillsRow.Gambeta)) || false,
                marseilleTurn: (skillsRow && yesNoToBool(skillsRow.Marsellesa)) || false,
                rainbow: (skillsRow && yesNoToBool(skillsRow.Sombrerito)) || false,
                chopTurn: (skillsRow && yesNoToBool(skillsRow.Cortada)) || false,
                cutBehindAndTurn: (skillsRow && yesNoToBool(skillsRow.Amago_Por_Detras)) || false,
                scotchMove: (skillsRow && yesNoToBool(skillsRow.Rebote_Interior)) || false,
                stepOnSkillControl: (skillsRow && yesNoToBool(skillsRow.Pisar_Balon)) || false,
                heading: (skillsRow && yesNoToBool(skillsRow.Cabeceador)) || false,
                longRangeDrive: (skillsRow && yesNoToBool(skillsRow.Cañonero)) || false,
                chipShotControl: (skillsRow && yesNoToBool(skillsRow.Sombrero)) || false,
                longRanger: (skillsRow && yesNoToBool(skillsRow.Tiro_Larga_Distancia)) || false,
                knuckleShot: (skillsRow && yesNoToBool(skillsRow.Tiro_Empeine)) || false,
                dippingShot: (skillsRow && yesNoToBool(skillsRow.Disparo_Descendente)) || false,
                risingShot: (skillsRow && yesNoToBool(skillsRow.Disparo_Ascendente)) || false,
                acrobaticFinishing: (skillsRow && yesNoToBool(skillsRow.Finalizacion_Acrobatica)) || false,
                heelTrick: (skillsRow && yesNoToBool(skillsRow.Taconazo)) || false,
                firstTimeShot: (skillsRow && yesNoToBool(skillsRow.Remate_Primer_Toque)) || false,
                oneTouchPass: (skillsRow && yesNoToBool(skillsRow.Pase_Primer_Toque)) || false,
                throughPassing: (skillsRow && yesNoToBool(skillsRow.Pase_Profundidad)) || false,
                weightedPass: (skillsRow && yesNoToBool(skillsRow.Pase_Profundidad_2)) || false,
                pinpointCrossing: (skillsRow && yesNoToBool(skillsRow.Centro_Cruzado)) || false,
                outsideCurler: (skillsRow && yesNoToBool(skillsRow.Centro_Rosca)) || false,
                rabona: (skillsRow && yesNoToBool(skillsRow.Rabona)) || false,
                noLookPass: (skillsRow && yesNoToBool(skillsRow.Pase_Sin_Mirar)) || false,
                lowLoftedPass: (skillsRow && yesNoToBool(skillsRow.Pase_Bomb_Bajo)) || false,
                giantKill: (skillsRow && yesNoToBool(skillsRow.Patadon_Corto)) || false,
                longThrow: (skillsRow && yesNoToBool(skillsRow.Patadon_Largo)) || false,
                longThrow2: (skillsRow && yesNoToBool(skillsRow.Saque_Largo_Banda)) || false,
                gkLongThrow: (skillsRow && yesNoToBool(skillsRow.Saque_Meta_Largo)) || false,
                penaltySpecialist: (skillsRow && yesNoToBool(skillsRow.Especialista_Penales)) || false,
                gkPenaltySaver: (skillsRow && yesNoToBool(skillsRow.Parapenales)) || false,
                fightingSpirit: (skillsRow && yesNoToBool(skillsRow.Malicia)) || false,
                manMarking: (skillsRow && yesNoToBool(skillsRow.Marcar_Hombre)) || false,
                trackBack: (skillsRow && yesNoToBool(skillsRow.Delantero_Atrasado)) || false,
                interception: (skillsRow && yesNoToBool(skillsRow.Interceptor)) || false,
                acrobaticClear: (skillsRow && yesNoToBool(skillsRow.Despeje_Acrobatico)) || false,
                captaincy: (skillsRow && yesNoToBool(skillsRow.Capitania)) || false,
                superSub: (skillsRow && yesNoToBool(skillsRow.Super_Refuerzo)) || false,
                comPlayingStyles: (skillsRow && yesNoToBool(skillsRow.Espiritu_Lucha)) || false
              },

              // Complete playing styles from playingStyles sheet (always provide basic playing styles)
              playingStyles: {
                goalPoacher: (playingStylesRow && yesNoToBool(playingStylesRow.Cazagoles)) || false,
                dummyRunner: (playingStylesRow && yesNoToBool(playingStylesRow.Señuelo)) || false,
                foxInTheBox: (playingStylesRow && yesNoToBool(playingStylesRow.Hombre_De_Area)) || false,
                targetMan: (playingStylesRow && yesNoToBool(playingStylesRow.Referente)) || false,
                classicNo10: (playingStylesRow && yesNoToBool(playingStylesRow.Creador_De_Jugadas)) || false,
                prolificWinger: (playingStylesRow && yesNoToBool(playingStylesRow.Extremo_Prolifico)) || false,
                roamingFlank: (playingStylesRow && yesNoToBool(playingStylesRow.Extremo_Movil)) || false,
                crossSpecialist: (playingStylesRow && yesNoToBool(playingStylesRow.Especialista_Centros)) || false,
                holePlayer: (playingStylesRow && yesNoToBool(playingStylesRow.Jugador_Huecos)) || false,
                boxToBox: (playingStylesRow && yesNoToBool(playingStylesRow.Omnipresente)) || false,
                theDestroyer: (playingStylesRow && yesNoToBool(playingStylesRow.El_Destructor)) || false,
                orchestrator: (playingStylesRow && yesNoToBool(playingStylesRow.Organizador)) || false,
                anchor: (playingStylesRow && yesNoToBool(playingStylesRow.Medio_Escudo)) || false,
                offensiveFullback: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Ofensivo)) || false,
                fullbackFinisher: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Finalizador)) || false,
                defensiveFullback: (playingStylesRow && yesNoToBool(playingStylesRow.Lateral_Defensivo)) || false,
                buildUp: (playingStylesRow && yesNoToBool(playingStylesRow.Creacion)) || false,
                extraFrontman: (playingStylesRow && yesNoToBool(playingStylesRow.Atacante_Extra)) || false,
                offensiveGoalkeeper: (playingStylesRow && yesNoToBool(playingStylesRow.Portero_Ofensivo)) || false,
                defensiveGoalkeeper: (playingStylesRow && yesNoToBool(playingStylesRow.Portero_Defensivo)) || false
              }
            };

            return player;
          }).filter(player => player !== null);

          const validPlayers = importedPlayers.filter((player: any) => {
            return player.id && player.name && player.position && typeof player.overall === 'number';
          });

          // Normalize free agents from Excel: ensure clubId 'libre' and transferListed true
          const normalizedPlayers = validPlayers.map((p: any) => {
            const isFA = !p.clubId || p.clubId === 'libre' || p.clubId === 'free';
            return {
              ...p,
              clubId: isFA ? 'libre' : p.clubId,
              transferListed: isFA ? true : !!p.transferListed,
            };
          });
          console.log(`Importando ${normalizedPlayers.length} jugadores desde Excel...`);
          store.updatePlayers(normalizedPlayers);
          console.log(`Importaci�n completada: ${normalizedPlayers.length} jugadores desde Excel`);
          } catch (xlsxError) {
            console.error('❌ Error procesando XLSX:', xlsxError);
          }
        })().catch(error => {
          console.error('❌ Error en la función de importación:', error);
        });
      } else {
        // Handle JSON import
        if (!data || !data.players || !Array.isArray(data.players)) {
          throw new Error('Datos inválidos: se esperaba un objeto con array "players"');
        }

        const { useDataStore } = require('./store/dataStore');
        const store = useDataStore.getState();

        const validPlayers = data.players.filter((player: any) => {
          return player.id && player.name && player.position && typeof player.overall === 'number';
        });

        if (validPlayers.length === 0) {
          throw new Error('No se encontraron jugadores válidos');
        }

        console.log(`📥 Importando ${validPlayers.length} jugadores desde JSON...`);
        const normalizedPlayers = validPlayers.map((p: any) => { const clubName = ((p.club || p.clubName || '') as any).toString().trim().toLowerCase(); const isFA = !p.clubId && (!clubName || clubName === 'libre' || clubName === 'free') || p.clubId === 'libre' || p.clubId === 'free'; if (isFA) { return { ...p, clubId: 'libre', transferListed: true }; } if (!p.clubId && clubName) { const match = (store.clubs || []).find((c: any) => c.name.toLowerCase() === clubName); if (match) { return { ...p, clubId: match.id }; } } return p; }); store.updatePlayers(normalizedPlayers);
        console.log(`✅ Importación completada: ${validPlayers.length} jugadores desde JSON`);
      }

    } catch (error) {
      console.error('❌ Error importando jugadores:', error);
    }
  };

  window.testClubPersistence = async () => {
    console.log('🔍 Probando persistencia de ediciones de clubes...');

    // Esperar a que el store esté disponible
    let attempts = 0;
    while (!(window as any).dataStore && attempts < 50) { // Máximo 5 segundos
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }

    try {
      // Acceder al store global
      const store = (window as any).dataStore;
      if (!store) {
        console.error('❌ El store global no se inicializó. Revisa la consola para errores.');
        return;
      }

      // Verificar que haya datos
      if (!store.clubs || store.clubs.length === 0) {
        console.log('🔄 Esperando que se carguen los datos...');
        // Esperar un poco más por si los datos están cargándose
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!store.clubs || store.clubs.length === 0) {
          console.error('❌ No hay clubes disponibles. Verifica que los datos se hayan cargado correctamente.');
          return;
        }
      }

      // Obtener el primer club
      const firstClub = store.clubs[0];
      if (!firstClub) {
        console.error('❌ No hay clubes para probar');
        return;
      }

      console.log(`📝 Probando con el club: ${firstClub.name}`);
      console.log(`   Presupuesto original: ${firstClub.budget}`);

      // Crear una copia con cambios
      const testBudget = firstClub.budget + 999999;
      const modifiedClub = {
        ...firstClub,
        budget: testBudget,
        description: `Test persistence - ${Date.now()}`
      };

      console.log(`   Nuevo presupuesto: ${testBudget}`);

      // Guardar el cambio
      console.log('💾 Guardando cambios...');
      await store.updateClub(modifiedClub);
      console.log('✅ Cambios guardados en BD');

      // Verificar inmediatamente desde BD
      console.log('🔍 Verificando persistencia...');
      await store.refreshClubs(); // Refrescar desde BD
      const clubsAfter = store.clubs;
      const clubAfter = clubsAfter.find((c: any) => c.id === firstClub.id);

      if (clubAfter && clubAfter.budget === testBudget) {
        console.log('✅ ÉXITO: Los cambios se mantuvieron correctamente');
        console.log(`   Presupuesto verificado: ${clubAfter.budget}`);

        // Restaurar el valor original
        console.log('🔄 Restaurando valor original...');
        const restoredClub = {
          ...clubAfter,
          budget: firstClub.budget,
          description: firstClub.description
        };
        await store.updateClub(restoredClub);
        console.log('✅ Valor restaurado al original');
        console.log('🎉 Test completado exitosamente!');
      } else {
        console.error('❌ ERROR: Los cambios NO se mantuvieron');
        console.log(`   Esperado: ${testBudget}`);
        console.log(`   Encontrado: ${clubAfter?.budget || 'undefined'}`);
        console.log('🔧 Esto indica un problema de persistencia que necesita ser investigado');
      }

    } catch (error) {
      console.error('❌ Error en test de persistencia:', error);
      console.log('💡 Posibles causas:');
      console.log('   - Error de conexión a IndexedDB');
      console.log('   - Problema en la función updateClub');
      console.log('   - Error de permisos de almacenamiento');
    }
  };

  window.cleanLocalStorage = () => {
    console.log('🧹 Limpiando localStorage para liberar espacio...');

    try {
      // Mostrar estado antes de limpiar
      const keys = Object.keys(localStorage);
      console.log(`📊 localStorage antes: ${keys.length} items`);

      // Identificar backups viejos para limpiar
      const backupKeys = keys.filter(key =>
        key.includes('backup') ||
        key.includes('virtual_zone') ||
        key.includes('market') ||
        key.includes('player')
      );

      console.log(`🎯 Encontrados ${backupKeys.length} items de backup para limpiar`);

      // Limpiar backups específicos pero mantener algunos esenciales
      const keysToRemove = backupKeys.filter(key =>
        !key.includes('clubs_updated') && // Mantener el flag de actualización
        !key.includes('backup_light')     // Mantener el backup ligero actual
      );

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Eliminado: ${key}`);
      });

      // Mostrar estado después
      const remainingKeys = Object.keys(localStorage);
      console.log(`✅ localStorage después: ${remainingKeys.length} items`);
      console.log(`💾 Espacio liberado: ${keys.length - remainingKeys.length} items`);

      // Calcular tamaño aproximado liberado
      const estimatedSize = keysToRemove.length * 5000; // Estimación aproximada
      console.log(`📏 Tamaño aproximado liberado: ~${(estimatedSize / 1024).toFixed(1)} KB`);

    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  };

  window.cleanDuplicateUsers = () => {
    console.log('🧹 Eliminando usuarios duplicados...');
    try {
      // Import authService dynamically
      import('./utils/authService').then(async ({ listUsers, deleteUser }) => {
        const users = listUsers();
        console.log(`📊 Encontrados ${users.length} usuarios totales`);

        // Find duplicates by ID
        const seenIds = new Set();
        const duplicates: any[] = [];

        users.forEach((user: any) => {
          if (seenIds.has(user.id)) {
            duplicates.push(user);
          } else {
            seenIds.add(user.id);
          }
        });

        console.log(`🔍 Encontrados ${duplicates.length} usuarios duplicados`);

        if (duplicates.length > 0) {
          for (const duplicate of duplicates) {
            try {
              await deleteUser(duplicate.id);
              console.log(`🗑️ Eliminado usuario duplicado: ${duplicate.username} (ID: ${duplicate.id})`);
            } catch (error) {
              console.error(`❌ Error eliminando usuario ${duplicate.username}:`, error);
            }
          }
          console.log(`✅ Eliminados ${duplicates.length} usuarios duplicados`);
        } else {
          console.log('✅ No se encontraron usuarios duplicados');
        }
      });
    } catch (error) {
      console.error('❌ Error limpiando usuarios duplicados:', error);
    }
  };

  window.cleanDuplicateClubs = () => {
    console.log('🧹 Eliminando clubes duplicados...');
    try {
      // Import clubService dynamically
      import('./utils/clubService').then(async (clubService) => {
        const clubs = await clubService.listClubs();
        console.log(`📊 Encontrados ${clubs.length} clubes totales`);

        // Find duplicates by ID
        const seenIds = new Set();
        const duplicates: any[] = [];

        clubs.forEach((club: any) => {
          if (seenIds.has(club.id)) {
            duplicates.push(club);
          } else {
            seenIds.add(club.id);
          }
        });

        console.log(`🔍 Encontrados ${duplicates.length} clubes duplicados`);

        if (duplicates.length > 0) {
          for (const duplicate of duplicates) {
            try {
              await clubService.deleteClub(duplicate.id);
              console.log(`🗑️ Eliminado club duplicado: ${duplicate.name} (ID: ${duplicate.id})`);
            } catch (error) {
              console.error(`❌ Error eliminando club ${duplicate.name}:`, error);
            }
          }
          console.log(`✅ Eliminados ${duplicates.length} clubes duplicados`);
        } else {
          console.log('✅ No se encontraron clubes duplicados');
        }
      });
    } catch (error) {
      console.error('❌ Error limpiando clubes duplicados:', error);
    }
  };

  window.checkImportedPlayersPersistence = async () => {
    console.log('🔍 Verificando persistencia de jugadores importados...');

    try {
      const [clubsFromDB, playersFromDB] = await Promise.all([
        listClubs(),
        listPlayers()
      ]);

      console.log(`📊 Datos actuales: ${clubsFromDB.length} clubes, ${playersFromDB.length} jugadores`);

      // Verificar jugadores con club asignado
      const playersWithClub = playersFromDB.filter(p => p.clubId);
      const playersWithValidClub = playersWithClub.filter(p =>
        clubsFromDB.some(c => c.id === p.clubId)
      );

      console.log(`🎯 Jugadores con club asignado: ${playersWithClub.length}/${playersFromDB.length}`);
      console.log(`✅ Jugadores con club válido: ${playersWithValidClub.length}/${playersWithClub.length}`);

      if (playersWithClub.length > playersWithValidClub.length) {
        console.log('❌ PROBLEMA: Algunos jugadores tienen clubs inválidos o inexistentes');
        const invalidPlayers = playersWithClub.filter(p =>
          !clubsFromDB.some(c => c.id === p.clubId)
        );
        console.log('Jugadores con club inválido:', invalidPlayers.slice(0, 5).map(p => `${p.name} -> ${p.clubId}`));
      }

      // Verificar distribución por club
      const clubDistribution = {};
      playersWithValidClub.forEach(player => {
        const clubName = clubsFromDB.find(c => c.id === player.clubId)?.name || 'Club desconocido';
        clubDistribution[clubName] = (clubDistribution[clubName] || 0) + 1;
      });

      console.log('📈 Distribución de jugadores por club:');
      Object.entries(clubDistribution)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 10)
        .forEach(([clubName, count]) => {
          console.log(`   ${clubName}: ${count} jugadores`);
        });

      return {
        totalPlayers: playersFromDB.length,
        playersWithClub: playersWithClub.length,
        playersWithValidClub: playersWithValidClub.length,
        clubsCount: clubsFromDB.length,
        clubDistribution
      };

    } catch (error) {
      console.error('❌ Error verificando persistencia:', error);
      return null;
    }
  };

  window.checkImportDataIntegrity = async () => {
    console.log('🔍 Verificando integridad de datos después de importar...');

    try {
      // Verificar estado de IndexedDB intentando acceder a un store
      await dbService.getAll('clubs');
      console.log('✅ IndexedDB accessible');

      // Verificar clubs
      const clubs = await listClubs();
      console.log(`✅ Clubs cargados: ${clubs.length}`);

      // Verificar players
      const players = await listPlayers();
      console.log(`✅ Players cargados: ${players.length}`);

      // Verificar consistencia
      const playersWithClub = players.filter(p => p.clubId);
      const validClubAssignments = playersWithClub.filter(p =>
        clubs.some(c => c.id === p.clubId)
      );

      console.log(`🎯 Players con club: ${playersWithClub.length}`);
      console.log(`✅ Asignaciones válidas: ${validClubAssignments.length}`);

      if (validClubAssignments.length === playersWithClub.length) {
        console.log('🎉 INTEGRIDAD: Todos los datos están consistentes');
        return { status: 'OK', clubs: clubs.length, players: players.length, validAssignments: validClubAssignments.length };
      } else {
        console.log('⚠️ INTEGRIDAD: Hay inconsistencias en las asignaciones');
        return { status: 'WARNING', clubs: clubs.length, players: players.length, validAssignments: validClubAssignments.length };
      }

    } catch (error) {
      console.error('❌ INTEGRIDAD: Error accediendo a los datos:', error);
      return { status: 'ERROR', error: error.message };
    }
  };

  window.checkClubAssignmentsPersistence = async () => {
    console.log('🔍 DIAGNÓSTICO: Verificando persistencia de asignaciones de club...');

    try {
      const [clubs, players] = await Promise.all([
        listClubs(),
        listPlayers()
      ]);

      console.log(`📊 Estado actual: ${clubs.length} clubes, ${players.length} jugadores`);

      // Verificar asignaciones de club
      const playersWithClub = players.filter(p => p.clubId);
      const playersWithoutClub = players.filter(p => !p.clubId);

      console.log(`🎯 Jugadores con club asignado: ${playersWithClub.length}/${players.length}`);
      console.log(`⚠️ Jugadores sin club asignado: ${playersWithoutClub.length}/${players.length}`);

      // Verificar validez de asignaciones
      const validAssignments = playersWithClub.filter(p =>
        clubs.some(c => c.id === p.clubId)
      );
      const invalidAssignments = playersWithClub.filter(p =>
        !clubs.some(c => c.id === p.clubId)
      );

      console.log(`✅ Asignaciones válidas: ${validAssignments.length}/${playersWithClub.length}`);
      console.log(`❌ Asignaciones inválidas: ${invalidAssignments.length}/${playersWithClub.length}`);

      if (invalidAssignments.length > 0) {
        console.log('🔍 Jugadores con asignaciones inválidas:');
        invalidAssignments.slice(0, 10).forEach(p => {
          console.log(`   • ${p.name} (ID: ${p.id}) -> Club: ${p.clubId} (NO EXISTE)`);
        });
        if (invalidAssignments.length > 10) {
          console.log(`   ... y ${invalidAssignments.length - 10} más`);
        }
      }

      // Verificar distribución por club
      const clubPlayerCount = {};
      playersWithClub.forEach(p => {
        if (p.clubId) {
          clubPlayerCount[p.clubId] = (clubPlayerCount[p.clubId] || 0) + 1;
        }
      });

      console.log('📊 Distribución de jugadores por club:');
      clubs.forEach(club => {
        const count = clubPlayerCount[club.id] || 0;
        const status = count === 23 ? '✅' : count === 0 ? '❌' : '⚠️';
        console.log(`   ${status} ${club.name}: ${count} jugadores`);
      });

      // Verificar si hay clubs sin jugadores
      const clubsWithoutPlayers = clubs.filter(c => !clubPlayerCount[c.id]);
      if (clubsWithoutPlayers.length > 0) {
        console.log(`⚠️ Clubs sin jugadores: ${clubsWithoutPlayers.length}`);
        clubsWithoutPlayers.forEach(c => console.log(`   • ${c.name}`));
      }

      return {
        totalPlayers: players.length,
        playersWithClub: playersWithClub.length,
        playersWithoutClub: playersWithoutClub.length,
        validAssignments: validAssignments.length,
        invalidAssignments: invalidAssignments.length,
        clubsWithoutPlayers: clubsWithoutPlayers.length
      };

    } catch (error) {
      console.error('❌ Error en diagnóstico de persistencia:', error);
      return { error: error.message };
    }
  };

  window.fixClubAssignments = async () => {
    console.log('🔧 Iniciando reparación de asignaciones de club...');

    try {
      const [clubs, players] = await Promise.all([
        listClubs(),
        listPlayers()
      ]);

      console.log(`📊 Datos actuales: ${clubs.length} clubes, ${players.length} jugadores`);

      const result = await fixClubAssignments(clubs);

      if (result.fixed > 0) {
        console.log(`✅ Reparadas ${result.fixed} asignaciones de club`);
        console.log('🔄 Actualizando estado de la aplicación...');

        // Refresh the data store
        const store = useDataStore.getState();
        await store.refreshPlayers();

        console.log('✅ Estado actualizado. Los cambios deberían reflejarse en la UI.');
      } else {
        console.log('ℹ️ No se encontraron asignaciones para reparar');
      }

      return result;

    } catch (error) {
      console.error('❌ Error ejecutando reparación:', error);
      return { error: error.message };
    }
  };

  window.fixPlayerClubAssignments = async () => {
    console.log('🔧 Iniciando corrección de asignaciones clubId en jugadores...');

    try {
      const clubs = await listClubs();
      const players = await listPlayers();

      console.log(`📊 Datos actuales: ${clubs.length} clubes, ${players.length} jugadores`);

      // Crear un mapa de nombres de clubes a IDs actuales
      const clubNameToIdMap = {};
      clubs.forEach(club => {
        clubNameToIdMap[club.name.toLowerCase().replace(/\s+/g, '-')] = club.id;
      });

      let fixed = 0;
      const playersToUpdate = [];

      // Verificar cada jugador con club asignado
      players.forEach(player => {
        if (player.clubId && player.clubId.startsWith('club')) {
          // El jugador ya tiene un ID válido, verificar si existe el club
          const clubExists = clubs.some(c => c.id === player.clubId);
          if (!clubExists) {
            console.log(`⚠️ Jugador ${player.name} tiene clubId inválido: ${player.clubId}`);
            // Intentar encontrar el club correcto por nombre si existe en los datos del jugador
            // (esto requiere lógica adicional para mapear)
          }
        } else if (player.clubId && !player.clubId.startsWith('club')) {
          // El jugador tiene un clubId que no es un ID válido (posiblemente nombre o ID antiguo)
          console.log(`⚠️ Jugador ${player.name} tiene clubId no estándar: ${player.clubId}`);
        }
      });

      // Para una corrección completa, necesitamos regenerar las asignaciones
      // desde los datos seed que tienen las asignaciones correctas
      console.log('💡 Recomendación: Ejecutar forceRegeneratePlayersFromSeed() para asignaciones correctas');
      console.log('   Esto regenerará todos los jugadores con los nuevos IDs de clubes.');

      return {
        totalPlayers: players.length,
        playersWithClub: players.filter(p => p.clubId).length,
        fixed: fixed,
        recommendation: 'Ejecutar forceRegeneratePlayersFromSeed() para corrección completa'
      };

    } catch (error) {
      console.error('❌ Error corrigiendo asignaciones:', error);
      return { error: error.message };
    }
  };

  window.resetAllData = () => {
    console.log('🔥 Reiniciando todos los datos desde cero...');
    // Clear ALL localStorage data
    localStorage.clear();
    // Reinitialize with seed data
    saveClubs(seedClubs as any);
    savePlayers(seedPlayers);
    localStorage.setItem('virtual_zone_clubs_updated', 'true');
    localStorage.setItem('virtual_zone_players_updated', 'true');

    console.log(`✅ Reiniciados ${seedClubs.length} clubes y ${seedPlayers.length} jugadores desde datos seed`);
    console.log('💡 Recarga la página para ver los cambios');
  };

  console.log('💡 Funciones disponibles en consola:');
  console.log('   • updatePlayerMarketData() - Ajustar datos de mercado automáticamente');
  console.log('   • forceCompleteMarketUpdate() - Forzar actualización completa');
  console.log('   • checkCompleteMarketStatus() - Verificar estado completo');
  console.log('   • refreshClubsFromSeed() - Refrescar clubes desde datos seed');
  console.log('   • refreshUsersFromSeed() - Refrescar usuarios desde datos seed');
  console.log('   • forceUpdateClubs() - Forzar actualización completa de clubes');
  console.log('   • forceUpdatePlayers() - ⚠️ PELIGROSO: Regenerar TODOS los jugadores (borra ediciones)');
  console.log('   • forceRegeneratePlayersFromSeed() - Regenerar jugadores desde seed data');
  console.log('   • checkClubsStatus() - Verificar estado actual de clubes y jugadores');
  console.log('   • checkDataIntegrity() - Verificar integridad de datos, ediciones e imágenes');
  console.log('   • checkClubFinances("Club Name") - Verificar datos financieros de un club específico');
  console.log('   • diagnoseClubsIssue() - 🔍 DIAGNÓSTICO: Verificar problema con los 48 clubes');
  console.log('   • checkClubChangesPersistence() - 🔍 Verificar si los cambios de clubes se mantienen');
  console.log('   • checkClubBackupStatus() - 🔍 Verificar estado de backups de clubes');
  console.log('   • exportPlayersData() - 📤 Exportar todos los jugadores a Excel (.xlsx)');
  console.log('   • importPlayersData(data) - 📥 Importar jugadores desde JSON o Excel');
  console.log('   • testRefreshClubsButton() - Probar si el botón "Refrescar" de Clubes funciona');
  console.log('   • testRefreshUsersButton() - Probar si el botón "Refrescar" de Usuarios funciona');
  console.log('   • testSalaryValueAdjustments() - ⚠️ Probar ajuste TOTAL de salarios/valores (sobrescribe todo)');
  console.log('   • resetAllData() - Reiniciar todos los datos desde cero');
  console.log('   • checkImportedPlayersPersistence() - 🔍 Verificar si los jugadores importados mantienen sus clubs');
  console.log('   • checkImportDataIntegrity() - 🔍 Verificar integridad de datos después de importar');
  console.log('   • checkClubAssignmentsPersistence() - 🔍 DIAGNÓSTICO: Verificar si los clubs de jugadores se mantienen al recargar');
  console.log('   • fixClubAssignments() - 🔧 Reparar asignaciones de club perdidas');
  console.log('   • fixPlayerClubAssignments() - 🔧 Corregir clubId de jugadores después de reorganización de clubes');
  console.log('   • testClubPersistence() - 🔍 Probar que las ediciones de clubes se mantengan');
  console.log('   • cleanLocalStorage() - 🧹 Limpiar localStorage para liberar espacio');
  console.log('   • cleanDuplicateUsers() - 🧹 Eliminar usuarios duplicados');
  console.log('   • cleanDuplicateClubs() - 🧹 Eliminar clubes duplicados');
  console.log('   • migrateToSupabase() - 🚀 Migrar TODOS los datos de IndexedDB a Supabase');
  console.log('   • toggleSupabaseMode() - 🔄 Cambiar entre modo IndexedDB y Supabase');
  console.log('   • createAdminUser() - 👑 Crear usuario admin en Supabase');
  console.log('   • fixAdminRole() - 🔧 Arreglar rol de admin para usuario actual');
  console.log('   • recreateAdminUser() - 🔄 Eliminar y recrear usuario admin');
  console.log('   • testProfileUpdate() - 🧪 Probar actualización de perfil');
  console.log('   • testClubAssignment() - 🧪 Probar asignación de club a DT');
  console.log('   • assignClubToAdmin(clubId) - 👑 Asignar club al admin manualmente');
  console.log('   • checkUserClubStatus() - 🔍 Verificar estado del club del usuario');
  console.log('   • forceRefreshUserProfile() - 🔄 Forzar actualización del perfil desde Supabase');
  console.log('   • checkSupabaseProfile() - 🔍 Verificar perfil directamente en Supabase');
  console.log('   • testReloadPersistence() - 🔄 Probar persistencia después de recarga');
  console.log('   • testClubPersistenceAfterTimeout() - 🧪 Probar persistencia después de timeout');
  console.log('   • diagnoseSupabase() - 🔍 Diagnosticar configuración de Supabase');
  console.log('   • refreshPlayerFromSupabase(playerId) - 🔄 Actualizar un jugador específico desde Supabase');
  console.log('   • syncPlayerClub(playerId, clubId) - 🔄 Sincronizar club de un jugador desde Supabase');

  console.log('   • diagnoseAdminSync() - 🔍 DIAGNÓSTICO: Verificar sincronización Panel Admin con Supabase');

  console.log('   • checkPlayerSync(playerIdOrName) - 🔍 Verificar sincronización de jugador específico');

  console.log('   • syncAllPlayersToSupabase() - 🔄 Sincronizar TODOS los jugadores a Supabase');

  console.log('   • initializePosts() - 📝 Inicializar posts con datos seed en Supabase');
  console.log('   • clearPosts() - 🧹 Eliminar TODOS los posts de Supabase');
  console.log('   • syncPostsToSupabase() - 🔄 Sincronizar posts a Supabase');

  console.log('   • checkSupabaseTableSchema(tableName) - 🔍 Verificar esquema de tabla en Supabase');

  console.log('   • checkRLSPolicies(tableName) - 🔒 Verificar políticas RLS de tabla');

  console.log('   • generateRLSPolicies(tableName) - 📝 Generar SQL para políticas RLS correctas');

  console.log('   • testPlayerEditSync(playerIdOrName) - 🧪 Probar edición y sincronización de jugador');

  console.log('   • checkClubSync(clubIdOrName) - 🔍 Verificar sincronización de club específico');
  console.log('   • syncAllClubsToSupabase() - 🔄 Sincronizar TODOS los clubs a Supabase');
  console.log('   • syncAllTournamentsToSupabase() - 🔄 Sincronizar TODOS los torneos a Supabase');
  console.log('   • migrateAllMatchesToSupabase() - 🚀 Migrar TODOS los partidos a Supabase');

  // Admin sync diagnosis function
  window.diagnoseAdminSync = async () => {
    console.log('🔍 DIAGNÓSTICO: Verificando sincronización Panel Admin con Supabase');
    console.log('=' .repeat(60));

    // Import config dynamically
    const { config } = await import('./lib/config');

    // 1. Verificar modo Supabase
    console.log('1️⃣ 📊 ESTADO DEL MODO:');
    console.log(`   Modo Supabase: ${config.useSupabase ? '✅ HABILITADO' : '❌ DESHABILITADO'}`);
    console.log(`   URL Supabase: ${config.supabase.url ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);
    console.log(`   API Key: ${config.supabase.anonKey ? '✅ CONFIGURADA' : '❌ NO CONFIGURADA'}`);

    if (!config.useSupabase) {
      console.log('⚠️ No estás en modo Supabase. Los cambios solo se guardan localmente.');
      console.log('💡 Ejecuta: await toggleSupabaseMode(true)');
      return;
    }

    // 2. Verificar conexión a Supabase
    console.log('\n2️⃣ 🌐 CONEXIÓN A SUPABASE:');
    try {
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (connectionError) {
        console.log('❌ Error de conexión:', connectionError.message);
      } else {
        console.log('✅ Conexión exitosa a Supabase');
      }
    } catch (error) {
      console.log('❌ Error al verificar conexión:', error);
    }

    // 3. Verificar usuario actual
    console.log('\n3️⃣ 👤 USUARIO ACTUAL:');
    const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
    const currentUser = authStore.user;

    if (!currentUser) {
      console.log('❌ No hay usuario autenticado');
      return;
    }

    console.log(`   Usuario: ${currentUser.username} (${currentUser.email})`);
    console.log(`   ID: ${currentUser.id}`);
    console.log(`   Rol: ${currentUser.role}`);
    console.log(`   Roles: ${JSON.stringify(currentUser.roles)}`);

    // 4. Verificar perfil en Supabase
    console.log('\n4️⃣ 📋 PERFIL EN SUPABASE:');
    try {
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      const { data: supabaseProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (profileError) {
        console.log('❌ Error obteniendo perfil de Supabase:', profileError.message);
      } else if (supabaseProfile) {
        console.log('✅ Perfil encontrado en Supabase');
        console.log(`   Email: ${supabaseProfile.email}`);
        console.log(`   Username: ${supabaseProfile.username}`);
        console.log(`   Role: ${supabaseProfile.role}`);
        console.log(`   Última actualización: ${supabaseProfile.updated_at}`);

        // Comparar con datos locales
        const roleMatch = supabaseProfile.role === currentUser.role;
        console.log(`   🔍 Comparación rol: ${roleMatch ? '✅' : '❌'} (${supabaseProfile.role} vs ${currentUser.role})`);
      } else {
        console.log('❌ Perfil no encontrado en Supabase');
      }
    } catch (error) {
      console.log('❌ Error al verificar perfil:', error);
    }

    // 5. Verificar permisos de escritura
    console.log('\n5️⃣ ✏️ PERMISOS DE ESCRITURA:');
    try {
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      // Intentar actualizar un campo de prueba
      const testUpdate = { last_login: new Date().toISOString() };
      const { error: updateError } = await supabase
        .from('profiles')
        .update(testUpdate)
        .eq('id', currentUser.id);

      if (updateError) {
        console.log('❌ Error de permisos de escritura:', updateError.message);
        console.log('💡 Verifica las políticas RLS en Supabase');
      } else {
        console.log('✅ Permisos de escritura OK');
      }
    } catch (error) {
      console.log('❌ Error al verificar permisos:', error);
    }

    // 6. Verificar cambios recientes
    console.log('\n6️⃣ 📈 CAMBIOS RECIENTES:');
    try {
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      // Obtener usuarios modificados recientemente
      const { data: recentUsers, error: recentError } = await supabase
        .from('profiles')
        .select('username, email, role, updated_at')
        .order('updated_at', { ascending: false })
        .limit(5);

      if (recentError) {
        console.log('❌ Error obteniendo cambios recientes:', recentError.message);
      } else if (recentUsers && recentUsers.length > 0) {
        console.log('✅ Cambios recientes encontrados:');
        recentUsers.forEach((user: any, index: number) => {
          const timeAgo = new Date(Date.now() - new Date(user.updated_at).getTime()).getMinutes();
          console.log(`   ${index + 1}. ${user.username} (${user.role}) - hace ${timeAgo}min`);
        });
      } else {
        console.log('⚠️ No se encontraron cambios recientes');
      }
    } catch (error) {
      console.log('❌ Error al verificar cambios recientes:', error);
    }

    // 7. Recomendaciones
    console.log('\n7️⃣ 💡 RECOMENDACIONES:');
    console.log('   • Si ves ❌ en alguna verificación, hay problemas de sincronización');
    console.log('   • Ejecuta: await fixAdminRole() si los roles no coinciden');
    console.log('   • Ejecuta: await forceRefreshUserProfile() para forzar sincronización');
    console.log('   • Verifica las políticas RLS en tu panel de Supabase');

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Diagnóstico completado. Revisa los resultados arriba.');
  };

  // Player sync check function
  window.checkPlayerSync = async (playerIdOrName: string) => {
    console.log(`🔍 Verificando sincronización del jugador: ${playerIdOrName}`);
    console.log('=' .repeat(60));

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.log('❌ No estás en modo Supabase');
      return;
    }

    let playerId = playerIdOrName;
    let playerName = playerIdOrName;

    // If it's an ID, find the name; if it's a name, find the ID
    if (playerIdOrName.startsWith('imp-') || playerIdOrName.match(/^\d+$/)) {
      // It's likely an ID, search by ID
      playerId = playerIdOrName;
    } else {
      // It's a name, will search by name
      playerName = playerIdOrName;
    }

    // 1. Buscar en IndexedDB
    console.log('1️⃣ 📊 BUSCANDO EN IndexedDB:');
    try {
      const playerService = await import('./utils/playerService');
      const players = await playerService.listPlayers();

      let localPlayer = null;

      // Search by ID first
      if (playerId !== playerName) {
        localPlayer = players.find(p => p.id === playerId);
      }

      // If not found by ID, search by name
      if (!localPlayer) {
        localPlayer = players.find(p =>
          p.name.toLowerCase().includes(playerName.toLowerCase()) ||
          p.id === playerIdOrName
        );
      }

      if (!localPlayer) {
        console.log('❌ Jugador no encontrado en IndexedDB');
        return;
      }

      console.log('✅ Jugador encontrado en IndexedDB:');
      console.log(`   ID: ${localPlayer.id}`);
      console.log(`   Nombre: ${localPlayer.name}`);
      console.log(`   Posición: ${localPlayer.position}`);
      console.log(`   Valor: €${localPlayer.marketValue?.toLocaleString() || 'N/A'}`);
      console.log(`   Salario: €${localPlayer.salary?.toLocaleString() || 'N/A'}`);
      console.log(`   Club: ${localPlayer.club || 'Libre'}`);
      console.log(`   Atributos principales: ${JSON.stringify(localPlayer.attributes || {})}`);

      playerId = localPlayer.id; // Use the found ID for Supabase search

    } catch (error) {
      console.log('❌ Error buscando en IndexedDB:', error);
      return;
    }

    // 2. Buscar en Supabase
    console.log('\n2️⃣ 🗄️ BUSCANDO EN SUPABASE:');
    try {
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      const { data: supabasePlayer, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Jugador no encontrado en Supabase');
          console.log('💡 El jugador existe localmente pero no está sincronizado');
        } else {
          console.log('❌ Error consultando Supabase:', error.message);
        }
        return;
      }

      console.log('✅ Jugador encontrado en Supabase:');
      console.log(`   ID: ${supabasePlayer.id}`);
      console.log(`   Nombre: ${supabasePlayer.name}`);
      console.log(`   Posición: ${supabasePlayer.position}`);
      console.log(`   Valor: €${supabasePlayer.transfer_value?.toLocaleString() || 'N/A'}`);
      console.log(`   Club ID: ${supabasePlayer.club_id || 'N/A'}`);
      console.log(`   Atributos: ${JSON.stringify(supabasePlayer.attributes || {})}`);
      console.log(`   Última actualización: ${supabasePlayer.updated_at}`);

    } catch (error) {
      console.log('❌ Error consultando Supabase:', error);
    }

    // 3. Comparación de datos
    console.log('\n3️⃣ 🔍 COMPARACIÓN DE DATOS:');
    console.log('   (Compara manualmente los valores mostrados arriba)');
    console.log('   ✅ Coinciden: Los datos están sincronizados');
    console.log('   ❌ Difieren: Hay problemas de sincronización');

    console.log('\n' + '=' .repeat(60));
    console.log('🎯 Verificación completada.');
  };

  // Check RLS policies function
  window.checkRLSPolicies = async (tableName = 'players') => {
    console.log(`🔒 Verificando políticas RLS para tabla '${tableName}'`);
    console.log('=' .repeat(60));

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ No estás en modo Supabase');
      return;
    }

    try {
      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      console.log('🔍 Probando permisos de operaciones...\n');

      // Test 1: SELECT permission
      console.log('1️⃣ SELECT (lectura):');
      try {
        const { data: selectData, error: selectError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (selectError) {
          console.log(`   ❌ Error: ${selectError.message}`);
          if (selectError.message.includes('RLS')) {
            console.log('   💡 Problema: Política RLS bloqueando SELECT');
          }
        } else {
          console.log(`   ✅ OK - Encontrados ${selectData?.length || 0} registros`);
        }
      } catch (error) {
        console.log(`   ❌ Error inesperado: ${error}`);
      }

      // Test 2: INSERT permission (try with minimal data)
      console.log('\n2️⃣ INSERT (inserción):');
      const testInsertId = `test-rls-${Date.now()}`;
      let testInsertData: any = null;

      if (tableName === 'players') {
        testInsertData = {
          id: testInsertId,
          name: 'Test RLS Player',
          position: 'PT',
          attributes: { test: true }
        };
      } else if (tableName === 'matches') {
        // Obtener un torneo existente para respetar la FK si aplica
        let tournamentId: string | null = null;
        try {
          const { data: tournaments } = await supabase
            .from('tournaments')
            .select('id')
            .limit(1);
          tournamentId = tournaments && tournaments.length > 0 ? tournaments[0].id : null;
        } catch {}

        testInsertData = {
          id: testInsertId,
          tournament_id: tournamentId,
          round: 1,
          date: new Date().toISOString(),
          home_team: 'Test FC',
          away_team: 'RLS United',
          status: 'scheduled',
          scorers: [],
          highlights: []
        };
      } else {
        // Fallback genérico: sólo id si la tabla lo permite
        testInsertData = { id: testInsertId };
      }

      try {
        const { data: insertData, error: insertError } = await supabase
          .from(tableName)
          .insert(testInsertData)
          .select();

        if (insertError) {
          console.log(`   ❌ Error: ${insertError.message}`);
          if (insertError.message.includes('RLS')) {
            console.log('   💡 Problema: Política RLS bloqueando INSERT');
          } else if (insertError.message.includes('violates')) {
            console.log('   💡 Problema: Violación de restricciones de tabla');
          }
        } else {
          console.log(`   ✅ OK - Insertado registro de prueba`);
          // Clean up test record
          await supabase.from(tableName).delete().eq('id', testInsertData.id);
          console.log(`   🧹 Registro de prueba eliminado`);
        }
      } catch (error) {
        console.log(`   ❌ Error inesperado: ${error}`);
      }

      // Test 3: UPDATE permission (try updating existing record)
      console.log('\n3️⃣ UPDATE (actualización):');
      try {
        // First get an existing record
        const { data: existingData, error: fetchError } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);

        if (fetchError || !existingData || existingData.length === 0) {
          console.log(`   ⚠️ No hay registros existentes para probar UPDATE`);
        } else {
          const testId = existingData[0].id;
          const updateData = tableName === 'players' ?
            { updated_at: new Date().toISOString() } :
            { updated_at: new Date().toISOString() };

          const { data: updateDataResult, error: updateError } = await supabase
            .from(tableName)
            .update(updateData)
            .eq('id', testId)
            .select();

          if (updateError) {
            console.log(`   ❌ Error: ${updateError.message}`);
            if (updateError.message.includes('RLS')) {
              console.log('   💡 Problema: Política RLS bloqueando UPDATE');
            }
          } else {
            console.log(`   ✅ OK - Actualizado registro existente`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error inesperado: ${error}`);
      }

      // Test 4: DELETE permission (try deleting test record we may have created)
      console.log('\n4️⃣ DELETE (eliminación):');
      try {
        const testDeleteId = `test-rls-${Date.now()}`;
        const { data: deleteData, error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq('id', testDeleteId);

        if (deleteError) {
          console.log(`   ❌ Error: ${deleteError.message}`);
          if (deleteError.message.includes('RLS')) {
            console.log('   💡 Problema: Política RLS bloqueando DELETE');
          }
        } else {
          console.log(`   ✅ OK - DELETE permitido (aunque no había registro)`);
        }
      } catch (error) {
        console.log(`   ❌ Error inesperado: ${error}`);
      }

      // Summary and recommendations
      console.log('\n📋 RESUMEN Y RECOMENDACIONES:');
      console.log('🔒 Si ves errores RLS, las políticas de seguridad están demasiado restrictivas');
      console.log('💡 Soluciones posibles:');
      console.log('   • Deshabilitar RLS temporalmente para testing: ALTER TABLE players DISABLE ROW LEVEL SECURITY;');
      console.log('   • Crear políticas RLS que permitan operaciones para usuarios autenticados');
      console.log('   • Revisar permisos del usuario admin en Supabase Dashboard');
      console.log('   • Usar Service Role Key para operaciones admin (más peligroso)');

      console.log('\n🔧 POLÍTICAS RLS RECOMENDADAS para tabla players:');
      console.log('   • ENABLE ROW LEVEL SECURITY en la tabla');
      console.log('   • Política SELECT: Permitir a usuarios autenticados ver todos los players');
      console.log('   • Política INSERT: Permitir a admins (role = \'admin\') insertar players');
      console.log('   • Política UPDATE: Permitir a admins actualizar players');
      console.log('   • Política DELETE: Permitir a admins eliminar players');

    } catch (error) {
      console.error('❌ Error verificando políticas RLS:', error);
    }
  };

  // Generate RLS policies SQL function
  window.checkClubSync = async (clubIdOrName) => {
  console.log(`🔍 Verificando sincronización del club: ${clubIdOrName}`);
  console.log('='.repeat(60));

  try {
    // Import services
    const { listClubs } = await import('./utils/clubService');
    const { getSupabaseClient } = await import('./lib/supabase');

    // Buscar en IndexedDB
    console.log('1️⃣ 📊 BUSCANDO EN IndexedDB:');
    const clubs = await listClubs();
    let localClub = null;

    if (clubs && clubs.length > 0) {
      localClub = clubs.find(c => c.id === clubIdOrName || c.name.toLowerCase().includes(clubIdOrName.toLowerCase()));
    }

    if (localClub) {
      console.log('✅ Club encontrado en IndexedDB:');
      console.log(`   ID: ${localClub.id}`);
      console.log(`   Nombre: ${localClub.name}`);
      console.log(`   Logo: ${localClub.logo}`);
      console.log(`   Presupuesto: €${localClub.budget.toLocaleString()}`);
      console.log(`   Estadio: ${localClub.stadium}`);
      console.log(`   Manager: ${localClub.manager}`);
    } else {
      console.log('❌ Club NO encontrado en IndexedDB');
      return;
    }

    // Buscar en Supabase
    console.log('\n2️⃣ 🗄️ BUSCANDO EN SUPABASE:');
    const supabase = getSupabaseClient();

    const { data: supabaseClub, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', localClub.id)
      .single();

    if (error) {
      console.log('❌ Error buscando en Supabase:', error.message);
      return;
    }

    if (supabaseClub) {
      console.log('✅ Club encontrado en Supabase:');
      console.log(`   ID: ${supabaseClub.id}`);
      console.log(`   Nombre: ${supabaseClub.name}`);
      console.log(`   Logo: ${supabaseClub.logo}`);
      console.log(`   Presupuesto: €${supabaseClub.budget?.toLocaleString() || 'N/A'}`);
      console.log(`   Estadio: ${supabaseClub.stadium || 'N/A'}`);
      console.log(`   Manager: ${supabaseClub.manager || 'N/A'}`);
      console.log(`   Última actualización: ${supabaseClub.updated_at || 'N/A'}`);
    } else {
      console.log('❌ Club NO encontrado en Supabase');
    }

    // Comparación
    console.log('\n3️⃣ 🔍 COMPARACIÓN DE DATOS:');
    if (supabaseClub) {
      const synced = localClub.name === supabaseClub.name &&
                    localClub.logo === supabaseClub.logo &&
                    localClub.budget === supabaseClub.budget &&
                    localClub.stadium === supabaseClub.stadium &&
                    localClub.manager === supabaseClub.manager;

      if (synced) {
        console.log('✅ Coinciden: Los datos están sincronizados');
      } else {
        console.log('❌ Difieren: Hay problemas de sincronización');
        console.log('   Diferencias encontradas:');
        if (localClub.name !== supabaseClub.name) console.log(`   - Nombre: "${localClub.name}" vs "${supabaseClub.name}"`);
        if (localClub.logo !== supabaseClub.logo) console.log(`   - Logo: "${localClub.logo}" vs "${supabaseClub.logo}"`);
        if (localClub.budget !== supabaseClub.budget) console.log(`   - Presupuesto: ${localClub.budget} vs ${supabaseClub.budget}`);
        if (localClub.stadium !== supabaseClub.stadium) console.log(`   - Estadio: "${localClub.stadium}" vs "${supabaseClub.stadium}"`);
        if (localClub.manager !== supabaseClub.manager) console.log(`   - Manager: "${localClub.manager}" vs "${supabaseClub.manager}"`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎯 Verificación completada.');

  } catch (error) {
    console.error('❌ Error en checkClubSync:', error);
  }
};

window.generateRLSPolicies = (tableName = 'clubs') => {
    console.log(`📝 Generando políticas RLS para tabla '${tableName}'`);
    console.log('=' .repeat(60));

    console.log('🔧 EJECUTAR ESTE SQL en Supabase SQL Editor:\n');

    // Casos especiales para tablas con lectura pública
    const publicReadTables = ['tournaments', 'blog_posts', 'matches'];

    const selectPolicy = publicReadTables.includes(tableName)
      ? `-- Política SELECT: Permitir lectura pública
CREATE POLICY "Public read access for ${tableName}" ON ${tableName}
  FOR SELECT USING (true);`
      : `-- Política SELECT: Permitir a usuarios autenticados ver todos los registros
CREATE POLICY "${tableName}_select_policy" ON ${tableName}
  FOR SELECT
  USING (auth.role() = 'authenticated');`;

    const sql = `
-- Habilitar RLS en la tabla ${tableName}
ALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;

${selectPolicy}

-- Política ALL: Permitir a usuarios con rol 'admin' todas las operaciones de modificación
CREATE POLICY "Admin full access for ${tableName}" ON ${tableName}
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = '${tableName}'
ORDER BY policyname;
`;

    console.log(sql);

    console.log('\n' + '=' .repeat(60));
    console.log('💡 INSTRUCCIONES:');
    console.log('1. Ve a tu Supabase Dashboard');
    console.log('2. Ve a SQL Editor');
    console.log('3. Copia y pega el SQL de arriba');
    console.log('4. Ejecuta el SQL');
    console.log('5. Verifica que las políticas se crearon correctamente');
    console.log('6. Prueba nuevamente la sincronización: await checkRLSPolicies("players")');

    console.log('\n⚠️ NOTA: Asegúrate de que el usuario admin tenga role = "admin" en la tabla profiles');
  };

  // Test player edit and sync function
  window.testPlayerEditSync = async (playerIdOrName: string) => {
    console.log(`🧪 Probando edición y sincronización del jugador: ${playerIdOrName}`);
    console.log('=' .repeat(70));

    try {
      // Import playerService
      const playerService = await import('./utils/playerService');
      const players = await playerService.listPlayers();

      // Find the player
      let player = null;
      if (playerIdOrName.startsWith('imp-') || playerIdOrName.match(/^\d+$/)) {
        player = players.find(p => p.id === playerIdOrName);
      } else {
        player = players.find(p =>
          p.name.toLowerCase().includes(playerIdOrName.toLowerCase()) ||
          p.id === playerIdOrName
        );
      }

      if (!player) {
        console.log('❌ Jugador no encontrado');
        return;
      }

      console.log('📋 Jugador encontrado:');
      console.log(`   ID: ${player.id}`);
      console.log(`   Nombre: ${player.name}`);
      console.log(`   Atributos actuales: ${JSON.stringify(player.attributes || {})}`);

      // Create modified version with different attributes
      const modifiedAttributes = {
        ...player.attributes,
        // Modify some goalkeeper attributes to test sync
        reflexes: 99, // Change from 95 to 99
        catching: 95, // Change from 91 to 95
        goalkeeping: 97, // Change from 93 to 97
        // Add a test attribute
        testSync: true
      };

      const modifiedPlayer = {
        ...player,
        attributes: modifiedAttributes,
        marketValue: (player.marketValue || 0) + 1000000, // Increase value by 1M
      };

      console.log('\n🔄 Aplicando cambios...');
      console.log(`   Atributos modificados: ${JSON.stringify(modifiedAttributes)}`);
      console.log(`   Nuevo valor: €${modifiedPlayer.marketValue?.toLocaleString()}`);

      // Update the player (this should trigger sync to Supabase)
      await playerService.updatePlayer(modifiedPlayer);

      console.log('\n✅ Jugador actualizado localmente');

      // Wait a moment for sync to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('\n🔍 Verificando sincronización...');

      // Check sync status
      await window.checkPlayerSync(player.id);

      console.log('\n🎯 Prueba completada!');
      console.log('   • Si los atributos coinciden: ✅ Sincronización funcionando');
      console.log('   • Si hay diferencias: ❌ Problemas de sincronización');

    } catch (error) {
      console.error('❌ Error en la prueba:', error);
    }
  };

  // Check Supabase table schema function
  window.checkSupabaseTableSchema = async (tableName = 'players') => {
    console.log(`🔍 Verificando esquema de tabla '${tableName}' en Supabase...`);

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ No estás en modo Supabase');
      return;
    }

    try {
      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      // Try to get table info using RPC or direct query
      console.log('📋 Consultando información de la tabla...');

      // Method 1: Try to get a sample record to see available fields
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (sampleError) {
        console.error('❌ Error obteniendo datos de muestra:', sampleError.message);
        return;
      }

      if (!sampleData || sampleData.length === 0) {
        console.log('⚠️ La tabla está vacía, no se puede determinar el esquema');
        return;
      }

      const sampleRecord = sampleData[0];
      const columns = Object.keys(sampleRecord);

      console.log('✅ Columnas encontradas en la tabla:');
      columns.forEach((column, index) => {
        const value = sampleRecord[column];
        const type = Array.isArray(value) ? 'array' :
                    typeof value === 'object' && value !== null ? 'object' :
                    typeof value;
        console.log(`   ${index + 1}. ${column}: ${type}`);
      });

      console.log(`\n📊 Total de columnas: ${columns.length}`);

      // Specific check for players table
      if (tableName === 'players') {
        console.log('\n🎯 Verificación específica para tabla players:');

        const requiredColumns = ['id', 'name', 'position', 'attributes'];
        const optionalColumns = ['market_value', 'salary', 'club', 'club_id', 'matches', 'dorsal', 'height', 'weight', 'updated_at'];

        requiredColumns.forEach(col => {
          if (columns.includes(col)) {
            console.log(`   ✅ ${col} (requerido)`);
          } else {
            console.log(`   ❌ ${col} (requerido - FALTA)`);
          }
        });

        optionalColumns.forEach(col => {
          if (columns.includes(col)) {
            console.log(`   ✅ ${col} (opcional)`);
          } else {
            console.log(`   ⚠️ ${col} (opcional - no existe)`);
          }
        });
      }

    } catch (error) {
      console.error('❌ Error verificando esquema de tabla:', error);
    }
  };

  // Sync all clubs from IndexedDB to Supabase
  window.migrateAllMatchesToSupabase = async () => {
    try {
      const { migrateAllMatchesToSupabase } = await import('./utils/tournamentService');
      console.log('🚀 Iniciando migración de todos los partidos a Supabase...');
      const result = await migrateAllMatchesToSupabase();
      console.log('✅ Migración completada:', result);
      alert(`✅ Migración completada:\n${result.tournaments} torneos\n${result.matches} partidos\n${result.errors.length} errores`);
      return result;
    } catch (error) {
      console.error('❌ Error en migrateAllMatchesToSupabase:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  };

  // Expose match migration function (migrates from tournaments.matches to independent table)
  window.migrateMatchesFromTournaments = async (options?: { dryRun?: boolean; clearTournamentMatches?: boolean }) => {
    try {
      const { migrateMatchesFromTournaments } = await import('./utils/migrateMatchesToTable');
      console.log('🚀 Iniciando migración de partidos desde tournaments.matches a tabla matches...');
      const result = await migrateMatchesFromTournaments(options || {});
      console.log('✅ Migración completada:', result);
      alert(`✅ Migración completada:\n${result.tournamentsProcessed} torneos procesados\n${result.matchesMigrated} partidos migrados\n${result.matchesSkipped} partidos saltados\n${result.errors.length} errores`);
      return result;
    } catch (error) {
      console.error('❌ Error en migrateMatchesFromTournaments:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  };
  
  console.log('💡 Nueva función disponible:');
  console.log('   window.migrateMatchesFromTournaments({ dryRun: true }) // Probar primero');
  console.log('   window.migrateMatchesFromTournaments({ clearTournamentMatches: true }) // Migrar y limpiar');

  window.syncAllClubsToSupabase = async () => {
    console.log('🔄 Sincronizando todos los clubs de IndexedDB a Supabase...');

    try {
      // Import services
      const { listClubs } = await import('./utils/clubService');
      const { getSupabaseClient } = await import('./lib/supabase');

      const clubs = await listClubs();
      const supabase = getSupabaseClient();

      console.log(`📋 Sincronizando ${clubs.length} clubs...`);

      // Sync in batches to avoid timeout
      const batchSize = 50;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < clubs.length; i += batchSize) {
        const batch = clubs.slice(i, i + batchSize);
        console.log(`   Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(clubs.length/batchSize)} (${batch.length} clubs)...`);

        for (const club of batch) {
          try {
            const { error } = await supabase
              .from('clubs')
              .upsert({
                id: club.id,
                name: club.name,
                logo: club.logo,
                foundedYear: club.foundedYear,
                stadium: club.stadium,
                budget: club.budget,
                manager: club.manager,
                playStyle: club.playStyle,
                primaryColor: club.primaryColor,
                secondaryColor: club.secondaryColor,
                description: club.description,
                reputation: club.reputation,
                fanBase: club.fanBase,
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });

            if (error) {
              console.error(`   ❌ Error sincronizando club ${club.name}:`, error);
              errorCount++;
              if (errorCount > 5) break; // Stop after 5 errors
            } else {
              successCount++;
            }

          } catch (error) {
            console.error(`   ❌ Error procesando club ${club.name}:`, error);
            errorCount++;
          }
        }
      }

      console.log(`✅ Sincronización completada: ${successCount} exitosos, ${errorCount} errores`);

    } catch (error) {
      console.error('❌ Error en syncAllClubsToSupabase:', error);
    }
  };

  // Sync all players to Supabase function
  window.syncAllPlayersToSupabase = async () => {
    console.log('🔄 Sincronizando TODOS los jugadores a Supabase...');

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para sincronizar');
      console.log('Ejecuta: await toggleSupabaseMode(true)');
      return;
    }

    try {
      // Import playerService
      const playerService = await import('./utils/playerService');
      const players = await playerService.listPlayers();

      console.log(`📊 Encontrados ${players.length} jugadores para sincronizar`);

      if (players.length === 0) {
        console.log('⚠️ No hay jugadores para sincronizar');
        return;
      }

      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      // Map players to Supabase format (using correct column names and all required fields)
      const mappedPlayers = players.map(player => {
        // Handle free agents: if clubId is 'libre' or null/undefined, set club_id to null
        const isFreeAgent = !player.clubId || player.clubId === 'libre' || player.clubId === 'free';

        return {
          id: player.id,
          name: player.name,
          age: player.age || 25,
          position: player.position,
          nationality: player.nationality || 'Argentina',
          club_id: isFreeAgent ? null : player.clubId,
        overall: player.overall || 50,
        potential: player.potential || player.overall || 50,
        transfer_listed: player.transferListed || false,
        transfer_value: player.marketValue || 0,
        image: player.image || '',
        attributes: player.attributes,
        skills: player.skills || [],
        playing_styles: player.playingStyles || [],
        contract: player.contract || { expires: new Date().toISOString(), salary: 0 },
        form: player.form || 3,
        goals: player.goals || 0,
        assists: player.assists || 0,
        appearances: player.appearances || 0,
        matches: player.matches || 0,
        dorsal: player.dorsal || 1,
        injury_resistance: player.injuryResistance || 50,
        height: player.height,
        weight: player.weight,
        updated_at: new Date().toISOString()
        };
      });

      console.log('📋 Sincronizando jugadores...');

      // Sync in batches to avoid timeout
      const batchSize = 100;
      let synced = 0;
      let errors = 0;

      for (let i = 0; i < mappedPlayers.length; i += batchSize) {
        const batch = mappedPlayers.slice(i, i + batchSize);
        console.log(`🔄 Sincronizando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(mappedPlayers.length/batchSize)} (${batch.length} jugadores)...`);

        try {
          const { error } = await supabase.from('players').upsert(batch, { onConflict: 'id' });

          if (error) {
            console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error);
            errors += batch.length;
          } else {
            synced += batch.length;
            console.log(`✅ Lote ${Math.floor(i/batchSize) + 1} sincronizado (${batch.length} jugadores)`);
          }
        } catch (batchError) {
          console.error(`❌ Error inesperado en lote ${Math.floor(i/batchSize) + 1}:`, batchError);
          errors += batch.length;
        }
      }

      console.log('🎯 Sincronización completada!');
      console.log(`✅ Jugadores sincronizados: ${synced}`);
      if (errors > 0) {
        console.log(`❌ Errores: ${errors}`);
      }
      console.log('📋 Los cambios realizados en Panel Admin ahora se verán en Supabase');

    } catch (error) {
      console.error('❌ Error sincronizando jugadores:', error);
    }
  };

  window.syncAllTournamentsToSupabase = async () => {
    console.log('🌀 Sincronizando TODOS los torneos a Supabase...');

    try {
      const { config } = await import('./lib/config');
      if (!config.useSupabase) {
        console.error('❌ Debes habilitar Supabase antes de sincronizar torneos');
        console.log('Ejecuta: await toggleSupabaseMode(true)');
        return;
      }

      const { syncAllTournamentsToSupabase: syncTournaments } = await import('./utils/tournamentService');
      const result = await syncTournaments();

      const summary = `Torneos sincronizados: ${result.synced}/${result.total}`;
      const failureInfo = result.failed ? ` | Fallidos: ${result.failed}` : '';

      console.log(`✅ ${summary}${failureInfo}`);
      if (result.failed && result.errors.length) {
        console.warn('⚠️ Torneos con errores:', result.errors);
      }

      alert(`✅ Sincronización completada.\n${summary}${failureInfo}`);
    } catch (error) {
      console.error('❌ Error en syncAllTournamentsToSupabase:', error);
      alert(`❌ Error sincronizando torneos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Posts management functions
  window.initializePosts = async () => {
    console.log('📝 Inicializando posts en Supabase...');

    const { config } = await import('./lib/config');
    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para inicializar posts');
      console.log('Ejecuta: await toggleSupabaseMode(true)');
      return;
    }

    try {
      const { initializePosts } = await import('./utils/postService');
      await initializePosts();
      console.log('✅ Posts inicializados exitosamente');
    } catch (error) {
      console.error('❌ Error inicializando posts:', error);
    }
  };

  window.clearPosts = async () => {
    console.log('🧹 Eliminando todos los posts de Supabase...');

    const { config } = await import('./lib/config');
    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para limpiar posts');
      console.log('Ejecuta: await toggleSupabaseMode(true)');
      return;
    }

    try {
      const { clearPosts } = await import('./utils/postService');
      await clearPosts();
      console.log('✅ Posts eliminados exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando posts:', error);
    }
  };

  window.syncPostsToSupabase = async () => {
    console.log('🔄 Sincronizando posts a Supabase...');

    const { config } = await import('./lib/config');
    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para sincronizar posts');
      console.log('Ejecuta: await toggleSupabaseMode(true)');
      return;
    }

    try {
      const { listPosts } = await import('./utils/postService');
      const posts = await listPosts();
      console.log(`📊 Encontrados ${posts.length} posts para sincronizar`);

      if (posts.length === 0) {
        console.log('⚠️ No hay posts para sincronizar');
        return;
      }

      console.log('✅ Posts ya están sincronizados en Supabase');
    } catch (error) {
      console.error('❌ Error sincronizando posts:', error);
    }
  };

  // Supabase migration functions
  window.migrateToSupabase = async () => {
    console.log('🚀 Iniciando migración completa a Supabase...');

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ Supabase no está habilitado. Ejecuta: toggleSupabaseMode()');
      return;
    }

    try {
      // Get Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      console.log('📤 Migrando clubs...');
      const clubs = await dbService.getAll('clubs');
      console.log(`   Encontrados ${clubs.length} clubs localmente`);
      console.log(`   Primer club de ejemplo:`, clubs[0]);

      if (clubs.length > 0) {
        // Insert one by one to see which one fails
        let successCount = 0;
        let errorCount = 0;

        for (const club of clubs) {
          try {
            const { error } = await supabase
              .from('clubs')
              .upsert({
                id: club.id,
                name: club.name,
                logo: club.logo,
                foundedYear: club.foundedYear,
                stadium: club.stadium,
                budget: club.budget,
                manager: club.manager,
                playStyle: club.playStyle,
                primaryColor: club.primaryColor,
                secondaryColor: club.secondaryColor,
                description: club.description,
                reputation: club.reputation,
                fanBase: club.fanBase
              }, { onConflict: 'id' });

            if (error) {
              console.error(`   ❌ Error migrando club ${club.name}:`, error);
              errorCount++;
              if (errorCount > 3) break; // Stop after 3 errors to avoid spam
            } else {
              successCount++;
            }
          } catch (err) {
            console.error(`   ❌ Exception migrando club ${club.name}:`, err);
            errorCount++;
          }
        }

        console.log(`✅ Migrados ${successCount} clubs exitosamente`);
        if (errorCount > 0) {
          console.log(`❌ ${errorCount} clubs fallaron`);
        }
      }

      console.log('⚽ Migrando players...');
      const players = await dbService.getAll('players');
      console.log(`   Encontrados ${players.length} players localmente`);
      console.log(`   Primer player de ejemplo:`, players[0]);

      if (players.length > 0) {
        // Map players to snake_case for Supabase
        const mappedPlayers = players.map(player => ({
          id: player.id,
          name: player.name || 'Unknown Player',
          age: player.age || 18,
          position: player.position || 'DEL',
          nationality: player.nationality || 'Desconocida',
          club_id: player.clubId || null, // camelCase -> snake_case
          overall: player.overall || 50,
          potential: player.potential || player.overall || 50, // Ensure not null
          transfer_listed: player.transferListed || false, // camelCase -> snake_case
          transfer_value: player.transferValue || 0, // camelCase -> snake_case
          image: player.image || '/default.png',
          attributes: player.attributes || {},
          skills: player.skills || {},
          playing_styles: player.playingStyles || {}, // camelCase -> snake_case
          contract: player.contract || {},
          form: player.form || 50,
          goals: player.goals || 0,
          assists: player.assists || 0,
          appearances: player.appearances || 0,
          matches: player.matches || 0,
          dorsal: player.dorsal || null,
          injury_resistance: player.injuryResistance || 50, // camelCase -> snake_case
          height: player.height || null,
          weight: player.weight || null
        }));

        console.log(`   Player mapeado de ejemplo:`, mappedPlayers[0]);

        const { error } = await supabase.from('players').upsert(mappedPlayers, { onConflict: 'id' });
        if (error) throw error;
        console.log(`✅ Migrados ${players.length} players`);
      }

      console.log('🏆 Migrando tournaments...');
      const tournaments = await dbService.getAll('tournaments');
      console.log(`   Encontrados ${tournaments.length} tournaments localmente`);

      if (tournaments.length > 0) {
        console.log(`   Primer tournament de ejemplo:`, tournaments[0]);

        // Map tournaments to snake_case for Supabase
        const mappedTournaments = tournaments.map(tournament => ({
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
          top_scorer: tournament.topScorer || null // camelCase -> snake_case
        }));

        console.log(`   Tournament mapeado de ejemplo:`, mappedTournaments[0]);

        const { error } = await supabase.from('tournaments').upsert(mappedTournaments, { onConflict: 'id' });
        if (error) throw error;

        console.log(`✅ Migrados ${tournaments.length} tournaments`);
      }

      console.log('🎉 ¡Migración completada exitosamente!');
      console.log('📊 Ahora puedes usar Supabase como backend principal');

    } catch (error) {
      console.error('❌ Error en migración:', error);
    }
  };

  window.toggleSupabaseMode = async () => {
    // Import config dynamically
    const { config } = await import('./lib/config');

    const newMode = !config.useSupabase;
    config.useSupabase = newMode;
    localStorage.setItem('virtual_zone_use_supabase', newMode.toString());

    console.log(`🔄 Modo Supabase: ${newMode ? 'HABILITADO' : 'DESHABILITADO'}`);
    console.log(`📋 Para aplicar cambios: recarga la página (F5)`);

    if (newMode) {
      console.log('🚀 Modo híbrido activado:');
      console.log('   • Supabase como backend principal');
      console.log('   • IndexedDB como cache offline');
      console.log('   • Sincronización automática');
    } else {
      console.log('🏠 Modo legacy activado:');
      console.log('   • IndexedDB como único backend');
      console.log('   • Funcionalidad offline completa');
    }
  };

  window.createAdminUser = async () => {
    console.log('👑 Creando usuario admin...');

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para crear admin');
      console.log('Ejecuta: await toggleSupabaseMode()');
      return;
    }

    try {
      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      const adminEmail = 'admin@lavirtualzone.com';
      const adminPassword = 'admin123';
      const adminUsername = 'admin';

      console.log(`📧 Creando usuario admin: ${adminEmail}`);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            username: adminUsername,
            role: 'admin'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          console.log('ℹ️ El usuario admin ya existe, actualizando perfil...');

          // Try to sign in instead
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: adminEmail,
            password: adminPassword
          });

          if (signInError) {
            console.error('❌ Error al iniciar sesión con admin existente:', signInError);
            return;
          }

          console.log('✅ Sesión admin iniciada');
        } else {
          throw authError;
        }
      } else {
        console.log('✅ Usuario admin creado en auth');
      }

      // Wait a moment for the profile trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update or create profile
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            username: adminUsername,
            email: adminEmail,
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, { onConflict: 'id' });

        if (profileError) {
          console.error('❌ Error creando perfil admin:', profileError);
        } else {
          console.log('✅ Perfil admin creado/actualizado');
        }
      }

      console.log('👑 ¡Usuario admin listo!');
      console.log(`   📧 Email: ${adminEmail}`);
      console.log(`   🔑 Password: ${adminPassword}`);
      console.log(`   👤 Username: ${adminUsername}`);
      console.log(`   🛡️ Role: admin`);

    } catch (error) {
      console.error('❌ Error creando usuario admin:', error);
    }
  };

  window.fixAdminRole = async () => {
    console.log('🔧 Arreglando rol de admin...');

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase');
      return;
    }

    try {
      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ No hay usuario autenticado');
        return;
      }

      console.log(`🔍 Verificando perfil de: ${user.email}`);

      // Check current profile
      const { data: currentProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) {
        console.error('❌ Error obteniendo perfil:', fetchError);
        return;
      }

      console.log('📋 Perfil actual:', currentProfile);

      // Update role to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError);
      } else {
        console.log('✅ Rol actualizado a admin');

        // Force reload of user data
        console.log('🔄 Recargando datos de usuario...');
        console.log('📋 Recarga la página para ver los cambios');
      }

    } catch (error) {
      console.error('❌ Error arreglando rol admin:', error);
    }
  };

  window.recreateAdminUser = async () => {
    console.log('🔄 Eliminando y recreando usuario admin...');

    // Import config dynamically
    const { config } = await import('./lib/config');

    if (!config.useSupabase) {
      console.error('❌ Debes estar en modo Supabase para recrear admin');
      console.log('Ejecuta: await toggleSupabaseMode()');
      return;
    }

    try {
      // Import Supabase client
      const { getSupabaseClient } = await import('./lib/supabase');
      const supabase = getSupabaseClient();

      const adminEmail = 'admin@lavirtualzone.com';
      const adminPassword = 'admin123';
      const adminUsername = 'admin';

      console.log(`🗑️ Eliminando usuario admin existente: ${adminEmail}`);

      // First, sign out any current session to avoid conflicts
      console.log('🚪 Cerrando cualquier sesión activa...');
      await supabase.auth.signOut();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Try to delete existing profiles
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', adminEmail);

      if (fetchError) {
        console.log('⚠️ No se pudieron obtener perfiles existentes (posiblemente no hay ninguno):', fetchError.message);
      } else if (existingProfiles && existingProfiles.length > 0) {
        console.log(`📋 Encontrados ${existingProfiles.length} perfiles, eliminando...`);

        for (const profile of existingProfiles) {
          const { error: deleteProfileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profile.id);

          if (deleteProfileError) {
            console.error(`❌ Error eliminando perfil ${profile.id}:`, deleteProfileError);
          } else {
            console.log(`✅ Perfil ${profile.id} eliminado`);
          }
        }
      } else {
        console.log('📋 No se encontraron perfiles existentes');
      }

      // Try to sign in first to check if user exists, then we can try to delete from auth
      console.log('🔍 Verificando si el usuario existe en auth...');
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword
        });

        if (signInError) {
          console.log('ℹ️ Usuario no existe en auth o contraseña incorrecta:', signInError.message);
        } else {
          console.log('✅ Usuario encontrado en auth, intentando eliminar...');

          // If we can sign in, try to delete from auth admin API
          try {
            const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(signInData.user.id);
            if (deleteAuthError) {
              console.log('⚠️ No se pudo eliminar de auth:', deleteAuthError.message);
            } else {
              console.log('✅ Usuario eliminado de auth');
            }
          } catch (authError) {
            console.log('⚠️ Error eliminando de auth:', authError.message);
          }

          // Sign out again
          await supabase.auth.signOut();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (signInAttemptError) {
        console.log('ℹ️ No se pudo verificar existencia del usuario en auth');
      }

      // Wait a moment before creating
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('👑 Creando nuevo usuario admin...');

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminEmail,
        password: adminPassword,
        options: {
          data: {
            username: adminUsername,
            role: 'admin'
          }
        }
      });

      if (authError) {
        // If user already exists, try to sign in and update instead
        if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
          console.log('ℹ️ Usuario ya existe, intentando actualizar perfil existente...');

          try {
            // Try to sign in
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: adminEmail,
              password: adminPassword
            });

            if (signInError) {
              console.error('❌ Error al iniciar sesión con usuario existente:', signInError);
              throw new Error('No se puede acceder al usuario admin existente');
            }

            console.log('✅ Sesión iniciada con usuario existente');

            // Update the profile
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: signInData.user.id,
                username: adminUsername,
                email: adminEmail,
                role: 'admin',
                status: 'active',
                updated_at: new Date().toISOString()
              }, { onConflict: 'id' });

            if (profileError) {
              console.error('❌ Error actualizando perfil admin:', profileError);
              throw profileError;
            }

            console.log('✅ Perfil admin actualizado correctamente');

            // Sign out
            await supabase.auth.signOut();

          } catch (updateError) {
            console.error('❌ Error actualizando usuario existente:', updateError);
            throw updateError;
          }

        } else {
          console.error('❌ Error creando usuario admin:', authError);
          throw authError;
        }
      } else {
        console.log('✅ Usuario admin creado en auth');

        // Wait for profile creation
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Ensure profile exists and has correct data
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              username: adminUsername,
              email: adminEmail,
              role: 'admin',
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'id' });

          if (profileError) {
            console.error('❌ Error creando perfil admin:', profileError);
          } else {
            console.log('✅ Perfil admin creado correctamente');
          }
        }
      }

      console.log('🎉 Usuario admin recreado/actualizado exitosamente!');
      console.log(`📧 Email: ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log('📋 Recarga la página y inicia sesión como admin');

    } catch (error) {
      console.error('❌ Error recreando usuario admin:', error);
      console.log('💡 Posibles soluciones:');
      console.log('   • Verifica que tengas permisos de admin en Supabase');
      console.log('   • Revisa la configuración de Supabase en .env');
      console.log('   • Intenta ejecutar fixAdminRole() en su lugar');
    }
  };

  window.testSessionRecovery = async () => {
  console.log('🔄 Probando recuperación de sesión...');
  console.log('📊 Estado actual de authStore:');

  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
  console.log('   isAuthenticated:', authStore.isAuthenticated);
  console.log('   isLoading:', authStore.isLoading);
  console.log('   user:', authStore.user ? `${authStore.user.username} (${authStore.user.role})` : 'null');

  if (authStore.isLoading) {
    console.log('⏳ Esperando que termine la inicialización...');
    setTimeout(async () => {
      const updatedStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
      console.log('📊 Estado después de inicialización:');
      console.log('   isAuthenticated:', updatedStore.isAuthenticated);
      console.log('   isLoading:', updatedStore.isLoading);
      console.log('   user:', updatedStore.user ? `${updatedStore.user.username} (${updatedStore.user.role})` : 'null');
    }, 3000);
  }
};

window.testProfileUpdate = async () => {
  console.log('🧪 Probando actualización de perfil...');

  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());

  if (!authStore.user) {
    console.error('❌ No hay usuario autenticado');
    return;
  }

  try {
    console.log('📝 Intentando actualizar perfil con datos de prueba...');

    // Test update with minimal data
    const testData = {
      bio: 'Test bio from console',
      location: 'Test location'
    };

    await import('./utils/authService').then(async ({ updateUser }) => {
      const result = await updateUser(testData);
      console.log('✅ Actualización exitosa:', result);
    });

  } catch (error) {
    console.error('❌ Error en actualización de perfil:', error);
  }
};

window.testClubAssignment = async () => {
  console.log('🧪 Probando asignación de club a DT...');

  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());

  if (!authStore.user) {
    console.error('❌ No hay usuario autenticado');
    return;
  }

  try {
    console.log('📝 Intentando asignar club al usuario admin...');

    // Test update with club assignment (should work now)
    const testData = {
      clubId: 'club1', // Asignar a un club existente
      bio: 'Admin con club asignado'
    };

    await import('./utils/authService').then(async ({ updateUser }) => {
      const result = await updateUser(testData);
      console.log('✅ Asignación exitosa:', result);
      console.log('🏟️ Club asignado:', result.club_id || result.clubId);
    });

  } catch (error) {
    console.error('❌ Error en asignación de club:', error);
  }
};

window.assignClubToAdmin = async (clubId = 'club1') => {
  console.log('👑 Asignando club al admin manualmente...');

  const dataStore = await import('./store/dataStore').then(m => m.useDataStore.getState());
  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());

  if (!authStore.user) {
    console.error('❌ No hay usuario autenticado');
    return;
  }

  // Verificar que el club existe
  const club = dataStore.clubs.find(c => c.id === clubId);
  if (!club) {
    console.error(`❌ Club con ID '${clubId}' no encontrado`);
    console.log('🏟️ Clubs disponibles:', dataStore.clubs.map(c => `${c.id}: ${c.name}`).slice(0, 5));
    return;
  }

  try {
    console.log(`📝 Asignando club '${club.name}' (${clubId}) al admin...`);

    const { updateUser } = await import('./utils/authService');

    const result = await updateUser({
      clubId: clubId,
      club: club.name,
      bio: `DT de ${club.name}`
    });

    console.log('✅ Club asignado exitosamente:', {
      username: result.username,
      clubId: result.clubId || result.club_id,
      club: result.club
    });

    console.log('🔄 Recarga la página para ver el Dashboard del DT');

  } catch (error) {
    console.error('❌ Error asignando club:', error);
  }
};

window.checkUserClubStatus = async () => {
  console.log('🔍 Verificando estado del club del usuario...');

  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
  const dataStore = await import('./store/dataStore').then(m => m.useDataStore.getState());

  console.log('👤 Usuario actual:', {
    username: authStore.user?.username,
    role: authStore.user?.role,
    clubId: authStore.user?.clubId,
    club: authStore.user?.club
  });

  console.log('🏟️ Clubs disponibles:', dataStore.clubs.length);

  // Verificar si el usuario tiene un club asignado
  const hasRoleDT = authStore.user?.role === 'dt' || (authStore.user?.roles && authStore.user.roles.includes('dt'));
  const hasClubId = !!authStore.user?.clubId;

  console.log('🔍 Estado del DT:', {
    hasRoleDT,
    hasClubId,
    shouldShowDTDashboard: hasRoleDT && hasClubId
  });

  if (hasClubId && authStore.user?.clubId) {
    const userClub = dataStore.clubs.find(c => c.id === authStore.user?.clubId);
    console.log('🏟️ Club encontrado:', userClub ? userClub.name : 'NINGUNO');
  }

  console.log('💡 Si shouldShowDTDashboard es false, el usuario NO verá el dashboard de DT');
};

window.forceRefreshUserProfile = async () => {
  console.log('🔄 Forzando actualización del perfil de usuario desde Supabase...');

  try {
    const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
    const { getSupabaseCurrentUser } = await import('./utils/authService');

    if (!authStore.user) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    console.log('📡 Obteniendo perfil actualizado desde Supabase...');
    const updatedUser = await getSupabaseCurrentUser();

    if (updatedUser) {
      // Actualizar el estado del authStore usando set() en lugar de asignación directa
      const zustandStore = await import('./store/authStore').then(m => m.useAuthStore);
      zustandStore.setState({ user: updatedUser });

      console.log('✅ Perfil actualizado:', {
        username: updatedUser.username,
        role: updatedUser.role,
        clubId: updatedUser.clubId,
        club: updatedUser.club
      });

      console.log('🔄 Estado actualizado. Recarga la página para ver los cambios.');
    } else {
      console.error('❌ No se pudo obtener el perfil actualizado');
    }

  } catch (error) {
    console.error('❌ Error forzando actualización:', error);
  }
};

window.checkSupabaseProfile = async () => {
  console.log('🔍 Verificando perfil directamente en Supabase...');

  try {
    const { getSupabaseClient } = await import('./lib/supabase');
    const client = getSupabaseClient();

    const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());

    if (!authStore.user) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    console.log('📡 Consultando perfil en Supabase para user ID:', authStore.user.id);

    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', authStore.user.id)
      .single();

    if (error) {
      console.error('❌ Error consultando Supabase:', error);
      return;
    }

    console.log('📋 Perfil en Supabase:', data);

    if (data.club_id) {
      console.log('✅ El usuario SÍ tiene club asignado en Supabase:', data.club_id);
    } else {
      console.log('❌ El usuario NO tiene club asignado en Supabase');
    }

  } catch (error) {
    console.error('❌ Error verificando Supabase:', error);
  }
};

window.testReloadPersistence = async () => {
  console.log('🔄 Probando persistencia después de recarga...');

  // Primero verificar estado actual
  await checkUserClubStatus();

  // Forzar recarga de la página (simular)
  console.log('🔄 Simulando recarga - ejecutando initializeAuth nuevamente...');

  const { useAuthStore } = await import('./store/authStore');
  await useAuthStore.getState().initializeAuth();

  // Verificar estado después de "recarga"
  setTimeout(async () => {
    await checkUserClubStatus();
    await checkSupabaseProfile();
  }, 2000);
};

window.testClubPersistenceAfterTimeout = async () => {
  console.log('🧪 Probando persistencia del club después de timeout de Supabase...');

  // 1. Asignar club si no está asignado
  await checkUserClubStatus();

  const authStore = await import('./store/authStore').then(m => m.useAuthStore.getState());
  if (!authStore.user?.clubId) {
    console.log('📝 Asignando club para la prueba...');
    await assignClubToAdmin('club18');
  }

  // 2. Verificar que el club está asignado
  console.log('✅ Verificando asignación inicial...');
  await checkUserClubStatus();

  // 3. Simular un timeout de Supabase (que activa el evento onAuthStateChange)
  console.log('⏰ Simulando timeout de Supabase...');
  setTimeout(async () => {
    console.log('🔄 Verificando estado después del timeout simulado...');
    await checkUserClubStatus();

    if (authStore.user?.clubId) {
      console.log('✅ ÉXITO: El club se mantiene después del timeout');
    } else {
      console.log('❌ FALLO: El club se perdió después del timeout');
    }
  }, 1000);
};

window.diagnoseSupabase = async () => {
    console.log('🔍 Diagnóstico completo de Supabase...');

    try {
      // Check environment variables
      console.log('📋 Variables de entorno:');
      console.log('   VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Faltante');
      console.log('   VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltante');

      // Import config
      const { config } = await import('./lib/config');
      console.log('   useSupabase:', config.useSupabase);

      // Test Supabase client creation
      console.log('🔧 Probando creación de cliente...');
      const { getSupabaseClient } = await import('./lib/supabase');
      const client = getSupabaseClient();
      console.log('   Cliente creado:', !!client);

      if (client) {
        // Test auth status
        console.log('🔐 Probando estado de autenticación...');
        const { data: { session }, error: sessionError } = await client.auth.getSession();
        if (sessionError) {
          console.error('❌ Error obteniendo sesión:', sessionError.message);
        } else {
          console.log('   Sesión activa:', !!session);
          if (session) {
            console.log('   Usuario:', session.user.email);
            console.log('   Expira:', new Date(session.expires_at * 1000).toLocaleString());
          }
        }

        // Test database connection
        console.log('🗄️ Probando conexión a base de datos...');
        const startTime = Date.now();
        const { data, error } = await client.from('profiles').select('count', { count: 'exact', head: true });
        const endTime = Date.now();

        if (error) {
          console.error('❌ Error de BD:', error.message);
        } else {
          console.log(`✅ Conexión exitosa (${endTime - startTime}ms)`);
        }

        // Test multiple requests (rate limiting)
        console.log('⚡ Probando rate limiting...');
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(client.from('profiles').select('count', { count: 'exact', head: true }));
        }

        const rateStartTime = Date.now();
        const results = await Promise.allSettled(promises);
        const rateEndTime = Date.now();

        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        console.log(`   Resultados: ${successful} exitosos, ${failed} fallidos (${rateEndTime - rateStartTime}ms)`);

        if (failed > 0) {
          console.warn('⚠️ Posible rate limiting detectado');
        }
      }

      // Test Supabase auth specifically
      console.log('🔐 Probando llamadas de autenticación...');
      try {
        const authStartTime = Date.now();
        const { data: { session }, error: authError } = await client.auth.getSession();
        const authEndTime = Date.now();

        if (authError) {
          console.error('❌ Error en auth.getSession():', authError.message);
        } else {
          console.log(`✅ Auth getSession OK (${authEndTime - authStartTime}ms)`);
        }
      } catch (authException) {
        console.error('❌ Exception en auth.getSession():', authException);
      }

      // Test multiple auth calls to see if there's degradation
      console.log('🔄 Probando múltiples llamadas auth...');
      const authPromises = [];
      for (let i = 0; i < 3; i++) {
        authPromises.push(client.auth.getSession());
      }

      const authResults = await Promise.allSettled(authPromises);
      const authSuccessful = authResults.filter(r => r.status === 'fulfilled').length;
      const authFailed = authResults.filter(r => r.status === 'rejected').length;

      console.log(`   Auth calls: ${authSuccessful} exitosos, ${authFailed} fallidos`);

      // Network connectivity test (simpler)
      console.log('🌐 Probando conectividad básica...');
      try {
        const response = await fetch('https://httpbin.org/status/200', { method: 'HEAD' });
        console.log('   Internet:', response.ok ? '✅ OK' : '❌ Problemas');
      } catch (e) {
        console.log('   Internet: ❌ Sin conexión');
      }

      // Browser storage test
      console.log('💾 Probando localStorage...');
      try {
        const testKey = 'supabase_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        console.log('   localStorage: ✅ OK');
      } catch (e) {
        console.log('   localStorage: ❌ Problemas');
      }

    } catch (error) {
      console.error('❌ Error en diagnóstico:', error);
    }
  };
}, 2000);

// Player synchronization functions
window.refreshPlayerFromSupabase = async (playerId) => {
  console.log(`🔄 Refrescando jugador ${playerId} desde Supabase...`);

  try {
    const { getSupabaseClient } = await import('./lib/supabase');
    const client = getSupabaseClient();

    // Get player data from Supabase
    const { data: supabasePlayer, error } = await client
      .from('players')
      .select('*')
      .eq('id', playerId)
      .single();

    if (error) {
      console.error('❌ Error obteniendo jugador de Supabase:', error.message);
      return;
    }

    if (!supabasePlayer) {
      console.log('⚠️ Jugador no encontrado en Supabase');
      return;
    }

    console.log('📥 Datos de Supabase:', supabasePlayer);

    // Update local data
    const dataStore = await import('./store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    const updatedPlayers = currentPlayers.map(player =>
      player.id === playerId ? { ...player, clubId: supabasePlayer.club_id } : player
    );

    await dataStore.updatePlayers(updatedPlayers);

    console.log(`✅ Jugador ${playerId} actualizado. Nuevo clubId: ${supabasePlayer.club_id}`);
    console.log('🔄 Los cambios deberían reflejarse en la UI');

  } catch (error) {
    console.error('❌ Error refrescando jugador:', error);
  }
};

window.syncPlayerClub = async (playerId, clubId) => {
  console.log(`🔄 Sincronizando club de jugador ${playerId} a ${clubId}...`);

  try {
    // Update local data first
    const dataStore = await import('./store/dataStore').then(m => m.useDataStore.getState());
    const currentPlayers = dataStore.players;

    const playerIndex = currentPlayers.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      console.error(`❌ Jugador ${playerId} no encontrado localmente`);
      return;
    }

    // Update local player
    const updatedPlayers = [...currentPlayers];
    updatedPlayers[playerIndex] = { ...updatedPlayers[playerIndex], clubId };

    await dataStore.updatePlayers(updatedPlayers);

    console.log(`✅ Jugador ${playerId} actualizado localmente con clubId: ${clubId}`);
    console.log('🔄 Los cambios deberían reflejarse inmediatamente en la UI');

  } catch (error) {
    console.error('❌ Error sincronizando club del jugador:', error);
  }
};

// Tournament synchronization functions
window.syncTournamentsFromSupabase = async () => {
  console.log('🔄 Sincronizando torneos desde Supabase...');

  try {
    const { config } = await import('./lib/config');
    if (!config.useSupabase) {
      console.log('❌ Supabase no está habilitado');
      return;
    }

    const { forceSyncTournamentsFromSupabase } = await import('./utils/tournamentService');
    await forceSyncTournamentsFromSupabase();

    console.log('✅ Torneos sincronizados desde Supabase');
    console.log('🔄 Los cambios deberían reflejarse inmediatamente en el Panel Admin');

  } catch (error) {
    console.error('❌ Error sincronizando torneos desde Supabase:', error);
  }
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <App />
    </BrowserRouter>
  </StrictMode>
);
 
