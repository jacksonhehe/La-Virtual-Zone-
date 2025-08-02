import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, DollarSign, TrendingUp, Shield, Users, Target, CheckCircle, Star, Zap, User, Activity, Camera } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types/shared';
import { makeOffer, getMinOfferAmount, getMaxOfferAmount } from '../../utils/transferService';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscapeKey from '../../hooks/useEscapeKey';

interface OfferModalProps {
  player: Player;
  onClose: () => void;
  onOfferSent?: () => void;
}

const OfferModal = ({ player, onClose, onOfferSent }: OfferModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  useEscapeKey(onClose, true);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'offer' | 'overview' | 'stats' | 'physical' | 'special' | 'contract'>('offer');
  
  const { user } = useAuthStore();
  const { clubs, club: myClub } = useDataStore();
  
  // Find player's club
  const playerClub = clubs.find(c => c.id === player.clubId);

  // Use DT dashboard club for budget and club name
  const userClub = user?.role === 'dt' ? myClub : null;
  
  // Calculate min and max offer
  const minOffer = getMinOfferAmount(player);
  const maxOffer = userClub ? getMaxOfferAmount(player, userClub.budget) : 0;
  const clubBudget = userClub?.budget || 0;
  
  // Calculate offer percentage of budget
  const offerPercentage = clubBudget > 0 ? (offerAmount / clubBudget) * 100 : 0;
  
  // Set initial offer amount
  useEffect(() => {
    setOfferAmount(minOffer);
  }, [minOffer]);

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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Validate user is logged in and is a DT
    if (!user) {
      setError('Debes iniciar sesión para realizar ofertas');
      setIsSubmitting(false);
      return;
    }
    
    if (user.role !== 'dt') {
      setError('Solo los DTs pueden realizar ofertas');
      setIsSubmitting(false);
      return;
    }
    
    // Validate user has a club
    if (!userClub) {
      setError('No tienes un club asignado');
      setIsSubmitting(false);
      return;
    }
    
    // Validate player's club
    if (!playerClub) {
      setError('Club del jugador no encontrado');
      setIsSubmitting(false);
      return;
    }
    
    // Validate offer amount
    if (offerAmount < minOffer) {
      setError(`La oferta mínima es ${formatCurrency(minOffer)}`);
      setIsSubmitting(false);
      return;
    }
    
    if (offerAmount > maxOffer) {
      setError(`La oferta máxima es ${formatCurrency(maxOffer)}`);
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Make offer
    const result = makeOffer({
      playerId: player.id,
      playerName: player.name,
      fromClub: playerClub.name,
      toClub: userClub.name,
      amount: offerAmount,
      userId: user.id
    });
    
    if (result) {
      setError(result);
      setIsSubmitting(false);
    } else {
      setSuccess(true);
      toast.success('¡Oferta enviada con éxito!');
      if (onOfferSent) onOfferSent();
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const getPlayerValue = () => {
    return player.overall * 10000; // Simple value calculation
  };

  const getOfferStrength = () => {
    const playerValue = getPlayerValue();
    const ratio = offerAmount / playerValue;
    
    if (ratio >= 1.5) return { 
      level: 'Excelente', 
      color: 'text-green-400', 
      bg: 'offer-modal-strength-excellent' 
    };
    if (ratio >= 1.2) return { 
      level: 'Buena', 
      color: 'text-blue-400', 
      bg: 'offer-modal-strength-good' 
    };
    if (ratio >= 1.0) return { 
      level: 'Justa', 
      color: 'text-yellow-400', 
      bg: 'offer-modal-strength-fair' 
    };
    return { 
      level: 'Baja', 
      color: 'text-red-400', 
      bg: 'offer-modal-strength-low' 
    };
  };

  const offerStrength = getOfferStrength();
  
  return (
    <div className="offer-modal-backdrop">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

              <div
           className="relative rounded-2xl shadow-2xl w-[70vw] max-w-[70vw] max-h-[95vh] border border-gray-700/50 overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-800"
          role="dialog"
          aria-modal="true"
          aria-labelledby="offer-modal-title"
          ref={dialogRef}
        >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={player.image}
                alt={player.name}
                className="w-20 h-20 rounded-full border-4 border-gray-700"
              />
              <div>
                <h2 className="text-3xl font-bold text-white">{player.name}</h2>
                <p className="text-lg text-gray-300">{getPositionLabel(player.position)} • {player.age} años</p>
                <p className="text-sm text-gray-400">{player.nationality}</p>
              </div>
            </div>
            <button
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
            { id: 'offer', label: 'Hacer Oferta', icon: DollarSign, color: 'from-green-500 to-green-600' },
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
          {/* Offer Tab */}
          {activeTab === 'offer' && (
            <div>
              {success ? (
                <div className="offer-modal-success">
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <CheckCircle className="text-green-400" size={32} />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">¡Oferta Enviada!</h4>
                  <p className="text-gray-400 mb-4">Tu oferta ha sido enviada al club del jugador</p>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-sm text-gray-400">El club revisará tu oferta y te notificará la respuesta</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="offer-modal-error">
                      <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{error}</p>
                    </div>
                  )}
                  
                  {/* Player Info Card */}
                  <div className="offer-modal-player-card">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={player.image}
                          alt={player.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                          loading="lazy"
                        />
                        <div className="absolute -top-1 -right-1 bg-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                          {player.overall}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-white mb-1">{player.name}</h4>
                        <div className="flex items-center space-x-3 text-sm text-gray-400 mb-2">
                          <span className="flex items-center">
                            <Target size={14} className="mr-1" />
                            {getPositionLabel(player.position)}
                          </span>
                          <span className="flex items-center">
                            <Users size={14} className="mr-1" />
                            {player.age} años
                          </span>
                          <span className="flex items-center">
                            <Star size={14} className="mr-1" />
                            {player.overall} OVR
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-400">
                          <Shield size={14} className="mr-1" />
                          Club actual: <span className="text-white ml-1">{playerClub?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Offer Amount Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Cantidad de la Oferta
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className="offer-modal-input"
                          value={offerAmount}
                          onChange={(e) => setOfferAmount(Number(e.target.value))}
                          min={minOffer}
                          max={maxOffer}
                          placeholder="Ingresa el monto"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                          <DollarSign size={20} />
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Mín: {formatCurrency(minOffer)}</span>
                        <span>Máx: {formatCurrency(maxOffer)}</span>
                      </div>
                    </div>

                    {/* Budget Progress */}
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Presupuesto Disponible</span>
                        <span className="text-sm font-medium text-white">{formatCurrency(clubBudget)}</span>
                      </div>
                      <div className="offer-modal-progress">
                        <div 
                          className="offer-modal-progress-bar"
                          style={{ width: `${Math.min(offerPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Usado: {formatCurrency(offerAmount)}</span>
                        <span className="text-gray-500">Restante: {formatCurrency(clubBudget - offerAmount)}</span>
                      </div>
                    </div>

                    {/* Offer Strength Indicator */}
                    <div className={`offer-modal-strength-indicator ${offerStrength.bg}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp size={16} className={offerStrength.color} />
                          <span className="text-sm font-medium text-gray-300">Fuerza de la Oferta</span>
                        </div>
                        <span className={`text-sm font-bold ${offerStrength.color}`}>
                          {offerStrength.level}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        Valor estimado del jugador: {formatCurrency(getPlayerValue())}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button 
                      type="button"
                      onClick={onClose}
                      className="offer-modal-cancel-btn"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={!user || user.role !== 'dt' || !userClub || isSubmitting}
                      className="offer-modal-submit-btn"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Zap size={16} />
                          <span>Enviar Oferta</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

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
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(player.value || 0)}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <User size={20} className="text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Información Personal</h3>
                  </div>
                  <div className="space-y-2">
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

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Target size={20} className="text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Atributos Principales</h3>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(player.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <span className="text-white">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                      <DollarSign size={20} className="text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Información de Contrato</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Salario</span>
                      <span className="text-white">{formatCurrency(player.contract?.salary || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Valor de Mercado</span>
                      <span className="text-white">{formatCurrency(player.value || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Contrato hasta</span>
                      <span className="text-white">{player.contract?.expires}</span>
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
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7 gap-3">
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
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
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Salario Mensual</span>
                      <span className="text-white font-semibold">{formatCurrency(player.contract?.salary || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Valor de Mercado</span>
                      <span className="text-white font-semibold">{formatCurrency(player.value || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                      <span className="text-gray-300">Contrato hasta</span>
                      <span className="text-white font-semibold">{player.contract?.expires}</span>
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

export default OfferModal;
 