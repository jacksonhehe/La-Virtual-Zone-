import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types';

interface Props {
  player: Player;
  onClose: () => void;
}

const EditPlayerModal = ({ player, onClose }: Props) => {
  const { clubs, updatePlayerEntry } = useDataStore();
  const [name, setName] = useState(player.name);
  const [position, setPosition] = useState(player.position);
  const [clubId, setClubId] = useState(player.clubId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlayerEntry({ ...player, name, position, clubId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Editar Jugador</h3>
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
          <button type="submit" className="btn-primary w-full">Guardar</button>
        </form>
      </div>
    </div>
  );
};

export default EditPlayerModal;
