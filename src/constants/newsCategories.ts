// Categorías disponibles para las noticias
export const NEWS_CATEGORIES = [
  'Noticias',
  'Análisis',
  'Entrevistas',
  'Reportajes',
  'Opinión',
  'Crónicas',
  'Fútbol Internacional',
  'Fútbol Nacional',
  'Mercado de Pases',
  'Liga Master',
  'Torneos',
  'Jugadores',
  'Equipos',
  'Estadísticas',
  'Historia',
  'Tecnología',
  'Esports'
] as const;

export type NewsCategory = typeof NEWS_CATEGORIES[number];

// Función helper para validar categorías
export const isValidCategory = (category: string): category is NewsCategory => {
  return NEWS_CATEGORIES.includes(category as NewsCategory);
};

// Función para obtener categoría por defecto
export const getDefaultCategory = (): NewsCategory => 'Noticias';
