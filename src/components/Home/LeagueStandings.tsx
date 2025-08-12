import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getTopTeams } from '../../services/standings';
import slugify from '../../utils/slugify';
import type { Standing } from '../../types/supabase';

const LeagueStandings = () => {
  const [topTeams, setTopTeams] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopTeams = async () => {
      try {
        setLoading(true);
        // Por ahora usamos el torneo 1 como ejemplo, en el futuro se puede hacer dinámico
        const { data, error } = await getTopTeams(1, 5);
        
        if (error) {
          setError(error.message);
        } else if (data) {
          setTopTeams(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar clasificación');
      } finally {
        setLoading(false);
      }
    };

    fetchTopTeams();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Clasificación Liga Master</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Clasificación Liga Master</h2>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (topTeams.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Clasificación Liga Master</h2>
        <p className="text-gray-400">No hay datos de clasificación disponibles.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Clasificación Liga Master</h2>
          <Link 
            to="/liga-master/rankings" 
            className="text-primary hover:text-primary-light flex items-center text-sm"
          >
            <span>Ver completa</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-800">
              <th className="font-medium p-4 text-left">Pos</th>
              <th className="font-medium p-4 text-left">Club</th>
              <th className="font-medium p-4 text-center">PJ</th>
              <th className="font-medium p-4 text-center">G</th>
              <th className="font-medium p-4 text-center">E</th>
              <th className="font-medium p-4 text-center">P</th>
              <th className="font-medium p-4 text-center">Pts</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {topTeams.map((team, index) => (
              <tr key={team.club_id} className="hover:bg-gray-800/50">
                <td className="p-4 text-center">
                  <span className={`
                    inline-block w-6 h-6 rounded-full font-medium text-sm flex items-center justify-center
                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                      index === 1 ? 'bg-gray-400/20 text-gray-300' : 
                      index === 2 ? 'bg-amber-600/20 text-amber-500' : 'text-gray-400'}
                  `}>
                    {index + 1}
                  </span>
                </td>
                <td className="p-4">
                  <Link
                    to={`/liga-master/club/${slugify(team.club_name)}`}
                    className="flex items-center"
                  >
                    <img 
                      src={team.club_logo || '/default-club-logo.png'}
                      alt={team.club_name}
                      className="w-6 h-6 mr-2"
                      onError={(e) => {
                        e.currentTarget.src = '/default-club-logo.png';
                      }}
                    />
                    <span className="font-medium">{team.club_name}</span>
                  </Link>
                </td>
                <td className="p-4 text-center text-gray-400">{team.gp}</td>
                <td className="p-4 text-center text-gray-400">{team.w}</td>
                <td className="p-4 text-center text-gray-400">{team.d}</td>
                <td className="p-4 text-center text-gray-400">{team.l}</td>
                <td className="p-4 text-center font-bold">{team.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;
 