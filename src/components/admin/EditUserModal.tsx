import { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../../store/dataStore';
import { User } from '../../types';

interface Props {
  user: User;
  onClose: () => void;
}

const EditUserModal = ({ user, onClose }: Props) => {
  const navigate = useNavigate();
  const { updateUserEntry } = useDataStore();
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<User['role']>(user.role);
  const [status, setStatus] = useState<User['status']>(user.status);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserEntry({ ...user, username, email, role, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Editar Usuario</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
            <input className="input w-full" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correo</label>
            <input className="input w-full" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rol</label>
            <select className="input w-full" value={role} onChange={e => setRole(e.target.value as User['role'])}>
              <option value="user">Usuario</option>
              <option value="dt">DT</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select className="input w-full" value={status} onChange={e => setStatus(e.target.value as User['status'])}>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
              <option value="banned">Baneado</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
        <button
          type="button"
          className="btn-secondary w-full mt-2"
          onClick={() => {
            onClose();
            navigate(`/usuarios/${user.username}`);
          }}
        >
          Ver perfil
        </button>
      </div>
    </div>
  );
};

export default EditUserModal;
