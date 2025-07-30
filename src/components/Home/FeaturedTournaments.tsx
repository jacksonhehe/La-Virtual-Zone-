import { Link } from 'react-router-dom';
import { Trophy, Calendar, Users, Award } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { formatDate } from '../../utils/helpers';
import Card from '../common/Card';
import Image from '@/components/ui/Image';

const FeaturedTournaments = () => {
  const { tournaments } = useDataStore();
  
  // Status indicators
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return <span className="badge bg-green-500/20 text-green-400">En curso</span>;
      case 'upcoming':
        return <span className="badge bg-blue-500/20 text-blue-400">Próximamente</span>;
      case 'finished':
        return <span className="badge bg-gray-500/20 text-gray-400">Finalizado</span>;
      default:
        return <span className="badge bg-gray-500/20 text-gray-400">Desconocido</span>;
    }
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Torneos Destacados</h2>
          <p className="text-gray-400">
            Descubre y participa en los torneos oficiales de La Virtual Zone.
          </p>
        </div>
        <Link to="/torneos" className="btn-primary mt-4 md:mt-0">
          Ver Todos los Torneos
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id}>
            <div className="relative h-40 overflow-hidden">
              {/* Background gradient */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(45deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4))`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Tournament content */}
              <div className="relative p-6 flex flex-col h-full justify-between">
                <div className="flex justify-between">
                                <div 
                className="h-12 w-12 rounded flex items-center justify-center"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {tournament.logo && tournament.logo !== 'https://ui-avatars.com/api/?name=Torneo&background=111827&color=fff&size=128&bold=true' ? (
                  <Image 
                    src={tournament.logo} 
                    alt={tournament.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`h-8 w-8 flex items-center justify-center ${tournament.logo && tournament.logo !== 'https://ui-avatars.com/api/?name=Torneo&background=111827&color=fff&size=128&bold=true' ? 'hidden' : ''}`}>
                  <Trophy size={20} className="text-primary/60" />
                </div>
              </div>
                  {getStatusBadge(tournament.status)}
                </div>
                
                <h3 className="text-xl font-bold mt-auto">
                  {tournament.name}
                </h3>
              </div>
            </div>
            
            <div className="p-4 flex flex-col space-y-3">
              <div className="flex items-start">
                <Trophy size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Tipo</p>
                  <p className="font-medium">
                    {tournament.type === 'league' ? 'Liga' : 
                      tournament.type === 'cup' ? 'Copa' : 'Amistoso'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Fechas</p>
                  <p className="font-medium">
                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Participantes</p>
                  <p className="font-medium">{tournament.teams.length} equipos</p>
                </div>
              </div>
              
              {tournament.winner && (
                <div className="flex items-start">
                  <Award size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-400">Campeón</p>
                    <p className="font-medium">{tournament.winner}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <Link
                to={`/torneos/${tournament.slug || tournament.id}`}
                className="btn-secondary w-full text-center"
              >
                Ver Detalles
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeaturedTournaments;
 