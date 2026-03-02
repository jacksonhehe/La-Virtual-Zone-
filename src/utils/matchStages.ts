export const CUP_STAGE_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'Fase 1' },
  { value: 2, label: '16avos de final' },
  { value: 3, label: '8avos de final' },
  { value: 4, label: 'Cuartos de final' },
  { value: 5, label: 'Semifinal' },
  { value: 6, label: 'Partido por el 3er puesto' },
  { value: 7, label: 'Final' }
];

export const isCupTournament = (tournamentType?: string, tournamentName?: string) => {
  const normalizedType = String(tournamentType || '').toLowerCase();
  const normalizedName = String(tournamentName || '').toLowerCase();
  return normalizedType === 'cup' || normalizedName.includes('copa');
};

export const getCupStageLabel = (round: number) => {
  const stage = CUP_STAGE_OPTIONS.find((option) => option.value === round);
  return stage?.label || `Fase ${round}`;
};

/** Etiqueta corta para usar en "Ganador 8avos #1" o "Cuartos · P1" */
const CUP_STAGE_SHORT: Record<number, string> = {
  1: 'F1',
  2: '16avos',
  3: '8avos',
  4: 'Cuartos',
  5: 'Semis',
  6: '3er puesto',
  7: 'Final'
};

export const getCupStageShortLabel = (round: number) =>
  CUP_STAGE_SHORT[round] ?? `Fase ${round}`;

/** Ronda anterior en llave (3→2, 4→3, 5→4, 6→5, 7→5). Null si es la primera ronda. */
const PREV_CUP_ROUND: Record<number, number | null> = {
  2: null,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 5
};

/**
 * Para partidos de copa sin equipos asignados: texto "Ganador [fase anterior] #N".
 * Excepción: 3er puesto (round 6) usa "Perdedor Semis #N" porque los perdedores de semis juegan por el 3º lugar.
 */
export const getCupMatchPlaceholders = (
  round: number,
  bracketSlot: number
): { home: string; away: string } | null => {
  const prevRound = PREV_CUP_ROUND[round];
  if (prevRound == null) return null;
  const phase = getCupStageShortLabel(prevRound);
  const homeNum = bracketSlot * 2 + 1;
  const awayNum = bracketSlot * 2 + 2;
  const prefix = round === 6 ? 'Perdedor' : 'Ganador';
  return {
    home: `${prefix} ${phase} #${homeNum}`,
    away: `${prefix} ${phase} #${awayNum}`
  };
};
