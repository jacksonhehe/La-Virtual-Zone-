import { useState, useRef, useEffect } from 'react';
import { X, DollarSign, TrendingUp, AlertCircle, CheckCircle, Users, Shield, Zap, ArrowUpDown } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { TransferOffer } from '../../types';
import useFocusTrap from '../../hooks/useFocusTrap';
import useEscapeKey from '../../hooks/useEscapeKey';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

interface Props {
  offer: TransferOffer;
  onClose: () => void;
}

const RenegotiateModal = ({ offer, onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  useEscapeKey(onClose, true);
  const [amount, setAmount] = useState<number>(offer.amount);
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate offer difference
  const difference = amount - offer.amount;
  const percentageChange = offer.amount > 0 ? ((amount - offer.amount) / offer.amount) * 100 : 0;

  // Get offer change indicator
  const getChangeIndicator = () => {
    if (difference === 0) return { type: 'neutral', text: 'Sin cambios', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    if (difference > 0) return { type: 'increase', text: `+${formatCurrency(difference)}`, color: 'text-green-400', bg: 'bg-green-500/20' };
    return { type: 'decrease', text: `${formatCurrency(difference)}`, color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const changeIndicator = getChangeIndicator();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate amount
    if (amount <= 0) {
      setError('La cantidad debe ser mayor a 0');
      setIsSubmitting(false);
      return;
    }

    if (amount === offer.amount) {
      setError('La nueva cantidad debe ser diferente a la actual');
      setIsSubmitting(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      useDataStore.getState().updateOfferAmount(offer.id, amount);
      setSent(true);
      toast.success('¡Oferta renegociada con éxito!');
      setTimeout(onClose, 2000);
    } catch (error) {
      setError('Error al actualizar la oferta');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="renegotiate-modal-backdrop">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      <div
        className="renegotiate-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="renegotiate-title"
        ref={dialogRef}
      >
        {/* Header with gradient */}
        <div className="renegotiate-modal-header">
          <button
            aria-label="Cerrar"
            onClick={onClose}
            className="renegotiate-modal-close-btn"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <ArrowUpDown className="text-primary" size={24} />
            </div>
            <div>
              <h3 id="renegotiate-title" className="text-xl font-bold text-white">Renegociar Oferta</h3>
              <p className="text-sm text-gray-400">Ajusta los términos de la transferencia</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="renegotiate-modal-success">
              <div className="mb-4 flex justify-center">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <CheckCircle className="text-green-400" size={32} />
                </div>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">¡Oferta Actualizada!</h4>
              <p className="text-gray-400 mb-4">La nueva propuesta ha sido enviada al club comprador</p>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Espera la respuesta del club comprador</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="renegotiate-modal-error">
                  <AlertCircle size={18} className="mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              {/* Offer Info Card */}
              <div className="renegotiate-modal-offer-card">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Users className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-white mb-1">{offer.playerName}</h4>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Shield size={14} className="mr-1" />
                        {offer.fromClub}
                      </span>
                      <span className="flex items-center">
                        <DollarSign size={14} className="mr-1" />
                        {formatCurrency(offer.amount)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      Oferta de <span className="text-white">{offer.toClub}</span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Amount Input Section */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nueva Cantidad
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="renegotiate-modal-input"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      min={1}
                      placeholder="Ingresa el nuevo monto"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Actual: {formatCurrency(offer.amount)}</span>
                    <span>Mín: 1</span>
                  </div>
                </div>

                {/* Change Indicator */}
                {difference !== 0 && (
                  <div className={`renegotiate-modal-change-indicator ${changeIndicator.bg}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp size={16} className={changeIndicator.color} />
                        <span className="text-sm font-medium text-gray-300">Cambio en la Oferta</span>
                      </div>
                      <span className={`text-sm font-bold ${changeIndicator.color}`}>
                        {changeIndicator.text}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      {percentageChange > 0 ? '+' : ''}{percentageChange.toFixed(1)}% respecto a la oferta original
                    </div>
                  </div>
                )}

                {/* Current vs New Comparison */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Comparación</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Oferta actual:</span>
                      <span className="text-white">{formatCurrency(offer.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Nueva oferta:</span>
                      <span className="text-white font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="border-t border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Diferencia:</span>
                        <span className={changeIndicator.color}>
                          {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="renegotiate-modal-cancel-btn"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting || amount <= 0 || amount === offer.amount}
                  className="renegotiate-modal-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Enviar Nueva Oferta</span>
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

export default RenegotiateModal;
