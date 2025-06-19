import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types';

interface Props {
  onClose: () => void;
}

const NewPlayerModal = ({ onClose }: Props) => {
  const { clubs, addPlayer } = useDataStore();
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !position || !clubId) {
      setError('Completa todos los campos');
      return;
    }

    const newPlayer: Player = {
      id: `${Date.now()}`,
      name,
      age: 18,
      position,
      nationality: 'Argentina',
      dorsal: 0,
      clubId,
      overall: 60,
      potential: 70,
      transferListed: false,
      matches: 0,
      transferValue: 0,
      value: 0,
      image: 'https://via.placeholder.com/150',
      attributes: {
        pace: 50,
        shooting: 50,
        passing: 50,
        dribbling: 50,
        defending: 50,
        physical: 50
      },
      contract: {
        expires: `${new Date().getFullYear() + 2}-06-30`,
        salary: 0
      },
      form: 1,
      goals: 0,
      assists: 0,
      appearances: 0
    };

    addPlayer(newPlayer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Nuevo Jugador</h3>
        {error && <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input className="input w-full" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Posición</label>
            <input className="input w-full" value={position} onChange={e => setPosition(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Club</label>
            <select className="input w-full" value={clubId} onChange={e => setClubId(e.target.value)}>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Crear</button>
        </form>
      </div>
    </div>
  );
};

export default NewPlayerModal;
