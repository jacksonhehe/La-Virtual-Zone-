import { useDataStore } from '../../store/dataStore';
import { useActivityStore } from '../../store/activityStore';
import { useState } from 'react';

const MarketAdminPanel = () => {
  const { marketStatus, updateMarketStatus, transfers, removeTransfer } = useDataStore();
  const { addActivity } = useActivityStore();

  const [playerFilter, setPlayerFilter] = useState('');
  const [clubFilter, setClubFilter] = useState('');

  const toggleMarket = () => {
    updateMarketStatus(!marketStatus);
    addActivity(`Mercado ${!marketStatus ? 'abierto' : 'cerrado'}`);
  };

  const filteredTransfers = transfers.filter(t => {
    const matchPlayer = t.playerName.toLowerCase().includes(playerFilter.toLowerCase());
    const matchClub =
      t.fromClub.toLowerCase().includes(clubFilter.toLowerCase()) ||
      t.toClub.toLowerCase().includes(clubFilter.toLowerCase());
    return matchPlayer && matchClub;
  });

  const handleAnnul = (id: string) => {
    removeTransfer(id);
    addActivity(`Transferencia anulada ${id}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Mercado</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 p-6 space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Estado actual</span>
          <span className={`font-bold ${marketStatus ? 'text-neon-green' : 'text-neon-red'}`}>{marketStatus ? 'Abierto' : 'Cerrado'}</span>
        </div>
        <button className="btn-primary" onClick={toggleMarket}>
          {marketStatus ? 'Cerrar Mercado' : 'Abrir Mercado'}
        </button>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 p-6">
        <div className="flex gap-4 mb-4">
          <input
            className="input flex-1"
            placeholder="Filtrar por jugador"
            value={playerFilter}
            onChange={e => setPlayerFilter(e.target.value)}
          />
          <input
            className="input flex-1"
            placeholder="Filtrar por club"
            value={clubFilter}
            onChange={e => setClubFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="p-2">Fecha</th>
                <th className="p-2">Jugador</th>
                <th className="p-2">Clubes</th>
                <th className="p-2">Monto</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map(t => (
                <tr key={t.id} className="border-b border-gray-800 last:border-0">
                  <td className="p-2">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="p-2">{t.playerName}</td>
                  <td className="p-2">{t.fromClub} → {t.toClub}</td>
                  <td className="p-2">{t.fee.toLocaleString()}</td>
                  <td className="p-2">
                    <button className="btn-outline" onClick={() => handleAnnul(t.id)}>
                      Anular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketAdminPanel;
