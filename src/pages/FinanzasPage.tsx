import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import BudgetPanel from '../components/finanzas/BudgetPanel';
import IncomeVsExpensesChart from '../components/finanzas/IncomeVsExpensesChart';
import TransferHistoryTable from '../components/finanzas/TransferHistoryTable';
import SeasonEndProjection from '../components/finanzas/SeasonEndProjection';
import RequestFundsModal from '../components/finanzas/RequestFundsModal';
import financeData from '../data/financeHistory.json';
import usePersistentState from '../hooks/usePersistentState';

interface FinanceEntry {
  month: string;
  income: number;
  expenses: number;
}

const FinanzasPage = () => {
  const [history] = usePersistentState<FinanceEntry[]>('vz_finance_history', financeData as FinanceEntry[]);
  const [showModal, setShowModal] = useState(false);

  const transferBudget = 20000000;
  const wageBudget = 5000000;
  const balance = history.reduce((sum, h) => sum + h.income - h.expenses, 0);

  const prevBalance = balance - (history[history.length - 1].income - history[history.length - 1].expenses);

  return (
    <div>
      <PageHeader
        title="Finanzas del Club"
        subtitle="Resumen económico y proyecciones de la temporada"
      />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <BudgetPanel
          transferBudget={transferBudget}
          wageBudget={wageBudget}
          balance={balance}
          prevBalance={prevBalance}
        />

        <div className="card p-4">
          <h3 className="font-bold mb-4">Ingresos vs Gastos</h3>
          <IncomeVsExpensesChart data={history} />
        </div>

        <SeasonEndProjection data={history} currentBalance={balance} />

        <TransferHistoryTable />

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          Solicitar Fondos Extra
        </button>
      </div>
      {showModal && <RequestFundsModal onClose={() => setShowModal(false)} />}
    </div>
  );
};

export default FinanzasPage;
