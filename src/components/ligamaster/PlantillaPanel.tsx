import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, TrendingUp, Users, Award } from 'lucide-react';

const mockPlayers = [
  {
    id: '1',
    name: 'Lionel Messi',
    position: 'RW',
    overall: 91,
    age: 36,
    photo: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=150&h=150&fit=crop&crop=face',
    contract: { years: 2, salary: 35000000 },
    status: 'disponible',
    form: 85,
    morale: 92
  },
  {
    id: '2',
    name: 'Kylian Mbappé',
    position: 'LW',
    overall: 92,
    age: 25,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    contract: { years: 4, salary: 45000000 },
    status: 'disponible',
    form: 94,
    morale: 88
  },
  {
    id: '3',
    name: 'Erling Haaland',
    position: 'ST',
    overall: 91,
    age: 23,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    contract: { years: 5, salary: 40000000 },
    status: 'lesionado',
    form: 89,
    morale: 85
  },
  {
    id: '4',
    name: 'Kevin De Bruyne',
    position: 'CAM',
    overall: 91,
    age: 32,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    contract: { years: 3, salary: 30000000 },
    status: 'disponible',
    form: 87,
    morale: 90
  },
];

const PlantillaPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const filteredPlayers = mockPlayers.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
    return matchesSearch && matchesPosition;
  });

  const getOverallColor = (overall) => {
    if (overall >= 90) return 'from-green-400 to-green-600';
    if (overall >= 80) return 'from-yellow-400 to-yellow-600';
    if (overall >= 70) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible': return 'bg-green-500';
      case 'lesionado': return 'bg-red-500';
      case 'suspendido': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Jugadores Totales', value: '25', icon: Users, color: 'blue' },
          { label: 'Media Equipo', value: '84.2', icon: Star, color: 'yellow' },
          { label: 'Disponibles', value: '22', icon: TrendingUp, color: 'green' },
          { label: 'Renovaciones', value: '3', icon: Clock, color: 'purple' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
              <stat.icon className={`text-${stat.color}-400`} size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar jugadores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Buscar jugadores"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Filtrar por posición"
            >
              <option value="all">Todas las posiciones</option>
              <option value="GK">Portero</option>
              <option value="CB">Central</option>
              <option value="LB">Lateral Izq.</option>
              <option value="RB">Lateral Der.</option>
              <option value="CDM">Mediocentro</option>
              <option value="CAM">Media Punta</option>
              <option value="LW">Extremo Izq.</option>
              <option value="RW">Extremo Der.</option>
              <option value="ST">Delantero</option>
            </select>
          </div>
        </div>
      </div>

      {/* Players Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={() => setSelectedPlayer(player)}
            className="group bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 cursor-pointer hover:border-blue-500 transition-all duration-300"
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${player.name}`}
          >
            {/* Player Image */}
            <div className="relative mb-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-gray-700">
                <img
                  src={player.photo}
                  alt={player.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${getStatusColor(player.status)}`} />
            </div>

            {/* Player Info */}
            <div className="text-center mb-4">
              <h3 className="font-semibold text-white text-lg mb-1">{player.name}</h3>
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                {player.position}
              </span>
            </div>

            {/* Overall Rating */}
            <div className="mb-4">
              <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${getOverallColor(player.overall)} flex items-center justify-center`}>
                <span className="text-white font-bold text-xl">{player.overall}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Edad:</span>
                <span className="text-white">{player.age}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Forma:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-green-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${player.form}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">{player.form}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Moral:</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-blue-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${player.morale}%` }}
                    />
                  </div>
                  <span className="text-white text-xs">{player.morale}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Contrato:</span>
                <span className="text-white">{player.contract.years}a</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
              <button 
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit
                }}
              >
                Editar
              </button>
              <button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle renew
                }}
              >
                Renovar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Player Detail Modal */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <img
                src={selectedPlayer.photo}
                alt={selectedPlayer.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
              <p className="text-gray-400">{selectedPlayer.position} • {selectedPlayer.age} años</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Overall</p>
                  <p className="text-2xl font-bold text-white">{selectedPlayer.overall}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Salario</p>
                  <p className="text-lg font-bold text-white">€{(selectedPlayer.contract.salary / 1000000).toFixed(1)}M</p>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default PlantillaPanel;
 