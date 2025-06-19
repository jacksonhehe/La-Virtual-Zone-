import { useState } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';

interface Props {
  onClose: () => void;
}

const SystemStateModal = ({ onClose }: Props) => {
  const {
    marketStatus,
    season,
    jornada,
    updateMarketStatus,
    updateSeason,
    updateJornada
  } = useDataStore();

  const [localMarket, setLocalMarket] = useState(marketStatus);
  const [localSeason, setLocalSeason] = useState(season);
  const [localJornada, setLocalJornada] = useState(jornada);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMarketStatus(localMarket);
    updateSeason(Number(localSeason));
    updateJornada(Number(localJornada));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <h3 className="text-xl font-bold mb-4">Estado del Sistema</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Mercado de fichajes</label>
            <select
              className="input w-full"
              value={localMarket ? 'open' : 'closed'}
              onChange={(e) => setLocalMarket(e.target.value === 'open')}
            >
              <option value="open">Abierto</option>
              <option value="closed">Cerrado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Temporada</label>
            <input
              type="number"
              className="input w-full"
              value={localSeason}
              onChange={(e) => setLocalSeason(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Jornada actual</label>
            <input
              type="number"
              className="input w-full"
              value={localJornada}
              onChange={(e) => setLocalJornada(Number(e.target.value))}
            />
          </div>
          <button type="submit" className="btn-primary w-full">Guardar cambios</button>
        </form>
      </div>
    </div>
  );
};

export default SystemStateModal;
