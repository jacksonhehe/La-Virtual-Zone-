import { Link } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import { Trophy, Calendar, Users, ChevronRight, Filter } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import usePersistentState from '../hooks/usePersistentState';

const Tournaments = () => {
  const [filter, setFilter] = usePersistentState<'all' | 'ongoing' | 'open' | 'finished'>('tournaments_filter', 'all');

  const { tournaments } = useDataStore();
  
  // Filter tournaments
  const filteredTournaments = filter === 'all' 
    ? tournaments 
    : tournaments.filter(tournament => tournament.status === filter);
  
  return (
    <div>
      <PageHeader 
        title="Torneos" 
        subtitle="Participa en torneos abiertos, sigue los torneos en curso y revisa los resultados de torneos anteriores."
        image="https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwyfHxlc3BvcnRzJTIwZ2FtaW5nJTIwZGFyayUyMHRoZW1lfGVufDB8fHx8MTc0NzA3MTE4MHww&ixlib=rb-4.1.0"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter size={20} className="text-primary" />
              <span className="text-sm font-medium">Filtrar por:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'all' ? 'bg-primary text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilter('ongoing')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'ongoing' ? 'bg-neon-green text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                En curso
              </button>
              <button 
                onClick={() => setFilter('open')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'open' ? 'bg-neon-blue text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Inscripciones
              </button>
              <button 
                onClick={() => setFilter('finished')}
                className={`px-3 py-1.5 rounded-lg text-sm ${filter === 'finished' ? 'bg-gray-600 text-white' : 'bg-dark-light text-gray-300 hover:bg-dark-lighter'}`}
              >
                Finalizados
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map(tournament => (
              <div key={tournament.id} className="card overflow-hidden group">
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={tournament.image} 
                    alt={tournament.name} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
                  
                  <div className="absolute top-3 left-3">
                    <span className={`
                      inline-block px-3 py-1 text-xs font-medium rounded-full
                      ${tournament.status === 'ongoing' ? 'bg-neon-green/20 text-neon-green' : ''}
                      ${tournament.status === 'open' ? 'bg-neon-blue/20 text-neon-blue' : ''}
                      ${tournament.status === 'finished' ? 'bg-gray-700/70 text-gray-300' : ''}
                    `}>
                      {tournament.status === 'ongoing' ? 'En curso' : tournament.status === 'open' ? 'Inscripciones' : 'Finalizado'}
                    </span>
                  </div>
                  
                  {tournament.winner && (
                    <div className="absolute top-3 right-3 flex items-center bg-primary/80 px-2 py-1 rounded-full">
                      <Trophy size={14} className="mr-1 text-white" />
                      <span className="text-xs font-medium text-white">{tournament.winner}</span>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                    <div className="flex items-center text-sm text-gray-300">
                      <span className={`
                        inline-block w-2 h-2 rounded-full mr-2
                        ${tournament.status === 'ongoing' ? 'bg-neon-green' : ''}
                        ${tournament.status === 'open' ? 'bg-neon-blue' : ''}
                        ${tournament.status === 'finished' ? 'bg-gray-500' : ''}
                      `}></span>
                      <span className="capitalize">
                        {tournament.format === 'league' ? 'Liga' : tournament.format === 'cup' ? 'Copa' : 'Playoff'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-1 text-primary" />
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                        {' - '}
                        {new Date(tournament.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-1 text-secondary" />
                      <span>{(tournament.participants || []).length} equipos</span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/torneos/${tournament.slug}`} 
                    className="block w-full text-center bg-dark-lighter hover:bg-primary text-white py-2 rounded-md transition-colors"
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            ))}
            
            {filteredTournaments.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400">
                <Trophy size={48} className="mx-auto mb-4 text-gray-600" />
                <h3 className="text-xl font-bold mb-2">No hay torneos disponibles</h3>
                <p>No se encontraron torneos con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Cómo participar</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Regístrate</h3>
              <p className="text-gray-400 mb-4">
                Crea tu cuenta en La Virtual Zone para acceder a los torneos y participar.
              </p>
              <Link to="/registro" className="text-primary hover:text-primary-light flex items-center">
                <span>Crear cuenta</span>
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Busca un torneo</h3>
              <p className="text-gray-400 mb-4">
                Explora los torneos disponibles y elige uno que se adapte a tu horario y estilo.
              </p>
              <Link to="/torneos" className="text-primary hover:text-primary-light flex items-center">
                <span>Ver torneos abiertos</span>
                <ChevronRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="card p-6">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Inscríbete</h3>
              <p className="text-gray-400 mb-4">
                Completa el formulario de inscripción y sigue las instrucciones para registrar tu club.
              </p>
              <button className="text-primary hover:text-primary-light flex items-center">
                <span>Más información</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tournaments;
 