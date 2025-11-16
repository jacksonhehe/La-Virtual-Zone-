// Script para contar partidos actuales
// COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR

async function countMatches() {
  try {
    console.log('🔍 Contando partidos...');

    // Acceder directamente a IndexedDB
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        console.log('Accediendo a IndexedDB...');
        const db = await new Promise((resolve, reject) => {
          const request = window.indexedDB.open('VirtualZoneDB', 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        const transaction = db.transaction(['matches'], 'readonly');
        const objectStore = transaction.objectStore('matches');
        const matches = await new Promise((resolve, reject) => {
          const request = objectStore.getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result || []);
        });

        console.log('\n📊 ESTADÍSTICAS DE PARTIDOS:');
        console.log('═══════════════════════════════════════');
        console.log(`Total de partidos: ${matches.length}`);
        console.log(`\nPor estado:`);
        console.log(`  • Programados: ${matches.filter(m => m.status === 'scheduled').length}`);
        console.log(`  • En vivo: ${matches.filter(m => m.status === 'live').length}`);
        console.log(`  • Finalizados: ${matches.filter(m => m.status === 'finished').length}`);
        
        // Contar por torneo
        const byTournament = {};
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
      } catch (e) {
        console.error('❌ Error accediendo a IndexedDB:', e);
        throw e;
      }
    } else {
      console.error('❌ IndexedDB no está disponible');
      return null;
    }
  } catch (error) {
    console.error('❌ Error contando partidos:', error);
    return null;
  }
}

// Ejecutar automáticamente
countMatches();

