import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Club } from '../../types';
import { slugify } from '../../utils/helpers';

interface Props {
  onClose: () => void;
}

const NewClubModal = ({ onClose }: Props) => {
  const [name, setName] = useState('');
  const [manager, setManager] = useState('');
  const [error, setError] = useState('');
  const addClub = useDataStore(state => state.addClub);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !manager) {
      setError('Completa todos los campos');
      return;
    }

    const newClub: Club = {
      id: `${Date.now()}`,
      name,
      slug: slugify(name),
      logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`,
      foundedYear: new Date().getFullYear(),
      stadium: '',
      budget: 0,
      manager,
      playStyle: '',
      primaryColor: '#ffffff',
      secondaryColor: '#000000',
      description: '',
      titles: [],
      reputation: 50,
      fanBase: 0,
      morale: 50
    };

    addClub(newClub);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Nuevo Club</h3>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Entrenador</label>
            <input className="input w-full" value={manager} onChange={e => setManager(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default NewClubModal;
