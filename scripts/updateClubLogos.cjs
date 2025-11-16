const fs = require('fs');
const path = require('path');

// Leer el archivo mockData.ts
const mockDataPath = path.join(__dirname, '..', 'src', 'data', 'mockData.ts');
let content = fs.readFileSync(mockDataPath, 'utf8');

// Reemplazar todas las rutas de logos para que apunten a /clubs/
const updatedContent = content.replace(/\/src\/assets\/clubs\//g, '/clubs/');

// Escribir el archivo actualizado
fs.writeFileSync(mockDataPath, updatedContent, 'utf8');

console.log('Club logos paths updated successfully!');
