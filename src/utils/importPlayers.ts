import type { Player } from '../types/shared';

// Nota: Vite permite importar archivos como texto con ?raw
// El archivo debe existir en src/data/import_players.tsv
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rawTsv from '../data/import_players.tsv?raw';

function parseMillions(value: string): number {
  const v = (value || '').trim();
  if (!v) return 0;
  // 44M, 68M, 116M, 36M, 32M etc.
  const match = v.match(/([0-9]+(?:\.[0-9]+)?)\s*[mM]?/);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  // Si incluye M asumimos millones
  if (/m/i.test(v)) return Math.round(num * 1_000_000);
  return Math.round(num);
}

function parseNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, '').trim();
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function parseHeight(value: string): number {
  // '190cm' -> 190; '173kg' typo -> 173; fallback number
  if (!value) return 0;
  const m = value.match(/([0-9]{2,3})/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseWeight(value: string): number {
  // '84kg', '86klg' -> 84, 86
  if (!value) return 0;
  const m = value.match(/([0-9]{2,3})/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseLeg(value: string): 'left' | 'right' {
  const v = (value || '').toLowerCase();
  if (v.startsWith('iz')) return 'left';
  return 'right';
}

function normalizePosition(pos: string): string {
  // Mantener tal cual, pero normalizar mayúsculas inconsistentes
  return (pos || '').trim();
}

function valOr<T>(v: T | undefined | null, d: T): T { return (v as any) ?? d; }

export function parseImportedPlayersFromTSV(tsv: string): Player[] {
  if (!tsv) return [];
  const lines = tsv.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect header row (contains column names)
  const headerIdx = lines.findIndex(l => /nombre_jugador/i.test(l) || /apellido_jugador/i.test(l));
  const header = headerIdx >= 0 ? lines[headerIdx] : lines[0];
  const rows = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines.slice(1);

  const headers = header.split(/\t+/).map(h => h.trim().toLowerCase());

  function get(row: string[], key: string): string {
    const idx = headers.findIndex(h => h === key);
    return idx >= 0 ? (row[idx] || '').trim() : '';
  }

  const players: Player[] = [];

  rows.forEach(raw => {
    const cols = raw.split(/\t+/);
    if (cols.every(c => c.trim() === '')) return;

    const idRaw = get(cols, 'id') || get(cols, 'id_equipo');
    const nombre = get(cols, 'nombre_jugador') || get(cols, 'nombre');
    const apellido = get(cols, 'apellido_jugador') || '';
    const edad = parseNumber(get(cols, 'edad')) || 0;
    const altura = parseHeight(get(cols, 'altura'));
    const peso = parseWeight(get(cols, 'peso'));
    const pierna = parseLeg(get(cols, 'pierna'));
    const estilo_juego = get(cols, 'estilo_juego') || '';
    const posicion = normalizePosition(get(cols, 'posicion'));
    const valoracion = parseNumber(get(cols, 'valoracion')) || 0;
    const precioStr = get(cols, 'precio_compra_libre');
    const precio_compra_libre = parseMillions(precioStr);

    const nacionalidad = get(cols, 'nacionalidad') || '';
    const id_equipo_raw = get(cols, 'id_equipo');
    const id_equipo = id_equipo_raw && id_equipo_raw !== '-' ? id_equipo_raw : '';
    const foto_jugador = get(cols, 'foto_jugador') || '';

    // Stats
    const num = (k: string) => parseNumber(get(cols, k)) || 0;

    const player: Player = {
      id: String(idRaw || `${nombre}-${apellido}-${posicion}-${Math.random().toString(36).slice(2, 7)}`),
      nombre_jugador: nombre || 'Sin',
      apellido_jugador: apellido || 'Nombre',
      edad,
      altura,
      peso,
      pierna,
      estilo_juego,
      posicion,
      valoracion,
      precio_compra_libre,
      nacionalidad,
      id_equipo,
      foto_jugador,
      is_free: false,

      actitud_ofensiva: num('actitud_ofensiva'),
      control_balon: num('control_balon'),
      drible: num('drible'),
      posesion_balon: num('posesion_balon'),
      pase_raso: num('pase_raso'),
      pase_bombeado: num('pase_bombeado'),
      finalizacion: num('finalizacion'),
      cabeceador: num('cabeceador'),
      balon_parado: num('balon_parado'),
      efecto: num('efecto'),
      velocidad: num('velocidad'),
      aceleracion: num('aceleracion'),
      potencia_tiro: num('potencia_tiro'),
      salto: num('salto'),
      contacto_fisico: num('contacto_fisico'),
      equilibrio: num('equilibrio'),
      resistencia: num('resistencia'),
      actitud_defensiva: num('actitud_defensiva'),
      recuperacion_balon: num('recuperacion_balon'),
      agresividad: num('agresividad'),
      actitud_portero: num('actitud_portero'),
      atajar_pt: num('atajar_pt'),
      despejar_pt: num('despejar_pt'),
      reflejos_pt: num('reflejos_pt'),
      cobertura_pt: num('cobertura_pt'),
      uso_pie_malo: num('uso_pie_malo') || 3,
      precision_pie_malo: num('precision_pie_malo') || 3,
      estabilidad: num('estabilidad') || 70,
      resistencia_lesiones: num('resistencia_lesiones') || 70
    } as Player;

    players.push(player);
  });

  return players;
}

export function getImportedPlayers(): Player[] {
  try {
    return parseImportedPlayersFromTSV(rawTsv);
  } catch {
    return [];
  }
}


