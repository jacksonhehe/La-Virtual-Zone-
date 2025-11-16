import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatDate, formatTime } from '../../utils/format';
import { getUpcomingMatches, getMatchesByTournament } from '../../utils/matchService';

const UpcomingMatches = () => {
  const { tournaments, clubs } = useDataStore();
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadUpcomingMatches = async () => {
      setLoading(true);
      try {
        // Find active tournament
        const activeTournament = tournaments.find(t => t.status === 'active');
        
        if (!activeTournament) {
          setUpcomingMatches([]);
          return;
        }
        
        // Get upcoming matches from independent table
        const matches = await getMatchesByTournament(activeTournament.id);
        const upcoming = matches
          .filter(match => match.status === 'scheduled')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 3);
        
        setUpcomingMatches(upcoming);
      } catch (error) {
        console.error('Error loading upcoming matches:', error);
        setUpcomingMatches([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadUpcomingMatches();
  }, [tournaments]);
  
  // Find active tournament
  const activeTournament = tournaments.find(t => t.status === 'active');
  
  if (loading) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Partidos</h2>
        <p className="text-gray-400">Cargando...</p>
      </div>
    );
  }
  
  if (!activeTournament) {
    return (
      <div className="card p-6">
        <h2 className="text-xl font-bold mb-4">Próximos Partidos</h2>
        <p className="text-gray-400">No hay torneos activos en este momento.</p>
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
        {upcomingMatches.map((match) => {
          const homeClub = clubs.find(c => c.name === match.homeTeam);
          const awayClub = clubs.find(c => c.name === match.awayTeam);
          
          return (
            <div key={match.id} className="p-4">
              <div className="text-sm text-gray-300">
                {formatDate(match.date)} - {formatTime(match.date)}
              </div>
              
              <div className="flex items-center justify-between my-3">
                <div className="flex items-center space-x-3">
                  <img 
                    src={homeClub?.logo} 
                    alt={homeClub?.name}
                    className="w-8 h-8 object-contain"
                  />
                  <span className="font-medium">{homeClub?.name}</span>
                </div>
                <span className="text-gray-400 mx-4">vs</span>
                <div className="flex items-center space-x-3">
                  <span className="font-medium">{awayClub?.name}</span>
                  <img 
                    src={awayClub?.logo} 
                    alt={awayClub?.name}
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                Jornada {match.round} • {activeTournament.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingMatches;
 
