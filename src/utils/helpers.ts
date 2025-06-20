import { Match, Standing, Player } from '../types';

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

// Get transfer status badge
export const getStatusBadge = (status: string): string => {
  switch(status) {
    case 'pending':
      return 'badge bg-yellow-500/20 text-yellow-400';
    case 'accepted':
      return 'badge bg-green-500/20 text-green-400';
    case 'rejected':
      return 'badge bg-red-500/20 text-red-400';
    default:
      return 'badge bg-gray-500/20 text-gray-400';
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

// Slugify string
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
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
export const getMiniTable = (clubId: string, standings: Standing[]): Standing[] => {
  return standings.filter(s => s.clubId === clubId).slice(0, 5);
};

export const calcStreak = (clubId: string, fixtures: Match[]): number => {
  return fixtures.filter(
    m => (m.homeTeam === clubId || m.awayTeam === clubId) && m.status === 'finished'
  ).length;
};

export const getTopPerformer = (clubId: string): Player | null => {
  return clubId ? null : null;
};

export const goalsDiff = (clubId: string): number => (clubId ? 0 : 0);
export const possessionDiff = (clubId: string): number => (clubId ? 0 : 0);
export const yellowDiff = (clubId: string): number => (clubId ? 0 : 0);

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
 