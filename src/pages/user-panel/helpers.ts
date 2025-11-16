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
  'bg-gradient-to-br from-gray-900 to-gray-850 rounded-xl border border-gray-800/60 shadow-lg';
