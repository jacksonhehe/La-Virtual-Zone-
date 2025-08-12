import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DtDashboard from './DtDashboard';
import { useAuth } from '../contexts/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import UpcomingMatches from '../components/common/UpcomingMatches';
import ClubsSection from '../components/common/ClubsSection';

import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Calendar, 
  Briefcase, 
  Award, 
  BarChart4, 
  ChevronRight,
  Star,
  Target,
  Zap
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import StatsCard from '../components/common/StatsCard';
import { fetchClubs } from '../services/clubs';
import { fetchPlayers } from '../services/players';
import { getTopTeams } from '../services/standings';
import { getUpcomingMatches } from '../services/matches';
import { fetchTournaments } from '../services/tournaments';
import { formatDate, formatCurrency } from '../utils/helpers';
import type { Club, PlayerFlat, Standing, MatchWithClubs, Tournament } from '../types/supabase';

const LigaMaster = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [players, setPlayers] = useState<PlayerFlat[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<MatchWithClubs[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [clubsData, playersData, standingsData, matchesData, tournamentsData] = await Promise.all([
          fetchClubs(),
          fetchPlayers(),
          getTopTeams(1, 10), // Assuming tournament ID 1 for now
          getUpcomingMatches(5),
          fetchTournaments()
        ]);

        if (clubsData.error) throw new Error(clubsData.error.message);
        if (playersData.error) throw new Error(playersData.error.message);
        if (standingsData.error) throw new Error(standingsData.error.message);
        if (matchesData.error) throw new Error(matchesData.error.message);
        if (tournamentsData.error) throw new Error(tournamentsData.error.message);

        setClubs(clubsData.data || []);
        setPlayers(playersData.data || []);
        setStandings(standingsData.data || []);
        setUpcomingMatches(matchesData.data || []);
        setTournaments(tournamentsData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if user is a DT (club manager)
  if (profile?.role === 'CLUB') {
    // Find the club managed by this user
    const managedClub = clubs.find(c => c.manager_id === user?.id);
    if (managedClub) {
      return <DtDashboard />;
    }
    return (
      <div className="p-8 text-center">
        <p>No tienes un club asignado. Contacta a un administrador.</p>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-400">Cargando Liga Master...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  // Get active tournament for stats (if any)
  const activeTournament = tournaments.find(t => t.status === 'ACTIVE') || tournaments[0];
  
  // Get top scorers (for now, we'll use overall rating as a proxy since we don't have goals in the current schema)
  const topScorers = [...players]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 5);

  const totalMatches = upcomingMatches.length; // This is a simplified approach
  const playedMatches = upcomingMatches.filter(m => m.status === 'finished').length;
  const seasonProgress = totalMatches > 0
    ? Math.round((playedMatches / totalMatches) * 100)
    : 0;

  // Calculate average budget
  const averageBudget = clubs.length > 0 
    ? clubs.reduce((sum, club) => sum + club.budget, 0) / clubs.length 
    : 0;
  
  return (
    <div>
      <PageHeader
        title="Liga Master"
        subtitle="El modo de juego principal de La Virtual Zone. Gestiona tu club, compite por el título y construye tu legado."
        image="/master-league-pes.jpg"
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Liga Master Info */}
        <div className="card p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">¿Qué es Liga Master?</h2>
              <p className="text-gray-300 mb-4">
                Liga Master es el modo de juego principal de La Virtual Zone. Una competición cerrada donde cada club es dirigido por un DT (Director Técnico) real.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Target size={20} className="text-primary mr-3" />
                  <span>Gestiona tu club completo</span>
                </div>
                <div className="flex items-center">
                  <Users size={20} className="text-primary mr-3" />
                  <span>Compite contra otros DTs</span>
                </div>
                <div className="flex items-center">
                  <Trophy size={20} className="text-primary mr-3" />
                  <span>Construye tu legado</span>
                </div>
                <div className="flex items-center">
                  <Zap size={20} className="text-primary mr-3" />
                  <span>Participa en temporadas regulares</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">¿Cómo Participar?</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                  <div>
                    <p className="font-medium">Regístrate como DT</p>
                    <p className="text-sm text-gray-400">Crea tu cuenta y solicita ser DT</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                  <div>
                    <p className="font-medium">Recibe tu club</p>
                    <p className="text-sm text-gray-400">Los administradores te asignarán un club</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                  <div>
                    <p className="font-medium">¡Comienza a jugar!</p>
                    <p className="text-sm text-gray-400">Gestiona fichajes, tácticas y compite</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8"
          aria-live="polite"
        >
          <StatsCard 
            title="Total de Clubes" 
            value={clubs.length}
            icon={<Users size={24} className="text-primary" />}
          />
          <StatsCard 
            title="Estado del Mercado" 
            value="Abierto" // TODO: Implementar estado real del mercado
            icon={<TrendingUp size={24} className="text-green-400" />}
          />
          <StatsCard 
            title="Presupuesto Medio" 
            value={formatCurrency(averageBudget)}
            icon={<Briefcase size={24} className="text-primary" />}
          />
          <StatsCard
            title="Partidos Disputados"
            value={playedMatches}
            icon={<Calendar size={24} className="text-primary" />}
            trend="up"
            trendValue="+3 última semana"
          />
          <StatsCard
            title="Avance de Temporada"
            value={`${playedMatches}/${totalMatches}`}
            icon={<Trophy size={24} className="text-primary" />}
            progress={seasonProgress}
          />
        </div>
        
        {/* Quick access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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

          <Link to="/liga-master/hall-of-fame" className="card card-hover bg-gradient-to-br from-dark to-gray-800 p-6">
            <Star size={32} className="text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Hall of Fame</h3>
            <p className="text-gray-400 mb-4">
              Los legendarios de La Virtual Zone.
            </p>
            <div className="text-primary flex items-center text-sm font-medium">
              <span>Ver leyendas</span>
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
              
              <div className="overflow-x-auto min-w-[640px]">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-400 border-b border-gray-800">
                      <th scope="col" className="font-medium p-4 text-left">Pos</th>
                      <th scope="col" className="font-medium p-4 text-left">Club</th>
                      <th scope="col" className="font-medium p-4 text-center">PJ</th>
                      <th scope="col" className="font-medium p-4 text-center">G</th>
                      <th scope="col" className="font-medium p-4 text-center">E</th>
                      <th scope="col" className="font-medium p-4 text-center">P</th>
                      <th scope="col" className="font-medium p-4 text-center">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {standings.slice(0, 5).map((team, index) => (
                      <tr key={team.club_id} className="hover:bg-gray-800/50">
                        <td className="p-4 text-center">
                          <span
                            aria-label={`Posición ${index + 1}`}
                            className={`
                            inline-block w-6 h-6 rounded-full font-medium text-sm flex items-center justify-center
                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-400/20 text-gray-300' :
                              index === 2 ? 'bg-amber-600/20 text-amber-500' : 'text-gray-400'}
                          `}
                          >
                            {index + 1}
                          </span>
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/liga-master/club/${team.club_name?.toLowerCase().replace(/\s+/g, '-')}`}
                            className="flex items-center"
                          >
                            <img 
                              src={team.club_logo || '/default-club-logo.png'}
                              alt={team.club_name}
                              className="w-6 h-6 mr-2 object-contain"
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
            
            {/* Upcoming matches */}
            <UpcomingMatches matches={upcomingMatches} clubs={clubs} />
            
            {/* Club listing with manager */}
            <ClubsSection clubs={clubs} />
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
                <h2 className="text-xl font-bold">Mejores Jugadores</h2>
              </div>
              
              <div className="divide-y divide-gray-800">
                {topScorers.map((player, index) => {
                  const club = clubs.find(c => c.id === player.club_id);
                  
                  return (
                    <div key={player.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-6 text-center mr-3">
                          <span className={index < 3 ? 'text-primary font-bold' : 'text-gray-400'}>
                            {index + 1}
                          </span>
                        </div>
                        <img 
                          src={player.image || '/default-player-avatar.png'} 
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.currentTarget.src = '/default-player-avatar.png';
                          }}
                        />
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <div className="flex items-center text-xs text-gray-400">
                            <img 
                              src={club?.logo || '/default-club-logo.png'} 
                              alt={club?.name}
                              className="w-4 h-4 mr-1"
                              onError={(e) => {
                                e.currentTarget.src = '/default-club-logo.png';
                              }}
                            />
                            <span>{club?.name || 'Sin club'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="font-bold text-lg">
                        {player.overall}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Season info */}
            <div className="card p-6">
              <h2 className="text-xl font-bold mb-4">Información de Temporada</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Estado del mercado</p>
                  <p className="font-medium text-green-400">Abierto</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Clubes activos</p>
                  <p className="font-medium">{clubs.length}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Jugadores totales</p>
                  <p className="font-medium">{players.length}</p>
                </div>
                {activeTournament && (
                  <>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Torneo activo</p>
                      <p className="font-medium">{activeTournament.name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Temporada</p>
                      <p className="font-medium">{activeTournament.season}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LigaMaster;


