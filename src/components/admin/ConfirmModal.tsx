import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  tone = 'primary',
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  const confirmBtnClass = tone === 'danger'
    ? 'btn-primary bg-red-600 hover:bg-red-700 border-red-600'
    : 'btn-primary';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel}></div>

      <div className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>

        <div className="flex items-start mb-4">
          <AlertTriangle className="text-yellow-400 mr-3 flex-shrink-0" size={22} />
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            {description && (
              <p className="text-sm text-gray-300">{description}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-2">
          <button className="btn-outline" onClick={onCancel}>{cancelLabel}</button>
          <button className={confirmBtnClass} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

