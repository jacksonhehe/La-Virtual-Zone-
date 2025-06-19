import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Club } from '../../types';

interface Props {
  club: Club;
  onClose: () => void;
}

const EditClubModal = ({ club, onClose }: Props) => {
  const { users, updateClubEntry, updateUserEntry } = useDataStore();
  const [logo, setLogo] = useState(club.logo);
  const [name, setName] = useState(club.name);
  const [budget, setBudget] = useState(club.budget);
  const [managerId, setManagerId] = useState(
    users.find(u => u.username === club.manager)?.id || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedUser = users.find(u => u.id === managerId);
    if (selectedUser) {
      updateUserEntry({ ...selectedUser, clubId: club.id });
    }

    updateClubEntry({
      ...club,
      logo,
      name,
      budget,
      manager: selectedUser ? selectedUser.username : club.manager
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Editar Club</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Logo URL</label>
            <input
              className="input w-full"
              value={logo}
              onChange={e => setLogo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input
              className="input w-full"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Presupuesto</label>
            <input
              type="number"
              className="input w-full"
              value={budget}
              onChange={e => setBudget(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Entrenador</label>
            <select
              className="input w-full"
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
            >
              <option value="">Sin DT</option>
              {users
                .filter(u => u.role === 'dt')
                .map(u => (
                  <option key={u.id} value={u.id}>
                    {u.username}
                  </option>
                ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
