import { useState, lazy, Suspense } from 'react';
import TeamRegistrationModal from '../components/common/TeamRegistrationModal';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { 
  Trophy, 
  ChevronLeft, 
  Image, 
  ArrowRight, 
  Star, 
  Calendar,
  Users,
  Award,
  Clock,
  MapPin,
  Target,
  TrendingUp,
  Play,
  CheckCircle,
  AlertCircle,
  Info,
  Plus
} from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import { Match } from '../types';
import { formatDate, slugify } from '../utils/helpers';
import ClubListItem from '../components/common/ClubListItem';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import CardSkeleton from '../components/common/CardSkeleton';

const FullCalendar = lazy(() => import('@fullcalendar/react'));

const TournamentDetail = () => {
  const { tournamentName } = useParams<{ tournamentName: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [showRegModal, setShowRegModal] = useState(false);

  const { tournaments, clubs } = useDataStore();
  
  // Find tournament by slug
  const tournament = tournaments.find(t => t.slug === tournamentName);
  
  if (!tournament) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={48} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Torneo no encontrado
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            El torneo que estás buscando no existe o ha sido eliminado.
          </p>
          <Link 
            to="/torneos" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-lg hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={20} className="mr-2" />
            Volver a Torneos
          </Link>
        </div>
      </div>
    );
  }
  
  // Get tournament clubs
  const tournamentClubs = clubs.filter(c => (tournament.participants || []).includes(c.name));
  
  // Matches for this tournament
  const tournamentMatches: Match[] = tournaments
    .flatMap(t => t.matches)
    .filter(match => match.tournamentId === tournament.id);

  const calendarEvents = tournamentMatches.map(match => ({
    id: match.id,
    title: `${match.homeTeam} vs ${match.awayTeam}`,
    date: match.date
  }));
  
  // Mock top scorers
  const topScorers = [
    { id: '1', name: 'Carlos Bitarra', club: 'Rayo Digital FC', goals: 5 },
    { id: '2', name: 'Luis Gamesito', club: 'Atlético Pixelado', goals: 4 },
    { id: '3', name: 'Miguel Pixardo', club: 'Rayo Digital FC', goals: 2 }
  ];

  const mapStatus = (s: string): 'active' | 'upcoming' | 'finished' => {
    if (s === 'ongoing') return 'active';
    if (s === 'open') return 'upcoming';
    return s as 'active' | 'upcoming' | 'finished';
  };

  const getStatusColor = (status: string) => {
    status = mapStatus(status);
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'finished': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getStatusText = (status: string) => {
    status = mapStatus(status);
    switch (status) {
      case 'active': return 'En Curso';
      case 'upcoming': return 'Próximo';
      case 'finished': return 'Finalizado';
      default: return 'Desconocido';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark via-dark-light to-dark">
      <PageHeader 
        title={tournament.name} 
        subtitle={`${tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'} • ${getStatusText(tournament.status)}`}
        image={tournament.logo || "https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"}
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            to="/torneos"
            className="inline-flex items-center text-primary hover:text-primary-light transition-colors duration-200 group"
          >
            <ChevronLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Volver a Torneos</span>
          </Link>
        </div>

        {/* Tournament Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm shadow-consistent-xl hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium mb-1">Formato</p>
                <p className="text-white font-bold text-lg">
                  {tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Trophy size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm shadow-consistent-xl hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium mb-1">Participantes</p>
                <p className="text-white font-bold text-lg">
                  {(tournament.participants || []).length} equipos
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm shadow-consistent-xl hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium mb-1">Fechas</p>
                <p className="text-white font-bold text-lg">
                  {formatDate(tournament.startDate)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Calendar size={24} className="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6 backdrop-blur-sm shadow-consistent-xl hover-lift">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-400 text-sm font-medium mb-1">Estado</p>
                <p className="text-white font-bold text-lg">
                  {getStatusText(tournament.status)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <Target size={24} className="text-orange-400" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-dark-light to-dark border border-gray-800/50 rounded-2xl overflow-hidden shadow-consistent-xl">
              {/* Enhanced Tab Navigation */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700/50">
                <div className="flex flex-wrap">
                  {[
                    { id: 'overview', label: 'General', icon: Info },
                    { id: 'participants', label: 'Participantes', icon: Users },
                    { id: 'fixture', label: 'Fixture', icon: Calendar },
                    { id: 'calendar', label: 'Calendario', icon: Clock },
                    { id: 'scorers', label: 'Goleadores', icon: Award },
                    { id: 'gallery', label: 'Galería', icon: Image }
                  ].map(({ id, label, icon: Icon }) => (
                    <button 
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
                        activeTab === id 
                          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <Icon size={18} className="mr-2" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Tournament Description */}
                    <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                        <Trophy size={28} className="mr-3 text-primary" />
                        Sobre el torneo
                      </h3>
                      <p className="text-gray-300 text-lg leading-relaxed">
                        {tournament.name} es {tournament.type === 'league' ? 'una liga' : tournament.type === 'cup' ? 'un torneo de copa' : 'un partido amistoso'} organizado por La Virtual Zone para la temporada 2025.
                        {mapStatus(tournament.status) === 'active' && ' Actualmente se encuentra en fase de grupos con partidos disputándose cada semana.'}
                        {mapStatus(tournament.status) === 'upcoming' && ' Las inscripciones están abiertas y se cerrarán próximamente. ¡Regístrate para participar!'}
                        {mapStatus(tournament.status) === 'finished' && ` El torneo ha finalizado y el campeón fue ${tournament.winner}.`}
                      </p>
                    </div>
                    
                    {/* Tournament Rules */}
                    <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                      <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                        <Target size={28} className="mr-3 text-primary" />
                        Reglas básicas
                      </h3>
                      <div className="space-y-6">
                        {[
                          {
                            number: 1,
                            title: 'Formato de competición',
                            description: tournament.type === 'league' 
                              ? 'Liga todos contra todos a doble vuelta.' 
                              : tournament.type === 'cup' 
                                ? 'Sistema de eliminación directa a partido único.' 
                                : 'Partido amistoso sin eliminatorias.'
                          },
                          {
                            number: 2,
                            title: 'Participación',
                            description: 'Abierto a todos los clubes registrados en La Virtual Zone.'
                          },
                          {
                            number: 3,
                            title: 'Duración',
                            description: `${formatDate(tournament.startDate)} - ${formatDate(tournament.endDate)}`
                          }
                        ].map((rule) => (
                          <div key={rule.number} className="flex items-start group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mr-4 mt-1 group-hover:scale-110 transition-transform duration-200">
                              <span className="font-bold text-sm text-white">{rule.number}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-white mb-2">{rule.title}</p>
                              <p className="text-gray-400 leading-relaxed">{rule.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Registration Call to Action */}
                    {mapStatus(tournament.status) === 'upcoming' && (
                      <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-xl p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                          <Play size={32} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-white">Inscripciones abiertas</h3>
                        <p className="text-gray-300 mb-6 text-lg">
                          ¡Las inscripciones para este torneo están abiertas! Regístrate antes del {formatDate(tournament.startDate)} para participar.
                        </p>
                        <button className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-lg font-semibold hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 shadow-lg hover:shadow-xl">
                          Solicitar participación
                        </button>
                      </div>
                    )}
                    
                    {/* Winner Section */}
                    {mapStatus(tournament.status) === 'finished' && tournament.winner && (
                      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Trophy size={40} className="text-white" />
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-white">Campeón del torneo</h3>
                        <div className="flex items-center justify-center mb-6">
                          <div className="w-24 h-24 rounded-full overflow-hidden mr-6 border-4 border-yellow-500/30">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${tournament.winner.split(' ').map(word => word[0]).join('')}&background=c026d3&color=fff&size=128&bold=true`} 
                              alt={tournament.winner} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="text-3xl font-bold text-white mb-2">{tournament.winner}</h4>
                            <p className="text-yellow-400 text-lg">Campeón {tournament.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'participants' && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                        <Users size={28} className="mr-3 text-primary" />
                        Participantes ({(tournament.participants || []).length})
                      </h3>
                      {mapStatus(tournament.status) === 'upcoming' && (tournament.participants || []).length < 8 && (
                        <button className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg font-medium hover:from-primary-dark hover:to-secondary-dark transition-all duration-300">
                          Solicitar participación
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tournamentClubs.map(club => (
                        <ClubListItem
                          key={club.id}
                          club={club}
                          to={`/liga-master/club/${club.slug}`}
                          className="bg-gradient-to-br from-dark-light to-dark hover:from-dark hover:to-dark-light border border-gray-700/50 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                        />
                      ))}
                      
                      {mapStatus(tournament.status) === 'upcoming' && (tournament.participants || []).length < 8 && (
                        <div className="bg-gradient-to-br from-dark-light to-dark rounded-xl p-6 flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-primary/50 transition-all duration-300">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Plus size={24} className="text-primary" />
                            </div>
                            <p className="font-medium text-white mb-2">Inscripciones abiertas</p>
                            <button className="text-primary hover:text-primary-light text-sm font-medium">
                              Solicitar participación
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'fixture' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Calendar size={28} className="mr-3 text-primary" />
                      Fixture del torneo
                    </h3>
                    
                    {tournament.type === 'cup' ? (
                      <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                        <h4 className="text-xl font-semibold mb-4 text-white">Cuadro Final</h4>
                        <div className="h-60 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Trophy size={32} className="text-primary" />
                            </div>
                            <p className="text-gray-400 text-lg">
                              {mapStatus(tournament.status) === 'upcoming' 
                                ? 'El cuadro se definirá al cerrarse las inscripciones' 
                                : mapStatus(tournament.status) === 'active' 
                                  ? 'El torneo está en progreso, el cuadro se actualiza tras cada fase' 
                                  : 'Torneo finalizado'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                          <h4 className="text-xl font-semibold mb-6 text-white flex items-center">
                            <Play size={24} className="mr-3 text-primary" />
                            Próximos partidos
                          </h4>
                          
                          {mapStatus(tournament.status) !== 'upcoming' ? (
                            <div className="space-y-4">
                              {tournamentMatches.slice(0, 5).map(match => (
                                <div key={match.id} className="bg-gradient-to-br from-dark-light to-dark rounded-lg p-4 border border-gray-700/50 hover:border-primary/30 transition-all duration-200">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      <div className="text-center mr-4">
                                        <p className="text-xs text-gray-400 mb-1">Jornada</p>
                                        <p className="text-sm font-medium text-white">{match.round}</p>
                                      </div>
                                      
                                      <div className="flex items-center">
                                        <span className="font-medium mr-3 text-white">{match.homeTeam}</span>
                                        <span className="text-gray-400 mx-2">vs</span>
                                        <span className="font-medium ml-3 text-white">{match.awayTeam}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <p className="text-sm text-gray-400 mb-1">{formatDate(match.date)}</p>
                                      {match.status === 'finished' ? (
                                        <span className="font-bold text-lg text-white">{match.homeScore} - {match.awayScore}</span>
                                      ) : (
                                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full">
                                          Próximamente
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock size={32} className="text-primary" />
                              </div>
                              <p className="text-gray-400 text-lg">Los partidos se programarán una vez que se cierren las inscripciones</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'calendar' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Clock size={28} className="mr-3 text-primary" />
                      Calendario del torneo
                    </h3>
                    
                    <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                      <Suspense fallback={<CardSkeleton />}>
                        <FullCalendar
                          plugins={[dayGridPlugin, interactionPlugin]}
                          initialView="dayGridMonth"
                          events={calendarEvents}
                          height="auto"
                          headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,dayGridWeek'
                          }}
                          eventColor="#c026d3"
                          eventTextColor="#ffffff"
                        />
                      </Suspense>
                    </div>
                  </div>
                )}

                {activeTab === 'scorers' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Award size={28} className="mr-3 text-primary" />
                      Goleadores del torneo
                    </h3>
                    
                    <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                      <div className="space-y-4">
                        {topScorers.map((scorer, index) => (
                          <div key={scorer.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-dark-light to-dark rounded-lg border border-gray-700/50 hover:border-primary/30 transition-all duration-200">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mr-4">
                                <span className="font-bold text-white text-sm">{index + 1}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-white">{scorer.name}</p>
                                <p className="text-sm text-gray-400">{scorer.club}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-primary">{scorer.goals}</p>
                              <p className="text-xs text-gray-400">goles</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-2xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center">
                      <Image size={28} className="mr-3 text-primary" />
                      Galería del torneo
                    </h3>
                    
                    <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Image size={32} className="text-primary" />
                        </div>
                        <p className="text-gray-400 text-lg">La galería estará disponible durante el torneo</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Tournament Status Card */}
            <div className="bg-gradient-to-br from-dark-light to-dark border border-gray-800/50 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Estado del torneo</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tournament.status)}`}>
                  {getStatusText(tournament.status)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Formato</span>
                  <span className="text-white font-medium">{tournament.type === 'league' ? 'Liga' : tournament.type === 'cup' ? 'Copa' : 'Amistoso'}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Equipos</span>
                  <span className="text-white font-medium">{(tournament.participants || []).length} participantes</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Inicio</span>
                  <span className="text-white font-medium">{formatDate(tournament.startDate)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Fin</span>
                  <span className="text-white font-medium">{formatDate(tournament.endDate)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-dark-light to-dark border border-gray-800/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Acciones rápidas</h3>
              
              <div className="space-y-3">
                {mapStatus(tournament.status) === 'upcoming' && (
                  <button onClick={() => setShowRegModal(true)} className="w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-medium hover:from-primary-dark hover:to-secondary-dark transition-all duration-300 shadow-lg hover:shadow-xl">
                    <Play size={18} className="inline mr-2" />
                    Solicitar participación
                  </button>
                )}
                
                <button onClick={() => setActiveTab('calendar')} className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300">
                  <Calendar size={18} className="inline mr-2" />
                  Ver calendario
                </button>
                
                <button onClick={() => setActiveTab('participants')} className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white py-3 rounded-lg font-medium hover:from-gray-700 hover:to-gray-800 transition-all duration-300">
                  <Users size={18} className="inline mr-2" />
                  Ver participantes
                </button>
              </div>
            </div>

            {/* Tournament Info */}
            <div className="bg-gradient-to-br from-dark-light to-dark border border-gray-800/50 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">Información del torneo</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Organizador</p>
                  <p className="text-white font-medium">La Virtual Zone</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Temporada</p>
                  <p className="text-white font-medium">2025</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Rondas</p>
                  <p className="text-white font-medium">{tournament.rounds}</p>
                </div>
                
                {tournament.description && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Descripción</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{tournament.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showRegModal && (
        <TeamRegistrationModal tournament={tournament} isOpen={showRegModal} onClose={() => setShowRegModal(false)} />
      )}
    </div>
  );
};

export default TournamentDetail;
 