import  { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types/shared';

export default function PlantillaTab() {
  const { club, players } = useDataStore();
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const positions = ['all', 'GK', 'DEF', 'MID', 'ATT'];

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
      const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
      const matchesClub = player.clubId === club?.id;
      return matchesSearch && matchesPosition && matchesClub;
    });
  }, [players, search, selectedPosition, club?.id]);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar jugadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          {positions.map(pos => (
            <motion.button
              key={pos}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPosition(pos)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPosition === pos
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {pos === 'all' ? 'Todos' : pos}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Players Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            layout
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => handlePlayerClick(player)}
            className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <img
                  src={player.image}
                  alt={player.name}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/20 group-hover:ring-primary/50 transition-all"
                  loading="lazy"
                />
                <div className="text-right">
                  <div className="bg-primary/20 text-primary px-2 py-1 rounded-lg text-sm font-bold">
                    {player.position}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-white/70">{player.overall}</span>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {player.name}
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Edad</span>
                  <span className="text-white">{player.age}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-1">
                    <DollarSign size={12} />
                    Salario
                  </span>
                  <span className="text-white">{player.contract?.salary.toLocaleString()}€</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60 flex items-center gap-1">
                    <Clock size={12} />
                    Contrato
                  </span>
                  <span className="text-white">{player.contract?.years}a</span>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-4 flex gap-2">
                {player.morale > 80 && (
                  <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs">
                    Alta moral
                  </div>
                )}
                {player.potential - player.overall > 10 && (
                  <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                    <TrendingUp size={10} />
                    Promesa
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Player Modal */}
      {selectedPlayer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <img
                src={selectedPlayer.image}
                alt={selectedPlayer.name}
                className="w-24 h-24 rounded-xl mx-auto mb-4 ring-2 ring-primary/50"
              />
              <h3 className="text-2xl font-bold text-white">{selectedPlayer.name}</h3>
              <p className="text-primary">{selectedPlayer.position} • {selectedPlayer.age} años</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedPlayer.overall}</div>
                <div className="text-sm text-white/60">Overall</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{selectedPlayer.potential}</div>
                <div className="text-sm text-white/60">Potencial</div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-full bg-primary hover:bg-primary/80 text-black font-medium py-3 rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </motion.div>
        </motion.div>
      )}

      {filteredPlayers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-white/60 text-lg">No se encontraron jugadores</p>
        </motion.div>
      )}
    </div>
  );
}
 