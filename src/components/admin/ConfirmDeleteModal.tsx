import { X, AlertTriangle } from 'lucide-react';

interface ConfirmDeleteModalProps {
  user: { id: string; username: string; email?: string } | null;
  onCancel: () => void;
  onConfirm: (id: string) => void;
  label?: string; // 'usuario' | 'club' | ... (texto mostrado)
}

const ConfirmDeleteModal = ({ user, onCancel, onConfirm, label = 'usuario' }: ConfirmDeleteModalProps) => {
  if (!user) return null;

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
          <button className="btn-outline" onClick={onCancel}>Cancelar</button>
          <button className="btn-primary bg-red-600 hover:bg-red-700 border-red-600" onClick={() => onConfirm(user.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

