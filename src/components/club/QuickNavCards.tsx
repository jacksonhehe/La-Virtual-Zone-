import { Link } from 'react-router-dom';
import { Users, Layout, DollarSign, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

interface QuickNavCardsProps {
  clubSlug: string;
  playersCount: number;
  formation: string;
  budget: number;
  marketOpen: boolean;
}

const QuickNavCards = ({
  clubSlug,
  playersCount,
  formation,
  budget,
  marketOpen
}: QuickNavCardsProps) => (
  <section className="mb-8 grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-4">
    <Link
      to={`/liga-master/club/${clubSlug}/plantilla`}
      className="card card-hover p-4 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Plantilla del club"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Plantilla</p>
          <p className="text-xl font-bold">{playersCount} jugadores</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg ml-4">
          <Users size={20} className="text-purple-400" />
        </div>
      </div>
    </Link>

    <Link
      to="/liga-master/tacticas"
      className="card card-hover p-4 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Tácticas del club"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Táctica</p>
          <p className="text-xl font-bold">{formation}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg ml-4">
          <Layout size={20} className="text-blue-400" />
        </div>
      </div>
    </Link>

    <Link
      to={`/liga-master/club/${clubSlug}/finanzas`}
      className="card card-hover p-4 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Finanzas del club"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Finanzas</p>
          <p className="text-xl font-bold">{formatCurrency(budget)}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg ml-4">
          <DollarSign size={20} className="text-green-400" />
        </div>
      </div>
    </Link>

    <Link
      to="/liga-master/mercado"
      className="card card-hover p-4 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Estado del mercado"
      tabIndex={0}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-2">Mercado</p>
          <p className="text-xl font-bold">{marketOpen ? 'Abierto' : 'Cerrado'}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg ml-4">
          <TrendingUp size={20} className="text-yellow-400" />
        </div>
      </div>
    </Link>
  </section>
);

export default QuickNavCards;
