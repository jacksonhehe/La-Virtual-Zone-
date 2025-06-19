import  { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { processTransfer } from '../../utils/transferService';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/helpers';

const OffersPanel = () => {
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuthStore();
  const { offers, clubs } = useDataStore();
  
  // Filter offers based on user role
  const filteredOffers = user ? 
    user.role === 'admin' ? 
      // Admin sees all offers
      offers : 
    user.role === 'dt' && user.clubId ? 
      // DT sees offers for their club
      offers.filter(o => {
        const userClub = clubs.find(c => c.id === user.clubId);
        return userClub && (o.fromClub === userClub.name || o.toClub === userClub.name);
      }) : 
      // User made offers
      offers.filter(o => o.userId === user.id) :
    [];
  
  // Get club logo by name
  const getClubLogo = (clubName: string) => {
    const club = clubs.find(c => c.name === clubName);
    return club?.logo || '';
  };
  
  // Toggle offer details
  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers(prev => ({
      ...prev,
      [offerId]: !prev[offerId]
    }));
  };
  
  // Handle accept/reject offer
  const handleOfferAction = (offerId: string, action: 'accept' | 'reject') => {
    setError(null);
    
    if (action === 'accept') {
      const result = processTransfer(offerId);
      if (result) {
        setError(result);
      }
    } else {
      // Reject offer
      useDataStore.getState().updateOfferStatus(offerId, 'rejected');
    }
  };
  
  // Check if user can respond to offer
  const canRespondToOffer = (offer: any) => {
    if (!user) return false;
    
    // Admins can always respond
    if (user.role === 'admin') return true;
    
    // Only selling club can respond to pending offers
    if (offer.status !== 'pending') return false;
    
    // Check if user is DT of the selling club
    if (user.role === 'dt' && user.clubId) {
      const userClub = clubs.find(c => c.id === user.clubId);
      return userClub && userClub.name === offer.fromClub;
    }
    
    return false;
  };
  
  if (filteredOffers.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400">No hay ofertas para mostrar.</p>
        {user && user.role !== 'dt' && (
          <p className="mt-2 text-sm text-gray-500">
            Para realizar ofertas, necesitas ser DT de un club.
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {filteredOffers.map(offer => (
        <div key={offer.id} className="card card-hover overflow-hidden">
          <div className="p-4 cursor-pointer" onClick={() => toggleOfferDetails(offer.id)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img 
                  src={getClubLogo(offer.toClub)} 
                  alt={offer.toClub}
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <p className="font-medium text-sm">
                    Oferta por <span className="text-primary">{offer.playerName}</span>
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>{formatDate(offer.date)}</span>
                    <div className="text-xs">
                      {getStatusBadge(offer.status)}
                    </div>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toggleOfferDetails(offer.id)}
                className="bg-dark hover:bg-gray-800 p-2 rounded-full"
              >
                {expandedOffers[offer.id] ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>
          
          {expandedOffers[offer.id] && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-700">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Club vendedor</p>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getClubLogo(offer.fromClub)} 
                      alt={offer.fromClub}
                      className="w-6 h-6 object-contain"
                    />
                    <span>{offer.fromClub}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Club comprador</p>
                  <div className="flex items-center space-x-2">
                    <img 
                      src={getClubLogo(offer.toClub)} 
                      alt={offer.toClub}
                      className="w-6 h-6 object-contain"
                    />
                    <span>{offer.toClub}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Cantidad ofertada</p>
                <p className="font-bold text-lg">{formatCurrency(offer.amount)}</p>
              </div>
              
              {canRespondToOffer(offer) && (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => handleOfferAction(offer.id, 'accept')}
                    className="btn-primary text-sm flex-1"
                  >
                    Aceptar
                  </button>
                  <button 
                    onClick={() => handleOfferAction(offer.id, 'reject')}
                    className="btn-secondary text-sm flex-1"
                  >
                    Rechazar
                  </button>
                </div>
              )}
              
              {offer.status === 'accepted' && (
                <div className="mt-2 p-2 bg-green-500/10 text-green-400 text-sm rounded">
                  Esta oferta fue aceptada. El jugador ha sido transferido.
                </div>
              )}
              
              {offer.status === 'rejected' && (
                <div className="mt-2 p-2 bg-red-500/10 text-red-400 text-sm rounded">
                  Esta oferta fue rechazada.
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OffersPanel;
 