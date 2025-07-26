import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';

interface Props {
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDeleteModal = ({ message, onConfirm, onClose }: Props) => {
  return (
    <Modal open={true} onClose={onClose} className="max-w-sm">
      <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex space-x-3 justify-end">
        <Button variant="outline" onClick={onClose} aria-label="Cancelar eliminación">Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} aria-label="Confirmar eliminación">Eliminar</Button>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
 