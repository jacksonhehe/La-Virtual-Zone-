import { slugify } from './slugify';
import { getTournaments, saveTournaments } from './sharedStorage';
import { Tournament } from '../types';

/**
 * Corrige los torneos existentes que no tienen slug
 * Añade el campo slug basado en el nombre del torneo
 */
export const fixTournamentsSlug = (): void => {
  try {
    const tournaments = getTournaments() as Tournament[];
    let hasChanges = false;

    const fixedTournaments = tournaments.map(tournament => {
      let changed = false;
      const fixed = { ...tournament };
      // Si el torneo no tiene slug, lo generamos
      if (!tournament.slug) {
        fixed.slug = slugify(tournament.name);
        changed = true;
      }
      // Asegurar que todos los torneos tengan el campo participants como array. Si no existe, añadir participants: [].
      if (!Array.isArray(tournament.participants)) {
        fixed.participants = [];
        changed = true;
      }
      if (changed) hasChanges = true;
      return fixed;
    });

    // Solo guardamos si hubo cambios
    if (hasChanges) {
      saveTournaments(fixedTournaments);
      console.log('✅ Torneos corregidos: Se añadieron slugs faltantes');
      
      // Mostrar los torneos corregidos
      const correctedTournaments = fixedTournaments.filter(t => !tournaments.find(ot => ot.slug === t.slug));
      if (correctedTournaments.length > 0) {
        console.log('📋 Torneos corregidos:');
        correctedTournaments.forEach(t => {
          console.log(`  - "${t.name}" → slug: "${t.slug}"`);
        });
      }
    } else {
      console.log('✅ Todos los torneos ya tienen slug válido');
    }
  } catch (error) {
    console.error('❌ Error al corregir torneos:', error);
  }
};

/**
 * Verifica que todos los torneos tengan slug válido
 */
export const validateTournamentsSlug = (): boolean => {
  try {
    const tournaments = getTournaments() as Tournament[];
    const invalidTournaments = tournaments.filter(t => !t.slug);

    if (invalidTournaments.length > 0) {
      console.log('⚠️ Torneos sin slug encontrados:');
      invalidTournaments.forEach(t => {
        console.log(`  - "${t.name}" (ID: ${t.id})`);
      });
      return false;
    }

    console.log('✅ Todos los torneos tienen slug válido');
    return true;
  } catch (error) {
    console.error('❌ Error al validar torneos:', error);
    return false;
  }
};

/**
 * Ejecuta la corrección automáticamente al importar
 */
if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador
  setTimeout(() => {
    if (!validateTournamentsSlug()) {
      fixTournamentsSlug();
    }
  }, 1000);
} 