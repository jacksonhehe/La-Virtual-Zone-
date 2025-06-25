import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('clubs');
  const [season, setSeason] = useState('2025');
  
  const { clubs, players, standings } = useDataStore();
  
  // Get top scorers
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);
  
  // Get top assisters
  const topAssisters = [...players]
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 10);
  
  // Get top DTs (based on club standings)
  const topManagers = standings
    .slice(0, 10)
    .map(standing => {
      const club = clubs.find(c => c.id === standing.clubId);
      return {
        name: club?.manager || 'Unknown',
        club: club?.name || 'Unknown',
        clubLogo: club?.logo || '',
        points: standing.points,
        winRate: standing.played > 0 ? Math.round((standing.won / standing.played) * 100) : 0
      };
    });
  
  return (
    <div>
      <PageHeader 
        title="Rankings" 
        subtitle="Clasificaciones, estadísticas y datos de clubes, jugadores y DTs de La Virtual Zone."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjM5OTA5NDB8&ixlib=rb-4.0.3"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
            <button 
              onClick={() => setActiveTab('clubs')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg ${activeTab === 'clubs' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Clubes
            </button>
            <button 
              onClick={() => setActiveTab('scorers')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg ${activeTab === 'scorers' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Goleadores
            </button>
            <button 
              onClick={() => setActiveTab('assisters')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg ${activeTab === 'assisters' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              Asistentes
            </button>
            <button 
              onClick={() => setActiveTab('managers')}
              className={`whitespace-nowrap px-4 py-2 rounded-lg ${activeTab === 'managers' ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            >
              DTs
            </button>
          </div>
          
          <div className="inline-flex">
            <select
              className="input py-2"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
            >
              <option value="2025">Temporada 2025</option>
              <option value="2024">Temporada 2024</option>
              <option value="2023">Temporada 2023</option>
            </select>
          </div>
        </div>
        
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Clubs Ranking */}
        {activeTab === 'clubs' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Clasificación de Clubes</h2>
              <p className="text-gray-400 text-sm">Temporada {season}</p>
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
                    <th className="font-medium p-4 text-center">GF</th>
                    <th className="font-medium p-4 text-center">GC</th>
                    <th className="font-medium p-4 text-center">DG</th>
                    <th className="font-medium p-4 text-center">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {standings.map((team, index) => {
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
                            to={`/liga-master/club/${club?.slug ?? ''}`}
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
                        <td className="p-4 text-center text-gray-400">{team.goalsFor}</td>
                        <td className="p-4 text-center text-gray-400">{team.goalsAgainst}</td>
                        <td className="p-4 text-center text-gray-400">{team.goalsFor - team.goalsAgainst}</td>
                        <td className="p-4 text-center font-bold">{team.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Top Scorers */}
        {activeTab === 'scorers' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Máximos Goleadores</h2>
              <p className="text-gray-400 text-sm">Temporada {season}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-800">
                    <th className="font-medium p-4 text-left">Pos</th>
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Goles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {topScorers.map((player, index) => {
                    const club = clubs.find(c => c.id === player.clubId);
                    
                    return (
                      <tr key={player.id} className="hover:bg-gray-800/50">
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
                          <div className="flex items-center">
                            <img 
                              src={player.image}
                              alt={player.name}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={club?.logo}
                              alt={club?.name}
                              className="w-6 h-6 mr-2"
                            />
                            <span>{club?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                            ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                            ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-400">{player.appearances}</td>
                        <td className="p-4 text-center font-bold">{player.goals}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Top Assisters */}
        {activeTab === 'assisters' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Máximos Asistentes</h2>
              <p className="text-gray-400 text-sm">Temporada {season}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-800">
                    <th className="font-medium p-4 text-left">Pos</th>
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Asistencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {topAssisters.map((player, index) => {
                    const club = clubs.find(c => c.id === player.clubId);
                    
                    return (
                      <tr key={player.id} className="hover:bg-gray-800/50">
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
                          <div className="flex items-center">
                            <img 
                              src={player.image}
                              alt={player.name}
                              className="w-8 h-8 rounded-full mr-2 object-cover"
                            />
                            <span className="font-medium">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={club?.logo}
                              alt={club?.name}
                              className="w-6 h-6 mr-2"
                            />
                            <span>{club?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                            player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                            ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                            ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-400">{player.appearances}</td>
                        <td className="p-4 text-center font-bold">{player.assists}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Top Managers */}
        {activeTab === 'managers' && (
          <div className="card">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold">Mejores DTs</h2>
              <p className="text-gray-400 text-sm">Temporada {season}</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-800">
                    <th className="font-medium p-4 text-left">Pos</th>
                    <th className="font-medium p-4 text-left">DT</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Puntos</th>
                    <th className="font-medium p-4 text-center">% Victorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {topManagers.map((manager, index) => (
                    <tr key={index} className="hover:bg-gray-800/50">
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
                          to={`/usuarios/${manager.name}`}
                          className="font-medium hover:text-primary"
                        >
                          {manager.name}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <img 
                            src={manager.clubLogo}
                            alt={manager.club}
                            className="w-6 h-6 mr-2"
                          />
                          <span>{manager.club}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-bold">{manager.points}</td>
                      <td className="p-4 text-center text-gray-300">{manager.winRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rankings;
 