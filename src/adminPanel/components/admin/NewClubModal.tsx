import  { useState, useRef, useEffect } from 'react';
import { Club } from '../../types';
import { useGlobalStore } from '../../store/globalStore';
import { slugify } from '../../utils/helpers';
import { Building } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (clubData: Partial<Club>) => void;
}

const NewClubModal = ({ onClose, onSave }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    foundedYear: new Date().getFullYear(),
    stadium: '',
    managerId: '',
    budget: 1000000,
    playStyle: '',
    primaryColor: '#ffffff',
    secondaryColor: '#000000',
    description: ''
  });
  // Previsualización dinámica del logo
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const users = useGlobalStore(state => state.users);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFormData(prev => ({ ...prev, slug: slugify(prev.name) }));
  }, [formData.name]);

  // Actualizar previsualización del logo
  useEffect(() => {
    if (formData.logo.trim()) {
      setLogoPreview(formData.logo.trim());
    } else if (formData.name.trim()) {
      setLogoPreview(`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=111827&color=fff&size=128&bold=true`);
    } else {
      setLogoPreview('');
    }
  }, [formData.logo, formData.name]);

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
      onSave({ ...formData, logo, slug: slugify(formData.name) });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="bg-gray-800 p-5 rounded-2xl w-full max-w-sm sm:max-w-md mx-4 max-h-[85vh] overflow-y-auto"
        tabIndex={-1}
      >
        <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mb-3">
              <Building size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold gradient-text-primary">Nuevo Club</h3>
            <p className="text-sm text-gray-400 mt-1">Completa la información para registrar un club</p>
          </div>

         <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          {/* Previsualización del logo */}
          {logoPreview && (
            <div className="sm:col-span-2 w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gray-700 flex items-center justify-center">
              <img src={logoPreview} alt="Preview logo" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-300 mb-1 inline-block">Nombre del club</label>
            <input
              className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Ej: Rayo Digital FC"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Slug de solo lectura */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-300 mb-1 inline-block">Slug (URL)</label>
            <input
              className="input w-full opacity-60 cursor-not-allowed"
              value={formData.slug}
              readOnly
            />
          </div>

          {/* Logo URL */}
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-300 mb-1 inline-block">Logo (URL opcional)</label>
            <input
              className="input w-full"
              placeholder="https://...png"
              value={formData.logo}
              onChange={e => setFormData({ ...formData, logo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 inline-block">Estadio</label>
            <input
              className="input w-full"
              placeholder="Nombre del estadio"
              value={formData.stadium}
              onChange={(e) => setFormData({...formData, stadium: e.target.value})}
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
            <label className="text-sm text-gray-300 mb-1 inline-block">Presupuesto (USD)</label>
            <input
              type="number"
              min="10000"
              step="10000"
              className={`input w-full ${errors.budget ? 'border-red-500' : ''}`}
              placeholder="1 000 000"
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
          <div className="sm:col-span-2">
            <textarea
              className="input w-full"
              placeholder="Descripción"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-gray-300 mb-1 inline-block">Colores del club</label>
            <div className="flex space-x-4 items-center">
              <div className="flex flex-col items-center space-y-1">
                <input
                  type="color"
                  className="input w-10 h-10 p-0"
                  value={formData.primaryColor}
                  onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                />
                <span className="text-xs text-gray-400">Primario</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <input
                  type="color"
                  className="input w-10 h-10 p-0"
                  value={formData.secondaryColor}
                  onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                />
                <span className="text-xs text-gray-400">Secundario</span>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 flex space-x-3 justify-end mt-6">
            <button type="button" onClick={onClose} className="btn-outline">Cancelar</button>
            <button type="submit" className="btn-primary">Crear</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClubModal;
 