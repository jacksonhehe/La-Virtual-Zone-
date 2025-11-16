import type { Club } from '../types';

export interface Dt {
  id: string;
  nombre: string;
  apellido: string;
  nickname?: string;
  clubId: string;
  liga: string;
  zona: string;
  pais: string;
  bandera: string;
  avatar: string;
  verificado: boolean;
}

export interface DtFilters {
  searchTerm?: string;
  selectedClub?: string;
  selectedLiga?: string;
  selectedZona?: string;
  selectedPais?: string;
  onlyVerified?: boolean;
}

export type DtSortBy = 'name' | 'club' | 'country';

/**
 * Formatea el nombre completo de un DT
 */
export const formatName = (dt: Dt): string => {
  return `${dt.nombre} ${dt.apellido}`;
};

/**
 * Aplica filtros a una lista de DTs
 */
export const applyFilters = (dts: Dt[], filters: DtFilters, clubs: Club[]): Dt[] => {
  return dts.filter(dt => {
    const clubInfo = clubs.find(club => club.id === dt.clubId);

    const matchesSearch = !filters.searchTerm ||
      `${dt.nombre} ${dt.apellido}`.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (dt.nickname && dt.nickname.toLowerCase().includes(filters.searchTerm.toLowerCase())) ||
      dt.pais.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      (clubInfo && clubInfo.name.toLowerCase().includes(filters.searchTerm.toLowerCase()));

    const matchesClub = !filters.selectedClub || dt.clubId === filters.selectedClub;
    const matchesLiga = !filters.selectedLiga || dt.liga === filters.selectedLiga;
    const matchesZona = !filters.selectedZona || dt.zona === filters.selectedZona;
    const matchesPais = !filters.selectedPais || dt.pais === filters.selectedPais;
    const matchesVerified = !filters.onlyVerified || dt.verificado;

    return matchesSearch && matchesClub && matchesLiga && matchesZona && matchesPais && matchesVerified;
  });
};

/**
 * Ordena una lista de DTs
 */
export const sortDts = (dts: Dt[], sortBy: DtSortBy, clubs: Club[]): Dt[] => {
  return [...dts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = formatName(a).toLowerCase().trim();
        const nameB = formatName(b).toLowerCase().trim();
        return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
      case 'club':
        const clubA = (clubs.find(c => c.id === a.clubId)?.name || '').toLowerCase().trim();
        const clubB = (clubs.find(c => c.id === b.clubId)?.name || '').toLowerCase().trim();
        return clubA.localeCompare(clubB, 'es', { sensitivity: 'base' });
      case 'country':
        const countryA = (a.pais || '').toLowerCase().trim();
        const countryB = (b.pais || '').toLowerCase().trim();
        return countryA.localeCompare(countryB, 'es', { sensitivity: 'base' });
      default:
        return 0;
    }
  });
};

/**
 * Inicializa la página de DTs con configuración por defecto
 */
export const initDtsPage = () => {
  // Configuración inicial de la página
  const initialState = {
    searchTerm: '',
    selectedClub: '',
    selectedLiga: '',
    selectedZona: '',
    selectedPais: '',
    onlyVerified: false,
    sortBy: 'name' as DtSortBy,
    pageSize: 12,
    currentPage: 1
  };

  // Configurar título de la página
  document.title = "DT's Oficiales LVZ - La Virtual Zone";

  // Configurar meta tags si es necesario
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Directores Técnicos oficiales certificados de La Virtual Zone. Encuentra y conoce a los mejores entrenadores de la liga.');
  }

  // Configurar Open Graph tags
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogUrl = document.querySelector('meta[property="og:url"]');

  if (ogTitle) ogTitle.setAttribute('content', "DT's Oficiales LVZ");
  if (ogDescription) ogDescription.setAttribute('content', 'Directores Técnicos oficiales certificados de La Virtual Zone');
  if (ogUrl) ogUrl.setAttribute('content', window.location.origin + '/dashboard/dts');

  return initialState;
};

/**
 * Valida que un DT tenga todos los campos requeridos
 */
export const validateDt = (dt: Partial<Dt>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!dt.nombre?.trim()) errors.push('Nombre es requerido');
  if (!dt.apellido?.trim()) errors.push('Apellido es requerido');
  if (!dt.clubId?.trim()) errors.push('Club ID es requerido');
  if (!dt.liga?.trim()) errors.push('Liga es requerida');
  if (!dt.zona?.trim()) errors.push('Zona es requerida');
  if (!dt.pais?.trim()) errors.push('País es requerido');
  if (!dt.bandera?.trim()) errors.push('Bandera es requerida');
  if (!dt.avatar?.trim()) errors.push('Avatar es requerido');

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene información de club por ID
 */
export const getClubInfo = (clubId: string, clubs: Club[]) => {
  return clubs.find(club => club.id === clubId);
};

/**
 * Obtiene estadísticas de DTs
 */
export const getDtsStats = (dts: Dt[], clubs: Club[]) => {
  const totalDts = dts.length;
  const verifiedDts = dts.filter(dt => dt.verificado).length;
  const uniqueCountries = [...new Set(dts.map(dt => dt.pais))].length;
  const uniqueClubs = [...new Set(dts.map(dt => dt.clubId))].length;
  const uniqueLeagues = [...new Set(dts.map(dt => dt.liga))].length;

  return {
    totalDts,
    verifiedDts,
    uniqueCountries,
    uniqueClubs,
    uniqueLeagues
  };
};

/**
 * Crea un skeleton loader para las tarjetas de DT
 */
export const createDtSkeleton = () => {
  return `
    <div class="bg-gradient-to-br from-dark-lighter to-dark-lighter/95 rounded-xl p-4 shadow-xl border border-gray-700/50 backdrop-blur-sm animate-pulse">
      <div class="w-20 h-20 mx-auto rounded-full bg-gray-700/50 mb-4"></div>
      <div class="space-y-2 text-center">
        <div class="h-5 bg-gray-700/50 rounded mx-auto w-3/4"></div>
        <div class="h-4 bg-gray-700/50 rounded mx-auto w-1/2"></div>
        <div class="h-4 bg-gray-700/50 rounded mx-auto w-1/4"></div>
        <div class="flex justify-center items-center mt-3">
          <div class="w-6 h-6 bg-gray-700/50 rounded mr-2"></div>
          <div class="h-4 bg-gray-700/50 rounded w-16"></div>
        </div>
        <div class="flex justify-center items-center">
          <div class="w-4 h-4 bg-gray-700/50 rounded mr-2"></div>
          <div class="h-3 bg-gray-700/50 rounded w-12"></div>
        </div>
      </div>
    </div>
  `;
};

/**
 * Optimiza el rendimiento de renderizado con requestAnimationFrame
 */
export const optimizedRender = (callback: () => void) => {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
};

/**
 * Genera un ID único para DT
 */
export const generateDtId = (baseId?: string): string => {
  if (baseId) return `dt-${baseId}`;
  return `dt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
