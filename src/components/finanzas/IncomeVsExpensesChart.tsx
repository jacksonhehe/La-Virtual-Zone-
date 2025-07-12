
import React, { Suspense, useState } from "react";
import * as Recharts from 'recharts';
import ChartSkeleton from '../common/ChartSkeleton';
import financeHistory from "../../data/financeHistory.json";

export interface FinanceHistoryEntry {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  data?: FinanceHistoryEntry[];
}

const ranges = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
} as const;

const IncomeVsExpensesChart: React.FC<Props> = ({ data }) => {
  const [range, setRange] = useState<"3m" | "6m" | "12m">("6m");

  const source = data ?? financeHistory;
  const chartData = source.slice(-ranges[range]);

  return (
    <div className="rounded bg-zinc-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Ingresos vs Gastos</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as "3m" | "6m" | "12m")}
          className="rounded bg-zinc-700 p-1 text-xs"
        >
          <option value="3m">3 meses</option>
          <option value="6m">6 meses</option>
          <option value="12m">12 meses</option>
        </select>
      </div>
      <Suspense fallback={<ChartSkeleton />}>
        <Recharts.ResponsiveContainer width="100%" height={300}>
          <Recharts.BarChart data={chartData}>
            <Recharts.XAxis dataKey="month" />
            <Recharts.YAxis />
            <Recharts.Tooltip />
            <Recharts.Legend />
            <Recharts.Bar dataKey="income" stackId="a" />
            <Recharts.Bar dataKey="expenses" stackId="a" />
          </Recharts.BarChart>
        </Recharts.ResponsiveContainer>
      </Suspense>
    </div>
  );
};

export default IncomeVsExpensesChart;
