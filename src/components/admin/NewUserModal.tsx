import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { addUser as persistUser } from '../../utils/authService';
import { User } from '../../types';

interface Props {
  onClose: () => void;
}

const NewUserModal = ({ onClose }: Props) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'user' | 'dt' | 'admin'>('user');
  const [error, setError] = useState('');
  const addUser = useDataStore(state => state.addUser);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !email) {
      setError('Completa todos los campos');
      return;
    }

    try {
      const newUser: User = persistUser(email, username, role);
      addUser(newUser);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear usuario';
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Nuevo Usuario</h3>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
            <input className="input w-full" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Correo</label>
            <input type="email" className="input w-full" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rol</label>
            <select className="input w-full" value={role} onChange={e => setRole(e.target.value as 'user' | 'dt' | 'admin')}>
              <option value="user">Usuario</option>
              <option value="dt">DT</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default NewUserModal;
