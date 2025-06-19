import { useDataStore } from '../../store/dataStore';

const MarketAdminPanel = () => {
  const { marketStatus, updateMarketStatus } = useDataStore();

  const toggleMarket = () => {
    updateMarketStatus(!marketStatus);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestión de Mercado</h2>
      <div className="bg-dark-light rounded-lg border border-gray-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Estado actual</span>
          <span className={`font-bold ${marketStatus ? 'text-neon-green' : 'text-neon-red'}`}>{marketStatus ? 'Abierto' : 'Cerrado'}</span>
        </div>
        <button className="btn-primary" onClick={toggleMarket}>
          {marketStatus ? 'Cerrar Mercado' : 'Abrir Mercado'}
        </button>
      </div>
    </div>
  );
};

export default MarketAdminPanel;
