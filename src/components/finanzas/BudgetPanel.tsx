import StatsCard from '../common/StatsCard';
import { Wallet, BadgeDollarSign, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface Props {
  transferBudget: number;
  wageBudget: number;
  balance: number;
  prevBalance?: number;
}

const BudgetPanel = ({ transferBudget, wageBudget, balance, prevBalance = 0 }: Props) => {
  const trend: 'up' | 'down' | 'neutral' =
    balance > prevBalance ? 'up' : balance < prevBalance ? 'down' : 'neutral';
  const trendValue = formatCurrency(Math.abs(balance - prevBalance));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatsCard
        title="Presupuesto de Fichajes"
        value={formatCurrency(transferBudget)}
        icon={<BadgeDollarSign size={24} className="text-green-400" />}
      />
      <StatsCard
        title="Presupuesto Salarial"
        value={formatCurrency(wageBudget)}
        icon={<Wallet size={24} className="text-yellow-400" />}
      />
      <StatsCard
        title="Balance Actual"
        value={formatCurrency(balance)}
        icon={<PiggyBank size={24} className="text-primary" />}
        trend={trend}
        trendValue={trendValue}
      />
    </div>
  );
};

export default BudgetPanel;
