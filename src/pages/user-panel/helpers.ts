export const getUserRoles = (user?: any): string[] => {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length) return user.roles;
  return user.role ? [user.role] : [];
};

export const getRoleClass = (role: string) =>
  role === 'admin'
    ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : role === 'dt'
    ? 'bg-green-500/20 text-green-400 border-green-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-500/30';

export const getRoleLabel = (role: string) => (role === 'admin' ? 'Admin' : role === 'dt' ? 'DT' : 'Usuario');

export const getMainRoleLabel = (roles: string[]): string => {
  if (roles.includes('dt')) return 'Director Técnico';
  if (roles.includes('admin')) return 'Administrador';
  return 'Usuario Estándar';
};

export const panelSurfaceClass =
  'card rounded-xl border-gray-700/80 bg-gray-800/70 shadow-lg backdrop-blur-sm';

export const panelItemClass = 'bg-gray-800/50 rounded-lg p-4 border border-gray-700';
