export interface PlayerStats {
  // Características ofensivas
  offensive: number;           // 1-99
  ballControl: number;         // 1-99
  dribbling: number;           // 1-99
  lowPass: number;             // 1-99
  loftedPass: number;          // 1-99
  finishing: number;           // 1-99
  placeKicking: number;        // 1-99
  volleys: number;             // 1-99
  curl: number;                // 1-99
  
  // Características físicas
  speed: number;               // 1-99
  acceleration: number;        // 1-99
  kickingPower: number;        // 1-99
  stamina: number;             // 1-99
  jumping: number;             // 1-99
  physicalContact: number;     // 1-99
  balance: number;             // 1-99
  
  // Características defensivas
  defensive: number;           // 1-99
  ballWinning: number;         // 1-99
  aggression: number;          // 1-99
  
  // Características de portero (solo para GK)
  goalkeeperReach: number;     // 1-99
  goalkeeperReflexes: number;  // 1-99
  goalkeeperClearing: number;  // 1-99
  goalkeeperThrowing: number;  // 1-99
  goalkeeperHandling: number;  // 1-99
  
  // Características especiales
  weakFoot: number;            // 1-4
  form: number;                // 1-8
  injuryResistance: number;    // 1-99
  consistency: number;         // 1-99
  adaptability: number;        // 1-99
}

export const DEFAULT_STATS: PlayerStats = {
  // Características ofensivas
  offensive: 70,
  ballControl: 70,
  dribbling: 70,
  lowPass: 70,
  loftedPass: 70,
  finishing: 70,
  placeKicking: 70,
  volleys: 70,
  curl: 70,
  
  // Características físicas
  speed: 70,
  acceleration: 70,
  kickingPower: 70,
  stamina: 70,
  jumping: 70,
  physicalContact: 70,
  balance: 70,
  
  // Características defensivas
  defensive: 70,
  ballWinning: 70,
  aggression: 70,
  
  // Características de portero
  goalkeeperReach: 70,
  goalkeeperReflexes: 70,
  goalkeeperClearing: 70,
  goalkeeperThrowing: 70,
  goalkeeperHandling: 70,
  
  // Características especiales
  weakFoot: 2,
  form: 4,
  injuryResistance: 70,
  consistency: 70,
  adaptability: 70,
};

export const DEFAULT_GK_STATS: PlayerStats = {
  ...DEFAULT_STATS,
  // Porteros tienen stats de portero más altos por defecto
  goalkeeperReach: 80,
  goalkeeperReflexes: 80,
  goalkeeperClearing: 80,
  goalkeeperThrowing: 80,
  goalkeeperHandling: 80,
  // Y stats ofensivos más bajos
  offensive: 40,
  finishing: 40,
  dribbling: 40,
};

export const DEFAULT_FIELD_STATS: PlayerStats = {
  ...DEFAULT_STATS,
  // Jugadores de campo tienen stats de portero más bajos
  goalkeeperReach: 30,
  goalkeeperReflexes: 30,
  goalkeeperClearing: 30,
  goalkeeperThrowing: 30,
  goalkeeperHandling: 30,
};

/**
 * Clampa las estadísticas a los rangos válidos
 */
export function clampStats(stats: Partial<PlayerStats>): PlayerStats {
  const clamped: PlayerStats = { ...DEFAULT_STATS, ...stats };
  
  // Clamp stats normales (1-99)
  const normalStats = [
    'offensive', 'ballControl', 'dribbling', 'lowPass', 'loftedPass',
    'finishing', 'placeKicking', 'volleys', 'curl', 'speed', 'acceleration',
    'kickingPower', 'stamina', 'jumping', 'physicalContact', 'balance',
    'defensive', 'ballWinning', 'aggression', 'goalkeeperReach',
    'goalkeeperReflexes', 'goalkeeperClearing', 'goalkeeperThrowing',
    'goalkeeperHandling', 'injuryResistance', 'consistency', 'adaptability'
  ] as const;
  
  normalStats.forEach(stat => {
    if (clamped[stat] !== undefined) {
      clamped[stat] = Math.max(1, Math.min(99, clamped[stat]));
    }
  });
  
  // Clamp weakFoot (1-4)
  if (clamped.weakFoot !== undefined) {
    clamped.weakFoot = Math.max(1, Math.min(4, clamped.weakFoot));
  }
  
  // Clamp form (1-8)
  if (clamped.form !== undefined) {
    clamped.form = Math.max(1, Math.min(8, clamped.form));
  }
  
  return clamped;
}

/**
 * Obtiene las estadísticas por defecto según la posición
 */
export function getDefaultStatsForPosition(position: string): PlayerStats {
  const upperPosition = position.toUpperCase();
  
  if (upperPosition === 'GK' || upperPosition === 'POR') {
    return { ...DEFAULT_GK_STATS };
  }
  
  return { ...DEFAULT_FIELD_STATS };
}

/**
 * Calcula el overall del jugador basado en sus estadísticas
 */
export function calculateOverall(stats: PlayerStats, position: string): number {
  const upperPosition = position.toUpperCase();
  
  if (upperPosition === 'GK' || upperPosition === 'POR') {
    // Para porteros, priorizar stats de portero
    const gkStats = [
      stats.goalkeeperReach,
      stats.goalkeeperReflexes,
      stats.goalkeeperClearing,
      stats.goalkeeperThrowing,
      stats.goalkeeperHandling
    ];
    return Math.round(gkStats.reduce((sum, stat) => sum + stat, 0) / gkStats.length);
  }
  
  // Para jugadores de campo, priorizar stats relevantes según posición
  let relevantStats: number[] = [];
  
  if (upperPosition === 'ST' || upperPosition === 'CF' || upperPosition === 'DEL') {
    // Delanteros: finishing, speed, acceleration, ballControl
    relevantStats = [stats.finishing, stats.speed, stats.acceleration, stats.ballControl];
  } else if (upperPosition === 'MF' || upperPosition === 'MED') {
    // Mediocampistas: ballControl, passing, stamina, defensive
    relevantStats = [stats.ballControl, stats.lowPass, stats.stamina, stats.defensive];
  } else if (upperPosition === 'DF' || upperPosition === 'DEF') {
    // Defensas: defensive, physicalContact, ballWinning, speed
    relevantStats = [stats.defensive, stats.physicalContact, stats.ballWinning, stats.speed];
  } else {
    // Posición no reconocida, usar stats generales
    relevantStats = [stats.offensive, stats.defensive, stats.speed, stats.stamina];
  }
  
  return Math.round(relevantStats.reduce((sum, stat) => sum + stat, 0) / relevantStats.length);
}
