import { useParams, Link } from 'react-router-dom';
import { Shield, ChevronLeft, Users, Database, ArrowDown, ArrowUp } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import { useDataStore } from '../store/dataStore';
import { formatCurrency, getOverallColor } from '../utils/helpers';
import { useState } from 'react';

const ClubSquad = () => {
  const { clubName, clubId } = useParams<{ clubName?: string; clubId?: string }>();
  const [sortBy, setSortBy] = useState('overall');
  const [sortOrder, setSortOrder] = useState('desc');

  const { clubs, players } = useDataStore();
  
  // Find club by slug
  const club = clubId
    ? clubs.find(c => c.id === clubId)
    : clubs.find(c => c.slug === clubName);
  
  if (!club) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Club no encontrado</h2>
        <p className="text-gray-400 mb-8">El club que estás buscando no existe o ha sido eliminado.</p>
        <Link to="/liga-master" className="btn-primary">
          Volver a Liga Master
        </Link>
      </div>
    );
  }
  
  // Get club players
  const clubPlayers = players
    .filter(p => p.clubId === club.id)
    .sort((a, b) => {
      if (sortBy === 'overall') {
        return sortOrder === 'desc' ? b.overall - a.overall : a.overall - b.overall;
      } else if (sortBy === 'name') {
        return sortOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name);
      } else if (sortBy === 'age') {
        return sortOrder === 'desc' ? b.age - a.age : a.age - b.age;
      } else if (sortBy === 'value') {
        return sortOrder === 'desc' ? b.value - a.value : a.value - b.value;
      } else if (sortBy === 'position') {
        return sortOrder === 'desc' 
          ? b.position.localeCompare(a.position) 
          : a.position.localeCompare(b.position);
      }
      return 0;
    });
  
  // Toggle sort order
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };
  
  // Group players by position
  const playersByPosition = {
    POR: clubPlayers.filter(p => p.position === 'POR'),
    DEF: clubPlayers.filter(p => p.position === 'DEF'),
    MED: clubPlayers.filter(p => p.position === 'MED'),
    DEL: clubPlayers.filter(p => p.position === 'DEL')
  };
  
  return (
    <div>
      <PageHeader 
        title={`Plantilla de ${club.name}`} 
        subtitle="Jugadores, estadísticas y formación táctica del club."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            to={`/liga-master/club/${club.slug}`}
            className="inline-flex items-center text-primary hover:text-primary-light"
          >
            <ChevronLeft size={16} className="mr-1" />
            <span>Volver al perfil del club</span>
          </Link>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
              <img src={club.logo} alt={club.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{club.name}</h2>
              <p className="text-gray-400">
                Director Técnico: <Link to={`/usuarios/${club.manager}`} className="text-primary hover:text-primary-light">{club.manager}</Link>
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-dark-light rounded-lg p-4 flex flex-col items-center">
              <Users size={24} className="text-primary mb-2" />
              <p className="text-gray-400 text-sm">Jugadores</p>
              <p className="text-xl font-bold">{clubPlayers.length}</p>
            </div>
            
            <div className="bg-dark-light rounded-lg p-4 flex flex-col items-center">
              <Database size={24} className="text-primary mb-2" />
              <p className="text-gray-400 text-sm">Media global</p>
              <p className="text-xl font-bold">
                {Math.round(clubPlayers.reduce((sum, p) => sum + p.overall, 0) / clubPlayers.length)}
              </p>
            </div>
            
            <div className="bg-dark-light rounded-lg p-4 flex flex-col items-center">
              <Shield size={24} className="text-primary mb-2" />
              <p className="text-gray-400 text-sm">Valor del plantel</p>
              <p className="text-xl font-bold">
                {formatCurrency(clubPlayers.reduce((sum, p) => sum + p.value, 0))}
              </p>
            </div>
            
            <div className="bg-dark-light rounded-lg p-4 flex flex-col items-center">
              <Users size={24} className="text-primary mb-2" />
              <p className="text-gray-400 text-sm">Edad promedio</p>
              <p className="text-xl font-bold">
                {Math.round(clubPlayers.reduce((sum, p) => sum + p.age, 0) / clubPlayers.length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card mb-8">
          <div className="p-4 bg-dark-lighter border-b border-gray-800">
            <h3 className="font-bold text-lg">Plantilla completa</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-dark-lighter text-xs uppercase text-gray-400 border-b border-gray-800">
                  <th className="px-4 py-3 text-left">
                    <button 
                      className="flex items-center"
                      onClick={() => toggleSort('name')}
                    >
                      Jugador
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button 
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('position')}
                    >
                      Pos
                      {sortBy === 'position' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Dorsal</th>
                  <th className="px-4 py-3 text-center">
                    <button 
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('age')}
                    >
                      Edad
                      {sortBy === 'age' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">
                    <button 
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('overall')}
                    >
                      Media
                      {sortBy === 'overall' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-center">Nacionalidad</th>
                  <th className="px-4 py-3 text-center">PJ</th>
                  <th className="px-4 py-3 text-center">Goles</th>
                  <th className="px-4 py-3 text-center">Asist.</th>
                  <th className="px-4 py-3 text-center">
                    <button 
                      className="flex items-center justify-center"
                      onClick={() => toggleSort('value')}
                    >
                      Valor
                      {sortBy === 'value' && (
                        sortOrder === 'asc' ? <ArrowUp size={14} className="ml-1" /> : <ArrowDown size={14} className="ml-1" />
                      )}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {clubPlayers.map(player => (
                  <tr key={player.id} className="border-b border-gray-800 hover:bg-dark-lighter">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold">{player.dorsal}</span>
                        </div>
                        <span className="font-medium">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPositionColor(player.position)}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{player.dorsal}</td>
                    <td className="px-4 py-3 text-center">{player.age}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getOverallColor(player.overall)}`}>
                        {player.overall}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{player.nationality}</td>
                    <td className="px-4 py-3 text-center">{player.matches}</td>
                    <td className="px-4 py-3 text-center">{player.goals}</td>
                    <td className="px-4 py-3 text-center">{player.assists}</td>
                    <td className="px-4 py-3 text-center font-medium">{formatCurrency(player.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold mb-6">Jugadores por posición</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <div className="p-3 bg-dark-lighter border-b border-gray-800">
                <h4 className="font-bold flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                  Porteros
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.POR.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.POR.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-bold">{player.dorsal}</span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.age} años</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay porteros</p>
                )}
              </div>
            </div>
            
            <div className="card">
              <div className="p-3 bg-dark-lighter border-b border-gray-800">
                <h4 className="font-bold flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                  Defensas
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.DEF.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.DEF.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-bold">{player.dorsal}</span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.age} años</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay defensas</p>
                )}
              </div>
            </div>
            
            <div className="card">
              <div className="p-3 bg-dark-lighter border-b border-gray-800">
                <h4 className="font-bold flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                  Mediocampistas
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.MED.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.MED.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-bold">{player.dorsal}</span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.age} años</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay mediocampistas</p>
                )}
              </div>
            </div>
            
            <div className="card">
              <div className="p-3 bg-dark-lighter border-b border-gray-800">
                <h4 className="font-bold flex items-center">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                  Delanteros
                </h4>
              </div>
              
              <div className="p-4">
                {playersByPosition.DEL.length > 0 ? (
                  <div className="space-y-3">
                    {playersByPosition.DEL.map(player => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-dark-lighter rounded-full flex items-center justify-center mr-2">
                            <span className="text-xs font-bold">{player.dorsal}</span>
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-xs text-gray-400">{player.age} años</p>
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${getOverallColor(player.overall)}`}>
                          {player.overall}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-2">No hay delanteros</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getPositionColor = (position: string) => {
  switch (position) {
    case 'POR': return 'bg-yellow-500/20 text-yellow-500';
    case 'DEF': return 'bg-blue-500/20 text-blue-400';
    case 'MED': return 'bg-green-500/20 text-green-500';
    case 'DEL': return 'bg-red-500/20 text-red-400';
    default: return 'bg-gray-500/20 text-gray-400';
  }
};


export default ClubSquad;
 