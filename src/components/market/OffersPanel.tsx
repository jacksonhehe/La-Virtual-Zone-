import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, Mail, Briefcase, BarChart } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { processTransfer, makeCounterOffer, respondToCounterOffer, fetchOffersFromSupabase, fetchTransfersFromSupabase } from '../../utils/transferService';
import { getSupabaseClient } from '../../lib/supabase';
import { config } from '../../lib/config';
import { formatCurrency, formatDate } from '../../utils/format';
import { getStatusBadge } from '../../utils/helpers';
import PlayerStatsModal from '../common/PlayerStatsModal';

// Component to render individual offer
// Updated with message support for counter-offers
const OfferCard = ({
  offer,
  isAsSeller = false,
  expandedOffers,
  toggleOfferDetails,
  canRespondToOffer,
  isBuyerOfOffer,
  counterOfferAmount,
  setCounterOfferAmount,
  counterOfferMessage = {},
  setCounterOfferMessage,
  showCounterOfferInput,
  setShowCounterOfferInput,
  handleCounterOffer,
  handleRespondToCounterOffer,
  handleOfferAction,
  getClubLogo,
  onShowPlayerStats
}: {
  offer: any;
  isAsSeller?: boolean;
  expandedOffers: Record<string, boolean>;
  toggleOfferDetails: (offerId: string) => void;
  canRespondToOffer: (offer: any) => boolean;
  isBuyerOfOffer: (offer: any) => boolean;
  counterOfferAmount: Record<string, number>;
  setCounterOfferAmount: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  counterOfferMessage?: Record<string, string>;
  setCounterOfferMessage?: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  showCounterOfferInput: Record<string, boolean>;
  setShowCounterOfferInput: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  handleCounterOffer: (offerId: string) => void;
  handleRespondToCounterOffer: (offerId: string, accept: boolean) => void;
  handleOfferAction: (offerId: string, action: 'accept' | 'reject') => void;
  getClubLogo: (clubName: string) => string;
  onShowPlayerStats: (player: any) => void;
}) => (
  <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 backdrop-blur-sm">
          <div className="p-5 cursor-pointer group" onClick={() => toggleOfferDetails(offer.id)}>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={getClubLogo(isAsSeller ? offer.fromClub : offer.toClub)}
                    alt={isAsSeller ? offer.fromClub : offer.toClub}
                    className="w-10 h-10 object-contain rounded-lg bg-gray-800/50 p-1 group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gray-700 rounded-full border border-gray-600"></div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-white group-hover:text-gray-100 transition-colors">
                    {isAsSeller ? (
                      <>Oferta recibida por <span className="text-primary font-bold">{offer.playerName}</span> de {offer.toClub}</>
                    ) : (
                      <>Oferta por <span className="text-primary font-bold">{offer.playerName}</span> de {offer.fromClub}</>
                    )}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-400 mt-1">
                    <span className="font-medium">{formatDate(offer.date)}</span>
                    <div className="px-2 py-1 rounded-full bg-gray-700/50 text-gray-300 text-xs font-medium">
                      {getStatusBadge(offer.status)}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOfferDetails(offer.id);
                }}
                className="bg-gray-800/70 hover:bg-gray-700 p-2 rounded-full transition-all duration-200 hover:scale-105 border border-gray-600/50"
              >
                {expandedOffers[offer.id] ? (
                  <ChevronUp size={16} className="text-gray-400 group-hover:text-gray-300" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400 group-hover:text-gray-300" />
                )}
              </button>
            </div>
          </div>

          {expandedOffers[offer.id] && (
            <div className="px-6 pb-6 pt-4 border-t border-gray-700/70 bg-gradient-to-b from-gray-800/20 to-transparent">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Club vendedor</p>
                  <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                    <img
                      src={getClubLogo(offer.fromClub)}
                      alt={offer.fromClub}
                      className="w-8 h-8 object-contain rounded-md bg-gray-700/50 p-1"
                    />
                    <span className="font-medium text-gray-200">{offer.fromClub}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Club comprador</p>
                  <div className="flex items-center space-x-3 bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
                    <img
                      src={getClubLogo(offer.toClub)}
                      alt={offer.toClub}
                      className="w-8 h-8 object-contain rounded-md bg-gray-700/50 p-1"
                    />
                    <span className="font-medium text-gray-200">{offer.toClub}</span>
                  </div>
                </div>
              </div>

              {(() => {
                const counterAmountValue = typeof offer.counterAmount === 'number' ? offer.counterAmount : null;
                const showCounterSummary = counterAmountValue !== null && (offer.status === 'counter-offer' || offer.status === 'accepted');
                const amountLabel = showCounterSummary
                  ? (offer.status === 'accepted' ? 'Contraoferta aceptada' : 'Contraoferta')
                  : 'Cantidad ofertada';
                const badgeText = showCounterSummary
                  ? (offer.status === 'accepted' ? 'Contraoferta aceptada' : 'Renegociada')
                  : null;
                const displayedAmount = showCounterSummary ? counterAmountValue! : offer.amount;
                const showOriginalAmount = counterAmountValue !== null && counterAmountValue !== offer.amount;

                return (
                  <div className="mb-6 bg-gradient-to-r from-gray-800/40 to-gray-900/40 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-300">
                        {amountLabel}
                      </p>
                      {badgeText && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 text-xs rounded-full font-medium border border-purple-500/30">
                          {badgeText}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline space-x-3">
                      <p className="font-bold text-2xl text-white">
                        {formatCurrency(displayedAmount)}
                      </p>
                      {showOriginalAmount && (
                        <p className="text-sm text-gray-400 line-through">
                          Original: {formatCurrency(offer.amount)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()}

        {/* Show player stats button for sellers */}
        {isAsSeller && (
          <div className="mb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowPlayerStats(offer);
              }}
              className="w-full bg-gradient-to-r from-blue-500/10 to-blue-600/10 hover:from-blue-500/20 hover:to-blue-600/20 border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10"
            >
              <BarChart size={16} className="mr-2" />
              Ver estadísticas del jugador
            </button>
          </div>
        )}

        {/* Show action buttons only if user can respond */}
        {canRespondToOffer(offer) && (
          <div className="space-y-4">
            {offer.status === 'pending' && (
              <div className="space-y-3">
                {!showCounterOfferInput[offer.id] ? (
                  <button
                    onClick={() => setShowCounterOfferInput(prev => ({ ...prev, [offer.id]: true }))}
                    className="w-full bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 border border-purple-500/30 hover:border-purple-400/50 text-purple-400 hover:text-purple-300 px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10"
                  >
                    <TrendingUp size={16} className="mr-2" />
                    Hacer Contraoferta
                  </button>
                ) : (
                  <div className="space-y-3 bg-gray-800/30 rounded-lg p-4 border border-gray-700/50">
                    <div>
                      <input
                        type="number"
                        placeholder="Monto de contraoferta"
                        value={counterOfferAmount[offer.id] || ''}
                        onChange={(e) => setCounterOfferAmount(prev => ({ ...prev, [offer.id]: Number(e.target.value) }))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                        min={Math.round(offer.amount * 1.1)}
                        max={Math.round(offer.amount * 2)}
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Mensaje opcional para la contraoferta..."
                        value={(counterOfferMessage || {})[offer.id] || ''}
                        onChange={(e) => setCounterOfferMessage && setCounterOfferMessage(prev => ({ ...prev, [offer.id]: e.target.value }))}
                        className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
                        rows={3}
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-400 mt-1 text-right">
                        {((counterOfferMessage || {})[offer.id] || '').length}/200 caracteres
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleCounterOffer(offer.id)}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
                      >
                        Enviar
                      </button>
                      <button
                        onClick={() => {
                          setShowCounterOfferInput(prev => ({ ...prev, [offer.id]: false }));
                          // Limpiar el estado cuando se cancela
                          setCounterOfferAmount(prev => ({ ...prev, [offer.id]: undefined }));
                          setCounterOfferMessage(prev => ({ ...prev, [offer.id]: '' }));
                        }}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {offer.status === 'counter-offer' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleRespondToCounterOffer(offer.id, true)}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                >
                  ✓ Aceptar Contraoferta
                </button>
                <button
                  onClick={() => handleRespondToCounterOffer(offer.id, false)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                >
                  ✕ Rechazar
                </button>
              </div>
            )}

            {offer.status === 'pending' && !showCounterOfferInput[offer.id] && (
              <div className="flex space-x-3">
                <button
                  onClick={() => handleOfferAction(offer.id, 'accept')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
                >
                  ✓ Aceptar
                </button>
                <button
                  onClick={() => handleOfferAction(offer.id, 'reject')}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                >
                  ✕ Rechazar
                </button>
              </div>
            )}
          </div>
        )}


        {/* Show "Pending" status for buyers - only for pending offers, not counter-offers */}
        {isBuyerOfOffer(offer) && !canRespondToOffer(offer) && offer.status === 'pending' && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <div>
                <span className="text-yellow-400 font-semibold">Pendiente</span>
                <p className="text-yellow-300/80 text-xs mt-1">Esperando respuesta del club vendedor</p>
              </div>
            </div>
          </div>
        )}

        {/* Show counter-offer status for sellers who made the counter-offer */}
        {!isBuyerOfOffer(offer) && offer.status === 'counter-offer' && !canRespondToOffer(offer) && (
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div>
                <span className="text-purple-400 font-semibold">Contraoferta enviada</span>
                <p className="text-purple-300/80 text-xs mt-1">Esperando respuesta del club comprador</p>
              </div>
            </div>
          </div>
        )}

        <>
          {offer.status === 'accepted' && (
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 font-medium text-sm">
                  {isAsSeller
                    ? 'Esta oferta fue aceptada. El jugador ha sido transferido.'
                    : '¡Tu oferta fue aceptada! El jugador ha sido transferido a tu club.'
                  }
                </span>
              </div>
              {!isAsSeller && typeof offer.counterAmount === 'number' && (
                <div className="mt-3 bg-green-500/5 border border-green-500/30 rounded-lg px-3 py-2">
                  <p className="text-green-300 text-sm font-semibold">
                    Contraoferta aceptada: {formatCurrency(offer.counterAmount)}
                  </p>
                </div>
              )}
            </div>
          )}

          {offer.status === 'rejected' && (
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 font-medium text-sm">
                  {isAsSeller
                    ? 'Esta oferta fue rechazada.'
                    : 'Tu oferta fue rechazada por el club vendedor.'
                  }
                </span>
              </div>
            </div>
          )}

          {offer.status === 'counter-offer' && (
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <span className="text-purple-400 font-medium text-sm">
                    {isAsSeller
                      ? `Enviaste una contraoferta: ${formatCurrency(offer.counterAmount!)}`
                      : `El club vendedor hizo una contraoferta: ${formatCurrency(offer.counterAmount!)}`
                    }
                  </span>
                  {offer.counterMessage && (
                    <div className="mt-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-md">
                      <p className="text-purple-300 text-xs italic">"{offer.counterMessage}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      </div>
          )}
    </div>
);

const OffersPanel = () => {
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState<Record<string, number>>({});
  const [counterOfferMessage, setCounterOfferMessage] = useState<Record<string, string>>({}); // Messages for counter-offers - updated
  const [showCounterOfferInput, setShowCounterOfferInput] = useState<Record<string, boolean>>({});
  const [selectedPlayerForStats, setSelectedPlayerForStats] = useState<any>(null);

  const { user, hasRole } = useAuthStore();
  const { offers, clubs, marketStatus, players, updateOffers, updateTransfers } = useDataStore() as any;

  // Initial load from Supabase + Realtime subscription
  useEffect(() => {
    if (!config.useSupabase) return;
    let mounted = true;
    (async () => {
      try {
        const [supaOffers, supaTransfers] = await Promise.all([
          fetchOffersFromSupabase(),
          fetchTransfersFromSupabase(),
        ]);
        if (mounted) {
          updateOffers(supaOffers);
          updateTransfers(supaTransfers);
        }
      } catch (e) {
        console.error('OffersPanel: error loading from Supabase', e);
      }
    })();

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('market-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'offers' }, async () => {
        try { updateOffers(await fetchOffersFromSupabase()); } catch {}
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, async () => {
        try { updateTransfers(await fetchTransfersFromSupabase()); } catch {}
      })
      .subscribe();

    return () => {
      mounted = false;
      try { supabase.removeChannel(channel); } catch {}
    };
  }, []);

  // Filter offers based on user role
  const isDT = hasRole('dt');
  // Separate offers by user role - even admins must follow normal rules
  const getMyOffers = () => {
    if (!user) return [];

    // Check if user has DT role (either primary or secondary)
    const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

    if (hasDTRole && user.clubId) {
      const userClub = clubs.find(c => c.id === user.clubId);
      if (!userClub) return [];

      return offers.filter(o =>
        o.fromClub === userClub.name || o.toClub === userClub.name
      );
    }

    // Regular user sees only their own offers
    return offers.filter(o => o.userId === user.id);
  };

  const getOffersAsBuyer = () => {
    if (!user || !user.clubId) return [];

    // Check if user has DT role (either primary or secondary)
    const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

    if (!hasDTRole) return [];

    const userClub = clubs.find(c => c.id === user.clubId);
    if (!userClub) return [];

    return offers.filter(o => o.toClub === userClub.name);
  };

  const getOffersAsSeller = () => {
    if (!user || !user.clubId) return [];

    // Check if user has DT role (either primary or secondary)
    const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

    if (!hasDTRole) return [];

    const userClub = clubs.find(c => c.id === user.clubId);
    if (!userClub) return [];

    return offers.filter(o => o.fromClub === userClub.name);
  };

  const myOffersAsBuyer = getOffersAsBuyer();
  const myOffersAsSeller = getOffersAsSeller();

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

  // Handle accept/reject offer (only for selling club)
  const handleOfferAction = async (offerId: string, action: 'accept' | 'reject') => {
    setError(null);
    setSuccess(null);

    if (!marketStatus) {
      setError('El mercado está cerrado. No puedes procesar ofertas.');
      return;
    }

    // Verify user can actually respond to this offer
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !canRespondToOffer(offer)) {
      setError('No tienes permisos para responder a esta oferta.');
      return;
    }

    if (action === 'accept') {
      console.log(`🔄 Iniciando aceptación de oferta: ${offerId}`);
      const result = await processTransfer(offerId);
      if (result) {
        console.error(`❌ Error en transferencia: ${result}`);
        setError(result);
      } else {
        console.log(`✅ Transferencia completada exitosamente`);
        setSuccess('¡Transferencia completada con éxito!');
      }
    } else {
      // Reject offer
      useDataStore.getState().updateOfferStatus(offerId, 'rejected');
      setSuccess('Oferta rechazada.');
    }
  };

  // Auto-dismiss success notification
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(null), 3000);
    return () => clearTimeout(t);
  }, [success]);

  // Check if user can respond to offer
  const canRespondToOffer = (offer: any): boolean => {
    if (!user || !marketStatus) return false;

    // Different logic for different offer states
    if (offer.status === 'pending') {
      // Only selling club (fromClub) can respond to initial offers
      const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

      if (hasDTRole && user.clubId) {
        const userClub = clubs.find(c => c.id === user.clubId);
        // User can only respond if they are the SELLER (fromClub), not the buyer (toClub)
        return Boolean(userClub && userClub.name === offer.fromClub && userClub.name !== offer.toClub);
      }
    } else if (offer.status === 'counter-offer') {
      // For counter-offers, the BUYER (toClub) can respond (accept/reject the counter-offer)
      const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

      if (hasDTRole && user.clubId) {
        const userClub = clubs.find(c => c.id === user.clubId);
        // User can respond if they are the BUYER (toClub), not the seller (fromClub)
        return Boolean(userClub && userClub.name === offer.toClub && userClub.name !== offer.fromClub);
      }
    }

    return false;
  };

  // Check if user is the buyer of this offer (to see "Pending" status)
  const isBuyerOfOffer = (offer: any): boolean => {
    if (!user || !user.clubId) return false;

    // Check if user has DT role (either primary or secondary)
    const hasDTRole = isDT || (Array.isArray((user as any).roles) && (user as any).roles.includes('dt'));

    if (!hasDTRole) return false;

    const userClub = clubs.find(c => c.id === user.clubId);
    return Boolean(userClub && userClub.name === offer.toClub && userClub.name !== offer.fromClub);
  };


  // Handle counter-offer
  const handleCounterOffer = (offerId: string) => {
    const amount = counterOfferAmount[offerId];
    if (!amount || amount <= 0) {
      setError('Por favor ingresa un monto válido para la contraoferta');
      return;
    }

    setError(null);

    // Verify user can actually respond to this offer
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !canRespondToOffer(offer)) {
      setError('No tienes permisos para responder a esta oferta.');
      return;
    }

    const message = counterOfferMessage[offerId]?.trim();
    const result = makeCounterOffer(offerId, amount, message || undefined);

    if (result) {
      setError(result);
    } else {
      setSuccess('Contraoferta enviada con éxito');
      setShowCounterOfferInput(prev => ({ ...prev, [offerId]: false }));
      // Limpiar el estado de la contraoferta
      setCounterOfferAmount(prev => ({ ...prev, [offerId]: undefined }));
      setCounterOfferMessage(prev => ({ ...prev, [offerId]: '' }));
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Handle respond to counter-offer
  const handleRespondToCounterOffer = async (offerId: string, accept: boolean) => {
    setError(null);

    // Verify user can actually respond to this offer
    const offer = offers.find(o => o.id === offerId);
    if (!offer || !canRespondToOffer(offer)) {
      setError('No tienes permisos para responder a esta oferta.');
      return;
    }

    const result = await respondToCounterOffer(offerId, accept);

    if (result) {
      setError(result);
    } else {
      const message = accept ? 'Contraoferta aceptada. Transferencia completada.' : 'Contraoferta rechazada.';
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Handle showing player stats modal
  const handleShowPlayerStats = (offer: any) => {
    if (!players || players.length === 0) {
      console.error('No players data available');
      return;
    }

    // Try to find by playerId first (more reliable)
    let player = players.find(p => p.id === offer.playerId);

    // If not found by ID, try by name as fallback
    if (!player) {
      player = players.find(p => p.name === offer.playerName);

      // If still not found, try case-insensitive match
      if (!player) {
        player = players.find(p => p.name?.toLowerCase() === offer.playerName?.toLowerCase());
      }

      // If still not found, find any transfer-listed player from the selling club as fallback
      if (!player) {
        const sellingClub = clubs.find(c => c.name === offer.fromClub);
        if (sellingClub) {
          player = players.find(p => p.clubId === sellingClub.id && p.transferListed);
        }
      }
    }

    if (player) {
      setSelectedPlayerForStats(player);
    } else {
      console.error('Player not found for offer:', offer);
    }
  };

  const allOffers = getMyOffers();

  if (allOffers.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Briefcase className="text-primary mr-3" size={24} />
            <h2 className="text-2xl font-bold">Gestión de Ofertas</h2>
          </div>
          <p className="text-gray-400 text-sm">
            Revisa y gestiona las ofertas que has hecho y las que has recibido por tus jugadores.
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Mis Ofertas (empty state) */}
          <div className="bg-gradient-to-br from-green-500/5 to-green-600/10 rounded-xl border border-green-500/20 p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full mr-3 shadow-sm"></div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-green-400 mb-1">Mis Ofertas</h3>
                <p className="text-green-300/70 text-sm">Ofertas que has hecho por jugadores</p>
              </div>
              <span className="ml-auto bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                0
              </span>
            </div>
            <div className="text-center py-16 text-gray-400 bg-gradient-to-br from-green-500/5 to-green-600/5 rounded-xl border-2 border-dashed border-green-500/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-full flex items-center justify-center border border-green-500/20">
                <TrendingUp className="text-green-400" size={32} />
              </div>
                <h4 className="font-semibold text-green-300 mb-2">No has hecho ninguna oferta aún</h4>
                <p className="text-sm text-green-400/80 max-w-xs mx-auto leading-relaxed">Ve a la pestaña "Jugadores" para hacer ofertas por jugadores transferibles y construir tu equipo ideal.</p>
              </div>
          </div>

          {/* Ofertas Recibidas (empty state) */}
          <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/10 rounded-xl border border-blue-500/20 p-6 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-3 shadow-sm"></div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-blue-400 mb-1">Ofertas Recibidas</h3>
                <p className="text-blue-300/70 text-sm">Ofertas por tus jugadores</p>
              </div>
              <span className="ml-auto bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30">
                0
              </span>
            </div>
            <div className="text-center py-16 text-gray-400 bg-gradient-to-br from-blue-500/5 to-blue-600/5 rounded-xl border-2 border-dashed border-blue-500/30">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-full flex items-center justify-center border border-blue-500/20">
                <Mail className="text-blue-400" size={32} />
              </div>
                <h4 className="font-semibold text-blue-300 mb-2">No has recibido ninguna oferta</h4>
                <p className="text-sm text-blue-400/80 max-w-xs mx-auto leading-relaxed">Las ofertas por tus jugadores aparecerán aquí cuando otros directores técnicos se interesen en tu plantilla.</p>
              </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!marketStatus && (
        <div className="p-5 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">El mercado de fichajes está cerrado. No puedes aceptar ni rechazar ofertas.</span>
          </div>
        </div>
      )}
      {success && (
        <div className="p-5 bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 text-green-400 rounded-xl backdrop-blur-sm transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="p-5 bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 text-red-400 rounded-xl backdrop-blur-sm transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Section title */}
      <div className="mb-8">
        <div className="flex items-center mb-3">
          <div className="p-2 bg-primary/10 rounded-lg mr-4">
            <Briefcase className="text-primary" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Gestión de Ofertas</h2>
            <p className="text-gray-400 text-sm mt-1">
              Revisa y gestiona las ofertas que has hecho y las que has recibido por tus jugadores.
            </p>
          </div>
        </div>
      </div>

      {/* Offers sections side by side */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Mis Ofertas (as buyer) */}
        <div className="bg-gradient-to-br from-green-500/8 to-green-600/12 rounded-2xl border border-green-500/25 p-7 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center mb-7">
            <div className="w-2 h-10 bg-gradient-to-b from-green-400 to-green-600 rounded-full mr-4 shadow-lg"></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-400 mb-1">Mis Ofertas</h3>
              <p className="text-green-300/80 text-sm font-medium">Ofertas que has hecho por jugadores</p>
            </div>
            <span className="ml-auto bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-400 px-4 py-2 rounded-full text-sm font-semibold border border-green-500/30 shadow-sm">
              {myOffersAsBuyer.length}
            </span>
          </div>
          <div className="space-y-4">
            {myOffersAsBuyer.length > 0 ? (
              myOffersAsBuyer.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isAsSeller={false}
                  expandedOffers={expandedOffers}
                  toggleOfferDetails={toggleOfferDetails}
                  canRespondToOffer={canRespondToOffer}
                  isBuyerOfOffer={isBuyerOfOffer}
                  counterOfferAmount={counterOfferAmount}
                  setCounterOfferAmount={setCounterOfferAmount}
                  counterOfferMessage={counterOfferMessage}
                  setCounterOfferMessage={setCounterOfferMessage}
                  showCounterOfferInput={showCounterOfferInput}
                  setShowCounterOfferInput={setShowCounterOfferInput}
                  handleCounterOffer={handleCounterOffer}
                  handleRespondToCounterOffer={handleRespondToCounterOffer}
                  handleOfferAction={handleOfferAction}
                  getClubLogo={getClubLogo}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-800/20 rounded-lg border-2 border-dashed border-gray-700">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="text-green-400" size={28} />
              </div>
                <p className="font-medium">No has hecho ninguna oferta aún</p>
                <p className="text-sm mt-1">Ve a la pestaña "Jugadores" para hacer ofertas por jugadores transferibles</p>
              </div>
            )}
          </div>
        </div>

        {/* Ofertas Recibidas (as seller) */}
        <div className="bg-gradient-to-br from-blue-500/8 to-blue-600/12 rounded-2xl border border-blue-500/25 p-7 shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm">
          <div className="flex items-center mb-7">
            <div className="w-2 h-10 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full mr-4 shadow-lg"></div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-400 mb-1">Ofertas Recibidas</h3>
              <p className="text-blue-300/80 text-sm font-medium">Ofertas por tus jugadores</p>
            </div>
            <span className="ml-auto bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 px-4 py-2 rounded-full text-sm font-semibold border border-blue-500/30 shadow-sm">
              {myOffersAsSeller.length}
            </span>
          </div>
          <div className="space-y-4">
            {myOffersAsSeller.length > 0 ? (
              myOffersAsSeller.map(offer => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  isAsSeller={true}
                  expandedOffers={expandedOffers}
                  toggleOfferDetails={toggleOfferDetails}
                  canRespondToOffer={canRespondToOffer}
                  isBuyerOfOffer={isBuyerOfOffer}
                  counterOfferAmount={counterOfferAmount}
                  setCounterOfferAmount={setCounterOfferAmount}
                  counterOfferMessage={counterOfferMessage}
                  setCounterOfferMessage={setCounterOfferMessage}
                  showCounterOfferInput={showCounterOfferInput}
                  setShowCounterOfferInput={setShowCounterOfferInput}
                  handleCounterOffer={handleCounterOffer}
                  handleRespondToCounterOffer={handleRespondToCounterOffer}
                  handleOfferAction={handleOfferAction}
                  getClubLogo={getClubLogo}
                  onShowPlayerStats={handleShowPlayerStats}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 bg-gray-800/20 rounded-lg border-2 border-dashed border-gray-700">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <Mail className="text-blue-400" size={28} />
                </div>
                <p className="font-medium">No has recibido ninguna oferta</p>
                <p className="text-sm mt-1">Las ofertas por tus jugadores aparecerán aquí</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Stats Modal */}
      {selectedPlayerForStats && (
        <PlayerStatsModal
          player={selectedPlayerForStats}
          isOpen={!!selectedPlayerForStats}
          onClose={() => setSelectedPlayerForStats(null)}
        />
      )}

    </div>
  );
};

export default OffersPanel;
