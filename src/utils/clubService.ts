import { Club } from '../types';
import { clubs as seedClubs } from '../data/mockData';
import { dbService } from './indexedDBService';

const CLUBS_STORE = 'clubs';

const getClubs = async (): Promise<Club[]> => {
  try {
    const clubs = await dbService.getAll<Club>(CLUBS_STORE);
    console.log(`ðŸ“Š getClubs: Encontrados ${clubs.length} clubes en IndexedDB`);

    if (clubs.length === 0) {
      console.log('ðŸ“ La BD estÃ¡ vacÃ­a, verificando si hay datos previos guardados...');

      // Check if we have any clubs saved before (avoid reinitializing if there were user changes)
      const hasPreviousData = localStorage.getItem('virtual_zone_clubs_updated') === 'true';

      if (hasPreviousData) {
        console.warn('âš ï¸ ADVERTENCIA: La BD estÃ¡ vacÃ­a pero habÃ­a datos previos. Intentando recuperar...');

        // Try to reinitialize from localStorage backup if available (try lightweight backup first)
        const backupClubsLight = localStorage.getItem('virtual_zone_clubs_backup_light');
        const backupClubsFull = localStorage.getItem('virtual_zone_clubs_backup');

        if (backupClubsLight) {
          try {
            const parsedClubs = JSON.parse(backupClubsLight);
            if (parsedClubs.length > 0) {
              // Convert lightweight backup to full clubs by merging with seed data
              const restoredClubs = parsedClubs.map((lightClub: any) => {
                const seedClub = seedClubs.find((sc: any) => sc.id === lightClub.id);
                return {
                  ...seedClub, // Start with seed data
                  ...lightClub // Override with backed up changes
                };
              }).filter((club: any) => club !== undefined);

              console.log(`ðŸ”„ Recuperando ${restoredClubs.length} clubes desde backup ligero`);
              await dbService.putMany(CLUBS_STORE, restoredClubs as Club[]);
              return restoredClubs as Club[];
            }
          } catch (backupError) {
            console.error('âŒ Error recuperando backup ligero:', backupError);
          }
        }

        if (backupClubsFull) {
          try {
            const parsedClubs = JSON.parse(backupClubsFull);
            if (parsedClubs.length > 0) {
              console.log(`ðŸ”„ Recuperando ${parsedClubs.length} clubes desde backup completo`);
              await dbService.putMany(CLUBS_STORE, parsedClubs);
              return parsedClubs;
            }
          } catch (backupError) {
            console.error('âŒ Error recuperando backup completo:', backupError);
          }
        }

        // If no backup, still initialize but warn user
        console.log('âš ï¸ No se pudo recuperar backup. Inicializando con datos seed (pueden perderse cambios)');
      }

      // Initialize with seed data if empty
      await dbService.putMany(CLUBS_STORE, seedClubs as unknown as Club[]);
      console.log(`âœ… Inicializados ${seedClubs.length} clubes desde datos seed`);
      return seedClubs as unknown as Club[];
    }

    // Verify we have reasonable number of clubs (not too few, not corrupted)
    if (clubs.length < 10) {
      console.warn(`âš ï¸ ADVERTENCIA: Solo se encontraron ${clubs.length} clubes (esperados ~48)`);
      console.warn('Esto podrÃ­a indicar datos corruptos. Considera usar forceUpdateClubs()');
    }

    return clubs;
  } catch (error) {
    console.error('âŒ Error crÃ­tico getting clubs from IndexedDB:', error);

    // Try to recover from localStorage as last resort
    try {
      const backupClubs = localStorage.getItem('virtual_zone_clubs_backup');
      if (backupClubs) {
        const parsedClubs = JSON.parse(backupClubs);
        console.log(`ðŸ”„ Recuperando ${parsedClubs.length} clubes desde backup localStorage`);
        return parsedClubs;
      }
    } catch (backupError) {
      console.error('âŒ Error recuperando backup de localStorage:', backupError);
    }

    // Only use seed data as absolute last resort, and warn heavily
    console.error('ðŸš¨ ULTIMO RECURSO: Usando datos seed (POSIBLE PÃ‰RDIDA DE CAMBIOS)');
    console.error('ðŸ’¡ RecomendaciÃ³n: Revisa la consola para errores de IndexedDB');

    // INTENTAR PRESERVAR ASIGNACIONES DE CLUB EN PLAYERS ANTES DE PERDERLOS
    try {
      console.log('ðŸ”„ Intentando preservar asignaciones de club en players...');

      // Importar dinÃ¡micamente para evitar dependencias circulares
      const { listPlayers } = await import('./playerService');

      const players = await listPlayers();
      const playersWithClubAssignments = players.filter(p => p.clubId);

      if (playersWithClubAssignments.length > 0) {
        console.log(`ðŸ“Š Encontrados ${playersWithClubAssignments.length} players con asignaciones de club`);

        // Crear un mapa de clubId -> lista de players
        const clubAssignments = {};
        playersWithClubAssignments.forEach(player => {
          if (!clubAssignments[player.clubId]) {
            clubAssignments[player.clubId] = [];
          }
          clubAssignments[player.clubId].push(player.name);
        });

        console.log('ðŸŽ¯ Asignaciones de club preservadas:');
        Object.entries(clubAssignments).forEach(([clubId, playerNames]) => {
          const clubName = seedClubs.find(c => c.id === clubId)?.name || 'Club desconocido';
          console.log(`   ${clubName} (${clubId}): ${(playerNames as string[]).length} players`);
        });

        console.log('âš ï¸ IMPORTANTE: Las asignaciones se perderÃ¡n al usar datos seed');
        console.log('ðŸ’¡ RecomendaciÃ³n: No recargues la pÃ¡gina despuÃ©s de importar hasta verificar que los datos se guardaron correctamente');
      }
    } catch (preserveError) {
      console.error('âŒ Error intentando preservar asignaciones:', preserveError);
    }

    return seedClubs as unknown as Club[];
  }
};

// Create automatic backup before saving
const createClubsBackup = (clubs: Club[]): void => {
  try {
    // Only backup if we have a reasonable number of clubs (avoid backing up empty/invalid data)
    if (clubs.length >= 10) {
      // Create a lightweight backup with only essential fields to save space
      const lightweightBackup = clubs.map(club => ({
        id: club.id,
        name: club.name,
        budget: club.budget,
        manager: club.manager,
        playStyle: club.playStyle,
        primaryColor: club.primaryColor,
        secondaryColor: club.secondaryColor,
        foundedYear: club.foundedYear,
        stadium: club.stadium,
        reputation: club.reputation,
        fanBase: club.fanBase
      }));

      // Try to save the lightweight backup first
      try {
        localStorage.setItem('virtual_zone_clubs_backup_light', JSON.stringify(lightweightBackup));
        console.log(`ðŸ’¾ Backup ligero creado: ${clubs.length} clubes guardados en localStorage`);
      } catch (lightError) {
        // If lightweight backup fails, try to clean up old data and retry
        console.warn('âš ï¸ Backup ligero fallÃ³, limpiando datos antiguos...');
        try {
          // Remove old backup data
          localStorage.removeItem('virtual_zone_clubs_backup');
          localStorage.removeItem('virtual_zone_clubs_backup_light');

          // Try again with lightweight backup
          localStorage.setItem('virtual_zone_clubs_backup_light', JSON.stringify(lightweightBackup));
          console.log(`ðŸ’¾ Backup ligero recreado despuÃ©s de limpieza: ${clubs.length} clubes`);
        } catch (retryError) {
          console.warn('âš ï¸ No se pudo crear backup ligero ni despuÃ©s de limpieza:', retryError);
        }
      }
    }
  } catch (error) {
    console.warn('âš ï¸ Error general en backup de clubes:', error);
  }
};

export const saveClubs = async (clubs: Club[]): Promise<void> => {
  try {
    console.log(`ðŸ’¾ Guardando ${clubs.length} clubes en IndexedDB...`);

    // Create backup before saving (safety net)
    createClubsBackup(clubs);

    // Clear existing data
    await dbService.clear(CLUBS_STORE);
    console.log('ðŸ—‘ï¸ Datos existentes limpiados');

    // Save all clubs in batch
    await dbService.putMany(CLUBS_STORE, clubs);
    console.log(`âœ… ${clubs.length} clubes guardados exitosamente`);

    // Verify the save was successful
    const savedCount = await dbService.count(CLUBS_STORE);
    console.log(`ðŸ” VerificaciÃ³n: ${savedCount} clubes en la base de datos`);

    if (savedCount !== clubs.length) {
      console.warn(`âš ï¸ ADVERTENCIA: Se intentaron guardar ${clubs.length} clubes pero la BD tiene ${savedCount}`);
      throw new Error(`Discrepancia en guardado: esperado ${clubs.length}, guardado ${savedCount}`);
    }

    // Mark as successfully updated
    localStorage.setItem('virtual_zone_clubs_updated', 'true');

  } catch (error) {
    console.error('âŒ Error saving clubs to IndexedDB:', error);
    throw error;
  }
};

export const listClubs = async (): Promise<Club[]> => await getClubs();
// Merge helper: preserve customized fields (like logo) when reseeding
export const mergeClubsPreservingCustom = (existing: Club[], seeds: Club[]): Club[] => {
  const byId = new Map(existing.map(c => [c.id, c] as const));
  const byName = new Map(existing.map(c => [c.name.toLowerCase(), c] as const));

  const mergeOne = (seed: Club): Club => {
    const match = byId.get(seed.id) || byName.get(seed.name.toLowerCase());
    if (!match) return seed;
    return {
      ...seed,
      // Preserve admin customizations when present
      logo: match.logo || seed.logo,
      manager: match.manager ?? seed.manager,
      budget: typeof match.budget === 'number' ? match.budget : seed.budget,
      playStyle: match.playStyle || seed.playStyle,
      primaryColor: match.primaryColor || seed.primaryColor,
      secondaryColor: match.secondaryColor || seed.secondaryColor,
      description: match.description || seed.description,
      foundedYear: typeof match.foundedYear === 'number' ? match.foundedYear : seed.foundedYear,
      stadium: match.stadium || seed.stadium,
      titles: (Array.isArray(match.titles) && match.titles.length > 0) ? match.titles : seed.titles,
      reputation: typeof match.reputation === 'number' ? match.reputation : seed.reputation,
      fanBase: typeof match.fanBase === 'number' ? match.fanBase : seed.fanBase,
    } as Club;
  };

  // Keep all seed clubs, merged with existing data when available
  const merged = seeds.map(mergeOne);

  // Include any user-created clubs that are not in seeds
  for (const club of existing) {
    const alreadyIn = merged.find(c => c.id === club.id || c.name.toLowerCase() === club.name.toLowerCase());
    if (!alreadyIn) merged.push(club);
  }

  return merged;
};


export const createClub = async (data: Partial<Club> & { name: string; logo?: string }): Promise<Club> => {
  const clubs = await getClubs();
  const id = `club-${Date.now()}`;
  const club: Club = {
    id,
    name: data.name.trim(),
    logo: data.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=111827&color=fff&size=128&bold=true`,
    foundedYear: data.foundedYear ?? new Date().getFullYear(),
    stadium: data.stadium ?? '',
    budget: data.budget ?? 0,
    manager: data.manager ?? '',
    playStyle: data.playStyle ?? 'Equilibrado',
    primaryColor: data.primaryColor ?? '#ffffff',
    secondaryColor: data.secondaryColor ?? '#000000',
    description: data.description ?? '',
    titles: data.titles ?? [],
    reputation: data.reputation ?? 0,
    fanBase: data.fanBase ?? 0,
  };
  clubs.push(club);
  await saveClubs(clubs);

  // Auto-sync to Supabase if enabled
  await syncClubToSupabase(club);

  return club;
};

// Auto-sync club to Supabase if enabled
const syncClubToSupabase = async (club: Club): Promise<void> => {
  try {
    // Import config dynamically
    const { config } = await import('../lib/config');

    if (!config.useSupabase) {
      console.log('⏭️ Modo offline - saltando sincronización de club a Supabase');
      return;
    }

    // Import Supabase client
    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    console.log('ClubService: Syncing club to Supabase:', club.id);

    const { error } = await supabase
      .from('clubs')
      .upsert({
        id: club.id,
        name: club.name,
        logo: club.logo,
        foundedYear: club.foundedYear,
        stadium: club.stadium,
        budget: club.budget,
        manager: club.manager,
        playStyle: club.playStyle,
        primaryColor: club.primaryColor,
        secondaryColor: club.secondaryColor,
        description: club.description,
        reputation: club.reputation,
        fanBase: club.fanBase,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.error('ClubService: Error syncing club to Supabase:', error);
      throw error;
    }

    console.log('ClubService: Club synced to Supabase successfully:', club.id);

  } catch (error) {
    console.error('ClubService: Error syncing club to Supabase:', error);
    throw error;
  }
};

export const updateClub = async (club: Club): Promise<Club> => {
  try {
    console.log(`ðŸ’¾ Actualizando club especÃ­fico: ${club.name} (${club.id})`);

    // Create backup before updating (safety net)
    const allClubs = await getClubs();
    createClubsBackup(allClubs);

    // Update only this specific club
    await dbService.update(CLUBS_STORE, club);

    // Verify the update was successful
    const updatedClub = await dbService.get<Club>(CLUBS_STORE, club.id);
    if (!updatedClub) {
      throw new Error(`No se pudo verificar la actualizaciÃ³n del club ${club.name}`);
    }

    console.log(`âœ… Club ${club.name} actualizado exitosamente`);

    // Auto-sync to Supabase if enabled
    await syncClubToSupabase(club);

    return club;

  } catch (error) {
    console.error('âŒ Error updating specific club:', error);

    // Try to restore from backup if update failed
    try {
      const backupClubsLight = localStorage.getItem('virtual_zone_clubs_backup_light');
      const backupClubsFull = localStorage.getItem('virtual_zone_clubs_backup');

      if (backupClubsLight) {
        const parsedClubs = JSON.parse(backupClubsLight);
        // Convert lightweight backup to full clubs
        const restoredClubs = parsedClubs.map((lightClub: any) => {
          const seedClub = seedClubs.find((sc: any) => sc.id === lightClub.id);
          return {
            ...seedClub, // Start with seed data
            ...lightClub // Override with backed up changes
          };
        }).filter((club: any) => club !== undefined);

        console.log('ðŸ”„ Restaurando desde backup ligero despuÃ©s de error de actualizaciÃ³n');
        await saveClubs(restoredClubs as Club[]);
      } else if (backupClubsFull) {
        const parsedClubs = JSON.parse(backupClubsFull);
        console.log('ðŸ”„ Restaurando desde backup completo despuÃ©s de error de actualizaciÃ³n');
        await saveClubs(parsedClubs);
      }
    } catch (backupError) {
      console.error('âŒ Error restaurando backup:', backupError);
    }

    throw error;
  }
};

export const deleteClub = async (id: string): Promise<void> => {
  const clubs = await getClubs();
  const remaining = clubs.filter(c => c.id !== id);
  await saveClubs(remaining);

  // Sync deletion to Supabase if enabled
  try {
    const { config } = await import('../lib/config');
    if (config.useSupabase) {
      const { getSupabaseClient } = await import('../lib/supabase');
      const supabase = getSupabaseClient();

      console.log('ClubService: Deleting club from Supabase:', id);

      const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('ClubService: Error deleting club from Supabase:', error);
      } else {
        console.log('ClubService: Club deleted from Supabase successfully:', id);
      }
    }
  } catch (error) {
    console.error('ClubService: Error syncing club deletion to Supabase:', error);
  }
};


// Fetch clubs directly from Supabase and map to Club[] (read-only helper)
export const fetchClubsFromSupabase = async (): Promise<Club[]> => {
  try {
    const { config } = await import('../lib/config');
    if (!config.useSupabase) {
      // Fall back to local IndexedDB if Supabase mode is off
      const local = await dbService.getAll<Club>(CLUBS_STORE);
      return local;
    }

    const { getSupabaseClient } = await import('../lib/supabase');
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('clubs')
      .select('*');

    if (error) throw error;
    const rows: any[] = data || [];

    const mapped: Club[] = rows.map((r: any) => ({
      id: r.id,
      name: r.name,
      logo: r.logo,
      foundedYear: r.foundedyear ?? r.foundedYear ?? undefined,
      stadium: r.stadium ?? '',
      budget: r.budget ?? 0,
      manager: r.manager ?? '',
      playStyle: r.playstyle ?? r.playStyle ?? 'Equilibrado',
      primaryColor: r.primarycolor ?? r.primaryColor ?? '#ffffff',
      secondaryColor: r.secondarycolor ?? r.secondaryColor ?? '#000000',
      description: r.description ?? '',
      titles: r.titles ?? [],
      reputation: r.reputation ?? 0,
      fanBase: r.fanbase ?? r.fanBase ?? 0,
    }));

    return mapped;
  } catch (e) {
    console.error('ClubService: fetchClubsFromSupabase failed:', e);
    try {
      const local = await dbService.getAll<Club>(CLUBS_STORE);
      return local;
    } catch {
      return [] as Club[];
    }
  }
};

