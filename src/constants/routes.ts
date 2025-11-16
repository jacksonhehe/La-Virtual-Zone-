// Centraliza rutas usadas en la app
export const ROUTES = {
  home: '/',
  login: '/login',
  registro: '/registro',
  usuario: '/usuario',
  usuarios: '/usuarios',
  ligaMaster: '/liga-master',
  zonas: '/liga-master/zonas',
  blog: '/blog',
  galeria: '/galeria',
  ayuda: '/ayuda',
  admin: {
    root: '/admin',
    usuarios: '/admin/usuarios',
    clubes: '/admin/clubes',
    jugadores: '/admin/jugadores',
    torneos: '/admin/torneos',
    noticias: '/admin/noticias',
    mercado: '/admin/mercado',
    estadisticas: '/admin/estadisticas',
    calendario: '/admin/calendario',
  }
} as const;

export type RouteKey = keyof typeof ROUTES;
