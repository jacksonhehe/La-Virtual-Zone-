import { Clock, Play, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/admin/StatsCard';
import { useGlobalStore } from '../store/globalStore';

const TorneosDashboard = () => {
  const navigate = useNavigate();
  const { getUpcoming, getActive, getFinished } = useGlobalStore();

  const upcoming = getUpcoming();
  const active = getActive();
  const finished = getFinished();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold gradient-text">Torneos</h1>
        <p className="text-gray-400 mt-2">Resumen general de torneos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/admin/torneos/list?status=upcoming')}
        >
          <StatsCard
            title="Próximos"
            value={upcoming.length}
            icon={Clock}
            gradient="bg-gradient-to-r from-gray-600 to-gray-800"
          />
        </div>
        <div
          className="cursor-pointer"
          onClick={() => navigate('/admin/torneos/list?status=active')}
        >
          <StatsCard
            title="En Juego"
            value={active.length}
            icon={Play}
            gradient="bg-gradient-to-r from-emerald-600 to-green-600"
          />
        </div>
        <div
          className="cursor-pointer"
          onClick={() => navigate('/admin/torneos/list?status=completed')}
        >
          <StatsCard
            title="Cerrados"
            value={finished.length}
            icon={Award}
            gradient="bg-gradient-to-r from-blue-600 to-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default TorneosDashboard;

