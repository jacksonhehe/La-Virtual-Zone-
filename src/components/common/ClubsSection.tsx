import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Trophy, TrendingUp, MapPin, Crown, Star } from 'lucide-react';
import { Club } from '../../types/shared';

interface ClubsSectionProps {
  clubs: Club[];
}

const ClubsSection: React.FC<ClubsSectionProps> = ({ clubs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'manager'>('name');

  const filteredClubs = clubs
    .filter(club => 
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.manager.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'budget':
          return b.budget - a.budget;
        case 'manager':
          return a.manager.localeCompare(b.manager);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const getClubStatus = (club: Club) => {
    // Simular diferentes estados de los clubes
    const statuses = ['active', 'champion', 'rising', 'legendary'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    switch (randomStatus) {
      case 'champion':
        return { text: 'Campeón', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', icon: Crown };
      case 'rising':
        return { text: 'En Ascenso', color: 'text-green-400', bgColor: 'bg-green-500/10', icon: TrendingUp };
      case 'legendary':
        return { text: 'Legendario', color: 'text-purple-400', bgColor: 'bg-purple-500/10', icon: Star };
      default:
        return { text: 'Activo', color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Users };
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-primary mr-3" />
            <h2 className="text-xl font-bold">Clubes Participantes</h2>
            <div className="ml-4 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full font-medium">
              {clubs.length} clubes
            </div>
          </div>
          
          {/* Search and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar club o DT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'budget' | 'manager')}
              className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            >
              <option value="name">Ordenar por nombre</option>
              <option value="budget">Ordenar por presupuesto</option>
              <option value="manager">Ordenar por DT</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {filteredClubs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const status = getClubStatus(club);
              const StatusIcon = status.icon;
              
              return (
                <Link
                  key={club.id}
                  to={`/liga-master/club/${club.slug}`}
                  className="group block"
                >
                  <div className="card p-6 hover:bg-gray-800/50 club-card-hover border border-gray-700 hover:border-gray-600">
                    {/* Club Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="relative">
                          <img
                            src={club.logo}
                            alt={club.name}
                            className="w-16 h-16 object-contain club-logo-hover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-200">
                            {club.name}
                          </h3>
                          <div className="flex items-center mt-1">
                            <StatusIcon className="w-4 h-4 mr-1" />
                            <span className={`text-xs font-medium ${status.color}`}>
                              {status.text}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                        {status.text}
                      </div>
                    </div>
                    
                    {/* Club Details */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <Users className="w-4 h-4 mr-2" />
                          <span className="text-sm">DT</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {club.manager}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <Trophy className="w-4 h-4 mr-2" />
                          <span className="text-sm">Presupuesto</span>
                        </div>
                        <span className="text-sm font-medium text-green-400">
                          ${club.budget.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-400">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span className="text-sm">Estadio</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {club.name} Arena
                        </span>
                      </div>
                    </div>
                    
                    {/* Hover Effect Overlay */}
                    <div className="club-overlay-effect group-hover:opacity-100"></div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No se encontraron clubes</h3>
            <p className="text-gray-400">Intenta con otros términos de búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsSection; 