import { useState, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { Trophy, ChevronLeft, Image, ArrowRight, Star } from 'lucide-react';
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

  const { tournaments, clubs } = useDataStore();
  
  // Find tournament by slug
  const tournament = tournaments.find(t => t.slug === tournamentName);
  
  if (!tournament) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Torneo no encontrado</h2>
        <p className="text-gray-400 mb-8">El torneo que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/torneos" className="btn-primary">
          Volver a Torneos
        </Link>
      </div>
    );
  }
  
  // Get tournament clubs
  const tournamentClubs = clubs.filter(c => tournament.participants.includes(c.name));
  
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
  
  return (
    <div>
      <PageHeader 
        title={tournament.name} 
        subtitle={`${tournament.format === 'league' ? 'Liga' : tournament.format === 'cup' ? 'Copa' : 'Playoff'} • ${tournament.status === 'ongoing' ? 'En curso' : tournament.status === 'open' ? 'Inscripciones abiertas' : 'Finalizado'}`}
        image={tournament.image}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/torneos"
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver a Torneos</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-dark-light border border-gray-800 rounded-lg overflow-hidden mb-8">
              <div className="flex flex-wrap border-b border-gray-800">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'overview' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  General
                </button>
                <button 
                  onClick={() => setActiveTab('participants')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'participants' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Participantes
                </button>
                <button
                  onClick={() => setActiveTab('fixture')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'fixture' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Fixture
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'calendar' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Calendario
                </button>
                <button
                  onClick={() => setActiveTab('scorers')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'scorers' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Goleadores
                </button>
                <button 
                  onClick={() => setActiveTab('gallery')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'gallery' ? 'bg-primary text-white' : 'hover:bg-dark-lighter'}`}
                >
                  Galería
                </button>
              </div>
              
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <div className="bg-dark p-4 rounded-lg mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Formato</p>
                          <p className="font-medium">{tournament.format === 'league' ? 'Liga' : tournament.format === 'cup' ? 'Copa' : 'Playoff'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Fechas</p>
                          <p className="font-medium">
                            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400 mb-1">Participantes</p>
                          <p className="font-medium">{tournament.participants.length} equipos</p>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4">Sobre el torneo</h3>
                    <p className="text-gray-300 mb-6">
                      {tournament.name} es {tournament.format === 'league' ? 'una liga' : tournament.format === 'cup' ? 'un torneo de copa' : 'un playoff'} organizado por La Virtual Zone para la temporada 2025.
                      {tournament.status === 'ongoing' && ' Actualmente se encuentra en fase de grupos con partidos disputándose cada semana.'}
                      {tournament.status === 'open' && ' Las inscripciones están abiertas y se cerrarán próximamente. ¡Regístrate para participar!'}
                      {tournament.status === 'finished' && ` El torneo ha finalizado y el campeón fue ${tournament.winner}.`}
                    </p>
                    
                    <h3 className="text-xl font-bold mb-4">Reglas básicas</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="font-medium">Formato de competición</p>
                          <p className="text-sm text-gray-400">
                            {tournament.format === 'league' 
                              ? 'Liga todos contra todos a doble vuelta.' 
                              : tournament.format === 'cup' 
                                ? 'Sistema de eliminación directa a partido único.' 
                                : 'Fase de grupos seguida de eliminatorias.'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="font-medium">Participación</p>
                          <p className="text-sm text-gray-400">
                            Abierto a todos los clubes registrados en La Virtual Zone.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <div className="w-6 h-6 rounded-full bg-dark-lighter flex items-center justify-center mr-3 mt-0.5">
                          <span className="font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="font-medium">Duración</p>
                          <p className="text-sm text-gray-400">
                            {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {tournament.status === 'open' && (
                      <div className="bg-primary/10 border border-primary rounded-lg p-6 mt-8">
                        <h3 className="text-xl font-bold mb-2">Inscripciones abiertas</h3>
                        <p className="text-gray-300 mb-4">
                          ¡Las inscripciones para este torneo están abiertas! Regístrate antes del {formatDate(tournament.startDate)} para participar.
                        </p>
                        <button className="btn-primary">
                          Solicitar participación
                        </button>
                      </div>
                    )}
                    
                    {tournament.status === 'finished' && tournament.winner && (
                      <div className="bg-dark-lighter rounded-lg p-6 mt-8">
                        <h3 className="text-xl font-bold mb-4 text-center">Campeón del torneo</h3>
                        <div className="flex items-center justify-center mb-4">
                          <div className="w-20 h-20 rounded-full overflow-hidden mr-4">
                            <img 
                              src={`https://ui-avatars.com/api/?name=${tournament.winner.split(' ').map(word => word[0]).join('')}&background=c026d3&color=fff&size=128&bold=true`} 
                              alt={tournament.winner} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-2xl font-bold">{tournament.winner}</h4>
                            <p className="text-gray-400">Campeón {tournament.name}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'participants' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Participantes ({tournament.participants.length})</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tournamentClubs.map(club => (
                        <ClubListItem
                          key={club.id}
                          club={club}
                          to={`/liga-master/club/${club.slug}`}
                          className="bg-dark-lighter hover:bg-dark"
                        />
                      ))}
                      
                      {tournament.status === 'open' && tournament.participants.length < 8 && (
                        <div className="bg-dark rounded-lg p-4 flex items-center justify-center border border-dashed border-gray-700">
                          <div className="text-center">
                            <p className="font-medium mb-2">Inscripciones abiertas</p>
                            <button className="text-primary hover:text-primary-light text-sm">
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
                    <h3 className="text-xl font-bold mb-6">Fixture del torneo</h3>
                    
                    {tournament.format === 'cup' ? (
                      <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-4">Cuadro Final</h4>
                        <div className="h-60 flex items-center justify-center">
                          <p className="text-gray-400">
                            {tournament.status === 'open' 
                              ? 'El cuadro se definirá al cerrarse las inscripciones' 
                              : tournament.status === 'ongoing' 
                                ? 'El torneo está en progreso, el cuadro se actualiza tras cada fase' 
                                : 'Torneo finalizado'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="bg-dark-lighter rounded-lg p-4 mb-6">
                          <h4 className="font-medium mb-4">Próximos partidos</h4>
                          
                          {tournament.status !== 'open' ? (
                            <div className="space-y-3">
                              {tournamentMatches.map(match => (
                                <div key={match.id} className="bg-dark rounded-lg p-3 flex justify-between items-center">
                                  <div className="flex items-center">
                                    <div className="text-center mr-3">
                                      <p className="text-xs text-gray-400">Jornada {match.matchday}</p>
                                      <p className="text-sm">{formatDate(match.date)}</p>
                                    </div>
                                    
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2">{match.homeTeam}</span>
                                      <span className="text-gray-400 mx-2">vs</span>
                                      <span className="font-medium ml-2">{match.awayTeam}</span>
                                    </div>
                                  </div>
                                  
                                  {match.played ? (
                                    <span className="font-bold">{match.homeScore} - {match.awayScore}</span>
                                  ) : (
                                    <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                                      Próximamente
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-400 py-4">
                              El calendario se publicará al cerrarse las inscripciones
                            </p>
                          )}
                        </div>
                        
                        {tournament.status !== 'open' && (
                          <div className="bg-dark-lighter rounded-lg p-4">
                            <h4 className="font-medium mb-4">Tabla de posiciones</h4>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead>
                                  <tr className="text-xs uppercase text-gray-400 border-b border-gray-800">
                                    <th className="px-3 py-2 text-left">Pos</th>
                                    <th className="px-3 py-2 text-left">Club</th>
                                    <th className="px-3 py-2 text-center">PJ</th>
                                    <th className="px-3 py-2 text-center">G</th>
                                    <th className="px-3 py-2 text-center">E</th>
                                    <th className="px-3 py-2 text-center">P</th>
                                    <th className="px-3 py-2 text-center">GF</th>
                                    <th className="px-3 py-2 text-center">GC</th>
                                    <th className="px-3 py-2 text-center">Pts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tournamentClubs.slice(0, 4).map((club, index) => (
                                    <tr key={club.id} className="border-b border-gray-800 text-sm">
                                      <td className="px-3 py-2">{index + 1}</td>
                                      <td className="px-3 py-2">
                                        <Link
                                          to={`/liga-master/club/${club.slug}`}
                                          className="flex items-center hover:text-primary"
                                        >
                                          <div className="w-6 h-6 mr-2">
                                            <img src={club.logo} alt={club.name} className="w-full h-full rounded-full" />
                                          </div>
                                          <span>{club.name}</span>
                                        </Link>
                                      </td>
                                      <td className="px-3 py-2 text-center">{club.wins + club.draws + club.losses}</td>
                                      <td className="px-3 py-2 text-center">{club.wins}</td>
                                      <td className="px-3 py-2 text-center">{club.draws}</td>
                                      <td className="px-3 py-2 text-center">{club.losses}</td>
                                      <td className="px-3 py-2 text-center">{club.goalsFor}</td>
                                      <td className="px-3 py-2 text-center">{club.goalsAgainst}</td>
                                      <td className="px-3 py-2 text-center font-bold">{club.points}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                    </div>
                  )}
                </div>
              )}

                {activeTab === 'calendar' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Calendario</h3>
                    <Suspense fallback={<CardSkeleton lines={4} /> }>
                      <FullCalendar
                        plugins={[dayGridPlugin, interactionPlugin]}
                        initialView="dayGridMonth"
                        events={calendarEvents}
                      />
                    </Suspense>
                  </div>
                )}
                  </div>
                )}
                
                {activeTab === 'scorers' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Tabla de goleadores</h3>
                    
                    {tournament.status !== 'open' ? (
                      <div className="bg-dark-lighter rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-dark text-xs uppercase text-gray-400 border-b border-gray-800">
                              <th className="px-4 py-3 text-left">Pos</th>
                              <th className="px-4 py-3 text-left">Jugador</th>
                              <th className="px-4 py-3 text-left">Club</th>
                              <th className="px-4 py-3 text-center">Goles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {topScorers.map((scorer, index) => (
                              <tr key={scorer.id} className="border-b border-gray-800 hover:bg-dark">
                                <td className="px-4 py-3 text-sm">
                                  <span className={`
                                    inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium
                                    ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                                    ${index === 1 ? 'bg-gray-500/20 text-gray-300' : ''}
                                    ${index === 2 ? 'bg-amber-700/20 text-amber-700' : ''}
                                    ${index > 2 ? 'bg-dark text-white' : ''}
                                  `}>
                                    {index + 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-medium">{scorer.name}</td>
                                <td className="px-4 py-3">
                                  <Link
                                    to={`/liga-master/club/${slugify(scorer.club)}`}
                                    className="hover:text-primary"
                                  >
                                    {scorer.club}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-center font-bold">{scorer.goals}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        El torneo aún no ha comenzado. La tabla de goleadores se actualizará una vez que inicie la competencia.
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-xl font-bold mb-6">Galería</h3>
                    
                    {tournament.status !== 'open' ? (
                      <div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="bg-dark-lighter rounded-lg overflow-hidden aspect-video">
                            <img 
                              src="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
                              alt="Imagen del torneo" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-center">
                          <button className="btn-outline flex items-center">
                            <Image size={16} className="mr-2" />
                            <span>Subir contenido</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-8">
                        El torneo aún no ha comenzado. Se añadirán imágenes y clips una vez que inicie la competencia.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-dark-light border border-gray-800 rounded-lg p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center">
                <Trophy size={18} className="text-primary mr-2" />
                Información del torneo
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <p className="flex items-center">
                    <span className={`
                      inline-block w-2 h-2 rounded-full mr-2
                      ${tournament.status === 'ongoing' ? 'bg-neon-green' : ''}
                      ${tournament.status === 'open' ? 'bg-neon-blue' : ''}
                      ${tournament.status === 'finished' ? 'bg-gray-500' : ''}
                    `}></span>
                    <span>
                      {tournament.status === 'ongoing' ? 'En curso' : tournament.status === 'open' ? 'Inscripciones abiertas' : 'Finalizado'}
                    </span>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Formato</p>
                  <p>{tournament.format === 'league' ? 'Liga' : tournament.format === 'cup' ? 'Copa' : 'Playoff'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Fechas</p>
                  <p>{formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Equipos</p>
                  <p>{tournament.participants.length} participantes</p>
                </div>
                
                {tournament.status === 'finished' && tournament.winner && (
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Campeón</p>
                    <p className="font-bold">{tournament.winner}</p>
                  </div>
                )}
              </div>
            </div>
            
            {tournament.status === 'open' && (
              <div className="bg-primary/10 border border-primary rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-3">¡Inscríbete ahora!</h3>
                <p className="text-sm text-gray-300 mb-4">
                  Las inscripciones para este torneo están abiertas hasta el {formatDate(tournament.startDate)}.
                </p>
                <button className="btn-primary w-full">
                  Solicitar participación
                </button>
              </div>
            )}
            
            <div className="bg-dark-light border border-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-4">Equipos participantes</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {tournamentClubs.map(club => (
                  <Link
                    key={club.id}
                    to={`/liga-master/club/${club.slug}`}
                    className="flex items-center p-2 rounded hover:bg-dark-lighter"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
                    </div>
                    <span>{club.name}</span>
                  </Link>
                ))}
              </div>
              
              <button 
                onClick={() => setActiveTab('participants')}
                className="text-primary hover:text-primary-light text-sm flex items-center mt-4"
              >
                <span>Ver todos los participantes</span>
                <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            
            {tournament.status !== 'open' && (
              <div className="bg-dark-light border border-gray-800 rounded-lg p-4">
                <h3 className="font-bold mb-4">Top goleadores</h3>
                
                <div className="space-y-3">
                  {topScorers.slice(0, 3).map((scorer, index) => (
                    <div key={scorer.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center mr-2
                          ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                          ${index === 1 ? 'bg-gray-500/20 text-gray-300' : ''}
                          ${index === 2 ? 'bg-amber-700/20 text-amber-700' : ''}
                        `}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{scorer.name}</p>
                          <p className="text-xs text-gray-400">{scorer.club}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-500 mr-1" />
                        <span className="font-bold">{scorer.goals}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setActiveTab('scorers')}
                  className="text-primary hover:text-primary-light text-sm flex items-center mt-4"
                >
                  <span>Ver tabla completa</span>
                  <ArrowRight size={14} className="ml-1" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetail;
 