// Funciones de debugging para transferencias

// Ejecutar en la consola del navegador (F12 -> Console)



function getPlayersSnapshot() {

  try {

    const playersJson = localStorage.getItem('virtual_zone_players');

    if (playersJson) {

      return JSON.parse(playersJson);

    }

  } catch (error) {

    console.warn('No se pudieron leer jugadores desde localStorage:', error);

  }



  const storePlayers = window.dataStore?.players;

  if (Array.isArray(storePlayers) && storePlayers.length > 0) {

    console.log('[INFO] Usando jugadores desde dataStore (IndexedDB) porque localStorage esta vacio.');

    return storePlayers;

  }



  console.warn('[WARN] No hay jugadores en localStorage ni en dataStore. Abre la app antes de usar estas funciones.');

  return [];

}



function getClubsSnapshot() {

  try {

    const clubsJson = localStorage.getItem('virtual_zone_clubs');

    if (clubsJson) {

      return JSON.parse(clubsJson);

    }

  } catch (error) {

    console.warn('No se pudieron leer clubes desde localStorage:', error);

  }



  const storeClubs = window.dataStore?.clubs;

  if (Array.isArray(storeClubs) && storeClubs.length > 0) {

    console.log('[INFO] Usando clubes desde dataStore (IndexedDB) porque localStorage esta vacio.');

    return storeClubs;

  }



  console.warn('[WARN] No hay clubes en localStorage ni en dataStore. Abre la app antes de usar estas funciones.');

  return [];

}



// Funciones de debugging para transferencias
// Ejecutar en la consola del navegador (F12 -> Console)

function getPlayersSnapshot() {

  try {

    const playersJson = localStorage.getItem('virtual_zone_players');

    if (playersJson) {

      return JSON.parse(playersJson);

    }

  } catch (error) {

    console.warn('No se pudieron leer jugadores desde localStorage:', error);

  }



  const storePlayers = window.dataStore?.players;

  if (Array.isArray(storePlayers) && storePlayers.length > 0) {

    console.log('[INFO] Usando jugadores desde dataStore (IndexedDB) porque localStorage esta vacio.');

    return storePlayers;

  }



  console.warn('[WARN] No hay jugadores en localStorage ni en dataStore. Abre la app antes de usar estas funciones.');

  return [];

}



function getClubsSnapshot() {

  try {

    const clubsJson = localStorage.getItem('virtual_zone_clubs');

    if (clubsJson) {

      return JSON.parse(clubsJson);

    }

  } catch (error) {

    console.warn('No se pudieron leer clubes desde localStorage:', error);

  }



  const storeClubs = window.dataStore?.clubs;

  if (Array.isArray(storeClubs) && storeClubs.length > 0) {

    console.log('[INFO] Usando clubes desde dataStore (IndexedDB) porque localStorage esta vacio.');

    return storeClubs;

  }



  console.warn('[WARN] No hay clubes en localStorage ni en dataStore. Abre la app antes de usar estas funciones.');

  return [];

}



// Función para verificar estado de un jugador
function debugPlayerStatus(playerName) {
  try {
    const players = getPlayersSnapshot();
    const clubs = getClubsSnapshot();

    const player = players.find(p =>
      p.name?.toLowerCase().includes(playerName.toLowerCase())
    );

    if (!player) {
      console.error(`❌ Jugador "${playerName}" no encontrado`);
      return null;
    }

    const currentClub = clubs.find(c => c.id === player.clubId);
    console.log(`📊 Estado del jugador "${player.name}":`);
    console.log(`   - ID: ${player.id}`);
    console.log(`   - Club actual: ${currentClub?.name || 'Desconocido'} (${player.clubId})`);
    console.log(`   - Transferible: ${player.transferListed}`);
    console.log(`   - Valor: ${player.transferValue}`);
    console.log(`   - Posición: ${player.position}`);
    console.log(`   - Overall: ${player.overall}`);

    return player;
  } catch (error) {
    console.error('Error en debugPlayerStatus:', error);
    return null;
  }
}

// Función para verificar transferencias recientes
function debugRecentTransfers(limit = 10) {
  try {
    const transfers = JSON.parse(localStorage.getItem('virtual_zone_transfers') || '[]');

    console.log(`📋 Últimas ${limit} transferencias:`);
    const recent = transfers
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);

    recent.forEach((t, i) => {
      console.log(`   ${i + 1}. ${t.playerName}: ${t.fromClub} → ${t.toClub} (€${t.fee?.toLocaleString() || 'N/A'}) - ${new Date(t.date).toLocaleDateString('es-ES')}`);
    });

    return recent;
  } catch (error) {
    console.error('Error en debugRecentTransfers:', error);
    return [];
  }
}

// Función para verificar ofertas
function debugOffersStatus() {
  try {
    const offers = JSON.parse(localStorage.getItem('virtual_zone_offers') || '[]');

    console.log(`📋 Estado de ofertas (${offers.length} total):`);
    const statusCounts = offers.reduce((acc, offer) => {
      acc[offer.status] = (acc[offer.status] || 0) + 1;
      return acc;
    }, {});

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

    return offers;
  } catch (error) {
    console.error('Error en debugOffersStatus:', error);
    return [];
  }
}

// Función para verificar información completa de un jugador
function debugTransferByPlayer(playerName) {
  try {
    const transfers = JSON.parse(localStorage.getItem('virtual_zone_transfers') || '[]');
    const offers = JSON.parse(localStorage.getItem('virtual_zone_offers') || '[]');

    const transfer = transfers.find(t =>
      t.playerName?.toLowerCase().includes(playerName.toLowerCase())
    );

    const offer = offers.find(o =>
      o.playerName?.toLowerCase().includes(playerName.toLowerCase())
    );

    console.log(`🔍 Información completa de "${playerName}":`);

    if (transfer) {
      console.log(`   ✅ Transferencia encontrada:`);
      console.log(`      - De: ${transfer.fromClub}`);
      console.log(`      - A: ${transfer.toClub}`);
      console.log(`      - Monto: €${transfer.fee?.toLocaleString() || 'N/A'}`);
      console.log(`      - Fecha: ${new Date(transfer.date).toLocaleString('es-ES')}`);
      console.log(`      - ID Transferencia: ${transfer.id}`);
    } else {
      console.log(`   ❌ No se encontró transferencia`);
    }

    if (offer) {
      console.log(`   📝 Oferta encontrada:`);
      console.log(`      - Estado: ${offer.status}`);
      console.log(`      - De: ${offer.fromClub} → A: ${offer.toClub}`);
      console.log(`      - Monto: €${offer.amount?.toLocaleString() || 'N/A'}`);
      console.log(`      - Fecha oferta: ${new Date(offer.date).toLocaleString('es-ES')}`);
      console.log(`      - ID Oferta: ${offer.id}`);
    } else {
      console.log(`   ❌ No se encontró oferta`);
    }

    // También buscar el jugador actual
    const player = debugPlayerStatus(playerName);

    return { transfer, offer, player };
  } catch (error) {
    console.error('Error en debugTransferByPlayer:', error);
    return { transfer: null, offer: null, player: null };
  }
}

// Función para verificar presupuestos de clubes
function debugClubBudgets() {
  try {
    const clubs = getClubsSnapshot();

    console.log(`💰 Presupuestos de clubes:`);
    clubs
      .sort((a, b) => b.budget - a.budget)
      .forEach((club, i) => {
        console.log(`   ${i + 1}. ${club.name}: €${club.budget?.toLocaleString() || 'N/A'}`);
      });

    return clubs;
  } catch (error) {
    console.error('Error en debugClubBudgets:', error);
    return [];
  }
}

// Función completa de diagnóstico
function fullTransferDiagnostic(playerName) {
  console.log(`🔬 DIAGNÓSTICO COMPLETO PARA: ${playerName}`);
  console.log('='.repeat(50));

  const result = debugTransferByPlayer(playerName);
  console.log('');

  console.log('📋 TRANSFERENCIAS RECIENTES:');
  debugRecentTransfers(5);
  console.log('');

  console.log('📊 ESTADO DE OFERTAS:');
  debugOffersStatus();
  console.log('');

  console.log('💰 PRESUPUESTOS DE CLUBES:');
  debugClubBudgets();

  return result;
}

// Hacer funciones globales disponibles
window.debugPlayerStatus = debugPlayerStatus;
window.debugRecentTransfers = debugRecentTransfers;
window.debugOffersStatus = debugOffersStatus;
window.debugTransferByPlayer = debugTransferByPlayer;
window.debugClubBudgets = debugClubBudgets;
window.fullTransferDiagnostic = fullTransferDiagnostic;

console.log('✅ Funciones de debugging cargadas. Ejecuta:');
console.log('   fullTransferDiagnostic("Matheus Jackson")');
console.log('   debugTransferByPlayer("Matheus Jackson")');
console.log('   debugRecentTransfers()');
console.log('   debugClubBudgets()');
