import { Player, PlayerAttributes, PlayerSkills, PlayingStyles } from '../types';
import { players as seedPlayers } from '../data/mockData';
import { calculateSalaryByRating } from './marketRules';
import { dbService } from './indexedDBService';

const PLAYERS_STORE = 'players';
const INIT_KEY = 'virtual_zone_players_initialized';

// Initialize IndexedDB only once - preserve existing valid data
export const initializePlayers = async (): Promise<void> => {
  // Check if already initialized
  const alreadyInitialized = localStorage.getItem(INIT_KEY);
  if (alreadyInitialized === 'true') {
    console.log('PlayerService: Already initialized, skipping');
    return;
  }

  console.log('PlayerService: Initializing IndexedDB');
  try {
    const existingPlayers = await dbService.getAll<Player>(PLAYERS_STORE);

    if (existingPlayers.length === 0) {
      console.log('PlayerService: Initializing IndexedDB with seed players');
      await dbService.putMany(PLAYERS_STORE, seedPlayers);
    } else {
      console.log('PlayerService: Found', existingPlayers.length, 'existing players in IndexedDB');

      // Check if positions are valid (have the new position system)
      const validPositions = ['PT', 'DEC', 'LI', 'LD', 'MCD', 'MC', 'MO', 'MDI', 'MDD', 'EXI', 'EXD', 'CD', 'SD'];
      const hasInvalidPositions = existingPlayers.some((player: Player) =>
        !validPositions.includes(player.position)
      );

      if (hasInvalidPositions) {
        console.log('PlayerService: Detected invalid positions, regenerating players with correct positions');
        await dbService.clear(PLAYERS_STORE);
        await dbService.putMany(PLAYERS_STORE, seedPlayers);
      }
      // If positions are valid, preserve existing data (don't update transferListed on every load)
      else {
        console.log('PlayerService: Existing players are valid, preserving IndexedDB data');
        // Don't modify existing data, just mark as initialized
      }
    }

    localStorage.setItem(INIT_KEY, 'true');
  } catch (error) {
    console.error('PlayerService: Error initializing IndexedDB:', error);
    // If there's an error, try to recover by reinitializing
    try {
      await dbService.clear(PLAYERS_STORE);
      await dbService.putMany(PLAYERS_STORE, seedPlayers);
      localStorage.setItem(INIT_KEY, 'true');
    } catch (fallbackError) {
      console.error('PlayerService: Error in fallback initialization:', fallbackError);
    }
  }
};

// Note: A public variant `export const fetchPlayersFromSupabase` exists later.
// This early helper was removed to avoid duplicate declaration.

const getPlayers = async (): Promise<Player[]> => {
  try {
    const players = await dbService.getAll<Player>(PLAYERS_STORE);
    console.log('PlayerService: Successfully retrieved', players.length, 'players from IndexedDB');
    return players;
  } catch (error) {
    console.error('PlayerService: Error getting players from IndexedDB:', error);
    return [];
  }
};

const savePlayers = async (players: Player[]): Promise<void> => {
  try {
    console.log('PlayerService: Saving', players.length, 'players to IndexedDB');
    await dbService.clear(PLAYERS_STORE);
    await dbService.putMany(PLAYERS_STORE, players);
    console.log('PlayerService: Successfully saved players to IndexedDB');
  } catch (error) {
    console.error('PlayerService: Error saving players to IndexedDB:', error);
    throw error;
  }
};

// Function to fix club assignments for players that lost them
export const fixClubAssignments = async (clubs: any[]): Promise<{ fixed: number, total: number }> => {
  console.log('🔧 Intentando reparar asignaciones de club...');

  try {
    const players = await getPlayers();
    let fixedCount = 0;

    // Players that need fixing (no clubId but have original club data)
    const playersNeedingFix = players.filter(p => !p.clubId && (p.originalClubId || p.originalClubName));

    if (playersNeedingFix.length === 0) {
      console.log('✅ No hay jugadores sin club asignado que puedan ser reparados');
      const totalWithoutClub = players.filter(p => !p.clubId).length;
      if (totalWithoutClub > 0) {
        console.log(`⚠️ Hay ${totalWithoutClub} jugadores sin club, pero sin datos originales para reparar`);
      }
      return { fixed: 0, total: players.length };
    }

    console.log(`🔍 Encontrados ${playersNeedingFix.length} jugadores que pueden ser reparados`);

    // Try to fix each player
    const fixedPlayers = players.map(player => {
      if (!player.clubId && (player.originalClubId || player.originalClubName)) {
        let foundClub = null;

        // Try to find club by original ID first
        if (player.originalClubId && player.originalClubId !== 'undefined') {
          foundClub = clubs.find(c => c.id === player.originalClubId);
          if (foundClub) {
            console.log(`🔧 Reparado ${player.name}: ${player.originalClubId} -> ${foundClub.name}`);
          }
        }

        // Try to find club by original name if ID didn't work
        if (!foundClub && player.originalClubName && player.originalClubName !== 'undefined') {
          foundClub = clubs.find(c => c.name === player.originalClubName);
          if (foundClub) {
            console.log(`🔧 Reparado ${player.name}: "${player.originalClubName}" -> ${foundClub.name}`);
          }
        }

        if (foundClub) {
          fixedCount++;
          return { ...player, clubId: foundClub.id };
        }
      }

      return player;
    });

    // Save the fixed players
    if (fixedCount > 0) {
      console.log(`💾 Guardando ${fixedCount} asignaciones reparadas...`);
      await savePlayers(fixedPlayers);
      console.log('✅ Asignaciones de club reparadas exitosamente');
    }

    return { fixed: fixedCount, total: players.length };

  } catch (error) {
    console.error('❌ Error reparando asignaciones de club:', error);
    return { fixed: 0, total: 0 };
  }
};

type ListPlayersOptions = {
  skipSupabase?: boolean;
};

export const listPlayers = async (options?: ListPlayersOptions): Promise<Player[]> => {
  // Use IndexedDB data if available, otherwise initialize with seed data
  console.log('PlayerService: Getting players from IndexedDB');
  const skipSupabase = options?.skipSupabase ?? false;
  try {
    // 1) Try to sync from Supabase first (if enabled)
    if (!skipSupabase) {
      const supabasePlayers = await fetchPlayersFromSupabase();
      if (Array.isArray(supabasePlayers)) {
        if (supabasePlayers.length > 0) {
          console.log('PlayerService: Synced', supabasePlayers.length, 'players from Supabase');
          await savePlayers(supabasePlayers);
          return supabasePlayers;
        } else if (supabasePlayers.length === 0) {
          console.log('PlayerService: Supabase returned 0 players, falling back to local');
        }
        // if supabasePlayers is [] continue to local fallback
      }
    }

    // 2) Fallback to local IndexedDB
    const players = await getPlayers();
    console.log('PlayerService: getPlayers() returned', players.length, 'players');

    if (players.length === 0) {
      console.log('PlayerService: No players in IndexedDB, checking initialization status');

      // Check if already initialized to avoid unnecessary initialization
      const alreadyInitialized = localStorage.getItem(INIT_KEY);
      if (alreadyInitialized !== 'true') {
        console.log('PlayerService: Not initialized yet, initializing with seed data');
        await initializePlayers();
        const initializedPlayers = await getPlayers();
        console.log('PlayerService: After initialization, found', initializedPlayers.length, 'players');
        return initializedPlayers;
      } else {
        console.log('PlayerService: Already initialized but no players found, this might be an issue');
        // If already initialized but no players, something went wrong, reinitialize
        console.log('PlayerService: Reinitializing due to missing players after initialization');
        await initializePlayers();
        const reinitializedPlayers = await getPlayers();
        console.log('PlayerService: After reinitialization, found', reinitializedPlayers.length, 'players');
        return reinitializedPlayers;
      }
    }

    console.log('PlayerService: Found', players.length, 'players in IndexedDB');
    return players;
  } catch (error) {
    console.error('PlayerService: Error getting players from IndexedDB:', error);
    // If there's an error, try to initialize with seed data
    try {
      console.log('PlayerService: Attempting recovery initialization');
      await initializePlayers();
      const fallbackPlayers = await getPlayers();
      console.log('PlayerService: After error recovery, found', fallbackPlayers.length, 'players');
      return fallbackPlayers;
    } catch (fallbackError) {
      console.error('PlayerService: Error in fallback initialization:', fallbackError);
      // As a last resort, return seed players directly
      console.log('PlayerService: Returning seed players as last resort');
      return seedPlayers;
    }
  }
};

// Force regeneration of players with correct positions
export const regeneratePlayers = async (): Promise<Player[]> => {
  console.log('PlayerService: Forcing regeneration of players with correct positions');

  // Clear everything first
  await clearAllCache();

  // Then regenerate with fresh data
  await dbService.clear(PLAYERS_STORE);
  await dbService.putMany(PLAYERS_STORE, seedPlayers);
  console.log('PlayerService: Players regenerated with unique IDs');

  return seedPlayers;
};

// Complete cache cleanup and regeneration
export const clearAllCache = async (): Promise<Player[]> => {
  console.log('PlayerService: Complete cache cleanup and regeneration');

  // Clear all IndexedDB data
  await dbService.clear(PLAYERS_STORE);

  // Clear localStorage initialization flag
  localStorage.removeItem(INIT_KEY);

  // Also clear any other potential player-related keys in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('player') || key.includes('virtual_zone'))) {
      localStorage.removeItem(key);
      console.log(`PlayerService: Removed localStorage key: ${key}`);
    }
  }

  // Force regeneration with fresh seed data
  await dbService.putMany(PLAYERS_STORE, seedPlayers);
  localStorage.setItem(INIT_KEY, 'true');

  console.log('PlayerService: Cache completely cleared and regenerated');
  return seedPlayers;
};

export const createPlayer = async (data: {
  name: string;
  age: number;
  position: string;
  overall: number;
  clubId?: string;
  transferValue?: number;
  nationality: string;
  dorsal: number;
  image?: string;
  attributes: any;
  skills: any;
  playingStyles: any;
  injuryResistance: number;
  height?: number;
  weight?: number;
}): Promise<Player> => {
  const players = await getPlayers();
  // Generate a more predictable ID based on existing players
  const existingIds = players.map(p => parseInt(p.id.split('-').pop() || '0'));
  const nextId = Math.max(0, ...existingIds) + 1;
  const id = `player-${nextId}`;
  const nationality = data.nationality || 'Argentina';
  const potential = Math.min(101, data.overall + Math.floor(Math.random() * 6));
  const image = data.image
    ? data.image // Accept any image URL or base64 data
    : '/default.png'; // Usar imagen por defecto para todos los jugadores

  const player: Player = {
    id,
    name: data.name,
    age: data.age,
    position: data.position,
    nationality,
    clubId: data.clubId || '',
    overall: data.overall,
    potential,
    transferListed: true,
    transferValue: data.transferValue ?? Math.max(0, data.overall * 250000),
    image,
    attributes: data.attributes,
    skills: data.skills,
    playingStyles: data.playingStyles,
    contract: {
      expires: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString(),
      salary: calculateSalaryByRating(data.overall),
    },
    form: data.attributes?.form || 3,
    goals: 0,
    assists: 0,
    appearances: 0,
    matches: 0,
    dorsal: data.dorsal,
    injuryResistance: data.injuryResistance,
    height: data.height,
    weight: data.weight,
  };
  players.push(player);
  await savePlayers(players);
  console.log('PlayerService: Successfully created player locally', player.id);

  // Auto-sync to Supabase if enabled
  await syncPlayerToSupabase(player);

  return player;
};

// Auto-sync player to Supabase if enabled
const mapPlayerToSupabaseRow = (player: Player) => {
  const isFreeAgent = !player.clubId || player.clubId === 'libre' || player.clubId === 'free';

  return {
    id: player.id,
    name: player.name,
    age: player.age || 25,
    position: player.position,
    nationality: player.nationality || 'Argentina',
    club_id: isFreeAgent ? null : player.clubId,
    overall: player.overall || 50,
    potential: player.potential || player.overall || 50,
    transfer_listed: player.transferListed || false,
    transfer_value: player.transferValue ?? player.marketValue ?? 0,
    image: player.image || '',
    attributes: player.attributes,
    skills: player.skills || [],
    playing_styles: player.playingStyles || [],
    contract: player.contract || { expires: new Date().toISOString(), salary: 0 },
    form: player.form || 3,
    goals: player.goals || 0,
    assists: player.assists || 0,
    appearances: player.appearances || 0,
    matches: player.matches || 0,
    dorsal: player.dorsal || 1,
    injury_resistance: player.injuryResistance || 50,
    height: player.height,
    weight: player.weight,
    updated_at: new Date().toISOString()
  };
};

export const syncPlayerToSupabase = async (player: Player): Promise<void> => {
  try {
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('PlayerService: Supabase sync disabled, skipping...');
      return;
    }

    const { getSupabaseAdminClient, getSupabaseClient } = await import('../lib/supabase');
    const supabase = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();

    const supabasePlayer = mapPlayerToSupabaseRow(player);

    console.log('PlayerService: Syncing player to Supabase:', player.id);

    const { error } = await supabase
      .from('players')
      .upsert(supabasePlayer, { onConflict: 'id' });

    if (error) {
      console.error('PlayerService: Error syncing player to Supabase:', error);
    } else {
      console.log('PlayerService: Player synced to Supabase successfully:', player.id);
    }
  } catch (error) {
    console.error('PlayerService: Failed to sync player to Supabase:', error);
  }
};

export const replaceSupabasePlayers = async (players: Player[]): Promise<void> => {
  try {
    const { config } = await import('../lib/config');
    if (!config.useSupabase) {
      throw new Error('La integración con Supabase está deshabilitada.');
    }

    const { getSupabaseAdminClient, getSupabaseClient } = await import('../lib/supabase');
    const supabase = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();

    console.log('PlayerService: Eliminando transferencias dependientes en Supabase...');
    const { error: deleteTransfersError } = await supabase.from('transfers').delete().not('id', 'is', null);
    if (deleteTransfersError) {
      throw deleteTransfersError;
    }

    console.log(`PlayerService: Eliminando jugadores existentes en Supabase antes de importar ${players.length} registros...`);
    const { error: deleteError } = await supabase.from('players').delete().not('id', 'is', null);
    if (deleteError) {
      throw deleteError;
    }

    const chunkSize = 100;
    for (let i = 0; i < players.length; i += chunkSize) {
      const chunk = players.slice(i, i + chunkSize).map(mapPlayerToSupabaseRow);
      const { error: insertError } = await supabase.from('players').insert(chunk);
      if (insertError) {
        throw insertError;
      }
      console.log(`PlayerService: Subidos ${Math.min(i + chunkSize, players.length)} / ${players.length} jugadores a Supabase`);
    }

    console.log('PlayerService: Reemplazo completo de jugadores en Supabase finalizado');
  } catch (error) {
    console.error('PlayerService: Error al reemplazar jugadores en Supabase:', error);
    throw error;
  }
};

export const updatePlayer = async (player: Player): Promise<Player> => {
  console.log('PlayerService: Updating player', player.id);
  const players = await getPlayers();
  console.log('PlayerService: Found', players.length, 'existing players');

  const existingPlayerIndex = players.findIndex(p => p.id === player.id);

  if (existingPlayerIndex !== -1) {
    const existingPlayer = players[existingPlayerIndex];
    console.log('PlayerService: Found existing player, updating...');

    // Ensure all required fields are present
    const updatedPlayer: Player = {
      ...existingPlayer,
      ...player,
      matches: player.matches ?? existingPlayer.matches ?? 0,
      dorsal: player.dorsal ?? existingPlayer.dorsal ?? 1,
      height: player.height ?? existingPlayer.height,
      weight: player.weight ?? existingPlayer.weight,
    };

    const updated = players.map(p => (p.id === player.id ? updatedPlayer : p));
    await savePlayers(updated);
    console.log('PlayerService: Successfully updated player locally', player.id);

    // Auto-sync to Supabase if enabled
    await syncPlayerToSupabase(updatedPlayer);

    return updatedPlayer;
  }

  // If player doesn't exist, add it
  console.log('PlayerService: Player not found, adding new player');
  await savePlayers([...players, player]);
  console.log('PlayerService: Successfully added player locally', player.id);

  // Auto-sync to Supabase if enabled
  await syncPlayerToSupabase(player);

  return player;
};

export const deletePlayer = async (id: string): Promise<void> => {
  const players = await getPlayers();
  await savePlayers(players.filter(p => p.id !== id));
  console.log('PlayerService: Successfully deleted player locally', id);

  // Auto-sync deletion to Supabase if enabled
  try {
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('PlayerService: Supabase sync disabled, skipping deletion...');
      return;
    }

    const { getSupabaseAdminClient, getSupabaseClient } = await import('../lib/supabase');
    const supabase = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();

    console.log('PlayerService: Deleting player from Supabase:', id);

    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('PlayerService: Error deleting player from Supabase:', error);
    } else {
      console.log('PlayerService: Player deleted from Supabase successfully:', id);
    }
  } catch (error) {
    console.error('PlayerService: Failed to delete player from Supabase:', error);
  }
};

// Function to generate realistic random stats for a player based on position
const generateRealisticStats = (player: Player): Partial<Player> => {
  const position = player.position;
  const overall = player.overall;

  // Generate attributes based on position and overall
  const generateAttribute = (baseValue: number, positionBonus: number = 0) => {
    const variation = Math.floor(Math.random() * 20) - 10; // -10 to +9
    const finalValue = Math.max(40, Math.min(101, baseValue + variation + positionBonus));
    return finalValue;
  };

  // Position-based attribute adjustments
  const getPositionBonus = (attribute: string) => {
    const bonuses: Record<string, Record<string, number>> = {
      GK: {
        goalkeeping: 20, catching: 15, reflexes: 15, coverage: 15,
        speed: -5, finishing: -15, lowPass: -5, offensiveAwareness: -10
      },
      CB: {
        defensiveAwareness: 15, ballWinning: 15, heading: 10,
        physicalContact: 10, jumping: 10, aggression: 5
      },
      LB: {
        speed: 10, acceleration: 10, stamina: 10, defensiveAwareness: 10,
        loftedPass: 5, lowPass: 5
      },
      RB: {
        speed: 10, acceleration: 10, stamina: 10, defensiveAwareness: 10,
        loftedPass: 5, lowPass: 5
      },
      CDM: {
        defensiveAwareness: 15, ballWinning: 15, stamina: 10,
        aggression: 10, lowPass: 5
      },
      CM: {
        lowPass: 10, loftedPass: 10, stamina: 5, ballControl: 5
      },
      CAM: {
        lowPass: 15, ballControl: 10, dribbling: 10, finishing: 5,
        offensiveAwareness: 10
      },
      LM: {
        loftedPass: 10, dribbling: 10, speed: 10, acceleration: 10, stamina: 5
      },
      RM: {
        loftedPass: 10, dribbling: 10, speed: 10, acceleration: 10, stamina: 5
      },
      LW: {
        dribbling: 15, speed: 15, acceleration: 15, loftedPass: 10, finishing: 10
      },
      RW: {
        dribbling: 15, speed: 15, acceleration: 15, loftedPass: 10, finishing: 10
      },
      ST: {
        finishing: 20, heading: 10, speed: 5, acceleration: 5,
        physicalContact: 10, jumping: 10, offensiveAwareness: 15
      }
    };

    return bonuses[position]?.[attribute] || 0;
  };

  const attributes: PlayerAttributes = {
    // General attributes (40-99)
    offensiveAwareness: generateAttribute(65, getPositionBonus('offensiveAwareness')),
    ballControl: generateAttribute(70, getPositionBonus('ballControl')),
    dribbling: generateAttribute(65, getPositionBonus('dribbling')),
    tightPossession: generateAttribute(68, getPositionBonus('tightPossession')),
    lowPass: generateAttribute(70, getPositionBonus('lowPass')),
    loftedPass: generateAttribute(68, getPositionBonus('loftedPass')),
    finishing: generateAttribute(60, getPositionBonus('finishing')),
    heading: generateAttribute(60, getPositionBonus('heading')),
    setPieceTaking: generateAttribute(65, getPositionBonus('setPieceTaking')),
    curl: generateAttribute(65, getPositionBonus('curl')),
    speed: generateAttribute(70, getPositionBonus('speed')),
    acceleration: generateAttribute(68, getPositionBonus('acceleration')),
    kickingPower: generateAttribute(70, getPositionBonus('kickingPower')),
    jumping: generateAttribute(65, getPositionBonus('jumping')),
    physicalContact: generateAttribute(68, getPositionBonus('physicalContact')),
    balance: generateAttribute(70, getPositionBonus('balance')),
    stamina: generateAttribute(70, getPositionBonus('stamina')),
    defensiveAwareness: generateAttribute(65, getPositionBonus('defensiveAwareness')),
    ballWinning: generateAttribute(65, getPositionBonus('ballWinning')),
    aggression: generateAttribute(68, getPositionBonus('aggression')),

    // Goalkeeper attributes
    goalkeeping: position === 'PT' ? generateAttribute(75, getPositionBonus('goalkeeping')) : generateAttribute(45, getPositionBonus('goalkeeping')),
    catching: position === 'PT' ? generateAttribute(72, getPositionBonus('catching')) : generateAttribute(45, getPositionBonus('catching')),
    reflexes: position === 'PT' ? generateAttribute(75, getPositionBonus('reflexes')) : generateAttribute(45, getPositionBonus('reflexes')),
    coverage: position === 'PT' ? generateAttribute(70, getPositionBonus('coverage')) : generateAttribute(45, getPositionBonus('coverage')),

    // Special sub-attributes
    weakFootUsage: 1 + Math.floor(Math.random() * 4), // 1-4
    weakFootAccuracy: 1 + Math.floor(Math.random() * 4), // 1-4
    form: 1 + Math.floor(Math.random() * 5), // 1-5

    // Legacy attributes (para compatibilidad)
    pace: generateAttribute(70, getPositionBonus('speed')),
    shooting: generateAttribute(65, getPositionBonus('finishing') + getPositionBonus('kickingPower')),
    passing: generateAttribute(70, getPositionBonus('lowPass') + getPositionBonus('loftedPass')),
    defending: generateAttribute(65, getPositionBonus('defensiveAwareness') + getPositionBonus('ballWinning')),
    physical: generateAttribute(68, getPositionBonus('physicalContact') + getPositionBonus('stamina'))
  };

  // Generate skills based on position and overall
  const skills: PlayerSkills = {
    // Technical skills
    scissorKick: Math.random() > 0.85 && overall > 75,
    doubleTouch: Math.random() > 0.75 && overall > 70,
    flipFlap: Math.random() > 0.9 && overall > 75,
    marseilleTurn: Math.random() > 0.85 && overall > 70,
    rainbow: Math.random() > 0.95 && overall > 75,
    chopTurn: Math.random() > 0.8 && overall > 70,
    cutBehindAndTurn: Math.random() > 0.85 && overall > 70,
    scotchMove: Math.random() > 0.9 && overall > 75,
    stepOnSkillControl: Math.random() > 0.75 && overall > 70,

    // Physical/positional skills
    heading: Math.random() > 0.6 && (position === 'CD' || position === 'DEC' || position === 'MC'),
    longRangeDrive: Math.random() > 0.7 && overall > 75,
    chipShotControl: Math.random() > 0.8 && overall > 70,
    longRanger: Math.random() > 0.8 && overall > 75,
    knuckleShot: Math.random() > 0.85 && overall > 75,
    dippingShot: Math.random() > 0.85 && overall > 75,
    risingShot: Math.random() > 0.85 && overall > 75,
    acrobaticFinishing: Math.random() > 0.9 && overall > 80,
    heelTrick: Math.random() > 0.85 && overall > 75,
    firstTimeShot: Math.random() > 0.7 && overall > 70,

    // Passing skills
    oneTouchPass: Math.random() > 0.65 && overall > 70,
    throughPassing: Math.random() > 0.7 && (position === 'MC' || position === 'MO' || position === 'CD'),
    weightedPass: Math.random() > 0.75 && overall > 75,
    pinpointCrossing: Math.random() > 0.7 && (position === 'MDI' || position === 'MDD' || position === 'EXD' || position === 'EXI'),
    outsideCurler: Math.random() > 0.8 && overall > 75,
    rabona: Math.random() > 0.9 && overall > 80,
    noLookPass: Math.random() > 0.85 && overall > 75,
    lowLoftedPass: Math.random() > 0.8 && overall > 70,

    // Defensive skills
    giantKill: Math.random() > 0.8 && overall > 75,
    longThrow: Math.random() > 0.7 && (position === 'LI' || position === 'LD'),
    longThrow2: Math.random() > 0.8 && (position === 'LI' || position === 'LD'),
    gkLongThrow: position === 'PT' && Math.random() > 0.6,
    penaltySpecialist: Math.random() > 0.8 && overall > 75,
    gkPenaltySaver: position === 'PT' && Math.random() > 0.7,

    // Mental/positional skills
    fightingSpirit: Math.random() > 0.6,
    manMarking: Math.random() > 0.7 && (position === 'DEC' || position === 'MCD'),
    trackBack: Math.random() > 0.65 && (position === 'EXI' || position === 'EXD' || position === 'CD'),
    interception: Math.random() > 0.7 && (position === 'MC' || position === 'MCD' || position === 'DEC'),
    acrobaticClear: position === 'PT' && Math.random() > 0.7,
    captaincy: Math.random() > 0.8 && overall > 80,
    superSub: Math.random() > 0.75,
    comPlayingStyles: Math.random() > 0.6
  };

  // Generate playing styles based on position and overall
  const playingStyles: PlayingStyles = {
    // Attacking styles
    goalPoacher: position === 'CD' && Math.random() > 0.7,
    dummyRunner: Math.random() > 0.8,
    foxInTheBox: position === 'CD' && Math.random() > 0.7,
    targetMan: (position === 'CD' || position === 'DEC') && Math.random() > 0.6,
    classicNo10: position === 'MO' && Math.random() > 0.7,
    prolificWinger: (position === 'EXD' || position === 'EXI') && Math.random() > 0.7,
    roamingFlank: (position === 'MDI' || position === 'MDD') && Math.random() > 0.6,
    crossSpecialist: (position === 'MDI' || position === 'MDD' || position === 'EXD' || position === 'EXI') && Math.random() > 0.7,

    // Midfield styles
    holePlayer: position === 'MO' && Math.random() > 0.7,
    boxToBox: position === 'MC' && Math.random() > 0.7,
    theDestroyer: position === 'MCD' && Math.random() > 0.7,
    orchestrator: position === 'MC' && Math.random() > 0.8,
    anchor: position === 'MCD' && Math.random() > 0.7,

    // Defensive styles
    offensiveFullback: position === 'LD' && Math.random() > 0.7,
    fullbackFinisher: position === 'LI' && Math.random() > 0.8,
    defensiveFullback: (position === 'LI' || position === 'LD') && Math.random() > 0.7,

    // General styles
    buildUp: Math.random() > 0.6,
    extraFrontman: position === 'CD' && Math.random() > 0.7,

    // Goalkeeper styles
    offensiveGoalkeeper: position === 'PT' && Math.random() > 0.6,
    defensiveGoalkeeper: position === 'PT' && Math.random() > 0.7
  };

  // Update form and other dynamic stats
  const form = 1 + Math.floor(Math.random() * 5);
  const matches = Math.floor(Math.random() * 30) + 5;
  const goals = position === 'CD' ? Math.floor(Math.random() * 20) + 3 :
               position === 'EXI' || position === 'EXD' ? Math.floor(Math.random() * 12) + 2 :
               position === 'MO' || position === 'MC' ? Math.floor(Math.random() * 8) + 1 :
               position === 'PT' ? 0 : Math.floor(Math.random() * 5);
  const assists = Math.floor(Math.random() * 12) + 1;
  const appearances = Math.floor(Math.random() * 35) + 5;

  return {
    attributes,
    skills,
    playingStyles,
    form,
    matches,
    goals,
    assists,
    appearances,
    injuryResistance: 1 + Math.floor(Math.random() * 3)
  };
};

// Function to randomize stats for all existing players
export const randomizeAllPlayersStats = async (): Promise<Player[]> => {
  console.log('=== RANDOMIZING ALL PLAYERS STATS ===');

  const players = await getPlayers();
  console.log('Found', players.length, 'players to randomize');

  const updatedPlayers = players.map(player => {
    const newStats = generateRealisticStats(player);
    const updatedPlayer = {
      ...player,
      ...newStats
    };

    console.log(`Updated ${player.name} (${player.position}) - Overall: ${player.overall}`);
    return updatedPlayer;
  });

  console.log('Saving updated players to IndexedDB...');
  await savePlayers(updatedPlayers);

  console.log('Randomization complete!');
  return updatedPlayers;
};

// Function to get updated players after randomization (for dataStore sync)
export const getRandomizedPlayers = async (): Promise<Player[]> => {
  return await randomizeAllPlayersStats();
};

// Function to toggle transfer listing for a player
export const togglePlayerTransferListing = async (playerId: string): Promise<Player | null> => {
  const players = await getPlayers();
  const playerIndex = players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    return null;
  }

  const player = players[playerIndex];
  const updatedPlayer = {
    ...player,
    transferListed: !player.transferListed
  };

  const updatedPlayers = [...players];
  updatedPlayers[playerIndex] = updatedPlayer;

  await savePlayers(updatedPlayers);
  await syncPlayerToSupabase(updatedPlayer);
  return updatedPlayer;
};

// Function to get transfer listed players count
export const getTransferListedPlayersCount = async (): Promise<number> => {
  const players = await getPlayers();
  return players.filter(p => p.transferListed).length;
};

// Function to detect and report duplicate players
export const findDuplicatePlayers = async (): Promise<{ duplicates: Player[], uniqueNames: string[] }> => {
  const players = await getPlayers();
  const nameCount: { [key: string]: number } = {};
  const duplicates: Player[] = [];
  const uniqueNames: string[] = [];

  players.forEach(player => {
    if (nameCount[player.name]) {
      nameCount[player.name]++;
      duplicates.push(player);
    } else {
      nameCount[player.name] = 1;
      uniqueNames.push(player.name);
    }
  });

  console.log('PlayerService: Duplicate detection results:');
  console.log(`- Total players: ${players.length}`);
  console.log(`- Unique names: ${uniqueNames.length}`);
  console.log(`- Duplicate players found: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('Duplicate players:');
    duplicates.forEach(player => {
      console.log(`  - ${player.name} (${player.position}) - ID: ${player.id}`);
    });
  }

  return { duplicates, uniqueNames };
};

export const removeDuplicatePlayers = async (): Promise<{ removed: number; remainingPlayers: Player[]; removedPlayers: Player[] }> => {
  const players = await getPlayers();
  const seenKeys = new Set<string>();
  const dedupedPlayers: Player[] = [];
  const duplicates: Player[] = [];

  players.forEach(player => {
    const key = `${player.name.toLowerCase()}-${player.position}`;
    if (seenKeys.has(key)) {
      duplicates.push(player);
    } else {
      seenKeys.add(key);
      dedupedPlayers.push(player);
    }
  });

  if (duplicates.length === 0) {
    console.log('PlayerService: No duplicate players found to remove');
    return { removed: 0, remainingPlayers: players, removedPlayers: [] };
  }

  await savePlayers(dedupedPlayers);
  console.log(`PlayerService: Removed ${duplicates.length} duplicate players locally`);

  try {
    const { config } = await import('../lib/config');
    if (config.useSupabase) {
      const { getSupabaseClient } = await import('../lib/supabase');
      const supabase = getSupabaseClient();

      for (const duplicate of duplicates) {
        const { error } = await supabase
          .from('players')
          .delete()
          .eq('id', duplicate.id);

        if (error) {
          console.error(`PlayerService: Error deleting duplicate player ${duplicate.id} from Supabase:`, error);
        } else {
          console.log(`PlayerService: Duplicate player ${duplicate.id} removed from Supabase`);
        }
      }
    }
  } catch (error) {
    console.error('PlayerService: Failed to remove duplicate players from Supabase:', error);
  }

  return { removed: duplicates.length, remainingPlayers: dedupedPlayers, removedPlayers: duplicates };
};

// Function to get all transfer listed players
export const getTransferListedPlayers = async (): Promise<Player[]> => {
  const players = await getPlayers();
  return players.filter(p => p.transferListed);
};

// Function to update all players to be transfer listed (for migration purposes)
export const updateAllPlayersToTransferListed = async (): Promise<Player[]> => {
  console.log('=== UPDATING ALL PLAYERS TO TRANSFER LISTED ===');

  const players = await getPlayers();
  console.log('Found', players.length, 'players to update');

  const updatedPlayers = players.map(player => ({
    ...player,
    transferListed: true
  }));

  console.log('Saving updated players to IndexedDB...');
  await savePlayers(updatedPlayers);

  try {
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('Supabase sync disabled, skipping remote transfer listing update.');
    } else {
      const { getSupabaseAdminClient, getSupabaseClient } = await import('../lib/supabase');
      const supabase = config.supabase.serviceRoleKey ? getSupabaseAdminClient() : getSupabaseClient();

      console.log('🔄 Sincronizando cambios de transfer listing con Supabase en lotes...');
      const chunkSize = 100;
      for (let i = 0; i < updatedPlayers.length; i += chunkSize) {
        const chunk = updatedPlayers.slice(i, i + chunkSize).map(mapPlayerToSupabaseRow);
        const { error } = await supabase
          .from('players')
          .upsert(chunk, { onConflict: 'id' });

        if (error) {
          throw error;
        }
        console.log(`PlayerService: Transfer listing batch ${Math.min(i + chunkSize, updatedPlayers.length)} / ${updatedPlayers.length} sincronizado`);
      }

      console.log(`✅ Sincronización con Supabase completada para ${updatedPlayers.length} jugadores`);
    }
  } catch (error) {
    console.error('Error sincronizando transfer listing en Supabase:', error);
  }

  console.log('Update complete!');
  return updatedPlayers;
};

// Fetch players directly from Supabase and map to Player[] (no state write)
export const fetchPlayersFromSupabase = async (): Promise<Player[]> => {
  try {
    const { config } = await import('../lib/config');
    if (!config.useSupabase) {
      return await getPlayers();
    }
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    // Fetch in batches to bypass the 1000-row default limit
    const batchSize = 1000;
    let from = 0;
    const allRows: any[] = [];

    while (true) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .range(from, from + batchSize - 1);
      if (error) throw error;
      const rows = (data || []) as any[];
      allRows.push(...rows);
      if (rows.length < batchSize) break;
      from += batchSize;
    }

    const mapped: Player[] = allRows.map((r: any) => {
      const rawClubId = r.club_id ?? '';
      const normalizedClubId = (!rawClubId || rawClubId === 'free') ? 'libre' : rawClubId;
      return {
      id: r.id,
      name: r.name ?? '',
      age: Number(r.age ?? 25),
      position: r.position ?? 'MC',
      nationality: r.nationality ?? 'Argentina',
      clubId: normalizedClubId,
      overall: Number(r.overall ?? 50),
      potential: Number(r.potential ?? r.overall ?? 50),
      transferListed: Boolean(r.transfer_listed ?? false),
      transferValue: Number(r.transfer_value ?? 0),
      image: r.image ?? '',
      attributes: r.attributes ?? {},
      skills: r.skills ?? {},
      playingStyles: r.playing_styles ?? {},
      contract: r.contract ?? { expires: new Date().toISOString(), salary: 0 },
      form: Number(r.form ?? 3),
      goals: Number(r.goals ?? 0),
      assists: Number(r.assists ?? 0),
      appearances: Number(r.appearances ?? 0),
      matches: Number(r.matches ?? 0),
      dorsal: Number(r.dorsal ?? 1),
      injuryResistance: Number(r.injury_resistance ?? 50),
      height: r.height ?? undefined,
      weight: r.weight ?? undefined,
    }});
    return mapped;
  } catch (e) {
    console.error('PlayerService: fetchPlayersFromSupabase failed:', e);
    return await getPlayers();
  }
};

// Función para obtener todas las fotos disponibles organizadas por club
// 🔄 SISTEMA AUTOMÁTICO: Esta lista se mantiene actualizada ejecutando:
// node scripts/read_photos.cjs
//
// El script automáticamente:
// - Escanea la carpeta public/Fotos_Jugadores/
// - Actualiza public/photos-list.json
// - Actualiza las listas hardcodeadas en el código
//
// Para agregar nuevas fotos:
// 1. Colocar la imagen .png en public/Fotos_Jugadores/[Club]/
// 2. Ejecutar: node scripts/read_photos.cjs
// 3. El botón "Actualizar Lista de Fotos" funcionará automáticamente
const getAvailablePhotos = (): { [clubName: string]: string[] } => {

  // Lista mantenida automáticamente por el script read_photos.cjs
  // Ejecutar: node scripts/read_photos.cjs
  const photos: { [clubName: string]: string[] } = {
    'Jackson FC': [
      'Akim Zedadka.png',
      'Braian Martínez.png',
      'Bruno Zapelli.png',
      'Corentin Jean.png',
      'Dejan Stojanovic.png',
      'Enric Saborit.png',
      'Felix Beijmo.png',
      'Gabi Kanichowsky.png',
      'Jacob Barrett Laursen.png',
      'Jasper Löffelsend.png',
      'Joyskim Dawa.png',
      'Jón Daði Böðvarsson.png',
      'Kevin Escamilla.png',
      'Marcelo Ferreira.png',
      'Markus Henriksen.png',
      'Nuraly Alip.png',
      'Oday Dabbagh.png',
      'Pere Milla.png',
      'Sergio González.png',
      'Sergio Padt.png',
      'Shoya Nakajima.png',
      'Valeri Qazaishvili.png',
      'Zan Majer.png'
    ],
    'Libres': [
      'Alisson Becker.png',
      'Bernardo Silva.png',
      'Bruno Fernandes.png',
      'Bukayo Saka.png',
      'Cristiano Ronaldo.png',
      'Erling Haaland.png',
      'Harry Kane.png',
      'Heung-min Son.png',
      'Jan Oblak.png',
      'Joshua Kimmich.png',
      'Jude Bellingham.png',
      'Kevin De Bruyne.png',
      'Kylian Mbappé.png',
      'Lautaro Martinez.png',
      'Lionel Messi.png',
      'Marc-Andre ter Stegen.png',
      'Martin Ødegaard.png',
      'Mohamed Salah.png',
      'Neymar Jr.png',
      'Phil Foden.png',
      'Robert Lewandowski.png',
      'Rodri.png',
      'Thibaut Courtois.png',
      'Victor Osimhen.png',
      'Vinicius Junior.png',
      'Virgil van Dijk.png'
    ]
  };

  return photos;
};

// Función para obtener el nombre del club por ID
const getClubNameById = (clubId: string): string | null => {
  // Mapeo completo de clubId a nombres de club
  // Generado automáticamente con generate_club_mapping.cjs
  const clubNameMap: { [id: string]: string } = {
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
};

// Función para normalizar nombres (quitar acentos, convertir a minúsculas, etc.)
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-zA-Z\s]/g, '') // Remove special characters
    .trim();
};

// Calcula distancia de Levenshtein para similitud aproximada
const levenshteinDistance = (a: string, b: string): number => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
};

const stringSimilarity = (s1: string, s2: string): number => {
  const a = normalizeName(s1);
  const b = normalizeName(s2);
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.length === 0) return 1;
  const dist = levenshteinDistance(longer, shorter);
  return (longer.length - dist) / longer.length; // 0..1
};

// Función para encontrar la mejor coincidencia entre un jugador y las fotos disponibles
const findBestPhotoMatch = (playerName: string, availablePhotos: string[]): { photoName: string; confidence: number } | null => {
  const normalizedPlayerName = normalizeName(playerName);

  // Primero buscar coincidencia exacta
  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));
    if (normalizedPlayerName === normalizedPhotoName) {
      return { photoName, confidence: 1.0 };
    }
  }

  // Si no hay coincidencia exacta, buscar coincidencias parciales
  for (const photoName of availablePhotos) {
    const normalizedPhotoName = normalizeName(photoName.replace('.png', ''));

    // Si el nombre del jugador contiene el nombre de la foto o viceversa
    if (normalizedPlayerName.includes(normalizedPhotoName) ||
        normalizedPhotoName.includes(normalizedPlayerName)) {
      return { photoName, confidence: 0.8 };
    }

    // Si coinciden las primeras palabras
    const playerWords = normalizedPlayerName.split(' ');
    const photoWords = normalizedPhotoName.split(' ');

    if (playerWords.length >= 2 && photoWords.length >= 2 &&
        playerWords[0] === photoWords[0] && playerWords[1] === photoWords[1]) {
      return { photoName, confidence: 0.9 };
    }

    // Para nombres con apóstrofes o caracteres especiales
    if (playerWords.length >= 2 && photoWords.length >= 1 &&
        playerWords[0] === photoWords[0]) {
      return { photoName, confidence: 0.7 };
    }
  }

  // Como último recurso, usar similitud aproximada para tolerar typos (ej: Bukayo vs Buyako)
  let best: { photoName: string; confidence: number } | null = null;
  for (const photoName of availablePhotos) {
    const photoBase = photoName.replace('.png', '');
    const sim = stringSimilarity(normalizedPlayerName, photoBase);
    if (sim >= 0.85) { // umbral alto para evitar falsos positivos
      const conf = Math.min(0.95, sim); // limitar confianza máx al 95%
      if (!best || conf > best.confidence) {
        best = { photoName, confidence: conf };
      }
    }
  }

  if (best) return best;

  return null;
};


interface MatchAllPlayerPhotosOptions {
  batchSize?: number;
  minConfidence?: number;
}

// Función para emparejar fotos de TODOS los jugadores (no solo libres)
export const matchAllPlayerPhotos = async (
  options: MatchAllPlayerPhotosOptions = {}
): Promise<{ updated: number; total: number }> => {
  console.log('🎯 Emparejando fotos de TODOS los jugadores...');

  const players = await getPlayers();
  const availablePhotos = getAvailablePhotos();
  const totalPlayers = players.length;
  const batchSize = Math.max(1, options.batchSize ?? (totalPlayers || 1));
  const minConfidence = options.minConfidence ?? 0;

  console.log('📸 Fotos disponibles por club:', Object.keys(availablePhotos).map(club =>
    club + ': ' + availablePhotos[club].length + ' fotos'
  ).join(', '));

  let updatedCount = 0;
  let totalProcessed = 0;
  let skippedByConfidence = 0;

  for (let start = 0; start < totalPlayers; start += batchSize) {
    const end = Math.min(start + batchSize, totalPlayers);
    const batchPlayers = players.slice(start, end);
    const batchNumber = Math.floor(start / batchSize) + 1;
    console.log(`\n📦 Procesando lote ${batchNumber} (${start + 1}-${end}) de ${totalPlayers} jugadores`);

    for (const player of batchPlayers) {
      totalProcessed++;

      // Determinar qué fotos buscar basado en el club del jugador
      let relevantPhotos: string[] = [];
      let photoPathPrefix = '';

      if (player.clubId === 'libre' || player.clubId === 'free' || !player.clubId) {
        // Jugador libre - buscar en carpeta Libres
        relevantPhotos = availablePhotos['Libres'] || [];
        photoPathPrefix = '/Fotos_Jugadores/Libres/';
      } else {
        // Buscar fotos del club específico
        // Primero intentar encontrar el club por ID exacto (caso raro)
        if (availablePhotos[player.clubId]) {
          relevantPhotos = availablePhotos[player.clubId];
          photoPathPrefix = '/Fotos_Jugadores/' + player.clubId + '/';
        } else {
          // Si no se encuentra por ID, obtener el nombre del club usando el mapeo
          const clubName = getClubNameById(player.clubId || '');
          if (clubName && availablePhotos[clubName]) {
            relevantPhotos = availablePhotos[clubName];
            photoPathPrefix = '/Fotos_Jugadores/' + clubName + '/';
          } else {
            // Como último recurso, buscar por coincidencia de nombre normalizado
            const clubName = Object.keys(availablePhotos).find(clubName =>
              normalizeName(clubName) === normalizeName(player.clubId || '')
            );
            if (clubName) {
              relevantPhotos = availablePhotos[clubName];
              photoPathPrefix = '/Fotos_Jugadores/' + clubName + '/';
            }
          }
        }
      }

      if (relevantPhotos.length === 0) {
        // No hay fotos disponibles para este club, continuar
        continue;
      }

      // Buscar la mejor coincidencia
      const match = findBestPhotoMatch(player.name, relevantPhotos);

      if (match && match.confidence < minConfidence) {
        skippedByConfidence++;
        continue;
      }

      if (match) {
        const newImagePath = photoPathPrefix + match.photoName;

        // Solo actualizar si la imagen es diferente
        if (player.image !== newImagePath) {
          console.log('📸 Actualizando ' + player.name + ' (' + (player.clubId || 'libre') + '): ' +
            (player.image || 'sin imagen') + ' -> ' + newImagePath +
            ' (' + (match.confidence * 100).toFixed(0) + '% confianza)');

          const updatedPlayer = {
            ...player,
            image: newImagePath
          };

          await updatePlayer(updatedPlayer);
          updatedCount++;
        }
      }
    }
  }

  if (minConfidence > 0) {
    console.log('ℹ️ Coincidencias descartadas por baja confianza (' + (minConfidence * 100).toFixed(0) + '% mínimo): ' + skippedByConfidence);
  }

  console.log('✅ Proceso completado: ' + updatedCount + ' fotos actualizadas de ' + totalProcessed + ' jugadores procesados');

  return { updated: updatedCount, total: totalProcessed };
};



// Función para crear jugadores específicos de Jackson FC
export const createJacksonFCPlayers = async (): Promise<{ created: number }> => {
  console.log('🏟️ Creando jugadores específicos de Jackson FC...');

  const players = await getPlayers();

  // Jugadores específicos de Jackson FC con sus estadísticas
  const jacksonFCPlayers = [
    { name: 'Akim Zedadka', position: 'LI', overall: 78, age: 28 },
    { name: 'Braian Martínez', position: 'SD', overall: 76, age: 24 },
    { name: 'Bruno Zapelli', position: 'MCD', overall: 75, age: 26 },
    { name: 'Corentin Jean', position: 'SD', overall: 79, age: 27 },
    { name: 'Dejan Stojanovic', position: 'PT', overall: 80, age: 29 },
    { name: 'Enric Saborit', position: 'LD', overall: 74, age: 30 },
    { name: 'Felix Beijmo', position: 'DEC', overall: 77, age: 25 },
    { name: 'Gabi Kanichowsky', position: 'EXD', overall: 73, age: 26 },
    { name: 'Jacob Barrett Laursen', position: 'LI', overall: 76, age: 24 },
    { name: 'Jasper Löffelsend', position: 'MC', overall: 78, age: 27 },
    { name: 'Jón Daði Böðvarsson', position: 'SD', overall: 77, age: 31 },
    { name: 'Joyskim Dawa', position: 'EXI', overall: 75, age: 26 },
    { name: 'Kevin Escamilla', position: 'EXI', overall: 74, age: 28 },
    { name: 'Marcelo Ferreira', position: 'DEC', overall: 76, age: 25 },
    { name: 'Markus Henriksen', position: 'MCD', overall: 79, age: 30 },
    { name: 'Nuraly Alip', position: 'DEC', overall: 77, age: 23 },
    { name: 'Oday Dabbagh', position: 'SD', overall: 78, age: 29 },
    { name: 'Pere Milla', position: 'SD', overall: 76, age: 31 },
    { name: 'Sergio González', position: 'LI', overall: 75, age: 26 },
    { name: 'Sergio Padt', position: 'PT', overall: 79, age: 32 },
    { name: 'Shoya Nakajima', position: 'EXD', overall: 77, age: 28 },
    { name: 'Valeri Qazaishvili', position: 'MO', overall: 78, age: 30 },
    { name: 'Zan Majer', position: 'MO', overall: 76, age: 31 }
  ];

  let createdCount = 0;

  for (const playerData of jacksonFCPlayers) {
    // Verificar si el jugador ya existe
    const existingPlayer = players.find(p => p.name === playerData.name);

    if (!existingPlayer) {
      console.log(`➕ Creando jugador de Jackson FC: ${playerData.name}`);

      const player = {
        name: playerData.name,
        age: playerData.age,
        position: playerData.position,
        overall: playerData.overall,
        transferValue: Math.max(0, playerData.overall * 200000),
        clubId: 'club18', // ID de Jackson FC
        nationality: 'Argentina', // Default, se puede ajustar
        dorsal: Math.floor(Math.random() * 99) + 1,
        image: `/Fotos_Jugadores/Jackson FC/${playerData.name}.png`,
        height: 170 + Math.floor(Math.random() * 30), // 170-200 cm
        weight: 65 + Math.floor(Math.random() * 25), // 65-90 kg
        attributes: {
          shooting: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          defending: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          pace: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          passing: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          physical: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          offensiveAwareness: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          ballControl: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          dribbling: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          tightPossession: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          lowPass: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          loftedPass: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          finishing: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          heading: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          setPieceTaking: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          curl: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          speed: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          acceleration: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          kickingPower: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          jumping: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          physicalContact: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          balance: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          stamina: Math.max(40, playerData.overall - 5 + Math.floor(Math.random() * 15)),
          defensiveAwareness: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          ballWinning: Math.max(40, playerData.overall - 10 + Math.floor(Math.random() * 20)),
          aggression: Math.max(40, playerData.overall - 15 + Math.floor(Math.random() * 25)),
          goalkeeping: playerData.position === 'PT' ? Math.max(60, playerData.overall - 5) : Math.max(20, playerData.overall - 30),
          catching: playerData.position === 'PT' ? Math.max(60, playerData.overall - 5) : Math.max(20, playerData.overall - 30),
          reflexes: playerData.position === 'PT' ? Math.max(60, playerData.overall - 5) : Math.max(20, playerData.overall - 30),
          coverage: playerData.position === 'PT' ? Math.max(60, playerData.overall - 5) : Math.max(20, playerData.overall - 30),
          gkHandling: playerData.position === 'PT' ? Math.max(60, playerData.overall - 5) : Math.max(20, playerData.overall - 30)
        },
        skills: [],
        playingStyles: [],
        injuryResistance: 1 + Math.floor(Math.random() * 3),
        matches: Math.floor(Math.random() * 30) + 5,
        transferListed: Math.random() > 0.7 // 30% de probabilidad de estar en lista de transferibles
      };

      await createPlayer(player);
      createdCount++;
    } else {
      console.log(`⚠️ Jugador ya existe: ${playerData.name}`);
    }
  }

  console.log(`✅ Proceso completado: ${createdCount} jugadores de Jackson FC creados`);
  return { created: createdCount };
};

// Función para verificar qué jugadores necesitan fotos (todos los clubes)
export const checkAllPlayersPhotos = async (): Promise<{
  withPhotos: Player[];
  withoutPhotos: Player[];
  byClub: { [clubId: string]: { withPhotos: number; withoutPhotos: number; total: number } };
  total: number;
}> => {
  const players = await getPlayers();
  const availablePhotos = getAvailablePhotos();

  const withPhotos = players.filter(p =>
    p.image && p.image !== '/default.png' && (
      p.image.startsWith('/Fotos_Jugadores/') ||
      p.image.startsWith('/public/Fotos_Jugadores/')
    )
  );

  const withoutPhotos = players.filter(p =>
    !p.image || p.image === '/default.png' || !(
      p.image.startsWith('/Fotos_Jugadores/') ||
      p.image.startsWith('/public/Fotos_Jugadores/')
    )
  );

  // Estadísticas por club
  const byClub: { [clubId: string]: { withPhotos: number; withoutPhotos: number; total: number } } = {};

  players.forEach(player => {
    const clubId = player.clubId || 'libre';
    if (!byClub[clubId]) {
      byClub[clubId] = { withPhotos: 0, withoutPhotos: 0, total: 0 };
    }
    byClub[clubId].total++;

    const hasPhoto = player.image && player.image !== '/default.png' && (
      player.image.startsWith('/Fotos_Jugadores/') ||
      player.image.startsWith('/public/Fotos_Jugadores/')
    );

    if (hasPhoto) {
      byClub[clubId].withPhotos++;
    } else {
      byClub[clubId].withoutPhotos++;
    }
  });

  console.log(`📊 Estado general de fotos de jugadores:`);
  console.log(`  Total jugadores: ${players.length}`);
  console.log(`  Con fotos asignadas: ${withPhotos.length}`);
  console.log(`  Sin fotos: ${withoutPhotos.length}`);
  console.log(`  Fotos disponibles: ${Object.values(availablePhotos).reduce((sum, photos) => sum + photos.length, 0)}`);

  console.log('\n📋 Estadísticas por club:');
  Object.entries(byClub).forEach(([clubId, stats]) => {
    const availableForClub = availablePhotos[clubId]?.length || 0;
    console.log(`  ${clubId}: ${stats.withPhotos}/${stats.total} fotos asignadas (${availableForClub} disponibles)`);
  });

  if (withoutPhotos.length > 0) {
    console.log('\n❌ Jugadores sin fotos (primeros 10):');
    withoutPhotos.slice(0, 10).forEach(p => {
      console.log(`  - ${p.name} (${p.clubId || 'libre'}) - ${p.image || 'sin imagen'}`);
    });
    if (withoutPhotos.length > 10) {
      console.log(`  ... y ${withoutPhotos.length - 10} más`);
    }
  }

  return {
    withPhotos,
    withoutPhotos,
    byClub,
    total: players.length
  };
};


/**
 * SISTEMA DE EMPAREJAMIENTO DE FOTOS DE JUGADORES
 *
 * Funcionalidades disponibles:
 *
 * 1. matchAllPlayerPhotos() - Empareja fotos de TODOS los jugadores del sistema
 *    - Busca automáticamente fotos en todas las carpetas de Fotos_Jugadores
 *    - Funciona con cualquier club que tenga carpeta de fotos
 *    - Maneja jugadores libres y de clubes específicos
 *
 * 2. checkAllPlayersPhotos() - Verifica estado de fotos de todos los jugadores
 *    - Muestra estadísticas por club
 *    - Identifica jugadores sin fotos
 *
 * 3. testPhotoMatching() - Función de prueba para verificar el algoritmo
 *
 * USO EN CONSOLA DEL NAVEGADOR:
 * - matchAllPlayerPhotos() - Para emparejar todas las fotos
 * - checkAllPlayersPhotos() - Para ver estadísticas
 *
 * CARPETAS SOPORTADAS:
 * - /Fotos_Jugadores/[ClubName]/ - Para jugadores de clubes específicos
 * - /Fotos_Jugadores/Libres/ - Para jugadores libres
 *
 * ALGORITMO DE COINCIDENCIA:
 * 1. Coincidencia exacta (100% confianza)
 * 2. Coincidencia de primeras palabras (90% confianza)
 * 3. Contiene el nombre (80% confianza)
 * 4. Primera palabra coincide (70% confianza)
 *
 * NORMALIZACIÓN:
 * - Convierte a minúsculas
 * - Remueve acentos y caracteres especiales
 * - Ignora espacios extra
 */

// Función de prueba para verificar el emparejamiento (útil para desarrollo)
export const testPhotoMatching = async (): Promise<void> => {
  console.log('🧪 Probando sistema de emparejamiento de fotos...');

  const availablePhotos = getAvailablePhotos();
  console.log('📸 Fotos disponibles por club:', Object.keys(availablePhotos).map(club =>
    `${club}: ${availablePhotos[club].length} fotos`
  ).join(', '));

  // Obtener algunos jugadores reales para probar
  const players = await getPlayers();
  const testPlayers = players.slice(0, 10); // Primeros 10 jugadores

  console.log('\n🔍 Probando con jugadores reales:');
  testPlayers.forEach(player => {
    console.log(`\nJugador: ${player.name} (clubId: ${player.clubId || 'SIN CLUB'})`);

    // Determinar qué club debería usar
    let clubNameForPhotos = 'Libres'; // Default
    let photoPathPrefix = '/Fotos_Jugadores/Libres/';

    if (player.clubId === 'libre' || player.clubId === 'free' || !player.clubId) {
      clubNameForPhotos = 'Libres';
      photoPathPrefix = '/Fotos_Jugadores/Libres/';
    } else {
      // Buscar el nombre del club
      const mappedClubName = getClubNameById(player.clubId || '');
      if (mappedClubName && availablePhotos[mappedClubName]) {
        clubNameForPhotos = mappedClubName;
        photoPathPrefix = `/Fotos_Jugadores/${mappedClubName}/`;
        console.log(`  📍 Club mapeado: ${player.clubId} → ${mappedClubName}`);
      } else {
        console.log(`  ⚠️ Club no encontrado en fotos disponibles: ${player.clubId}`);
        return;
      }
    }

    const relevantPhotos = availablePhotos[clubNameForPhotos] || [];
    console.log(`  📸 Buscando en ${clubNameForPhotos} (${relevantPhotos.length} fotos disponibles)`);

    // Buscar coincidencia
    const match = findBestPhotoMatch(player.name, relevantPhotos);
    if (match) {
      const fullPath = `${photoPathPrefix}${match.photoName}`;
      console.log(`  ✅ COINCIDENCIA: ${match.photoName} → ${fullPath} (${(match.confidence * 100).toFixed(0)}% confianza)`);
    } else {
      console.log(`  ❌ SIN COINCIDENCIA - Fotos disponibles: ${relevantPhotos.slice(0, 3).join(', ')}${relevantPhotos.length > 3 ? '...' : ''}`);
    }
  });

  console.log('\n✅ Prueba completada');
};

// Export the savePlayers function
export { savePlayers };
