
import IncomeVsExpensesChart from "../components/finanzas/IncomeVsExpensesChart";

const FinanzasPage: React.FC = () => (
  <section className="p-4">
    <h1 className="mb-4 text-xl font-bold">Mis Finanzas</h1>
    <IncomeVsExpensesChart />
    {/* Otros widgets de presupuesto e historial pueden ir aquí */}
  </section>
);

export default FinanzasPage;
