import { useRef } from 'react';
import { X } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel}></div>
      <div
        className="relative bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6"
        role="dialog"
        aria-modal="true"
        ref={dialogRef}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="btn-secondary">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="btn-primary">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
