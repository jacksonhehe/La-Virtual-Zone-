// Script para debuggear el emparejamiento de fotos
const fs = require('fs');

console.log('🔍 Debug: Emparejamiento de fotos de Jude Bellingham y Mohamed Salah');

// Leer el archivo photos-list.json
try {
  const photosData = JSON.parse(fs.readFileSync('public/photos-list.json', 'utf8'));
  console.log('📸 Fotos disponibles en JSON:', photosData['Libres']);

  // Verificar si existe Jude Bellingham
  const judeExists = photosData['Libres'].includes('Jude Bellingham');
  console.log('✅ Jude Bellingham en JSON:', judeExists);

  // Verificar si existe Mohamed Salah
  const salahExists = photosData['Libres'].includes('Mohamed Salah');
  console.log('❌ Mohamed Salah en JSON:', salahExists);

} catch (error) {
  console.error('❌ Error leyendo photos-list.json:', error.message);
}

// Verificar archivos físicos
const fsLibre = fs.readdirSync('Fotos_jugadores/Libres');
console.log('📁 Archivos físicos en Libres:', fsLibre);

const judeFile = fsLibre.find(f => f.toLowerCase().includes('jude'));
const salahFile = fsLibre.find(f => f.toLowerCase().includes('salah'));

console.log('📸 Archivo físico de Jude:', judeFile || 'NO ENCONTRADO');
console.log('📸 Archivo físico de Salah:', salahFile || 'NO ENCONTRADO');

// Simular el proceso de matching
function normalizeName(name) {
  return name.toLowerCase()
    .replace(/[áéíóú]/g, match => ({'á':'a','é':'e','í':'i','ó':'o','ú':'u'})[match])
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

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
  }

  return null;
}

// Probar matching para Jude
const judeMatch = findBestPhotoMatch('Jude Bellingham', fsLibre);
console.log('🎯 Match para Jude Bellingham:', judeMatch);

const salahMatch = findBestPhotoMatch('Mohamed Salah', fsLibre);
console.log('🎯 Match para Mohamed Salah:', salahMatch);

console.log('✅ Debug completado');
