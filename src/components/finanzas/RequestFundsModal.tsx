import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';

interface Props {
  onClose: () => void;
}

const RequestFundsModal = ({ onClose }: Props) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const [closing, setClosing] = useState(false);
  const handleClose = () => setClosing(true);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    dialogRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(handleClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
        variants={{ open: { opacity: 1 }, closed: { opacity: 0 } }}
        initial="closed"
        animate={closing ? 'closed' : 'open'}
      />
      <motion.div
        className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-funds-title"
        ref={dialogRef}
        variants={{ open: { opacity: 1, scale: 1 }, closed: { opacity: 0, scale: 0.95 } }}
        initial="closed"
        animate={closing ? 'closed' : 'open'}
        onAnimationComplete={() => closing && onClose()}
      >
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        {sent ? (
          <div className="text-center">
            <p className="font-semibold mb-2">Solicitud enviada</p>
            <p className="text-sm text-gray-400">Tu directiva revisará la petición.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 id="request-funds-title" className="text-xl font-bold">Solicitar Fondos</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cantidad</label>
              <input type="number" className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Motivo</label>
              <textarea className="input w-full" rows={3} required></textarea>
            </div>
            <button type="submit" className="btn-primary w-full">Enviar Solicitud</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestFundsModal;
