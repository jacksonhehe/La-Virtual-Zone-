import { useState, useMemo, useEffect } from 'react';
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
  CheckCircle,
  X,
  User
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthProvider';
import { fetchPlayersByClub } from '../../services/players';
import { fetchClubs } from '../../services/clubs';
import type { PlayerFlat, Club } from '../../types/supabase';
import ProgressRing from '../common/ProgressRing';
import SquadDepthAnalysis from '../plantilla/SquadDepthAnalysis';
import ContractManagement from '../plantilla/ContractManagement';
import SquadQuickActions from '../plantilla/SquadQuickActions';

export default function PlantillaTab() {
  const { user } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [players, setPlayers] = useState<PlayerFlat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const reduce = useReducedMotionPreference();
  const [search, setSearch] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFlat | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'overall' | 'name' | 'age' | 'salary'>('overall');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch club data for the current user
        const clubsData = await fetchClubs();
        if (clubsData.error) throw new Error(clubsData.error.message);
        
        const userClub = clubsData.data?.find(c => c.manager_id === user?.id);
        if (!userClub) throw new Error('No tienes un club asignado');
        
        setClub(userClub);
        
        // Fetch players for the club
        const playersData = await fetchPlayersByClub(userClub.id);
        if (playersData.error) throw new Error(playersData.error.message);
        
        setPlayers(playersData.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  // Función para traducir estadísticas al español
  const translateStat = (key: string): string => {
    const translations: { [key: string]: string } = {
      // Estadísticas ofensivas
      offensive: 'Actitud Ofensiva',
      ballControl: 'Control de Balón',
      dribbling: 'Drible',
      lowPass: 'Pase Raso',
      loftedPass: 'Pase Bombeado',
      finishing: 'Finalización',
      placeKicking: 'Balón Parado',
      volleys: 'Efecto',
      curl: 'Cabeceador',
      
      // Estadísticas físicas
      speed: 'Velocidad',
      acceleration: 'Aceleración',
      kickingPower: 'Potencia de Tiro',
      stamina: 'Resistencia',
      jumping: 'Salto',
      physicalContact: 'Contacto Físico',
      balance: 'Equilibrio',
      
      // Estadísticas defensivas
      defensive: 'Actitud Defensiva',
      ballWinning: 'Recuperación de Balón',
      aggression: 'Agresividad',
      
      // Estadísticas de portero
      goalkeeperReach: 'Actitud de Portero',
      goalkeeperReflexes: 'Reflejos',
      goalkeeperClearing: 'Despeje',
      goalkeeperThrowing: 'Atajar',
      goalkeeperHandling: 'Cobertura'
    };
    
    return translations[key] || key.replace(/([A-Z])/g, ' $1').trim();
  };

  // Helper function to map PES 2021 positions to simplified categories
  const getPositionCategory = (position: string | undefined): string => {
    if (!position) return 'MID';
    if (position === 'GK') return 'GK';
    if (['CB', 'LB', 'RB', 'LWB', 'RWB'].includes(position)) return 'DEF';
    if (['DMF', 'CMF', 'AMF', 'LMF', 'RMF', 'CDM', 'CM', 'CAM', 'LM', 'RM'].includes(position)) return 'MID';
    if (['LWF', 'RWF', 'SS', 'CF', 'ST', 'LW', 'RW'].includes(position)) return 'ATT';
    return 'MID'; // Default fallback
  };

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
      const matchesPosition = selectedPosition === 'all' || getPositionCategory(player.position) === selectedPosition;
      const matchesClub = player.club_id === club?.id;
      return matchesSearch && matchesPosition && matchesClub;
    });

    // Sort players
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'overall':
          aVal = a.overall || 0;
          bVal = b.overall || 0;
          break;
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
        case 'age':
          aVal = a.age || 0;
          bVal = b.age || 0;
          break;
        case 'salary':
          aVal = a.salary || 0;
          bVal = b.salary || 0;
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
    // Get all club players for statistics (not filtered by search/position)
    const allClubPlayers = players.filter(player => player.club_id === club?.id);
    
    const totalPlayers = filteredPlayers.length;
    const avgAge = totalPlayers > 0 
      ? Math.round(filteredPlayers.reduce((sum, p) => sum + (p.age || 0), 0) / totalPlayers)
      : 0;
    const avgOverall = totalPlayers > 0
      ? Math.round(filteredPlayers.reduce((sum, p) => sum + (p.overall || 0), 0) / totalPlayers)
      : 0;
    const totalSalary = filteredPlayers.reduce((sum, p) => sum + (p.salary || 0), 0);
    const contractsExpiring = filteredPlayers.filter(p => {
      if (!p.contract_expires) return false;
      const contractYear = new Date(p.contract_expires).getFullYear();
      const currentYear = new Date().getFullYear();
      return (contractYear - currentYear) <= 1;
    }).length;
    
    // Count positions from ALL club players, using position mapping
    const positionCounts = {
      GK: allClubPlayers.filter(p => getPositionCategory(p.position) === 'GK').length,
      DEF: allClubPlayers.filter(p => getPositionCategory(p.position) === 'DEF').length,
      MID: allClubPlayers.filter(p => getPositionCategory(p.position) === 'MID').length,
      ATT: allClubPlayers.filter(p => getPositionCategory(p.position) === 'ATT').length,
    };

    return {
      totalPlayers,
      avgAge,
      avgOverall,
      totalSalary,
      contractsExpiring,
      positionCounts
    };
  }, [filteredPlayers, players, club?.id]);

  const handlePlayerClick = (player: PlayerFlat) => {
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
                    {player.posicion || player.position || 'N/A'}
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    <Star size={14} className="text-yellow-500" />
                    <span className="text-sm text-white/70">{player.valoracion || player.overall || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-white mb-2 group-hover:text-primary transition-colors">
                {player.nombre_jugador && player.apellido_jugador 
                  ? `${player.nombre_jugador} ${player.apellido_jugador}`
                  : player.name || 'Sin nombre'
                }
              </h3>
              
              <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Edad</span>
                  <span className="text-white">{player.edad || player.age || 'N/A'}</span>
                </div>
                    
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Altura</span>
                  <span className="text-white">{player.altura || player.height || 175}cm</span>
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
                                    {(player.morale || 0) > 80 && (
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
                    {(() => {
                      const contractYear = new Date(player.contract?.expires || '').getFullYear();
                      const currentYear = new Date().getFullYear();
                      return (contractYear - currentYear) <= 1;
                    })() && (
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
            className="bg-gray-900 border border-white/20 rounded-2xl max-w-6xl w-[95vw] max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedPlayer.image}
                    alt={selectedPlayer.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full border-4 border-gray-700"
                  />
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {selectedPlayer.nombre_jugador && selectedPlayer.apellido_jugador 
                        ? `${selectedPlayer.nombre_jugador} ${selectedPlayer.apellido_jugador}`
                        : selectedPlayer.name || 'Sin nombre'
                      }
                    </h2>
                    <p className="text-lg text-gray-300">
                      {selectedPlayer.posicion || selectedPlayer.position || 'N/A'} • {selectedPlayer.edad || selectedPlayer.age || 'N/A'} años
                    </p>
                    <p className="text-sm text-gray-400">{selectedPlayer.nacionalidad || selectedPlayer.nationality || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 p-4 bg-gray-800/50 border-b border-gray-700/50">
              {[
                { id: 'overview', label: 'Resumen', icon: User, color: 'from-blue-500 to-blue-600' },
                { id: 'stats', label: 'Estadísticas', icon: Target, color: 'from-green-500 to-green-600' },
                { id: 'physical', label: 'Físico', icon: Activity, color: 'from-orange-500 to-orange-600' },
                { id: 'special', label: 'Especiales', icon: Star, color: 'from-purple-500 to-purple-600' },
                { id: 'contract', label: 'Contrato', icon: DollarSign, color: 'from-yellow-500 to-yellow-600' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 border border-purple-500/30">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Valoración</p>
                        <p className="text-3xl font-bold text-purple-400">{selectedPlayer.valoracion || selectedPlayer.overall || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Potencial</p>
                        <p className="text-3xl font-bold text-yellow-400">{selectedPlayer.potential || selectedPlayer.valoracion || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Valor</p>
                        <p className="text-xl font-bold text-blue-400">{selectedPlayer.value?.toLocaleString()}€</p>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                      <div className="text-center">
                        <p className="text-sm text-gray-400 mb-1">Moral</p>
                        <p className="text-3xl font-bold text-green-400">{selectedPlayer.morale || 70}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <User size={20} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Información Personal</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Nacionalidad</span>
                          <span className="text-white">{selectedPlayer.nacionalidad || selectedPlayer.nationality || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Altura</span>
                          <span className="text-white">{selectedPlayer.altura || selectedPlayer.height || 175}cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Peso</span>
                          <span className="text-white">{selectedPlayer.peso || selectedPlayer.weight || 70}kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Pie Dominante</span>
                          <span className="text-white">{selectedPlayer.dominantFoot === 'left' ? 'Izquierdo' : 'Derecho'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Número</span>
                          <span className="text-white">{selectedPlayer.dorsal}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                          <Target size={20} className="text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Atributos Principales</h3>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(selectedPlayer.attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-400 capitalize">{key}</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-yellow-500/20 rounded-lg">
                          <DollarSign size={20} className="text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Información de Contrato</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Salario</span>
                          <span className="text-white">{selectedPlayer.contract?.salary.toLocaleString()}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valor de Mercado</span>
                          <span className="text-white">{selectedPlayer.value?.toLocaleString()}€</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Contrato hasta</span>
                          <span className="text-white">{selectedPlayer.contract?.expires}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Partidos</span>
                          <span className="text-white">{selectedPlayer.appearances || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Goles</span>
                          <span className="text-white">{selectedPlayer.goals || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Asistencias</span>
                          <span className="text-white">{selectedPlayer.assists || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Positions */}
                  {selectedPlayer.secondaryPositions && selectedPlayer.secondaryPositions.length > 0 && (
                    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Target size={20} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Posiciones Secundarias</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlayer.secondaryPositions.map((pos, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                            {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Tab */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Target size={20} className="text-green-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Estadísticas Detalladas</h3>
                    </div>
                    
                    {!selectedPlayer.detailedStats ? (
                      <p className="text-center text-gray-400">No hay datos disponibles.</p>
                    ) : selectedPlayer.position !== 'GK' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Object.entries(selectedPlayer.detailedStats).filter(([key]) => !key.startsWith('goalkeeper')).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">{translateStat(key)}</span>
                              <span className="text-sm font-bold text-white">{value}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(value / 99) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedPlayer.detailedStats).filter(([key]) => key.startsWith('goalkeeper')).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">{translateStat(key)}</span>
                              <span className="text-sm font-bold text-white">{value}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(value / 99) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Physical Tab */}
              {activeTab === 'physical' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Activity size={20} className="text-orange-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Características Físicas</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Consistencia</span>
                          <span className="text-sm font-bold text-white">{selectedPlayer.consistency || 70}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((selectedPlayer.consistency || 70) / 99) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Resistencia a Lesiones</span>
                          <span className="text-sm font-bold text-white">{selectedPlayer.injuryResistance || 70}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((selectedPlayer.injuryResistance || 70) / 99) * 100}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300">Moral</span>
                          <span className="text-sm font-bold text-white">{selectedPlayer.morale || 70}</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((selectedPlayer.morale || 70) / 99) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Tab */}
              {activeTab === 'special' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Star size={20} className="text-purple-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Rasgos Especiales</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-md font-semibold text-white mb-3">Estilo de Juego</h4>
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                          {selectedPlayer.estilo_juego || selectedPlayer.playingStyle || 'Equilibrado'}
                        </span>
                      </div>

                      {selectedPlayer.specialSkills && selectedPlayer.specialSkills.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-white mb-3">Habilidades Especiales</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {selectedPlayer.specialSkills.map((skill, index) => (
                              <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPlayer.celebrations && selectedPlayer.celebrations.length > 0 && (
                        <div>
                          <h4 className="text-md font-semibold text-white mb-3">Celebraciones</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {selectedPlayer.celebrations.map((celebration, index) => (
                              <span key={index} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
                                {celebration}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Contract Tab */}
              {activeTab === 'contract' && (
                <div className="space-y-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-yellow-500/20 rounded-lg">
                        <DollarSign size={20} className="text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Información de Contrato</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Salario Mensual</span>
                          <span className="text-white font-semibold">{selectedPlayer.contract?.salary.toLocaleString()}€</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Valor de Mercado</span>
                          <span className="text-white font-semibold">{selectedPlayer.value?.toLocaleString()}€</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Contrato hasta</span>
                          <span className="text-white font-semibold">{selectedPlayer.contract?.expires}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Partidos Jugados</span>
                          <span className="text-white font-semibold">{selectedPlayer.appearances || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Goles Marcados</span>
                          <span className="text-white font-semibold">{selectedPlayer.goals || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                          <span className="text-gray-300">Asistencias</span>
                          <span className="text-white font-semibold">{selectedPlayer.assists || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-700/50">
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
 