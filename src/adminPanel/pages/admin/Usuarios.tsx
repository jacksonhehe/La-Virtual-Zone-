import  { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash, Users, Shield, Eye, MoreVertical } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useGlobalStore } from '../../store/globalStore';
import NewUserModal from '../../components/admin/NewUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { User } from '../../types/shared';

const Usuarios = () => {
  const { users, addUser, updateUser, removeUser, setLoading } = useGlobalStore();
  const [showNew, setShowNew] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(search.toLowerCase()) ||
                         user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateUser = async (userData: Partial<User>) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userData.username || '',
      email: userData.email || '',
      role: userData.role || 'user',
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    addUser(newUser);
    setShowNew(false);
    setLoading(false);
    toast.success('Usuario creado exitosamente');
  };

  const handleUpdateUser = async (userData: User) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateUser(userData);
    setEditUser(null);
    setLoading(false);
    toast.success('Usuario actualizado exitosamente');
  };

  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    removeUser(deleteUser.id);
    setDeleteUser(null);
    setLoading(false);
    toast.success('Usuario eliminado exitosamente');
  };

   return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900/20 to-purple-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Gestión de Usuarios
                </h1>
                <p className="text-gray-400 text-lg">Administra todos los usuarios del sistema</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{users.length}</div>
                <div className="text-xs text-gray-400">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-600"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {users.filter(u => u.status === 'active').length}
                </div>
                <div className="text-xs text-gray-400">Activos</div>
              </div>
            </div>
            
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              onClick={() => setShowNew(true)}
            >
              <Plus size={20} />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>  

             {/* Advanced Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por usuario o email..."
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="dt">Director Técnico</option>
                <option value="user">Usuario</option>
              </select>
              
              <button className="bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-600/50 transition-all duration-300">
                <Filter size={20} />
              </button>
            </div>
          </div>
        </div> 

             {/* Users Grid */}
        <div className="grid gap-6">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((user) => (
              <div 
                key={user.id} 
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl ${
                        user.role === 'admin' 
                          ? 'bg-gradient-to-br from-red-500 to-pink-600' 
                          : user.role === 'dt'
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-800 ${
                        user.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-white">{user.username}</h3>
                        {user.role === 'admin' && <Shield size={16} className="text-red-400" />}
                      </div>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                            : user.role === 'dt'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : user.role === 'dt' ? 'Director Técnico' : 'Usuario'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-300"
                        onClick={() => setEditUser(user)}
                        title="Editar usuario"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-300"
                        title="Ver detalles"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-300"
                        onClick={() => setDeleteUser(user)}
                        title="Eliminar usuario"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-800/30 rounded-xl p-12 text-center border border-gray-700/50">
              <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-300 mb-2">No se encontraron usuarios</h3>
              <p className="text-gray-400 mb-6">Intenta ajustar los filtros o crear un nuevo usuario</p>
              <button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                onClick={() => setShowNew(true)}
              >
                Crear primer usuario
              </button>
            </div>
          )}
        </div> 

             {/* Advanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length} usuarios
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === 1 
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        className={`w-10 h-10 rounded-lg transition-all duration-300 ${
                          currentPage === pageNum 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    currentPage === totalPages 
                      ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        )} 

             {/* Modals */}
        {showNew && <NewUserModal onClose={() => setShowNew(false)} onSave={handleCreateUser} />}
        {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={handleUpdateUser} />}
        {deleteUser && (
          <ConfirmDeleteModal
            message={`¿Estás seguro de eliminar el usuario "${deleteUser.username}"?`}
            onConfirm={handleDeleteUser}
            onClose={() => setDeleteUser(null)}
          />
        )}
      </div>
    </div>
  ); 
};

export default Usuarios;
 