import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Users as UsersIcon, Search, Trophy, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { listUsers } from '../../utils/authService';
import { getSupabaseClient } from '../../lib/supabase';
import { config } from '../../lib/config';
import { clubs } from '../../data/clubs';

const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400',
  dt: 'bg-green-500/20 text-green-400',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  dt: 'Director Tecnico',
};

function getRoleBadgeClass(role: string): string {
  return ROLE_BADGE_CLASS[role] ?? 'bg-gray-500/20 text-gray-400';
}

function getRoleLabel(role: string): string {
  return ROLE_LABEL[role] ?? 'Usuario';
}

function hasDTRole(user: any): boolean {
  return user.role === 'dt' || (Array.isArray(user.roles) && user.roles.includes('dt'));
}

function hasAssignedClub(user: any): boolean {
  return Boolean(user.clubId || user.club);
}

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        if (config.useSupabase) {
          const supabase = getSupabaseClient();
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, email, role, avatar, followers, following, created_at, club_id, bio, location, website')
            .order('username', { ascending: true });

          if (error) throw error;

          const mapped = (data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            role: u.role || 'user',
            avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=111827&color=fff&size=128`,
            followers: u.followers || 0,
            following: u.following || 0,
            clubId: u.club_id,
            createdAt: u.created_at,
            bio: u.bio,
            location: u.location,
            website: u.website,
          }));

          setUsers(mapped);
          setFilteredUsers(mapped);
          return;
        }

        const local = listUsers();
        setUsers(local);
        setFilteredUsers(local);
      } catch (e) {
        console.error('Error cargando usuarios:', e);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter((user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  if (loading) {
    return (
      <div className="min-h-[65vh] container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center -mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute top-24 -right-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl"></div>
      </div>
      <PageHeader
        title="Comunidad de Usuarios"
        subtitle="Conoce a los miembros de La Virtual Zone"
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Usuarios Totales</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">DTs Activos</p>
              <p className="text-2xl font-bold text-green-400">{users.filter((u) => hasDTRole(u) || hasAssignedClub(u)).length}</p>
            </div>
            <div className="card p-4">
              <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Administradores</p>
              <p className="text-2xl font-bold text-red-400">{users.filter((u) => u.role === 'admin').length}</p>
            </div>
          </div>

          <div className="bg-dark-light rounded-lg p-6 mb-8 border border-gray-800">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-xl w-full">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="input pl-10 pr-10 w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      aria-label="Limpiar busqueda"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="text-sm text-gray-400">
                  {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === '' ? 'bg-primary text-white' : 'bg-dark-lighter text-gray-300 hover:bg-dark'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'admin' ? 'bg-red-500 text-white' : 'bg-dark-lighter text-gray-300 hover:bg-dark'
                  }`}
                >
                  Administradores
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('dt')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'dt' ? 'bg-green-500 text-white' : 'bg-dark-lighter text-gray-300 hover:bg-dark'
                  }`}
                >
                  Directores Tecnicos
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedRole === 'user' ? 'bg-gray-500 text-white' : 'bg-dark-lighter text-gray-300 hover:bg-dark'
                  }`}
                >
                  Usuarios
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const resolvedClubName = user.club || clubs.find((c) => c.id === user.clubId)?.name;
              const club = resolvedClubName ? clubs.find((c) => c.name === resolvedClubName) : null;
              const hasAssignedClubUser = Boolean(resolvedClubName);
              const isDT = hasDTRole(user);

              return (
                <div key={user.id} className="group card overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="h-16 bg-gradient-to-r from-dark-light via-gray-700 to-dark-light group-hover:from-primary/30 group-hover:to-secondary/30 transition-colors"></div>
                  <div className="px-6 pb-6 -mt-10">
                    <div className="text-center mb-4">
                    <Link to={`/usuarios/${user.username}`}>
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-gray-900 object-cover shadow-lg"
                      />
                    </Link>
                    <Link
                      to={`/usuarios/${user.username}`}
                      className="text-xl font-bold text-white hover:text-primary transition-colors"
                    >
                      {user.username}
                    </Link>
                    <p className="text-gray-400 text-sm truncate">{user.email}</p>
                  </div>

                  <div className="flex gap-1 justify-center mb-4">
                    {(() => {
                      const roles = Array.isArray((user as any).roles) && (user as any).roles.length
                        ? (user as any).roles
                        : [user.role];

                      return roles.map((r: string) => (
                        <span
                          key={r}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(r)}`}
                        >
                          {getRoleLabel(r)}
                        </span>
                      ));
                    })()}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Seguidores:</span>
                      <span className="text-secondary font-semibold">{(user as any).followers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Siguiendo:</span>
                      <span className="text-slate-200 font-semibold">{(user as any).following || 0}</span>
                    </div>

                    {hasAssignedClubUser && resolvedClubName && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Club:</span>
                        <Link
                          to={`/liga-master/club/${resolvedClubName.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-green-400 hover:text-green-300 font-semibold"
                        >
                          {resolvedClubName}
                        </Link>
                      </div>
                    )}

                    {isDT && user.stats && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Victorias:</span>
                        <span className="text-yellow-400 font-semibold">{user.stats.wins || 0}</span>
                      </div>
                    )}
                  </div>

                  {user.achievements && Array.isArray(user.achievements) && user.achievements.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center text-xs text-gray-400 mb-2">
                        <Award size={12} className="mr-1" />
                        Logros: {user.achievements.length}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.achievements.slice(0, 2).map((achievement: any) => (
                          <span
                            key={achievement?.id || Math.random()}
                            className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            title={achievement?.description || ''}
                          >
                            {achievement?.name && achievement.name.length > 15
                              ? `${achievement.name.substring(0, 12)}...`
                              : (achievement?.name || 'Logro')}
                          </span>
                        ))}
                        {user.achievements.length > 2 && (
                          <span className="px-2 py-1 bg-gray-500/10 text-gray-400 text-xs rounded-full">
                            +{user.achievements.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link
                      to={`/usuarios/${user.username}`}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center text-sm"
                    >
                      Ver Perfil
                    </Link>
                    {hasAssignedClubUser && club && resolvedClubName && (
                      <Link
                        to={`/liga-master/club/${resolvedClubName.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-secondary hover:bg-secondary/90 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center text-sm flex items-center justify-center"
                        title={`Ver club ${resolvedClubName}`}
                      >
                        <Trophy size={14} />
                      </Link>
                    )}
                  </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-400">
                {searchTerm || selectedRole
                  ? 'Intenta ajustar los filtros de busqueda'
                  : 'No hay usuarios disponibles en este momento'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
