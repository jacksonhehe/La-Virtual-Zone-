import type { Player, Club, Standing } from '../types';
import { useDataStore } from '../store/dataStore';

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
    transfer_value: player.transferValue || 0,
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

const syncPlayersBatchToSupabase = async (players: Player[]): Promise<void> => {
  if (!players.length) {
    return;
  }

  try {
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('MarketRules: Supabase sync disabled, skipping batch sync...');
      return;
    }

    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    console.log(`MarketRules: Syncing ${players.length} jugadores con Supabase en lotes...`);
    const chunkSize = 100;
    for (let i = 0; i < players.length; i += chunkSize) {
      const chunk = players.slice(i, i + chunkSize).map(mapPlayerToSupabaseRow);
      const { error } = await supabase.from('players').upsert(chunk, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      console.log(`MarketRules: Lote ${Math.min(i + chunkSize, players.length)} / ${players.length} sincronizado`);
    }

    console.log('MarketRules: Sincronización en lotes completada');
  } catch (error) {
    console.error('MarketRules: Failed to sync players batch to Supabase:', error);
  }
};

export interface ValuationInfo {
  marketValue: number;
  minTransferFee: number; // 80% del valor de mercado
  salaryRange: { min: number; max: number };
  releaseClause: number;
}

export function computeValuation(player: Player): ValuationInfo {
  const marketValue = Math.max(0, player.transferValue || 0);

  // Rango salarial sugerido según media del jugador
  // Valores aproximados pensados para la economía actual de la app
  let salaryMin = 200_000;
  let salaryMax = 500_000;
  if (player.overall >= 75 && player.overall <= 79) {
    salaryMin = 500_000; salaryMax = 1_500_000;
  } else if (player.overall >= 80 && player.overall <= 84) {
    salaryMin = 1_500_000; salaryMax = 3_000_000;
  } else if (player.overall >= 85 && player.overall <= 89) {
    salaryMin = 3_000_000; salaryMax = 6_000_000;
  } else if (player.overall >= 90) {
    salaryMin = 6_000_000; salaryMax = 12_000_000;
  }

  // Cláusula de rescisión base (multiplicador por nivel)
  const releaseMultiplier = player.overall >= 90 ? 2.0 : player.overall >= 85 ? 1.6 : player.overall >= 80 ? 1.4 : 1.2;

  return {
    marketValue,
    minTransferFee: Math.round(marketValue * 0.8),
    salaryRange: { min: Math.round(salaryMin), max: Math.round(salaryMax) },
    releaseClause: Math.round(marketValue * releaseMultiplier),
  };
}

export function isFreeAgent(player: Player): boolean {
  // Heurística: sin club válido o valor de transferencia 0 y listado para transfer
  // Ajustar si en el futuro se usa un identificador concreto para agentes libres
  return !player.clubId || player.clubId === 'free' || player.clubId === 'libre' || player.transferValue === 0;
}

export interface OfferValidationResult { ok: boolean; reason?: string; }

export function validateOfferBasics(params: {
  player: Player;
  buyer: Club;
  seller?: Club | null;
  amount: number;
  standings?: Standing[];
}): OfferValidationResult {
  const { player, buyer, amount, standings } = params;
  const free = isFreeAgent(player);
  const { minTransferFee } = computeValuation(player);

  // Presupuesto suficiente para el fee
  if (buyer.budget < amount) return { ok: false, reason: 'Presupuesto insuficiente para la oferta' };

  // Mínimo 80% del valor salvo libre (libre permite 0)
  if (!free && amount < minTransferFee) {
    return { ok: false, reason: `La oferta mínima es ${minTransferFee.toLocaleString('es-ES')} (80% del valor)` };
  }

  // Regla jugadores élite: OVR > 90
  if (false && player.overall > 90) {
    const sorted = standings && [...standings].sort((a, b) => b.points - a.points);
    const rank = sorted ? (sorted.findIndex(s => s.clubId === buyer.id) + 1) : -1;
    const competitiveEnough = (rank > 0 && rank <= 4) || buyer.reputation >= 80;
    if (!competitiveEnough) return { ok: false, reason: 'El jugador solo acepta clubes competitivos o de alta reputación' };
  }

  return { ok: true };
}

export function computeWeeklyWindow(): { fromISO: string; toISO: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - 7);
  return { fromISO: from.toISOString(), toISO: to.toISOString() };
}

function getYearWeek(d: Date): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Thursday in current week decides the year.
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Aplica bonos por victoria (15M) una vez por semana según partidos terminados en la última semana
export function applyWeeklyVictoryBonusesIfNeeded(): { applied: number } {
  const LAST_KEY = 'virtual_zone_last_victory_bonus_week';
  const lastApplied = localStorage.getItem(LAST_KEY) || '';
  const currentWeek = getYearWeek(new Date());
  if (lastApplied === currentWeek) return { applied: 0 };

  const { tournaments, clubs, updateClubs } = useDataStore.getState() as any;
  const { fromISO } = computeWeeklyWindow();
  const fromTs = new Date(fromISO).getTime();

  let bonusesApplied = 0;
  const earnMap: Record<string, number> = {};

  (tournaments || []).forEach((t: any) => {
    (t.matches || []).forEach((m: any) => {
      if (m.status === 'finished' && typeof m.homeScore === 'number' && typeof m.awayScore === 'number') {
        const when = m.date ? new Date(m.date).getTime() : 0;
        if (when >= fromTs) {
          const winner = m.homeScore > m.awayScore ? m.homeTeam : (m.awayScore > m.homeScore ? m.awayTeam : null);
          if (winner) {
            earnMap[winner] = (earnMap[winner] || 0) + 15_000_000;
          }
        }
      }
    });
  });

  if (Object.keys(earnMap).length > 0) {
    const nextClubs = (clubs || []).map((c: Club) => {
      const add = earnMap[c.name] || 0;
      if (add > 0) bonusesApplied++;
      return add > 0 ? { ...c, budget: c.budget + add } : c;
    });
    updateClubs(nextClubs);
  }

  localStorage.setItem(LAST_KEY, currentWeek);
  return { applied: bonusesApplied };
}

// Función para calcular valor de mercado según tabla de mercado
export function calculateMarketValueByRating(rating: number): number {
  // Tabla de valores de mercado según valoración (de la página MarketTables)
  const marketValueTable: Record<number, number> = {
    72: 20_000_000, 73: 20_000_000, 74: 20_000_000, 75: 20_000_000,
    76: 32_000_000, 77: 36_000_000, 78: 50_000_000, 79: 50_000_000,
    80: 59_000_000, 81: 83_000_000, 82: 92_000_000, 83: 116_000_000,
    84: 140_000_000, 85: 164_000_000, 86: 210_000_000, 87: 270_000_000,
    88: 300_000_000, 89: 350_000_000, 90: 500_000_000, 91: 600_000_000,
    92: 800_000_000, 93: 1_000_000_000, 94: 1_200_000_000, 95: 1_356_000_000,
    96: 1_600_000_000, 97: 1_818_000_000, 98: 2_018_000_000, 99: 2_648_000_000,
    100: 3_248_000_000, 101: 4_136_000_000
  };

  // Para valoraciones por debajo de 72 o por encima de 101, usar fórmula proporcional
  if (rating < 72) {
    return Math.max(1_000_000, marketValueTable[72] * (rating / 72));
  }

  if (rating > 101) {
    const base101 = marketValueTable[101];
    const incrementPerPoint = (marketValueTable[101] - marketValueTable[100]);
    return base101 + (incrementPerPoint * (rating - 101));
  }

  return marketValueTable[rating] || marketValueTable[72];
}

// Función para calcular salario según tabla de mercado
export function calculateSalaryByRating(rating: number): number {
  // Tabla de salarios según valoración (de la página MarketTables)
  const salaryTable: Record<number, number> = {
    72: 1_000_000, 73: 1_000_000, 74: 2_000_000, 75: 2_000_000,
    76: 4_000_000, 77: 4_000_000, 78: 4_000_000, 79: 4_000_000,
    80: 5_000_000, 81: 10_000_000, 82: 16_000_000, 83: 20_000_000,
    84: 24_000_000, 85: 26_000_000, 86: 30_000_000, 87: 35_000_000,
    88: 40_000_000, 89: 42_000_000, 90: 45_000_000, 91: 46_000_000,
    92: 46_000_000, 93: 48_000_000, 94: 50_000_000, 95: 67_000_000,
    96: 74_000_000, 97: 81_000_000, 98: 84_000_000, 99: 132_000_000,
    100: 165_000_000, 101: 206_000_000
  };

  // Para valoraciones por debajo de 72 o por encima de 101, usar fórmula proporcional
  if (rating < 72) {
    return Math.max(200_000, salaryTable[72] * (rating / 72));
  }

  if (rating > 101) {
    const base101 = salaryTable[101];
    const incrementPerPoint = (salaryTable[101] - salaryTable[100]);
    return base101 + (incrementPerPoint * (rating - 101));
  }

  return salaryTable[rating] || salaryTable[72];
}

// Funcion para calcular precio instantaneo de liberacion segun tabla de mercado
export function calculateReleasePriceByRating(rating: number): number {
  const releaseValueTable: Record<number, number> = {
    72: 8_000_000, 73: 8_000_000, 74: 8_000_000, 75: 8_000_000,
    76: 12_000_000, 77: 14_000_000, 78: 18_000_000, 79: 21_000_000,
    80: 22_000_000, 81: 26_000_000, 82: 30_000_000, 83: 38_000_000,
    84: 42_000_000, 85: 52_000_000, 86: 63_000_000, 87: 84_000_000,
    88: 112_000_000, 89: 146_000_000, 90: 178_000_000, 91: 207_000_000,
    92: 276_000_000, 93: 341_000_000, 94: 434_000_000, 95: 878_000_000,
    96: 897_000_000, 97: 987_000_000, 98: 1_048_000_000, 99: 1_323_000_000,
    100: 1_564_000_000, 101: 2_086_000_000
  };

  if (rating < 72) {
    return releaseValueTable[72];
  }

  if (rating > 101) {
    return releaseValueTable[101];
  }

  return releaseValueTable[rating] || releaseValueTable[72];
}

// Función para ajustar salarios de todos los jugadores según tabla de mercado
export async function adjustAllPlayerSalaries(): Promise<{ updated: number; totalCost: number }> {
  const { players, updatePlayers } = useDataStore.getState() as any;

  let updatedCount = 0;
  let totalCost = 0;
  let hasChanges = false;

  const updatedPlayers = players.map((player: any) => {
    if (!player.contract) {
      player.contract = { salary: 0, expires: new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000).toISOString() };
    }

    const currentSalary = player.contract.salary || 0;
    const newSalary = calculateSalaryByRating(player.overall);

    // Siempre actualizar según las tablas de mercado, sin importar el valor actual
    if (Math.abs(currentSalary - newSalary) > 1000) {
      hasChanges = true;
      updatedCount++;
      totalCost += newSalary;

      return {
        ...player,
        contract: {
          ...player.contract,
          salary: newSalary
        }
      };
    }

    return player;
  });

  if (hasChanges) {
    // Guardar cambios en IndexedDB mediante el datastore
    try {
      await updatePlayers(updatedPlayers);

      console.log(`✅ Salarios ajustados: ${updatedCount} jugadores actualizados según tablas de mercado`);
      console.log(`💰 Costo total anual: $${(totalCost / 1_000_000).toFixed(1)}M`);

      // Sync updated players to Supabase
      console.log('🔄 Sincronizando cambios de salarios con Supabase en lotes...');
      const playersToSync = updatedPlayers.filter(player => {
        const originalPlayer = players.find((p: any) => p.id === player.id);
        return originalPlayer && Math.abs((originalPlayer.contract?.salary || 0) - (player.contract?.salary || 0)) > 1000;
      });

      await syncPlayersBatchToSupabase(playersToSync);
      console.log(`✅ Sincronización con Supabase completada para ${playersToSync.length} jugadores`);

    } catch (error) {
      console.error('❌ Error al guardar salarios ajustados:', error);
    }
  } else {
    console.log(`ℹ️ Todos los salarios ya están actualizados según las tablas de mercado`);
  }

  return { updated: updatedCount, totalCost };
}

// Función para ajustar valores de mercado de todos los jugadores según tabla de mercado
export async function adjustAllPlayerMarketValues(): Promise<{ updated: number; totalValue: number }> {
  const { players, updatePlayers } = useDataStore.getState() as any;

  let updatedCount = 0;
  let totalValue = 0;
  let hasChanges = false;

  const updatedPlayers = players.map((player: any) => {
    const currentValue = player.transferValue || 0;
    const newValue = calculateMarketValueByRating(player.overall);

    // Siempre actualizar según las tablas de mercado, sin importar el valor actual
    if (Math.abs(currentValue - newValue) > 100_000) {
      hasChanges = true;
      updatedCount++;
      totalValue += newValue;

      return {
        ...player,
        transferValue: newValue
      };
    }

    return player;
  });

  if (hasChanges) {
    // Guardar cambios en IndexedDB mediante el datastore
    try {
      await updatePlayers(updatedPlayers);

      console.log(`✅ Valores de mercado ajustados: ${updatedCount} jugadores actualizados según tablas de mercado`);
      console.log(`🏆 Valor total de mercado: $${(totalValue / 1_000_000).toFixed(1)}M`);

      // Sync updated players to Supabase
      console.log('🔄 Sincronizando cambios de valores de mercado con Supabase en lotes...');
      const playersToSync = updatedPlayers.filter(player => {
        const originalPlayer = players.find((p: any) => p.id === player.id);
        return originalPlayer && Math.abs((originalPlayer.transferValue || 0) - (player.transferValue || 0)) > 100_000;
      });

      await syncPlayersBatchToSupabase(playersToSync);
      console.log(`✅ Sincronización con Supabase completada para ${playersToSync.length} jugadores`);

    } catch (error) {
      console.error('❌ Error al guardar valores de mercado ajustados:', error);
    }
  } else {
    console.log(`ℹ️ Todos los valores de mercado ya están actualizados según las tablas de mercado`);
  }

  return { updated: updatedCount, totalValue };
}

// Función para ejecutar automáticamente el ajuste de salarios (solo para inicialización)
export function initializePlayerSalaries(): void {
  console.log('🔄 Inicializando ajuste de salarios según tablas de mercado...');

  const result = adjustAllPlayerSalaries();

  if (result.updated > 0) {
    console.log(`✅ AJUSTE COMPLETADO:`);
    console.log(`   • ${result.updated} jugadores con salarios actualizados`);
    console.log(`   • Costo total anual: $${(result.totalCost / 1_000_000).toFixed(1)}M`);
    console.log(`   • Salarios guardados en IndexedDB y estado global`);

    // Mostrar algunos ejemplos de cambios
    const { players } = useDataStore.getState() as any;
    const examples = players.slice(0, 3).filter((p: any) => p.contract?.salary);
    if (examples.length > 0) {
      console.log(`📋 EJEMPLOS DE CAMBIOS:`);
      examples.forEach((player: any) => {
        console.log(`   • ${player.name} (${player.overall} OVR): $${(player.contract.salary / 1_000_000).toFixed(1)}M`);
      });
    }
  } else {
    console.log(`ℹ️ Los salarios ya están actualizados según las tablas de mercado`);
  }
}

// Función para ejecutar automáticamente el ajuste de valores de mercado (solo para inicialización)
export function initializePlayerMarketValues(): void {
  console.log('🔄 Inicializando ajuste de valores de mercado según tablas de mercado...');

  const result = adjustAllPlayerMarketValues();

  if (result.updated > 0) {
    console.log(`✅ AJUSTE DE VALORES COMPLETADO:`);
    console.log(`   • ${result.updated} jugadores con valores de mercado actualizados`);
    console.log(`   • Valor total de mercado: $${(result.totalValue / 1_000_000).toFixed(1)}M`);
    console.log(`   • Valores guardados en IndexedDB y estado global`);

    // Mostrar algunos ejemplos de cambios
    const { players } = useDataStore.getState() as any;
    const examples = players.slice(0, 3).filter((p: any) => p.transferValue);
    if (examples.length > 0) {
      console.log(`📋 EJEMPLOS DE CAMBIOS:`);
      examples.forEach((player: any) => {
        console.log(`   • ${player.name} (${player.overall} OVR): $${(player.transferValue / 1_000_000).toFixed(1)}M`);
      });
    }
  } else {
    console.log(`ℹ️ Los valores de mercado ya están actualizados según las tablas de mercado`);
  }
}

// Función para inicializar ambos (salarios y valores de mercado)
export function initializePlayerMarketData(): void {
  console.log('🚀 Inicializando datos de mercado completos...');

  // Check if we need to update salaries
  const salaryKey = 'virtual_zone_salaries_updated';
  const salariesUpdated = localStorage.getItem(salaryKey);

  // Check if we need to update market values
  const marketValueKey = 'virtual_zone_market_values_updated';
  const marketValuesUpdated = localStorage.getItem(marketValueKey);

  if (!salariesUpdated) {
    initializePlayerSalaries();
    localStorage.setItem(salaryKey, 'true');
  }

  if (!marketValuesUpdated) {
    initializePlayerMarketValues();
    localStorage.setItem(marketValueKey, 'true');
  }

  if (salariesUpdated && marketValuesUpdated) {
    console.log('ℹ️ Todos los datos de mercado ya están actualizados');
  }
}

// Función para forzar actualización de salarios (útil para desarrollo)
export function forceSalaryUpdate(): void {
  console.log('🔄 Forzando actualización completa de salarios...');

  // Clear the salary update flag to force re-update
  localStorage.removeItem('virtual_zone_salaries_updated');

  // Execute the update
  initializePlayerSalaries();

  console.log('✅ Actualización forzada completada');
}

// Función para forzar actualización de valores de mercado (útil para desarrollo)
export function forceMarketValueUpdate(): void {
  console.log('🔄 Forzando actualización completa de valores de mercado...');

  // Clear the market value update flag to force re-update
  localStorage.removeItem('virtual_zone_market_values_updated');

  // Execute the update
  initializePlayerMarketValues();

  console.log('✅ Actualización forzada completada');
}

// Función para forzar actualización completa (útil para desarrollo)
export function forceCompleteMarketUpdate(): void {
  console.log('🔄 Forzando actualización completa de datos de mercado...');

  // Clear all flags to force re-update
  localStorage.removeItem('virtual_zone_salaries_updated');
  localStorage.removeItem('virtual_zone_market_values_updated');

  // Execute the update
  initializePlayerMarketData();

  console.log('✅ Actualización completa forzada');
}

// Función para verificar el estado actual de salarios (útil para debugging)
export function checkSalaryStatus(): void {
  const { players } = useDataStore.getState() as any;

  console.log('📊 ESTADO ACTUAL DE SALARIOS:');
  console.log(`Total de jugadores: ${players.length}`);

  let totalCost = 0;
  let byRating: Record<string, { count: number; totalSalary: number; avgSalary: number }> = {};

  players.forEach((player: any) => {
    if (player.contract?.salary) {
      const rating = player.overall.toString();
      const salary = player.contract.salary;

      totalCost += salary;

      if (!byRating[rating]) {
        byRating[rating] = { count: 0, totalSalary: 0, avgSalary: 0 };
      }

      byRating[rating].count++;
      byRating[rating].totalSalary += salary;
    }
  });

  // Calculate averages
  Object.keys(byRating).forEach(rating => {
    byRating[rating].avgSalary = byRating[rating].totalSalary / byRating[rating].count;
  });

  console.log(`💰 Costo total anual: $${(totalCost / 1_000_000).toFixed(1)}M`);
  console.log(`📈 Promedio por jugador: $${(totalCost / players.length / 1_000_000).toFixed(1)}M`);

  console.log('\n📋 SALARIOS POR VALORACIÓN:');
  Object.entries(byRating)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .forEach(([rating, data]) => {
      console.log(`   OVR ${rating}: ${data.count} jugadores | Promedio: $${(data.avgSalary / 1_000_000).toFixed(1)}M`);
    });

  // Check if salaries match market tables
  console.log('\n🔍 VERIFICACIÓN CON TABLA DE MERCADO:');
  let mismatches = 0;

  players.slice(0, 10).forEach((player: any) => { // Check first 10 players
    if (player.contract?.salary) {
      const expectedSalary = calculateSalaryByRating(player.overall);
      const currentSalary = player.contract.salary;
      const difference = Math.abs(currentSalary - expectedSalary);

      if (difference > 1000) {
        console.log(`   ⚠️ ${player.name} (${player.overall} OVR): Actual: $${(currentSalary / 1_000_000).toFixed(1)}M | Esperado: $${(expectedSalary / 1_000_000).toFixed(1)}M`);
        mismatches++;
      }
    }
  });

  if (mismatches === 0) {
    console.log('   ✅ Todos los salarios verificados están correctos según la tabla de mercado');
  } else {
    console.log(`   ⚠️ Encontradas ${mismatches} discrepancias en salarios`);
  }
}

// Función para verificar el estado actual de valores de mercado (útil para debugging)
export function checkMarketValueStatus(): void {
  const { players } = useDataStore.getState() as any;

  console.log('📊 ESTADO ACTUAL DE VALORES DE MERCADO:');
  console.log(`Total de jugadores: ${players.length}`);

  let totalValue = 0;
  let byRating: Record<string, { count: number; totalValue: number; avgValue: number }> = {};

  players.forEach((player: any) => {
    if (player.transferValue) {
      const rating = player.overall.toString();
      const value = player.transferValue;

      totalValue += value;

      if (!byRating[rating]) {
        byRating[rating] = { count: 0, totalValue: 0, avgValue: 0 };
      }

      byRating[rating].count++;
      byRating[rating].totalValue += value;
    }
  });

  // Calculate averages
  Object.keys(byRating).forEach(rating => {
    byRating[rating].avgValue = byRating[rating].totalValue / byRating[rating].count;
  });

  console.log(`🏆 Valor total de mercado: $${(totalValue / 1_000_000).toFixed(1)}M`);
  console.log(`📈 Promedio por jugador: $${(totalValue / players.length / 1_000_000).toFixed(1)}M`);

  console.log('\n📋 VALORES POR VALORACIÓN:');
  Object.entries(byRating)
    .sort(([a], [b]) => parseInt(b) - parseInt(a))
    .forEach(([rating, data]) => {
      console.log(`   OVR ${rating}: ${data.count} jugadores | Promedio: $${(data.avgValue / 1_000_000).toFixed(1)}M`);
    });

  // Check if market values match tables
  console.log('\n🔍 VERIFICACIÓN CON TABLA DE MERCADO:');
  let mismatches = 0;

  players.slice(0, 10).forEach((player: any) => { // Check first 10 players
    if (player.transferValue) {
      const expectedValue = calculateMarketValueByRating(player.overall);
      const currentValue = player.transferValue;
      const difference = Math.abs(currentValue - expectedValue);

      if (difference > 100_000) {
        console.log(`   ⚠️ ${player.name} (${player.overall} OVR): Actual: $${(currentValue / 1_000_000).toFixed(1)}M | Esperado: $${(expectedValue / 1_000_000).toFixed(1)}M`);
        mismatches++;
      }
    }
  });

  if (mismatches === 0) {
    console.log('   ✅ Todos los valores de mercado verificados están correctos según la tabla de mercado');
  } else {
    console.log(`   ⚠️ Encontradas ${mismatches} discrepancias en valores de mercado`);
  }
}

// Función para verificar el estado completo de datos de mercado
export function checkCompleteMarketStatus(): void {
  console.log('🎯 VERIFICACIÓN COMPLETA DE DATOS DE MERCADO');
  console.log('═'.repeat(50));

  checkSalaryStatus();
  console.log('\n' + '═'.repeat(50));
  checkMarketValueStatus();
}
