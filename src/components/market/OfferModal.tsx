import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { Player } from '../../types/shared';
import { makeOffer, getMinOfferAmount, getMaxOfferAmount } from '../../utils/transferService';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';
import useFocusTrap from '../../hooks/useFocusTrap';

interface OfferModalProps {
  player: Player;
  onClose: () => void;
  onOfferSent?: () => void;
}

const OfferModal = ({ player, onClose, onOfferSent }: OfferModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const [offerAmount, setOfferAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
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
  
  // Set initial offer amount
  useEffect(() => {
    setOfferAmount(minOffer);
  }, [minOffer]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate user is logged in and is a DT
    if (!user) {
      setError('Debes iniciar sesión para realizar ofertas');
      return;
    }
    
    if (user.role !== 'dt') {
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
    
    // Validate offer amount
    if (offerAmount < minOffer) {
      setError(`La oferta mínima es ${formatCurrency(minOffer)}`);
      return;
    }
    
    if (offerAmount > maxOffer) {
      setError(`La oferta máxima es ${formatCurrency(maxOffer)}`);
      return;
    }
    
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
    } else {
      setSuccess(true);
      toast.success('Oferta enviada');
      if (onOfferSent) onOfferSent();
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>

      <div
        className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-modal-title"
        ref={dialogRef}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <h3 id="offer-modal-title" className="text-xl font-bold mb-4">Hacer Oferta</h3>
        
        {success ? (
          <div className="mb-4 p-3 bg-green-500/20 text-green-400 rounded-lg">
            <p className="font-medium">¡Oferta enviada con éxito!</p>
            <p className="text-sm">El club del jugador revisará tu oferta próximamente.</p>
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
                src={player.image} 
                alt={player.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-lg">{player.name}</h4>
                <div className="flex space-x-2 text-sm text-gray-400">
                  <span>{player.position}</span>
                  <span>•</span>
                  <span>{player.age} años</span>
                  <span>•</span>
                  <span>{player.overall} OVR</span>
                </div>
                <p className="text-sm text-gray-400">
                  Club actual: {playerClub?.name}
                </p>
              </div>
            </div>
            
            {/* Offer form */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">
                Cantidad de la oferta (entre {formatCurrency(minOffer)} y {formatCurrency(maxOffer)})
              </label>
              <input
                type="number"
                className="input w-full"
                value={offerAmount}
                onChange={(e) => setOfferAmount(Number(e.target.value))}
                min={minOffer}
                max={maxOffer}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Presupuesto disponible: {formatCurrency(clubBudget)}
              </div>
              <button 
                type="submit"
                className="btn-primary"
                disabled={!user || user.role !== 'dt' || !userClub}
              >
                Enviar Oferta
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OfferModal;
 