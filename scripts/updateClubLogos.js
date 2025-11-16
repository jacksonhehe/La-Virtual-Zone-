const fs = require('fs');
const path = require('path');

// Función para generar slug de nombre de club
function generateClubSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Leer el archivo mockData.ts
const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Función para actualizar los logos de todos los clubs
function updateClubLogos(content) {
  // Regex para encontrar todas las definiciones de clubs con sus logos
  const clubRegex = /{\s*id:\s*'club\d+',\s*name:\s*'([^']+)',\s*logo:\s*'[^']+',/g;

  return content.replace(clubRegex, (match, clubName) => {
    const slug = generateClubSlug(clubName);
    const logoPath = `/src/assets/clubs/${slug}.svg`;
    return match.replace(/logo:\s*'[^']+'/, `logo: '${logoPath}'`);
  });
}

// Actualizar el contenido
const updatedContent = updateClubLogos(content);

// Escribir el archivo actualizado
fs.writeFileSync(mockDataPath, updatedContent, 'utf8');

console.log('Club logos updated successfully!');
