// Script para debuggear por qué no se emparejan las fotos
const fs = require('fs');
const path = require('path');

// Función para normalizar nombres (igual que en el código)
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[áéíóú]/g, match => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'})[match])
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

// Función de matching (igual que en el código)
function findBestPhotoMatch(playerName, availablePhotos) {
  const normalizedPlayerName = normalizeName(playerName);

  // Primero buscar coincidencia exacta
  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));
    if (normalizedPlayerName === normalizedPhotoName) {
      return { photoName, confidence: 1.0 };
    }
  }

  // Si no hay coincidencia exacta, buscar coincidencias parciales
  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));

    // Si el nombre del jugador contiene el nombre de la foto o viceversa
    if (normalizedPlayerName.includes(normalizedPhotoName) ||
        normalizedPhotoName.includes(normalizedPlayerName)) {
      return { photoName, confidence: 0.8 };
    }

    // Si coinciden las primeras palabras
    const playerWords = normalizedPlayerName.split(' ');
    const photoWords = normalizedPhotoName.split(' ');

    if (playerWords.length >= 2 && photoWords.length >= 2 &&
        playerWords[0] === photoWords[0] && playerWords[1] === photoWords[1]) {
      return { photoName, confidence: 0.9 };
    }

    // Para nombres con apóstrofes o caracteres especiales
    if (playerWords.length >= 2 && photoWords.length >= 1 &&
        playerWords[0] === photoWords[0]) {
      return { photoName, confidence: 0.7 };
    }
  }

  return null;
}

async function debugPhotoMatching() {
  console.log('🔍 Debug: Analizando emparejamiento de fotos...\n');

  // Leer fotos disponibles
  const photosPath = path.join(__dirname, 'public', 'photos-list.json');
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));
  console.log('📸 Fotos disponibles:');
  Object.entries(photos).forEach(([club, photoList]) => {
    console.log(`  ${club}: ${photoList.length} fotos`);
  });

  // Simular algunos casos problemáticos
  console.log('\n🧪 Probando matching de nombres:');

  const testCases = [
    { player: 'Jude Bellingham', expectedClub: 'Libres' },
    { player: 'Cristiano Ronaldo', expectedClub: 'Libres' },
    { player: 'Akim Zedadka', expectedClub: 'Jackson FC' },
    { player: 'Mohamed Salah', expectedClub: 'Libres' },
    { player: 'Virgil van Dijk', expectedClub: 'Libres' }
  ];

  testCases.forEach(({ player, expectedClub }) => {
    const relevantPhotos = photos[expectedClub] || [];
    const match = findBestPhotoMatch(player, relevantPhotos);

    console.log(`🎯 ${player} (${expectedClub}):`);
    console.log(`   📸 Fotos disponibles: ${relevantPhotos.length}`);
    if (match) {
      console.log(`   ✅ Match encontrado: ${match.photoName} (${(match.confidence * 100).toFixed(0)}% confianza)`);
    } else {
      console.log(`   ❌ No match encontrado`);
      // Mostrar fotos similares
      const similar = relevantPhotos.filter(photo => {
        const normalizedPlayer = normalizeName(player);
        const normalizedPhoto = normalizeName(photo);
        return normalizedPlayer.includes(normalizedPhoto.split(' ')[0]) ||
               normalizedPhoto.includes(normalizedPlayer.split(' ')[0]);
      });
      if (similar.length > 0) {
        console.log(`   💡 Fotos similares: ${similar.join(', ')}`);
      }
    }
    console.log('');
  });

  // Analizar qué jugadores podrían tener problemas
  console.log('🔍 Jugadores que podrían tener problemas de matching:');
  console.log('   - Jugadores con nombres muy largos');
  console.log('   - Jugadores con caracteres especiales');
  console.log('   - Jugadores con clubId incorrecto');
  console.log('   - Jugadores sin clubId asignado');

  console.log('\n✅ Debug completado');
}

debugPhotoMatching().catch(console.error);
