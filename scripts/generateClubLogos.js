const fs = require('fs');
const path = require('path');

// Datos de clubs (extraídos de mockData.ts)
const clubs = [
  { id: 'club1', name: 'Rayo Digital FC', primaryColor: '#ef4444', initials: 'RD' },
  { id: 'club2', name: 'Atl�tico Pixelado', primaryColor: '#3b82f6', initials: 'AP' },
  { id: 'club3', name: 'Defensores del Lag', primaryColor: '#a855f7', initials: 'DL' },
  { id: 'club4', name: 'Ne�n FC', primaryColor: '#ec4899', initials: 'NF' },
  { id: 'club5', name: 'Haxball United', primaryColor: '#f97316', initials: 'HU' },
  { id: 'club6', name: 'Glitchers 404', primaryColor: '#84cc16', initials: 'G4' },
  { id: 'club7', name: 'Cyber Warriors', primaryColor: '#06b6d4', initials: 'CW' },
  { id: 'club8', name: 'Binary Strikers', primaryColor: '#7c3aed', initials: 'BS' },
  { id: 'club9', name: 'Connection FC', primaryColor: '#eab308', initials: 'CF' },
  { id: 'club10', name: 'Firewall FC', primaryColor: '#dc2626', initials: 'FF' },
  { id: 'club11', name: 'Cache City', primaryColor: '#059669', initials: 'CC' },
  { id: 'club12', name: 'Pixel Rangers', primaryColor: '#db2777', initials: 'PR' },
  { id: 'club13', name: 'Data Dragons', primaryColor: '#7c2d12', initials: 'DD' },
  { id: 'club14', name: 'Network United', primaryColor: '#1e40af', initials: 'NU' },
  { id: 'club15', name: 'Byte Borough', primaryColor: '#4d7c0f', initials: 'BB' },
  { id: 'club16', name: 'Stream FC', primaryColor: '#be185d', initials: 'SF' }
];

function createClubLogo(club) {
  const svgContent = `<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="64" fill="${club.primaryColor}"/>
  <circle cx="64" cy="64" r="56" fill="#ffffff"/>
  <circle cx="64" cy="64" r="48" fill="${club.primaryColor}"/>
  <text x="64" y="78" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="24" font-weight="bold">${club.initials}</text>
</svg>`;

  return svgContent;
}

function generateSlug(name) {
  return name.toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

// Crear carpeta si no existe
const clubsDir = path.join(__dirname, '..', 'src', 'assets', 'clubs');
if (!fs.existsSync(clubsDir)) {
  fs.mkdirSync(clubsDir, { recursive: true });
}

// Generar logos para todos los clubs
clubs.forEach(club => {
  const slug = generateSlug(club.name);
  const fileName = `${slug}.svg`;
  const filePath = path.join(clubsDir, fileName);

  const svgContent = createClubLogo(club);
  fs.writeFileSync(filePath, svgContent, 'utf8');

  console.log(`Generated logo for ${club.name}: ${fileName}`);
});

console.log('All club logos generated successfully!');
