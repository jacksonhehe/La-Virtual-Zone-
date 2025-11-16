// Script para leer fotos de las carpetas y actualizar automáticamente
// Ejecutar con: node scripts/read_photos.js

const fs = require('fs');
const path = require('path');

function readPhotosFromDirectory() {
  const publicDir = path.join(__dirname, '..', 'public', 'Fotos_Jugadores');
  const photos = {};

  try {
    console.log('🔍 Escaneando carpetas de fotos...');

    // Verificar que existe el directorio
    if (!fs.existsSync(publicDir)) {
      throw new Error(`Directorio no encontrado: ${publicDir}`);
    }

    // Leer carpetas de clubes
    const clubDirs = fs.readdirSync(publicDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📁 Encontrados ${clubDirs.length} clubes: ${clubDirs.join(', ')}`);

    for (const clubDir of clubDirs) {
      const clubPath = path.join(publicDir, clubDir);

      if (!fs.existsSync(clubPath)) {
        console.warn(`⚠️ Carpeta no encontrada: ${clubPath}`);
        continue;
      }

      const photoFiles = fs.readdirSync(clubPath)
        .filter(file => file.endsWith('.png'))
        .map(file => file.replace('.png', ''));

      photos[clubDir] = photoFiles;
      console.log(`📸 ${clubDir}: ${photoFiles.length} fotos`);
    }

    const totalPhotos = Object.values(photos).flat().length;
    console.log(`✅ Total de fotos encontradas: ${totalPhotos}`);

    return photos;
  } catch (error) {
    console.error('❌ Error leyendo fotos:', error);
    return null;
  }
}

function updateScriptFiles(photos) {
  const scriptPaths = [
    'update_player_images.js',
    'update_player_images_browser.js'
  ];

  scriptPaths.forEach(scriptPath => {
    const fullPath = path.join(__dirname, '..', scriptPath);

    try {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Generar el nuevo array de fotos
      const photosArray = Object.entries(photos).map(([club, photoList]) => {
        const photosStr = photoList.map(name => `      '${name}'`).join(',\n');
        return `    '${club}': [
${photosStr}
    ]`;
      }).join(',\n');

      const newPhotosObject = `  const photos = {\n${photosArray}\n  };`;

      // Reemplazar el objeto photos en el archivo
      const photosRegex = /  const photos = \{[\s\S]*?\n  };/;
      content = content.replace(photosRegex, newPhotosObject);

      fs.writeFileSync(fullPath, content);
      console.log(`✅ Actualizado: ${scriptPath}`);

    } catch (error) {
      console.error(`Error actualizando ${scriptPath}:`, error);
    }
  });

  // También actualizar el archivo JSON público
  try {
    const jsonPath = path.join(__dirname, '..', 'public', 'photos-list.json');
    fs.writeFileSync(jsonPath, JSON.stringify(photos, null, 2));
    console.log('✅ Actualizado: public/photos-list.json');
  } catch (error) {
    console.error('Error actualizando photos-list.json:', error);
  }
}

function main() {
  console.log('🚀 Actualizando sistema de fotos automáticamente...\n');

  const photos = readPhotosFromDirectory();
  if (!photos) {
    console.error('❌ No se pudieron leer las fotos');
    process.exit(1);
  }

  console.log('\n🔄 Actualizando archivos...');
  updateScriptFiles(photos);

  console.log('\n🎉 ¡Sistema actualizado exitosamente!');
  console.log(`📊 Resumen: ${Object.keys(photos).length} clubes, ${Object.values(photos).flat().length} fotos totales`);
  console.log('\n💡 El botón "Actualizar Lista de Fotos" en el Panel Admin ahora funcionará automáticamente.');
}

if (require.main === module) {
  main();
}

module.exports = { readPhotosFromDirectory, updateScriptFiles };
