import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, DollarSign, TrendingUp, Shield, Users, Target, CheckCircle, Star, Zap } from 'lucide-react';
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
        className="offer-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        ref={dialogRef}
      >
        {/* Header with gradient */}
        <div className="offer-modal-header">
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="offer-modal-close-btn"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <DollarSign className="text-primary" size={24} />
            </div>
            <div>
              <h3 id="offer-modal-title" className="text-xl font-bold text-white">Hacer Oferta</h3>
              <p className="text-sm text-gray-400">Negocia la transferencia del jugador</p>
            </div>
          </div>
        </div>

        <div className="p-6">
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
                        {player.position}
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
      </div>
    </div>
  );
};

export default OfferModal;
 