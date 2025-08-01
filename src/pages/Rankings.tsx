import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Award, Target, Users, TrendingUp, Star, Crown, Shield, Zap } from 'lucide-react';
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

  // Calculate league statistics
  const leagueStats = {
    totalMatches: standings.reduce((sum, team) => sum + team.played, 0) / 2,
    totalGoals: standings.reduce((sum, team) => sum + team.goalsFor, 0),
    avgGoalsPerMatch: standings.reduce((sum, team) => sum + team.goalsFor, 0) / (standings.reduce((sum, team) => sum + team.played, 0) / 2),
    topScorer: topScorers[0]?.name || 'N/A',
    topScorerGoals: topScorers[0]?.goals || 0,
    topAssister: topAssisters[0]?.name || 'N/A',
    topAssisterAssists: topAssisters[0]?.assists || 0
  };

  const getPositionBadge = (index: number) => {
    const baseClasses = "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm";
    switch (index) {
      case 0:
        return `${baseClasses} bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 shadow-lg`;
      case 1:
        return `${baseClasses} bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900 shadow-lg`;
      case 2:
        return `${baseClasses} bg-gradient-to-br from-amber-500 to-amber-700 text-amber-900 shadow-lg`;
      default:
        return `${baseClasses} bg-gray-700/50 text-gray-300 border border-gray-600`;
    }
  };

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-4 h-4" />;
      case 1:
        return <Medal className="w-4 h-4" />;
      case 2:
        return <Award className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getPositionBadgeColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 1:
        return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
      case 2:
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-700/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark">
      <PageHeader 
        title="Rankings & Estadísticas" 
        subtitle="Clasificaciones, goleadores, asistentes y mejores DTs de la Liga Master"
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHJhbmRvbXx8fHx8fHx8fDE3MjM5OTA5NDB8&ixlib=rb-4.0.3"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Estadísticas de la Liga */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-xl p-6 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">Partidos Jugados</p>
                <p className="text-2xl font-bold text-white">{leagueStats.totalMatches}</p>
              </div>
              <Target className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-xl p-6 border border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Goles Marcados</p>
                <p className="text-2xl font-bold text-white">{leagueStats.totalGoals}</p>
              </div>
              <Zap className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Promedio Goles</p>
                <p className="text-2xl font-bold text-white">{leagueStats.avgGoalsPerMatch.toFixed(1)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 rounded-xl p-6 border border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm font-medium">Pichichi</p>
                <p className="text-lg font-bold text-white">{leagueStats.topScorer}</p>
                <p className="text-sm text-orange-400">{leagueStats.topScorerGoals} goles</p>
              </div>
              <Star className="w-8 h-8 text-orange-400" />
            </div>
          </div>
        </div>

        {/* Navegación y Filtros */}
        <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex space-x-2 overflow-x-auto pb-2 lg:pb-0">
              <button 
                onClick={() => setActiveTab('clubs')}
                className={`whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'clubs' 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Clasificación
              </button>
              <button 
                onClick={() => setActiveTab('scorers')}
                className={`whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'scorers' 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Target className="w-4 h-4" />
                Goleadores
              </button>
              <button 
                onClick={() => setActiveTab('assisters')}
                className={`whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'assisters' 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Asistentes
              </button>
              <button 
                onClick={() => setActiveTab('managers')}
                className={`whitespace-nowrap px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'managers' 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                Mejores DTs
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <select
                  className="input bg-dark border-gray-600 text-sm"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                >
                  <option value="2025">Temporada 2025</option>
                  <option value="2024">Temporada 2024</option>
                  <option value="2023">Temporada 2023</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light transition-colors"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Clubs Ranking */}
        {activeTab === 'clubs' && (
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Clasificación de Clubes</h2>
                  <p className="text-gray-400 text-sm">Temporada {season} - Liga Master</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-700/50 bg-gray-800/30">
                    <th className="font-medium p-4 text-center">Pos</th>
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
                <tbody className="divide-y divide-gray-700/50">
                  {standings.map((team, index) => {
                    const club = clubs.find(c => c.id === team.clubId);
                    
                    return (
                      <tr key={team.clubId} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 text-center">
                          <div className={getPositionBadge(index)}>
                            {getPositionIcon(index) || (index + 1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/liga-master/club/${club?.slug ?? ''}`}
                            className="flex items-center hover:opacity-80 transition-opacity"
                          >
                            <img 
                              src={club?.logo}
                              alt={club?.name}
                              className="w-8 h-8 mr-3 rounded-lg"
                            />
                            <span className="font-medium text-white">{club?.name}</span>
                          </Link>
                        </td>
                        <td className="p-4 text-center text-gray-300">{team.played}</td>
                        <td className="p-4 text-center text-green-400 font-medium">{team.won}</td>
                        <td className="p-4 text-center text-yellow-400 font-medium">{team.drawn}</td>
                        <td className="p-4 text-center text-red-400 font-medium">{team.lost}</td>
                        <td className="p-4 text-center text-blue-400 font-medium">{team.goalsFor}</td>
                        <td className="p-4 text-center text-red-400 font-medium">{team.goalsAgainst}</td>
                        <td className="p-4 text-center">
                          <span className={`font-medium ${team.goalsFor - team.goalsAgainst > 0 ? 'text-green-400' : team.goalsFor - team.goalsAgainst < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {team.goalsFor - team.goalsAgainst > 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-lg text-white">{team.points}</span>
                        </td>
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
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <Target className="w-6 h-6 text-red-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Máximos Goleadores</h2>
                  <p className="text-gray-400 text-sm">Temporada {season} - Pichichi</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-700/50 bg-gray-800/30">
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Goles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topScorers.map((player, index) => {
                    const club = clubs.find(c => c.id === player.clubId);
                    
                    return (
                      <tr key={player.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 text-center">
                          <div className={getPositionBadge(index)}>
                            {getPositionIcon(index) || (index + 1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={player.image}
                              alt={player.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-600"
                            />
                            <span className="font-medium text-white">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={club?.logo}
                              alt={club?.name}
                              className="w-6 h-6 mr-2 rounded"
                            />
                            <span className="text-gray-300">{club?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-300">{player.appearances}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-xl text-red-400">{player.goals}</span>
                        </td>
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
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Máximos Asistentes</h2>
                  <p className="text-gray-400 text-sm">Temporada {season} - Asistencias</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-700/50 bg-gray-800/30">
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-left">Jugador</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-center">PJ</th>
                    <th className="font-medium p-4 text-center">Asistencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topAssisters.map((player, index) => {
                    const club = clubs.find(c => c.id === player.clubId);
                    
                    return (
                      <tr key={player.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 text-center">
                          <div className={getPositionBadge(index)}>
                            {getPositionIcon(index) || (index + 1)}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={player.image}
                              alt={player.name}
                              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-gray-600"
                            />
                            <span className="font-medium text-white">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center">
                            <img 
                              src={club?.logo}
                              alt={club?.name}
                              className="w-6 h-6 mr-2 rounded"
                            />
                            <span className="text-gray-300">{club?.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {player.position}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-300">{player.appearances}</td>
                        <td className="p-4 text-center">
                          <span className="font-bold text-xl text-blue-400">{player.assists}</span>
                        </td>
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
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl border border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-purple-400" />
                <div>
                  <h2 className="text-xl font-bold text-white">Mejores Directores Técnicos</h2>
                  <p className="text-gray-400 text-sm">Temporada {season} - Ranking DTs</p>
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-700/50 bg-gray-800/30">
                    <th className="font-medium p-4 text-center">Pos</th>
                    <th className="font-medium p-4 text-left">DT</th>
                    <th className="font-medium p-4 text-left">Club</th>
                    <th className="font-medium p-4 text-center">Puntos</th>
                    <th className="font-medium p-4 text-center">% Victorias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topManagers.map((manager, index) => (
                    <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                      <td className="p-4 text-center">
                        <div className={getPositionBadge(index)}>
                          {getPositionIcon(index) || (index + 1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/usuarios/${manager.name}`}
                          className="font-medium text-white hover:text-primary transition-colors"
                        >
                          {manager.name}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <img 
                            src={manager.clubLogo}
                            alt={manager.club}
                            className="w-6 h-6 mr-2 rounded"
                          />
                          <span className="text-gray-300">{manager.club}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-lg text-purple-400">{manager.points}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-medium ${manager.winRate >= 60 ? 'text-green-400' : manager.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {manager.winRate}%
                        </span>
                      </td>
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
 