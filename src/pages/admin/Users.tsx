import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Edit, Plus, Trash, RefreshCw } from 'lucide-react';
import NewUserModal from '../../components/admin/NewUserModal';
import EditUserModal from '../../components/admin/EditUserModal';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import { fetchUsers, updateUser as saveUser, deleteUser, createUser, updateSupabaseUser } from '../../utils/authService';
import { config } from '../../lib/config';

const AdminUsers = () => {
  const [usersState, setUsersState] = useState<any[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState<any | null>(null);
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    handleRefreshUsers();
  }, []);

  useEffect(() => {
    if (searchParams.get('new') === '1') setShowNewUser(true);
  }, [searchParams]);

  const handleCreateFromModal = async (data: { username: string; email: string; role: 'user'|'dt'|'admin'; roles: Array<'user'|'dt'|'admin'>; password: string }) => {
    try {
      setLoadError(null);
      const created = await createUser({
        username: data.username,
        email: data.email,
        role: data.role,
        roles: data.roles,
        password: data.password
      });
      setShowNewUser(false);
      await handleRefreshUsers();
      return created;
    } catch (error) {
      console.error('Error creando usuario desde el panel:', error);
      throw error;
    }
  };

  const handleSaveEdit = async (data: { username: string; email: string; role: 'user'|'dt'|'admin'; roles: Array<'user'|'dt'|'admin'>; status: 'active'|'suspended'|'banned'; suspendedUntil: string | null; suspendedReason: string | null; banReason: string | null }) => {
    if (!editingUser) return;
    try {
      setLoadError(null);
      if (config.useSupabase) {
        await updateSupabaseUser(editingUser.id, data);
      } else {
        await saveUser({ ...editingUser, ...data } as any);
      }
      await handleRefreshUsers();
    } catch (e: any) {
      alert('Error guardando usuario: ' + (e.message || e));
    } finally {
      setEditingUser(null);
    }
  };

  const handleDeleteUserInner = async (id: string) => {
    try {
      setLoadError(null);
      await deleteUser(id);
      await handleRefreshUsers();
      setDeleteUserTarget(null);
    } catch (e: any) {
      alert('Error eliminando usuario: ' + (e.message || e));
    }
  };

  const handleRefreshUsers = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const updatedUsers = await fetchUsers();
      setUsersState(updatedUsers as any[]);
    } catch (error) {
      console.error('Error actualizando usuarios:', error);
      setLoadError('No se pudieron cargar los usuarios. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Gestion de Usuarios"
        subtitle="Administra cuentas, roles y estado de acceso."
        badge={`(${usersState.length} usuarios)`}
        actions={
          <>
          <button className="btn-outline flex items-center" onClick={handleRefreshUsers} disabled={isLoading}>
            <RefreshCw size={16} className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="btn-primary flex items-center" onClick={() => setShowNewUser(true)}>
            <Plus size={16} className="mr-2" />
            Nuevo usuario
          </button>
          </>
        }
      />

      <div className="card overflow-hidden">
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-400">Cargando usuarios...</td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center">
                    <div className="text-gray-300 mb-3">{loadError}</div>
                    <button className="btn-outline" onClick={handleRefreshUsers}>Reintentar</button>
                  </td>
                </tr>
              ) : usersState.length === 0 ? (
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
                  <td className="px-4 py-3 text-center">
                    <AdminStatusBadge
                      label={(u.status || 'active') === 'active' ? 'Activo' : (u.status || 'active') === 'suspended' ? 'Suspendido' : 'Baneado'}
                      tone={(u.status || 'active') === 'active' ? 'success' : (u.status || 'active') === 'suspended' ? 'warning' : 'danger'}
                    />
                  </td>
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


