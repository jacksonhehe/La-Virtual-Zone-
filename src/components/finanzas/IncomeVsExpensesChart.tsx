
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import financeHistory from "../../data/financeHistory.json";

const ranges = {
  "3m": 3,
  "6m": 6,
  "12m": 12,
} as const;

const IncomeVsExpensesChart: React.FC = () => {
  const [range, setRange] = useState<"3m" | "6m" | "12m">("6m");

  const data = financeHistory.slice(-ranges[range]);

  return (
    <div className="rounded bg-zinc-800 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Ingresos vs Gastos</h3>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as any)}
          className="rounded bg-zinc-700 p-1 text-xs"
        >
          <option value="3m">3 meses</option>
          <option value="6m">6 meses</option>
          <option value="12m">12 meses</option>
        </select>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" stackId="a" />
          <Bar dataKey="expenses" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeVsExpensesChart;
