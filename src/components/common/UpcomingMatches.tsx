import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface UpcomingMatchesProps {
  matches: any[];
  clubs: any[];
}

const UpcomingMatches: React.FC<UpcomingMatchesProps> = ({ matches, clubs }) => {
  const getClub = (name: string) => {
    return clubs.find(c => c.name === name);
  };

  const getMatchStatus = (match: any) => {
    const matchDate = new Date(match.date);
    const now = new Date();
    const diffTime = matchDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Hoy', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    } else if (diffDays === 1) {
      return { text: 'Mañana', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    } else if (diffDays <= 7) {
      return { text: 'Esta semana', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    } else {
      return { text: 'Próximamente', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold">Próximos Partidos</h2>
          </div>
          <Link 
            to="/liga-master/fixture" 
            className="text-primary hover:text-primary-light flex items-center text-sm transition-colors duration-200 group"
          >
            <span>Ver fixture</span>
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>
      
      <div className="divide-y divide-gray-800">
        {matches.length > 0 ? (
          matches.map((match, index) => {
            const homeClub = getClub(match.homeTeam);
            const awayClub = getClub(match.awayTeam);
            const status = getMatchStatus(match);

            return (
              <div
                key={match.id}
                className="p-6 hover:bg-gray-800/30 transition-all duration-300 group"
              >
                {/* Match header with status */}
                <div className="flex justify-between items-center mb-4">
                                     <div className="flex items-center space-x-3">
                     <div className={`match-status-badge ${status.bgColor} ${status.color}`}>
                       {status.text}
                     </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="w-4 h-4 mr-1" />
                      {formatDate(match.date)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    Jornada {match.round}
                  </div>
                </div>
                
                {/* Teams and VS */}
                <div className="flex items-center justify-between">
                  {/* Home team */}
                  <div className="flex flex-col items-center flex-1 group/team">
                    <div className="relative mb-3">
                                           <img
                       src={homeClub?.logo}
                       alt={homeClub?.name}
                       className="w-16 h-16 sm:w-20 sm:h-20 object-contain team-hover-effect"
                     />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/team:opacity-100 transition-opacity duration-200"></div>
                    </div>
                                         <span className="font-semibold text-center text-white team-name-hover">
                       {homeClub?.name}
                     </span>
                  </div>

                  {/* VS with enhanced styling */}
                                     <div className="flex flex-col items-center mx-6">
                     <div className="relative vs-glow-effect">
                       <div className="text-3xl sm:text-4xl font-bold neon-text-blue mb-2">
                         VS
                       </div>
                     </div>
                    
                    {/* Match time */}
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date(match.date).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  
                  {/* Away team */}
                  <div className="flex flex-col items-center flex-1 group/team">
                    <div className="relative mb-3">
                                           <img
                       src={awayClub?.logo}
                       alt={awayClub?.name}
                       className="w-16 h-16 sm:w-20 sm:h-20 object-contain team-hover-effect"
                     />
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover/team:opacity-100 transition-opacity duration-200"></div>
                    </div>
                                         <span className="font-semibold text-center text-white team-name-hover">
                       {awayClub?.name}
                     </span>
                  </div>
                </div>

                {/* Match details */}
                <div className="mt-4 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>Estadio Virtual</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-3 h-3 mr-1" />
                      <span>Liga Master</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No hay partidos próximos</h3>
            <p className="text-gray-400">No hay partidos programados en las próximas fechas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingMatches; 