import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { toast } from 'react-hot-toast';
import  { useState, useRef, useEffect } from 'react';
import { Club } from '../../../types/shared';
import { useGlobalStore } from '../../store/globalStore';
import { slugify } from '../../utils/helpers';
import LogoUploadField from './LogoUploadField';
import { Building } from 'lucide-react';

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
      toast.success('¡Club actualizado exitosamente!');
    }
  };

  return (
    <Modal open={true} onClose={onClose} className="w-full max-w-2xl" initialFocusRef={modalRef}>
      <div ref={modalRef} className="max-h-[85vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg mb-4">
            <Building size={32} className="text-white" />
          </div>
          <h3 className="text-2xl font-bold gradient-text-primary">Actualizar Club</h3>
          <p className="text-sm text-gray-400 mt-2">Modifica la información del club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              🏟️ Información Básica
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre del Club *
                </label>
                <input
                  className={`input w-full ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: Rayo Digital FC"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre del Estadio *
                </label>
                <input
                  className={`input w-full ${errors.stadium ? 'border-red-500' : ''}`}
                  placeholder="Ejemplo: Estadio Cyber Arena"
                  value={formData.stadium}
                  onChange={e => setFormData({ ...formData, stadium: e.target.value })}
                />
                {errors.stadium && <p className="text-red-500 text-sm">{errors.stadium}</p>}
              </div>
            </div>

            {/* Slug de solo lectura */}
            <div className="mt-4 space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                URL del Club (automático)
              </label>
              <input
                className="input w-full opacity-60 cursor-not-allowed"
                value={formData.slug}
                readOnly
              />
              <p className="text-gray-400 text-xs">Se actualiza automáticamente basado en el nombre del club</p>
            </div>
          </div>

          {/* Información Deportiva */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              ⚽ Información Deportiva
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Seleccionar Director Técnico *
                </label>
                <select
                  className={`input w-full ${errors.managerId ? 'border-red-500' : ''}`}
                  value={formData.managerId}
                  onChange={e => setFormData({ ...formData, managerId: e.target.value })}
                >
                  <option value="">Seleccionar DT disponible</option>
                  {users.filter(u => u.role === 'dt' && (!u.clubId || u.clubId === club.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
                {errors.managerId && (
                  <p className="text-red-500 text-sm">{errors.managerId}</p>
                )}
                <p className="text-gray-400 text-xs">Incluye DTs sin club y el DT actual del club</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Año de Fundación
                </label>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear()}
                  className="input w-full"
                  placeholder="Ejemplo: 2023"
                  value={formData.foundedYear}
                  onChange={e => setFormData({ ...formData, foundedYear: Number(e.target.value) })}
                />
                <p className="text-gray-400 text-xs">Año en que se fundó el club</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Presupuesto (USD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10000"
                    step="10000"
                    className={`input w-full pl-8 ${errors.budget ? 'border-red-500' : ''}`}
                    placeholder="Ejemplo: 400000"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                </div>
                {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
                <p className="text-gray-400 text-xs">Presupuesto actual del club en dólares</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Estilo de Juego
                </label>
                <input
                  className="input w-full"
                  placeholder="Ejemplo: Ofensivo, Defensivo, Equilibrado"
                  value={formData.playStyle}
                  onChange={e => setFormData({ ...formData, playStyle: e.target.value })}
                />
                <p className="text-gray-400 text-xs">Describe el estilo de juego característico del club</p>
              </div>
            </div>
          </div>

          {/* Logo del Club */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              🖼️ Logo del Club
            </h4>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Logo del Club
              </label>
              <LogoUploadField
                value={formData.logo}
                onChange={(value) => setFormData({ ...formData, logo: value })}
                label="Logo del Club"
                placeholder="URL del logo o subir archivo"
                showPreview={true}
                maxSize={3}
              />
              <p className="text-gray-400 text-xs">Puedes poner una URL de imagen o subir una imagen (máx. 3MB)</p>
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              📝 Descripción del Club
            </h4>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Descripción
              </label>
              <textarea
                className="input w-full min-h-[100px] resize-y"
                placeholder="Describe brevemente tu club, su historia, valores, objetivos..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <p className="text-gray-400 text-xs">Cuenta la historia y características únicas de tu club</p>
            </div>
          </div>

          {/* Colores del Club */}
          <div className="bg-gradient-to-br from-dark to-dark-light rounded-xl p-6 border border-gray-700/50">
            <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              🎨 Colores del Club
            </h4>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Colores del Club
              </label>
              <div className="flex space-x-8 items-center justify-center">
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="color"
                    className="input w-16 h-16 p-0 rounded-lg cursor-pointer"
                    value={formData.primaryColor}
                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                  />
                  <span className="text-sm text-gray-300 font-medium">Color Primario</span>
                  <p className="text-gray-400 text-xs">Color principal del club</p>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <input
                    type="color"
                    className="input w-16 h-16 p-0 rounded-lg cursor-pointer"
                    value={formData.secondaryColor}
                    onChange={e => setFormData({ ...formData, secondaryColor: e.target.value })}
                  />
                  <span className="text-sm text-gray-300 font-medium">Color Secundario</span>
                  <p className="text-gray-400 text-xs">Color complementario del club</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs text-center mt-4">Elige los colores principales que representarán a tu club</p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex space-x-4 justify-end pt-6 border-t border-gray-700/50">
            <Button variant="outline" type="button" onClick={onClose} className="px-6 py-3">
              Cancelar
            </Button>
            <Button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold">
              ✨ Actualizar Club
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default EditClubModal;
 