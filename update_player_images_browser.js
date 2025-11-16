// Script para emparejar fotos de jugadores con los jugadores actuales
// COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR
// VERSIÓN PARA CONSOLA DEL NAVEGADOR (sin TypeScript)

// Función para obtener todos los jugadores
async function getAllPlayers() {
  try {
    console.log('Intentando acceder a los datos de jugadores...');

    // PRIMERO: Intentar acceder directamente a IndexedDB (más confiable)
    if (typeof window !== 'undefined' && window.indexedDB) {
      try {
        console.log('Accediendo directamente a IndexedDB...');
        const db = await new Promise((resolve, reject) => {
          const request = window.indexedDB.open('VirtualZoneDB', 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        const transaction = db.transaction(['players'], 'readonly');
        const objectStore = transaction.objectStore('players');
        const players = await new Promise((resolve, reject) => {
          const request = objectStore.getAll();
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result || []);
        });

        console.log(`Encontrados ${players.length} jugadores en IndexedDB`);
        if (players.length > 0) {
          console.log('Primeros 3 players:', players.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
        }
        return players;
      } catch (e) {
        console.error('Error accediendo a IndexedDB:', e);
      }
    }

    // SEGUNDO: Intentar acceder al dataStore global
    let store = window.dataStore || window.store;

    if (!store) {
      console.log('DataStore no encontrado globalmente, intentando acceder desde Zustand...');

      // Intentar acceder directamente desde Zustand
      if (typeof window !== 'undefined' && window.useDataStore) {
        try {
          store = window.useDataStore.getState();
        } catch (e) {
          console.log('No se pudo acceder a useDataStore');
        }
      }
    }

    if (store) {
      // Obtener jugadores del store
      let players = store.players || store.getState?.()?.players || [];

      // Si no hay players, intentar refrescar
      if (players.length === 0 && store.refreshPlayers) {
        console.log('No hay players en el store, intentando refrescar...');
        await store.refreshPlayers();
        players = store.players || store.getState?.()?.players || [];
      }

      console.log(`Encontrados ${players.length} jugadores en el store`);
      return players;
    }

    console.error('No se pudieron obtener los jugadores de ninguna fuente');
    return [];
  } catch (error) {
    console.error('Error obteniendo jugadores:', error);
    return [];
  }
}

// Función para listar fotos disponibles (ahora lee automáticamente de las carpetas)
async function getAvailablePhotos() {
  try {
    console.log('📂 Leyendo fotos disponibles de las carpetas...');

    // Intentar leer dinámicamente las fotos de las carpetas
    // Esta función simula leer de las carpetas (en producción usaría fetch o fs)
    const response = await fetch('/api/photos'); // Endpoint que debería listar las fotos
    if (response.ok) {
      const photos = await response.json();
      console.log(`✅ Fotos cargadas dinámicamente: ${Object.keys(photos).length} clubes`);
      return photos;
    }
  } catch (error) {
    console.log('⚠️ No se pudo cargar dinámicamente, usando lista estática');
  }

  // Fallback: lista estática (actualízala manualmente cuando agregues fotos)
  const photos = {
    'Jackson FC': [
      'Akim Zedadka',
      'Braian Martínez',
      'Bruno Zapelli',
      'Corentin Jean',
      'Dejan Stojanovic',
      'Enric Saborit',
      'Felix Beijmo',
      'Gabi Kanichowsky',
      'Jacob Barrett Laursen',
      'Jasper Löffelsend',
      'Joyskim Dawa',
      'Jón Daði Böðvarsson',
      'Kevin Escamilla',
      'Marcelo Ferreira',
      'Markus Henriksen',
      'Nuraly Alip',
      'Oday Dabbagh',
      'Pere Milla',
      'Sergio González',
      'Sergio Padt',
      'Shoya Nakajima',
      'Valeri Qazaishvili',
      'Zan Majer'
    ],
    'Libres': [
      'Alisson Becker',
      'Antoine Griezmann',
      'Bernardo Silva',
      'Bruno Fernandes',
      'Bukayo Saka',
      'Cristiano Ronaldo',
      'Ederson',
      'Erling Haaland',
      'Harry Kane',
      'Heung-min Son',
      'Jan Oblak',
      'Joshua Kimmich',
      'Jude Bellingham',
      'Kevin De Bruyne',
      'Khvicha Kvaratskhelia',
      'Kylian Mbappé',
      'Lautaro Martinez',
      'Lionel Messi',
      'Marc-Andre ter Stegen',
      'Martin Ødegaard',
      'Mohamed Salah',
      'Neymar Jr',
      'Phil Foden',
      'Robert Lewandowski',
      'Rodri',
      'Ruben Dias',
      'Thibaut Courtois',
      'Victor Osimhen',
      'Vinicius Junior',
      'Virgil van Dijk'
    ]
  };

  console.log(`📋 Usando ${Object.values(photos).flat().length} fotos de lista estática`);
  return photos;
}

// Función para normalizar nombres (quitar acentos, convertir a minúsculas, etc.)
function normalizeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
    .trim();
}

// Función para encontrar la mejor coincidencia
function findBestMatch(playerName, availablePhotos) {
  const normalizedPlayerName = normalizeName(playerName);

  // Primero buscar coincidencia exacta
  for (const [club, photos] of Object.entries(availablePhotos)) {
    for (const photoName of photos) {
      if (normalizeName(photoName) === normalizedPlayerName) {
        return { club, photoName, confidence: 1.0 };
      }
    }
  }

  // Si no hay coincidencia exacta, buscar coincidencias parciales
  for (const [club, photos] of Object.entries(availablePhotos)) {
    for (const photoName of photos) {
      const normalizedPhotoName = normalizeName(photoName);

      // Si coinciden las primeras palabras (prioridad alta)
      const playerWords = normalizedPlayerName.split(' ');
      const photoWords = normalizedPhotoName.split(' ');

      if (playerWords.length >= 2 && photoWords.length >= 2 &&
          playerWords[0] === photoWords[0] && playerWords[1] === photoWords[1]) {
        return { club, photoName, confidence: 0.9 };
      }

      // Si el nombre del jugador contiene el nombre completo de la foto (mínimo 3 caracteres para evitar falsos positivos)
      if (normalizedPhotoName.length >= 3 &&
          (normalizedPlayerName.includes(normalizedPhotoName) ||
           normalizedPhotoName.includes(normalizedPlayerName))) {
        return { club, photoName, confidence: 0.8 };
      }

      // Para nombres con una sola palabra importante (ej: "Ronaldo" en "Cristiano Ronaldo")
      if (playerWords.length >= 2 && photoWords.length >= 1 &&
          playerWords[1] === photoWords[0] && photoWords[0].length >= 3) {
        return { club, photoName, confidence: 0.7 };
      }
    }
  }

  return null;
}

// Función principal para emparejar fotos
async function matchPlayerPhotos() {
  console.log('🔍 Iniciando emparejamiento de fotos de jugadores...');

  const players = await getAllPlayers();
  const availablePhotos = await getAvailablePhotos();

  console.log('📸 Fotos disponibles:', availablePhotos);

  const matches = [];
  const noMatches = [];

  for (const player of players) {
    const match = findBestMatch(player.name, availablePhotos);

    if (match) {
      // Crear la ruta de la imagen
      let imagePath;
      if (match.club === 'Libres') {
        imagePath = `/Fotos_Jugadores/Libres/${match.photoName}.png`;
      } else {
        imagePath = `/Fotos_Jugadores/${match.club}/${match.photoName}.png`;
      }

      matches.push({
        playerId: player.id,
        playerName: player.name,
        imagePath,
        confidence: match.confidence,
        originalImage: player.image
      });
    } else {
      noMatches.push({
        playerId: player.id,
        playerName: player.name,
        currentImage: player.image
      });
    }
  }

  console.log(`✅ Encontradas ${matches.length} coincidencias`);
  console.log(`❌ ${noMatches.length} jugadores sin foto`);

  console.log('\n📋 Coincidencias encontradas:');
  matches.forEach(match => {
    console.log(`  ${match.playerName} → ${match.imagePath} (${(match.confidence * 100).toFixed(0)}% confianza)`);
  });

  console.log('\n❌ Jugadores sin foto:');
  noMatches.slice(0, 10).forEach(player => {
    console.log(`  ${player.playerName}`);
  });
  if (noMatches.length > 10) {
    console.log(`  ... y ${noMatches.length - 10} más`);
  }

  return { matches, noMatches };
}

// Función para aplicar los cambios (versión corregida)
async function applyPhotoMatches() {
  const { matches } = await matchPlayerPhotos();

  if (matches.length === 0) {
    console.log('No hay coincidencias para aplicar');
    return;
  }

  console.log(`🔄 Aplicando ${matches.length} actualizaciones de fotos...`);

  try {
    // Importar las funciones necesarias del playerService
    const { updatePlayer, listPlayers } = await import('/src/utils/playerService.js');
    let updatedCount = 0;

    for (const match of matches) {
      try {
        // Obtener todos los jugadores actuales para encontrar el correcto
        const allPlayers = await listPlayers();
        const currentPlayer = allPlayers.find(p => p.id === match.playerId);

        if (!currentPlayer) {
          console.log(`Jugador ${match.playerName} no encontrado en la base de datos`);
          continue;
        }

        // Actualizar la imagen
        const updatedPlayer = {
          ...currentPlayer,
          image: match.imagePath
        };

        // Usar el servicio de actualización
        await updatePlayer(updatedPlayer);

        updatedCount++;

        if (updatedCount % 5 === 0) {
          console.log(`  Actualizados ${updatedCount}/${matches.length} jugadores...`);
        }
      } catch (error) {
        console.error(`Error actualizando ${match.playerName}:`, error);
      }
    }

    console.log(`✅ ¡Completado! ${updatedCount} fotos de jugadores actualizadas.`);

    // Refrescar el store si está disponible (para actualizar la UI)
    try {
      const store = window.dataStore || window.store;
      if (store && store.refreshPlayers) {
        await store.refreshPlayers();
      }
    } catch (error) {
      console.log('⚠️ No se pudo refrescar el store, pero los cambios se guardaron en la base de datos');
    }

  } catch (error) {
    console.error('Error aplicando cambios:', error);
  }
}

// Función alternativa que usa el sistema completo del playerService
async function applyPhotoMatchesComplete() {
  console.log('🚀 Usando sistema completo de emparejamiento de fotos...');

  try {
    const { matchAllPlayerPhotos } = await import('/src/utils/playerService.js');
    const result = await matchAllPlayerPhotos();

    console.log(`✅ ¡Completado! ${result.updated} fotos actualizadas de ${result.total} jugadores procesados.`);

    // Refrescar el store si está disponible
    try {
      const store = window.dataStore || window.store;
      if (store && store.refreshPlayers) {
        await store.refreshPlayers();
      }
    } catch (error) {
      console.log('⚠️ No se pudo refrescar el store, pero los cambios se guardaron en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error aplicando cambios:', error);
  }
}

// Función para verificar el estado del sistema
async function checkSystemStatus() {
  console.log('🔍 Verificando estado del sistema...');

  console.log('window.dataStore:', !!window.dataStore);
  console.log('window.store:', !!window.store);

  const store = window.dataStore || window.store;
  if (store) {
    console.log('Store encontrado:', typeof store);
    console.log('Store.players:', Array.isArray(store.players) ? store.players.length : 'no es array');
    console.log('Store.refreshPlayers:', typeof store.refreshPlayers);
    console.log('Store.updatePlayer:', typeof store.updatePlayer);
  }

  // Verificar IndexedDB
  if (typeof window !== 'undefined' && window.indexedDB) {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = window.indexedDB.open('VirtualZoneDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(['players'], 'readonly');
      const objectStore = transaction.objectStore('players');
      const players = await new Promise((resolve, reject) => {
        const request = objectStore.getAll();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
      });

      console.log(`IndexedDB players: ${players.length}`);
      if (players.length > 0) {
        console.log('Primeros 3 players:', players.slice(0, 3).map(p => ({ id: p.id, name: p.name })));
      }
    } catch (e) {
      console.error('Error accediendo a IndexedDB:', e);
    }
  }
}

// Función simplificada para ejecutar todo (versión corregida)
async function updateAllPlayerPhotos() {
  console.log('🚀 Iniciando actualización completa de fotos de jugadores...');

  await checkSystemStatus();
  await matchPlayerPhotos();
  await applyPhotoMatches();

  console.log('🎉 ¡Proceso completado!');
}

// Función alternativa que usa el sistema completo
async function updateAllPlayerPhotosComplete() {
  console.log('🚀 Iniciando actualización completa usando sistema avanzado...');

  try {
    const { checkAllPlayersPhotos, matchAllPlayerPhotos } = await import('/src/utils/playerService.js');
    const batchSize = 100;
    const minConfidence = 0.95;

    console.log('📊 Verificando estado actual...');
    await checkAllPlayersPhotos();

    console.log(`\n🔄 Aplicando emparejamiento completo en lotes de ${batchSize} jugadores (mínimo ${(minConfidence * 100).toFixed(0)}% de confianza)...`);
    const result = await matchAllPlayerPhotos({ batchSize, minConfidence });

    console.log(`\n🎉 ¡Proceso completado! ${result.updated} fotos actualizadas de ${result.total} jugadores con confianza ≥ ${(minConfidence * 100).toFixed(0)}%.`);

    // Refrescar el store
    try {
      const store = window.dataStore || window.store;
      if (store && store.refreshPlayers) {
        await store.refreshPlayers();
      }
    } catch (error) {
      console.log('⚠️ No se pudo refrescar el store, pero los cambios se guardaron');
    }

  } catch (error) {
    console.error('❌ Error en el proceso completo:', error);
  }
}

// Función para emparejar jugadores específicos
async function matchSpecificPlayers(playerNames) {
  console.log(`🔍 Emparejando ${playerNames.length} jugadores específicos...`);

  const players = await getAllPlayers();
  const availablePhotos = await getAvailablePhotos();

  const results = [];

  for (const targetName of playerNames) {
    console.log(`\n🎯 Buscando: ${targetName}`);

    // Buscar al jugador por nombre aproximado
    const player = players.find(p =>
      p.name.toLowerCase().includes(targetName.toLowerCase()) ||
      targetName.toLowerCase().includes(p.name.toLowerCase())
    );

    if (!player) {
      console.log(`❌ Jugador '${targetName}' no encontrado en la base de datos`);
      results.push({ targetName, found: false });
      continue;
    }

    console.log(`✅ Jugador encontrado: ${player.name} (ID: ${player.id})`);

    // Intentar emparejar con fotos disponibles
    const match = findBestMatch(player.name, availablePhotos);

    if (match) {
      // Crear la ruta de la imagen
      let imagePath;
      if (match.club === 'Libres') {
        imagePath = `/Fotos_Jugadores/Libres/${match.photoName}.png`;
      } else {
        imagePath = `/Fotos_Jugadores/${match.club}/${match.photoName}.png`;
      }

      console.log(`✅ Foto encontrada: ${match.photoName} (${(match.confidence * 100).toFixed(0)}% confianza)`);
      console.log(`📸 Ruta: ${imagePath}`);

      results.push({
        targetName,
        found: true,
        player,
        match,
        imagePath
      });
    } else {
      console.log(`❌ No se encontró foto para ${player.name}`);
      results.push({ targetName, found: true, player, match: null });
    }
  }

  console.log(`\n📊 Resumen: ${results.filter(r => r.found).length}/${playerNames.length} jugadores encontrados`);
  return results;
}

// Función para aplicar cambios a jugadores específicos
async function applySpecificMatches(results) {
  console.log(`🔄 Aplicando cambios a ${results.length} jugadores...`);

  let updatedCount = 0;

  try {
    // Importar las funciones necesarias del playerService
    const { updatePlayer, listPlayers } = await import('/src/utils/playerService.js');

    for (const result of results) {
      if (!result.match) continue;

      try {
        // Obtener todos los jugadores actuales para encontrar el correcto
        const allPlayers = await listPlayers();
        const currentPlayer = allPlayers.find(p => p.id === result.player.id);

        if (!currentPlayer) {
          console.log(`Jugador ${result.player.name} no encontrado en la base de datos`);
          continue;
        }

        // Actualizar la imagen
        const updatedPlayer = {
          ...currentPlayer,
          image: result.imagePath
        };

        // Usar el servicio de actualización
        await updatePlayer(updatedPlayer);

        console.log(`✅ Actualizado: ${result.player.name} → ${result.imagePath}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error actualizando ${result.player.name}:`, error);
      }
    }

    console.log(`\n🎉 ¡Completado! ${updatedCount} fotos actualizadas.`);

    // Refrescar el store si está disponible (para actualizar la UI)
    try {
      const store = window.dataStore || window.store;
      if (store && store.refreshPlayers) {
        await store.refreshPlayers();
      }
    } catch (error) {
      console.log('⚠️ No se pudo refrescar el store, pero los cambios se guardaron en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error aplicando cambios:', error);
  }
}

// Función para diagnosticar problemas con jugadores específicos
async function diagnosePlayer(playerName) {
  console.log(`🔍 Diagnosticando jugador: ${playerName}`);

  const players = await getAllPlayers();
  const availablePhotos = await getAvailablePhotos();

  // Buscar al jugador específico
  const player = players.find(p => p.name.toLowerCase().includes(playerName.toLowerCase()));

  if (!player) {
    console.log(`❌ Jugador '${playerName}' no encontrado en la base de datos`);
    return;
  }

  console.log(`✅ Jugador encontrado:`, {
    id: player.id,
    name: player.name,
    clubId: player.clubId,
    currentImage: player.image
  });

  // Verificar si es considerado libre
  const isFreeAgent = player.clubId === 'libre' || player.clubId === 'free' || !player.clubId;
  console.log(`🎯 Es agente libre: ${isFreeAgent}`);

  // Ver qué fotos están disponibles para él
  let relevantPhotos = [];
  let photoPathPrefix = '';

  if (isFreeAgent) {
    relevantPhotos = availablePhotos['Libres'] || [];
    photoPathPrefix = '/Fotos_Jugadores/Libres/';
    console.log(`📁 Buscando en carpeta Libres (${relevantPhotos.length} fotos disponibles)`);
  } else {
    console.log(`📁 Buscando en carpeta de club: ${player.clubId}`);
    // Lógica para clubes específicos...
  }

  console.log(`🖼️ Fotos disponibles:`, relevantPhotos);

  // Probar el emparejamiento
  const match = findBestMatch(player.name, relevantPhotos);
  if (match) {
    console.log(`✅ Encontrada coincidencia: ${match.photoName} (${(match.confidence * 100).toFixed(0)}% confianza)`);
    console.log(`📸 Ruta final: ${photoPathPrefix}${match.photoName}.png`);
  } else {
    console.log(`❌ No se encontró coincidencia para ${player.name}`);
  }
}

// Función conveniente para emparejar Phil Foden y Martin Odegaard
async function matchFodenAndOdegaard() {
  console.log('🎯 Emparejando Phil Foden y Martin Ødegaard con sus fotos...');

  const results = await matchSpecificPlayers(['Phil Foden', 'Martin Ødegaard']);
  await applySpecificMatches(results);

  console.log('🎉 ¡Proceso completado!');
}

// Función conveniente para emparejar Victor Osimhen
async function matchOsimhen() {
  console.log('🎯 Emparejando Victor Osimhen con su foto...');

  const results = await matchSpecificPlayers(['Victor Osimhen']);
  await applySpecificMatches(results);

  console.log('🎉 ¡Proceso completado!');
}

// Función conveniente para emparejar Bruno Fernandes
async function matchBrunoFernandes() {
  console.log('🎯 Emparejando Bruno Fernandes con su foto...');

  const results = await matchSpecificPlayers(['Bruno Fernandes']);
  await applySpecificMatches(results);

  console.log('🎉 ¡Proceso completado!');
}

// Función para liberar jugadores específicos (marcarlos como libres)
async function liberarJugadoresEspecificos(playerNames) {
  console.log(`🆓 Liberando ${playerNames.length} jugadores específicos...`);

  try {
    // Importar las funciones necesarias
    const { updatePlayer, listPlayers } = await import('/src/utils/playerService.js');

    for (const playerName of playerNames) {
      // Buscar el jugador por nombre aproximado
      const allPlayers = await listPlayers();
      const player = allPlayers.find(p =>
        p.name.toLowerCase().includes(playerName.toLowerCase())
      );

      if (!player) {
        console.log(`❌ ${playerName}: No encontrado`);
        continue;
      }

      console.log(`🔄 ${playerName}: clubId actual="${player.clubId}" → clubId nuevo="libre"`);

      // Marcar como libre
      const updatedPlayer = {
        ...player,
        clubId: 'libre'
      };

      await updatePlayer(updatedPlayer);
      console.log(`✅ ${playerName}: Marcado como libre exitosamente`);
    }

    console.log('🎉 ¡Jugadores liberados exitosamente!');

    // Refrescar el store si está disponible
    try {
      const store = window.dataStore || window.store;
      if (store && store.refreshPlayers) {
        await store.refreshPlayers();
      }
    } catch (error) {
      console.log('⚠️ No se pudo refrescar el store, pero los cambios se guardaron');
    }

  } catch (error) {
    console.error('❌ Error liberando jugadores:', error);
  }
}

// Función conveniente para liberar y emparejar los jugadores problemáticos
async function liberarYEmparejarJugadoresProblematicos() {
  console.log('🔧 Solución completa: Liberando y emparejando jugadores problemáticos...');

  const problematicPlayers = ['Phil Foden', 'Martin Ødegaard', 'Victor Osimhen', 'Bruno Fernandes', 'Heung-min Son', 'Joshua Kimmich'];

  // Primero liberar los jugadores
  await liberarJugadoresEspecificos(problematicPlayers);

  // Luego emparejar sus fotos
  console.log('\n📸 Emparejando fotos de los jugadores liberados...');
  const results = await matchSpecificPlayers(problematicPlayers);
  await applySpecificMatches(results);

  console.log('\n🎉 ¡Solución completa aplicada exitosamente!');
}

// Hacer las funciones disponibles globalmente
window.matchPlayerPhotos = matchPlayerPhotos;
window.applyPhotoMatches = applyPhotoMatches;
window.applyPhotoMatchesComplete = applyPhotoMatchesComplete;
window.updateAllPlayerPhotos = updateAllPlayerPhotos;
window.updateAllPlayerPhotosComplete = updateAllPlayerPhotosComplete;
window.checkSystemStatus = checkSystemStatus;
window.diagnosePlayer = diagnosePlayer;
window.matchSpecificPlayers = matchSpecificPlayers;
window.applySpecificMatches = applySpecificMatches;
window.matchFodenAndOdegaard = matchFodenAndOdegaard;
window.matchOsimhen = matchOsimhen;
window.matchBrunoFernandes = matchBrunoFernandes;
window.liberarJugadoresEspecificos = liberarJugadoresEspecificos;
window.liberarYEmparejarJugadoresProblematicos = liberarYEmparejarJugadoresProblematicos;

console.log('🎯 Funciones disponibles:');
console.log('  checkSystemStatus() - Verificar estado del sistema');
console.log('  matchPlayerPhotos() - Buscar coincidencias (solo libres)');
console.log('  applyPhotoMatches() - Aplicar cambios');
console.log('  applyPhotoMatchesComplete() - Aplicar cambios usando sistema completo');
console.log('  updateAllPlayerPhotos() - Hacer todo automáticamente');
console.log('  updateAllPlayerPhotosComplete() - Sistema completo avanzado (lotes de 100, ≥95% confianza)');
console.log('  diagnosePlayer("Kevin De Bruyne") - Diagnosticar problema específico');
console.log('  matchFodenAndOdegaard() - Emparejar Phil Foden y Martin Ødegaard');
console.log('  matchOsimhen() - Emparejar Victor Osimhen');
console.log('  matchBrunoFernandes() - Emparejar Bruno Fernandes');
console.log('  liberarJugadoresEspecificos(["Jugador1", "Jugador2"]) - Marcar jugadores como libres');
console.log('  liberarYEmparejarJugadoresProblematicos() - SOLUCIÓN COMPLETA para los 6 jugadores');
console.log('  matchSpecificPlayers(["Jugador1", "Jugador2"]) - Emparejar jugadores específicos');
