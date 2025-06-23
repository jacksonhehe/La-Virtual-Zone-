import { useEffect, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import financeData from '../data/financeHistory.json';
import { VZ_FINANCE_HISTORY_KEY } from '../utils/storageKeys';
import { formatCurrency } from '../utils/helpers';

interface FinanceEntry {
  season: string;
  initialBudget: number;
  spentOnTransfers: number;
  earnedFromSales: number;
}

const Finanzas = () => {
  const [history, setHistory] = useState<FinanceEntry[]>([]);

  useEffect(() => {
    const json = localStorage.getItem(VZ_FINANCE_HISTORY_KEY);
    if (json) {
      setHistory(JSON.parse(json));
    } else {
      localStorage.setItem(VZ_FINANCE_HISTORY_KEY, JSON.stringify(financeData));
      setHistory(financeData as FinanceEntry[]);
    }
  }, []);

  return (
    <div>
      <PageHeader
        title="Historial Financiero"
        subtitle="Presupuesto y movimientos de transferencias por temporada."
      />
      <div className="container mx-auto px-4 py-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase border-b border-gray-800">
                <th className="px-4 py-2">Temporada</th>
                <th className="px-4 py-2">Presupuesto</th>
                <th className="px-4 py-2">Gastos</th>
                <th className="px-4 py-2">Ingresos</th>
                <th className="px-4 py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {history.map(entry => {
                const balance = entry.earnedFromSales - entry.spentOnTransfers;
                return (
                  <tr key={entry.season} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-2 font-medium">{entry.season}</td>
                    <td className="px-4 py-2">{formatCurrency(entry.initialBudget)}</td>
                    <td className="px-4 py-2 text-red-500">-{formatCurrency(entry.spentOnTransfers)}</td>
                    <td className="px-4 py-2 text-green-500">+{formatCurrency(entry.earnedFromSales)}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}
                    >
                      {balance >= 0 ? '+' : ''}
                      {formatCurrency(balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finanzas;
