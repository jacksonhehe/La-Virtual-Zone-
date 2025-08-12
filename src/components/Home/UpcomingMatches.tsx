import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUpcomingMatches } from '../../services/matches';
import { formatDate, formatTime } from '../../utils/helpers';
import type { MatchWithClubs } from '../../types/supabase';

const UpcomingMatches = () => {
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithClubs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      try {
        setLoading(true);
        const { data, error } = await getUpcomingMatches(5);
        
        if (error) {
          setError(error.message);
        } else if (data) {
          setUpcomingMatches(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar partidos');
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMatches();
  }, []);

  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Partidos</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Partidos</h2>
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  if (upcomingMatches.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Partidos</h2>
        <p className="text-gray-400">No hay partidos programados próximamente.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Próximos Partidos</h2>
          <Link 
            to="/liga-master/fixture" 
            className="text-primary hover:text-primary-light flex items-center text-sm"
          >
            <span>Ver fixture</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800">
        {upcomingMatches.map((match) => (
          <div key={match.id} className="p-4">
            <div className="text-sm text-gray-300">
              {formatDate(match.played_at)} - {formatTime(match.played_at)}
            </div>
            
            <div className="flex items-center justify-between my-3">
              <div className="flex items-center space-x-3">
                <img 
                  src={match.home_club?.logo || '/default-club-logo.png'} 
                  alt={match.home_club?.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/default-club-logo.png';
                  }}
                />
                <span className="font-medium">{match.home_club?.name}</span>
              </div>
              <span className="text-gray-400 mx-4">vs</span>
              <div className="flex items-center space-x-3">
                <span className="font-medium">{match.away_club?.name}</span>
                <img 
                  src={match.away_club?.logo || '/default-club-logo.png'} 
                  alt={match.away_club?.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/default-club-logo.png';
                  }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-400 text-center">
              {match.tournament_id ? `Torneo ${match.tournament_id}` : 'Partido amistoso'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingMatches;
 