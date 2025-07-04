import { useState, useRef, useEffect } from 'react';
import { Tournament } from '../../types';

interface Props {
  onClose: () => void;
  onSave: (data: Partial<Tournament>) => void;
}

const NewTournamentModal = ({ onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    totalRounds: 1,
    status: 'upcoming' as Tournament['status'],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (formData.totalRounds <= 0) newErrors.totalRounds = 'Rondas inválidas';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({
        ...formData,
        currentRound: 0,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Nuevo Torneo</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nombre del torneo"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`input w-full ${errors.totalRounds ? 'border-red-500' : ''}`}
              placeholder="Total de jornadas"
              value={formData.totalRounds}
              onChange={e => setFormData({ ...formData, totalRounds: Number(e.target.value) })}
            />
            {errors.totalRounds && (
              <p className="text-red-500 text-sm mt-1">{errors.totalRounds}</p>
            )}
          </div>
          <select
            className="input w-full"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as Tournament['status'] })}
          >
            <option value="upcoming">Próximo</option>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
          </select>
          <div className="flex space-x-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTournamentModal;
