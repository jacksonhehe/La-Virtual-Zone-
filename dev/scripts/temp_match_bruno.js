// Script temporal para emparejar Bruno Fernandes
const fs = require('fs');

// Leer el script principal
const scriptContent = fs.readFileSync('update_player_images_browser.js', 'utf8');

// Simular entorno del navegador
global.window = {
  indexedDB: null,
  dataStore: null,
  store: null
};

global.console = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args)
};

// Ejecutar el script
eval(scriptContent);

// Función para simular fetch (fallback a lista estática)
global.fetch = async (url) => {
  return {
    ok: false,
    json: async () => ({})
  };
};

// Ejecutar el emparejamiento para Bruno Fernandes
async function runMatching() {
  try {
    console.log('🔍 Buscando coincidencia para Bruno Fernandes...');
    const results = await matchSpecificPlayers(['Bruno Fernandes']);

    console.log('\n📊 Resultados:');
    results.forEach(result => {
      if (result.found) {
        if (result.match) {
          console.log(`✅ ${result.player.name} → ${result.imagePath} (${(result.match.confidence * 100).toFixed(0)}% confianza)`);
        } else {
          console.log(`❌ No se encontró foto para ${result.player.name}`);
        }
      } else {
        console.log(`❌ Jugador '${result.targetName}' no encontrado`);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

runMatching();
