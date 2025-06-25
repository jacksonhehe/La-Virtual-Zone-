interface DataPoint {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  data: DataPoint[];
  currentBalance: number;
}

const SeasonEndProjection = ({ data, currentBalance }: Props) => {
  const totalIncome = data.reduce((sum, d) => sum + d.income, 0);
  const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0);
  const avgMonthly = (totalIncome - totalExpenses) / data.length;
  const projection = Math.round(currentBalance + avgMonthly * (12 - data.length));

  return (
    <div className="card p-4 text-center">
      <h4 className="font-bold mb-2">Saldo fin de temporada</h4>
      <p className="text-2xl font-bold">{projection.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
      <p className="text-sm text-gray-400">Proyección basada en rendimiento actual</p>
    </div>
  );
};

export default SeasonEndProjection;
