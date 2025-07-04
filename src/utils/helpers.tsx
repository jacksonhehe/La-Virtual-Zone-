import { Match, Standing } from '../types';
import { Player } from '../types/shared';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
export { slugify } from './slugify';

//  Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Format date
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Format time
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Get player position group (for coloring)
export const getPositionGroup = (position: string): string => {
  if (position === 'GK') return 'goalkeeper';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'defender';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'midfielder';
  return 'attacker';
};

// Get position color
export const getPositionColor = (position: string): string => {
  const group = getPositionGroup(position);
  
  switch(group) {
    case 'goalkeeper': return 'text-yellow-500 bg-yellow-500/10';
    case 'defender': return 'text-blue-500 bg-blue-500/10';
    case 'midfielder': return 'text-green-500 bg-green-500/10';
    case 'attacker': return 'text-red-500 bg-red-500/10';
    default: return 'text-gray-500 bg-gray-500/10';
  }
};

export const getOverallColor = (overall: number): string => {
  if (overall >= 85) return 'bg-green-500/20 text-green-500';
  if (overall >= 80) return 'bg-blue-500/20 text-blue-400';
  if (overall >= 75) return 'bg-yellow-500/20 text-yellow-500';
  return 'bg-gray-500/20 text-gray-400';
};


// Get transfer status badge

export const getStatusBadge = (status: string): JSX.Element => {
  switch (status) {
    case 'pending':
      return (
        <span className="badge bg-yellow-500/20 text-yellow-400 inline-flex items-center gap-1">
          <Clock size={12} /> Pendiente
        </span>
      );
    case 'accepted':
      return (
        <span className="badge bg-green-500/20 text-green-400 inline-flex items-center gap-1">
          <CheckCircle size={12} /> Aceptada
        </span>
      );
    case 'rejected':
      return (
        <span className="badge bg-red-500/20 text-red-400 inline-flex items-center gap-1">
          <XCircle size={12} /> Rechazada
        </span>
      );
    default:
      return <span className="badge bg-gray-500/20 text-gray-400">Desconocido</span>;
  }
};

// Get player form icon
export const getFormIcon = (form: number): string => {
  if (form >= 4) {
    return 'text-green-500';
  } else if (form <= 2) {
    return 'text-red-500';
  }
  return 'text-gray-500';
};

// Get match result from perspective of a team
export const getMatchResult = (match: Match, teamName: string): 'win' | 'loss' | 'draw' | null => {
  if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) {
    return null;
  }
  
  if (match.homeTeam === teamName) {
    if (match.homeScore > match.awayScore) return 'win';
    if (match.homeScore < match.awayScore) return 'loss';
    return 'draw';
  } else if (match.awayTeam === teamName) {
    if (match.awayScore > match.homeScore) return 'win';
    if (match.awayScore < match.homeScore) return 'loss';
    return 'draw';
  }
  
  return null;
};

// Calculate level from XP
export const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

// Calculate XP needed for next level
export const xpForNextLevel = (level: number): number => {
  return Math.pow(level, 2) * 100;
};

// Placeholder helper implementations for DT dashboard
export interface MiniTableRow {
  club: string;
  name: string;
  pos: number;
  pts: number;
}

export const getMiniTable = (
  clubId: string,
  standings: Standing[]
): MiniTableRow[] => {
  if (standings.length === 0) return [];

  const index = standings.findIndex(s => s.clubId === clubId);
  let start = index === -1 ? 0 : index - 2;
  if (start < 0) start = 0;
  if (start + 5 > standings.length) {
    start = Math.max(0, standings.length - 5);
  }
  const slice = standings.slice(start, start + 5);

  return slice.map((s, i) => ({
    club: s.clubId,
    name: s.clubName,
    pos: start + i + 1,
    pts: s.points
  }));
};

export const calcStreak = (
  clubId: string,
  fixtures: Match[],
  standings: Standing[]
): boolean[] => {
  const team = standings.find(t => t.clubId === clubId);
  const name = team ? team.clubName : clubId;

  const recent = fixtures
    .filter(
      m =>
        (m.homeTeam === name || m.awayTeam === name) &&
        m.status === 'finished' &&
        m.homeScore !== undefined &&
        m.awayScore !== undefined
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return recent.map(m => getMatchResult(m, name) === 'win');
};

export interface Performer {
  name: string;
  avatar: string;
  g: number;
  a: number;
}

export const getTopPerformer = (
  clubId: string,
  playersData: Player[]
): Performer | null => {
  const clubPlayers = playersData.filter(p => p.clubId === clubId);
  if (clubPlayers.length === 0) return null;

  const best = clubPlayers.reduce((prev, curr) => {
    const prevScore = prev.goals + prev.assists;
    const currScore = curr.goals + curr.assists;
    return currScore > prevScore ? curr : prev;
  });

  return {
    name: best.name,
    avatar: best.image,
    g: best.goals,
    a: best.assists
  };
};

export interface LeagueDiff {
  label: string;
  diff: number;
}

const computeDiff = (
  clubId: string,
  field: keyof Standing,
  label: string,
  standings: Standing[]
): LeagueDiff => {
  const team = standings.find(t => t.clubId === clubId);
  if (!team) return { label, diff: 0 };

  const avg = standings.reduce((sum, s) => sum + (s[field] as number), 0) /
    standings.length;

  return { label, diff: Math.round(team[field] - avg) };
};

export const goalsDiff = (
  clubId: string,
  standings: Standing[]
): LeagueDiff => computeDiff(clubId, 'goalsFor', 'Goles a favor', standings);

export const possessionDiff = (
  clubId: string,
  standings: Standing[]
): LeagueDiff => computeDiff(clubId, 'possession', 'Posesión', standings);

export const yellowDiff = (
  clubId: string,
  standings: Standing[]
): LeagueDiff => computeDiff(clubId, 'cards', 'Amarillas', standings);

// Format news type
export const formatNewsType = (type: string): string => {
  switch(type) {
    case 'transfer': return 'Fichaje';
    case 'rumor': return 'Rumor';
    case 'result': return 'Resultado';
    case 'announcement': return 'Anuncio';
    case 'statement': return 'Declaración';
    default: return type;
  }
};

// Get news type color
export const getNewsTypeColor = (type: string): string => {
  switch(type) {
    case 'transfer': return 'bg-green-500/20 text-green-400';
    case 'rumor': return 'bg-blue-500/20 text-blue-400';
    case 'result': return 'bg-yellow-500/20 text-yellow-400';
    case 'announcement': return 'bg-purple-500/20 text-purple-400';
    case 'statement': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};
 