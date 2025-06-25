import { ArrowUp } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency, formatDate } from '../../utils/helpers';

const TransferHistoryTable = () => {
  const { transfers } = useDataStore();
  const recent = [...transfers].slice(0, 5);

  return (
    <div className="card overflow-hidden">
      <div className="p-4 bg-dark-lighter border-b border-gray-800">
        <h4 className="font-bold">Últimos Traspasos</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              <th className="px-4 py-2 text-left">Jugador</th>
              <th className="px-4 py-2 text-center">Tipo</th>
              <th className="px-4 py-2 text-center">Origen</th>
              <th className="px-4 py-2 text-center">Destino</th>
              <th className="px-4 py-2 text-center">Valor</th>
              <th className="px-4 py-2 text-center">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(t => (
              <tr key={t.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                <td className="px-4 py-2">{t.playerName}</td>
                <td className="px-4 py-2 text-center">
                  <span className="inline-flex items-center text-red-500">
                    <ArrowUp size={14} className="mr-1" />Salida
                  </span>
                </td>
                <td className="px-4 py-2 text-center">{t.fromClub}</td>
                <td className="px-4 py-2 text-center">{t.toClub}</td>
                <td className="px-4 py-2 text-center font-medium">-{formatCurrency(t.fee)}</td>
                <td className="px-4 py-2 text-center">{formatDate(t.date)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Sin traspasos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransferHistoryTable;
