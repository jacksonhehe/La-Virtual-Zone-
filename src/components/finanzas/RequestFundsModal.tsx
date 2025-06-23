import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const RequestFundsModal = ({ onClose }: Props) => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        {sent ? (
          <div className="text-center">
            <p className="font-semibold mb-2">Solicitud enviada</p>
            <p className="text-sm text-gray-400">Tu directiva revisará la petición.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-xl font-bold">Solicitar Fondos</h3>
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
