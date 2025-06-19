import { useState } from 'react';
import { useDataStore } from '../../store/dataStore';
import { useActivityLogStore } from '../../store/activityLogStore';

const MarketAdminPanel = () => {
  const {
    marketStatus,
    updateMarketStatus,
    transfers,
    clubs,
    removeTransfer
  } = useDataStore();
  const { addLog } = useActivityLogStore();
  const [clubFilter, setClubFilter] = useState('');
  const [playerFilter, setPlayerFilter] = useState('');

  const toggleMarket = () => {
    updateMarketStatus(!marketStatus);
    addLog(marketStatus ? 'Mercado cerrado' : 'Mercado abierto');
  };

  const handleRemove = (id: string) => {
    const t = transfers.find(tr => tr.id === id);
    if (t) {
      addLog(
        `Transferencia anulada: ${t.playerName} ${t.fromClub} -> ${t.toClub}`
      );
    }
    removeTransfer(id);
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-1">Filtrar por club</label>
          <select
            className="input w-full"
            value={clubFilter}
            onChange={e => setClubFilter(e.target.value)}
          >
            <option value="">Todos</option>
            {clubs.map(c => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">Filtrar por jugador</label>
          <input
            className="input w-full"
            value={playerFilter}
            onChange={e => setPlayerFilter(e.target.value)}
            placeholder="Nombre del jugador"
          />
        </div>
      </div>

      <div className="bg-dark-light rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">De</th>
                <th className="px-4 py-3 text-center">A</th>
                <th className="px-4 py-3 text-center">Valor</th>
                <th className="px-4 py-3 text-center">Fecha</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transfers
                .filter(t =>
                  (!clubFilter || t.fromClub === clubFilter || t.toClub === clubFilter) &&
                  (!playerFilter || t.playerName.toLowerCase().includes(playerFilter.toLowerCase()))
                )
                .map(t => (
                  <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">{t.playerName}</td>
                    <td className="px-4 py-3 text-center">{t.fromClub}</td>
                    <td className="px-4 py-3 text-center">{t.toClub}</td>
                    <td className="px-4 py-3 text-center font-medium">
                      {new Intl.NumberFormat('es-ES', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(t.fee)}
                    </td>
                    <td className="px-4 py-3 text-center">{t.date}</td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-red-500" onClick={() => handleRemove(t.id)}>
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
