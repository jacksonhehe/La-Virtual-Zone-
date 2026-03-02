import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  user: { id: string; username: string; email?: string } | null;
  onCancel: () => void;
  onConfirm: (id: string) => void | Promise<void>;
  label?: string; // 'usuario' | 'club' | ... (texto mostrado)
  confirmLabel?: string;
  loadingLabel?: string;
}

const ConfirmDeleteModal = ({
  user,
  onCancel,
  onConfirm,
  label = 'usuario',
  confirmLabel = 'Eliminar',
  loadingLabel = 'Eliminando...'
}: ConfirmDeleteModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!user) return null;

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await Promise.resolve(onConfirm(user.id));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={isDeleting ? undefined : onCancel}></div>

      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Cerrar"
          disabled={isDeleting}
        >
          <X size={20} />
        </button>

        <div className="flex items-start mb-4">
          <AlertTriangle className="text-red-500 mr-3 flex-shrink-0" size={22} />
          <div>
            <h3 className="text-xl font-bold mb-1">{`Eliminar ${label}`}</h3>
            <p className="text-sm text-gray-300">
              { `Seguro que quieres eliminar ${label} `} 
              <span className="font-semibold">{user.username}</span>
              {user.email ? ` (${user.email})` : ''}?
              {' Esta accion no se puede deshacer.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button className="btn-outline disabled:opacity-60 disabled:cursor-not-allowed" onClick={onCancel} disabled={isDeleting}>
            Cancelar
          </button>
          <button
            className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;


