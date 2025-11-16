import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Star, Shield, Award, Mail, Calendar, Users as UsersIcon, Search, Trophy } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { listUsers } from '../utils/authService';
import { getSupabaseClient } from '../lib/supabase';
import { config } from '../lib/config';
import { clubs } from '../data/clubs';

// Helper functions
const ROLE_BADGE_CLASS: Record<string, string> = {
  admin: 'bg-red-500/20 text-red-400',
  dt: 'bg-green-500/20 text-green-400',
};

const ROLE_LABEL: Record<string, string> = {
  admin: 'Administrador',
  dt: 'Director Técnico',
};

function getRoleBadgeClass(role: string): string {
  return ROLE_BADGE_CLASS[role] ?? 'bg-gray-500/20 text-gray-400';
}

function getRoleLabel(role: string): string {
  return ROLE_LABEL[role] ?? 'Usuario';
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

        // Fallback a localStorage
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

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole) {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark">
      <PageHeader
        title="Comunidad de Usuarios"
        subtitle="Conoce a los miembros de La Virtual Zone"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre o email..."
                    className="input pl-10 w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Role Filter */}
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input w-full sm:w-auto"
                >
                  <option value="">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="dt">Directores Técnicos</option>
                  <option value="user">Usuarios</option>
                </select>
              </div>

              {/* Results count */}
              <div className="text-sm text-gray-400">
                {filteredUsers.length} usuario{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => {
              const club = clubs.find(c => c.name === user.club);
              const isDT = user.role === 'dt' || (Array.isArray((user as any).roles) && (user as any).roles?.includes('dt'));
              const isAdmin = user.role === 'admin' || (Array.isArray((user as any).roles) && (user as any).roles?.includes('admin'));

              return (
                <div key={user.id} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                  {/* User Header */}
                  <div className="text-center mb-4">
                    <Link to={`/usuarios/${user.username}`}>
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-gray-600 object-cover"
                      />
                    </Link>
                    <Link
                      to={`/usuarios/${user.username}`}
                      className="text-xl font-bold text-white hover:text-primary transition-colors"
                    >
                      {user.username}
                    </Link>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                  </div>

                  {/* Role Badges */}
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

                  {/* Stats (sin nivel) */}
                  <div className="space-y-3 mb-4">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Seguidores:</span>
                      <span className="text-secondary font-semibold">{(user as any).followers || 0}</span>
                    </div>

                    {isDT && user.club && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Club:</span>
                        <Link
                          to={`/liga-master/club/${user.club.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-green-400 hover:text-green-300 font-semibold"
                        >
                          {user.club}
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

                  {/* Achievements Preview */}
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/usuarios/${user.username}`}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center text-sm"
                    >
                      Ver Perfil
                    </Link>
                    {isDT && club && (
                      <Link
                        to={`/liga-master/club/${user.club.toLowerCase().replace(/\s+/g, '-')}`}
                        className="bg-secondary hover:bg-secondary/90 text-white px-3 py-2 rounded-lg font-medium transition-colors text-center text-sm flex items-center justify-center"
                        title={`Ver club ${user.club}`}
                      >
                        <Trophy size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-400">
                {searchTerm || selectedRole
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay usuarios disponibles en este momento'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
