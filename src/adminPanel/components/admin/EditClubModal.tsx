import  { useState, useRef, useEffect } from 'react';
import { Club } from '../../types/shared';
import { useGlobalStore } from '../../store/globalStore';
import { slugify } from '../../utils/helpers';

interface Props {
  club: Club;
  onClose: () => void;
  onSave: (clubData: Club) => void;
}

const EditClubModal = ({ club, onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    name: club.name,
    slug: club.slug,
    logo: club.logo,
    foundedYear: club.foundedYear,
    stadium: club.stadium,
    managerId: club.managerId || '',
    budget: club.budget,
    playStyle: club.playStyle,
    primaryColor: club.primaryColor,
    secondaryColor: club.secondaryColor,
    description: club.description
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const users = useGlobalStore(state => state.users);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, slug: slugify(prev.name) }));
  }, [formData.name]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nombre requerido';
    if (!formData.stadium.trim()) newErrors.stadium = 'Estadio requerido';
    if (!formData.managerId) newErrors.managerId = 'Entrenador requerido';
    if (formData.budget <= 0) newErrors.budget = 'Presupuesto debe ser mayor a 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const logo = formData.logo ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=111827&color=fff&size=128&bold=true`;
      onSave({ ...club, ...formData, logo, slug: slugify(formData.name) });
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
              className="input w-full"
              placeholder="Estadio"
              value={formData.stadium}
              onChange={e => setFormData({ ...formData, stadium: e.target.value })}
            />
            {errors.stadium && <p className="text-red-500 text-sm mt-1">{errors.stadium}</p>}
          </div>
          <div>
            <select
              className={`input w-full ${errors.managerId ? 'border-red-500' : ''}`}
              value={formData.managerId}
              onChange={e => setFormData({ ...formData, managerId: e.target.value })}
            >
              <option value="">Seleccionar DT</option>
              {users.filter(u => u.role === 'dt' && !u.clubId).map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
            {errors.managerId && (
              <p className="text-red-500 text-sm mt-1">{errors.managerId}</p>
            )}
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
          <div>
            <input
              type="number"
              className="input w-full"
              placeholder="Año de fundación"
              value={formData.foundedYear}
              onChange={e => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
            />
          </div>
          <div>
            <input
              className="input w-full"
              placeholder="Estilo de juego"
              value={formData.playStyle}
              onChange={e => setFormData({ ...formData, playStyle: e.target.value })}
            />
          </div>
          <div>
            <textarea
              className="input w-full"
              placeholder="Descripción"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="flex space-x-2">
            <input
              type="color"
              className="input"
              value={formData.primaryColor}
              onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
            />
            <input
              type="color"
              className="input"
              value={formData.secondaryColor}
              onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
            />
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
 