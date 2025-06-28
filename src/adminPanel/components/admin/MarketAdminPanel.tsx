import  { useState } from 'react';

const MarketAdminPanel = () => {
  const [playerFilter, setPlayerFilter] = useState('');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión del Mercado</h2>
      <div className="mb-4">
        <input
          className="input flex-1"
          placeholder="Filtrar por jugador"
          value={playerFilter}
          onChange={e => setPlayerFilter(e.target.value)}
        />
      </div>
      <div className="bg-gray-800 p-4 rounded-lg">
        <p className="text-gray-400">No hay transferencias pendientes</p>
      </div>
    </div>
  );
};

export default MarketAdminPanel;
 