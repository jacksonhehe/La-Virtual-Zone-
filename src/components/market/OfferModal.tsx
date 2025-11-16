import  { useState, useEffect } from 'react';
import { X, AlertCircle, Eye } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types';
import { makeOffer, getMinOfferAmount, getMaxOfferAmount, getOfferSuggestions, getOfferRealismLevel } from '../../utils/transferService';
import { isFreeAgent } from '../../utils/marketRules';
import { formatCurrency } from '../../utils/format';
import PlayerStatsModal from '../common/PlayerStatsModal';

interface OfferModalProps {
  player: Player;
  onClose: () => void;
}

const OfferModal = ({ player, onClose }: OfferModalProps) => {
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [showPlayerStats, setShowPlayerStats] = useState<boolean>(false);
  const [realismInfo, setRealismInfo] = useState<{
    level: 'ridiculous' | 'low' | 'fair' | 'high' | 'excessive';
    message: string;
    color: string;
  } | null>(null);
  

  const { user, hasRole } = useAuthStore();
  const { clubs } = useDataStore();

  const playerIsFreeAgent = isFreeAgent(player);

  // Find player's club (handle free agents)
  const playerClub = playerIsFreeAgent
    ? { id: 'libre', name: 'Libre', logo: '' }
    : clubs.find(c => c.id === player.clubId);

  // Find user's club (if DT)
  const isDT = hasRole('dt');
  const userClub = isDT && user?.clubId
    ? clubs.find(c => c.id === user.clubId)
    : null;

  // Calculate min and max offer (más realistas)
  const minOffer = getMinOfferAmount(player);
  const maxOffer = userClub ? getMaxOfferAmount(player, userClub.budget) : 0;
  const clubBudget = userClub?.budget || 0;

  // Get offer suggestions
  const suggestions = getOfferSuggestions(player);
  
  // Set initial offer amount and realism info
  useEffect(() => {
    if (playerIsFreeAgent) {
      setOfferAmount(player.transferValue); // Para agentes libres, precio fijo
    } else {
      setOfferAmount(suggestions.fair); // Empezar con una oferta justa
    }
  }, [suggestions.fair, player, playerIsFreeAgent]);

  // Update realism info when offer amount changes
  useEffect(() => {
    if (offerAmount > 0) {
      const realism = getOfferRealismLevel(offerAmount, player);
      setRealismInfo(realism);
    } else {
      setRealismInfo(null);
    }
  }, [offerAmount, player]);
  
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate user is logged in and is a DT
    if (!user) {
      setError('Debes iniciar sesión para realizar ofertas');
      return;
    }
    
    if (!isDT) {
      setError('Solo los DTs pueden realizar ofertas');
      return;
    }
    
    // Validate user has a club
    if (!userClub) {
      setError('No tienes un club asignado');
      return;
    }
    
    // Validate player's club
    if (!playerClub) {
      setError('Club del jugador no encontrado');
      return;
    }

    // Validate that user is not offering for their own player
    if (userClub && playerClub.id === userClub.id) {
      setError('No puedes hacer ofertas por jugadores de tu propio club');
      return;
    }
    
    // Validar monto mínimo según reglas
    if (offerAmount < minOffer) {
      setError(`La oferta debe ser al menos ${formatCurrency(minOffer)}`);
      return;
    }

    if (offerAmount > maxOffer) {
      setError(`No tienes suficiente presupuesto. Disponible: ${formatCurrency(maxOffer)}`);
      return;
    }
    
    // Make offer
    const result = await makeOffer({
      playerId: player.id,
      playerName: player.name,
      fromClub: playerClub.name,
      toClub: userClub.name,
      amount: offerAmount,
      userId: user.id
    });
    
    if (result) {
      setError(result);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onKeyDown={handleKeyDown}>
      <div className="absolute inset-0 bg-black/70" onClick={handleOverlayClick}></div>
      
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" tabIndex={-1}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h3 className="text-xl font-bold mb-4">
          {playerIsFreeAgent ? 'Fichar Agente Libre' : 'Hacer Oferta'}
        </h3>
        
        {success ? (
          <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg">
            {playerIsFreeAgent ? (
              <>
                <p className="font-medium">Transferencia completada!</p>
                <p className="text-sm">El agente libre ha sido fichado por tu club.</p>
              </>
            ) : (
              <>
                <p className="font-medium">Oferta enviada con exito!</p>
                <p className="text-sm">El club del jugador revisara tu oferta proximamente.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 text-red-400 rounded-lg flex items-start">
                <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={player.image || '/default.png'}
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default.png';
                }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-lg">{player.name}</h4>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPlayerStats(true);
                    }}
                    className="bg-primary/20 hover:bg-primary/30 text-primary px-2 py-1 rounded text-xs transition-colors flex items-center gap-1"
                    title="Ver estadísticas completas"
                  >
                    <Eye size={12} />
                    Stats
                  </button>
                </div>
                <div className="flex space-x-2 text-sm text-gray-400">
                  <span>{player.position}</span>
                  <span>•</span>
                  <span>{player.age} años</span>
                  <span>•</span>
                  <span>{player.overall} OVR</span>
                </div>
                <p className="text-sm text-gray-400">Club actual: {playerClub?.name}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Salario actual: <span className="text-gray-200 font-semibold">{formatCurrency(player.contract?.salary || 0)}</span>
                </p>
              </div>
            </div>
            
            {/* Offer suggestions - only for players with clubs */}
            {!playerIsFreeAgent && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Sugerencias de oferta:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOfferAmount(suggestions.low);
                    }}
                    className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                  >
                    Baja: {formatCurrency(suggestions.low)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOfferAmount(suggestions.fair);
                    }}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors"
                  >
                    Justa: {formatCurrency(suggestions.fair)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOfferAmount(suggestions.high);
                    }}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                  >
                    Alta: {formatCurrency(suggestions.high)}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOfferAmount(suggestions.marketValue);
                    }}
                    className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded transition-colors"
                  >
                    Mercado: {formatCurrency(suggestions.marketValue)}
                  </button>
                </div>
              </div>
            )}

            {/* Offer form */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                {playerIsFreeAgent
                  ? 'Precio de fichaje (fijo)'
                  : `Cantidad de la oferta (máximo ${formatCurrency(maxOffer)})`
                }
              </label>
              <input
                type="number"
                className={`input w-full ${playerIsFreeAgent ? 'bg-gray-600/50 cursor-not-allowed' : ''}`}
                value={offerAmount}
                onChange={(e) => !playerIsFreeAgent && setOfferAmount(Number(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                min={playerIsFreeAgent ? player.transferValue : minOffer}
                max={playerIsFreeAgent ? player.transferValue : maxOffer}
                placeholder={playerIsFreeAgent ? 'Precio fijo' : 'Ingresa tu oferta...'}
                readOnly={playerIsFreeAgent}
              />

              {/* Realism info - only for players with clubs */}
              {realismInfo && !playerIsFreeAgent && (
                <div className={`mt-2 p-2 rounded text-xs ${realismInfo.level === 'ridiculous' || realismInfo.level === 'low' ? 'bg-red-500/10 border border-red-500/20' : realismInfo.level === 'fair' ? 'bg-green-500/10 border border-green-500/20' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                  <p className={`${realismInfo.color} font-medium`}>{realismInfo.message}</p>
                </div>
              )}
            </div>

            
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Presupuesto disponible: {formatCurrency(clubBudget)}
              </div>
              <button
                type="submit"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="btn-primary"
                disabled={!user || !isDT || !userClub}
              >
                {playerIsFreeAgent ? 'Fichar Jugador' : 'Enviar Oferta'}
              </button>
            </div>
          </form>
        )}

        {/* Player Stats Modal */}
        {showPlayerStats && (
          <PlayerStatsModal
            player={player}
            isOpen={showPlayerStats}
            onClose={() => setShowPlayerStats(false)}
          />
        )}
      </div>
    </div>
  );
};

export default OfferModal;
 
