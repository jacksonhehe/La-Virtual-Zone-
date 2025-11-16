// Script para emparejar fotos de DT's con los DT's actuales
// COPIAR Y PEGAR EN LA CONSOLA DEL NAVEGADOR

// Función para obtener todos los DT's
async function getAllDTs() {
  try {
    console.log('📋 Obteniendo lista de DT\'s...');
    
    // Intentar cargar desde el archivo JSON
    const response = await fetch('/src/data/dts.json');
    if (response.ok) {
      const dts = await response.json();
      console.log(`✅ Encontrados ${dts.length} DT's`);
      return dts;
    }
    
    console.error('❌ No se pudo cargar el archivo dts.json');
    return [];
  } catch (error) {
    console.error('❌ Error obteniendo DT\'s:', error);
    return [];
  }
}

// Función para obtener el nombre del club por ID
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

// Función para normalizar nombre de club a nombre de archivo
function normalizeClubNameToFileName(clubName) {
  if (!clubName) return null;
  
  return clubName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '') // Remove special characters and spaces
    .trim();
}

// Mapeo manual de nombres de clubes a nombres de archivo en Fotos_DT
function getPhotoFileName(clubName) {
  const mapping = {
    'Alianza Atletico Sullana': 'alianzasullana',
    'Alianza Lima': 'alianzalima',
    'Atlanta': 'atlantafc',
    'Avengers': 'avengersfc',
    'Barcelona SC': 'barcelona',
    'Beast FC': 'beastfc',
    'Club Atletico Ituzaingó': 'clubatleticoituzaingo',
    'Club Atletico Libertadores': 'clubatleticolibertadores',
    'Comando Sur': 'comandosur',
    'Deportes Provincial Osorno': 'deportesprovincialosorno',
    'CADU': 'cadu',
    'El Santo Tucumano': 'santotucumano',
    'Elijo Creer': 'elijocreer',
    'Estudiantes de La Plata': 'estudiantesdelaplata',
    'Furia Verde': 'furiaverde',
    'God Sport': 'godsport',
    'Granate': 'granate',
    'Jackson FC': 'jacksonfc',
    'Kod FC': 'kodefc',
    'La Barraca': 'labarraca',
    'La Cuarta': 'lacuarta',
    'La Cumbre FC': 'lacumbre',
    'La Tobyneta': 'latobyneta',
    'Liga de Quito': 'ligadequito',
    'Liverpool': 'liverpool',
    'Los Guerreros del Rosario': 'losguerrerosderosario',
    'Los Terribles FC': 'losterriblesfc',
    'Los Villeros del Saca': 'losvillerosdesaca',
    'Lunatics FC': 'lunaticsfc',
    'CD Señor del Mar Callao': 'cdsenordelmar',
    'Melgar': 'melgar',
    'Nacional': 'nacional',
    'Peñarol': 'penarol', // Nota: puede que no exista, usar otro
    'Peritas FC': 'peritasfc', // Nota: puede que no exista
    'Pibe de Oro': 'pibedeoro',
    'La Boca del Sapo': 'labocadelsapo',
    'Quilmes': 'quilmes',
    'Real Madrid': 'realmadrid',
    'River Plate': 'riverplate',
    'Riverpool': 'riverpool',
    'Sahur FC': 'tuntunsahur',
    'San Francisco': 'sanfrancisco',
    'San Martin de Tolosa': 'sanmartindetolosa',
    'Señor de los Milagros': 'srdelosmilagros',
    'Sporting Cristal': 'sportingcristal',
    'U de Chile': 'universidaddechile',
    'Union Milagro': 'unionmilagrofc',
    'Universitario de Peru': 'universitariodeperu',
    // Casos especiales
    'Racing Club': 'racing' // Para Yeferson Espinoza
  };
  
  return mapping[clubName] || normalizeClubNameToFileName(clubName);
}

// Función para obtener fotos disponibles en Fotos_DT
async function getAvailableDTPhotos() {
  // Lista de fotos disponibles basada en los archivos encontrados
  const photos = [
    'alianzasullana.png',
    'alianzalima.png',
    'atlantafc.png',
    'avengersfc.png',
    'barcelona.png',
    'beastfc.png',
    'clubatleticoituzaingo.png',
    'clubatleticolibertadores.png',
    'comandosur.png',
    'deportesprovincialosorno.png',
    'cadu.png',
    'santotucumano.png',
    'elijocreer.png',
    'estudiantesdelaplata.png',
    'furiaverde.png',
    'godsport.png',
    'granate.png',
    'jacksonfc.png',
    'kodefc.png',
    'labarraca.png',
    'lacuarta.png',
    'lacumbre.png',
    'latobyneta.png',
    'ligadequito.png',
    'liverpool.png',
    'losguerrerosderosario.png',
    'losterriblesfc.png',
    'losvillerosdesaca.png',
    'lunaticsfc.png',
    'cdsenordelmar.png',
    'melgar.png',
    'nacional.png',
    'pibedeoro.png',
    'labocadelsapo.png',
    'quilmes.png',
    'realmadrid.png',
    'riverplate.jpg',
    'riverpool.png',
    'tuntunsahur.png',
    'sanfrancisco.png',
    'sanmartindetolosa.png',
    'srdelosmilagros.png',
    'sportingcristal.png',
    'universidaddechile.png',
    'unionmilagrofc.png',
    'universitariodeperu.png',
    'racing.png'
  ];
  
  return photos;
}

// Función para encontrar la foto correspondiente a un DT
function findDTPhoto(dt, availablePhotos) {
  const clubName = getClubNameById(dt.clubId);
  if (!clubName) {
    console.log(`⚠️ No se encontró nombre de club para clubId: ${dt.clubId}`);
    return null;
  }
  
  const photoFileName = getPhotoFileName(clubName);
  if (!photoFileName) {
    console.log(`⚠️ No se pudo generar nombre de archivo para: ${clubName}`);
    return null;
  }
  
  // Buscar la foto (puede ser .png o .jpg)
  const photo = availablePhotos.find(p => 
    p.toLowerCase().startsWith(photoFileName.toLowerCase())
  );
  
  if (photo) {
    return `/Fotos_DT/${photo}`;
  }
  
  console.log(`⚠️ No se encontró foto para ${dt.nombre} ${dt.apellido} (${clubName}) - buscando: ${photoFileName}`);
  return null;
}

// Función principal para emparejar fotos
async function matchDTPhotos() {
  console.log('🔍 Iniciando emparejamiento de fotos de DT\'s...');
  
  const dts = await getAllDTs();
  const availablePhotos = await getAvailableDTPhotos();
  
  console.log(`📸 Fotos disponibles: ${availablePhotos.length}`);
  
  const matches = [];
  const noMatches = [];
  
  for (const dt of dts) {
    const photoPath = findDTPhoto(dt, availablePhotos);
    
    if (photoPath) {
      matches.push({
        dtId: dt.id,
        dtName: `${dt.nombre} ${dt.apellido}`,
        currentAvatar: dt.avatar,
        newAvatar: photoPath,
        clubId: dt.clubId
      });
    } else {
      noMatches.push({
        dtId: dt.id,
        dtName: `${dt.nombre} ${dt.apellido}`,
        clubId: dt.clubId,
        currentAvatar: dt.avatar
      });
    }
  }
  
  console.log(`✅ Encontradas ${matches.length} coincidencias`);
  console.log(`❌ ${noMatches.length} DT's sin foto`);
  
  console.log('\n📋 Coincidencias encontradas:');
  matches.forEach(match => {
    console.log(`  ${match.dtName} → ${match.newAvatar}`);
  });
  
  console.log('\n❌ DT\'s sin foto:');
  noMatches.forEach(dt => {
    const clubName = getClubNameById(dt.clubId);
    console.log(`  ${dt.dtName} (${clubName || dt.clubId})`);
  });
  
  return { matches, noMatches };
}

// Función para aplicar los cambios al archivo dts.json
async function applyDTPhotoMatches() {
  const { matches } = await matchDTPhotos();
  
  if (matches.length === 0) {
    console.log('❌ No hay coincidencias para aplicar');
    return;
  }
  
  console.log(`\n🔄 Aplicando ${matches.length} actualizaciones de avatares...`);
  
  try {
    // Cargar el archivo actual
    const response = await fetch('/src/data/dts.json');
    if (!response.ok) {
      console.error('❌ No se pudo cargar dts.json');
      return;
    }
    
    const dts = await response.json();
    
    // Actualizar los avatares
    let updatedCount = 0;
    for (const match of matches) {
      const dt = dts.find(d => d.id === match.dtId);
      if (dt) {
        const oldAvatar = dt.avatar;
        dt.avatar = match.newAvatar.replace('/Fotos_DT/', ''); // Solo el nombre del archivo
        console.log(`✅ ${match.dtName}: ${oldAvatar} → ${dt.avatar}`);
        updatedCount++;
      }
    }
    
    console.log(`\n✅ ¡Completado! ${updatedCount} avatares actualizados.`);
    console.log('\n⚠️ NOTA: Este script solo muestra los cambios. Para aplicarlos:');
    console.log('   1. Copia el objeto JSON actualizado');
    console.log('   2. Pégalo en src/data/dts.json');
    console.log('\n📋 JSON actualizado:');
    console.log(JSON.stringify(dts, null, 2));
    
  } catch (error) {
    console.error('❌ Error aplicando cambios:', error);
  }
}

// Función para mostrar un resumen
async function showDTPhotosSummary() {
  const dts = await getAllDTs();
  const availablePhotos = await getAvailableDTPhotos();
  
  console.log('\n📊 RESUMEN DE FOTOS DE DT\'S:');
  console.log(`Total DT's: ${dts.length}`);
  console.log(`Fotos disponibles: ${availablePhotos.length}`);
  
  const { matches, noMatches } = await matchDTPhotos();
  
  console.log(`\n✅ Con foto: ${matches.length}`);
  console.log(`❌ Sin foto: ${noMatches.length}`);
}

// Hacer las funciones disponibles globalmente
window.getAllDTs = getAllDTs;
window.matchDTPhotos = matchDTPhotos;
window.applyDTPhotoMatches = applyDTPhotoMatches;
window.showDTPhotosSummary = showDTPhotosSummary;

console.log('🎯 Funciones disponibles:');
console.log('  getAllDTs() - Obtener todos los DT\'s');
console.log('  matchDTPhotos() - Buscar coincidencias de fotos');
console.log('  applyDTPhotoMatches() - Aplicar cambios (muestra JSON actualizado)');
console.log('  showDTPhotosSummary() - Mostrar resumen');

