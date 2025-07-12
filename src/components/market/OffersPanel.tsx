import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { processTransfer } from '../../utils/transferService';
import { TransferOffer } from '../../types';
import { formatCurrency, formatDate, getStatusBadge } from '../../utils/helpers';
import Card from '../common/Card';
import RenegotiateModal from './RenegotiateModal';
import ConfirmModal from '../common/ConfirmModal';
import toast from 'react-hot-toast';

interface OffersPanelProps {
  initialView?: 'sent' | 'received';
  sentOffers?: TransferOffer[];
  receivedOffers?: TransferOffer[];
}

const OffersPanel = ({
  initialView = 'sent',
  sentOffers: sentOffersProp,
  receivedOffers: receivedOffersProp
}: OffersPanelProps) => {
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'sent' | 'received'>(initialView);
  const [renegotiateOffer, setRenegotiateOffer] = useState<TransferOffer | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ offer: TransferOffer; action: 'accept' | 'reject' } | null>(null);
  const [page, setPage] = useState(1);
  const prevStatusesRef = useRef<Record<string, string>>({});

  const MIN_SQUAD_SIZE = 18;
  
  const { user } = useAuthStore();
  const { offers, clubs, players } = useDataStore();
  
  // Offers sent by the current user/club
  const storeSentOffers = user ?
    user.role === 'admin' ?
      offers :
    user.role === 'dt' && user.club ?
      offers.filter(o => {
        const userClub = clubs.find(c => c.name === user.club);
        return userClub && o.fromClub === userClub.name;
      }) :
      offers.filter(o => o.userId === user.id) :
    [];

  // Offers received by the current club (only for DT or admin)
  const storeReceivedOffers = user
    ? user.role === 'admin'
      ? offers
      : user.role === 'dt' && user.club
        ? offers.filter(o => {
            const userClub = clubs.find(c => c.name === user.club);
            // Offers where my club is selling
            return userClub && o.fromClub === userClub.name;
          })
        : []
    : [];

  const sentOffers = sentOffersProp ?? storeSentOffers;
  const receivedOffers = receivedOffersProp ?? storeReceivedOffers;
  console.log('Received Offers:', receivedOffers);

  const filteredOffers = view === 'sent' ? sentOffers : receivedOffers;
  const OFFERS_PER_PAGE = 10;
  const displayedOffers = filteredOffers.slice(0, page * OFFERS_PER_PAGE);
  const hasMore = displayedOffers.length < filteredOffers.length;
  
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

    const { offers: allOffers, clubs: allClubs, players: allPlayers } =
      useDataStore.getState();
    const offer = allOffers.find(o => o.id === offerId);
    if (!offer) return;

    if (offer.status !== 'pending') {
      setError('Esta oferta ya ha sido procesada');
      return;
    }

    if (action === 'accept') {
      const seller = allClubs.find(c => c.name === offer.fromClub);
      if (seller) {
        const sellerPlayers = allPlayers.filter(p => p.clubId === seller.id);
        if (sellerPlayers.length - 1 < MIN_SQUAD_SIZE) {
          setError(
            `No puedes aceptar la oferta. La plantilla mínima es de ${MIN_SQUAD_SIZE} jugadores.`
          );
          return;
        }
      }

      const result = processTransfer(offerId);
      if (result) {
        setError(result);
      } else {
        toast.success(`Has aceptado la oferta por ${offer.playerName}`);
      }
    } else {
      useDataStore.getState().updateOfferStatus(offerId, 'rejected');
      toast.error(`Has rechazado la oferta por ${offer.playerName}`);
    }
  };

  const handleAccept = (offer: TransferOffer) => {
    setConfirmAction({ offer, action: 'accept' });
  };

  const handleReject = (offer: TransferOffer) => {
    setConfirmAction({ offer, action: 'reject' });
  };

  // Handle renegotiate offer
  const handleRenegotiate = (offer: TransferOffer) => {
    setRenegotiateOffer(offer);
  };

  // Reset pagination when view changes
  useEffect(() => {
    setPage(1);
  }, [view]);

  // Notify when offer status changes
  useEffect(() => {
    const current: Record<string, string> = {};
    const relevantOffers = [...sentOffers, ...receivedOffers];
    relevantOffers.forEach(o => {
      current[o.id] = o.status;
      const prev = prevStatusesRef.current[o.id];
      if (prev && prev !== o.status) {
        if (o.status === 'accepted') {
          toast.success(`Oferta por ${o.playerName} aceptada`);
        } else if (o.status === 'rejected') {
          toast.error(`Oferta por ${o.playerName} rechazada`);
        }
      }
    });
    prevStatusesRef.current = current;
  }, [sentOffers, receivedOffers]);
  
  // Check if user can respond to offer
  const canRespondToOffer = (offer: TransferOffer) => {
    if (!user) return false;
    
    // Admins can always respond
    if (user.role === 'admin') return true;
    
    // Only selling club can respond to pending offers
    if (offer.status !== 'pending') return false;
    
    // Check if user is DT of the selling club
    if (user.role === 'dt' && user.club) {
      const userClub = clubs.find(c => c.name === user.club);
      return userClub && userClub.name === offer.fromClub;
    }
    
    return false;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex border-b border-white/10 mb-4">
        <button
          onClick={() => setView('sent')}
          className={`px-4 py-2 font-medium mr-2 ${view === 'sent' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
        >
          Ofertas Enviadas
        </button>
        <button
          onClick={() => setView('received')}
          className={`px-4 py-2 font-medium ${view === 'received' ? 'text-primary border-b-2 border-primary' : 'text-gray-400 hover:text-white'}`}
        >
          Ofertas Recibidas
        </button>
      </div>
      {error && (
        <div className="p-4 bg-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {view === 'received' && receivedOffers.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-400">No hay ofertas recibidas.</p>
        </div>
      )}

      {view === 'sent' && sentOffers.length === 0 && (
        <div className="p-6 text-center">
          <p className="text-gray-400">No hay ofertas enviadas.</p>
          {user && user.role !== 'dt' && (
            <p className="mt-2 text-sm text-gray-500">
              Para realizar ofertas, necesitas ser DT de un club.
            </p>
          )}
        </div>
      )}

      {displayedOffers.map(offer => (
        <Card key={offer.id} className="overflow-hidden">
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
            {view === 'received' && (
              offer.status === 'pending' ? (
                <div className="mt-3 flex gap-2">
                  <button
                    className="text-xs rounded-lg bg-green-600 hover:bg-green-700 text-white px-2 py-1"
                    onClick={() => handleAccept(offer)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="text-xs rounded-lg bg-orange-500 hover:bg-orange-600 text-white px-2 py-1"
                    onClick={() => handleRenegotiate(offer)}
                  >
                    Renegociar
                  </button>
                  <button
                    className="text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white px-2 py-1"
                    onClick={() => handleReject(offer)}
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <div className="mt-3 text-xs">
                  {getStatusBadge(offer.status)}
                </div>
              )
            )}
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

              <div className="text-xs text-gray-400 mb-4 space-y-1">
                <p>Recibida: {formatDate(offer.date)}</p>
                {offer.responseDate && (
                  <p>Respondida: {formatDate(offer.responseDate)}</p>
                )}
              </div>
              
              {canRespondToOffer(offer) && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleRenegotiate(offer)}
                    className="text-sm flex-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white py-2"
                  >
                    Renegociar
                  </button>
                  <button
                    onClick={() => setConfirmAction({ offer, action: 'accept' })}
                    className="text-sm flex-1 rounded-lg bg-green-600 hover:bg-green-700 text-white py-2"
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={() => setConfirmAction({ offer, action: 'reject' })}
                    className="text-sm flex-1 rounded-lg bg-red-600 hover:bg-red-700 text-white py-2"
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
        </Card>
      ))}
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="btn-secondary mt-2"
          >
            Cargar más
          </button>
        </div>
      )}
      {renegotiateOffer && (
        <RenegotiateModal
          offer={renegotiateOffer}
          onClose={() => setRenegotiateOffer(null)}
        />
      )}
      {confirmAction && (
        <ConfirmModal
          message={`¿Seguro que deseas ${confirmAction.action === 'accept' ? 'aceptar' : 'rechazar'} la oferta por ${confirmAction.offer.playerName}?`}
          onConfirm={() => {
            handleOfferAction(confirmAction.offer.id, confirmAction.action);
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};

export default OffersPanel;
 