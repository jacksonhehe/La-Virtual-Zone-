import  { Link } from 'react-router-dom';
import DtDashboard from './DtDashboard';
import { useAuthStore } from '../store/authStore';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  Award, 
  BarChart4, 
  ChevronRight 
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import { useDataStore } from '../store/dataStore';
import { formatDate, formatCurrency } from '../utils/helpers';

const LigaMaster = () => {
  const { user } = useAuthStore();
  const { clubs, tournaments, players, standings, marketStatus } = useDataStore();

  if (user?.role === 'dt' && (user.club || user.clubId)) {
    return <DtDashboard />;
  }
  
  // Get active tournament (Liga Master)
  const ligaMaster = tournaments.find(t => t.id === 'tournament1');
  
  // Get upcoming matches
  const upcomingMatches = ligaMaster 
    ? ligaMaster.matches
      .filter(match => match.status === 'scheduled')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3)
    : [];
  
  // Get top scorers
  const topScorers = [...players]
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5);
  
  return (
    <div>
      <PageHeader 
        title="Liga Master 2025" 
        subtitle="La competición principal de La Virtual Zone. Liga regular con enfrentamientos ida y vuelta entre los 10 equipos participantes."
        image="https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHw2fHxlc3BvcnRzJTIwZ2FtaW5nJTIwdG91cm5hbWVudCUyMGRhcmslMjBuZW9ufGVufDB8fHx8MTc0NzE3MzUxNHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Total de Clubes" 
            value={clubs.length}
            icon={<Users size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Estado del Mercado" 
            value={marketStatus ? "Abierto" : "Cerrado"}
            icon={<TrendingUp size={24} className={marketStatus ? "text-green-400" : "text-red-400"} />}
          />
          <StatsCard 
            title="Presupuesto Medio" 
            value={formatCurrency(clubs.reduce((sum, club) => sum + club.budget, 0) / clubs.length)}
            icon={<Briefcase size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Partidos Disputados" 
            value={ligaMaster ? ligaMaster.matches.filter(m => m.status === 'finished').length : 0}
            icon={<Calendar size={24} className="text-primary" />}
            trend="up"
            trendValue="+3 última semana"
          />
        </div>
        
        {/* Quick access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/liga-master/mercado" className="card card-hover bg-gradient-to-br from-dark to-gray-800 p-6">
            <TrendingUp size={32} className="text-neon-green mb-4" />
            <h3 className="text-xl font-bold mb-2">Mercado de Fichajes</h3>
            <p className="text-gray-400 mb-4">
              Compra y vende jugadores para mejorar tu equipo.
            </p>
            <div className="text-primary flex items-center text-sm font-medium">
              <span>Ir al mercado</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>
          
          <Link to="/liga-master/fixture" className="card card-hover bg-gradient-to-br from-dark to-gray-800 p-6">
            <Calendar size={32} className="text-neon-blue mb-4" />
            <h3 className="text-xl font-bold mb-2">Fixture y Resultados</h3>
            <p className="text-gray-400 mb-4">
              Consulta el calendario de partidos y resultados.
            </p>
            <div className="text-primary flex items-center text-sm font-medium">
              <span>Ver fixture</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>
          
          <Link to="/liga-master/rankings" className="card card-hover bg-gradient-to-br from-dark to-gray-800 p-6">
            <Trophy size={32} className="text-neon-yellow mb-4" />
            <h3 className="text-xl font-bold mb-2">Rankings</h3>
            <p className="text-gray-400 mb-4">
              Clasificaciones y estadísticas de clubes y jugadores.
            </p>
            <div className="text-primary flex items-center text-sm font-medium">
              <span>Ver rankings</span>
              <ChevronRight size={16} className="ml-1" />
            </div>
          </Link>
        </div>
        
        {/* Two columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top teams */}
            <div className="card">
              <div className="p-6 border-b border-gray-800">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Clasificación</h2>
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
                    {standings.slice(0, 5).map((team, index) => {
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
                          <td className="p-4 text-center font-bold">{team.points}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Upcoming matches */}
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
                      <div className="text-sm text-gray-400 text-center mb-3">
                        {formatDate(match.date)} • Jornada {match.round}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col items-center w-2/5">
                          <img 
                            src={homeClub?.logo} 
                            alt={homeClub?.name}
                            className="w-10 h-10 object-contain mb-1"
                          />
                          <span className="font-medium text-center">{homeClub?.name}</span>
                        </div>
                        <div className="flex-shrink-0 w-1/5 text-center">
                          <span className="text-lg font-bold">VS</span>
                        </div>
                        <div className="flex flex-col items-center w-2/5">
                          <img 
                            src={awayClub?.logo} 
                            alt={awayClub?.name}
                            className="w-10 h-10 object-contain mb-1"
                          />
                          <span className="font-medium text-center">{awayClub?.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {upcomingMatches.length === 0 && (
                  <div className="p-6 text-center">
                    <p className="text-gray-400">No hay partidos programados próximamente.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Club listing with manager */}
            <div className="card">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold">Clubes Participantes</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {clubs.map(club => (
                  <Link 
                    key={club.id} 
                    to={`/liga-master/club/${club.slug}`}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img 
                      src={club.logo} 
                      alt={club.name}
                      className="w-12 h-12 object-contain mr-4"
                    />
                    <div>
                      <h3 className="font-bold">{club.name}</h3>
                      <p className="text-sm text-gray-400">
                        DT: {club.manager}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right column */}
          <div className="space-y-8">
            {/* Quick links */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Accesos Rápidos</h2>
              <div className="space-y-2">
                <Link 
                  to="/liga-master/hall-of-fame" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Award size={20} className="text-yellow-400 mr-3" />
                  <span>Hall of Fame</span>
                </Link>
                <Link 
                  to="/liga-master/feed" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <BarChart4 size={20} className="text-blue-400 mr-3" />
                  <span>Feed de Noticias</span>
                </Link>
                <Link 
                  to="/liga-master/tacticas" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Users size={20} className="text-green-400 mr-3" />
                  <span>Tácticas</span>
                </Link>
                <Link 
                  to="/liga-master/analisis" 
                  className="flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <TrendingUp size={20} className="text-purple-400 mr-3" />
                  <span>Análisis</span>
                </Link>
              </div>
            </div>
            
            {/* Top Scorers */}
            <div className="card">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold">Máximos Goleadores</h2>
              </div>
              
              <div className="divide-y divide-gray-800">
                {topScorers.map((player, index) => {
                  const club = clubs.find(c => c.id === player.clubId);
                  
                  return (
                    <div key={player.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 text-center mr-3">
                          <span className={index < 3 ? 'text-primary font-bold' : 'text-gray-400'}>
                            {index + 1}
                          </span>
                        </div>
                        <img 
                          src={player.image} 
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <img 
                              src={club?.logo} 
                              alt={club?.name}
                              className="w-4 h-4 mr-1"
                            />
                            <span>{club?.name}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        {player.goals}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Season info */}
            <div className="card p-6 bg-gradient-to-br from-gray-800 to-dark">
              <h2 className="text-xl font-bold mb-4">Información de Temporada</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Inicio de temporada</p>
                  <p className="font-medium">{ligaMaster ? formatDate(ligaMaster.startDate) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Fin de temporada</p>
                  <p className="font-medium">{ligaMaster ? formatDate(ligaMaster.endDate) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Estado del mercado</p>
                  <p className="font-medium text-green-400">
                    {marketStatus ? 'Abierto' : 'Cerrado'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Jornadas totales</p>
                  <p className="font-medium">{ligaMaster ? ligaMaster.rounds : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LigaMaster;

