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

// Get player position group (for coloring) - supports both English and translated positions
export const getPositionGroup = (position: string): string => {
  if (position === 'GK' || position === 'PT') return 'goalkeeper';
  if (['CB', 'LB', 'RB', 'LWB', 'RWB', 'DEC', 'LI', 'LD'].includes(position)) return 'defender';
  if (['CDM', 'CM', 'CAM', 'LM', 'RM', 'MCD', 'MC', 'MO', 'MDI', 'MDD'].includes(position)) return 'midfielder';
  return 'attacker';
};

// Get position color (supports both English and translated positions)
export const getPositionColor = (position: string): string => {
  // Specific position colors
  switch(position) {
    case 'PT': return 'text-yellow-500 bg-yellow-500/10';
    case 'DEC': return 'text-blue-500 bg-blue-500/10';
    case 'CD': return 'text-red-500 bg-red-500/10';
    case 'SD': return 'text-red-500 bg-red-500/10';
  }

  // Fallback to group-based colors
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
      return 'Pendiente';
    case 'accepted':
      return 'Aceptada';
    case 'rejected':
      return 'Rechazada';
    case 'counter-offer':
      return 'Contraoferta';
    default:
      return 'Desconocido';
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
export const getMatchResult = (match: any, teamName: string): 'win' | 'loss' | 'draw' | null => {
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

// Convert image file to base64
export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    reader.readAsDataURL(file);
  });
};

// Validate image file
export const validateImageFile = (file: File): string | null => {
  // Check if it's an image
  if (!file.type.startsWith('image/')) {
    return 'Solo se permiten archivos de imagen';
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return 'La imagen no puede ser mayor a 5MB';
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!supportedTypes.includes(file.type)) {
    return 'Formato de imagen no soportado. Usa JPG, PNG, GIF o WebP';
  }

  return null;
};

export const isValidImageSource = (value: string | null | undefined): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (/^https?:\/\//i.test(trimmed)) return true;
  if (trimmed.toLowerCase().startsWith('data:image/')) return true;

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    trimmed.startsWith('../')
  ) {
    return true;
  }

  const relativeAssetPattern = /^(?:\.{0,2}\/)?(?:[^\/?#]+\/)*[^\/?#]+\.(?:png|jpe?g|gif|webp|svg)$/i;
  if (relativeAssetPattern.test(trimmed)) {
    return true;
  }

  return false;
};

// Traducción de posiciones de inglés a español (formato LVZ)
export const positionTranslations: Record<string, string> = {
  'GK': 'PT',
  'CB': 'DEC',
  'LB': 'LI',
  'RB': 'LD',
  'LWB': 'LI',
  'RWB': 'LD',
  'DMF': 'MCD',
  'CMF': 'MC',
  'LMF': 'MDI',
  'RMF': 'MDD',
  'AMF': 'MO',
  'SS': 'MO',
  'CF': 'CD',
  'LWF': 'EXI',
  'RWF': 'EXD',
  'CDM': 'MCD',
  'CM': 'MC',
  'CAM': 'MO',
  'LM': 'MDI',
  'RM': 'MDD',
  'LW': 'EXI',
  'RW': 'EXD',
  'ST': 'CD',
  'DEF': 'DEF',
  'POR': 'PT'
};

// Traducción de posiciones a español completo
export const positionFullNames: Record<string, string> = {
  'GK': 'Portero',
  'CB': 'Defensa Central',
  'LB': 'Lateral Izquierdo',
  'RB': 'Lateral Derecho',
  'LWB': 'Carrilero Izquierdo',
  'RWB': 'Carrilero Derecho',
  'DMF': 'Mediocentro Defensivo',
  'CMF': 'Mediocentro',
  'LMF': 'Medio Izquierdo',
  'RMF': 'Medio Derecho',
  'AMF': 'Mediocampista Ofensivo',
  'SS': 'Segundo Delantero',
  'CF': 'Centrodantero',
  'LWF': 'Extremo Izquierdo',
  'RWF': 'Extremo Derecho',
  'CDM': 'Mediocentro Defensivo',
  'CM': 'Mediocentro',
  'CAM': 'Mediocampista Ofensivo',
  'LM': 'Medio Izquierdo',
  'RM': 'Medio Derecho',
  'LW': 'Extremo Izquierdo',
  'RW': 'Extremo Derecho',
  'ST': 'Delantero Centro',
  'DEF': 'Defensa',
  'POR': 'Portero'
};

// Función para obtener la posición traducida (formato LVZ)
export function getTranslatedPosition(position: string): string {
  return positionTranslations[position] || position;
}

// Función para obtener el nombre completo en español
export function getPositionFullName(position: string): string {
  return positionFullNames[position] || position;
}

// Get club name by ID, handling special case for free agents
export function getClubDisplayName(clubId: string | null | undefined, clubs: any[]): string {
  const normalizedId = clubId?.trim().toLowerCase();
  if (!normalizedId || normalizedId === 'libre' || normalizedId === 'free') {
    return 'Libre';
  }
  const club = clubs.find(c => c.id === clubId);
  return club ? club.name : 'Desconocido';
}

// Get club logo by ID, handling special case for free agents
export function getClubDisplayLogo(clubId: string | null | undefined, clubs: any[]): string {
  const normalizedId = clubId?.trim().toLowerCase();
  if (!normalizedId || normalizedId === 'libre' || normalizedId === 'free') {
    return ''; // No mostrar logo para agentes libres
  }
  const club = clubs.find(c => c.id === clubId);
  return club ? club.logo : '/default-club.svg';
}

 
