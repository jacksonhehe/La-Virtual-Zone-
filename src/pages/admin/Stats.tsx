import { useDataStore } from '../../store/dataStore';
import { listUsers } from '../../utils/authService';

const AdminStats = () => {
  const { clubs, players, tournaments, offers, transfers, posts } = useDataStore();
  const users = (() => { try { return listUsers(); } catch { return []; } })();

  const cards = [
    { label: 'Usuarios', value: users.length },
    { label: 'Clubes', value: clubs.length },
    { label: 'Jugadores', value: players.length },
    { label: 'Torneos', value: tournaments.length },
    { label: 'Ofertas', value: offers.length },
    { label: 'Transferencias', value: transfers.length },
    { label: 'Noticias', value: posts.length },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Estadísticas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-dark-light rounded-lg p-6 border border-gray-800">
            <p className="text-gray-400 text-sm mb-1">{c.label}</p>
            <h3 className="text-3xl font-bold">{c.value}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminStats;

