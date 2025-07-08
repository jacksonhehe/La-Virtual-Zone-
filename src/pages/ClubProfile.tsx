import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Calendar, 
  Users, 
  Award, 
  Briefcase, 
  Trophy,
  Star
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import { useDataStore } from '../store/dataStore';
import { formatDate, formatCurrency, getMatchResult } from '../utils/helpers';

const ClubProfile = () => {
  const { clubName } = useParams<{ clubName: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  
  const { clubs, players, tournaments } = useDataStore();
  
  // Find club by slug
  const club = clubs.find(c => c.slug === clubName);
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Club no encontrado</h2>
        <p className="text-gray-400 mb-6">
          El club que estás buscando no existe o ha sido eliminado.
        </p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }
  
  // Get club players
  const clubPlayers = players.filter(p => p.clubId === club.id);
  
  // Get club matches
  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  const clubMatches = ligaMaster ? ligaMaster.matches.filter(m => 
    m.homeTeam === club.name || m.awayTeam === club.name
  ) : [];
  
  // Get recent results (last 5 finished matches)
  const recentMatches = [...clubMatches]
    .filter(m => m.status === 'finished' && m.homeScore !== undefined && m.awayScore !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  // Get upcoming matches
  const upcomingMatches = [...clubMatches]
    .filter(m => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);
  
  // Calculate team stats
  const teamStats = clubMatches.reduce((stats, match) => {
    if (match.status !== 'finished' || match.homeScore === undefined || match.awayScore === undefined) {
      return stats;
    }
    
    stats.played++;
    
    const result = getMatchResult(match, club.name);
    if (result === 'win') {
      stats.wins++;
      stats.points += 3;
    } else if (result === 'draw') {
      stats.draws++;
      stats.points += 1;
    } else if (result === 'loss') {
      stats.losses++;
    }
    
    if (match.homeTeam === club.name) {
      stats.goalsFor += match.homeScore;
      stats.goalsAgainst += match.awayScore;
    } else {
      stats.goalsFor += match.awayScore;
      stats.goalsAgainst += match.homeScore;
    }
    
    return stats;
  }, {
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    points: 0
  });
  
  return (
    <div>
      <PageHeader 
        title={club.name} 
        subtitle={`Club fundado en ${club.foundedYear}. ${club.description}`}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/liga-master"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Liga Master</span>
          </Link>
        </div>
        
        {/* Club overview */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-1/3">
            <div className="card p-6 text-center">
              <img 
                src={club.logo} 
                alt={club.name}
                className="w-32 h-32 mx-auto mb-4"
              />
              <h1 className="text-2xl font-bold mb-1">{club.name}</h1>
              <p className="text-gray-400 mb-4">
                {club.stadium} • {club.playStyle}
              </p>
              
              <div className="flex justify-center space-x-4 mb-6">
                {club.titles.map((title, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Trophy size={24} className="text-yellow-400 mb-1" />
                    <span className="text-sm">{title.name}</span>
                    <span className="text-xs text-gray-400">{title.year}</span>
                  </div>
                ))}
                {club.titles.length === 0 && (
                  <div className="text-gray-400 text-sm">
                    Sin títulos
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-800 pt-4 mb-4">
                <h3 className="font-bold mb-3">Director Técnico</h3>
                <div className="flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                    <Users size={24} className="text-gray-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{club.manager}</p>
                    <p className="text-sm text-gray-400">DT desde {club.foundedYear}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to={`/liga-master/club/${club.slug}/plantilla`}
                  className="btn-secondary text-sm"
                >
                  <Users size={16} className="mr-2" />
                  Ver Plantilla
                </Link>
                <Link
                  to={`/liga-master/club/${club.slug}/finanzas`}
                  className="btn-secondary text-sm"
                >
                  <Briefcase size={16} className="mr-2" />
                  Ver Finanzas
                </Link>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatsCard 
                title="Partidos" 
                value={teamStats.played.toString()}
                icon={<Calendar size={24} className="text-primary" />}
              />
              <StatsCard 
                title="Victorias" 
                value={teamStats.wins.toString()}
                icon={<Award size={24} className="text-green-400" />}
              />
              <StatsCard 
                title="Goles" 
                value={`${teamStats.goalsFor} - ${teamStats.goalsAgainst}`}
                icon={<Star size={24} className="text-yellow-400" />}
                trend={teamStats.goalsFor > teamStats.goalsAgainst ? "up" : teamStats.goalsFor < teamStats.goalsAgainst ? "down" : "neutral"}
                trendValue={`${teamStats.goalsFor - teamStats.goalsAgainst}`}
              />
              <StatsCard 
                title="Presupuesto" 
                value={formatCurrency(club.budget)}
                icon={<Briefcase size={24} className="text-primary" />}
              />
            </div>
            
            {/* Tabs */}
            <div className="card">
              <div className="border-b border-gray-800">
                <div className="flex space-x-2 overflow-x-auto">
                  <button 
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-3 whitespace-nowrap font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    Visión General
                  </button>
                  <button 
                    onClick={() => setActiveTab('results')}
                    className={`px-4 py-3 whitespace-nowrap font-medium ${activeTab === 'results' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    Resultados
                  </button>
                  <button 
                    onClick={() => setActiveTab('squad')}
                    className={`px-4 py-3 whitespace-nowrap font-medium ${activeTab === 'squad' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
                  >
                    Plantilla
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {/* Overview tab */}
                {activeTab === 'overview' && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Club info */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Información del Club</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Fundado</span>
                            <span>{club.foundedYear}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Estadio</span>
                            <span>{club.stadium}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Estilo de Juego</span>
                            <span>{club.playStyle}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Presupuesto</span>
                            <span>{formatCurrency(club.budget)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Reputación</span>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={16}
                                  className={i < Math.round(club.reputation / 20) ? "text-yellow-400" : "text-gray-700"}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-400">Moral</span>
                            <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-500"
                                style={{ width: `${club.morale ?? 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Upcoming matches */}
                      <div>
                        <h3 className="text-lg font-bold mb-4">Próximos Partidos</h3>
                        {upcomingMatches.length > 0 ? (
                          <div className="space-y-4">
                            {upcomingMatches.map(match => {
                              const opponent = match.homeTeam === club.name ? match.awayTeam : match.homeTeam;
                              const opponentClub = clubs.find(c => c.name === opponent);
                              const isHome = match.homeTeam === club.name;
                              
                              return (
                                <div key={match.id} className="flex items-center p-3 bg-gray-800 rounded-lg">
                                  <div className="w-12 h-12 flex items-center justify-center mr-3">
                                    <img 
                                      src={opponentClub?.logo} 
                                      alt={opponentClub?.name}
                                      className="w-10 h-10 object-contain"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {isHome ? 'vs' : '@'} {opponent}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {formatDate(match.date)} • Jornada {match.round}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400">No hay partidos programados próximamente.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Club titles */}
                    <div className="mt-6">
                      <h3 className="text-lg font-bold mb-4">Títulos y Logros</h3>
                      {club.titles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {club.titles.map((title, index) => (
                            <div key={index} className="p-4 bg-gray-800 rounded-lg flex items-center">
                              <Trophy size={24} className="text-yellow-400 mr-3" />
                              <div>
                                <p className="font-medium">{title.name}</p>
                                <p className="text-sm text-gray-400">{title.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400">Este club aún no ha conseguido títulos.</p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Results tab */}
                {activeTab === 'results' && (
                  <div>
                    <h3 className="text-lg font-bold mb-4">Resultados Recientes</h3>
                    {recentMatches.length > 0 ? (
                      <div className="space-y-4">
                        {recentMatches.map(match => {
                          const isHome = match.homeTeam === club.name;
                          const opponent = isHome ? match.awayTeam : match.homeTeam;
                          const opponentClub = clubs.find(c => c.name === opponent);
                          const result = getMatchResult(match, club.name);
                          const score = isHome 
                            ? `${match.homeScore} - ${match.awayScore}` 
                            : `${match.awayScore} - ${match.homeScore}`;
                          
                          return (
                            <div 
                              key={match.id} 
                              className={`p-4 rounded-lg flex items-center justify-between ${
                                result === 'win' ? 'bg-green-500/10 border border-green-500/20' :
                                result === 'loss' ? 'bg-red-500/10 border border-red-500/20' :
                                'bg-gray-700/30 border border-gray-700'
                              }`}
                            >
                              <div className="flex items-center">
                                <div className="w-10 h-10 flex items-center justify-center mr-3">
                                  <img 
                                    src={opponentClub?.logo} 
                                    alt={opponentClub?.name}
                                    className="w-8 h-8 object-contain"
                                  />
                                </div>
                                <div>
                                  <p className="font-medium">
                                    {isHome ? 'vs' : '@'} {opponent}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {formatDate(match.date)} • Jornada {match.round}
                                  </p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className={`text-lg font-bold ${
                                  result === 'win' ? 'text-green-400' :
                                  result === 'loss' ? 'text-red-400' :
                                  'text-gray-300'
                                }`}>
                                  {score}
                                </div>
                                <div className="text-xs">
                                  {result === 'win' && <span className="text-green-400">Victoria</span>}
                                  {result === 'loss' && <span className="text-red-400">Derrota</span>}
                                  {result === 'draw' && <span className="text-gray-400">Empate</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400">No hay resultados recientes disponibles.</p>
                    )}
                    
                    <div className="mt-6 text-center">
                      <Link 
                        to="/liga-master/fixture" 
                        className="btn-secondary"
                      >
                        Ver Todos los Partidos
                      </Link>
                    </div>
                  </div>
                )}
                
                {/* Squad tab */}
                {activeTab === 'squad' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">Plantilla del Club</h3>
                      <Link
                        to={`/liga-master/club/${club.slug}/plantilla`}
                        className="text-primary text-sm flex items-center"
                      >
                        Ver Plantilla Completa
                      </Link>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-xs text-gray-400 border-b border-gray-800">
                            <th className="font-medium p-3 text-left">Jugador</th>
                            <th className="font-medium p-3 text-center">Pos</th>
                            <th className="font-medium p-3 text-center">Edad</th>
                            <th className="font-medium p-3 text-center">Media</th>
                            <th className="font-medium p-3 text-center">Goles</th>
                            <th className="font-medium p-3 text-center">Asist.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {clubPlayers
                            .sort((a, b) => b.overall - a.overall)
                            .slice(0, 5)
                            .map(player => (
                              <tr key={player.id} className="hover:bg-gray-800">
                                <td className="p-3">
                                  <div className="flex items-center">
                                    <img 
                                      src={player.image} 
                                      alt={player.name}
                                      className="w-8 h-8 rounded-full object-cover mr-2"
                                    />
                                    <span className="font-medium">{player.name}</span>
                                  </div>
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                                    player.position === 'GK' ? 'bg-yellow-500/20 text-yellow-400' :
                                    ['CB', 'LB', 'RB'].includes(player.position) ? 'bg-blue-500/20 text-blue-400' :
                                    ['CDM', 'CM', 'CAM'].includes(player.position) ? 'bg-green-500/20 text-green-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {player.position}
                                  </span>
                                </td>
                                <td className="p-3 text-center text-gray-300">{player.age}</td>
                                <td className="p-3 text-center font-bold">{player.overall}</td>
                                <td className="p-3 text-center text-gray-300">{player.goals}</td>
                                <td className="p-3 text-center text-gray-300">{player.assists}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {clubPlayers.length === 0 && (
                      <p className="text-gray-400 py-4 text-center">No hay jugadores en la plantilla.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;
 