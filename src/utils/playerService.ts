import { Player } from '../types/shared';
import { VZ_PLAYERS_KEY } from './storageKeys';
import { players as defaultPlayers } from '../data/mockData';

function randStat() {
  return 60 + Math.floor(Math.random() * 40); // 60-99
}

function generateDetailedStats(position: string): any {
  return {
    offensive: randStat(),
    ballControl: randStat(),
    dribbling: randStat(),
    lowPass: randStat(),
    loftedPass: randStat(),
    finishing: randStat(),
    placeKicking: randStat(),
    volleys: randStat(),
    curl: randStat(),
    speed: randStat(),
    acceleration: randStat(),
    kickingPower: randStat(),
    stamina: randStat(),
    jumping: randStat(),
    physicalContact: randStat(),
    balance: randStat(),
    defensive: randStat(),
    ballWinning: randStat(),
    aggression: randStat(),
    goalkeeperReach: randStat(),
    goalkeeperReflexes: randStat(),
    goalkeeperClearing: randStat(),
    goalkeeperThrowing: randStat(),
    goalkeeperHandling: randStat()
  };
}

// Función para migrar jugadores de la estructura antigua a la nueva
function migratePlayerToNewStructure(player: any): Player {
  // Si ya tiene la nueva estructura, devolverlo tal como está
  if (player.nombre_jugador && player.apellido_jugador) {
    return player;
  }

  // Extraer nombre y apellido del campo name
  const nameParts = (player.name || 'Sin nombre').split(' ');
  const nombre_jugador = nameParts[0] || 'Sin';
  const apellido_jugador = nameParts.slice(1).join(' ') || 'Nombre';

  // Generar estadísticas detalladas si no existen
  const detailedStats = player.detailedStats || generateDetailedStats(player.position);

  return {
    id: player.id,
    nombre_jugador,
    apellido_jugador,
    edad: player.age || 25,
    altura: player.height || 175,
    peso: player.weight || 70,
    pierna: player.dominantFoot || 'right',
          estilo_juego: player.playingStyle || 'Equilibrado',
    posicion: player.position || 'CF',
    valoracion: player.overall || 75,
    precio_compra_libre: player.price || player.transferValue || 1000000,
    nacionalidad: player.nationality || 'España',
    id_equipo: player.clubId || '',
    foto_jugador: player.image || '',
    is_free: player.transferListed || false,
    
    // Características ofensivas
    actitud_ofensiva: detailedStats.offensive || 70,
    control_balon: detailedStats.ballControl || 70,
    drible: detailedStats.dribbling || 70,
    posesion_balon: (detailedStats.offensive + detailedStats.ballControl + detailedStats.dribbling) / 3,
    pase_raso: detailedStats.lowPass || 70,
    pase_bombeado: detailedStats.loftedPass || 70,
    finalizacion: detailedStats.finishing || 70,
    cabeceador: detailedStats.finishing || 70,
    balon_parado: detailedStats.placeKicking || 70,
    efecto: detailedStats.volleys || 70,
    
    // Características físicas
    velocidad: detailedStats.speed || 70,
    aceleracion: detailedStats.acceleration || 70,
    potencia_tiro: detailedStats.kickingPower || 70,
    salto: detailedStats.jumping || 70,
    contacto_fisico: detailedStats.physicalContact || 70,
    equilibrio: detailedStats.balance || 70,
    resistencia: detailedStats.stamina || 70,
    
    // Características defensivas
    actitud_defensiva: detailedStats.defensive || 70,
    recuperacion_balon: detailedStats.ballWinning || 70,
    agresividad: detailedStats.aggression || 70,
    
    // Características de portero
    actitud_portero: detailedStats.goalkeeperHandling || 70,
    atajar_pt: detailedStats.goalkeeperThrowing || 70,
    despejar_pt: detailedStats.goalkeeperClearing || 70,
    reflejos_pt: detailedStats.goalkeeperReflexes || 70,
    cobertura_pt: detailedStats.goalkeeperReach || 70,
    
    // Características adicionales
    uso_pie_malo: 3,
    precision_pie_malo: 3,
    estabilidad: player.consistency || 70,
    resistencia_lesiones: player.injuryResistance || 70,
    
    // Campos legacy para compatibilidad
    name: player.name,
    age: player.age,
    position: player.position,
    nationality: player.nationality,
    dorsal: player.dorsal,
    clubId: player.clubId,
    overall: player.overall,
    potential: player.potential,
    transferListed: player.transferListed,
    matches: player.matches,
    transferValue: player.transferValue,
    value: player.value,
    image: player.image,
    attributes: player.attributes,
    contract: player.contract,
    form: player.form,
    goals: player.goals,
    assists: player.assists,
    appearances: player.appearances,
    marketValue: player.marketValue,
    price: player.price,
    height: player.height,
    weight: player.weight,
    dominantFoot: player.dominantFoot,
    secondaryPositions: player.secondaryPositions,
    specialSkills: player.specialSkills,
    playingStyle: player.playingStyle,
    celebrations: player.celebrations,
    consistency: player.consistency,
    injuryResistance: player.injuryResistance,
    morale: player.morale,
    detailedStats
  };
}

export const getPlayers = (): Player[] => {
  const json = localStorage.getItem(VZ_PLAYERS_KEY);
  let list: Player[];
  if (json) {
    try {
      const oldPlayers = JSON.parse(json);
      // Migrar jugadores a la nueva estructura
      list = oldPlayers.map(migratePlayerToNewStructure);
    } catch {
      list = defaultPlayers.map(migratePlayerToNewStructure);
    }
  } else {
    list = defaultPlayers.map(migratePlayerToNewStructure);
  }

  // Asegurar detailedStats
  list = list.map(p => {
    if (!p.detailedStats) {
      return { ...p, detailedStats: generateDetailedStats(p.position) };
    }
    return p;
  });

  return list;
};

export const savePlayers = (data: Player[]): void => {
  localStorage.setItem(VZ_PLAYERS_KEY, JSON.stringify(data));
};

// Función para limpiar y regenerar datos de jugadores
export const resetPlayersData = (): void => {
  localStorage.removeItem(VZ_PLAYERS_KEY);
  // Forzar recarga de datos
  window.location.reload();
};
