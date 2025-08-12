import { Link } from 'react-router-dom';
import { Trophy, Calendar, Award, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchTournaments } from '../../services/tournaments';
import { formatDate } from '../../utils/helpers';
import Card from '../common/Card';
import type { Tournament } from '../../types/supabase';

const FeaturedTournaments = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournamentsData = async () => {
      try {
        setLoading(true);
        const { data, error } = await fetchTournaments();
        
        if (error) {
          setError(error.message);
        } else if (data) {
          // Mostrar solo los primeros 3 torneos
          setTournaments(data.slice(0, 3));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar torneos');
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentsData();
  }, []);

  // Status indicators
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE':
        return <span className="badge bg-green-500/20 text-green-400">En curso</span>;
      case 'ARCHIVED':
        return <span className="badge bg-blue-500/20 text-blue-400">Archivado</span>;
      case 'FINISHED':
        return <span className="badge bg-gray-500/20 text-gray-400">Finalizado</span>;
      default:
        return <span className="badge bg-gray-500/20 text-gray-400">Desconocido</span>;
    }
  };

  if (loading) {
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
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse">
                <div className="h-40 bg-gray-700 rounded-t"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
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
        
        <div className="text-center py-12">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (tournaments.length === 0) {
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
        
        <div className="text-center py-12">
          <p className="text-gray-400">No hay torneos disponibles en este momento.</p>
        </div>
      </div>
    );
  }

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
                    <Trophy size={20} className="text-primary/60" />
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
                    {tournament.type === 'LEAGUE' ? 'Liga' : 
                      tournament.type === 'KNOCKOUT' ? 'Copa' : 
                      tournament.type === 'MIXED' ? 'Mixto' : 'Torneo'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Calendar size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Temporada</p>
                  <p className="font-medium">{tournament.season}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Users size={18} className="text-primary mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">Estado</p>
                  <p className="font-medium">
                    {tournament.status === 'ACTIVE' ? 'Activo' :
                     tournament.status === 'FINISHED' ? 'Finalizado' :
                     tournament.status === 'ARCHIVED' ? 'Archivado' : 'Desconocido'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-800">
              <Link
                to={`/torneos/${tournament.id}`}
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
 