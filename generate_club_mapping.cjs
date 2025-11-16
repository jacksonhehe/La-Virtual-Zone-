// Script para generar el mapeo completo de clubId a nombres
const fs = require('fs');
const path = require('path');

function generateClubMapping() {
  console.log('🔍 Generando mapeo completo de clubs...\n');

  // Leer el archivo mockData.ts
  const mockDataPath = path.join(__dirname, 'src', 'data', 'mockData.ts');
  const content = fs.readFileSync(mockDataPath, 'utf8');

  // Extraer todos los clubs usando regex
  const clubRegex = /{\s*id: '([^']+)',[\s\S]*?name: '([^']+)',/g;
  const clubs = [];
  let match;

  while ((match = clubRegex.exec(content)) !== null) {
    const clubId = match[1];
    const clubName = match[2];
    clubs.push({ id: clubId, name: clubName });
  }

  console.log(`📊 Encontrados ${clubs.length} clubs`);

  // Crear el mapeo
  const mapping = {};
  clubs.forEach(club => {
    mapping[club.id] = club.name;
  });

  // Mostrar el mapeo generado
  console.log('\n🗺️ Mapeo generado:');
  Object.entries(mapping).forEach(([id, name]) => {
    console.log(`  '${id}': '${name}',`);
  });

  // Generar código para actualizar la función getClubNameById
  const mappingCode = Object.entries(mapping)
    .map(([id, name]) => `      '${id}': '${name}',`)
    .join('\n');

  const functionCode = `  const clubNameMap: { [id: string]: string } = {
${mappingCode}
    };

    return clubNameMap[clubId] || null;`;

  console.log('\n📝 Código para actualizar getClubNameById:');
  console.log(functionCode);

  return mapping;
}

generateClubMapping();
