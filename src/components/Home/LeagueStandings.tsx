import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import slugify from '../../utils/slugify';

const LeagueStandings = () => {
  const { standings, clubs } = useDataStore();
  
  // Get top 5 teams
  const topTeams = standings.slice(0, 5);
  
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
            {topTeams.map((team, index) => {
              const club = clubs.find(c => c.id === team.clubId);
              
              return (
                <tr key={team.clubId} className="hover:bg-gray-800/50">
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
                      to={`/liga-master/club/${club ? slugify(club.name) : ''}`}
                      className="flex items-center"
                    >
                      <img 
                        src={club?.logo}
                        alt={club?.name}
                        className="w-6 h-6 mr-2"
                      />
                      <span className="font-medium">{club?.name}</span>
                    </Link>
                  </td>
                  <td className="p-4 text-center text-gray-400">{team.played}</td>
                  <td className="p-4 text-center text-gray-400">{team.won}</td>
                  <td className="p-4 text-center text-gray-400">{team.drawn}</td>
                  <td className="p-4 text-center text-gray-400">{team.lost}</td>
                  <td className="p-4 text-center font-bold">{team.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueStandings;
 