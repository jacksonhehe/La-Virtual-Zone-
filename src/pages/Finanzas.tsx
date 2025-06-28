import { useMemo } from 'react';
import PageHeader from '../components/common/PageHeader';
import { formatCurrency } from '../utils/helpers';
import IncomeVsExpensesChart, {
  FinanceHistoryEntry
} from '../components/finanzas/IncomeVsExpensesChart';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

interface FinanceEntry {
  season: string;
  initialBudget: number;
  spentOnTransfers: number;
  earnedFromSales: number;
}

const Finanzas = () => {
  const { user } = useAuthStore();
  const { clubs, transfers } = useDataStore();
  const club = clubs.find(c => c.id === user?.clubId);

  const history = useMemo<FinanceEntry[]>(() => {
    if (!club) return [];
    const grouped: Record<string, FinanceEntry> = {};
    transfers.forEach(t => {
      const year = new Date(t.date).getFullYear().toString();
      if (!grouped[year]) {
        grouped[year] = {
          season: year,
          initialBudget: club.budget,
          spentOnTransfers: 0,
          earnedFromSales: 0
        };
      }
      if (t.toClub === club.name) grouped[year].spentOnTransfers += t.fee;
      if (t.fromClub === club.name) grouped[year].earnedFromSales += t.fee;
    });
    return Object.values(grouped).sort((a, b) => a.season.localeCompare(b.season));
  }, [club, transfers]);

  const monthlyData = useMemo<FinanceHistoryEntry[]>(() => {
    if (!club) return [];
    const grouped: Record<string, { income: number; expenses: number; dateKey: number; month: string }> = {};
    transfers.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) {
        grouped[key] = {
          income: 0,
          expenses: 0,
          dateKey: date.getTime(),
          month: date.toLocaleString('es', { month: 'short' })
        };
      }
      if (t.toClub === club.name) grouped[key].expenses += t.fee;
      if (t.fromClub === club.name) grouped[key].income += t.fee;
    });
    return Object.values(grouped)
      .sort((a, b) => a.dateKey - b.dateKey)
      .map(d => ({ month: d.month, income: d.income, expenses: d.expenses }));
  }, [club, transfers]);

  return (
    <div>
      <PageHeader
        title="Historial Financiero"
        subtitle="Presupuesto y movimientos de transferencias por temporada."
      />
      <div className="container mx-auto px-4 py-8">
        <IncomeVsExpensesChart data={monthlyData} />
        <div className="mt-6 overflow-x-auto">
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
