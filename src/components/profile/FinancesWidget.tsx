import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

// TODO: Replace mock data with real user finances
const data = [
  { month: 'Ene', income: 120000, expenses: 90000 },
  { month: 'Feb', income: 95000, expenses: 85000 },
  { month: 'Mar', income: 110000, expenses: 97000 },
];

const FinancesWidget = () => (
  <div className="card p-4">
    <h3 className="font-bold mb-3">Finanzas</h3>
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="month" stroke="#9ca3af" />
          <YAxis stroke="#9ca3af" />
          <Tooltip formatter={(v: number) => [`€${v.toLocaleString()}`, '']} />
          <Bar dataKey="income" fill="#10B981" />
          <Bar dataKey="expenses" fill="#EF4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default FinancesWidget;
