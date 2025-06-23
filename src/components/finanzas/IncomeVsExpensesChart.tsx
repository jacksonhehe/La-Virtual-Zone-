interface DataPoint {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  data: DataPoint[];
}

const IncomeVsExpensesChart = ({ data }: Props) => {
  const max = Math.max(
    ...data.map(d => Math.max(d.income, d.expenses))
  );

  return (
    <div className="h-56 flex items-end space-x-2">
      {data.map(d => (
        <div key={d.month} className="flex-1 text-center">
          <div className="flex items-end justify-center h-full space-x-1">
            <div
              className="bg-green-500/70 w-3"
              style={{ height: `${(d.income / max) * 100}%` }}
            ></div>
            <div
              className="bg-red-500/70 w-3"
              style={{ height: `${(d.expenses / max) * 100}%` }}
            ></div>
          </div>
          <div className="mt-1 text-xs text-gray-400">{d.month}</div>
        </div>
      ))}
    </div>
  );
};

export default IncomeVsExpensesChart;
