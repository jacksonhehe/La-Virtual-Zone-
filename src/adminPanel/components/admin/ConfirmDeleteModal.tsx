interface  Props {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal = ({ message, onConfirm, onClose }: Props) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex space-x-3 justify-end">
          <button onClick={onClose} className="btn-outline">
            Cancelar
          </button>
          <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
 