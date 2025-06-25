import { X } from 'lucide-react';

interface Props {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal = ({ message, onConfirm, onClose }: Props) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose}></div>
      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6 text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X size={24} />
        </button>
        <p className="mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={() => { onConfirm(); onClose(); }}>Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
