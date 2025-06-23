import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';
import { formatCurrency } from '../utils/helpers';
import QuickNavCards from '../components/club/QuickNavCards';

const Tacticas = () => {
  const { user } = useAuthStore();
  const { club, market } = useDataStore();

  if (!user || !club) return <p>Cargando…</p>;

  return (
    <>
      <PageHeader
        title="Tácticas"
        subtitle="Configura la estrategia y la formación de tu equipo."
      />
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6 flex flex-col items-center gap-4 md:flex-row">
          <Link to={`/liga-master/club/${club.slug}`} className="flex items-center gap-3 hover:underline">
            <img src={club.logo} alt="Escudo" className="h-14 w-14 rounded-full" />
            <div>
              <h1 className="text-2xl font-semibold">{club.name}</h1>
              <p className="text-sm text-gray-400">{user.username}</p>
            </div>
          </Link>
          <div className="mt-4 flex flex-col items-center md:ml-auto md:mt-0 md:items-end">
            <span className="text-xs text-gray-400">Presupuesto</span>
            <span className="text-lg font-semibold text-accent">{formatCurrency(club.budget)}</span>
          </div>
        </header>

        <QuickNavCards
          clubSlug={club.slug}
          playersCount={club.players.length}
          formation={club.formation}
          budget={club.budget}
          marketOpen={market.open}
        />

        <h1 className="text-2xl font-bold">Tácticas</h1>
      </div>
    </>
  );
};

export default Tacticas;
