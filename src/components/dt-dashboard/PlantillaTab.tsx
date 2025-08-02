import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useReducedMotionPreference from '@/hooks/useReducedMotionPreference';
import Image from '../ui/Image';
import { 
  Search, 
  Filter, 
  Star, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  Target, 
  Award,
  Shield,
  Zap,
  Calendar,
  BarChart3,
  Eye,
  Edit3,
  Plus,
  Minus,
  ArrowUpDown,
  Filter as FilterIcon,
  Activity,
  Heart,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types/shared';
import ProgressRing from '../common/ProgressRing';
import SquadDepthAnalysis from '../plantilla/SquadDepthAnalysis';
import ContractManagement from '../plantilla/ContractManagement';
import SquadQuickActions from '../plantilla/SquadQuickActions';

export default function PlantillaTab() {
  const { club, players } = useDataStore();
  const reduce = useReducedMotionPreference();
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'overall' | 'name' | 'age' | 'salary'>('overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const positions = [
    { id: 'all', label: 'Todos', icon: Users },
    { id: 'GK', label: 'Porteros', icon: Shield },
    { id: 'DEF', label: 'Defensas', icon: Shield },
    { id: 'MID', label: 'Mediocampistas', icon: Target },
    { id: 'ATT', label: 'Delanteros', icon: Target }
  ];

  const filteredPlayers = useMemo(() => {
    let filtered = players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(search.toLowerCase());
      const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
      const matchesClub = player.clubId === club?.id;
      return matchesSearch && matchesPosition && matchesClub;
    });

    // Sort players
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'overall':
          aVal = a.overall;
          bVal = b.overall;
          break;
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'age':
          aVal = a.age;
          bVal = b.age;
          break;
        case 'salary':
          aVal = a.contract?.salary || 0;
          bVal = b.contract?.salary || 0;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [players, search, selectedPosition, club?.id, sortBy, sortOrder]);

  // Squad statistics
  const squadStats = useMemo(() => {
    const totalPlayers = filteredPlayers.length;
    const avgAge = totalPlayers > 0 
      ? Math.round(filteredPlayers.reduce((sum, p) => sum + p.age, 0) / totalPlayers)
      : 0;
    const avgOverall = totalPlayers > 0
      ? Math.round(filteredPlayers.reduce((sum, p) => sum + p.overall, 0) / totalPlayers)
      : 0;
    const totalSalary = filteredPlayers.reduce((sum, p) => sum + (p.contract?.salary || 0), 0);
    const contractsExpiring = filteredPlayers.filter(p => (p.contract?.years || 0) <= 1).length;
    
    const positionCounts = {
      GK: filteredPlayers.filter(p => p.position === 'GK').length,
      DEF: filteredPlayers.filter(p => p.position === 'DEF').length,
      MID: filteredPlayers.filter(p => p.position === 'MID').length,
      ATT: filteredPlayers.filter(p => p.position === 'ATT').length,
    };

    return {
      totalPlayers,
      avgAge,
      avgOverall,
      totalSalary,
      contractsExpiring,
      positionCounts
    };
  }, [filteredPlayers]);

  const handlePlayerClick = (player: Player) => {
    setSelectedPlayer(player);
  };

  const handleSort = (field: 'overall' | 'name' | 'age' | 'salary') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Squad Overview */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 border border-white/10"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Plantilla</h2>
            <p className="text-white/60">Gestiona tu equipo y optimiza tu plantilla</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setShowAnalysis(!showAnalysis)}
              className={`p-2 rounded-lg transition-all ${
                showAnalysis 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChart3 size={20} />
            </button>
            <button
              onClick={() => setShowContracts(!showContracts)}
              className={`p-2 rounded-lg transition-all ${
                showContracts 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <Clock size={20} />
            </button>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`p-2 rounded-lg transition-all ${
                showQuickActions 
                  ? 'bg-primary text-black' 
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <BarChart3 size={20} />
            </button>
          </div>
        </div>

        {/* Squad Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{squadStats.totalPlayers}</div>
            <div className="text-sm text-white/60">Jugadores</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{squadStats.avgOverall}</div>
            <div className="text-sm text-white/60">Promedio OVR</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{squadStats.avgAge}</div>
            <div className="text-sm text-white/60">Edad Promedio</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {squadStats.totalSalary.toLocaleString()}€
            </div>
            <div className="text-sm text-white/60">Salarios</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">{squadStats.contractsExpiring}</div>
            <div className="text-sm text-white/60">Contratos por Vencer</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round((squadStats.totalSalary / (club?.budget || 1)) * 100)}%
            </div>
            <div className="text-sm text-white/60">Presupuesto</div>
          </div>
        </div>

        {/* Position Distribution */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(squadStats.positionCounts).map(([pos, count]) => (
            <div key={pos} className="bg-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">{pos}</span>
                <span className="text-white font-bold">{count}</span>
              </div>
              <div className="mt-2 bg-white/10 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(count / squadStats.totalPlayers) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Squad Analysis */}
      {showAnalysis && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SquadDepthAnalysis players={filteredPlayers} />
        </motion.div>
      )}

      {/* Contract Management */}
      {showContracts && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ContractManagement 
            players={filteredPlayers} 
            onRenewContract={(playerId, years, salary) => {
              // Handle contract renewal logic here
              console.log('Renewing contract:', playerId, years, salary);
            }}
          />
        </motion.div>
      )}

      {/* Quick Actions */}
      {showQuickActions && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <SquadQuickActions 
            players={filteredPlayers}
            onQuickAction={(action, data) => {
              // Handle quick actions here
              console.log('Quick action:', action, data);
            }}
          />
        </motion.div>
      )}

      {/* Controls */}
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center"
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
              key={pos.id}
              whileHover={reduce ? undefined : { scale: 1.05 }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              onClick={() => setSelectedPosition(pos.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                selectedPosition === pos.id
                  ? 'bg-primary text-black'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <pos.icon size={16} />
              {pos.label}
            </motion.button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSort('overall')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
              sortBy === 'overall' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <ArrowUpDown size={16} />
            OVR
          </button>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${
              sortBy === 'name' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <ArrowUpDown size={16} />
            Nombre
          </button>
        </div>
      </motion.div>

      {/* Players Grid/List */}
      <motion.div
        layout
        className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "space-y-4"
        }
      >
        {filteredPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : index * 0.05 }}
            layout
            whileHover={reduce ? undefined : { y: -8, scale: 1.02 }}
            onClick={() => handlePlayerClick(player)}
            className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-primary/50 transition-all duration-300 ${
              viewMode === 'grid' ? 'p-6' : 'p-4 flex items-center gap-4'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            
            <div className="relative z-10 w-full">
              {viewMode === 'grid' ? (
                // Grid View
                <>
                  <div className="flex items-start justify-between mb-4">
                    <Image
                      src={player.image}
                      alt={player.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-xl object-cover ring-2 ring-white/20 group-hover:ring-primary/50 transition-all"
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
                       <span className="text-white/60">Dorsal</span>
                       <span className="text-white">#{player.dorsal || 1}</span>
                     </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Altura</span>
                      <span className="text-white">{player.height || 175}cm</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60">Peso</span>
                      <span className="text-white">{player.weight || 70}kg</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/60 flex items-center gap-1">
                        <DollarSign size={12} />
                        Salario
                      </span>
                      <span className="text-white">{player.contract?.salary.toLocaleString()}€</span>
                    </div>
                  </div>

                  {/* Posiciones Secundarias */}
                  {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-white/60 mb-1">Posiciones Secundarias</div>
                      <div className="flex flex-wrap gap-1">
                        {player.secondaryPositions.slice(0, 3).map(pos => (
                          <span key={pos} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                            {pos}
                          </span>
                        ))}
                        {player.secondaryPositions.length > 3 && (
                          <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">
                            +{player.secondaryPositions.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Habilidades Especiales */}
                  {player.specialSkills && player.specialSkills.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-white/60 mb-1">Habilidades Especiales</div>
                      <div className="flex flex-wrap gap-1">
                        {player.specialSkills.slice(0, 2).map(skill => (
                          <span key={skill} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                        {player.specialSkills.length > 2 && (
                          <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded text-xs">
                            +{player.specialSkills.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status Indicators */}
                  <div className="mt-4 flex flex-wrap gap-2">
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
                    {(player.contract?.years || 0) <= 1 && (
                      <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <Calendar size={10} />
                        Por vencer
                      </div>
                    )}
                    {player.consistency && player.consistency > 85 && (
                      <div className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <CheckCircle size={10} />
                        Consistente
                      </div>
                    )}
                    {player.injuryResistance && player.injuryResistance < 70 && (
                      <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs flex items-center gap-1">
                        <AlertTriangle size={10} />
                        Propenso a lesiones
                      </div>
                    )}
                    {player.playingStyle && (
                      <div className="bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded text-xs">
                        {player.playingStyle}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                // List View
                <>
                  <Image
                    src={player.image}
                    alt={player.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg object-cover ring-2 ring-white/20 group-hover:ring-primary/50 transition-all"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                        {player.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold">
                          {player.position}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star size={12} className="text-yellow-500" />
                          <span className="text-sm text-white/70">{player.overall}</span>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center gap-4 text-sm text-white/60">
                       <span>#{player.dorsal || 1}</span>
                       <span>{player.age} años</span>
                       <span>{player.height || 175}cm</span>
                       <span>{player.contract?.salary.toLocaleString()}€</span>
                       {player.playingStyle && <span className="text-indigo-400">{player.playingStyle}</span>}
                     </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye size={16} className="text-white/40 group-hover:text-primary transition-colors" />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Player Modal */}
      {selectedPlayer && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPlayer(null)}
        >
          <motion.div
            initial={reduce ? false : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: reduce ? 1 : 0.9, opacity: 0 }}
                         className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
                         <div className="flex items-start gap-8 mb-8">
               <Image
                 src={selectedPlayer.image}
                 alt={selectedPlayer.name}
                 width={140}
                 height={140}
                 className="w-35 h-35 rounded-xl ring-2 ring-primary/50"
               />
               <div className="flex-1">
                 <h3 className="text-4xl font-bold text-white mb-3">{selectedPlayer.name}</h3>
                 <p className="text-primary text-xl mb-6">{selectedPlayer.position} • {selectedPlayer.age} años</p>
                 
                 <div className="grid grid-cols-4 gap-6">
                   <div className="text-center">
                     <div className="text-4xl font-bold text-primary">{selectedPlayer.overall}</div>
                     <div className="text-sm text-white/60">Overall</div>
                   </div>
                   <div className="text-center">
                     <div className="text-4xl font-bold text-yellow-500">{selectedPlayer.potential}</div>
                     <div className="text-sm text-white/60">Potencial</div>
                   </div>
                   <div className="text-center">
                     <div className="text-4xl font-bold text-green-500">{selectedPlayer.morale}</div>
                     <div className="text-sm text-white/60">Moral</div>
                   </div>
                   <div className="text-center">
                     <div className="text-4xl font-bold text-blue-500">{selectedPlayer.value?.toLocaleString() || '0'}€</div>
                     <div className="text-sm text-white/60">Valor</div>
                   </div>
                 </div>
               </div>
             </div>

                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
               <div className="space-y-4">
                 <h4 className="text-xl font-bold text-white">Información Personal</h4>
                 <div className="space-y-4">
                   <div className="flex justify-between">
                     <span className="text-white/60">Nacionalidad</span>
                     <span className="text-white font-medium">{selectedPlayer.nationality}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Dorsal</span>
                     <span className="text-white font-medium">#{selectedPlayer.dorsal || 1}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Altura</span>
                     <span className="text-white font-medium">{selectedPlayer.height || 175}cm</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Peso</span>
                     <span className="text-white font-medium">{selectedPlayer.weight || 70}kg</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Pie Dominante</span>
                     <span className="text-white font-medium">{selectedPlayer.dominantFoot === 'left' ? 'Izquierdo' : 'Derecho'}</span>
                   </div>
                   {selectedPlayer.secondaryPositions && selectedPlayer.secondaryPositions.length > 0 && (
                     <div className="flex justify-between">
                       <span className="text-white/60">Posiciones Secundarias</span>
                       <span className="text-white font-medium">{selectedPlayer.secondaryPositions.join(', ')}</span>
                     </div>
                   )}
                 </div>
               </div>

               <div className="space-y-4">
                 <h4 className="text-xl font-bold text-white">Información del Contrato</h4>
                 <div className="space-y-4">
                   <div className="flex justify-between">
                     <span className="text-white/60">Salario</span>
                     <span className="text-white font-medium">{selectedPlayer.contract?.salary.toLocaleString()}€</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Valor de Mercado</span>
                     <span className="text-white font-medium">{selectedPlayer.value?.toLocaleString()}€</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Años de Contrato</span>
                     <span className="text-white font-medium">{selectedPlayer.contract?.years || 3} años</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Fecha de Expiración</span>
                     <span className="text-white font-medium">{selectedPlayer.contract?.expires || 'No especificada'}</span>
                   </div>
                 </div>
               </div>

               <div className="space-y-4">
                 <h4 className="text-xl font-bold text-white">Características Físicas</h4>
                 <div className="space-y-4">
                   <div className="flex justify-between">
                     <span className="text-white/60">Consistencia</span>
                     <span className="text-white font-medium">{selectedPlayer.consistency || 70}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Resistencia a Lesiones</span>
                     <span className="text-white font-medium">{selectedPlayer.injuryResistance || 70}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-white/60">Moral</span>
                     <span className="text-white font-medium">{selectedPlayer.morale || 70}</span>
                   </div>
                 </div>
               </div>
             </div>

                                      {/* Estadísticas Detalladas PES 2021 */}
             {selectedPlayer.detailedStats && (
               <div className="mb-8">
                 <h4 className="text-xl font-bold text-white mb-6">Estadísticas Detalladas PES 2021</h4>
                 
                 {selectedPlayer.position === 'GK' ? (
                   // Estadísticas de portero
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                     <div className="bg-white/5 rounded-xl p-4 text-center">
                       <div className="text-sm text-white/60 mb-2">Habilidad</div>
                       <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.goalkeeperReach}</div>
                     </div>
                     <div className="bg-white/5 rounded-xl p-4 text-center">
                       <div className="text-sm text-white/60 mb-2">Reflejos</div>
                       <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.goalkeeperReflexes}</div>
                     </div>
                     <div className="bg-white/5 rounded-xl p-4 text-center">
                       <div className="text-sm text-white/60 mb-2">Despeje</div>
                       <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.goalkeeperClearing}</div>
                     </div>
                     <div className="bg-white/5 rounded-xl p-4 text-center">
                       <div className="text-sm text-white/60 mb-2">Atrapada</div>
                       <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.goalkeeperThrowing}</div>
                     </div>
                     <div className="bg-white/5 rounded-xl p-4 text-center">
                       <div className="text-sm text-white/60 mb-2">Juego de Pies</div>
                       <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.goalkeeperHandling}</div>
                     </div>
                   </div>
                 ) : (
                   // Estadísticas de campo - TODAS las estadísticas PES 2021
                   <div className="space-y-6">
                     {/* Estadísticas Ofensivas */}
                     <div>
                       <h5 className="text-lg font-semibold text-white mb-4">Estadísticas Ofensivas</h5>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Ofensiva</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.offensive}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Finalización</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.finishing}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Pase Bajo</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.lowPass}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Pase Alto</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.loftedPass}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Tiro Libre</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.placeKicking}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Voleas</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.volleys}</div>
                         </div>
                       </div>
                     </div>

                     {/* Estadísticas Técnicas */}
                     <div>
                       <h5 className="text-lg font-semibold text-white mb-4">Estadísticas Técnicas</h5>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Control</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.ballControl}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Drible</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.dribbling}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Efecto</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.curl}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Equilibrio</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.balance}</div>
                         </div>
                       </div>
                     </div>

                     {/* Estadísticas Físicas */}
                     <div>
                       <h5 className="text-lg font-semibold text-white mb-4">Estadísticas Físicas</h5>
                       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Velocidad</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.speed}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Aceleración</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.acceleration}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Fuerza</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.kickingPower}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Resistencia</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.stamina}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Salto</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.jumping}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Contacto Físico</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.physicalContact}</div>
                         </div>
                       </div>
                     </div>

                     {/* Estadísticas Defensivas */}
                     <div>
                       <h5 className="text-lg font-semibold text-white mb-4">Estadísticas Defensivas</h5>
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Defensa</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.defensive}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Recuperación</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.ballWinning}</div>
                         </div>
                         <div className="bg-white/5 rounded-xl p-4 text-center">
                           <div className="text-sm text-white/60 mb-2">Agresividad</div>
                           <div className="text-2xl font-bold text-white">{selectedPlayer.detailedStats.aggression}</div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             )}

             {/* Estadísticas de Rendimiento */}
             <div className="mb-8">
               <h4 className="text-xl font-bold text-white mb-6">Estadísticas de Rendimiento</h4>
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                 <div className="space-y-4">
                   <h5 className="text-lg font-semibold text-white">Rendimiento</h5>
                   <div className="space-y-4">
                     <div className="flex justify-between">
                       <span className="text-white/60">Forma</span>
                       <span className="text-white font-medium">{selectedPlayer.form || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Partidos Jugados</span>
                       <span className="text-white font-medium">{selectedPlayer.appearances || 0}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Goles</span>
                       <span className="text-white font-medium">{selectedPlayer.goals || 0}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Asistencias</span>
                       <span className="text-white font-medium">{selectedPlayer.assists || 0}</span>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h5 className="text-lg font-semibold text-white">Valor de Transferencia</h5>
                   <div className="space-y-4">
                     <div className="flex justify-between">
                       <span className="text-white/60">Valor Actual</span>
                       <span className="text-white font-medium">{selectedPlayer.value?.toLocaleString()}€</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Valor de Transferencia</span>
                       <span className="text-white font-medium">{selectedPlayer.transferValue?.toLocaleString()}€</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">En Lista de Transferencia</span>
                       <span className="text-white font-medium">{selectedPlayer.transferListed ? 'Sí' : 'No'}</span>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h5 className="text-lg font-semibold text-white">Estadísticas Básicas</h5>
                   <div className="space-y-4">
                     <div className="flex justify-between">
                       <span className="text-white/60">Pac</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.pace || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Sho</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.shooting || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Pas</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.passing || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Dri</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.dribbling || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Def</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.defending || 70}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Phy</span>
                       <span className="text-white font-medium">{selectedPlayer.attributes?.physical || 70}</span>
                     </div>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <h5 className="text-lg font-semibold text-white">Información Adicional</h5>
                   <div className="space-y-4">
                     <div className="flex justify-between">
                       <span className="text-white/60">Partidos</span>
                       <span className="text-white font-medium">{selectedPlayer.matches || 0}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-white/60">Club</span>
                       <span className="text-white font-medium">{selectedPlayer.club || 'Sin club'}</span>
                     </div>
                   </div>
                 </div>
               </div>
             </div>

             {/* Rasgos Especiales */}
             <div className="mb-8">
               <h4 className="text-xl font-bold text-white mb-6">Rasgos Especiales</h4>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   {selectedPlayer.playingStyle && (
                     <div className="bg-white/5 rounded-xl p-4">
                       <div className="text-sm text-white/60 mb-2">Estilo de Juego</div>
                       <div className="text-lg font-medium text-white">{selectedPlayer.playingStyle}</div>
                     </div>
                   )}
                   {selectedPlayer.specialSkills && selectedPlayer.specialSkills.length > 0 && (
                     <div className="bg-white/5 rounded-xl p-4">
                       <div className="text-sm text-white/60 mb-3">Habilidades Especiales</div>
                       <div className="flex flex-wrap gap-2">
                         {selectedPlayer.specialSkills.map(skill => (
                           <span key={skill} className="bg-purple-500/20 text-purple-400 px-3 py-2 rounded-lg text-sm">
                             {skill}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 <div className="space-y-4">
                   {selectedPlayer.celebrations && selectedPlayer.celebrations.length > 0 && (
                     <div className="bg-white/5 rounded-xl p-4">
                       <div className="text-sm text-white/60 mb-3">Celebraciones</div>
                       <div className="flex flex-wrap gap-2">
                         {selectedPlayer.celebrations.map(celebration => (
                           <span key={celebration} className="bg-green-500/20 text-green-400 px-3 py-2 rounded-lg text-sm">
                             {celebration}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             </div>

                         <div className="flex gap-4 pt-4 border-t border-white/10">
               <button className="flex-1 bg-primary hover:bg-primary/80 text-black font-medium py-4 rounded-xl transition-colors text-lg">
                 Renovar Contrato
               </button>
               <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-medium py-4 rounded-xl transition-colors text-lg">
                 Transferir
               </button>
               <button 
                 onClick={() => setSelectedPlayer(null)}
                 className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors text-lg"
               >
                 Cerrar
               </button>
             </div>
          </motion.div>
        </motion.div>
      )}

      {filteredPlayers.length === 0 && (
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="bg-white/5 rounded-2xl p-8 max-w-md mx-auto">
            <Users size={48} className="text-white/20 mx-auto mb-4" />
            <p className="text-white/60 text-lg mb-2">No se encontraron jugadores</p>
            <p className="text-white/40 text-sm">Intenta ajustar los filtros de búsqueda</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
 