// Script para simular el proceso completo de emparejamiento y ver por qué falla
const fs = require('fs');
const path = require('path');

// Función para normalizar nombres
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[áéíóú]/g, match => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'})[match])
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Función de matching
function findBestPhotoMatch(playerName, availablePhotos) {
  const normalizedPlayerName = normalizeName(playerName);

  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));
    if (normalizedPlayerName === normalizedPhotoName) {
      return { photoName, confidence: 1.0 };
    }
  }

  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));

    if (normalizedPlayerName.includes(normalizedPhotoName) ||
        normalizedPhotoName.includes(normalizedPlayerName)) {
      return { photoName, confidence: 0.8 };
    }

    const playerWords = normalizedPlayerName.split(' ');
    const photoWords = normalizedPhotoName.split(' ');

    if (playerWords.length >= 2 && photoWords.length >= 2 &&
        playerWords[0] === photoWords[0] && playerWords[1] === photoWords[1]) {
      return { photoName, confidence: 0.9 };
    }

    if (playerWords.length >= 2 && photoWords.length >= 1 &&
        playerWords[0] === photoWords[0]) {
      return { photoName, confidence: 0.7 };
    }
  }

  return null;
}

// Función para obtener el nombre del club por ID (igual que en el código)
function getClubNameById(clubId) {
  const clubNameMap = {
    'club1': 'Alianza Atletico Sullana',
    'club2': 'Alianza Lima',
    'club3': 'Atlanta',
    'club4': 'Avengers',
    'club5': 'Barcelona SC',
    'club6': 'Beast FC',
    'club7': 'Club Atletico Ituzaingó',
    'club8': 'Club Atletico Libertadores',
    'club9': 'Comando Sur',
    'club10': 'Deportes Provincial Osorno',
    'club11': 'CADU',
    'club12': 'El Santo Tucumano',
    'club13': 'Elijo Creer',
    'club14': 'Estudiantes de La Plata',
    'club15': 'Furia Verde',
    'club16': 'God Sport',
    'club17': 'Granate',
    'club18': 'Jackson FC',
    'club19': 'Kod FC',
    'club20': 'La Barraca',
    'club21': 'La Cuarta',
    'club22': 'La Cumbre FC',
    'club23': 'La Tobyneta',
    'club24': 'Liga de Quito',
    'club25': 'Liverpool',
    'club26': 'Los Guerreros del Rosario',
    'club27': 'Los Terribles FC',
    'club28': 'Los Villeros del Saca',
    'club29': 'Lunatics FC',
    'club30': 'CD Señor del Mar Callao',
    'club31': 'Melgar',
    'club32': 'Nacional',
    'club33': 'Peñarol',
    'club34': 'Peritas FC',
    'club35': 'Pibe de Oro',
    'club36': 'La Boca del Sapo',
    'club37': 'Quilmes',
    'club38': 'Real Madrid',
    'club39': 'River Plate',
    'club40': 'Riverpool',
    'club41': 'Sahur FC',
    'club42': 'San Francisco',
    'club43': 'San Martin de Tolosa',
    'club44': 'Señor de los Milagros',
    'club45': 'Sporting Cristal',
    'club46': 'U de Chile',
    'club47': 'Union Milagro',
    'club48': 'Universitario de Peru'
  };

  return clubNameMap[clubId] || null;
}

// Función getAvailablePhotos (simplificada)
function getAvailablePhotos() {
  const photosPath = path.join(__dirname, 'public', 'photos-list.json');
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

  // Convertir nombres a nombres de archivo
  const result = {};
  Object.keys(photos).forEach(club => {
    result[club] = photos[club].map(name => `${name}.png`);
  });

  return result;
}

function simulatePhotoMatching() {
  console.log('🎯 Simulando proceso completo de emparejamiento de fotos...\n');

  // Simular algunos jugadores que podrían existir
  const simulatedPlayers = [
    { id: 'bernardo-silva', name: 'Bernardo Silva', clubId: 'libre' },
    { id: 'robert-lewandowski', name: 'Robert Lewandowski', clubId: 'libre' },
    { id: 'jude-bellingham', name: 'Jude Bellingham', clubId: 'libre' },
    { id: 'mohamed-salah', name: 'Mohamed Salah', clubId: 'libre' },
    { id: 'player-club1', name: 'Test Player', clubId: 'club1' },
    { id: 'player-club18', name: 'Jackson Player', clubId: 'club18' },
    { id: 'player-invalid', name: 'Invalid Player', clubId: 'club999' }
  ];

  const availablePhotos = getAvailablePhotos();
  console.log('📸 Clubs disponibles:', Object.keys(availablePhotos));
  console.log('📊 Fotos totales:', Object.values(availablePhotos).flat().length);

  let updatedCount = 0;
  let totalProcessed = 0;

  // Procesar cada jugador simulado
  for (const player of simulatedPlayers) {
    totalProcessed++;
    console.log(`\n👤 Procesando: ${player.name} (clubId: ${player.clubId})`);

    // Determinar qué fotos buscar basado en el club del jugador
    let relevantPhotos = [];
    let photoPathPrefix = '';

    if (player.clubId === 'libre' || player.clubId === 'free' || !player.clubId) {
      console.log('   🏠 Es jugador libre - buscando en carpeta Libres');
      relevantPhotos = availablePhotos['Libres'] || [];
      photoPathPrefix = '/Fotos_Jugadores/Libres/';
    } else {
      console.log('   🏟️ Es jugador de club - buscando club específico');
      // Primero intentar encontrar el club por ID exacto
      if (availablePhotos[player.clubId]) {
        console.log(`   ✅ Club encontrado por ID exacto: ${player.clubId}`);
        relevantPhotos = availablePhotos[player.clubId];
        photoPathPrefix = `/Fotos_Jugadores/${player.clubId}/`;
      } else {
        // Si no se encuentra por ID, obtener el nombre del club usando el mapeo
        const clubName = getClubNameById(player.clubId);
        if (clubName && availablePhotos[clubName]) {
          console.log(`   ✅ Club encontrado por mapeo: ${player.clubId} -> ${clubName}`);
          relevantPhotos = availablePhotos[clubName];
          photoPathPrefix = `/Fotos_Jugadores/${clubName}/`;
        } else {
          console.log(`   ❌ Club no encontrado: ${player.clubId} (mapeo: ${clubName})`);
        }
      }
    }

    console.log(`   📸 Fotos relevantes encontradas: ${relevantPhotos.length}`);

    if (relevantPhotos.length === 0) {
      console.log('   ⏭️ Sin fotos disponibles para este club, saltando...');
      continue;
    }

    // Buscar la mejor coincidencia
    const match = findBestPhotoMatch(player.name, relevantPhotos);

    if (match) {
      const newImagePath = `${photoPathPrefix}${match.photoName}`;
      console.log(`   ✅ Match encontrado: ${match.photoName} -> ${newImagePath} (${(match.confidence * 100).toFixed(0)}% confianza)`);
      updatedCount++;
    } else {
      console.log('   ❌ No se encontró match para este jugador');
    }
  }

  console.log(`\n📊 Resultado final:`);
  console.log(`   👥 Jugadores procesados: ${totalProcessed}`);
  console.log(`   ✅ Fotos actualizadas: ${updatedCount}`);
  console.log(`   ❌ Sin emparejamiento: ${totalProcessed - updatedCount}`);

  console.log('\n💡 Posibles causas del problema real:');
  console.log('   1. Los jugadores reales no tienen clubId = "libre"');
  console.log('   2. Los nombres en la BD no coinciden exactamente');
  console.log('   3. Los jugadores no existen en la base de datos');
  console.log('   4. Error en la lógica de detección de clubId');

  console.log('\n✅ Simulación completada');
}

simulatePhotoMatching();
