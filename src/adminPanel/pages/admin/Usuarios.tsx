import  { useState } from 'react';
import { Plus, Search, Filter, Edit, Trash } from 'lucide-react';
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
       <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Usuarios</h1>
          <p className="text-gray-400 mt-2">Gestiona todos los usuarios del sistema</p>
        </div>
        <button 
          className="btn-primary flex items-center space-x-2"
          onClick={() => setShowNew(true)}
        >
          <Plus size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div> 

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            className="input pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Admin</option>
          <option value="dt">DT</option>
          <option value="user">Usuario</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="table-header">Usuario</th>
              <th className="table-header">Email</th>
              <th className="table-header">Rol</th>
              <th className="table-header">Estado</th>
              <th className="table-header">Fecha de Registro</th>
              <th className="table-header text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr key={user.id} className="border-t border-gray-700">
                  <td className="table-cell font-medium">{user.username}</td>
                  <td className="table-cell">{user.email}</td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.role === 'admin' 
                        ? 'bg-red-900/20 text-red-300' 
                        : user.role === 'dt'
                        ? 'bg-blue-900/20 text-blue-300'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' 
                        ? 'bg-green-900/20 text-green-300' 
                        : 'bg-red-900/20 text-red-300'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="table-cell text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        className="text-blue-400 hover:text-blue-300"
                        onClick={() => setEditUser(user)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="table-cell text-center py-8 text-gray-400">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={`px-3 py-1 rounded ${
                currentPage === page 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
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
  );
};

export default Usuarios;
 