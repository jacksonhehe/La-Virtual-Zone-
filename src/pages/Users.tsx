import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users as UsersIcon, Shield, Crown, User, Filter, Grid, List, Eye, MessageCircle, Trophy, Star } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { fetchUsers, UserQuery } from '../utils/userService';
import { User as UserType } from '../types/shared';

const PAGE_SIZE = 12;

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState<UserQuery>({ page: 1, pageSize: PAGE_SIZE, search: '' });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetchUsers(query).then(res => {
      setUsers(res.users);
      setTotal(res.total);
      setLoading(false);
    });
  }, [query]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const changePage = (p: number) => {
    setQuery(prev => ({ ...prev, page: p }));
  };

  const filteredUsers = users.filter(user => 
    roleFilter === 'all' || user.role === roleFilter
  );

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'dt':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (role.toLowerCase()) {
      case 'admin':
        return `${baseClasses} bg-yellow-900/30 text-yellow-300 border border-yellow-500/30`;
      case 'dt':
        return `${baseClasses} bg-blue-900/30 text-blue-300 border border-blue-500/30`;
      default:
        return `${baseClasses} bg-gray-900/30 text-gray-300 border border-gray-500/30`;
    }
  };

  const stats = {
    total: total,
    admins: users.filter(u => u.role === 'admin').length,
    dts: users.filter(u => u.role === 'dt').length,
    users: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark">
      <PageHeader 
        title="Comunidad" 
        subtitle="Conoce a los miembros de La Virtual Zone" 
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Total Miembros</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <UsersIcon className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 rounded-xl p-6 border border-yellow-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-300 text-sm font-medium">Administradores</p>
                <p className="text-2xl font-bold text-white">{stats.admins}</p>
              </div>
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Directores Técnicos</p>
                <p className="text-2xl font-bold text-white">{stats.dts}</p>
              </div>
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Jugadores</p>
                <p className="text-2xl font-bold text-white">{stats.users}</p>
              </div>
              <User className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="input w-full pl-10"
                  placeholder="Buscar usuario por nombre..."
                  value={query.search}
                  onChange={e => setQuery({ ...query, search: e.target.value, page: 1 })}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input bg-dark border-gray-600 text-sm"
                >
                  <option value="all">Todos los roles</option>
                  <option value="admin">Administradores</option>
                  <option value="dt">Directores Técnicos</option>
                  <option value="user">Jugadores</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 bg-dark rounded-lg p-1 border border-gray-600">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-primary text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredUsers.map(user => (
                <div key={user.id} className="group bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 group-hover:border-primary/50 transition-colors"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getRoleIcon(user.role)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/usuarios/${user.username}`}
                        className="block text-white font-semibold hover:text-primary transition-colors truncate"
                      >
                        {user.username}
                      </Link>
                      <span className={getRoleBadge(user.role)}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {user.club && (
                      <div className="flex items-center text-sm text-gray-400">
                        <Trophy className="w-4 h-4 mr-2" />
                        <span className="truncate">{user.club}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-700/50">
                      <Link
                        to={`/usuarios/${user.username}`}
                        className="flex items-center text-sm text-primary hover:text-primary-light transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver perfil
                      </Link>
                      
                      <button className="flex items-center text-sm text-gray-400 hover:text-primary transition-colors">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Mensaje
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700/50">
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Club
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <Link
                              to={`/usuarios/${user.username}`}
                              className="text-white font-medium hover:text-primary transition-colors"
                            >
                              {user.username}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role)}>
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                        {user.club || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/usuarios/${user.username}`}
                            className="text-primary hover:text-primary-light transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button className="text-gray-400 hover:text-primary transition-colors">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Paginación */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2 bg-gradient-to-br from-dark to-dark-light rounded-xl p-2 border border-gray-700/50">
              <button
                disabled={query.page === 1}
                onClick={() => changePage(query.page! - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Anterior
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-300">
                Página {query.page} de {totalPages}
              </span>
              
              <button
                disabled={query.page === totalPages}
                onClick={() => changePage(query.page! + 1)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-700/50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay resultados */}
        {!loading && filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No se encontraron usuarios</h3>
            <p className="text-gray-500">Intenta ajustar los filtros o la búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
