import { X, User, Target, Activity, Star, DollarSign, Camera, Trophy, Shield, Heart, Zap, TrendingUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Player } from '../../types/shared';
import { formatCurrency, formatDate } from '../../utils/helpers';
import useFocusTrap from '../../hooks/useFocusTrap';

interface Props {
  player: Player;
  onClose: () => void;
}

const PlayerDrawer = ({ player, onClose }: Props) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'physical' | 'special' | 'contract'>('overview');
  useFocusTrap(drawerRef);

  useEffect(() => {
    drawerRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
  };

  const isGoalkeeper = player.position === 'GK';

  // Posiciones PES 2021
  const positions = {
    'GK': 'Portero',
    'CB': 'Central',
    'LB': 'Lateral Izquierdo',
    'RB': 'Lateral Derecho',
    'DMF': 'Mediocentro Defensivo',
    'CMF': 'Mediocentro',
    'AMF': 'Mediocentro Ofensivo',
    'LMF': 'Medio Izquierdo',
    'RMF': 'Medio Derecho',
    'LWF': 'Extremo Izquierdo',
    'RWF': 'Extremo Derecho',
    'SS': 'Segundo Delantero',
    'CF': 'Delantero Centro'
  };

  const getPositionLabel = (pos: string) => positions[pos as keyof typeof positions] || pos;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose}></div>
      <div
        className="w-full max-w-4xl bg-gray-900 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        ref={drawerRef}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={player.image} alt={player.name} className="w-20 h-20 rounded-full border-4 border-gray-700" />
              <div>
                <h2 className="text-3xl font-bold text-white">{player.name}</h2>
                <p className="text-lg text-gray-300">{getPositionLabel(player.position)} • {player.age} años</p>
                <p className="text-sm text-gray-400">{player.nationality}</p>
              </div>
            </div>
            <button
              aria-label="Cerrar"
              onClick={onClose}
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
                    <p className="text-sm text-gray-400 mb-1">Overall</p>
                    <p className="text-3xl font-bold text-purple-400">{player.overall}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 border border-yellow-500/30">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Potencial</p>
                    <p className="text-3xl font-bold text-yellow-400">{player.potential}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Valor</p>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(player.value)}</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/30">
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">Moral</p>
                    <p className="text-3xl font-bold text-green-400">{player.morale || 70}</p>
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
                      <span className="text-white">{player.nationality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Altura</span>
                      <span className="text-white">{player.height || 175}cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Peso</span>
                      <span className="text-white">{player.weight || 70}kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pie Dominante</span>
                      <span className="text-white">{player.dominantFoot === 'left' ? 'Izquierdo' : 'Derecho'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Número</span>
                      <span className="text-white">{player.dorsal}</span>
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
                    {Object.entries(player.attributes).map(([key, value]) => (
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
                      <span className="text-white">{formatCurrency(player.contract.salary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor de Mercado</span>
                      <span className="text-white">{formatCurrency(player.value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contrato hasta</span>
                      <span className="text-white">{formatDate(player.contract.expires)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Partidos</span>
                      <span className="text-white">{player.appearances || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Goles</span>
                      <span className="text-white">{player.goals || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Asistencias</span>
                      <span className="text-white">{player.assists || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary Positions */}
              {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Target size={20} className="text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Posiciones Secundarias</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {player.secondaryPositions.map((pos, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                        {getPositionLabel(pos)}
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
                
                {!isGoalkeeper ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {player.detailedStats && Object.entries(player.detailedStats).filter(([key]) => !key.startsWith('goalkeeper')).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
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
                    {player.detailedStats && Object.entries(player.detailedStats).filter(([key]) => key.startsWith('goalkeeper')).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-300 capitalize">{key.replace('goalkeeper', '').replace(/([A-Z])/g, ' $1').trim()}</span>
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
                      <span className="text-sm font-bold text-white">{player.consistency || 70}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((player.consistency || 70) / 99) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Resistencia a Lesiones</span>
                      <span className="text-sm font-bold text-white">{player.injuryResistance || 70}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((player.injuryResistance || 70) / 99) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Moral</span>
                      <span className="text-sm font-bold text-white">{player.morale || 70}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${((player.morale || 70) / 99) * 100}%` }}
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
                      {player.playingStyle || 'Balanced'}
                    </span>
                  </div>

                  {player.specialSkills && player.specialSkills.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3">Habilidades Especiales</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {player.specialSkills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {player.celebrations && player.celebrations.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-white mb-3">Celebraciones</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {player.celebrations.map((celebration, index) => (
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
                      <span className="text-white font-semibold">{formatCurrency(player.contract.salary)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Valor de Mercado</span>
                      <span className="text-white font-semibold">{formatCurrency(player.value)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Contrato hasta</span>
                      <span className="text-white font-semibold">{formatDate(player.contract.expires)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Partidos Jugados</span>
                      <span className="text-white font-semibold">{player.appearances || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Goles Marcados</span>
                      <span className="text-white font-semibold">{player.goals || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Asistencias</span>
                      <span className="text-white font-semibold">{player.assists || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDrawer;
