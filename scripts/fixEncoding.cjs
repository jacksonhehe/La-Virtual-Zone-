const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'src');

const patterns = [
  ['â€¢', '•'],
  ['â‚¬', '€'],
  ['Â¡', '¡'],
  ['Â¿', '¿'],
  ['Ã¡', 'á'],
  ['Ã©', 'é'],
  ['Ã­', 'í'],
  ['Ã³', 'ó'],
  ['Ãº', 'ú'],
  ['Ã±', 'ñ'],
  ['Ã�', 'Á'],
  ['Ã‰', 'É'],
  ['Ã�', 'Í'],
  ['Ã“', 'Ó'],
  ['Ãš', 'Ú'],
  ['Ã‘', 'Ñ'],
  ['PoSesi�n', 'Posesión'],
  ['Formaci�n', 'Formación'],
  ['cua�os', 'cuartos'],
  ['cuaños', 'cuartos'],
  ['a�os', 'años'],
  ['T�cnico', 'Técnico'],
  ['Pr�ximo', 'Próximo'],
  ['d�as', 'días'],
  ['usua�os', 'usuarios'],
  ['usuaños', 'usuarios'],
  ['Usuaños', 'Usuarios'],
  ['P�blico', 'Público'],
  ['p�blico', 'público'],
  ['Informaci�n', 'Información'],
  ['L�pez', 'López'],
  ['Sa�os', 'Saños'],
  ['Atl�tico', 'Atlético'],
  ['fich�', 'fichó']
];

function fixText(s) {
  let out = s;
  for (const [a, b] of patterns) {
    out = out.split(a).join(b);
  }
  // Replace bell chars or stray control chars used as separators with bullet
  out = out.replace(/\u0007/g, '•');
  // Fix malformed euro sequence
  out = out.replace(/�'�/g, '€');
  return out;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(p);
    } else if (/\.(ts|tsx|js|jsx|html|css)$/i.test(e.name)) {
      const s = fs.readFileSync(p, 'utf8');
      const t = fixText(s);
      if (t !== s) {
        fs.writeFileSync(p, t, 'utf8');
        console.log('fixed', p);
      }
    }
  }
}

walk(root);

