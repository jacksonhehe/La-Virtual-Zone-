import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { TransferOffer } from '../../types';
import useFocusTrap from '../../hooks/useFocusTrap';
import { formatCurrency } from '../../utils/helpers';

interface Props {
  offer: TransferOffer;
  onClose: () => void;
}

const RenegotiateModal = ({ offer, onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const [amount, setAmount] = useState<number>(offer.amount);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    useDataStore.getState().updateOfferAmount(offer.id, amount);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div
        className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="renegotiate-title"
        ref={dialogRef}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        {sent ? (
          <div className="text-center">
            <p className="font-semibold mb-2">Oferta actualizada</p>
            <p className="text-sm text-gray-400">El club comprador revisará la nueva propuesta.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 id="renegotiate-title" className="text-xl font-bold">Renegociar Oferta</h3>
            <p className="text-sm text-gray-400">
              Oferta de {offer.toClub} por <span className="text-primary">{offer.playerName}</span>
            </p>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nueva cantidad</label>
              <input
                type="number"
                className="input w-full"
                value={amount}
                min={1}
                onChange={(e) => setAmount(Number(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Actual: {formatCurrency(offer.amount)}</p>
            </div>
            <button type="submit" className="btn-primary w-full">Enviar</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RenegotiateModal;
