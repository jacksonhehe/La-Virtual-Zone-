import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash, RefreshCw } from 'lucide-react';
import NewUserModal from '../../components/admin/NewUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import { fetchUsers, updateUser as saveUser, deleteUser, createUser, updateSupabaseUser } from '../../utils/authService';
import { config } from '../../lib/config';

const AdminUsers = () => {
  const [usersState, setUsersState] = useState<any[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const load = async () => {
      try {
        const users = await fetchUsers();
        setUsersState(users as any[]);
      } catch {
        setUsersState([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowNewUser(true);
  }, [searchParams]);

  const handleCreateFromModal = async (data: { username: string; email: string; role: 'user'|'dt'|'admin'; roles: Array<'user'|'dt'|'admin'>; password: string }) => {
    try {
      const created = await createUser({
        username: data.username,
        email: data.email,
        role: data.role,
        roles: data.roles,
        password: data.password
      });
      setUsersState(prev => [created as any, ...prev.filter(u => u.id !== created.id)]);
      await handleRefreshUsers();
    } catch (error) {
      console.error('Error creando usuario desde el panel:', error);
      throw error;
    }
  };

  const handleSaveEdit = async (data: { username: string; email: string; role: 'user'|'dt'|'admin'; roles: Array<'user'|'dt'|'admin'>; status: 'active'|'suspended'|'banned'; suspendedUntil: string | null; suspendedReason: string | null; banReason: string | null }) => {
    if (!editingUser) return;
    try {
      let savedUser: any = { ...editingUser, ...data };
      if (config.useSupabase) {
        savedUser = await updateSupabaseUser(editingUser.id, data);
      } else {
        savedUser = await saveUser({ ...editingUser, ...data } as any);
      }
      setUsersState(prev => prev.map(u => (u.id === savedUser.id ? savedUser : u)));
      await handleRefreshUsers();
    } catch (e: any) {
      alert('Error guardando usuario: ' + (e.message || e));
    } finally {
      setEditingUser(null);
    }
  };

  const handleDeleteUserInner = async (id: string) => {
    try {
      await deleteUser(id);
      setUsersState(prev => prev.filter(u => u.id !== id));
    } catch (e: any) {
      alert('Error eliminando usuario: ' + (e.message || e));
    }
  };

  const handleRefreshUsers = async () => {
    try {
      const updatedUsers = await fetchUsers();
      setUsersState(updatedUsers as any[]);
    } catch (error) {
      console.error('Error actualizando usuarios:', error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Gestión de Usuarios</h2>
          <span className="text-sm text-gray-400">({usersState.length} usuarios)</span>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline flex items-center text-sm" onClick={handleRefreshUsers}>
            <RefreshCw size={16} className="mr-2" />
            Refrescar
          </button>
          <button className="btn-primary flex items-center" onClick={() => setShowNewUser(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo usuario
          </button>
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Usuario</th>
                <th className="px-4 py-3 text-center">Correo</th>
                <th className="px-4 py-3 text-center">Roles</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usersState.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">No hay usuarios.</td>
                </tr>
              ) : usersState.map((u: any) => (
                <tr key={u.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=111827&color=fff&size=128`} alt={u.username} />
                      </div>
                      <span className="font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{u.email}</td>
                  <td className="px-4 py-3 text-center">
                    {(Array.isArray(u.roles) ? u.roles : [u.role]).map((r: 'user'|'dt'|'admin') => (
                      <span key={r} className={`inline-block px-2 py-1 text-xs rounded-full mr-1 ${r === 'admin' ? 'bg-neon-red/20 text-neon-red' : r === 'dt' ? 'bg-neon-green/20 text-neon-green' : 'bg-secondary/20 text-secondary'}`}>{r}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3 text-center">{u.status || 'active'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-primary" onClick={() => setEditingUser(u)}>
                        <Edit size={16} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-500" onClick={() => setDeleteUserTarget(u)}>
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewUser && (
        <NewUserModal onClose={() => setShowNewUser(false)} onCreate={handleCreateFromModal} />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          existingUsers={usersState}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}
      {deleteUserTarget && (
        <ConfirmDeleteModal user={{ id: deleteUserTarget.id, username: deleteUserTarget.username }} onCancel={() => setDeleteUserTarget(null)} onConfirm={handleDeleteUserInner} label="usuario" />
      )}
    </div>
  );
};

export default AdminUsers;
