import  { useState, useRef, useEffect } from 'react';
import { Club } from '../../types';

interface Props {
  club: Club;
  onClose: () => void;
  onSave: (clubData: Club) => void;
}

const EditClubModal = ({ club, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    name: club.name,
    manager: club.manager,
    budget: club.budget
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
    if (!formData.manager.trim()) newErrors.manager = 'Entrenador requerido';
    if (formData.budget <= 0) newErrors.budget = 'Presupuesto debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave({ ...club, ...formData });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4"
        tabIndex={-1}
      >
        <h3 className="text-lg font-semibold mb-4">Editar Club</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Nombre del club"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <input
              className={`input w-full ${errors.manager ? 'border-red-500' : ''}`}
              placeholder="Entrenador"
              value={formData.manager}
              onChange={(e) => setFormData({...formData, manager: e.target.value})}
            />
            {errors.manager && <p className="text-red-500 text-sm mt-1">{errors.manager}</p>}
          </div>
          <div>
            <input
              type="number"
              className={`input w-full ${errors.budget ? 'border-red-500' : ''}`}
              placeholder="Presupuesto"
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
            />
            {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
          </div>
          <div className="flex space-x-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClubModal;
 