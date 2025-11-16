// Script para analizar los clubId de los jugadores
const fs = require('fs');
const path = require('path');

function analyzePlayers() {
  console.log('🔍 Debug: Analizando clubId de jugadores...\n');

  // Leer fotos disponibles
  const photosPath = path.join(__dirname, 'public', 'photos-list.json');
  const availableClubs = Object.keys(JSON.parse(fs.readFileSync(photosPath, 'utf8')));
  console.log('📁 Clubs disponibles:', availableClubs);

  // Simular datos de jugadores (basado en lo que sabemos)
  console.log('\n👥 Análisis de clubId:');

  // Posibles problemas:
  console.log('🔍 Posibles causas del problema:');
  console.log('1. Los jugadores importados tienen clubId diferentes a los nombres de carpeta');
  console.log('2. Los jugadores están marcados como "libre" pero no tienen clubId = "libre"');
  console.log('3. Los clubId son IDs numéricos pero las fotos están organizadas por nombre');

  console.log('\n💡 Soluciones posibles:');
  console.log('- Revisar que los clubId de los jugadores coincidan con los nombres de carpeta');
  console.log('- Para jugadores libres: clubId debe ser exactamente "libre"');
  console.log('- Para otros clubs: clubId debe coincidir con el nombre de la carpeta');

  console.log('\n📋 ClubId esperados:');
  availableClubs.forEach(club => {
    console.log(`   "${club}" -> Carpeta: public/Fotos_Jugadores/${club}/`);
  });

  console.log('\n🎯 Para verificar en el navegador:');
  console.log('   - Abre Panel Admin -> Jugadores');
  console.log('   - Filtra por "Libre" para ver cuántos jugadores libres hay');
  console.log('   - Revisa la consola del navegador durante "Emparejar Todas las Fotos"');

  console.log('\n✅ Análisis completado');
}

analyzePlayers();
