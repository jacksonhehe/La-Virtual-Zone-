import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Club } from '../../types';

interface Props {
  club: Club;
  onClose: () => void;
}

const EditClubModal = ({ club, onClose }: Props) => {
  const { updateClubEntry } = useDataStore();
  const [name, setName] = useState(club.name);
  const [manager, setManager] = useState(club.manager);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClubEntry({ ...club, name, manager });
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
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Entrenador</label>
            <input className="input w-full" value={manager} onChange={e => setManager(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
