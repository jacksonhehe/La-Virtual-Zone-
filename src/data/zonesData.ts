import { clubs, leagueStandings } from './mockData';

// Interface para datos de equipo en zona
export interface ZoneTeamData {
  id: string;
  nombre: string;
  escudoUrl: string;
  pj: number;
  pg: number;
  pe: number;
  pp: number;
  gf: number;
  gc: number;
}

// Interface para datos calculados de standings en zona
export interface ZoneStanding extends ZoneTeamData {
  pts: number;
  dg: number;
  porcentaje: number;
  position?: number;
}

// Datos base de equipos distribuidos en 4 zonas (Liga A, B, C, D) segÃºn orden especÃ­fico
const buildZonesData = (): Record<string, ZoneTeamData[]> => {
  const zones: Record<string, ZoneTeamData[]> = { A: [], B: [], C: [], D: [] };

  // Map standings by clubId for quick lookup
  const standingByClubId = new Map<string, {
    played: number; won: number; drawn: number; lost: number; goalsFor: number; goalsAgainst: number;
  }>();
  (leagueStandings || []).forEach(s => {
    standingByClubId.set(s.clubId, {
      played: s.played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      goalsFor: s.goalsFor,
      goalsAgainst: s.goalsAgainst
    });
  });

  // Orden deseado por nombres (normalizados). Si algún nombre no existe, se ignora.
  const desiredOrder: Record<'A' | 'B' | 'C' | 'D', string[]> = {
    A: [
      'Alianza Lima',
      'Real Madrid',
      'Melgar',
      'Lunatics FC',
      'Los Terribles FC',
      'La Tobyneta',
      'Kod FC',
      'Granate',
      'Club Atletico Libertadores',
      'Mar del Callao',
      'El Cadu',
      'Universitario de Peru'
    ],
    B: [
      'Alianza Atletico Sullana',
      'San Martin de Tolosa',
      'Sahur FC',
      'Riverpool',
      'Nacional',
      'Manchester City',
      'Los Guerreros del Rosario',
      'La Cumbre FC',
      'Elijo Creer',
      'Barcelona SC',
      'Avengers',
      'U de Chile'
    ],
    C: [
      'Deportes Provincial Osorno',
      'River Plate',
      'Peritas FC',
      'Peñarol',
      'Los Villeros del Saca',
      'Liverpool',
      'La Cuarta',
      'La Barraca',
      'God Sport',
      'Furia Verde',
      'Estudiantes de La Plata',
      'Señor de los Milagros'
    ],
    D: [
      'Atlanta',
      'Sporting Cristal',
      'San Francisco',
      'Quilmes',
      'Pibe de Oro',
      'Liga de Quito',
      'Jackson FC',
      'El Santo Tucumano',
      'Comando Sur',
      'Club Atletico Ituzaingó',
      'Beast FC',
      'Union Milagro'
    ]
  };

  const normalize = (s: string) =>
    (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const getOrderedClubs = (keys: string[]) => {
    const used = new Set<string>();
    const found = keys
      .map(name => clubs.find(c => normalize(c.name) === normalize(name)))
      .filter((c): c is typeof clubs[number] => !!c)
      .filter(c => {
        if (used.has(c.id)) return false;
        used.add(c.id);
        return true;
      });

    // Si faltan clubes para completar 12, completar con el orden original (sin duplicados)
    const perZone = 12;
    if (found.length < perZone) {
      for (const c of clubs) {
        if (found.length >= perZone) break;
        if (!used.has(c.id)) {
          found.push(c);
          used.add(c.id);
        }
      }
    }
    return found.slice(0, 12);
  };

  const perZone = 12; // 12 equipos por zona

  zones.A = getOrderedClubs(desiredOrder.A).map(club => {
    const st = standingByClubId.get(club.id);
    const pj = st?.played ?? 0;
    const pg = st?.won ?? 0;
    const pe = st?.drawn ?? 0;
    const pp = st?.lost ?? 0;
    const gf = st?.goalsFor ?? 0;
    const gc = st?.goalsAgainst ?? 0;
    return {
      id: club.id,
      nombre: club.name,
      escudoUrl: club.logo,
      pj, pg, pe, pp, gf, gc
    };
  });

  zones.B = getOrderedClubs(desiredOrder.B).map(club => {
    const st = standingByClubId.get(club.id);
    const pj = st?.played ?? 0;
    const pg = st?.won ?? 0;
    const pe = st?.drawn ?? 0;
    const pp = st?.lost ?? 0;
    const gf = st?.goalsFor ?? 0;
    const gc = st?.goalsAgainst ?? 0;
    return {
      id: club.id,
      nombre: club.name,
      escudoUrl: club.logo,
      pj, pg, pe, pp, gf, gc
    };
  });

  zones.C = getOrderedClubs(desiredOrder.C).map(club => {
    const st = standingByClubId.get(club.id);
    const pj = st?.played ?? 0;
    const pg = st?.won ?? 0;
    const pe = st?.drawn ?? 0;
    const pp = st?.lost ?? 0;
    const gf = st?.goalsFor ?? 0;
    const gc = st?.goalsAgainst ?? 0;
    return {
      id: club.id,
      nombre: club.name,
      escudoUrl: club.logo,
      pj, pg, pe, pp, gf, gc
    };
  });

  zones.D = getOrderedClubs(desiredOrder.D).map(club => {
    const st = standingByClubId.get(club.id);
    const pj = st?.played ?? 0;
    const pg = st?.won ?? 0;
    const pe = st?.drawn ?? 0;
    const pp = st?.lost ?? 0;
    const gf = st?.goalsFor ?? 0;
    const gc = st?.goalsAgainst ?? 0;
    return {
      id: club.id,
      nombre: club.name,
      escudoUrl: club.logo,
      pj, pg, pe, pp, gf, gc
    };
  });

  return zones;
};

export const zonesData: Record<string, ZoneTeamData[]> = buildZonesData();

// FunciÃ³n para calcular standings de una zona
export function calculateZoneStandings(zoneData: ZoneTeamData[]): (ZoneStanding & { position: number })[] {
  return zoneData.map((team, originalIndex) => {
    const pts = (team.pg * 3) + (team.pe * 1);
    const dg = team.gf - team.gc;
    const porcentaje = team.pj > 0 ? (pts / (team.pj * 3)) * 100 : 0;

    return {
      ...team,
      pts,
      dg,
      porcentaje,
      originalOrder: originalIndex, // Mantener el orden original de los equipos
      position: 0 // Temporal, se actualizarÃ¡ despuÃ©s del ordenamiento
    };
  }).sort((a, b) => {
    // Orden: PTS desc, luego DG desc, luego GF desc, luego orden original
    if (a.pts !== b.pts) return b.pts - a.pts;
    if (a.dg !== b.dg) return b.dg - a.dg;
    if (a.gf !== b.gf) return b.gf - a.gf;
    // Si todo es igual, mantener el orden original de los equipos en la zona
    return (a as any).originalOrder - (b as any).originalOrder;
  }).map((team, index) => ({
    ...team,
    position: index + 1
  }));
}

// FunciÃ³n para obtener el color de fondo segÃºn la posiciÃ³n
export function getPositionColor(position: number): string {
  if (position >= 1 && position <= 3) return 'green'; // Ascenso a Primera
  if (position >= 4 && position <= 6) return 'light-blue'; // Ascenso a Segunda
  if (position >= 7 && position <= 9) return 'orange'; // Ascenso a Tercera
  if (position >= 10 && position <= 12) return 'red'; // Descenso a Cuarta
  return 'gray';
}

// FunciÃ³n para obtener el nombre de la zona
export function getZoneName(zoneKey: string): string {
  const zoneNames: Record<string, string> = {
    A: 'Liga A',
    B: 'Liga B',
    C: 'Liga C',
    D: 'Liga D'
  };
  return zoneNames[zoneKey] || zoneKey;
}

// FunciÃ³n para obtener standings calculados de todas las zonas
export function getAllZoneStandings(): Record<string, (ZoneStanding & { position: number })[]> {
  const result: Record<string, (ZoneStanding & { position: number })[]> = {};

  Object.keys(zonesData).forEach(zoneKey => {
    result[zoneKey] = calculateZoneStandings(zonesData[zoneKey]);
  });

  return result;
}

