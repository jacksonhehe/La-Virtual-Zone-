import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const DtDashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { clubs } = useDataStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'dt' || !user.club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Necesitas ser DT de un club para acceder a esta sección.
      </div>
    );
  }

  const club = clubs.find(c => c.name === user.club);

  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        Club no encontrado.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="card p-6 flex items-center mb-6">
        <img src={club.logo} alt={club.name} className="w-16 h-16 mr-4" />
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">{club.name}</h2>
          <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${club.morale}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Moral del equipo: {club.morale}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default DtDashboard;
