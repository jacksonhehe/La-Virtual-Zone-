// Script para debuggear por qué no se emparejan Bernardo Silva y Robert Lewandowski
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

async function debugSilvaLewandowski() {
  console.log('🔍 Debug: Bernardo Silva y Robert Lewandowski\n');

  // Leer fotos disponibles
  const photosPath = path.join(__dirname, 'public', 'photos-list.json');
  const photos = JSON.parse(fs.readFileSync(photosPath, 'utf8'));

  console.log('📸 Fotos en Libres:', photos['Libres'].length);
  console.log('   Incluye Bernardo Silva:', photos['Libres'].includes('Bernardo Silva'));
  console.log('   Incluye Robert Lewandowski:', photos['Libres'].includes('Robert Lewandowski'));

  // Verificar archivos físicos
  const libresPath = path.join(__dirname, 'public', 'Fotos_Jugadores', 'Libres');
  const physicalFiles = fs.readdirSync(libresPath);
  console.log('\n📁 Archivos físicos en Libres:', physicalFiles.length);
  console.log('   Bernardo Silva.png existe:', physicalFiles.includes('Bernardo Silva.png'));
  console.log('   Robert Lewandowski.png existe:', physicalFiles.includes('Robert Lewandowski.png'));

  // Probar matching
  console.log('\n🧪 Probando matching:');

  const testPlayers = ['Bernardo Silva', 'Robert Lewandowski'];
  const availablePhotos = physicalFiles; // Usar archivos físicos

  testPlayers.forEach(player => {
    console.log(`\n🎯 Probando: "${player}"`);
    const match = findBestPhotoMatch(player, availablePhotos);

    if (match) {
      console.log(`   ✅ Match encontrado: ${match.photoName} (${(match.confidence * 100).toFixed(0)}% confianza)`);
    } else {
      console.log(`   ❌ No match encontrado`);

      // Debug detallado
      const normalizedPlayer = normalizeName(player);
      console.log(`   🔍 Player normalizado: "${normalizedPlayer}"`);

      // Buscar archivos similares
      const similar = availablePhotos.filter(photo => {
        const normalizedPhoto = normalizeName(photo.replace('.png', ''));
        return normalizedPhoto.includes(normalizedPlayer.split(' ')[0]) ||
               normalizedPlayer.includes(normalizedPhoto.split(' ')[0]);
      });

      if (similar.length > 0) {
        console.log(`   💡 Archivos similares encontrados: ${similar.slice(0, 3).join(', ')}`);
      }

      // Mostrar primeros archivos para comparación
      console.log(`   📋 Primeros archivos físicos: ${availablePhotos.slice(0, 5).join(', ')}`);
    }
  });

  console.log('\n✅ Debug completado');
}

debugSilvaLewandowski().catch(console.error);