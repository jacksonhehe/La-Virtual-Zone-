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

        const transaction = (db as any).transaction(['players'], 'readonly');
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
    let store = window.dataStore || window.store || (window as any).dataStore || (window as any).store;

    if (!store) {
      console.log('DataStore no encontrado globalmente, intentando acceder desde Zustand...');

      // Intentar acceder directamente desde Zustand
      if (typeof window !== 'undefined' && (window as any).useDataStore) {
        try {
          store = (window as any).useDataStore.getState();
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

// Función para aplicar los cambios
async function applyPhotoMatches() {
  const { matches } = await matchPlayerPhotos();

  if (matches.length === 0) {
    console.log('No hay coincidencias para aplicar');
    return;
  }

  console.log(`🔄 Aplicando ${matches.length} actualizaciones de fotos...`);

  try {
    // Intentar importar el servicio de actualización directamente
    const { updatePlayer } = await import('/src/utils/playerService.js');
    let updatedCount = 0;

    for (const match of matches) {
      try {
        // Obtener el jugador actual del store
        const store = window.dataStore || window.store || (window as any).dataStore || (window as any).store;
        const currentPlayer = store?.players?.find(p => p.id === match.playerId);

        if (!currentPlayer) {
          console.log(`Jugador ${match.playerName} no encontrado en el store`);
          continue;
        }

        // Actualizar la imagen
        const updatedPlayer = {
          ...currentPlayer,
          image: match.imagePath
        };

        // Usar el servicio de actualización
        await updatePlayer(updatedPlayer);

        // Actualizar también en el store si está disponible
        if (store && store.updatePlayer) {
          await store.updatePlayer(updatedPlayer);
        }

        updatedCount++;

        if (updatedCount % 5 === 0) {
          console.log(`  Actualizados ${updatedCount}/${matches.length} jugadores...`);
        }
      } catch (error) {
        console.error(`Error actualizando ${match.playerName}:`, error);
      }
    }

    console.log(`✅ ¡Completado! ${updatedCount} fotos de jugadores actualizadas.`);

    // Refrescar los datos si está disponible
    const store = window.dataStore || window.store || (window as any).dataStore || (window as any).store;
    if (store && store.refreshPlayers) {
      await store.refreshPlayers();
    }

  } catch (error) {
    console.error('Error aplicando cambios:', error);
  }
}

// Función para verificar el estado del sistema
async function checkSystemStatus() {
  console.log('🔍 Verificando estado del sistema...');

  console.log('window.dataStore:', !!window.dataStore);
  console.log('window.store:', !!window.store);
  console.log('(window as any).dataStore:', !!(window as any).dataStore);
  console.log('(window as any).store:', !!(window as any).store);

  const store = window.dataStore || window.store || (window as any).dataStore || (window as any).store;
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

      const transaction = (db as any).transaction(['players'], 'readonly');
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

// Función simplificada para ejecutar todo
async function updateAllPlayerPhotos() {
  console.log('🚀 Iniciando actualización completa de fotos de jugadores...');

  await checkSystemStatus();
  await matchPlayerPhotos();
  await applyPhotoMatches();

  console.log('🎉 ¡Proceso completado!');
}

// Hacer las funciones disponibles globalmente
window.matchPlayerPhotos = matchPlayerPhotos;
window.applyPhotoMatches = applyPhotoMatches;
window.updateAllPlayerPhotos = updateAllPlayerPhotos;
window.checkSystemStatus = checkSystemStatus;
window.diagnosePlayer = diagnosePlayer;

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
  const match = findBestMatch(player.name, relevantPhotos.map(p => p.replace('.png', '')));
  if (match) {
    console.log(`✅ Encontrada coincidencia: ${match.photoName} (${(match.confidence * 100).toFixed(0)}% confianza)`);
    console.log(`📸 Ruta final: ${photoPathPrefix}${match.photoName}.png`);
  } else {
    console.log(`❌ No se encontró coincidencia para ${player.name}`);
  }
}

console.log('🎯 Funciones disponibles:');
console.log('  checkSystemStatus() - Verificar estado del sistema');
console.log('  matchPlayerPhotos() - Buscar coincidencias');
console.log('  applyPhotoMatches() - Aplicar cambios');
console.log('  updateAllPlayerPhotos() - Hacer todo automáticamente');
console.log('  diagnosePlayer("Kevin De Bruyne") - Diagnosticar problema específico');
